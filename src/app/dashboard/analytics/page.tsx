'use client';

import React from 'react';

export default function AnalyticsPage() {
  return (
    <div style={{ padding: 24, borderRadius: 8 }}>
      <h1>数据分析</h1>
      <p>这是数据分析页面，显示各种数据分析图表和统计信息。</p>
      
      <div style={{ marginTop: 24 }}>
        <h2>主要指标</h2>
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          flexWrap: 'wrap',
          marginTop: 16
        }}>
          {[
            { title: '访问量', value: '12,846', change: '+12%' },
            { title: '用户数', value: '2,458', change: '+8%' },
            { title: '转化率', value: '3.2%', change: '+0.5%' },
            { title: '平均停留时间', value: '4:35', change: '+0:42' }
          ].map((item, index) => (
            <div key={index} style={{ 
              padding: '16px 20px', 
              background: '#f5f5f5',
              borderRadius: 8,
              minWidth: 180
            }}>
              <div style={{ fontSize: 14, color: '#666' }}>{item.title}</div>
              <div style={{ 
                fontSize: 24, 
                fontWeight: 'bold',
                marginTop: 8
              }}>{item.value}</div>
              <div style={{ 
                fontSize: 12, 
                color: item.change.startsWith('+') ? '#52c41a' : '#f5222d',
                marginTop: 4
              }}>{item.change}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
