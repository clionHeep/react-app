import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Spin } from 'antd';
import { routes, RouteConfig, RouteComponentProps } from '@/routes/constants';

// 路由上下文
interface RouterContextType {
  navigate: (path: string) => void;
  currentPath: string;
}

export const RouterContext = React.createContext<RouterContextType>({
  navigate: () => {},
  currentPath: '/',
});

// 路由提供者组件
export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname() || '/';
  
  const navigate = (path: string) => {
    router.push(path);
  };
  
  const value = {
    navigate,
    currentPath: pathname
  };
  
  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
};

// 使用路由钩子
export const useAppRouter = () => React.useContext(RouterContext);

// 路由加载中的占位组件
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

// 路由渲染组件
const RouteRenderer: React.FC = () => {
  const { currentPath } = useAppRouter();
  const [CurrentComponent, setCurrentComponent] = useState<React.ComponentType<RouteComponentProps> | null>(null);
  const router = useRouter();
  const pathname = usePathname() || '/';

  // 根据当前路径找到匹配的路由配置
  const findMatchingRoute = React.useCallback(
    (routes: RouteConfig[], path: string): RouteConfig | null => {
      for (const route of routes) {
        if (route.path === path) {
          return route;
        }
        
        if (route.children && route.children.length > 0) {
          const childRoute = findMatchingRoute(route.children, path);
          if (childRoute) {
            return childRoute;
          }
        }
      }
      
      return null;
    },
    []
  );

  useEffect(() => {
    const matchedRoute = findMatchingRoute(routes, currentPath);
    
    if (matchedRoute && matchedRoute.component) {
      setCurrentComponent(() => matchedRoute.component);
    } else {
      // 如果没有找到匹配的路由，可以设置一个默认组件或404组件
      setCurrentComponent(null);
    }
  }, [currentPath, findMatchingRoute]);

  useEffect(() => {
    // 监听路由变化
    if (router && pathname) {
      findMatchingRoute(routes, pathname);
    }
  }, [router, pathname, findMatchingRoute]);

  if (!CurrentComponent) {
    return <div>页面不存在</div>;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <CurrentComponent />
    </Suspense>
  );
};

export default RouteRenderer; 