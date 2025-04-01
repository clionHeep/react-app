"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Layout, Menu, theme, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import type { LayoutProps } from "@/types";
import Logo from "@/components/common/Logo";
import UserInfo from "@/components/user/UserInfo";
import FullscreenButton from "@/components/common/FullscreenButton";
import * as Icons from '@ant-design/icons';
import type { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';
import StaticLoadingPlaceholder from "@/components/common/StaticLoadingPlaceholder";
import BreadcrumbHandler from "@/components/layouts/BreadcrumbHandler";
import { getBaseStyles } from "@/styles/layoutStyles";
import { getMenuStyles, getSiderScrollStyles } from "@/styles/menuStyles";
import { isDarkMode } from "@/styles/themeUtils";
import { useRouter, usePathname } from "next/navigation";
import { isExternal, resolvePath } from "@/routes/router-utils";
import { useAuth } from "@/context/AuthContext";

const { Header, Content, Sider } = Layout;

// 定义后端返回的菜单项类型
interface MenuItemType {
  id: number;
  name: string;
  path?: string;
  icon?: string;
  parentId?: number | null;
  children?: MenuItemType[];
  hidden?: boolean;
}

// 定义Ant Design Menu组件使用的菜单项类型
interface AntMenuItemType {
  key: string;
  icon?: React.ReactNode;
  label: string;
  children?: AntMenuItemType[];
}

// 获取图标组件
const getIconComponent = (iconName: string) => {
  if (!iconName) return null;
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<AntdIconProps>>)[iconName];
  return IconComponent ? <IconComponent /> : null;
};

