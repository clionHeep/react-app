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

// 定义菜单接口（如果不能导入）
interface MenuType {
  id: number;
  name: string;
  path: string;
  icon?: string;
  children?: MenuType[];
  [key: string]: unknown;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname() || '';
  const [authorized, setAuthorized] = useState(false);
  const { isAuthenticated, isLoading, permissions, menus } = useAuth();
  
  // 检查用户是否有权限访问当前路径
  const hasPermissionForPath = (path: string, permissionCodes: string[]) => {
    console.log('检查路径权限:', path);
    console.log('当前菜单数据:', menus);
    
    // 如果菜单为空，可能是数据还未加载完成
    if (!menus || (Array.isArray(menus) && menus.length === 0)) {
      console.warn('菜单数据为空，可能未完成加载');
      return false;
    }
    
    // 1. 首先判断是否是明确允许的路径
    if (PUBLIC_ROUTES.includes(path) || ERROR_ROUTES.includes(path)) {
      console.log('公开页面或错误页面，直接允许访问');
      return true;
    }
    
    // 2. 递归查找菜单中的路径 - 这是主要判断逻辑，基于后端返回的菜单
    const findMenuWithPath = (menuItems: MenuType[], targetPath: string): MenuType | null => {
      for (const menu of menuItems) {
        // 精确匹配
        if (menu.path === targetPath) {
          console.log('找到精确匹配菜单:', menu);
          return menu;
        }
        
        // 检查子菜单
        if (menu.children && menu.children.length > 0) {
          const found = findMenuWithPath(menu.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };
    
    const matchedMenu = findMenuWithPath(menus as MenuType[], path);
    
    // 如果在用户的菜单中找到了匹配的路径，则用户有权限访问
    if (matchedMenu) {
      console.log('在用户菜单中找到匹配路径，允许访问');
      return true;
    }
    
    // 3. 如果开发环境或配置允许默认访问，放行
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_STRICT_AUTH !== 'true') {
      console.log('开发环境且未启用严格权限控制，放行');
      return true;
    }
    
    // 4. 尝试权限代码匹配 - 作为后备方案
    const segments = path.split('/').filter(Boolean);
    
    // 生成可能的权限代码
    const possiblePermissions: string[] = [];
    
    // 可能的操作类型
    const operations = ['view', 'add', 'edit', 'delete', 'manage'];
    
    // 基于路径生成可能的权限代码
    if (segments.length > 0) {
      const resource = segments[0]; // 资源名称，如'users'
      
      // 添加资源通用权限
      possiblePermissions.push(`${resource}:manage`);
      
      // 如果有操作指示，添加具体操作权限
      if (segments.length > 1) {
        const operation = segments[1]; // 操作名称，如'add'
        if (operations.includes(operation)) {
          possiblePermissions.push(`${resource}:${operation}`);
        }
      }
      
      // 添加查看权限（最基本的权限）
      possiblePermissions.push(`${resource}:view`);
    }
    
    console.log('可能的权限代码:', possiblePermissions);
    console.log('用户拥有的权限:', permissionCodes);
    
    // 检查用户是否拥有任一可能的权限
    const hasPermission = possiblePermissions.some(perm => permissionCodes.includes(perm));
    console.log('权限检查结果:', hasPermission ? '允许访问' : '权限不足');
    
    return hasPermission;
  };
  
  useEffect(() => {
    // 如果正在加载认证状态，暂时不执行检查
    if (isLoading) {
      console.log('认证状态加载中，暂不检查权限');
      return;
    }

    // 如果当前路径是错误页面，直接显示
    if (ERROR_ROUTES.includes(pathname)) {
      setAuthorized(true);
      return;
    }

    // 检查当前路由是否需要权限验证
    const checkAuth = () => {
      // 公开页面，直接通过
      if (PUBLIC_ROUTES.includes(pathname)) {
        console.log('公开页面，允许访问');
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
      
      // 获取权限代码列表 (permissions可能是权限对象数组或字符串数组)
      let permissionCodes: string[] = [];
      if (Array.isArray(permissions)) {
        // 检查是否为空数组
        if (permissions.length === 0) {
          console.warn('用户权限列表为空');
        } 
        // 如果是字符串数组
        else if (typeof permissions[0] === 'string') {
          permissionCodes = permissions as unknown as string[];
        } 
        // 如果是对象数组，提取code字段
        else if (typeof permissions[0] === 'object') {
          permissionCodes = permissions.map((p) => {
            // 使用类型断言而不是any
            const permObj = p as { code?: string };
            return permObj.code || '';
          }).filter(Boolean);
        }
      }
      console.log('用户权限代码:', permissionCodes);
      
      // 使用用户菜单和权限数据判断是否有权限访问
      if (hasPermissionForPath(pathname, permissionCodes)) {
        console.log('用户有权限访问此页面');
        setAuthorized(true);
      } else {
        console.error('权限不足: 您没有访问此页面的权限');
        // 重定向到403页面
        router.push('/unauthorized');
        setAuthorized(false);
      }
    };
    
    checkAuth();
  }, [pathname, router, isAuthenticated, isLoading, permissions, menus]);
  
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