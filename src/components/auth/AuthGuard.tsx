'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// 模拟用户权限数据
const userPermissions = {
  isAuthenticated: true, // 是否已登录
  roles: ['user'], // 用户角色
  permissions: ['basic:read', 'dashboard:read'] // 具体权限
};

// 路由权限配置
const routePermissions: Record<string, { 
  roles?: string[],
  permissions?: string[], 
  requireAuth?: boolean 
}> = {
  '/dashboard': { requireAuth: true },
  '/dashboard/analytics': { requireAuth: true, permissions: ['dashboard:read'] },
  '/dashboard/workspace': { requireAuth: true },
  '/users': { requireAuth: true, roles: ['admin'] },
  '/settings': { requireAuth: true, roles: ['admin'] },
  '/system': { requireAuth: true, roles: ['admin'] },
  '/dev-tools': { requireAuth: true, roles: ['developer', 'admin'] },
  '/content': { requireAuth: true },
  '/e-commerce': { requireAuth: true },
  // 其他页面可以根据需要添加权限配置
};

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 检查当前路由是否需要权限验证
    const checkAuth = () => {
      // 首页、注册页、登录页等公开页面
      if (pathname === '/' || pathname === '/about' || pathname === '/login') {
        setAuthorized(true);
        return;
      }
      
      // 检查当前路径是否有权限配置
      let requiresAuth = false;
      let hasPermission = true;
      
      // 查找最匹配的路由配置
      Object.keys(routePermissions).forEach(route => {
        if (pathname.startsWith(route)) {
          const config = routePermissions[route];
          
          // 检查是否需要登录
          if (config.requireAuth) {
            requiresAuth = true;
            if (!userPermissions.isAuthenticated) {
              hasPermission = false;
              return;
            }
          }
          
          // 检查角色
          if (config.roles && config.roles.length > 0) {
            if (!userPermissions.roles.some(role => config.roles?.includes(role))) {
              hasPermission = false;
              return;
            }
          }
          
          // 检查具体权限
          if (config.permissions && config.permissions.length > 0) {
            if (!userPermissions.permissions.some(perm => config.permissions?.includes(perm))) {
              hasPermission = false;
              return;
            }
          }
        }
      });
      
      if (requiresAuth && !hasPermission) {
        // 可以跳转到登录页或者没有权限页面
        router.push('/login');
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    };
    
    checkAuth();
  }, [pathname, router]);
  
  return authorized ? <>{children}</> : null;
};

export default AuthGuard; 