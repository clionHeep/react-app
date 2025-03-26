"use client";

import React, { useEffect, useState } from "react";
import { Layout, Menu, theme, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { isExternal, resolvePath } from "@/routes/router-utils";

const { Header, Content, Sider } = Layout;

// 自定义菜单项类型，用于类型安全的处理
interface CustomMenuItem {
  key: React.Key;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  children?: CustomMenuItem[];
  [key: string]: unknown; // 使用 unknown 替代 any
}

// 添加更详细的类型定义
interface MenuItemProps {
  href?: string;
  [key: string]: unknown;
}

// 添加Label类型定义
interface MenuLabel extends React.ReactElement {
  type: typeof Link;
  props: MenuItemProps;
}

// 定义更具体的菜单项类型
interface TypedMenuItem {
  key: React.Key;
  icon?: React.ReactNode;
  label?: MenuLabel | React.ReactNode;
  children?: TypedMenuItem[];
  path?: string | null;
  [key: string]: unknown;
}

// 辅助函数，安全地访问label.props
function getLabelProp<T extends React.ReactNode, K extends string>(
  label: T,
  propName: K
): unknown {
  if (React.isValidElement(label)) {
    return (label.props as Record<string, unknown>)?.[propName];
  }
  return undefined;
}

// 辅助函数，检查并获取href
function getHref(label: React.ReactNode): string | undefined {
  return getLabelProp(label, "href") as string | undefined;
}

// 辅助函数，检查label是否有href
function hasValidHref(label: React.ReactNode): boolean {
  return (
    React.isValidElement(label) &&
    label.type === Link &&
    !!getLabelProp(label, "href")
  );
}

// 为路由添加类型
interface RouterType {
  push: (path: string) => void;
  pathname?: string;
  [key: string]: unknown;
}

// 处理主菜单点击
const handleMainMenuClick = (
  { key }: { key: string },
  {
    defaultMenuItems,
    setActiveMainMenu,
    setHasSubMenu,
    setActiveSubMenu,
    pathname,
    router,
  }: {
    defaultMenuItems: TypedMenuItem[];
    setActiveMainMenu: (key: string) => void;
    setHasSubMenu: (has: boolean) => void;
    setActiveSubMenu: (key: string | null) => void;
    pathname: string | null;
    router: RouterType; // 替换any
  }
) => {
  console.log("主菜单点击:", key);
  setActiveMainMenu(key);

  // 检查选中的菜单是否有子菜单
  if (!Array.isArray(defaultMenuItems)) return;

  const selectedMenu = defaultMenuItems.find(
    (item) =>
      item && typeof item === "object" && "key" in item && item.key === key
  ) as CustomMenuItem | undefined;

  if (!selectedMenu) return;

  const hasChildren =
    selectedMenu.children &&
    Array.isArray(selectedMenu.children) &&
    selectedMenu.children.length > 0;

  setHasSubMenu(!!hasChildren);

  // 如果有子菜单，自动触发第一个子菜单的跳转
  if (
    hasChildren &&
    selectedMenu.children &&
    Array.isArray(selectedMenu.children) &&
    selectedMenu.children.length > 0
  ) {
    const firstSubItem = selectedMenu.children[0] as CustomMenuItem;
    if (
      firstSubItem &&
      typeof firstSubItem === "object" &&
      "key" in firstSubItem
    ) {
      setActiveSubMenu(String(firstSubItem.key));

      // 获取子菜单路径并导航
      if (
        firstSubItem.label &&
        React.isValidElement(firstSubItem.label) &&
        firstSubItem.label.type === Link &&
        hasValidHref(firstSubItem.label)
      ) {
        const targetPath = getHref(firstSubItem.label);
        console.log("自动导航到第一个子菜单路径:", targetPath);

        if (targetPath) {
          // 外部链接使用window.open打开
          if (isExternal(targetPath)) {
            window.open(targetPath, "_blank");
            return;
          }
          
          // 内部链接使用router.push导航
          router.push(targetPath);
        }
      } else {
        // 如果子菜单项没有Link标签，则尝试使用key作为路径
        const subItemKey = String(firstSubItem.key);
        if (isExternal(subItemKey)) {
          window.open(subItemKey, "_blank");
          return;
        }
        
        const result = resolvePath(subItemKey);
        if (typeof result === "string") {
          router.push(result);
        } else if (result) {
          const { path, query } = result;
          const queryString = new URLSearchParams(query).toString();
          const url = queryString ? `${path}?${queryString}` : path;
          router.push(url);
        }
      }
    } else {
      setActiveSubMenu(null);
    }
  } else {
    // 没有子菜单，直接导航到主菜单路径
    setActiveSubMenu(null);

    // 外部链接使用window.open打开
    if (isExternal(key)) {
      window.open(key, "_blank");
      return;
    }
    
    // 内部路径导航
    const result = resolvePath(key);
    if (typeof result === "string") {
      router.push(result);
    } else if (result) {
      const { path, query } = result;
      const queryString = new URLSearchParams(query).toString();
      const url = queryString ? `${path}?${queryString}` : path;
      router.push(url);
    }

    // 如果有Link标签，则使用其href
    if (
      selectedMenu.label &&
      React.isValidElement(selectedMenu.label) &&
      selectedMenu.label.type === Link &&
      hasValidHref(selectedMenu.label)
    ) {
      const targetPath = getHref(selectedMenu.label);
      console.log("导航到主菜单路径:", targetPath);

      if (pathname !== targetPath && targetPath) {
        router.push(targetPath);
      }
    }
  }
};

// 处理子菜单点击
const handleSubMenuClick = (
  { key }: { key: string },
  {
    defaultMenuItems,
    activeMainMenu,
    setActiveSubMenu,
    pathname,
    router,
  }: {
    defaultMenuItems: TypedMenuItem[];
    activeMainMenu: string | null;
    setActiveSubMenu: (key: string) => void;
    pathname: string | null;
    router: RouterType; // 替换any
  }
) => {
  console.log("子菜单点击:", key);
  setActiveSubMenu(key);
  
  // 外部链接使用window.open打开
  if (isExternal(key)) {
    window.open(key, "_blank");
    return;
  }

  // 内部路径导航
  const result = resolvePath(key);
  if (typeof result === "string") {
    router.push(result);
  } else if (result) {
    const { path, query } = result;
    const queryString = new URLSearchParams(query).toString();
    const url = queryString ? `${path}?${queryString}` : path;
    router.push(url);
  }

  // 查找子菜单项及其链接
  if (!Array.isArray(defaultMenuItems) || !activeMainMenu) return;

  const currentMainItem = defaultMenuItems.find(
    (item) =>
      item &&
      typeof item === "object" &&
      "key" in item &&
      item.key === activeMainMenu
  ) as CustomMenuItem | undefined;

  if (currentMainItem?.children && Array.isArray(currentMainItem.children)) {
    const selectedSubItem = currentMainItem.children.find(
      (child) =>
        child &&
        typeof child === "object" &&
        "key" in child &&
        child.key === key
    ) as CustomMenuItem | undefined;

    // 如果子菜单项有Link标签，则使用其href
    if (
      selectedSubItem &&
      selectedSubItem.label &&
      React.isValidElement(selectedSubItem.label) &&
      selectedSubItem.label.type === Link &&
      hasValidHref(selectedSubItem.label)
    ) {
      const targetPath = getHref(selectedSubItem.label);
      console.log("导航到子菜单路径:", targetPath);

      if (pathname !== targetPath && targetPath) {
        router.push(targetPath);
      }
    }
  }
};

const MixLayout: React.FC<LayoutProps> = ({
  children,
  collapsed,
  setCollapsed,
  onLayoutPreviewOpen,
}) => {
  const { token } = theme.useToken();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  // 当前选中的主菜单
  const [activeMainMenu, setActiveMainMenu] = useState<string | null>(null);
  // 当前菜单是否有子菜单
  const [hasSubMenu, setHasSubMenu] = useState<boolean>(false);
  // 当前选中的子菜单
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  // 主菜单点击处理函数（保持对象引用稳定）
  const handleMainMenuClick_internal = (info: { key: string }) => {
    handleMainMenuClick(info, {
      defaultMenuItems: defaultMenuItems as unknown as TypedMenuItem[], // 类型转换
      setActiveMainMenu,
      setHasSubMenu,
      setActiveSubMenu,
      pathname,
      router: router as unknown as RouterType,
    });
  };

  // 子菜单点击处理函数（保持对象引用稳定）
  const handleSubMenuClick_internal = (info: { key: string }) => {
    handleSubMenuClick(info, {
      defaultMenuItems: defaultMenuItems as unknown as TypedMenuItem[], // 类型转换
      activeMainMenu,
      setActiveSubMenu,
      pathname,
      router: router as unknown as RouterType,
    });
  };

  // 根据路径查找当前活动菜单
  useEffect(() => {
    if (!pathname || !defaultMenuItems) return;

    // 尝试根据当前路径找到匹配的菜单项
    let foundMainMenu: string | null = null;
    let foundSubMenu: string | null = null;

    // 遍历菜单项
    if (Array.isArray(defaultMenuItems)) {
      for (const item of defaultMenuItems) {
        if (!item || typeof item !== "object") continue;

        // 使用类型断言处理菜单项
        const menuItem = item as CustomMenuItem;

        // 检查主菜单项标签是否包含匹配路径的Link
        if (
          menuItem.label &&
          React.isValidElement(menuItem.label) &&
          menuItem.label.type === Link &&
          hasValidHref(menuItem.label) &&
          getHref(menuItem.label) === pathname
        ) {
          foundMainMenu = String(menuItem.key);
          break;
        }

        // 检查子菜单
        if (menuItem.children && Array.isArray(menuItem.children)) {
          for (const child of menuItem.children) {
            if (!child || typeof child !== "object") continue;

            // 使用类型断言处理子菜单项
            const childItem = child as CustomMenuItem;

            if (
              childItem.label &&
              React.isValidElement(childItem.label) &&
              childItem.label.type === Link &&
              hasValidHref(childItem.label) &&
              getHref(childItem.label) === pathname
            ) {
              foundMainMenu = String(menuItem.key);
              foundSubMenu = String(childItem.key);
              break;
            }
          }
          if (foundMainMenu) break;
        }
      }
    }

    // 设置找到的菜单状态
    if (foundMainMenu) {
      console.log("根据路径匹配到主菜单:", foundMainMenu);
      setActiveMainMenu(foundMainMenu);

      // 查找是否有子菜单
      const mainItem = defaultMenuItems.find(
        (item) =>
          item &&
          typeof item === "object" &&
          "key" in item &&
          String(item.key) === foundMainMenu
      ) as CustomMenuItem | undefined;

      const hasChildren =
        mainItem &&
        mainItem.children &&
        Array.isArray(mainItem.children) &&
        mainItem.children.length > 0;

      setHasSubMenu(!!hasChildren);

      if (foundSubMenu) {
        console.log("根据路径匹配到子菜单:", foundSubMenu);
        setActiveSubMenu(foundSubMenu);
      } else if (hasChildren && mainItem?.children) {
        // 如果没有找到匹配的子菜单但主菜单有子项，设置第一个子菜单为活动
        const firstSubItem = mainItem.children[0] as CustomMenuItem;
        if (
          firstSubItem &&
          typeof firstSubItem === "object" &&
          "key" in firstSubItem
        ) {
          setActiveSubMenu(String(firstSubItem.key));
        }
      }
    }
  }, [pathname, defaultMenuItems]);

  // 仅在客户端执行此代码
  useEffect(() => {
    setMounted(true);

    // 默认选择第一个菜单项（如果没有根据路径匹配到）
    if (!activeMainMenu && defaultMenuItems && defaultMenuItems.length > 0) {
      const firstItem = defaultMenuItems[0];
      if (firstItem && typeof firstItem === "object" && "key" in firstItem) {
        const mainMenuKey = String(firstItem.key);
        setActiveMainMenu(mainMenuKey);

        // 检查是否有子菜单
        const hasChildren =
          "children" in firstItem &&
          Array.isArray(firstItem.children) &&
          firstItem.children.length > 0;

        setHasSubMenu(hasChildren);

        // 如果有子菜单，默认选中第一个子菜单
        if (
          hasChildren &&
          Array.isArray(firstItem.children) &&
          firstItem.children.length > 0
        ) {
          const firstSubItem = firstItem.children[0];
          if (
            firstSubItem &&
            typeof firstSubItem === "object" &&
            "key" in firstSubItem
          ) {
            setActiveSubMenu(String(firstSubItem.key));
          }
        }
      }
    }
  }, [activeMainMenu]);

  // 获取顶部主菜单项
  const getMaindefaultMenuItems = () => {
    // 如果defaultMenuItems未定义，返回空数组
    if (!defaultMenuItems) return [];

    return defaultMenuItems.map((item) => {
      // 确保item有正确的类型和非null
      if (!item) return { key: "empty" }; // 提供默认值

      const typedItem = item as unknown as TypedMenuItem;

      let path = null;
      if (
        typedItem.label &&
        React.isValidElement(typedItem.label) &&
        typedItem.label.type === Link &&
        hasValidHref(typedItem.label)
      ) {
        path = getHref(typedItem.label);
      }

      // 检查是否应该应用activeParent类
      // 当主菜单项的key与当前选中的activeMainMenu相同，并且当前有子菜单选中时
      const isActiveParent =
        activeMainMenu === typedItem.key &&
        hasSubMenu &&
        activeSubMenu !== null;

      // 返回包含关键信息的菜单项
        return {
        key: typedItem.key,
        icon: typedItem.icon,
        label: typedItem.label,
        // 将路径信息存储在自定义属性中
        path: path,
        // 当主菜单与子菜单对应的主菜单一致时，添加activeParent类名
        className: isActiveParent ? "activeParent" : "",
      };
    });
  };

  // 获取左侧子菜单项
  const getSubdefaultMenuItems = () => {
    if (!Array.isArray(defaultMenuItems) || !activeMainMenu) return [];

    // 找到当前激活的主菜单
    const activeMainItem = defaultMenuItems?.find(
      (item) =>
        item &&
        typeof item === "object" &&
        "key" in item &&
        String(item.key) === activeMainMenu
    ) as unknown as TypedMenuItem;

    // 如果没有找到活跃的主菜单项，或者没有子菜单，则返回空数组
    if (!activeMainItem || !activeMainItem.children) {
      return [];
    }

    // 映射子菜单项
    return activeMainItem.children.map((child) => {
      const typedChild = child as unknown as TypedMenuItem;

      let path = null;
      if (
        typedChild.label &&
        React.isValidElement(typedChild.label) &&
        typedChild.label.type === Link &&
        hasValidHref(typedChild.label)
      ) {
        path = getHref(typedChild.label);
      }

      // 返回包含关键信息的菜单项
      return {
        key: typedChild.key,
        icon: typedChild.icon,
        label: typedChild.label,
        // 将路径信息存储在自定义属性中
        path: path,
      };
    });
  };

  // 如果未挂载，显示静态加载占位符
  if (!mounted) {
    return <StaticLoadingPlaceholder />;
  }

  // 获取基础样式
  const styles = getBaseStyles(token);

  // 调试：显示菜单数据结构
  console.log("菜单数据:", defaultMenuItems);

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
          items={getMaindefaultMenuItems()}
          onClick={handleMainMenuClick_internal}
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
                items={getSubdefaultMenuItems()}
                selectedKeys={activeSubMenu ? [activeSubMenu] : []}
                onClick={handleSubMenuClick_internal}
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
