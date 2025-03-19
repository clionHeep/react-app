"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, Breadcrumb, theme, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, CloseOutlined } from "@ant-design/icons";
import Link from "next/link";
import type { LayoutProps } from "@/types";
import Logo from "@/components/common/Logo";
import UserInfo from "@/components/user/UserInfo";
import FullscreenButton from "@/components/common/FullscreenButton";
import { menuItems } from "@/components/layouts/constants";
import { useBreadcrumb } from "@/context/BreadcrumbContext";

const { Header, Content, Sider } = Layout;

// 使用纯HTML和内联样式的简单加载组件
const StaticLoadingPlaceholder = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
      }}
    >
      <div
        style={{
          padding: "12px 20px",
          fontSize: "14px",
          color: "#1890ff",
        }}
      >
        加载中...
      </div>
    </div>
  );
};

const CustomLayout: React.FC<LayoutProps> = ({
  children,
  collapsed,
  setCollapsed,
  onLayoutPreviewOpen,
}) => {
  const { token } = theme.useToken();
  const [mounted, setMounted] = useState(false);
  // 使用面包屑上下文
  const { breadcrumbs, removeBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 格式化面包屑项为Ant Design所需的格式
  const formatBreadcrumbItems = () => {
    return breadcrumbs.map((item, index) => {
      // 最后一项只显示文本，没有链接
      if (index === breadcrumbs.length - 1) {
        return {
          title: item.title
        };
      }
      
      // 首页不显示删除按钮
      if (item.key === 'home') {
        return {
          title: <Link href={item.path}>{item.title}</Link>
        };
      }
      
      // 其他项，添加链接和删除按钮
      return {
        title: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Link href={item.path}>{item.title}</Link>
            <CloseOutlined 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeBreadcrumb(item.key);
              }}
              style={{ 
                fontSize: '10px', 
                cursor: 'pointer',
                color: '#999',
                marginLeft: '4px'
              }}
            />
          </div>
        )
      };
    });
  };

  // 如果未挂载，显示静态加载占位符
  if (!mounted) {
    return <StaticLoadingPlaceholder />;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          padding: "0 24px",
          height: 64,
          lineHeight: "64px",
          background: token.colorBgContainer,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          position: "fixed" as const,
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", padding: "16px" }}>
          <Logo collapsed={collapsed} />
        </div>
        <div
          style={{ display: "flex", alignItems: "center", gap: 16, height: 64 }}
        >
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
          position: "fixed" as const,
          top: 64,
          left: 0,
          right: collapsed ? 80 : 200,
          zIndex: 995,
          padding: "20px 24px 20px", // 增加垂直间距
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorder}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
          transition: "right 0.2s",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Breadcrumb items={formatBreadcrumbItems()} style={{ fontSize: 14 }} />
      </div>
      
      <Layout>
        <Layout
          style={{
            padding: "0 24px 24px",
            marginTop: 140, // 固定间距
            marginRight: collapsed ? 80 : 200,
            transition: "margin-right 0.2s",
          }}
        >
          <Content
            style={{
              background: token.colorBgContainer,
              padding: 24,
              borderRadius: 8,
              minHeight: "calc(100vh - 184px)",
              fontSize: 14,
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
            background: token.colorBgContainer,
            fontSize: 14,
            position: "fixed" as const,
            right: 0,
            top: 64,
            height: "calc(100vh - 64px)",
            zIndex: 990,
          }}
          width={200}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={["home"]}
            items={menuItems}
            style={{
              borderLeft: "none",
              height: "calc(100vh - 64px)",
              minHeight: "calc(100vh - 64px)",
              maxHeight: "calc(100vh - 64px)",
              background: "transparent",
            }}
            className="fixed-menu-items"
          />
        </Sider>
      </Layout>
    </Layout>
  );
};

export default CustomLayout;
