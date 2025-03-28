import { role, menu, permission } from '@prisma/client';

/**
 * 用户角色关联类型
 */
export interface UserRole {
  userId: number;
  roleId: number;
  role: role;
}

/**
 * 角色菜单关联类型
 */
export interface RoleMenu {
  roleId: number;
  menuId: number;
  menu: menu & {
    children?: menu[];
  };
}

/**
 * 角色权限关联类型
 */
export interface RolePermission {
  roleId: number;
  permissionId: number;
  permission: permission;
} 