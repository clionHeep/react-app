'use client';

import React from 'react';
import { Button, Result } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <div className="flex items-center justify-center min-h-screen">
            <Result
              status="500"
              title="应用错误"
              subTitle="抱歉，应用发生了错误。"
              extra={
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button type="primary" onClick={() => reset()}>
                    重试
                  </Button>
                  <Button onClick={() => window.location.href = '/'}>
                    返回首页
                  </Button>
                </div>
              }
            >
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-gray-100 rounded text-left overflow-auto max-h-48 text-sm">
                  <p className="text-red-600 font-semibold">错误信息：</p>
                  <p>{error.message}</p>
                  {error.stack && (
                    <>
                      <p className="text-red-600 font-semibold mt-2">堆栈跟踪：</p>
                      <pre className="text-xs overflow-auto">{error.stack}</pre>
                    </>
                  )}
                </div>
              )}
            </Result>
          </div>
        </AntdRegistry>
      </body>
    </html>
  );
} 