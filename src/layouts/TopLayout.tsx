"use client";

import React, { useEffect, useState } from "react";
import { Layout, Menu, theme } from "antd";
import type { LayoutProps } from "@/types";
import Logo from "@/components/common/Logo";
import UserInfo from "@/components/user/UserInfo";
import FullscreenButton from "@/components/common/FullscreenButton";
import { menuItems } from "@/components/layouts/constants";
import StaticLoadingPlaceholder from "@/components/common/StaticLoadingPlaceholder";
import BreadcrumbHandler from "@/components/layouts/BreadcrumbHandler";
import { getBaseStyles } from "@/styles/layoutStyles";
import { getMenuStyles } from "@/styles/menuStyles";

const { Header, Content } = Layout;

const TopLayout: React.FC<LayoutProps> = ({
  children,
  collapsed,
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
      <Header style={styles.header}>
        <style>
          {getMenuStyles(token)}
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
          items={menuItems}
          style={styles.menu}
          className="fixed-menu-items"
        />
        <div style={styles.container}>
          <FullscreenButton />
          <UserInfo onLayoutClick={onLayoutPreviewOpen} />
        </div>
      </Header>

      {/* 基于历史导航的面包屑 */}
      <BreadcrumbHandler style={styles.breadcrumb} />

      <Content style={styles.content}>
        <div style={styles.innerContent}>{children}</div>
      </Content>
    </Layout>
  );
};

export default TopLayout;
