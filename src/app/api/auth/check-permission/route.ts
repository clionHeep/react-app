import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/db';
import { permission, role, user } from '@prisma/client';

// JWT负载类型
interface JwtPayload {
  sub: number | string;
  username?: string;
}

// 定义用户类型（包含角色和权限）
type UserWithRolesAndPermissions = user & {
  userrole: Array<{
    role: role & {
      permissions: permission[]
    }
  }>
};

// 自定义菜单类型(用于类型断言)
type CustomMenuType = {
  id: number;
  name: string;
  path: string | null;
  permissions?: permission[];
  menuPermRelations?: Array<{
    id: number;
    actionType: string;
    permission: permission;
  }>;
};

// 路径到权限映射配置
const getPermissionForPath = async (path: string): Promise<string | null> => {
  // 基础路径映射表 - 使用三段式权限格式
  const basePathMap: Record<string, string> = {
    '/dashboard': 'dashboard:index:view',
    '/dashboard/analytics': 'dashboard:analytics:view',
    '/dashboard/workspace': 'dashboard:workspace:view',
    '/system': 'system:index:view',
    '/users': 'system:users:view',
    '/settings': 'settings:index:view',
    '/e-commerce': 'e-commerce:index:view',
    '/dev-tools': 'dev-tools:index:view',
    '/content': 'content:index:view',
    '/apps': 'apps:index:view',
    '/about': 'about:index:view',
  };
  
  // 先检查精确路径
  if (basePathMap[path]) {
    return basePathMap[path];
  }
  
  // 尝试从数据库获取动态路径映射
  try {
    // 查询菜单表，获取与路径关联的权限
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const menuData = await (db.menu as any).findFirst({
      where: { path },
      include: {
        permissions: true,
        menuPermRelations: {
          include: {
            permission: true
          }
        }
      }
    });

    // 使用类型断言处理实际结构
    const menu = menuData as unknown as CustomMenuType;
    
    // 先尝试使用menuPermRelations关系
    if (menu?.menuPermRelations && menu.menuPermRelations.length > 0) {
      // 查找查看权限
      const viewPerm = menu.menuPermRelations.find(rel => rel.actionType === 'view');
      if (viewPerm?.permission) {
        return viewPerm.permission.code;
      }
      
      // 查找管理权限
      const managePerm = menu.menuPermRelations.find(rel => rel.actionType === 'manage');
      if (managePerm?.permission) {
        return managePerm.permission.code;
      }
      
      // 如果没有特定权限，使用第一个
      return menu.menuPermRelations[0].permission.code;
    }
    
    // 如果没有找到menuPermRelations，回退到permissions字段
    if (menu?.permissions && menu.permissions.length > 0) {
      // 查找默认权限（使用三段式格式，优先查找view权限）
      const viewPermission = menu.permissions.find(
        p => p.code.includes(':view') || p.code.endsWith(':manage')
      );
      
      if (viewPermission) {
        return viewPermission.code;
      }
      
      // 如果没有特定视图权限，则返回第一个权限
      return menu.permissions[0].code;
    }
  } catch (err) {
    console.error('从数据库获取路径权限映射失败:', err);
  }
  
  // 检查父级路径
  const segments = path.split('/').filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    const partialPath = '/' + segments.slice(0, i + 1).join('/');
    if (basePathMap[partialPath]) {
      return basePathMap[partialPath];
    }
  }
  
  // 没有找到匹配的权限
  return null;
};

