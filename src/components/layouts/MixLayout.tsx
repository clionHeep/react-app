"use client";

import React, { useEffect, useState } from "react";
import { Layout, Menu, theme, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
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
import { isExternal } from "@/routes/router-utils";

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

const MixLayout: React.FC<LayoutProps> = ({
  children,
  collapsed,
  setCollapsed,
  onLayoutPreviewOpen,
}) => {
  const { token } = theme.useToken();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // 添加后端API菜单获取和处理
  const { menus } = useAuth();
  
  // 当前选中的主菜单
  const [activeMainMenu, setActiveMainMenu] = useState<string | null>(null);
  // 当前菜单是否有子菜单
  const [hasSubMenu, setHasSubMenu] = useState<boolean>(false);
  // 当前选中的子菜单
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  // 主菜单项和子菜单项
  const [mainMenuItems, setMainMenuItems] = useState<AntMenuItemType[]>([]);
  const [subMenuItems, setSubMenuItems] = useState<AntMenuItemType[]>([]);

  // 仅在客户端执行此代码
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 从后端菜单数据生成菜单项
  const generateMenuItems = (menuItems: MenuItemType[]): AntMenuItemType[] => {
    console.log('[MixLayout] 生成菜单项，菜单数据:', menuItems);
    
    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
      console.warn('[MixLayout] 菜单数据为空或格式不正确');
      return [];
    }
    
    return menuItems
      .filter(item => !item.hidden) // 过滤掉隐藏的菜单项
      .map(item => {
        const hasChildren = item.children && item.children.length > 0;
        
        console.log(`[MixLayout] 处理菜单项: ${item.name}, 路径: ${item.path || '未指定'}`);
        
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

  // 当后端返回的菜单数据改变时，重新处理菜单
  useEffect(() => {
    console.log('[MixLayout] === 菜单数据更新 ===');
    console.log('[MixLayout] 菜单数据原始值:', menus);
    
    if (menus && Array.isArray(menus) && menus.length > 0) {
      try {
        // 生成主菜单项
        const items = generateMenuItems(menus as unknown as MenuItemType[]);
        console.log('[MixLayout] 生成的菜单项:', items);
        
        // 初始化主菜单和子菜单
        setMainMenuItems(items);
        
        // 设置默认选中的主菜单（如果没有当前选中的）
        if (!activeMainMenu && items && items.length > 0) {
          const firstMainMenu = items[0]?.key?.toString();
          if (firstMainMenu) {
            setActiveMainMenu(firstMainMenu);
            
            // 检查是否有子菜单
            const firstItem = items[0];
            const hasChildren = firstItem?.children && Array.isArray(firstItem.children) && firstItem.children.length > 0;
            setHasSubMenu(!!hasChildren);
            
            // 如果有子菜单，设置第一个子菜单为活动项
            if (hasChildren && firstItem.children) {
              const firstSubMenu = firstItem.children[0]?.key?.toString();
              if (firstSubMenu) {
                setActiveSubMenu(firstSubMenu);
                setSubMenuItems(firstItem.children);
              }
            }
          }
        }
      } catch (error) {
        console.error('[MixLayout] 处理菜单数据时出错:', error);
        console.warn('[MixLayout] 使用空菜单');
        setMainMenuItems([]);
        setSubMenuItems([]);
      }
    } else {
      console.warn('[MixLayout] 警告: 无菜单数据或格式不正确');
      console.log('[MixLayout] menus类型:', typeof menus);
      console.log('[MixLayout] 是否为数组:', Array.isArray(menus));
      console.log('[MixLayout] 数组长度:', Array.isArray(menus) ? menus.length : '非数组');
      setMainMenuItems([]);
      setSubMenuItems([]);
    }
  }, [menus, activeMainMenu]);

  // 处理主菜单点击
  const handleMainMenuClick = (info: { key: string }) => {
    const { key } = info;
    console.log('[MixLayout] 主菜单点击:', key);
    setActiveMainMenu(key);
    
    // 查找当前选中的主菜单项
    const selectedMainItem = mainMenuItems.find(item => item.key === key);
    
    // 检查是否有子菜单
    const hasChildren = selectedMainItem?.children && 
                         Array.isArray(selectedMainItem.children) && 
                         selectedMainItem.children.length > 0;
    
    setHasSubMenu(!!hasChildren);
    
    // 如果有子菜单，设置子菜单项并选中第一个
    if (hasChildren && selectedMainItem.children) {
      setSubMenuItems(selectedMainItem.children);
      
      // 选中第一个子菜单
      const firstSubMenu = selectedMainItem.children[0]?.key?.toString();
      if (firstSubMenu) {
        setActiveSubMenu(firstSubMenu);
        
        // 导航到第一个子菜单的路径
        const firstSubPath = selectedMainItem.children[0]?.key;
        if (firstSubPath && typeof firstSubPath === 'string') {
          if (isExternal(firstSubPath)) {
            window.open(firstSubPath, '_blank');
          } else {
            router.push(firstSubPath);
          }
        }
      }
    } else {
      // 没有子菜单，直接导航到主菜单路径
      setSubMenuItems([]);
      setActiveSubMenu(null);
      
      if (isExternal(key)) {
        window.open(key, '_blank');
      } else {
        router.push(key);
      }
    }
  };
  
  // 处理子菜单点击
  const handleSubMenuClick = (info: { key: string }) => {
    const { key } = info;
    console.log('[MixLayout] 子菜单点击:', key);
    setActiveSubMenu(key);
    
    // 导航到子菜单路径
    if (isExternal(key)) {
      window.open(key, '_blank');
    } else {
      router.push(key);
    }
  };

  // 如果未挂载，显示静态加载占位符
  if (!mounted) {
    return <StaticLoadingPlaceholder />;
  }

  // 获取基础样式
  const styles = getBaseStyles(token);

  // 调试：显示菜单数据结构
  console.log("[MixLayout] 菜单数据:", menus);

  // 只在客户端渲染实际布局
  return (
    <Layout style={styles.layout}>
      <Header style={styles.header}>
        <style>{getMenuStyles(token)}</style>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Logo collapsed={false} />
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={activeMainMenu ? [activeMainMenu] : []}
          items={mainMenuItems}
          onClick={handleMainMenuClick}
          style={styles.menu}
          className="fixed-menu-items"
          theme="light"
        />
        <div style={styles.container}>
          {hasSubMenu && (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: "16px" }}
            />
          )}
          <FullscreenButton />
          <UserInfo onLayoutClick={onLayoutPreviewOpen} />
        </div>
      </Header>

      <Layout
        style={{
          marginLeft: hasSubMenu ? (collapsed ? 80 : 200) : 0,
          transition: "all 0.2s",
        }}
      >
        {hasSubMenu && (
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
              `}
            </style>
            <div
              className="sider-logo"
          style={{
            display: "flex",
            alignItems: "center",
            padding: collapsed ? "16px 8px" : "16px",
                justifyContent: "center",
                height: 64,
          }}
        >
          <Logo collapsed={collapsed} />
        </div>
            <div className="menu-container">
        <Menu
          mode="inline"
                items={subMenuItems}
                selectedKeys={activeSubMenu ? [activeSubMenu] : []}
                onClick={handleSubMenuClick}
          style={{
            borderRight: "none",
            background: "transparent",
          }}
          className="fixed-menu-items"
                theme="light"
        />
            </div>
      </Sider>
        )}

        <div
          style={{
            ...styles.breadcrumb,
            left: hasSubMenu ? (collapsed ? 80 : 200) : 0,
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
              padding: 24,
              borderRadius: 8,
              minHeight: "calc(100vh - 184px)",
              fontSize: 14,
              // 增加深色模式下的阴影和边框以提高可见度
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

export default MixLayout;
