import { ReactNode } from 'react';

// 布局类型
export type LayoutType = "top" | "side" | "mix" | "custom";

// 布局预览属性类型
export interface LayoutPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  currentLayout: LayoutType;
  onLayoutSelect: (layout: LayoutType) => void;
  currentThemeMode?: "light" | "dark" | "custom";
  currentCustomColor?: string;
  onThemeModeChange?: (mode: "light" | "dark" | "custom") => void;
  onCustomColorChange?: (color: string) => void;
}

// 布局组件属性类型
export interface LayoutProps {
  children: ReactNode;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  onLayoutPreviewOpen?: () => void;
}

/**
 * 菜单项类型定义
 */
export interface Menu {
  id: number;
  name: string;
  path?: string;
  icon?: string;
  sort?: number;
  parentId?: number;
  hidden?: boolean;
  children?: Menu[];
  component?: string;
}

/**
 * 权限类型定义
 */
export interface Permission {
  id: number;
  code: string;
  name: string;
  description?: string;
}

/**
 * 路径-权限映射类型
 */
export interface PathPermissionMap {
  [path: string]: {
    view: string[];
    add: string[];
    edit: string[];
    delete: string[];
  };
}

/**
 * 用户信息类型
 */
export interface UserInfo {
  id: number;
  username: string;
  name?: string;
  email?: string;
  phone?: string;
  status: string;
  avatar?: string;
  roles?: string;
  permissions?: string[];
}

/**
 * 角色类型
 */
export interface Role {
  id: number;
  name: string;
  description?: string;
  isSystem?: boolean;
} 