"use client";

import React, { useEffect, useState } from "react";
import { Layout, Menu, theme } from "antd";
import type { LayoutProps } from "@/types";
import Logo from "@/components/common/Logo";
import UserInfo from "@/components/user/UserInfo";
import FullscreenButton from "@/components/common/FullscreenButton";
import { useAuth } from '@/context/AuthContext';
import { getMenuIcon } from '@/routes/constants';
import StaticLoadingPlaceholder from "@/components/common/StaticLoadingPlaceholder";
import BreadcrumbHandler from "@/components/layouts/BreadcrumbHandler";
import { getBaseStyles } from "@/styles/layoutStyles";
import { getMenuStyles } from "@/styles/menuStyles";
import { useRouter, usePathname } from "next/navigation";
import { isExternal, resolvePath } from "@/routes/router-utils";

const { Header, Content } = Layout;

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

const TopLayout: React.FC<LayoutProps> = ({
  children,
  collapsed,
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

  const generateMenuItems = (menuItems: MenuItemType[]) => {
    console.log('[TopLayout] 生成菜单项，菜单数据:', menuItems);
    
    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
      console.warn('[TopLayout] 菜单数据为空或格式不正确');
      return [];
    }
    
    return menuItems
      .filter(item => !item.hidden)
      .map(item => {
        const hasChildren = item.children && item.children.length > 0;
        
        console.log(`[TopLayout] 处理菜单项: ${item.name}, 路径: ${item.path || '未指定'}`);
        
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
    console.log('[TopLayout] === 菜单数据更新 ===');
    console.log('[TopLayout] 菜单数据原始值:', menus);
    
    if (menus && Array.isArray(menus) && menus.length > 0) {
      try {
        const items = generateMenuItems(menus as unknown as MenuItemType[]);
        console.log('[TopLayout] 生成的菜单项:', items);
        setMenuItems(items);
      } catch (error) {
        console.error('[TopLayout] 处理菜单数据时出错:', error);
        console.warn('[TopLayout] 使用空菜单');
        setMenuItems([]);
      }
    } else {
      console.warn('[TopLayout] 警告: 无菜单数据或格式不正确');
      console.log('[TopLayout] menus类型:', typeof menus);
      console.log('[TopLayout] 是否为数组:', Array.isArray(menus));
      console.log('[TopLayout] 数组长度:', Array.isArray(menus) ? menus.length : '非数组');
      setMenuItems([]);
    }
  }, [menus]);

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

  if (!mounted) {
    return <StaticLoadingPlaceholder />;
  }

  const styles = getBaseStyles(token);

  return (
    <Layout style={styles.layout}>
      <Header style={styles.header}>
        <style>
          {`
          ${getMenuStyles(token)}
          
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
          style={{
            width: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: collapsed ? "16px 8px" : "0px",
          }}
        >
          <Logo collapsed={collapsed} />
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[pathname || '/']}
          items={menuItems}
          onClick={handleMenuClick}
          style={styles.menu}
          className="fixed-menu-items"
        />
        <div style={styles.container}>
          <FullscreenButton />
          <UserInfo onLayoutClick={onLayoutPreviewOpen} />
        </div>
      </Header>

      <BreadcrumbHandler style={styles.breadcrumb} />

      <Content style={styles.content}>
        <div style={styles.innerContent}>{children}</div>
      </Content>
    </Layout>
  );
};

export default TopLayout;