const CustomLayout: React.FC<LayoutProps> = ({
  children,
  collapsed,
  setCollapsed,
  onLayoutPreviewOpen,
}) => {
  const { token } = theme.useToken();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { menus } = useAuth(); // 使用useAuth获取后端返回的菜单数据
  const [menuItems, setMenuItems] = useState<AntMenuItemType[]>([]);

  // 组件挂载时初始化
  useEffect(() => {
    setMounted(true);
  }, []);

  // 从后端菜单数据生成菜单项 - 使用useCallback包装
  const generateMenuItems = useCallback((items: MenuItemType[]): AntMenuItemType[] => {
    console.log('[CustomLayout] 生成菜单项，菜单数据:', items);
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.warn('[CustomLayout] 菜单数据为空或格式不正确');
      return [];
    }
    
    return items
      .filter(item => !item.hidden) // 过滤掉隐藏的菜单项
      .map(item => {
        const hasChildren = item.children && item.children.length > 0;
        
        console.log(`[CustomLayout] 处理菜单项: ${item.name}, 路径: ${item.path || '未指定'}`);
        
        if (hasChildren) {
          return {
            key: item.path,
            icon: getIconComponent(item.icon || ""),
            label: item.name,
            children: generateMenuItems(item.children),
          };
        }
        
        return {
          key: item.path,
          icon: getIconComponent(item.icon || ""),
          label: item.name,
        };
      });
  }, []);

  // 当后端返回的菜单数据改变时，重新生成菜单项
  useEffect(() => {
    const processMenuData = () => {
      console.log('[CustomLayout] === 菜单数据更新 ===');
      console.log('[CustomLayout] 菜单数据原始值:', menus);
      
      if (menus && Array.isArray(menus) && menus.length > 0) {
        try {
          // 将后端返回的菜单数据映射为菜单项
          const items = generateMenuItems(menus as unknown as MenuItemType[]);
          console.log('[CustomLayout] 生成的菜单项:', items);
          setMenuItems(items);
        } catch (error) {
          console.error('[CustomLayout] 处理菜单数据时出错:', error);
          console.warn('[CustomLayout] 使用空菜单');
          setMenuItems([]);
        }
      } else {
        console.warn('[CustomLayout] 警告: 无菜单数据或格式不正确');
        console.log('[CustomLayout] menus类型:', typeof menus);
        console.log('[CustomLayout] 是否为数组:', Array.isArray(menus));
        console.log('[CustomLayout] 数组长度:', Array.isArray(menus) ? menus.length : '非数组');
        setMenuItems([]);
      }
    };
    
    processMenuData();
  }, [menus, generateMenuItems]); // 添加generateMenuItems作为依赖

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    // 外部链接，使用window.open打开
    if (isExternal(key)) {
      window.open(key, '_blank');
      return;
    }
    
    // 内部路径，使用Next.js 15 App Router导航
    const result = resolvePath(key);
    
    if (typeof result === 'string') {
      // Next.js 15优化：使用router.push进行导航，默认支持无需刷新的客户端导航
      router.push(result, { scroll: true });
    } else {
      // 使用对象形式传递查询参数 (Next.js 15支持)
      const { path, query } = result;
      
      // 构建查询字符串
      const queryString = new URLSearchParams(query).toString();
      const url = queryString ? `${path}?${queryString}` : path;
      
      // 带滚动行为的导航
      router.push(url, { scroll: true });
    }
  };

  // 如果未挂载，显示静态加载占位符
  if (!mounted) {
    return <StaticLoadingPlaceholder />;
  }

  // 获取基础样式
  const styles = getBaseStyles(token);

  return (
    <Layout style={styles.layout}>
      <Header
        style={{
          ...styles.header,
          width: "100%",
        }}
      >
        <style>{getMenuStyles(token)}</style>
        <div style={{ display: "flex", alignItems: "center", padding: "16px" }}>
          <Logo collapsed={collapsed} />
        </div>
        <div style={styles.container}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", marginLeft: 8 }}
          />
          <FullscreenButton />
          <UserInfo onLayoutClick={onLayoutPreviewOpen} />
        </div>
      </Header>

      {/* 基于历史导航的面包屑 */}
      <div
        style={{
          ...styles.breadcrumb,
          right: collapsed ? 80 : 200,
          transition: "right 0.2s",
        }}
      >
        <BreadcrumbHandler />
      </div>

      <Layout>
        <Layout
          style={{
            padding: "0 24px 24px",
            marginTop: 20, // 固定间距
            marginRight: collapsed ? 80 : 200,
            transition: "margin-right 0.2s",
          }}
        >
          <Content
            style={{
              ...styles.content,
              background: token.colorBgContainer,
              padding: 24,
              borderRadius: 8,
              minHeight: "calc(100vh - 184px)",
              fontSize: 14,
              boxShadow: isDarkMode(token) 
                ? '0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(255,255,255,0.05)'
                : 'none',
              border: isDarkMode(token)
                ? '1px solid rgba(255, 255, 255, 0.15)'
                : 'none',
            }}
          >
            {children}
          </Content>
        </Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            overflow: "hidden",
            height: "100vh",
            position: "fixed",
            right: 0,
            top: 0,
            bottom: 0,
            background: token.colorBgContainer,
            fontSize: 14,
            msOverflowStyle: "none" /* IE and Edge */,
            scrollbarWidth: "none" /* Firefox */,
          }}
          width={200}
        >
          <style>
            {`
            ${getMenuStyles(token)}
            ${getSiderScrollStyles(token)}
            
            /* 自定义菜单样式 */
            .external-link {
              color: ${token.colorPrimary} !important;
              font-style: italic;
            }
            /* 如果想覆盖Ant Design的danger样式 */
            :where(.css-dev-only-do-not-override-1md480f).ant-menu-light .ant-menu-item-danger,
            :where(.css-dev-only-do-not-override-1md480f).ant-menu-light>.ant-menu .ant-menu-item-danger {
              color: ${token.colorPrimary} !important; /* 使用主题色替代红色 */
            }
            `}
          </style>
          <div
            className="sider-logo"
            style={{
              height: 64,
              display: "flex",
              alignItems: "center",
              padding: collapsed ? "16px 8px" : "16px",
              justifyContent: "center",
            }}
          >
            <Logo collapsed={collapsed} />
          </div>
          <div className="menu-container">
            <Menu
              mode="inline"
              selectedKeys={[pathname || '/']}
              items={menuItems}
              onClick={handleMenuClick}
              style={{
                borderLeft: "none",
                background: "transparent",
              }}
              className="fixed-menu-items"
              theme="light"
            />
          </div>
        </Sider>
      </Layout>
    </Layout>
  );
};

export default CustomLayout;
