"use client";

import React from "react";
import { theme } from "antd";
import { isDarkMode, getThemeCardStyles } from "@/styles/themeUtils";

export default function AnalyticsPage() {
  const { token } = theme.useToken();
  const darkMode = isDarkMode(token);
  
  // 使用全局主题卡片样式
  const cardStyles = getThemeCardStyles(token);

  return (
    <div style={{ padding: 24, borderRadius: 8 }}>
      <h1>数据分析</h1>
      <p>这是数据分析页面，显示各种数据分析图表和统计信息。</p>

      <div style={{ marginTop: 24 }}>
        <h2>主要指标</h2>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginTop: 16,
          }}
        >
          {[
            { title: "访问量", value: "12,846", change: "+12%" },
            { title: "用户数", value: "2,458", change: "+8%" },
            { title: "转化率", value: "3.2%", change: "+0.5%" },
            { title: "平均停留时间", value: "4:35", change: "+0:42" },
          ].map((item, index) => (
            <div
              key={index}
              style={{
                ...cardStyles,
                minWidth: 180,
              }}
            >
              <div style={{ 
                fontSize: 14, 
                color: darkMode ? "rgba(255, 255, 255, 0.65)" : "#666" 
              }}>
                {item.title}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  marginTop: 8,
                  color: darkMode ? "rgba(255, 255, 255, 0.95)" : "inherit",
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  // 使用主题色的相关变量表示变化
                  color: item.change.startsWith("+") 
                    ? token.colorSuccess || (darkMode ? "#6ece3a" : "#52c41a")
                    : token.colorError || (darkMode ? "#ff6b61" : "#f5222d"),
                  marginTop: 4,
                }}
              >
                {item.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
