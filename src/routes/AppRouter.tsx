import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Spin } from 'antd';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/Layout/MainLayout';
import { Menu } from '@/types/api';

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
const LoadingFallback: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

// 默认页面组件
const DefaultPage: React.FC<{ title?: string; menuItem?: Menu }> = ({ title = "页面开发中", menuItem }) => (
  <div style={{ padding: "20px" }}>
    <h1 style={{ textAlign: "center" }}>{title}</h1>
    {menuItem && (
      <div style={{ marginTop: "20px" }}>
        <h3>菜单信息</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(menuItem, null, 2)}
        </pre>
      </div>
    )}
    <p style={{ textAlign: "center" }}>此页面可以根据菜单配置动态渲染不同内容</p>
  </div>
);

// 定义少量核心页面，其他页面都从后端菜单动态生成
const CoreComponentMap: Record<string, React.ComponentType<{ [key: string]: unknown }>> = {
  '/': () => <DefaultPage title="首页 - 欢迎使用系统" />,
  '/login': () => <DefaultPage title="登录页面" />,
  '/404': () => <DefaultPage title="页面不存在 (404)" />,
};

// 为CoreComponentMap中的组件添加displayName
Object.entries(CoreComponentMap).forEach(([path, Component]) => {
  Component.displayName = `CorePage(${path})`;
});

// 路由渲染组件
const RouteRenderer: React.FC = () => {
  const { currentPath } = useAppRouter();
  const [Component, setComponent] = useState<React.ComponentType<{ [key: string]: unknown }> | null>(null);
  const { menus, isLoading } = useAuth();
  const [dynamicRoutes, setDynamicRoutes] = useState<Record<string, React.ComponentType<{ [key: string]: unknown }>>>({});

  // 根据后端菜单数据构建动态路由
  useEffect(() => {
    if (!menus || !Array.isArray(menus)) return;
    
    const routes: Record<string, React.ComponentType<{ [key: string]: unknown }>> = {};
    
    // 递归处理菜单项生成路由
    const processMenuItem = (item: Menu) => {
      if (item.path) {
        // 为每个菜单项创建一个动态组件
        const DynamicComponent = () => <DefaultPage title={item.name} menuItem={item} />;
        DynamicComponent.displayName = `MenuPage(${item.name})`;
        routes[item.path] = DynamicComponent;
      }
      
      // 处理子菜单
      if (item.children && Array.isArray(item.children)) {
        item.children.forEach(processMenuItem);
      }
    };
    
    // 处理所有菜单项
    menus.forEach(processMenuItem);
    console.log('已根据菜单数据生成动态路由:', Object.keys(routes).length, '个路由');
    
    setDynamicRoutes(routes);
  }, [menus]);

  // 根据路径找到匹配的组件
  const findComponentForPath = (path: string): React.ComponentType<{ [key: string]: unknown }> | null => {
    console.log('查找路径对应的组件:', path);
    
    // 1. 先检查核心组件
    if (CoreComponentMap[path]) {
      return CoreComponentMap[path];
    }
    
    // 2. 查找动态生成的路由
    if (dynamicRoutes[path]) {
      return dynamicRoutes[path];
    }
    
    // 3. 如果没有精确匹配，尝试前缀匹配（支持嵌套路由）
    // 先按路径长度排序，这样可以优先匹配最具体的路径
    const possiblePaths = Object.keys(dynamicRoutes)
      .filter(routePath => path.startsWith(routePath) && routePath !== '/')
      .sort((a, b) => b.length - a.length);
    
    if (possiblePaths.length > 0) {
      return dynamicRoutes[possiblePaths[0]];
    }
    
    // 4. 尝试找到菜单项，即使没有预注册路由
    const findMenuItemByPath = (items: Menu[], targetPath: string): Menu | null => {
      if (!items || !Array.isArray(items)) return null;
      
      for (const item of items) {
        if (item.path === targetPath) {
          return item;
        }
        
        if (item.children) {
          const found = findMenuItemByPath(item.children, targetPath);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    const menuItem = menus && findMenuItemByPath(menus, path);
    if (menuItem) {
      const DynamicMenuComponent = () => <DefaultPage title={menuItem.name} menuItem={menuItem} />;
      DynamicMenuComponent.displayName = `DynamicPage(${path})`;
      return DynamicMenuComponent;
    }
    
    // 5. 所有情况都不匹配，返回404组件
    return CoreComponentMap['/404'];
  };

  useEffect(() => {
    const component = findComponentForPath(currentPath);
    setComponent(() => component);
  }, [currentPath, dynamicRoutes]);

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return <LoadingFallback />;
  }

  // 如果没有找到组件，显示404页面
  if (!Component) {
    return <DefaultPage title="页面不存在 (404)" />;
  }

  return (
    <MainLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Component />
      </Suspense>
    </MainLayout>
  );
};

export default RouteRenderer; 