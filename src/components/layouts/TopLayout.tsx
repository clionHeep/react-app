"use client";

import React, { useEffect, useState } from "react";
import { Layout, Menu, theme } from "antd";
import type { LayoutProps } from "@/types";
import Logo from "@/components/common/Logo";
import UserInfo from "@/components/user/UserInfo";
import FullscreenButton from "@/components/common/FullscreenButton";
import { defaultMenuItems } from "@/routes/constants";
import StaticLoadingPlaceholder from "@/components/common/StaticLoadingPlaceholder";
import BreadcrumbHandler from "@/components/layouts/BreadcrumbHandler";
import { getBaseStyles } from "@/styles/layoutStyles";
import { getMenuStyles } from "@/styles/menuStyles";
import { useRouter, usePathname } from "next/navigation";
import { isExternal, resolvePath } from "@/routes/router-utils";

const { Header, Content } = Layout;

const TopLayout: React.FC<LayoutProps> = ({
  children,
  collapsed,
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
          items={defaultMenuItems}
          onClick={handleMenuClick}
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
