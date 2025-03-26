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