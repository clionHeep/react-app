import React, { useState } from 'react';
import { Breadcrumb, theme } from 'antd';
import { CloseOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { getBreadcrumbStyles } from '@/styles/menuStyles';

interface BreadcrumbHandlerProps {
  style?: React.CSSProperties;
}

const BreadcrumbHandler: React.FC<BreadcrumbHandlerProps> = ({ style }) => {
  const { token } = theme.useToken();
  const { breadcrumbs, removeBreadcrumb, currentPath } = useBreadcrumb();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // 格式化面包屑项为Ant Design所需的格式
  const formatBreadcrumbItems = () => {
    return breadcrumbs.map((item) => {
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
                  {item.title}
                </span>
              ) : (
                <Link href={item.path} style={{ color: token.colorText }}>
                  {item.title}
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
                {item.title}
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
              {item.title}
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