import React from "react";
import { MenuProps } from "antd";
import {
  HomeOutlined,
  AppstoreOutlined,
  SettingOutlined,
  TeamOutlined,
  ShopOutlined,
  FileOutlined,
  AreaChartOutlined,
  DashboardOutlined,
  CodeOutlined,
  DatabaseOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import Link from 'next/link';

// 重新定义菜单项，使用Link组件添加路由链接
export const menuItems: MenuProps["items"] = [
  {
    key: "home",
    icon: <HomeOutlined />,
    label: <Link href="/">首页</Link>,
  },
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: "仪表盘",
    children: [
      {
        key: "analytics",
        label: <Link href="/dashboard/analytics">数据分析</Link>,
        icon: <AreaChartOutlined />,
      },
      {
        key: "workspace",
        label: <Link href="/dashboard/workspace">工作台</Link>,
        icon: <AppstoreOutlined />,
      },
    ],
  },
  {
    key: "apps",
    icon: <AppstoreOutlined />,
    label: "应用管理",
    children: [
      {
        key: "app-store",
        label: <Link href="/apps/app-store">应用市场</Link>,
        icon: <ShoppingOutlined />,
      },
      {
        key: "my-apps",
        label: <Link href="/apps/my-apps">我的应用</Link>,
        icon: <AppstoreOutlined />,
      },
    ],
  },
  {
    key: "content",
    icon: <FileOutlined />,
    label: "内容管理",
    children: [
      {
        key: "articles",
        label: <Link href="/content/articles">文章管理</Link>,
        icon: <FileOutlined />,
      },
      {
        key: "comments",
        label: <Link href="/content/comments">评论管理</Link>,
        icon: <MessageOutlined />,
      },
    ],
  },
  {
    key: "users",
    icon: <TeamOutlined />,
    label: <Link href="/users">用户管理</Link>,
  },
  {
    key: "e-commerce",
    icon: <ShopOutlined />,
    label: "电子商务",
    children: [
      {
        key: "products",
        label: <Link href="/e-commerce/products">商品管理</Link>,
        icon: <ShoppingOutlined />,
      },
      {
        key: "orders",
        label: <Link href="/e-commerce/orders">订单管理</Link>,
        icon: <OrderedListOutlined />,
      },
    ],
  },
  {
    key: "system",
    icon: <DatabaseOutlined />,
    label: <Link href="/system">系统运维</Link>,
  },
  {
    key: "dev-tools",
    icon: <CodeOutlined />,
    label: <Link href="/dev-tools">开发工具</Link>,
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: <Link href="/settings">系统设置</Link>,
  },
  {
    key: "about",
    icon: <QuestionCircleOutlined />,
    label: <Link href="/about">关于我们</Link>,
  },
];
