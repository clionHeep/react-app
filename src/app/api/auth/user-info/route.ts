import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/db';
import { menu, permission } from '@prisma/client';
import type { RolePermission } from '@/types/db';
import { JsonResponse, createErrorResponse, createServerErrorResponse, ApiStatus } from '@/utils/api-response';

// JWT负载类型
interface JwtPayload {
  sub: number | string;
  username?: string;
}

export async function GET(request: NextRequest) {
  try {
    // 获取token
    let token: string | undefined;
    
    const authHeader = request.headers.get('authorization');
    console.log('接收到的Authorization头部:', authHeader);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
      console.log('从头部提取的令牌:', token.substring(0, 20) + '...');
    } else {
      const tokenFromCookie = request.cookies.get('token')?.value;
      if (tokenFromCookie) {
        token = tokenFromCookie;
        console.log('从Cookie提取的令牌:', token.substring(0, 20) + '...');
      }
    }

    if (!token) {
      console.log('没有找到令牌');
      return createErrorResponse('未认证', ApiStatus.UNAUTHORIZED);
    }

    // 验证token
    let userInfo: JwtPayload;
    try {
      const secret = process.env.JWT_SECRET || 'fallback-secret';
      console.log('使用密钥验证令牌, 密钥(部分):', secret.substring(0, 3) + '...');
      
      userInfo = jwt.verify(token, secret) as JwtPayload;
      console.log('令牌验证成功, 用户ID:', userInfo.sub);
    } catch (err) {
      console.error('令牌验证失败:', err);
      return createErrorResponse('无效的令牌', ApiStatus.UNAUTHORIZED);
    }

    // 获取用户ID
    const userId = Number(userInfo.sub);
    
    // 查询用户及其角色
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userrole: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return createErrorResponse('用户不存在', ApiStatus.NOT_FOUND);
    }

    // 检查用户状态
    if (user.status !== 'ACTIVE') {
      return createErrorResponse('账户已被禁用', ApiStatus.FORBIDDEN);
    }

    // 获取用户角色ID列表
    const roleIds = user.userrole.map((ur) => ur.roleId);

    // 先获取所有菜单
    const allMenus = await db.menu.findMany({
      include: {
        children: true,
        rolemenu: {
          where: {
            roleId: {
              in: roleIds
            }
          }
        }
      }
    });

    // 过滤出用户有权限的菜单
    const userMenuList = allMenus.filter(menu => menu.rolemenu.length > 0);

    // 将扁平菜单列表转换为树形结构
    interface MenuNode {
      id: number;
      name: string;
      path: string;
      icon?: string;
      sort?: number;
      parentId?: number;
      hidden?: boolean;
      children?: MenuNode[];
    }

    function buildMenuTree(menus: menu[], parentId: number | null = null): MenuNode[] {
      return menus
        .filter(menu => {
          // 根级菜单没有parentId或parentId为null
          if (parentId === null) {
            return !menu.parentId;
          }
          // 子菜单的parentId等于当前父级id
          return menu.parentId === parentId;
        })
        .map(menu => {
          // 查找当前菜单的子菜单
          const children = buildMenuTree(menus, menu.id);
          
          // 返回简化的菜单对象，只包含前端需要的字段
          return {
            id: menu.id,
            name: menu.name,
            path: menu.path,
            icon: menu.icon || undefined,
            sort: menu.sort || 0,
            parentId: menu.parentId || undefined,
            hidden: menu.hidden || false,
            ...(children.length > 0 ? { children } : {})
          };
        })
        // 根据sort字段排序
        .sort((a, b) => (a.sort || 0) - (b.sort || 0));
    }

    // 生成树形菜单结构
    const menuTree = buildMenuTree(userMenuList);

    // 查询用户权限
    const userPermissions = await db.rolepermission.findMany({
      where: {
        roleId: {
          in: roleIds
        }
      },
      include: {
        permission: true
      }
    }) as unknown as RolePermission[];

    // 处理权限数据并去重
    const permissionMap = new Map<number, permission>();
    userPermissions.forEach((rp: RolePermission) => {
      if (rp.permission && !permissionMap.has(rp.permission.id)) {
        permissionMap.set(rp.permission.id, rp.permission);
      }
    });
    const permissions = Array.from(permissionMap.values());
    
    // 只返回权限的code字段
    const permissionCodes = permissions.map(p => p.code);

    // 准备用户角色数据
    const roles = user.userrole.map((ur) => ur.role);

    // 返回用户信息，包括角色、菜单和权限
    return JsonResponse({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        avatar: user.avatar,
        roles: user.roles
      },
      roles,
      menus: menuTree,
      permissions: permissionCodes
    }, '获取用户信息成功');
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return createServerErrorResponse(error as Error, '获取用户信息失败');
  }
} 