"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, theme, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import type { LayoutProps } from "@/types";
import Logo from "@/components/common/Logo";
import UserInfo from "@/components/user/UserInfo";
import FullscreenButton from "@/components/common/FullscreenButton";
import { defaultMenuItems } from "@/routes/constants";
import StaticLoadingPlaceholder from "@/components/common/StaticLoadingPlaceholder";
import BreadcrumbHandler from "@/components/layouts/BreadcrumbHandler";
import { getBaseStyles } from "@/styles/layoutStyles";
import { getMenuStyles, getSiderScrollStyles } from "@/styles/menuStyles";
import { isDarkMode } from "@/styles/themeUtils";
import { useRouter, usePathname } from "next/navigation";
import { isExternal, resolvePath } from "@/routes/router-utils";

const { Header, Content, Sider } = Layout;

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

  useEffect(() => {
    setMounted(true);
  }, []);

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
            items={defaultMenuItems}
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

        {/* 基于历史导航的面包屑 */}
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
            marginTop: 20, // 固定间距
          }}
        >
          <Content
            style={{
              ...styles.content,
              background: token.colorBgContainer,
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

export default SideLayout;
