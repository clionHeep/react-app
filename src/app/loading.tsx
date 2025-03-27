'use client';

import { Spin } from 'antd';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
      <div className="text-center p-8 rounded-lg bg-white/80 shadow-sm backdrop-blur-sm">
        <Spin size="large">
          <div style={{ padding: '30px', textAlign: 'center' }}>
            <div className="text-gray-600 mt-3">正在加载内容...</div>
          </div>
        </Spin>
      </div>
    </div>
  );
}
