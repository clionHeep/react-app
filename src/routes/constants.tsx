import React from "react";
import { MenuProps } from "antd";
import * as Icons from '@ant-design/icons';
import type { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';
import {
  HomeOutlined,
  AppstoreOutlined,
  SettingOutlined,
  TeamOutlined,
  AreaChartOutlined,
  DashboardOutlined,
  QuestionCircleOutlined,
  GlobalOutlined,
  MenuOutlined,
} from "@ant-design/icons";

// 获取图标组件
const getIconComponent = (iconName: string) => {
  if (!iconName) return null;
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<AntdIconProps>>)[iconName];
  return IconComponent ? <IconComponent /> : null;
};

/**
 * 获取菜单图标
 * @param iconName 图标名称
 * @returns 图标组件
 */
export const getMenuIcon = (iconName: string): React.ReactNode => {
  if (!iconName) return <MenuOutlined />; // 默认图标
  return getIconComponent(iconName.toLowerCase()) || <MenuOutlined />;
};

/**
 * 菜单对象接口
 */
export interface MenuItemType {
  id: number;
  parentId: number | null;
  name: string;
  path: string;
  component?: string;
  icon?: string;
  sort?: number;
  children?: MenuItemType[];
  isHidden?: boolean;
  permission?: string;
  type?: string;
}

/**
 * 构建菜单树
 * @param menuList 菜单列表
 * @returns 树形结构的菜单
 */
export const buildMenuTree = (menuList: MenuItemType[]): MenuItemType[] => {
  // 创建一个对象存储所有菜单项，以ID为键
  const menuMap = new Map<number, MenuItemType>();
  menuList.forEach((menu) => {
    // 确保每个菜单项都有children属性
    menu.children = [];
    menuMap.set(menu.id, menu);
  });

  // 构建树形结构
  const rootMenus: MenuItemType[] = [];
  menuList.forEach((menu) => {
    // 如果有父ID且父ID在menuMap中存在
    if (menu.parentId !== null && menuMap.has(menu.parentId)) {
      const parent = menuMap.get(menu.parentId);
      parent!.children!.push(menu);
    } else {
      // 没有父ID或父ID不存在，作为根菜单
      rootMenus.push(menu);
    }
  });

  // 按照sort排序
  const sortMenus = (menus: MenuItemType[]) => {
    menus.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    menus.forEach((menu) => {
      if (menu.children && menu.children.length > 0) {
        sortMenus(menu.children);
      }
    });
  };

  sortMenus(rootMenus);
  return rootMenus;
};

// 在文件顶部添加新的类型定义
export interface RouteComponentProps {
  [key: string]: unknown;
}

// 修改 RouteConfig 接口中的 component 类型
export interface RouteConfig {
  path: string;
  component: React.ComponentType<RouteComponentProps> | null;
  exact?: boolean;
  name: string;  // 路由名称，用作唯一标识
  routeName?: string; // 可选的路由键名，用于命名路由导航，默认与name相同
  icon?: React.ReactNode;
  children?: RouteConfig[];
  auth?: boolean;
  hidden?: boolean;
  isExternal?: boolean; // 是否为外部链接
  target?: '_blank' | '_self' | '_parent' | '_top'; // 链接打开方式
}

// 创建一个通用页面组件，用于临时替代缺少的页面
const StubPage: React.FC<RouteComponentProps> = ({ title = "页面开发中" }) => (
  <div style={{ padding: "20px", textAlign: "center" }}>
    <h1>{typeof title === "string" ? title : "页面开发中"}</h1>
    <p>此页面正在开发中，敬请期待</p>
  </div>
);

// 路由配置
export const routes: RouteConfig[] = [
  {
    path: "/",
    component: StubPage,
    name: "首页",
    routeName: "home",
    icon: <HomeOutlined />,
    exact: true,
  },
  {
    path: "/dashboard",
    name: "仪表盘",
    routeName: "dashboard",
    icon: <DashboardOutlined />,
    component: null,
    children: [
      {
        path: "/dashboard/analytics",
        component: StubPage,
        name: "数据分析",
        routeName: "dashboard.analytics",
        icon: <AreaChartOutlined />,
      },
      {
        path: "/dashboard/workspace",
        component: StubPage,
        name: "工作台",
        routeName: "dashboard.workspace",
        icon: <AppstoreOutlined />,
      },
    ],
  },
  {
    path: "/users",
    component: StubPage,
    name: "用户管理",
    routeName: "users",
    icon: <TeamOutlined />,
  },
  {
    path: "/settings",
    component: StubPage,
    name: "系统设置",
    routeName: "settings",
    icon: <SettingOutlined />,
  },
  {
    path: "/about",
    component: StubPage,
    name: "关于我们",
    routeName: "about",
    icon: <QuestionCircleOutlined />,
  },
  {
    path: "https://www.example.com",
    component: null,
    name: "外部站点",
    routeName: "external",
    icon: <GlobalOutlined />,
    isExternal: true,
    target: '_blank'
  },
];

// 从路由配置生成菜单项
export const generateMenuFromRoutes = (
  routeConfigs: RouteConfig[]
): MenuProps["items"] => {
  return routeConfigs
    .filter((route) => !route.hidden)
    .map((route) => {
      const hasChildren = route.children && route.children.length > 0;

      // 为外部链接添加标记
      const itemProps: Record<string, unknown> = {};
      if (route.isExternal) {
        itemProps.target = route.target || '_blank';
      }

      if (hasChildren) {
        return {
          key: route.path,
          icon: route.icon,
          label: route.name,
          children: generateMenuFromRoutes(route.children || []),
          ...itemProps
        };
      }

      return {
        key: route.path,
        icon: route.icon,
        label: route.name,
        ...itemProps
      };
    });
};

// 从菜单项数据生成菜单配置
export const generateMenuItems = (
  menuItems: MenuItemType[]
): MenuProps["items"] => {
  return menuItems.map((item) => {
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return {
        key: `menu-${item.id}-${item.path}`,
        icon: getIconComponent(item.icon || ""),
        label: item.name,
        children: generateMenuItems(item.children || []),
      };
    }

    // 如果是系统管理页面的子菜单，使用完整的路径
    const key = item.path === '/system' && item.parentId ? 
      `menu-${item.id}-${item.parentId}-${item.path}` : 
      `menu-${item.id}-${item.path}`;

    return {
      key,
      icon: getIconComponent(item.icon || ""),
      label: item.name,
    };
  });
};

// 生成菜单项
export const defaultMenuItems: MenuProps["items"] =
  generateMenuFromRoutes(routes);
