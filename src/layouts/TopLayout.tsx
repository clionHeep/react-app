'use client';

import React, { useEffect, useState } from "react";
import { Layout, Menu, Breadcrumb, theme } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import Link from "next/link";
import type { LayoutProps } from "@/types";
import Logo from "@/components/common/Logo";
import UserInfo from "@/components/user/UserInfo";
import FullscreenButton from "@/components/common/FullscreenButton";
import { menuItems } from "@/components/layouts/constants";
import { useBreadcrumb } from "@/context/BreadcrumbContext";

const { Header, Content } = Layout;

// 使用纯HTML和内联样式的简单加载组件
const StaticLoadingPlaceholder = () => {
  return (
    <div 
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5'
      }}
    >
      <div style={{
        padding: '12px 20px',
        fontSize: '14px',
        color: '#1890ff'
      }}>
        加载中...
      </div>
    </div>
  );
};

const TopLayout: React.FC<LayoutProps> = ({
  children,
  collapsed,
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

  // 初始静态样式
  const baseStyles = {
    layout: { minHeight: "100vh" },
    header: {
      padding: "0 24px",
      height: 64,
      lineHeight: "64px",
      background: "#141414", // 暗色主题默认背景
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000
    },
    breadcrumb: {
      position: "fixed" as const,
      top: 64,
      left: 0,
      right: 0,
      zIndex: 995,
      padding: "20px 50px 20px", // 增加垂直间距
      background: "#fff",
      borderBottom: "1px solid #f0f0f0",
      boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    menu: {
      flex: 1,
      marginLeft: 40,
      height: 64,
      minHeight: 64,
      maxHeight: 64,
      background: "transparent",
      borderBottom: "none",
    },
    container: {
      display: "flex", 
      alignItems: "center", 
      gap: 8, 
      height: 64
    },
    content: {
      padding: "0 50px", 
      marginTop: 140 // 固定间距，因为面包屑总是存在
    },
    innerContent: {
      background: "#fff",
      padding: 24,
      minHeight: 280,
      borderRadius: 6,
    }
  };

  // 客户端渲染后使用主题token
  const styles = {
    ...baseStyles,
    header: {
      ...baseStyles.header,
      background: token.colorBgContainer,
    },
    breadcrumb: {
      ...baseStyles.breadcrumb,
      background: token.colorBgContainer,
      borderBottom: `1px solid ${token.colorBorder}`,
    },
    innerContent: {
      ...baseStyles.innerContent,
      background: token.colorBgContainer,
      borderRadius: token.borderRadiusLG,
    }
  };

  return (
    <Layout style={styles.layout}>
      <Header
        style={styles.header}
      >
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            padding: collapsed ? "16px 8px" : "16px"
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
        <div
          style={styles.container}
        >
          <FullscreenButton />
          <UserInfo onLayoutClick={onLayoutPreviewOpen} />
        </div>
      </Header>
      
      {/* 基于历史导航的面包屑 */}
      <div style={styles.breadcrumb}>
        <Breadcrumb items={formatBreadcrumbItems()} />
      </div>
      
      <Content style={styles.content}>
        <div style={styles.innerContent}>
          {children}
        </div>
      </Content>
    </Layout>
  );
};

export default TopLayout;
