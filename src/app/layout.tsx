"use client";

import "@/app/globals.css";
import { Inter } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme } from "antd";
import { usePathname } from "next/navigation";
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

  return (
    <html lang="zh-CN">
      <head>
        <title>react后台管理系统</title>
        <meta name="description" content="展示不同的布局选项和主题设置" />
      </head>
      <body
        className={`${inter.className} overflow-auto antialiased light-mode`}
      >
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#006bfa",
                borderRadius: 6,
              },
              algorithm: theme.defaultAlgorithm,
            }}
          >
            <BreadcrumbProvider>
              {isLoginPage ? (
                children
              ) : (
                <AuthGuard>
                  <MainLayout>{children}</MainLayout>
                </AuthGuard>
              )}
            </BreadcrumbProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
