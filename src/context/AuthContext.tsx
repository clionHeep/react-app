"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { loginApi, getUserInfoApi } from "@/lib/services/auth/authService";
import type { User, Menu, Role, Permission } from "@/types/api";
import { showMessage } from "@/utils/message";
import { STATIC_MENUS } from "@/routes/staticMenus";

// 定义路径权限映射类型
interface PathPermissionMap {
  [path: string]: {
    requiredPermissions: string[];
    actions: {
      [action: string]: string[];
    };
  };
}

// 定义认证上下文的类型
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  menus: Menu[]; // 用户菜单
  permissions: string[]; // 用户权限代码
  roles: Role[]; // 用户角色
  pathPermissionMap: PathPermissionMap; // 路径权限映射
  hasPermission: (permissionCode: string) => boolean; // 检查是否有权限
  hasPathPermission: (path: string, action?: string) => boolean; // 检查是否有路径权限
  resetLoading: () => void; // 重置加载状态
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 创建一个变量存储更新面包屑的函数
let breadcrumbUpdateMenuData: ((menus: Menu[]) => void) | null = null;

// 暴露一个函数让BreadcrumbContext注册自己的更新函数
export function registerBreadcrumbUpdateHandler(
  handler: (menus: Menu[]) => void
) {
  breadcrumbUpdateMenuData = handler;
}

