'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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

// 公开页面列表
const PUBLIC_ROUTES = ['/login', '/register', '/auth/login', '/auth/register', '/(auth)/login', '/(auth)/register'];

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname() || '';
  const [authorized, setAuthorized] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // 如果正在加载认证状态，暂时不执行检查
    if (isLoading) return;

    // 检查当前路由是否需要权限验证
    const checkAuth = () => {
      // 公开页面，直接通过
      if (PUBLIC_ROUTES.includes(pathname)) {
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
            if (!isAuthenticated) {
              hasPermission = false;
              return;
            }
          }
          
          // 检查角色
          if (config.roles && config.roles.length > 0 && user) {
            const userRoles = user.roles?.split(',') || [];
            if (!userRoles.some(role => config.roles?.includes(role))) {
              hasPermission = false;
              return;
            }
          }
          
          // 检查具体权限（这需要接口支持，暂时禁用）
          // if (config.permissions && config.permissions.length > 0) {
          //   const userPermissions = []; // 从用户对象获取权限
          //   if (!userPermissions.some(perm => config.permissions?.includes(perm))) {
          //     hasPermission = false;
          //     return;
          //   }
          // }
        }
      });
      
      if (requiresAuth && !hasPermission) {
        // 跳转到登录页，并带上需要返回的URL
        router.push(`/login?from=${encodeURIComponent(pathname)}`);
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    };
    
    checkAuth();
  }, [pathname, router, isAuthenticated, isLoading, user]);
  
  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-2">正在加载...</p>
        </div>
      </div>
    );
  }
  
  return authorized ? <>{children}</> : null;
};

export default AuthGuard; 