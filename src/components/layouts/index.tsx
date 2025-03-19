"use client";

import React, { useState } from "react";
import { Layout } from "antd";
import TopLayout from "../../layouts/TopLayout";
import SideLayout from "../../layouts/SideLayout";
import MixLayout from "../../layouts/MixLayout";
import CustomLayout from "../../layouts/CustomLayout";
import LayoutPreview from "./preview/LayoutPreview";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";
import { LayoutType } from "@/types";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [layoutType, setLayoutType] = useState<LayoutType>("side"); // 默认侧边布局
  const [layoutPreviewOpen, setLayoutPreviewOpen] = useState(false);

  const handleLayoutPreviewOpen = () => {
    setLayoutPreviewOpen(true);
  };

  const handleLayoutPreviewClose = () => {
    setLayoutPreviewOpen(false);
  };

  const handleLayoutTypeChange = (type: LayoutType) => {
    setLayoutType(type);
    handleLayoutPreviewClose();
  };

  // 根据布局类型渲染不同的布局组件
  const renderLayout = () => {
    switch (layoutType) {
      case "top":
        return (
          <TopLayout
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onLayoutPreviewOpen={handleLayoutPreviewOpen}
          >
            {children}
          </TopLayout>
        );
      case "side":
        return (
          <SideLayout
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onLayoutPreviewOpen={handleLayoutPreviewOpen}
          >
            {children}
          </SideLayout>
        );
      case "mix":
        return (
          <MixLayout
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onLayoutPreviewOpen={handleLayoutPreviewOpen}
          >
            {children}
          </MixLayout>
        );
      case "custom":
        return (
          <CustomLayout
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onLayoutPreviewOpen={handleLayoutPreviewOpen}
          >
            {children}
          </CustomLayout>
        );
      default:
        return (
          <SideLayout
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onLayoutPreviewOpen={handleLayoutPreviewOpen}
          >
            {children}
          </SideLayout>
        );
    }
  };

  return (
    <BreadcrumbProvider>
      <Layout style={{ minHeight: "100vh" }}>
        {renderLayout()}
        {layoutPreviewOpen && (
          <LayoutPreview
            isOpen={layoutPreviewOpen}
            onClose={handleLayoutPreviewClose}
            onLayoutSelect={handleLayoutTypeChange}
            currentLayout={layoutType}
            currentThemeMode="light"
            currentCustomColor="#1890ff"
            onThemeModeChange={() => {
              // 处理主题模式变更
            }}
            onCustomColorChange={() => {
              // 处理自定义颜色变更
            }}
          />
        )}
      </Layout>
    </BreadcrumbProvider>
  );
};

export default MainLayout;
