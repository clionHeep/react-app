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
// 暂时注释掉这个导入，因为它导致错误
// import { useAuth } from "@/context/AuthContext";
import { Menu } from "@/types/api";

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
  updateMenuData: (menus: Menu[]) => void; // 添加一个更新菜单数据的方法
}

// 需要排除的路径（不在面包屑中显示）
const EXCLUDED_PATHS = [
  "/login",
  "/register",
  "/auth/login",
  "/auth/register",
  "/not-found",
  "/unauthorized",
  "/error",
  "/500",
  "/401",
  "/403",
  "/404"
];

// 创建上下文
const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined
);

// 面包屑提供者组件
export const BreadcrumbProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>(() => {
    // 从localStorage初始化面包屑状态
    if (typeof window !== 'undefined') {
      const savedBreadcrumbs = localStorage.getItem('breadcrumbs');
      if (savedBreadcrumbs) {
        try {
          return JSON.parse(savedBreadcrumbs);
        } catch (e) {
          console.error('解析保存的面包屑数据失败:', e);
        }
      }
    }
    // 如果没有保存的数据，返回空数组
    return [];
  });
  const pathname = usePathname();
  const router = useRouter();
  // 用于跟踪最近删除的项，防止在导航过程中重新添加
  const [recentlyRemoved, setRecentlyRemoved] = useState<{
    key: string;
    timestamp: number;
  } | null>(null);
  // 当前活动路径
  const [currentPath, setCurrentActivePath] = useState<string>("/");

  // 内部存储菜单数据，而不是从useAuth获取
  const [menuData, setMenuData] = useState<Menu[]>([]);

  // 当面包屑状态改变时，保存到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('breadcrumbs', JSON.stringify(breadcrumbs));
    }
  }, [breadcrumbs]);

  // 提供一个方法让AuthProvider可以传递菜单数据
  const updateMenuData = useCallback((menus: Menu[]) => {
    setMenuData(menus);
  }, []);

  // 根据路径查找对应的菜单项
  const findMenuByPath = useCallback(
    (path: string) => {
      if (!menuData || !Array.isArray(menuData) || menuData.length === 0)
        return null;

      // 递归查找菜单树
      const findInMenus = (items: Menu[], targetPath: string): Menu | null => {
        for (const item of items) {
          if (item.path === targetPath) {
            return item;
          }

          if (item.children && item.children.length > 0) {
            const found = findInMenus(item.children, targetPath);
            if (found) return found;
          }
        }

        return null;
      };

      return findInMenus(menuData, path);
    },
    [menuData]
  );

  // 添加面包屑
  const addBreadcrumb = useCallback((item: BreadcrumbItem) => {
    setBreadcrumbs((prev) => {
      // 如果是首页，确保它是第一个
      if (item.key === 'home') {
        return [item, ...prev.filter(crumb => crumb.key !== 'home')];
      }
      
      // 检查是否已经存在相同路径的面包屑
      const exists = prev.some((crumb) => crumb.path === item.path);
      if (exists) {
        // 如果存在，先移除旧的，然后添加新的到末尾
        return [...prev.filter((crumb) => crumb.path !== item.path), item];
      }
      return [...prev, item];
    });
  }, []);

  // 移除面包屑
  const removeBreadcrumb = useCallback(
    (key: string) => {
      // 记录最近删除的项
      setRecentlyRemoved({ key, timestamp: Date.now() });

      setBreadcrumbs((prev) => {
        // 找到要删除的项和它的索引
        const itemIndex = prev.findIndex((item) => item.key === key);
        const itemToRemove = prev.find((item) => item.key === key);

        // 如果找不到项，直接返回原数组
        if (itemIndex === -1 || !itemToRemove) return prev;

        // 检查是否是当前项（当前活动路径）
        const isCurrentItem = itemToRemove.path === currentPath;

        // 获取上一个导航项（如果存在）
        const prevItem =
          isCurrentItem && itemIndex > 0 ? prev[itemIndex - 1] : null;

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
    },
    [currentPath, router]
  );

  // 根据当前路径设置活动的面包屑
  const setCurrentPath = useCallback(
    (path: string) => {
      setCurrentActivePath(path);

      // 排除不需要显示面包屑的路径
      if (EXCLUDED_PATHS.includes(path) || path.startsWith('/error/')) {
        return;
      }

      // 从菜单数据中查找对应的标题
      const menuItem = findMenuByPath(path);
      
      // 如果菜单项没有路径，不添加到面包屑
      if (menuItem && !menuItem.path) {
        return;
      }

      // 如果找到菜单项，使用其名称；否则使用路径的最后一段
      const title = menuItem
        ? menuItem.name
        : path === "/"
        ? "首页"
        : path.split("/").pop() || path;
      const key = path.replace(/\//g, "-").slice(1) || "home";

      const exists = breadcrumbs.some((crumb) => crumb.path === path);
      const isRecentlyRemoved =
        recentlyRemoved &&
        recentlyRemoved.key === key &&
        Date.now() - recentlyRemoved.timestamp < 5000;

      if (!exists && path !== "/" && !isRecentlyRemoved) {
        addBreadcrumb({ key, title, path });
      }
    },
    [breadcrumbs, addBreadcrumb, recentlyRemoved, findMenuByPath]
  );

  // 初始化和路径变化时更新面包屑
  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname);
    }
  }, [pathname, setCurrentPath]);

  // 初始化时添加首页面包屑
  useEffect(() => {
    // 确保只添加一次首页
    if (breadcrumbs.length === 0) {
      addBreadcrumb({ key: "home", title: "首页", path: "/" });
    }
  }, [addBreadcrumb, breadcrumbs.length]);

  return (
    <BreadcrumbContext.Provider
      value={{
        breadcrumbs,
        addBreadcrumb,
        removeBreadcrumb,
        setCurrentPath,
        currentPath,
        updateMenuData,
      }}
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
