"use client";

import "@/styles/globals.css";
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
import { AuthProvider } from "@/context/AuthContext";
import { MessageProvider } from '@/providers/MessageProvider';
import ReduxProvider from "@/hooks/redux/ReduxProvider";

const inter = Inter({ subsets: ["latin"] });

// 公开路由列表
const PUBLIC_ROUTES = ['/login', '/register', '/auth/login', '/auth/register', '/(auth)/login', '/(auth)/register'];

// 简单判断是否是公开路由
function isPublicPath(path: string | null): boolean {
  if (!path) return false;
  
  // 根路径不是公开路由
  if (path === '/') return false;
  
  // 检查是否是登录/注册相关路由
  for (const route of PUBLIC_ROUTES) {
    // 完全匹配
    if (path === route) return true;
    
    // 前缀匹配
    if (path.startsWith(`${route}/`)) return true;
  }
  
  // 检查是否是认证组路由
  if (path.startsWith('/(auth)') || path.startsWith('/auth/')) {
    return true;
  }
  
  return false;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = isPublicPath(pathname);

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme-mode");

    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkMode(prefersDark);
    }

    document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <html lang="zh-CN">
      <head>
        <title>react后台管理系统</title>
        <meta name="description" content="展示不同的布局选项和主题设置" />
      </head>
      <body
        data-theme={isDarkMode ? "dark" : "light"}
        className={`${inter.className} min-h-screen`}
      >
        <AntdRegistry>
          <ReduxProvider>
            <ConfigProvider
              theme={{
                algorithm: isDarkMode
                  ? theme.darkAlgorithm
                  : theme.defaultAlgorithm,
                components: {
                  Layout: {
                    bodyBg: isDarkMode ? "#141414" : "#f0f2f5",
                    lightSiderBg: isDarkMode ? "#1f1f1f" : "#fff",
                    headerBg: isDarkMode ? "#141414" : "#fff",
                    siderBg: isDarkMode ? "#1f1f1f" : "#fff",
                  },
                },
              }}
            >
              <MessageProvider>
                <BreadcrumbProvider>
                  <AuthProvider>
                    {isLoginPage ? (
                      children
                    ) : (
                      <AuthGuard>
                        <MainLayout>{children}</MainLayout>
                      </AuthGuard>
                    )}
                  </AuthProvider>
                </BreadcrumbProvider>
              </MessageProvider>
            </ConfigProvider>
          </ReduxProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
