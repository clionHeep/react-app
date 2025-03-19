'use client';

import React from 'react';

export default function AppStorePage() {
  // 模拟应用数据
  const apps = [
    { id: 1, name: '数据分析工具', desc: '强大的数据处理和分析功能', rating: 4.8, category: '数据工具' },
    { id: 2, name: '项目管理系统', desc: '团队协作与任务管理平台', rating: 4.6, category: '协作工具' },
    { id: 3, name: '客户关系管理', desc: '客户数据与销售流程管理', rating: 4.7, category: '管理工具' },
    { id: 4, name: '内容管理系统', desc: '多媒体内容管理与发布平台', rating: 4.5, category: '内容工具' },
    { id: 5, name: '自动化营销', desc: '营销流程自动化与数据分析', rating: 4.4, category: '营销工具' },
    { id: 6, name: '人力资源系统', desc: '员工管理与绩效评估平台', rating: 4.3, category: '管理工具' },
  ];

  return (
    <div style={{ padding: 24, borderRadius: 8 }}>
      <h1>应用市场</h1>
      <p>浏览并安装各种应用以扩展系统功能</p>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '24px'
      }}>
        {apps.map(app => (
          <div 
            key={app.id}
            style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              transition: 'transform 0.2s',
              cursor: 'pointer',
              border: '1px solid #eee'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{ height: '140px', background: `hsl(${app.id * 60}, 70%, 85%)`, position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                bottom: '10px',
                left: '16px',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {app.category}
              </div>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{app.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fa8c16' }}>★</span>
                  <span style={{ fontSize: '14px', marginLeft: '4px' }}>{app.rating}</span>
                </div>
              </div>
              <p style={{ margin: '8px 0 0', color: '#666', fontSize: '14px' }}>{app.desc}</p>
              <button style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}>
                安装应用
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
