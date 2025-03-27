import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { routes, RouteConfig } from './constants';
// import { useAuth } from '@/context/AuthContext';

// 路由键类型，对应路由名称
export type RouteKey = string;

// 路由跳转选项
export interface RouterPushOptions {
  params?: Record<string, string>;
  query?: Record<string, string>;
}

// 路由位置接口
export interface RouteLocationNamedRaw {
  name: RouteKey;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

/**
 * 通过路由名称获取路由配置
 */
export function findRouteByName(name: RouteKey, routeList = routes): RouteConfig | null {
  for (const route of routeList) {
    if (route.routeName === name || route.name === name) {
      return route;
    }
    
    if (route.children && route.children.length > 0) {
      const childRoute = findRouteByName(name, route.children);
      if (childRoute) {
        return childRoute;
      }
    }
  }
  
  return null;
}

/**
 * 将命名路由转换为路径
 */
export function resolveRouteLocation(location: RouteLocationNamedRaw): string {
  const route = findRouteByName(location.name);
  
  if (!route) {
    console.error(`未找到路由: ${location.name}`);
    return '/';
  }
  
  // 如果是外部链接，直接返回路径
  if (route.isExternal) {
    return route.path;
  }
  
  let path = route.path;
  
  // 处理路径参数
  if (location.params) {
    Object.entries(location.params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
  }
  
  // 处理查询参数
  if (location.query) {
    const searchParams = new URLSearchParams();
    Object.entries(location.query).forEach(([key, value]) => {
      searchParams.append(key, value);
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      path = `${path}?${queryString}`;
    }
  }
  
  return path;
}

/**
 * 获取当前用户的可访问路由
//  */
// export const getUserRoutes = () => {
//   const { isAuthenticated, permissions, roles } = useAuth();
  
//   // 未登录用户只能访问公共路由
//   if (!isAuthenticated) {
//     return publicRoutes;
//   }
  
//   // 获取角色ID或名称列表
//   const roleIdentifiers = roles.map(role => 
//     typeof role === 'string' ? role : (role.code || role.id?.toString() || role.name || '')
//   ).filter(Boolean);
  
//   // 获取静态路由 + 根据权限过滤后的权限路由
//   const filteredPermissionRoutes = filterRoutesByPermissions(permissionRoutes, permissions);
//   return [...staticRoutes, ...filteredPermissionRoutes];
// };

/**
 * 路由钩子，提供导航功能
 */
export function useRouterNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // 获取当前路由信息
  function getCurrentRoute() {
    // 从路径中提取当前路由信息
    const queryParams = searchParams ? Object.fromEntries(searchParams) : {};
    
    return {
      path: pathname,
      query: queryParams
    };
  }
  
  // 定义明确的类型
  type RouteLocation = string | RouteConfig | { 
    path: string; 
    query?: Record<string, string>;
    target?: string;
  };
  
  // 导航到指定路由
  function navigateTo(to: RouteLocation) {
    // 字符串路径
    if (typeof to === 'string') {
      router.push(to);
      return;
    }
    
    // 路由配置对象
    if ('path' in to) {
      // 如果是外部链接
      if (isExternal(to.path)) {
        const target = 'target' in to ? to.target || '_blank' : '_blank';
        window.open(to.path, target);
        return;
      }
      
      // 处理查询参数
      if ('query' in to && to.query) {
        const searchParams = new URLSearchParams();
        Object.entries(to.query).forEach(([key, value]) => {
          searchParams.append(key, String(value));
        });
        
        const queryString = searchParams.toString();
        if (queryString) {
          router.push(`${to.path}?${queryString}`);
          return;
        }
      }
      
      router.push(to.path);
      return;
    }
  }
  
  return {
    currentRoute: getCurrentRoute(),
    navigateTo,
    router
  };
}

/**
 * 获取当前路由
 */
export function useRoute() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const queryParams = searchParams ? Object.fromEntries(searchParams) : {};
  
  return {
    path: pathname,
    query: queryParams
  };
}

/**
 * 检查路径是否为外部链接
 */
export function isExternal(path: string): boolean {
  return path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//');
}

/**
 * 规范化路径，处理多余的斜杠
 */
export function getNormalPath(path: string): string {
  if (path.length === 0) return '/';
  
  // 处理路径，去除多余的斜杠
  return path.replace(/\/+/g, '/').replace(/\/$/g, '') || '/';
}

/**
 * 简化的路径解析函数
 */
export function resolvePath(routePath: string, basePath = '', routeQuery?: string) {
  // 如果是外部链接，直接返回
  if (isExternal(routePath)) {
    return routePath;
  }
  
  // 如果基础路径是外部链接，返回基础路径
  if (isExternal(basePath)) {
    return basePath;
  }
  
  // 处理查询参数
  if (routeQuery) {
    const query = JSON.parse(routeQuery);
    return { 
      path: getNormalPath(basePath + '/' + routePath), 
      query 
    };
  }
  
  // 返回规范化的路径
  return getNormalPath(basePath + '/' + routePath);
} 