export async function POST(request: NextRequest) {
  try {
    // 获取token
    let token: string | undefined;

    // 从Authorization头部获取token
    const authHeader = request.headers.get('authorization');
    console.log('接收到的Authorization头部:', authHeader);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
      console.log('从头部提取的令牌:', token.substring(0, 20) + '...');
    } else {
      // 从Cookie获取token
      const tokenFromCookie = request.cookies.get('token')?.value || 
                           request.cookies.get('accessToken')?.value;
      if (tokenFromCookie) {
        token = tokenFromCookie;
        console.log('从Cookie提取的令牌:', token.substring(0, 20) + '...');
      } else {
        // 从请求体尝试获取token（前端可能在请求体中传递）
        try {
          const body = await request.clone().json();
          if (body.token) {
            token = body.token;
            console.log('从请求体提取的令牌:', token.substring(0, 20) + '...');
          }
        } catch {
          // 忽略错误，不需要捕获变量
          console.log('请求体解析失败或不包含token');
        }
      }
    }

    if (!token) {
      console.log('没有找到令牌');
      return NextResponse.json({
        success: false,
        hasPermission: false,
        message: '未认证'
      }, { status: 401 });
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
      return NextResponse.json({
        success: false,
        hasPermission: false,
        message: '无效的令牌'
      }, { status: 401 });
    }

    // 获取用户ID
    const userId = Number(userInfo.sub);

    // 解析请求体
    const requestBody = await request.json();
    let permissionCode = requestBody.permissionCode;
    const path = requestBody.path;
    
    console.log('请求参数:', { permissionCode, path });
    
    // 如果提供了路径但没有提供权限代码，尝试从路径映射中解析
    if (path && !permissionCode) {
      permissionCode = await getPermissionForPath(path);
      console.log('从路径映射获取的权限代码:', permissionCode);
      
      // 如果没有找到对应的权限代码，允许访问
      if (!permissionCode) {
        console.log('此路径无需特殊权限');
        return NextResponse.json({
          success: true,
          hasPermission: true,
          message: '此路径无需特殊权限'
        }, { status: 200 });
      }
    }

    if (!permissionCode) {
      console.log('未提供权限编码或有效路径');
      return NextResponse.json({
        success: false,
        hasPermission: false,
        message: '缺少权限编码参数或有效的路径'
      }, { status: 400 });
    }

    console.log(`检查用户 ${userId} 的权限: ${permissionCode}`);

    // 查询用户角色及相关的权限
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userrole: {
          include: {
            role: {
              include: {
                permissions: true
              }
            }
          }
        }
      }
    }) as UserWithRolesAndPermissions | null;

    if (!user) {
      console.log('用户不存在:', userId);
      return NextResponse.json({
        success: false,
        hasPermission: false,
        message: '用户不存在'
      }, { status: 404 });
    }

    // 检查用户状态
    if (user.status !== 'ACTIVE') {
      console.log('用户状态非激活:', user.status);
      return NextResponse.json({
        success: false,
        hasPermission: false,
        message: '账户已被禁用'
      }, { status: 403 });
    }

    // 直接权限匹配
    let hasDirectPermission = false;
    let hasRoleManagerPermission = false;
    let partialMatchPermission = null;

    // 获取用户所有角色包含的权限列表
    const userPermissions: permission[] = user.userrole.flatMap(ur => 
      ur.role?.permissions || []
    );

    console.log(`用户 ${user.username} 拥有的权限:`, userPermissions.map(p => p.code));

    // 检查直接权限匹配
    for (const perm of userPermissions) {
      // 完全匹配
      if (perm.code === permissionCode) {
        hasDirectPermission = true;
        console.log(`找到直接权限匹配: ${perm.code}`);
        break;
      }
      
      // 通配符匹配处理
      if (permissionCode && permissionCode.includes(':')) {
        // 检查模块级通配符权限 (如 "system:*:manage")
        const [requestModule, requestResource, requestAction] = permissionCode.split(':');
        const [permModule, permResource, permAction] = perm.code.split(':');
        
        // 管理员角色权限检查
        if (
          (permModule === requestModule && permResource === '*' && permAction === 'manage') ||
          (permModule === '*' && permAction === 'manage')
        ) {
          hasRoleManagerPermission = true;
          partialMatchPermission = perm.code;
          console.log(`找到模块级管理权限: ${perm.code}`);
          break;
        }
        
        // 资源级权限检查
        if (
          permModule === requestModule &&
          permResource === requestResource &&
          (permAction === 'manage' || permAction === '*')
        ) {
          hasRoleManagerPermission = true;
          partialMatchPermission = perm.code;
          console.log(`找到资源级权限: ${perm.code}`);
          break;
        }
        
        // 模糊匹配 - 允许拥有"manage"权限的用户执行特定操作
        if (
          permModule === requestModule && 
          permResource === requestResource && 
          permAction === 'manage' && 
          ['view', 'add', 'edit', 'delete'].includes(requestAction)
        ) {
          hasRoleManagerPermission = true;
          partialMatchPermission = perm.code;
          console.log(`找到模糊匹配权限: ${perm.code} 与请求权限 ${permissionCode}`);
          break;
        }
      }
    }

    // 确定用户是否拥有所需权限
    const hasPermission = hasDirectPermission || hasRoleManagerPermission;

    // 返回权限检查结果
    return NextResponse.json({
      success: true,
      hasPermission,
      directMatch: hasDirectPermission,
      partialMatch: partialMatchPermission,
      message: hasPermission ? '用户拥有所需权限' : '用户无权访问'
    }, { status: hasPermission ? 200 : 403 });
  } catch (error) {
    console.error('检查权限失败:', error);
    return NextResponse.json({
      success: false,
      hasPermission: false,
      message: '服务器错误'
    }, { status: 500 });
  }
} 