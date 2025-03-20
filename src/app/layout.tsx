"use client";

import "@/app/globals.css";
import "@/styles/darkModeEnhancements.css";
import "@/styles/darkModeWrapperStyles.css";
import { Inter } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme } from "antd";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import MainLayout from "@/components/layouts/MainLayout";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-mode');
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
    
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <html lang="zh-CN">
      <head>
        <title>react后台管理系统</title>
        <meta name="description" content="展示不同的布局选项和主题设置" />
      </head>
      <body
        className={`${inter.className} overflow-auto antialiased ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
        data-theme={isDarkMode ? 'dark' : 'light'}
      >
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#006bfa",
                borderRadius: 6,
              },
              algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
            }}
          >
            <BreadcrumbProvider>
              {isLoginPage ? (
                children
              ) : (
                <AuthGuard>
                  <MainLayout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                    {children}
                  </MainLayout>
                </AuthGuard>
              )}
            </BreadcrumbProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
