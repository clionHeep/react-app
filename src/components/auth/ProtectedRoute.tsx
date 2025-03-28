"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";

// 动态导入Loading组件
const Loading = dynamic(() => import("../../app/loading"));

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const [shouldRender, setShouldRender] = useState(false);

  // 处理未认证状态的函数，使用useCallback包装以避免依赖循环
  const handleUnauthenticated = useCallback(() => {
    // 避免频繁重定向
    if (hasRedirected.current) {
      return;
    }

    console.log("ProtectedRoute: 用户未认证，准备重定向到登录页");
    hasRedirected.current = true;

    // 检查当前是否已经在登录页
    if (!pathname.includes("/login")) {
      // 使用replace而不是push，防止历史堆栈问题
      router.replace(`/login?from=${encodeURIComponent(pathname || "")}`);
    }

    setShouldRender(false);
  }, [pathname, router]);

  useEffect(() => {
    // 如果已认证，可以直接渲染
    if (isAuthenticated) {
      setShouldRender(true);
      hasRedirected.current = false;
      return;
    }

    // 如果还在加载中，等待加载完成
    if (isLoading) {
      return;
    }

    // 加载完成但未认证，检查是否有token
    const hasToken =
      typeof window !== "undefined" && !!localStorage.getItem("accessToken");

    // 如果有token但未认证，等待一下状态同步
    if (hasToken && !isAuthenticated) {
      console.log("发现token但认证状态未更新，等待状态同步...");
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          handleUnauthenticated();
        } else {
          setShouldRender(true);
        }
      }, 500);

      return () => clearTimeout(timer);
    }

    // 没有token且未认证，重定向到登录页
    if (!hasToken && !isAuthenticated) {
      handleUnauthenticated();
    }
  }, [isAuthenticated, isLoading, pathname, handleUnauthenticated]);

  // 如果正在加载，使用全局Loading组件
  if (isLoading) {
    return <Loading />;
  }

  // 如果未登录或不应该渲染，返回null
  if (!isAuthenticated || !shouldRender) {
    return null;
  }

  // 已登录，渲染子组件
  return <>{children}</>;
}
