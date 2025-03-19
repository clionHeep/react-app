"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";

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

  // 添加面包屑
  const addBreadcrumb = (item: BreadcrumbItem) => {
    // 检查是否已经存在相同路径的面包屑
    setBreadcrumbs((prev) => {
      const exists = prev.some((crumb) => crumb.path === item.path);
      if (exists) {
        // 如果存在，先移除旧的，然后添加新的到末尾
        return [...prev.filter((crumb) => crumb.path !== item.path), item];
      }
      return [...prev, item];
    });
  };

  // 移除面包屑
  const removeBreadcrumb = (key: string) => {
    setBreadcrumbs((prev) => prev.filter((item) => item.key !== key));
  };

  // 根据当前路径设置活动的面包屑
  const setCurrentPath = useCallback((path: string) => {
    const title = pathTitleMap[path] || path.split('/').pop() || path;
    const key = path.replace(/\//g, '-').slice(1) || 'home';
    
    const exists = breadcrumbs.some(crumb => crumb.path === path);
    
    if (!exists && path !== '/') {
      addBreadcrumb({ key, title, path });
    }
  }, [breadcrumbs, addBreadcrumb]);

  // 初始化和路径变化时更新面包屑
  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname);
    }
  }, [pathname, setCurrentPath]);

  return (
    <BreadcrumbContext.Provider
      value={{ breadcrumbs, addBreadcrumb, removeBreadcrumb, setCurrentPath }}
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
