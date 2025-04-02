"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Layout, Menu, theme, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import type { LayoutProps } from "@/types";
import Logo from "@/components/common/Logo";
import UserInfo from "@/components/user/UserInfo";
import FullscreenButton from "@/components/common/FullscreenButton";
import { useAuth } from "@/context/AuthContext";
import * as Icons from "@ant-design/icons";
import type { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon";
import StaticLoadingPlaceholder from "@/components/common/StaticLoadingPlaceholder";
import BreadcrumbHandler from "@/components/layouts/BreadcrumbHandler";
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
  label: React.ReactNode;
  children?: AntMenuItemType[];
  path?: string;
  hidden?: boolean;
}

// 获取图标组件
const getIconComponent = (iconName: string) => {
  if (!iconName) return null;
  const IconComponent = (
    Icons as unknown as Record<string, React.ComponentType<AntdIconProps>>
  )[iconName];
  return IconComponent ? <IconComponent /> : null;
};

const MixLayout: React.FC<LayoutProps> = ({
  children,
  collapsed,
  setCollapsed,
  onLayoutPreviewOpen,
}) => {
  const { token } = theme.useToken();
  const router = useRouter();
  const pathname = usePathname();
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

  // 从后端菜单数据生成菜单项 - 使用useCallback包装
  const generateMenuItems = useCallback(
    (menuItems: MenuItemType[]): AntMenuItemType[] => {
      console.log("[MixLayout] 生成菜单项，菜单数据:", menuItems);

      if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
        console.warn("[MixLayout] 菜单数据为空或格式不正确");
        return [];
      }

      return menuItems
        .filter((item) => !item.hidden)
        .map((item) => {
          const hasChildren =
            item.children &&
            Array.isArray(item.children) &&
            item.children.length > 0 &&
            item.children.some((child) => !child.hidden);

          console.log(
            `[MixLayout] 处理菜单项: ${item.name}, 路径: ${
              item.path || "未指定"
            }, 图标: ${item.icon || "未指定"}, 是否有子菜单: ${hasChildren}`
          );

          // 使用 id 和 path 组合作为唯一 key
          const itemKey = `${item.id}-${item.path || ""}`;

          return {
            key: itemKey,
            icon: getIconComponent(item.icon || ""),
            label: (
              <div
                onClick={(e) => {
                  // 阻止事件冒泡，防止触发父级菜单的展开/收起
                  e.stopPropagation();
                  if (item.path) {
                    const [, path] = itemKey.split("-");
                    if (isExternal(path)) {
                      window.open(path, "_blank");
                    } else {
                      router.push(path);
                    }
                  }
                }}
                style={{ display: "inline-block", width: "100%" }}
              >
                {item.name}
              </div>
            ),
            children: hasChildren
              ? generateMenuItems(item.children)
              : undefined,
            path: item.path, // 保存原始路径
          };
        });
    },
    [router]
  );

  // 当后端返回的菜单数据改变或主菜单选择变化时，重新生成菜单项
  useEffect(() => {
    console.log("[MixLayout] === 菜单数据更新 ===");
    console.log("[MixLayout] 菜单数据原始值:", menus);

    if (menus && Array.isArray(menus) && menus.length > 0) {
      try {
        // 生成主菜单项
        const items = generateMenuItems(menus as unknown as MenuItemType[]);
        console.log("[MixLayout] 生成的菜单项:", items);

        // 初始化主菜单和子菜单
        setMainMenuItems(items);

        // 设置默认选中的主菜单（如果没有当前选中的）
        if (!activeMainMenu && items && items.length > 0) {
          const firstMainMenu = items[0]?.key?.toString();
          if (firstMainMenu) {
            setActiveMainMenu(firstMainMenu);

            // 检查是否有子菜单
            const firstItem = items[0];
            const hasChildren =
              firstItem?.children &&
              Array.isArray(firstItem.children) &&
              firstItem.children.length > 0;
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
        console.error("[MixLayout] 处理菜单数据时出错:", error);
        console.warn("[MixLayout] 使用空菜单");
        setMainMenuItems([]);
        setSubMenuItems([]);
      }
    } else {
      console.warn("[MixLayout] 警告: 无菜单数据或格式不正确");
      console.log("[MixLayout] menus类型:", typeof menus);
      console.log("[MixLayout] 是否为数组:", Array.isArray(menus));
      console.log(
        "[MixLayout] 数组长度:",
        Array.isArray(menus) ? menus.length : "非数组"
      );
      setMainMenuItems([]);
      setSubMenuItems([]);
    }
  }, [menus, activeMainMenu, generateMenuItems]);

  // 监听路由变化，更新菜单状态
  useEffect(() => {
    console.log("[MixLayout] 路由变化:", pathname);

    // 遍历主菜单查找匹配的菜单项
    for (const mainItem of mainMenuItems) {
      // 从 key 中提取原始路径
      const [, mainPath] = mainItem.key.split("-");

      // 检查主菜单是否匹配当前路径
      if (mainPath === pathname) {
        setActiveMainMenu(mainItem.key);
        setHasSubMenu(false);
        setSubMenuItems([]);
        setActiveSubMenu(null);
        return;
      }

      // 检查子菜单是否匹配
      if (mainItem.children && Array.isArray(mainItem.children)) {
        for (const subItem of mainItem.children) {
          const [, subPath] = subItem.key.split("-");
          if (subPath === pathname) {
            setActiveMainMenu(mainItem.key);
            setHasSubMenu(true);
            setSubMenuItems(mainItem.children);
            setActiveSubMenu(subItem.key);
            return;
          }
        }
      }
    }

    // 如果没有找到匹配的菜单项，清除所有状态
    setActiveMainMenu(null);
    setHasSubMenu(false);
    setSubMenuItems([]);
    setActiveSubMenu(null);
  }, [pathname, mainMenuItems]);

  // 处理主菜单点击
  const handleMainMenuClick = (info: { key: string }) => {
    const { key } = info;
    console.log("[MixLayout] 主菜单点击:", key);

    // 从 key 中提取原始路径
    const [, path] = key.split("-");

    // 查找当前选中的主菜单项
    const selectedMainItem = mainMenuItems.find((item) => item.key === key);
    setActiveMainMenu(key);

    // 检查是否有子菜单
    const hasChildren =
      selectedMainItem?.children &&
      Array.isArray(selectedMainItem.children) &&
      selectedMainItem.children.length > 0 &&
      selectedMainItem.children.some((child) => !child.hidden);

    if (hasChildren && selectedMainItem.children) {
      // 有子菜单，显示子菜单
      setHasSubMenu(true);
      setSubMenuItems(selectedMainItem.children);

      // 检查是否有子菜单项与当前路径匹配
      const matchingSubItem = selectedMainItem.children.find(
        (item) => item.path === path
      );
      if (matchingSubItem) {
        setActiveSubMenu(matchingSubItem.key);
      } else {
        // 如果没有匹配的，选中第一个子菜单
        const firstSubMenu = selectedMainItem.children[0]?.key?.toString();
        if (firstSubMenu) {
          setActiveSubMenu(firstSubMenu);
        }
      }
    } else {
      // 没有子菜单，清除子菜单状态
      setHasSubMenu(false);
      setSubMenuItems([]);
      setActiveSubMenu(null);

      if (path) {
        if (isExternal(path)) {
          window.open(path, "_blank");
        } else {
          router.push(path);
        }
      }
    }
  };

  // 处理子菜单点击
  const handleSubMenuClick = (info: { key: string }) => {
    const { key } = info;
    console.log("[MixLayout] 子菜单点击:", key);

    // 从 key 中提取原始路径
    const [, path] = key.split("-");

    // 查找当前点击的子菜单项
    const selectedSubItem = subMenuItems.find((item) => item.key === key);

    // 检查是否有子菜单
    const hasChildren =
      selectedSubItem?.children &&
      Array.isArray(selectedSubItem.children) &&
      selectedSubItem.children.length > 0 &&
      selectedSubItem.children.some((child) => !child.hidden);

    if (hasChildren && selectedSubItem.children) {
      // 有子菜单，显示子菜单
      setHasSubMenu(true);
      setSubMenuItems(selectedSubItem.children);
      setActiveSubMenu(key);
    } else {
      // 没有子菜单，清除子菜单状态
      setHasSubMenu(false);
      setSubMenuItems([]);
      setActiveSubMenu(key);

      // 如果路径存在，进行导航
      if (path) {
        if (isExternal(path)) {
          window.open(path, "_blank");
        } else {
          router.push(path);
        }
      }
    }
  };

  // 如果未挂载，显示静态加载占位符
  if (!mounted) {
    return <StaticLoadingPlaceholder />;
  }

  // 调试：显示菜单数据结构
  console.log("[MixLayout] 菜单数据:", menus);

  // 只在客户端渲染实际布局
  return (
    <Layout style={{ height: "100vh" }}>
      {/* 左侧固定菜单 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
        width={220}
      >
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 48,
            }}
          >
            <Logo collapsed={collapsed} />
          </div>
          <Menu
            mode="inline"
            items={mainMenuItems}
            selectedKeys={[
              ...(activeMainMenu ? [activeMainMenu] : []),
              ...(activeSubMenu ? [activeSubMenu] : []),
            ]}
            onClick={handleMainMenuClick}
            style={{
              border: "none",
              background: "transparent",
              padding: "8px",
              flex: 1,
              overflow: "auto",
            }}
            theme="light"
          />
          <div
            style={{
              padding: "8px",
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              display: "flex",
              justifyContent: "center",
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: token.colorBgContainer,
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: "16px" }}
            />
          </div>
        </div>
      </Sider>

      {/* 右侧内容区 */}
      <Layout
        style={{ marginLeft: collapsed ? 80 : 220, transition: "all 0.2s" }}
      >
        {/* 顶部工具栏 */}
        <Header
          style={{
            padding: "0 24px",
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            height: 48,
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <FullscreenButton />
            <UserInfo onLayoutClick={onLayoutPreviewOpen} />
          </div>
        </Header>

        {/* 标签页导航区 */}
        <div
          style={{
            padding: "8px 16px",
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            height: 40,
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
          }}
        >
          <BreadcrumbHandler />
        </div>

        {/* 主要内容区 */}
        <Layout
          style={{
            padding: "6px 6px",
            background: token.colorBgLayout,
          }}
        >
          {/* 子菜单 - 只在主菜单被选中且有子菜单时显示 */}
          {hasSubMenu && activeMainMenu && !activeSubMenu && (
            <Sider
              width={200}
              style={{
                background: token.colorBgContainer,
                marginRight: 8,
                borderRadius: 4,
              }}
            >
              <Menu
                mode="inline"
                items={subMenuItems}
                selectedKeys={activeSubMenu ? [activeSubMenu] : []}
                onClick={handleSubMenuClick}
                style={{
                  border: "none",
                  background: "transparent",
                }}
                theme="light"
              />
            </Sider>
          )}

          {/* 内容区 */}
          <Content
            style={{
              background: token.colorBgContainer,
              padding: "12px",
              borderRadius: 4,
              minHeight: 280,
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
