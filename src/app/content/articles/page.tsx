'use client';

import React, { useState } from 'react';

export default function ArticlesPage() {
  // 模拟文章数据
  const [articles, setArticles] = useState([
    { id: 1, title: '系统使用指南', author: '管理员', status: '已发布', date: '2023-04-15', category: '帮助文档' },
    { id: 2, title: '新功能介绍：数据分析模块', author: '产品经理', status: '已发布', date: '2023-05-20', category: '产品更新' },
    { id: 3, title: '如何提高工作效率', author: '系统顾问', status: '草稿', date: '2023-06-05', category: '最佳实践' },
    { id: 4, title: '客户案例分享', author: '市场部', status: '审核中', date: '2023-06-10', category: '案例研究' },
    { id: 5, title: '年度系统更新计划', author: '产品经理', status: '草稿', date: '2023-06-18', category: '产品更新' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');

  // 处理文章删除
  const handleDelete = (id: number) => {
    setArticles(articles.filter(article => article.id !== id));
  };

  // 过滤文章
  const filteredArticles = articles.filter(article => {
    return (
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === '全部' || article.status === statusFilter)
    );
  });

  return (
    <div style={{ padding: 24, borderRadius: 8 }}>
      <h1>文章管理</h1>
      <p>管理系统内的所有文章内容</p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <input
            type="text"
            placeholder="搜索文章..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              width: '300px'
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9'
            }}
          >
            <option value="全部">全部状态</option>
            <option value="已发布">已发布</option>
            <option value="草稿">草稿</option>
            <option value="审核中">审核中</option>
          </select>
        </div>
        
        <button style={{
          padding: '8px 16px',
          background: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          新建文章
        </button>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>ID</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>标题</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>作者</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>分类</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>状态</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>发布日期</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map(article => (
              <tr key={article.id} style={{ borderBottom: '1px solid #e8e8e8' }}>
                <td style={{ padding: '12px 16px' }}>{article.id}</td>
                <td style={{ padding: '12px 16px' }}>{article.title}</td>
                <td style={{ padding: '12px 16px' }}>{article.author}</td>
                <td style={{ padding: '12px 16px' }}>{article.category}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    background: article.status === '已发布' ? '#e6f7ff' : 
                                article.status === '草稿' ? '#f9f0ff' : '#fff7e6',
                    color: article.status === '已发布' ? '#1890ff' : 
                           article.status === '草稿' ? '#722ed1' : '#fa8c16'
                  }}>
                    {article.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>{article.date}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button style={{
                    marginRight: '8px',
                    padding: '4px 8px',
                    background: '#1890ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    编辑
                  </button>
                  <button style={{
                    padding: '4px 8px',
                    background: '#ff4d4f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }} onClick={() => handleDelete(article.id)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 