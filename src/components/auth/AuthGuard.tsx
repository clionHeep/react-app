'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// 公开页面列表
const PUBLIC_ROUTES = ['/login', '/register', '/auth/login', '/auth/register', '/(auth)/login', '/(auth)/register'];
// 错误页面列表
const ERROR_ROUTES = ['/unauthorized', '/not-found', '/error'];

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

    // 如果当前路径是错误页面，直接显示
    if (ERROR_ROUTES.includes(pathname)) {
      setAuthorized(true);
      return;
    }

    // 检查当前路由是否需要权限验证
    const checkAuth = async () => {
      // 公开页面，直接通过
      if (PUBLIC_ROUTES.includes(pathname)) {
        setAuthorized(true);
        return;
      }
      
      // 如果用户未登录，则需要认证
      if (!isAuthenticated) {
        console.log('用户未登录，重定向到登录页面');
        router.push(`/login?from=${encodeURIComponent(pathname)}`);
        setAuthorized(false);
        return;
      }
      
      try {
        console.log(`正在检查用户对路径 ${pathname} 的访问权限`);
        
        // 如果已登录，检查后端是否允许访问当前路由
        const response = await fetch('/api/auth/check-permission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`权限检查API返回非200状态码: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('权限检查响应:', data);
        
        if (data.status === 200 && data.data?.hasPermission) {
          console.log('用户有权限访问此页面');
          setAuthorized(true);
        } else if (data.status === 401) {
          console.error('用户未认证:', data.msg);
          router.push(`/login?from=${encodeURIComponent(pathname)}`);
          setAuthorized(false);
        } else {
          console.error('权限不足:', data.msg || '您没有访问此页面的权限');
          // 重定向到403页面
          router.push('/unauthorized');
          setAuthorized(false);
        }
      } catch (error) {
        console.error('权限检查失败:', error);
        // 服务器错误，重定向到500页面
        router.push('/error');
        setAuthorized(false);
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