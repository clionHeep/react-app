import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { permission, role } from '@prisma/client';

// 定义权限类型
type PermissionType = permission;
// 定义角色类型
type RoleWithPermissions = role & {
  permissions?: PermissionType[];
  parent?: RoleWithPermissions | null;
  parentId?: number | null;
};

/**
 * 获取角色权限，包括继承的权限
 * @param request 请求对象，可以通过URL参数指定roleId
 * @returns 角色及其权限的映射关系
 */
export async function GET(request: NextRequest) {
  try {
    // 从URL中获取roleId参数
    const { searchParams } = new URL(request.url);
    const roleIdParam = searchParams.get('roleId');
    
    // 构建查询条件
    const whereCondition = roleIdParam ? { id: parseInt(roleIdParam, 10) } : {};
    
    // 获取角色及其直接关联的权限
    const roles = await db.role.findMany({
      where: whereCondition,
      include: {
        permissions: true,
        // 使用Prisma的正确关系名称，如果它支持父角色关系的话
        rolepermission: {
          include: {
            permission: true
          }
        }
      }
    }) as unknown as RoleWithPermissions[];
    
    // 存储已处理的角色ID，避免循环引用
    const processedRoleIds = new Set<number>();
    
    // 递归获取所有继承的权限
    const getAllInheritedPermissions = async (roleId: number): Promise<PermissionType[]> => {
      // 防止循环引用
      if (processedRoleIds.has(roleId)) {
        return [];
      }
      processedRoleIds.add(roleId);
      
      // 获取当前角色
      const role = await db.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: true,
          // 使用适当的关系名称获取父角色
          rolepermission: {
            include: {
              permission: true
            }
          }
        }
      }) as unknown as RoleWithPermissions;
      
      if (!role) return [];
      
      // 获取当前角色的权限
      const directPermissions = role.permissions || [];
      
      // 如果有父角色，递归获取父角色的权限（需要通过关系查询获取父角色ID）
      let inheritedPermissions: PermissionType[] = [];
      // 这里需要根据实际的Prisma模型修改获取父角色ID的方法
      const parentRoleId = role.parentId;
      if (parentRoleId) {
        inheritedPermissions = await getAllInheritedPermissions(parentRoleId);
      }
      
      // 合并权限，去除重复
      const allPermissions = [...directPermissions];
      for (const perm of inheritedPermissions) {
        if (!allPermissions.some(p => p.id === perm.id)) {
          allPermissions.push(perm);
        }
      }
      
      return allPermissions;
    };
    
    // 构建角色权限映射
    const rolePermissionMap: Record<number, PermissionType[]> = {};
    
    // 处理每个角色
    for (const role of roles) {
      // 重置处理过的角色ID集合
      processedRoleIds.clear();
      
      // 获取当前角色的所有权限（包括继承的）
      const allPermissions = await getAllInheritedPermissions(role.id);
      
      // 存储到映射中
      rolePermissionMap[role.id] = allPermissions;
    }
    
    // 如果指定了特定角色ID，只返回该角色的权限
    if (roleIdParam) {
      const roleId = parseInt(roleIdParam, 10);
      return NextResponse.json({
        success: true,
        data: {
          roleId,
          permissions: rolePermissionMap[roleId] || []
        }
      });
    }
    
    // 否则返回所有角色的权限映射
    return NextResponse.json({
      success: true,
      data: rolePermissionMap
    });
  } catch (error) {
    console.error('获取角色权限失败:', error);
    return NextResponse.json(
      { success: false, message: '获取角色权限失败' },
      { status: 500 }
    );
  }
} 