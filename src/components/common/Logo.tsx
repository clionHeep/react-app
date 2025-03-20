"use client"; // 明确标记为客户端组件

import React from "react";
import { theme } from "antd";

interface LogoProps {
  collapsed?: boolean;
}

const Logo: React.FC<LogoProps> = ({ collapsed }) => {
  // 使用 Ant Design 的主题系统获取颜色
  const { token } = theme.useToken();

  // 使用完全静态的样式
  const logoStyle = {
    width: collapsed ? 32 : 120,
    height: 32,
    background: token.colorPrimary, // 使用主题颜色而不是硬编码值
    borderRadius: token.borderRadiusLG, // 使用主题的圆角值
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: collapsed ? 16 : 20,
    fontWeight: "bold",
    transition: "all 0.2s",
  };

  return (
    <div style={logoStyle} suppressHydrationWarning>
      {collapsed ? "A" : "Admin Pro"}
    </div>
  );
};

export default Logo;
