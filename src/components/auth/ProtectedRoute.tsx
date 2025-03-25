'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const verifyAuth = async () => {
      // 如果已验证通过，无需重复检查
      if (isAuthenticated) return;
      
      // 重新检查认证状态
      const isAuthed = await checkAuth();
      
      // 如果未认证，重定向到登录页
      if (!isAuthed) {
        router.push(`/login?from=${encodeURIComponent(pathname || '')}`);
      }
    };

    if (!isLoading) {
      verifyAuth();
    }
  }, [isAuthenticated, isLoading, checkAuth, router, pathname]);

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

  // 如果未登录，不渲染子组件
  if (!isAuthenticated) {
    return null;
  }

  // 已登录，渲染子组件
  return <>{children}</>;
} 