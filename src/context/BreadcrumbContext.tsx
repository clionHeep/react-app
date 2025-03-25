"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";

// 面包屑项类型
export interface BreadcrumbItem {
  key: string;
  title: string;
  path: string;
}

// 面包屑上下文类型
interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[];
  addBreadcrumb: (item: BreadcrumbItem) => void;
  removeBreadcrumb: (key: string) => void;
  setCurrentPath: (path: string) => void;
  currentPath: string;
}

// 路径到面包屑标题的映射，可以扩展更多
const pathTitleMap: Record<string, string> = {
  "/": "首页",
  "/dashboard": "控制台",
  "/apps": "应用列表",
  "/users": "用户管理",
  "/settings": "设置",
  "/products": "产品管理",
  "/orders": "订单管理",
  "/articles": "文章管理",
  "/comments": "评论管理",
  "/system": "系统管理",
  "/tools": "开发工具",
};

// 需要排除的路径（不在面包屑中显示）
const EXCLUDED_PATHS = ['/login', '/register', '/auth/login', '/auth/register'];

// 创建上下文
const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined
);

// 面包屑提供者组件
export const BreadcrumbProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { key: "home", title: "首页", path: "/" },
  ]);
  const pathname = usePathname();
  const router = useRouter();
  // 用于跟踪最近删除的项，防止在导航过程中重新添加
  const [recentlyRemoved, setRecentlyRemoved] = useState<{key: string, timestamp: number} | null>(null);
  // 当前活动路径
  const [currentPath, setCurrentActivePath] = useState<string>("/");

  // 添加面包屑
  const addBreadcrumb = useCallback((item: BreadcrumbItem) => {
    // 检查是否已经存在相同路径的面包屑
    setBreadcrumbs((prev) => {
      const exists = prev.some((crumb) => crumb.path === item.path);
      if (exists) {
        // 如果存在，先移除旧的，然后添加新的到末尾
        return [...prev.filter((crumb) => crumb.path !== item.path), item];
      }
      return [...prev, item];
    });
  }, []);

  // 移除面包屑
  const removeBreadcrumb = (key: string) => {
    // 记录最近删除的项
    setRecentlyRemoved({ key, timestamp: Date.now() });
    
    setBreadcrumbs((prev) => {
      // 找到要删除的项和它的索引
      const itemIndex = prev.findIndex(item => item.key === key);
      const itemToRemove = prev.find(item => item.key === key);
      
      // 如果找不到项，直接返回原数组
      if (itemIndex === -1 || !itemToRemove) return prev;
      
      // 检查是否是当前项（当前活动路径）
      const isCurrentItem = itemToRemove.path === currentPath;
      
      // 获取上一个导航项（如果存在）
      const prevItem = isCurrentItem && itemIndex > 0 ? prev[itemIndex - 1] : null;
      
      // 删除当前项，如果删除的是当前路径且有上一项则导航到上一项
      if (isCurrentItem && prevItem) {
        // 更新当前活动路径
        setCurrentActivePath(prevItem.path);
        // 使用setTimeout确保状态更新完成后再导航
        setTimeout(() => {
          router.push(prevItem.path);
        }, 0);
      }
      
      // 返回过滤后的数组
      return prev.filter((item) => item.key !== key);
    });
  };

  // 根据当前路径设置活动的面包屑
  const setCurrentPath = useCallback((path: string) => {
    // 更新当前活动路径
    setCurrentActivePath(path);
    
    // 如果是登录或注册页面，不添加到面包屑
    if (EXCLUDED_PATHS.includes(path)) {
      console.log('排除登录/注册路径不添加到面包屑:', path);
      return;
    }
    
    const title = pathTitleMap[path] || path.split('/').pop() || path;
    const key = path.replace(/\//g, '-').slice(1) || 'home';
    
    // 检查是否存在相同路径的面包屑
    const exists = breadcrumbs.some(crumb => crumb.path === path);
    
    // 检查是否是最近刚刚删除的项（最近5秒内）
    const isRecentlyRemoved = recentlyRemoved && 
                              recentlyRemoved.key === key && 
                              (Date.now() - recentlyRemoved.timestamp < 5000);
    
    // 如果不存在且不是主页，且不是最近删除的，则添加
    if (!exists && path !== '/' && !isRecentlyRemoved) {
      addBreadcrumb({ key, title, path });
    }
  }, [breadcrumbs, addBreadcrumb, recentlyRemoved]);

  // 初始化和路径变化时更新面包屑
  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname);
    }
  }, [pathname, setCurrentPath]);

  return (
    <BreadcrumbContext.Provider
      value={{ breadcrumbs, addBreadcrumb, removeBreadcrumb, setCurrentPath, currentPath }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
};

// 使用面包屑的钩子
export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return context;
};
