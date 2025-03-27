"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, theme, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import type { LayoutProps } from "@/types";
import Logo from "@/components/common/Logo";
import UserInfo from "@/components/user/UserInfo";
import FullscreenButton from "@/components/common/FullscreenButton";
import { useAuth } from '@/context/AuthContext';
import { getMenuIcon } from '@/routes/constants';
import StaticLoadingPlaceholder from "@/components/common/StaticLoadingPlaceholder";
import BreadcrumbHandler from "@/components/layouts/BreadcrumbHandler";
import { getBaseStyles } from "@/styles/layoutStyles";
import { getMenuStyles, getSiderScrollStyles } from "@/styles/menuStyles";
import { isDarkMode } from "@/styles/themeUtils";
import { useRouter, usePathname } from "next/navigation";
import { isExternal, resolvePath } from "@/routes/router-utils";

const { Header, Content, Sider } = Layout;

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

const SideLayout: React.FC<LayoutProps> = ({
  children,
  collapsed,
  setCollapsed,
  onLayoutPreviewOpen,
}) => {
  const { token } = theme.useToken();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { menus } = useAuth();
  const [menuItems, setMenuItems] = useState<AntMenuItemType[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMenuClick = ({ key }: { key: string }) => {
    if (isExternal(key)) {
      window.open(key, '_blank');
      return;
    }
    
    const result = resolvePath(key);
    
    if (typeof result === 'string') {
      router.push(result, { scroll: true });
    } else {
      const { path, query } = result;
      
      const queryString = new URLSearchParams(query).toString();
      const url = queryString ? `${path}?${queryString}` : path;
      
      router.push(url, { scroll: true });
    }
  };

  const generateMenuItems = (menuItems: MenuItemType[]) => {
    console.log('[SideLayout] 生成菜单项，菜单数据:', menuItems);
    
    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
      console.warn('[SideLayout] 菜单数据为空或格式不正确');
      return [];
    }
    
    return menuItems
      .filter(item => !item.hidden)
      .map(item => {
        const hasChildren = item.children && item.children.length > 0;
        
        console.log(`[SideLayout] 处理菜单项: ${item.name}, 路径: ${item.path || '未指定'}`);
        
        if (hasChildren) {
          return {
            key: item.path || `menu-${item.id}`,
            icon: getMenuIcon(item.icon || ""),
            label: item.name,
            children: generateMenuItems(item.children),
          };
        }
        
        return {
          key: item.path || `menu-${item.id}`,
          icon: getMenuIcon(item.icon || ""),
          label: item.name,
        };
      });
  };

  useEffect(() => {
    console.log('[SideLayout] === 菜单数据更新 ===');
    console.log('[SideLayout] 菜单数据原始值:', menus);
    
    if (menus && Array.isArray(menus) && menus.length > 0) {
      try {
        const items = generateMenuItems(menus as unknown as MenuItemType[]);
        console.log('[SideLayout] 生成的菜单项:', items);
        setMenuItems(items);
      } catch (error) {
        console.error('[SideLayout] 处理菜单数据时出错:', error);
        console.warn('[SideLayout] 使用空菜单');
        setMenuItems([]);
      }
    } else {
      console.warn('[SideLayout] 警告: 无菜单数据或格式不正确');
      console.log('[SideLayout] menus类型:', typeof menus);
      console.log('[SideLayout] 是否为数组:', Array.isArray(menus));
      console.log('[SideLayout] 数组长度:', Array.isArray(menus) ? menus.length : '非数组');
      setMenuItems([]);
    }
  }, [menus]);

  if (!mounted) {
    return <StaticLoadingPlaceholder />;
  }

  const styles = getBaseStyles(token);

  return (
    <Layout style={styles.layout}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: "hidden",
          height: "100vh",
          position: "fixed",
          left: 0,
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
              borderRight: "none",
              background: "transparent",
            }}
            className="fixed-menu-items"
          />
        </div>
      </Sider>
      <Layout
        style={{ marginLeft: collapsed ? 80 : 200, transition: "all 0.2s" }}
      >
        <Header
          style={{
            ...styles.header,
            left: collapsed ? 80 : 200,
            transition: "left 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: "16px" }}
            />
          </div>
          <div style={styles.container}>
            <FullscreenButton />
            <UserInfo onLayoutClick={onLayoutPreviewOpen} />
          </div>
        </Header>

        <div
          style={{
            ...styles.breadcrumb,
            left: collapsed ? 80 : 200,
            transition: "left 0.2s",
          }}
        >
          <BreadcrumbHandler />
        </div>

        <Layout
          style={{
            padding: "0 24px 24px",
            marginTop: 20,
          }}
        >
          <Content
            style={{
              ...styles.content,
              background: token.colorBgContainer,
              borderRadius: 8,
              minHeight: "calc(100vh - 184px)",
              fontSize: 14,
              boxShadow: isDarkMode(token)
                ? "0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(255,255,255,0.05)"
                : "none",
              border: isDarkMode(token)
                ? "1px solid rgba(255, 255, 255, 0.15)"
                : "none",
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default SideLayout;
