'use client';

import React from 'react';

export default function WorkspacePage() {
  return (
    <div style={{ padding: 24, borderRadius: 8 }}>
      <h1>工作台</h1>
      <p>这是您的个人工作台，提供快速访问常用功能和最近的工作项目。</p>
      
      <div style={{ marginTop: 24 }}>
        <h2>快速操作</h2>
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          flexWrap: 'wrap',
          marginTop: 16
        }}>
          {['创建项目', '添加用户', '数据导入', '系统设置'].map((item, index) => (
            <button key={index} style={{ 
              padding: '12px 20px', 
              background: '#1890ff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              {item}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: 32 }}>
        <h2>最近项目</h2>
        <div style={{ marginTop: 16 }}>
          {['用户管理系统升级', '数据分析报表', '营销活动策划', '系统性能优化'].map((item, index) => (
            <div key={index} style={{ 
              padding: '16px 20px', 
              background: '#f5f5f5',
              borderRadius: 8,
              marginBottom: 12
            }}>
              <div style={{ fontSize: 16, fontWeight: 'bold' }}>{item}</div>
              <div style={{ 
                fontSize: 14, 
                color: '#888',
                marginTop: 8,
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>最后更新: 2小时前</span>
                <span>进度: {Math.floor(Math.random() * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
