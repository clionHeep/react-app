'use client';

import React from 'react';
import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在。"
        extra={
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button type="primary" onClick={() => router.push('/')}>
              返回首页
            </Button>
            <Button onClick={() => router.back()}>
              返回上一页
            </Button>
          </div>
        }
      />
    </div>
  );
} 