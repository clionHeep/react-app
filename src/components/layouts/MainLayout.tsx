import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import type { LayoutType } from "@/types";
import TopLayout from "@/components/layouts/TopLayout";
import SideLayout from "@/components/layouts/SideLayout";
import MixLayout from "@/components/layouts/MixLayout";
import CustomLayout from "@/components/layouts/CustomLayout";
import LayoutPreview from "./preview/LayoutPreview";
import { ConfigProvider, theme as antdTheme } from "antd";

interface MainLayoutProps {
  children: React.ReactNode;
  isDarkMode?: boolean; // 添加isDarkMode属性，可选
  setIsDarkMode?: Dispatch<SetStateAction<boolean>>; // 添加setIsDarkMode回调函数，可选
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  isDarkMode: propIsDarkMode, 
  setIsDarkMode: propSetIsDarkMode 
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [layoutType, setLayoutType] = useState<LayoutType>(() => {
    // 从localStorage中恢复布局设置
    if (typeof window !== "undefined") {
      const savedLayout = localStorage.getItem("layoutType") as LayoutType;
      return savedLayout || "side"; // 如果没有保存，默认为side布局
    }
    return "side";
  });
  const [previewVisible, setPreviewVisible] = useState(false);

  // 添加本地状态管理主题，不依赖ThemeContext
  const [localThemeMode, setLocalThemeMode] = useState<
    "light" | "dark" | "custom"
  >(() => {
    // 如果提供了外部isDarkMode，则基于它设置初始主题模式
    if (propIsDarkMode !== undefined) {
      return propIsDarkMode ? "dark" : "light";
    }
    
    // 否则从localStorage中恢复主题设置
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("themeMode") as
        | "light"
        | "dark"
        | "custom";
      return savedTheme || "light";
    }
    return "light";
  });

  const [localCustomColor, setLocalCustomColor] = useState<string>(() => {
    // 从localStorage中恢复自定义颜色
    if (typeof window !== "undefined") {
      const savedColor = localStorage.getItem("customColor");
      return savedColor || "#1890ff";
    }
    return "#1890ff";
  });

  // 计算RGB值
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
          result[3],
          16
        )}`
      : "24, 144, 255"; // 默认蓝色
  };

  // 初始化主题设置
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 设置文档的data-theme属性
      document.documentElement.setAttribute("data-theme", localThemeMode);

      // 设置CSS变量
      document.documentElement.style.setProperty(
        "--ant-primary-color",
        localCustomColor
      );
      document.documentElement.style.setProperty(
        "--ant-primary-rgb",
        hexToRgb(localCustomColor)
      );

      // 设置间隔背景色
      const bgColor = localThemeMode === "dark" ? "#262626" : "#f6f6f6";
      document.documentElement.style.setProperty(
        "--ant-background-color-light",
        bgColor
      );
    }
  }, [localThemeMode, localCustomColor]);

  const handleLayoutChange = (type: LayoutType) => {
    setLayoutType(type);
    setPreviewVisible(false);
    // 保存到localStorage
    localStorage.setItem("layoutType", type);
  };

  const handleCollapsedChange = (newCollapsed: boolean) => {
    setCollapsed(newCollapsed);
  };

  const handleLayoutPreviewOpen = () => {
    setPreviewVisible(true);
  };

  // 添加主题变更处理函数
  const handleThemeModeChange = (mode: "light" | "dark" | "custom") => {
    setLocalThemeMode(mode);

    // 如果传入了外部的setIsDarkMode函数，则同步更新外部状态
    if (propSetIsDarkMode && mode === "dark") {
      propSetIsDarkMode(true);
    } else if (propSetIsDarkMode && mode === "light") {
      propSetIsDarkMode(false);
    }

    // 更新文档根元素类名或样式
    document.documentElement.setAttribute("data-theme", mode);

    // 更新间隔背景色
    const bgColor = mode === "dark" ? "#262626" : "#f6f6f6";
    document.documentElement.style.setProperty(
      "--ant-background-color-light",
      bgColor
    );

    // 保存到localStorage
    localStorage.setItem("themeMode", mode);

    // 如果切换到非自定义主题，使用默认颜色
    if (mode !== "custom") {
      handleCustomColorChange("#1890ff");
    }
  };

  const handleCustomColorChange = (color: string) => {
    setLocalCustomColor(color);

    // 更新CSS变量
    document.documentElement.style.setProperty("--ant-primary-color", color);
    document.documentElement.style.setProperty(
      "--ant-primary-rgb",
      hexToRgb(color)
    );

    // 保存到localStorage
    localStorage.setItem("customColor", color);
  };

  // // 重置所有设置为默认值
  // const handleResetAllSettings = () => {
  //   // 设置默认布局
  //   handleLayoutChange("side");

  //   // 设置默认主题模式
  //   handleThemeModeChange("light");

  //   // 设置默认颜色
  //   handleCustomColorChange("#1890ff");
  // };

  // 获取ant design主题配置
  const getThemeConfig = () => {
    const baseConfig = {
      token: {
        colorPrimary: localCustomColor,
        borderRadius: 6,
      },
    };

    switch (localThemeMode) {
      case "dark":
        return {
          ...baseConfig,
          algorithm: [antdTheme.darkAlgorithm, antdTheme.compactAlgorithm],
          token: {
            ...baseConfig.token,
            colorBgContainer: "#141414",
            colorBgElevated: "#1f1f1f",
            colorBgLayout: "#000000",
            colorSplit: "rgba(255, 255, 255, 0.12)",
            colorBorderSecondary: "rgba(255, 255, 255, 0.12)",
            colorBgSpotlight: "#262626", // 间隔背景色
          },
          components: {
            Layout: {
              headerBg: "#141414",
              bodyBg: "#000000",
              siderBg: "#141414",
              siderCollapsedWidth: 48,
            },
          },
        };
      case "custom":
        return {
          ...baseConfig,
          token: {
            ...baseConfig.token,
            colorBgLayout: "#f0f2f5", // 浅灰色的布局背景
            colorSplit: "rgba(5, 5, 5, 0.06)",
            colorBgSpotlight: "#f6f6f6", // 间隔背景色
          },
          components: {
            Layout: {
              bodyBg: "#f0f2f5",
            },
            Tooltip: {
              colorBgDefault: "rgba(0, 0, 0, 0.85)",
              colorTextLightSolid: "#ffffff",
            },
          },
        };
      default:
        return {
          ...baseConfig,
          algorithm: antdTheme.defaultAlgorithm,
          token: {
            ...baseConfig.token,
            colorBgLayout: "#f0f2f5", // 浅灰色的布局背景
            colorSplit: "rgba(5, 5, 5, 0.06)",
            colorBgSpotlight: "#f6f6f6", // 间隔背景色
          },
          components: {
            Layout: {
              bodyBg: "#f0f2f5",
            },
            Tooltip: {
              colorBgDefault: "rgba(0, 0, 0, 0.85)",
              colorTextLightSolid: "#ffffff",
            },
          },
        };
    }
  };

  // 更新浅色主题下tooltip的样式
  useEffect(() => {
    if (typeof window !== "undefined") {
      const styleElement = document.createElement("style");
      styleElement.id = "tooltip-fix-style";
      styleElement.textContent = `
        [data-theme="light"] .ant-tooltip, [data-theme="custom"] .ant-tooltip {
          --antd-arrow-background-color: rgba(0, 0, 0, 0.85);
        }
        [data-theme="light"] .ant-tooltip-inner, [data-theme="custom"] .ant-tooltip-inner {
          background-color: rgba(0, 0, 0, 0.85);
          color: #ffffff;
        }
      `;

      // 移除已存在的样式元素（如果有）
      const existingStyle = document.getElementById("tooltip-fix-style");
      if (existingStyle) {
        existingStyle.remove();
      }

      document.head.appendChild(styleElement);
    }
  }, []);

  const renderLayout = () => {
    const props = {
      children,
      collapsed,
      setCollapsed: handleCollapsedChange,
      onLayoutPreviewOpen: handleLayoutPreviewOpen,
    };

    // 使用客户端专属渲染
    if (typeof window === 'undefined') {
      // 服务端渲染简单的加载占位符
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
    }

    // 客户端渲染完整布局
    switch (layoutType) {
      case "top":
        return <TopLayout {...props} />;
      case "side":
        return <SideLayout {...props} />;
      case "mix":
        return <MixLayout {...props} />;
      case "custom":
        return <CustomLayout {...props} />;
      default:
        return <SideLayout {...props} />;
    }
  };

  return (
    <ConfigProvider theme={getThemeConfig()}>
      {renderLayout()}
      <LayoutPreview
        isOpen={previewVisible}
        onClose={() => setPreviewVisible(false)}
        currentLayout={layoutType}
        onLayoutSelect={handleLayoutChange}
        currentThemeMode={localThemeMode}
        currentCustomColor={localCustomColor}
        onThemeModeChange={handleThemeModeChange}
        onCustomColorChange={handleCustomColorChange}
      />
    </ConfigProvider>
  );
};

export default MainLayout;
