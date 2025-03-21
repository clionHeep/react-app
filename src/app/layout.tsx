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
import { isPublicRoute } from "@/config/routes";
import { MessageProvider } from '@/providers/MessageProvider';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = isPublicRoute(pathname);

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
                {isLoginPage ? (
                  children
                ) : (
                  <AuthGuard>
                    <MainLayout>{children}</MainLayout>
                  </AuthGuard>
                )}
              </BreadcrumbProvider>
            </MessageProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
