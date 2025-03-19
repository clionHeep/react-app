'use client';

import React from 'react';

export default function MyAppsPage() {
  // 模拟我的应用数据
  const myApps = [
    { id: 1, name: '数据分析工具', status: '已安装', lastUsed: '今天', version: '1.2.3' },
    { id: 2, name: '项目管理系统', status: '已安装', lastUsed: '昨天', version: '2.0.1' },
    { id: 3, name: '内容管理系统', status: '需要更新', lastUsed: '3天前', version: '0.9.5' },
  ];

  return (
    <div style={{ padding: 24, borderRadius: 8 }}>
      <h1>我的应用</h1>
      <p>管理已安装的应用程序</p>
      
      <div style={{ marginTop: 24 }}>
        {myApps.map(app => (
          <div 
            key={app.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '12px',
              background: 'white',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              border: '1px solid #f0f0f0'
            }}
          >
            <div>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '8px', 
                background: `hsl(${app.id * 60}, 70%, 85%)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '18px',
                color: `hsl(${app.id * 60}, 70%, 35%)`,
                fontWeight: 'bold'
              }}>
                {app.name.charAt(0)}
              </div>
            </div>
            
            <div style={{ flex: 1, marginLeft: '16px' }}>
              <div style={{ fontWeight: 'bold' }}>{app.name}</div>
              <div style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>
                版本: {app.version}
              </div>
            </div>
            
            <div style={{ marginRight: '16px', color: '#888', fontSize: '14px' }}>
              上次使用: {app.lastUsed}
            </div>
            
            <div>
              {app.status === '需要更新' ? (
                <button style={{
                  padding: '6px 12px',
                  background: '#fa8c16',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  更新
                </button>
              ) : (
                <button style={{
                  padding: '6px 12px',
                  background: '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  打开
                </button>
              )}
              <button style={{
                marginLeft: '8px',
                padding: '6px 12px',
                background: 'transparent',
                color: '#888',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                卸载
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 