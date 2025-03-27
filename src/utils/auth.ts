import { Menu, PathPermissionMap } from '@/types';

/**
 * 根据菜单和权限构建路径-权限映射
 * @param menus 菜单数据
 * @param permissions 用户权限列表
 * @returns 路径与权限的映射关系
 */
export function buildPathPermissionMap(menus: Menu[], permissions: string[]): PathPermissionMap {
  const pathMap: PathPermissionMap = {};
  
  // 递归处理菜单树
  function processMenu(menu: Menu) {
    if (menu.path) {
      // 初始化路径权限映射
      pathMap[menu.path] = {
        view: [],
        add: [],
        edit: [],
        delete: []
      };
      
      // 找出此菜单路径相关的权限
      // 例如: 菜单路径为 /system/users, 查找 system:users:* 格式的权限
      const menuPath = menu.path.replace(/^\//, '').replace(/\//g, ':');
      const menuPermissions = permissions.filter(p => p.startsWith(menuPath) || p.includes(menuPath));
      
      // 按操作类型分类权限
      pathMap[menu.path].view = menuPermissions.filter(p => p.includes(':view') || p.endsWith(':manage'));
      pathMap[menu.path].add = menuPermissions.filter(p => p.includes(':add') || p.endsWith(':manage'));
      pathMap[menu.path].edit = menuPermissions.filter(p => p.includes(':edit') || p.endsWith(':manage'));
      pathMap[menu.path].delete = menuPermissions.filter(p => p.includes(':delete') || p.endsWith(':manage'));
    }
    
    // 处理子菜单
    if (menu.children) {
      menu.children.forEach(processMenu);
    }
  }
  
  // 处理所有顶级菜单
  menus.forEach(processMenu);
  return pathMap;
}

/**
 * 检查用户是否有特定路径和操作的权限
 * @param path 路径
 * @param action 操作类型 (view/add/edit/delete)
 * @param userPermissions 用户权限列表
 * @param pathPermissionMap 路径-权限映射
 * @returns 是否有权限
 */
export function hasPermission(
  path: string, 
  action: 'view' | 'add' | 'edit' | 'delete', 
  userPermissions: string[], 
  pathPermissionMap: PathPermissionMap
): boolean {
  // 如果用户有管理员权限，直接返回true
  if (userPermissions.some(p => p.endsWith(':admin') || p === '*:*:*')) {
    return true;
  }
  
  // 从映射中获取路径权限
  const pathPerms = pathPermissionMap[path];
  if (!pathPerms) {
    // 尝试匹配父路径
    const pathSegments = path.split('/').filter(Boolean);
    for (let i = pathSegments.length - 1; i > 0; i--) {
      const parentPath = '/' + pathSegments.slice(0, i).join('/');
      if (pathPermissionMap[parentPath]) {
        const parentPerms = pathPermissionMap[parentPath];
        const requiredPerms = parentPerms[action] || [];
        // 检查用户是否有此父路径对应的权限
        return requiredPerms.some(perm => userPermissions.includes(perm));
      }
    }
    return false;
  }
  
  // 检查用户是否有此路径此操作的任一权限
  const requiredPerms = pathPerms[action] || [];
  return requiredPerms.some(perm => userPermissions.includes(perm));
}

/**
 * 检查按钮权限
 * @param permissionCode 权限代码
 * @param userPermissions 用户权限列表
 * @returns 是否有权限
 */
export function hasButtonPermission(permissionCode: string, userPermissions: string[]): boolean {
  // 如果用户有管理员权限，直接返回true
  if (userPermissions.some(p => p.endsWith(':admin') || p === '*:*:*')) {
    return true;
  }
  
  // 检查精确匹配
  if (userPermissions.includes(permissionCode)) {
    return true;
  }
  
  // 检查通配符匹配
  if (permissionCode.includes(':')) {
    const [module, resource] = permissionCode.split(':');
    
    // 检查模块级权限
    if (userPermissions.includes(`${module}:*:*`) || 
        userPermissions.includes(`${module}:${resource}:*`)) {
      return true;
    }
    
    // 检查管理权限
    if (userPermissions.includes(`${module}:${resource}:manage`)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 权限指令/组件包装器
 * @param permissionCode 需要的权限代码
 * @param userPermissions 用户权限列表
 * @returns 是否有权限渲染
 */
export function withPermission(permissionCode: string, userPermissions: string[]): boolean {
  return hasButtonPermission(permissionCode, userPermissions);
} 