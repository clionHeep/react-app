import React, { useState, useEffect, useCallback } from 'react';
import { Breadcrumb, theme } from 'antd';
import { CloseOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { getBreadcrumbStyles } from '@/styles/menuStyles';
import { useAuth } from '@/context/AuthContext';
import { Menu } from '@/types/api';

interface BreadcrumbHandlerProps {
  style?: React.CSSProperties;
}

const BreadcrumbHandler: React.FC<BreadcrumbHandlerProps> = ({ style }) => {
  const { token } = theme.useToken();
  const { breadcrumbs, removeBreadcrumb, currentPath } = useBreadcrumb();
  const { menus } = useAuth(); // 直接从AuthContext获取菜单数据
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [menuNameMap, setMenuNameMap] = useState<Record<string, string>>({});
  
  // 递归查找菜单名称
  const findMenuNameByPath = useCallback((path: string, items: Menu[]): string | null => {
    for (const item of items) {
      if (item.path === path) {
        return item.name;
      }
      if (item.children && item.children.length > 0) {
        const found = findMenuNameByPath(path, item.children);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // 更新菜单名称映射
  useEffect(() => {
    if (!menus || !Array.isArray(menus) || menus.length === 0) return;
    
    const newMap: Record<string, string> = {};
    breadcrumbs.forEach(crumb => {
      const menuName = findMenuNameByPath(crumb.path, menus);
      if (menuName) {
        newMap[crumb.path] = menuName;
      }
    });
    
    setMenuNameMap(newMap);
  }, [menus, breadcrumbs, findMenuNameByPath]);

  // 格式化面包屑项为Ant Design所需的格式
  const formatBreadcrumbItems = () => {
    return breadcrumbs.map((item) => {
      // 使用从菜单数据中查找到的名称，如果没有则使用当前标题
      const displayTitle = menuNameMap[item.path] || item.title;
      
      // 检查是否是当前活动路径或鼠标悬停
      const isActive = item.path === currentPath;
      const isHovered = hoveredItem === item.key;

      // 所有项使用统一的包裹容器样式
      const containerStyle = {
        display: "flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: "4px",
        background:
          isActive || isHovered ? `${token.colorPrimaryBg}` : "transparent",
        marginRight: "8px",
        transition: "all 0.3s",
        cursor: "pointer",
      };

      // 首页特殊处理 - 使用相同的包裹样式但不显示关闭按钮
      if (item.key === "home") {
        return {
          title: (
            <div
              style={containerStyle}
              onMouseEnter={() => setHoveredItem(item.key)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {isActive ? (
                <span style={{ fontWeight: "bold", color: token.colorPrimary }}>
                  {displayTitle}
                </span>
              ) : (
                <Link href={item.path} style={{ color: token.colorText }}>
                  {displayTitle}
                </Link>
              )}
            </div>
          ),
        };
      }

      // 当前活动项显示文本和删除按钮，没有链接
      if (isActive) {
        return {
          title: (
            <div
              style={containerStyle}
              onMouseEnter={() => setHoveredItem(item.key)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ fontWeight: "bold", color: token.colorPrimary }}>
                {displayTitle}
              </span>
              <CloseOutlined
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeBreadcrumb(item.key);
                }}
                style={{
                  fontSize: "10px",
                  cursor: "pointer",
                  color: "#999",
                  marginLeft: "8px",
                }}
              />
            </div>
          ),
        };
      }

      // 其他项，添加链接和删除按钮
      return {
        title: (
          <div
            style={containerStyle}
            onMouseEnter={() => setHoveredItem(item.key)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link href={item.path} style={{ color: token.colorText }}>
              {displayTitle}
            </Link>
            <CloseOutlined
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeBreadcrumb(item.key);
              }}
              style={{
                fontSize: "10px",
                cursor: "pointer",
                color: "#999",
                marginLeft: "8px",
              }}
            />
          </div>
        ),
      };
    });
  };

  return (
    <div style={style}>
      <style>
        {getBreadcrumbStyles()}
      </style>
      <Breadcrumb
        items={formatBreadcrumbItems()}
        style={{ fontSize: 14 }}
        separator=""
        className="custom-breadcrumb"
      />
    </div>
  );
};

export default BreadcrumbHandler; 