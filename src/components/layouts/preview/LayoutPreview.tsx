import React, { useState, useEffect } from "react";
import { Drawer, Tooltip, Divider, theme, Button } from "antd";
import type { LayoutPreviewProps } from "@/types";
import ThemeConfig from "@/components/theme/ThemeConfig";
import Image from "next/image";

// 默认配置
const DEFAULT_LAYOUT = "side";
const DEFAULT_THEME_MODE = "light";
const DEFAULT_CUSTOM_COLOR = "#1890ff";

const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  isOpen,
  onClose,
  currentLayout,
  onLayoutSelect,
  currentThemeMode = "light",
  currentCustomColor = "#1890ff",
  onThemeModeChange,
  onCustomColorChange,
}) => {
  // 使用Ant Design的主题token
  const { token } = theme.useToken();

  // 临时存储用户选择但未确认的布局
  const [tempLayout, setTempLayout] = useState<
    "top" | "side" | "mix" | "custom"
  >(currentLayout);

  // 临时存储用户选择但未确认的主题设置
  const [tempThemeMode, setTempThemeMode] = useState<
    "light" | "dark" | "custom"
  >(currentThemeMode as "light" | "dark" | "custom");
  const [tempCustomColor, setTempCustomColor] =
    useState<string>(currentCustomColor);

  // 当currentLayout变化时更新tempLayout
  useEffect(() => {
    setTempLayout(currentLayout);
  }, [currentLayout]);

  // 当currentThemeMode和currentCustomColor变化时更新临时状态
  useEffect(() => {
    if (currentThemeMode)
      setTempThemeMode(currentThemeMode as "light" | "dark" | "custom");
    if (currentCustomColor) setTempCustomColor(currentCustomColor);
  }, [currentThemeMode, currentCustomColor]);

  // 点击确定按钮时应用布局和主题变更
  const handleConfirm = () => {
    onLayoutSelect(tempLayout); // 使用 onLayoutSelect 而不是 handleChange
    if (onThemeModeChange) onThemeModeChange(tempThemeMode);
    if (onCustomColorChange) onCustomColorChange(tempCustomColor);
    onClose(); // 应用更改后关闭抽屉
  };

  // 点击重置按钮时恢复为默认设置
  const handleReset = () => {
    setTempLayout(DEFAULT_LAYOUT);
    setTempThemeMode(DEFAULT_THEME_MODE);
    setTempCustomColor(DEFAULT_CUSTOM_COLOR);
  };

  const layouts = [
    {
      value: "top",
      title: "上中下布局",
      desc: "页面级整体布局",
      image:
        "https://ai-public.mastergo.com/ai/img_res/38fce5a5ef9f38d0aff9162c179fdafe.jpg",
    },
    {
      value: "side",
      title: "侧边布局",
      desc: "拥有顶部导航及侧边栏的页面",
      image:
        "https://ai-public.mastergo.com/ai/img_res/9eca85774b67d358c5ba5115eb30365d.jpg",
    },
    {
      value: "mix",
      title: "混合布局",
      desc: "适用于应用型的终端",
      image:
        "https://ai-public.mastergo.com/ai/img_res/5ee3d79fb4f62b2d102868db5081f682.jpg",
    },
    {
      value: "custom",
      title: "自定义布局",
      desc: "自由度较高的布局方式",
      image:
        "https://ai-public.mastergo.com/ai/img_res/094b063080f65e8a372c18fd05bf822f.jpg",
    },
  ];

  // 定义固定样式
  const drawerContentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 24,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 16,
    height: 24,
    lineHeight: "24px",
  };

  const cardGridStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-evenly",
  };

  const cardStyle = (isActive: boolean): React.CSSProperties => ({
    width: 144,
    height: 90,
    borderRadius: 4,
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.2s",
    border: isActive ? `1px solid ${token.colorPrimary}` : "1px solid #f0f0f0",
    backgroundColor: isActive ? token.colorPrimaryBg : "transparent",
    position: "relative",
    boxShadow: isActive ? `0 0 6px 1px ${token.colorPrimary}` : "none",
    transform: isActive ? "scale(1.03)" : "scale(1)",
  });

  const imageContainerStyle: React.CSSProperties = {
    // padding: 8,
    height: 90,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 2,
  };

  return (
    <Drawer
      title={<span style={{ fontSize: 18, fontWeight: 500 }}>主题配置</span>}
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={340}
      closable={false}
      className="layout-preview-drawer"
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            padding: "10px 0",
            width: "100%",
          }}
        >
          <Button style={{ flex: 1 }} onClick={handleReset}>
            重置
          </Button>
          <Button style={{ flex: 1 }} type="primary" onClick={handleConfirm}>
            确定
          </Button>
        </div>
      }
      styles={{
        body: {
          padding: "16px",
          overflow: "auto",
          height: "calc(100% - 110px)", // 减去header和footer的高度
        },
        header: {
          height: 56,
          lineHeight: "56px",
        },
        content: {
          display: "flex",
          flexDirection: "column",
        },
        footer: {
          borderTop: "1px solid #f0f0f0",
          padding: "10px 24px",
        },
      }}
      extra={
        <div
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            transition: "opacity 0.2s",
          }}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.75";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          <span className="anticon">
            <svg
              viewBox="64 64 896 896"
              focusable="false"
              data-icon="close"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
            </svg>
          </span>
        </div>
      }
    >
      <div style={drawerContentStyle}>
        <div style={sectionStyle}>
          <h3 style={titleStyle}>布局设置</h3>
          <div style={cardGridStyle}>
            {layouts.map((item) => (
              <Tooltip key={item.value} title={item.desc}>
                <div
                  style={cardStyle(tempLayout === item.value)}
                  onClick={() =>
                    setTempLayout(
                      item.value as "top" | "side" | "mix" | "custom"
                    )
                  }
                >
                  <div style={imageContainerStyle}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={120}
                      height={70}
                      style={imageStyle}
                    />
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>

        <Divider style={{ margin: "0 0 24px 0", height: 1 }} />

        <ThemeConfig
          themeMode={currentThemeMode as "light" | "dark" | "custom"}
          customColor={currentCustomColor}
          setThemeMode={onThemeModeChange}
          setCustomColor={onCustomColorChange}
          tempThemeMode={tempThemeMode}
          tempCustomColor={tempCustomColor}
          onThemeModeChange={setTempThemeMode}
          onCustomColorChange={setTempCustomColor}
          previewMode={true}
        />
      </div>
    </Drawer>
  );
};

export default LayoutPreview;
