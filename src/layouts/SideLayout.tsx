"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, theme, Button } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import type { LayoutProps } from "@/types";
import Logo from "@/components/common/Logo";
import UserInfo from "@/components/user/UserInfo";
import FullscreenButton from "@/components/common/FullscreenButton";
import { menuItems } from "@/components/layouts/constants";
import StaticLoadingPlaceholder from "@/components/common/StaticLoadingPlaceholder";
import BreadcrumbHandler from "@/components/layouts/BreadcrumbHandler";
import { getBaseStyles } from "@/styles/layoutStyles";
import { getMenuStyles, getSiderScrollStyles } from "@/styles/menuStyles";
import { isDarkMode } from "@/styles/themeUtils";

const { Header, Content, Sider } = Layout;

const SideLayout: React.FC<LayoutProps> = ({
  children,
  collapsed,
  setCollapsed,
  onLayoutPreviewOpen,
}) => {
  const { token } = theme.useToken();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          msOverflowStyle: "none", /* IE and Edge */
          scrollbarWidth: "none", /* Firefox */
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
            defaultSelectedKeys={["home"]}
            items={menuItems}
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
      </Layout>
    </Layout>
  );
};

export default SideLayout;
