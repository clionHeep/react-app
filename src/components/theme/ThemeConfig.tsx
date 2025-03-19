import React from "react";
import { Flex, Radio, ColorPicker, Space, Button, Tooltip } from "antd";
import type { Color } from "antd/es/color-picker";
import {
  SunOutlined,
  MoonOutlined,
  BgColorsOutlined,
  CheckOutlined,
} from "@ant-design/icons";

// 默认主题颜色
const DEFAULT_COLOR = "#1890ff";

interface ThemeConfigProps {
  themeMode?: "light" | "dark" | "custom";
  customColor?: string;
  setThemeMode?: (mode: "light" | "dark" | "custom") => void;
  setCustomColor?: (color: string) => void;
  tempThemeMode?: "light" | "dark" | "custom";
  tempCustomColor?: string;
  onThemeModeChange?: (mode: "light" | "dark" | "custom") => void;
  onCustomColorChange?: (color: string) => void;
  previewMode?: boolean;
}

const ThemeConfig: React.FC<ThemeConfigProps> = ({
  themeMode = "light",
  customColor = "#1890ff",
  setThemeMode = () => {},
  setCustomColor = () => {},
  tempThemeMode,
  tempCustomColor,
  onThemeModeChange,
  onCustomColorChange,
  previewMode = false,
}) => {
  // 根据是否处于预览模式决定使用临时状态还是全局状态
  const currentThemeMode = previewMode ? (tempThemeMode || themeMode) : themeMode;
  const currentCustomColor = previewMode ? (tempCustomColor || customColor) : customColor;

  const handleThemeChange = (value: "light" | "dark" | "custom") => {
    // 当切换到非自定义主题模式时，恢复默认颜色
    if (value !== "custom") {
      if (previewMode && onCustomColorChange) {
        onCustomColorChange(DEFAULT_COLOR);
      } else {
        setCustomColor(DEFAULT_COLOR);
      }
    }
    
    if (previewMode && onThemeModeChange) {
      onThemeModeChange(value);
    } else {
      setThemeMode(value);
    }
  };

  const handleCustomColorChange = (color: Color | string) => {
    let hexColor: string;
    
    if (typeof color === "string") {
      hexColor = color;
    } else if (color && typeof color === "object" && "toHexString" in color) {
      hexColor = color.toHexString();
    } else {
      return;
    }
    
    if (previewMode && onCustomColorChange) {
      onCustomColorChange(hexColor);
    } else {
      setCustomColor(hexColor);
    }
  };

  const handlePresetColorSelect = (color: string) => {
    if (previewMode && onCustomColorChange) {
      onCustomColorChange(color);
    } else {
      setCustomColor(color);
    }
  };

  // 使用固定尺寸的样式
  const containerStyle: React.CSSProperties = {
    padding: 16,
    width: "100%",
    minHeight: 200, // 确保容器有最小高度
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 24,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 14,
    marginBottom: 16,
    color: "inherit",
    height: 20, // 固定标题高度
    lineHeight: "20px",
  };

  const buttonStyle = {
    flex: 1,
    height: 32,
    minHeight: 32,
    maxHeight: 32,
    padding: "4px 15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    fontSize: 12,
    lineHeight: "20px",
    whiteSpace: "nowrap" as const,
    transition: "all 0.2s",
  };

  const colorButtonStyle = {
    width: 36,
    height: 36,
    minHeight: 36,
    maxHeight: 36,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  };

  const recommendedColors = [
    "#1890ff", // 蓝色
    "#13c2c2", // 青色
    "#52c41a", // 绿色
    "#faad14", // 黄色
    "#fa8c16", // 橙色
  ];

  return (
    <div style={containerStyle}>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <section style={sectionStyle}>
          <div style={titleStyle}>主题模式</div>
          <Radio.Group
            value={currentThemeMode}
            onChange={(e) => handleThemeChange(e.target.value)}
            style={{ width: "100%" }}
          >
            <Flex gap="middle" style={{ width: "100%", height: 32 }}>
              {[
                {
                  value: "light",
                  label: "浅色",
                  icon: <SunOutlined style={{ fontSize: 14 }} />,
                },
                {
                  value: "dark",
                  label: "深色",
                  icon: <MoonOutlined style={{ fontSize: 14 }} />,
                },
                {
                  value: "custom",
                  label: "自定义",
                  icon: <BgColorsOutlined style={{ fontSize: 14 }} />,
                },
              ].map((item) => (
                <Radio.Button
                  key={item.value}
                  value={item.value}
                  style={buttonStyle}
                >
                  {item.icon}
                  <span style={{ fontSize: 12, lineHeight: "20px" }}>
                    {item.label}
                  </span>
                </Radio.Button>
              ))}
            </Flex>
          </Radio.Group>
        </section>

        {currentThemeMode === "custom" && (
          <section style={sectionStyle}>
            <div style={titleStyle}>主题色</div>
            <Flex
              wrap="wrap"
              gap="small"
              style={{ marginBottom: 16, minHeight: 36 }}
            >
              {recommendedColors.map((color) => (
                <Tooltip title={color} key={color}>
                  <Button
                    type="text"
                    style={{
                      ...colorButtonStyle,
                      backgroundColor: color,
                      color: "#fff",
                      border: currentCustomColor === color ? "2px solid #fff" : "none",
                      boxShadow:
                        currentCustomColor === color ? "0 0 0 2px " + color : "none",
                    }}
                    onClick={() => handlePresetColorSelect(color)}
                  >
                    {currentCustomColor === color && <CheckOutlined />}
                  </Button>
                </Tooltip>
              ))}
              <ColorPicker
                format="hex"
                value={currentCustomColor}
                onChange={handleCustomColorChange}
                trigger="click"
                presets={[
                  {
                    label: "推荐",
                    colors: recommendedColors,
                  },
                ]}
              >
                <Tooltip title="自定义颜色">
                  <Button
                    type="text"
                    style={{
                      ...colorButtonStyle,
                      backgroundColor: recommendedColors.includes(currentCustomColor)
                        ? "#f0f0f0"
                        : currentCustomColor,
                      color: recommendedColors.includes(currentCustomColor)
                        ? "#000"
                        : "#fff",
                      border: "1px dashed #d9d9d9",
                    }}
                  >
                    <BgColorsOutlined />
                  </Button>
                </Tooltip>
              </ColorPicker>
            </Flex>
          </section>
        )}
      </Space>
    </div>
  );
};

export default ThemeConfig;
