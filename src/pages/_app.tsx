import React, { useState } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { RouterProvider } from '@/routes/AppRouter';
import CustomLayout from '@/layouts/CustomLayout';
import RouteRenderer from '@/routes/AppRouter';
import zhCN from 'antd/locale/zh_CN';
import '@/styles/globals.css';

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // 动态切换主题
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: darkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <RouterProvider>
        <CustomLayout 
          collapsed={collapsed} 
          setCollapsed={setCollapsed}
          onLayoutPreviewOpen={toggleTheme}
        >
          <RouteRenderer />
        </CustomLayout>
      </RouterProvider>
    </ConfigProvider>
  );
};

export default App; 