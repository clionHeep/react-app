'use client';

import React, { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { hasButtonPermission, hasPermission } from '@/utils/auth';

interface AuthButtonProps {
  permissionCode: string;
  children: ReactNode;
}

/**
 * 权限按钮组件
 * 如果用户拥有指定权限，则渲染子组件，否则什么都不渲染
 */
export const AuthButton = ({ permissionCode, children }: AuthButtonProps) => {
  const { permissions } = useSelector((state: RootState) => state.auth);
  
  if (!permissions || !hasButtonPermission(permissionCode, permissions)) {
    return null;
  }
  
  return <>{children}</>;
};

/**
 * 路径权限组件
 * 用于检查用户是否有权限访问当前路径
 */
export const RoutePermission = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { permissions, pathPermissionMap } = useSelector((state: RootState) => state.auth);
  
  if (!permissions || !pathPermissionMap) {
    // 未加载权限数据时，不做检查
    return <>{children}</>;
  }
  
  const hasViewPermission = hasPermission(pathname, 'view', permissions, pathPermissionMap);
  
  if (!hasViewPermission) {
    // 如果没有当前路径的访问权限，可以重定向或显示错误信息
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">访问被拒绝</h1>
          <p className="mt-2 text-gray-600">您没有权限访问此页面</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

/**
 * 动作权限Hook，用于检查路径的特定操作权限
 */
export function useActionPermission(action: 'add' | 'edit' | 'delete' = 'edit') {
  const pathname = usePathname();
  const { permissions, pathPermissionMap } = useSelector((state: RootState) => state.auth);
  
  return permissions && pathPermissionMap 
    ? hasPermission(pathname, action, permissions, pathPermissionMap) 
    : false;
}

/**
 * 初始化权限数据Hook
 * 从user-info接口获取数据并存储到Redux
 */
export function useInitAuth() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    // 如果已认证但未加载权限数据，则从API获取
    if (isAuthenticated && user && !user.permissions) {
      // 这里通常会有一个fetch或者dispatch action调用来获取权限数据
      // 例如: dispatch(fetchUserInfo())
    }
  }, [isAuthenticated, user]);
} 