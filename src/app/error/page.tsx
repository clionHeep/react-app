'use client';

import React from 'react';
import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Result
        status="500"
        title="500"
        subTitle="抱歉，服务器出现了错误。"
        extra={
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button type="primary" onClick={() => router.push('/')}>
              返回首页
            </Button>
            <Button onClick={() => router.back()}>
              返回上一页
            </Button>
            <Button onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          </div>
        }
      />
    </div>
  );
} 