// 认证提供器组件
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [pathPermissionMap, setPathPermissionMap] = useState<PathPermissionMap>(
    {}
  );

  // 用于防止重复请求的锁，使用useRef
  const isFetchingUserInfoRef = useRef(false);

  // 检查是否有权限
  const hasPermission = (permissionCode: string): boolean => {
    return permissions.includes(permissionCode);
  };

  // 检查是否有路径权限
  const hasPathPermission = (
    path: string,
    action: string = "view"
  ): boolean => {
    // 1. 精确匹配路径
    if (pathPermissionMap[path]) {
      const pathPerms = pathPermissionMap[path];

      // 如果有特定操作的权限要求，检查它
      if (pathPerms.actions[action] && pathPerms.actions[action].length > 0) {
        return pathPerms.actions[action].some((perm) => hasPermission(perm));
      }

      // 否则检查路径的所有所需权限
      return pathPerms.requiredPermissions.some((perm) => hasPermission(perm));
    }

    // 2. 如果没有精确匹配，尝试匹配父路径
    const segments = path.split("/").filter(Boolean);
    for (let i = segments.length - 1; i >= 0; i--) {
      const partialPath = "/" + segments.slice(0, i + 1).join("/");
      if (pathPermissionMap[partialPath]) {
        const pathPerms = pathPermissionMap[partialPath];

        // 如果有特定操作的权限要求，检查它
        if (pathPerms.actions[action] && pathPerms.actions[action].length > 0) {
          return pathPerms.actions[action].some((perm) => hasPermission(perm));
        }

        // 否则检查路径的所有所需权限
        return pathPerms.requiredPermissions.some((perm) =>
          hasPermission(perm)
        );
      }
    }

    // 3. 如果路径映射中没有找到，生成一个可能的权限代码
    if (segments.length > 0) {
      const resource = segments[0];
      const possiblePermissions = [
        `${resource}:manage`,
        `${resource}:${action}`,
        `${resource}:view`,
      ];
      return possiblePermissions.some((perm) => hasPermission(perm));
    }

    // 默认允许访问
    return true;
  };

  // 根据菜单和权限构建路径权限映射
  const buildPathPermissionMap = (menus: Menu[], permissions: string[]) => {
    const pathMap: PathPermissionMap = {};

    // 递归处理菜单树
    const processMenu = (menu: Menu) => {
      if (menu.path) {
        // 初始化路径映射
        pathMap[menu.path] = {
          requiredPermissions: [],
          actions: {
            view: [],
            add: [],
            edit: [],
            delete: [],
          },
        };

        // 找出此菜单路径相关的权限
        const menuPath = menu.path.replace(/^\//, "").replace(/\//g, ":");
        const menuPermissions = permissions.filter(
          (p) =>
            p &&
            typeof p === "string" &&
            (p.startsWith(menuPath) || p.includes(menuPath))
        );

        // 按操作类型分类权限
        pathMap[menu.path].requiredPermissions = menuPermissions.filter(
          (p) =>
            p &&
            typeof p === "string" &&
            (p.includes(":view") || p.endsWith(":manage"))
        );
        pathMap[menu.path].actions.view = menuPermissions.filter(
          (p) =>
            p &&
            typeof p === "string" &&
            (p.includes(":view") || p.endsWith(":manage"))
        );
        pathMap[menu.path].actions.add = menuPermissions.filter(
          (p) =>
            p &&
            typeof p === "string" &&
            (p.includes(":add") || p.endsWith(":manage"))
        );
        pathMap[menu.path].actions.edit = menuPermissions.filter(
          (p) =>
            p &&
            typeof p === "string" &&
            (p.includes(":edit") || p.endsWith(":manage"))
        );
        pathMap[menu.path].actions.delete = menuPermissions.filter(
          (p) =>
            p &&
            typeof p === "string" &&
            (p.includes(":delete") || p.endsWith(":manage"))
        );
      }

      // 处理子菜单
      if (menu.children) {
        menu.children.forEach(processMenu);
      }
    };

    // 处理所有菜单
    menus.forEach(processMenu);
    return pathMap;
  };

  // 获取用户详细信息（菜单和权限）
  const fetchUserInfo = React.useCallback(async () => {
    if (isFetchingUserInfoRef.current) {
      console.log("已经在获取用户信息中，跳过重复请求");
      return true;
    }

    const { setUserInfoRequestStatus } = await import("@/lib/axios");

    try {
      isFetchingUserInfoRef.current = true;
      setUserInfoRequestStatus(true);

      console.log("开始获取用户信息...");
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("无法获取用户信息: 缺少访问令牌");
        return false;
      }

      const userInfo = await getUserInfoApi();

      if (!userInfo || !userInfo.user) {
        console.error("获取的用户信息不完整");
        return false;
      }

      setUser(userInfo.user as unknown as User);

      // 合并静态菜单和动态菜单
      const userMenus: Menu[] = Array.isArray(userInfo.menus)
        ? userInfo.menus
        : [];
      const mergedMenus = [...STATIC_MENUS, ...userMenus];
      setMenus(mergedMenus);

      // 确保permissions是字符串数组
      let userPermissions: string[] = [];
      if (Array.isArray(userInfo.permissions)) {
        userPermissions = userInfo.permissions
          .map((p: Permission | string) => {
            if (typeof p === "string") return p;
            if (p && typeof p === "object" && "code" in p) return p.code;
            return "";
          })
          .filter(Boolean);
      }
      setPermissions(userPermissions);

      // 确保roles是数组
      const userRoles = Array.isArray(userInfo.roles) ? userInfo.roles : [];
      setRoles(userRoles);

      // 构建路径权限映射
      if (mergedMenus.length > 0 && userPermissions.length > 0) {
        const permissionMap = buildPathPermissionMap(
          mergedMenus,
          userPermissions
        );
        setPathPermissionMap(permissionMap);
      }

      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("获取用户信息失败:", error);
      // 只在需要时才重置状态，避免不必要的重定向
      if (error && typeof error === "object") {
        const err = error as Record<string, unknown>;
        // 只有在真正的401错误时才重置认证状态
        if (
          err.response &&
          typeof err.response === "object" &&
          (err.response as Record<string, unknown>).status === 401
        ) {
          setIsAuthenticated(false);
          setUser(null);
          setMenus([]);
          setPermissions([]);
          setRoles([]);
          setPathPermissionMap({});
        } else {
          // 对于其他类型的错误（比如网络错误），保持之前的认证状态
          console.log("保持现有认证状态，避免因临时错误导致重定向");
        }
      }
      return false;
    } finally {
      isFetchingUserInfoRef.current = false;
      setUserInfoRequestStatus(false); // 用户信息请求结束
    }
  }, []);

  // 初始化时检查是否已登录
  useEffect(() => {
    // 定义一个初始化认证的函数
    const initializeAuth = async () => {
      // 增加超时保护，延长超时时间
      const timeoutPromise = new Promise(
        (_, reject) =>
          setTimeout(() => reject(new Error("获取用户信息超时")), 20000) // 增加到20秒
      );

      const accessToken = localStorage.getItem("accessToken");
      console.log("初始化认证，检查令牌:", accessToken ? "存在" : "不存在");

      // 检查当前路径，如果已经在登录页则不尝试获取用户信息
      const isLoginPage =
        typeof window !== "undefined" &&
        window.location.pathname.includes("/login");

      if (accessToken && !isLoginPage) {
        try {
          // 有token，获取用户信息（带超时保护）
          await Promise.race([fetchUserInfo(), timeoutPromise]);
        } catch (error) {
          console.error("初始化认证失败:", error);

          // 只在确定是认证失败的情况下才清理状态
          const isAuthError =
            error.message === "获取用户信息超时" ||
            (error.response && error.response.status === 401);

          if (isAuthError) {
            setIsAuthenticated(false);
            setUser(null);
            // 清除无效令牌
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          } else {
            // 对于网络错误等暂时性问题，不要立即认为用户未认证
            console.log("保持当前认证状态，避免因临时错误导致重定向");
          }
        }
      } else {
        // 没有token或已在登录页，认为用户未登录
        setIsAuthenticated(false);
        setUser(null);
        setMenus([]);
        setPermissions([]);
        setRoles([]);
      }

      // 无论有没有token，都设置加载完成
      setIsLoading(false);
    };

    // 初始化认证状态
    initializeAuth();
  }, [fetchUserInfo]);

  // 重置loading状态的方法
  const resetLoading = () => {
    setIsLoading(false);
  };

  // 登录方法
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      // 调用登录API
      const response = await loginApi(username, password);

      // 安全记录令牌信息，防止undefined错误
      console.log("登录响应获取到:", response ? "成功" : "失败");

      // 保存token到本地存储 - 确保不含Bearer前缀
      if (response && response.accessToken) {
        // 先保存token到本地存储
        localStorage.setItem("accessToken", response.accessToken);

        if (response.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken);
        }

        // 立即设置用户基本信息（如果API返回了）
        if (response.user) {
          setUser(response.user);
        }

        // 同步更新认证状态为true
        setIsAuthenticated(true);
        console.log("已设置认证状态为true");

        // 获取用户详细信息（菜单和权限）
        try {
          const success = await fetchUserInfo();
          // 登录成功后重置loading状态
          setIsLoading(false);
          return success;
        } catch (error) {
          // 即使获取用户详情失败，只要我们有token，就认为登录成功
          console.error("获取用户详情失败，但登录仍然有效:", error);
          setIsLoading(false);
          return true;
        }
      } else {
        console.error("登录响应中缺少token数据");
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("登录失败:", error);
      setIsLoading(false);
      return false;
    }
  };

  // 登出方法
  const logout = () => {
    // 清除本地存储和状态
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
    setMenus([]);
    setPermissions([]);
    setRoles([]);
    showMessage.success("已安全退出系统");
  };

  // 当menus状态更新时，更新面包屑菜单数据
  useEffect(() => {
    if (breadcrumbUpdateMenuData && Array.isArray(menus) && menus.length > 0) {
      try {
        breadcrumbUpdateMenuData(menus);
      } catch (error) {
        console.error("更新面包屑菜单数据失败:", error);
      }
    }
  }, [menus]);

  // 返回上下文提供器和子组件
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        menus,
        permissions,
        roles,
        pathPermissionMap,
        hasPermission,
        hasPathPermission,
        resetLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 自定义hook，方便在组件中使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth必须在AuthProvider内部使用");
  }
  return context;
};
