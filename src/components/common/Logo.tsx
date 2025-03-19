"use client"; // 明确标记为客户端组件

import React from "react";

interface LogoProps {
  collapsed?: boolean;
}

const Logo: React.FC<LogoProps> = ({ collapsed }) => {
  // 使用完全静态的样式
  const logoStyle = {
    width: collapsed ? 32 : 120,
    height: 32,
    background: "#1890ff",
    borderRadius: 6,
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
