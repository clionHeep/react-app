'use client';

import React from 'react';
import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此页面。"
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