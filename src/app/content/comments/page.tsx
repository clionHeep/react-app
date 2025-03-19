'use client';

import React, { useState } from 'react';

export default function CommentsPage() {
  // 模拟评论数据
  const [comments, setComments] = useState([
    { id: 1, content: '非常实用的功能，感谢分享！', author: '用户A', article: '系统使用指南', status: '已审核', date: '2023-06-15 14:30' },
    { id: 2, content: '这个更新解决了我之前遇到的问题。', author: '用户B', article: '新功能介绍：数据分析模块', status: '已审核', date: '2023-06-14 09:45' },
    { id: 3, content: '按照指南操作后效率确实提高了不少。', author: '用户C', article: '如何提高工作效率', status: '待审核', date: '2023-06-13 16:20' },
    { id: 4, content: '希望能提供更多类似的案例分享。', author: '用户D', article: '客户案例分享', status: '已审核', date: '2023-06-12 10:15' },
    { id: 5, content: '期待新的系统更新！', author: '用户E', article: '年度系统更新计划', status: '待审核', date: '2023-06-11 17:50' },
    { id: 6, content: '这个工具太棒了，提高了我的工作效率！', author: '用户F', article: '如何提高工作效率', status: '已拒绝', date: '2023-06-10 13:25' },
  ]);

  const [statusFilter, setStatusFilter] = useState('全部');

  // 处理评论审核
  const handleApprove = (id: number) => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, status: '已审核' } : comment
    ));
  };

  // 处理评论拒绝
  const handleReject = (id: number) => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, status: '已拒绝' } : comment
    ));
  };

  // 处理评论删除
  const handleDelete = (id: number) => {
    setComments(comments.filter(comment => comment.id !== id));
  };

  // 过滤评论
  const filteredComments = comments.filter(comment => {
    return statusFilter === '全部' || comment.status === statusFilter;
  });

  return (
    <div style={{ padding: 24, borderRadius: 8 }}>
      <h1>评论管理</h1>
      <p>管理系统内文章的所有评论</p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
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
            <option value="已审核">已审核</option>
            <option value="待审核">待审核</option>
            <option value="已拒绝">已拒绝</option>
          </select>
        </div>
        
        <div>
          <span style={{ marginRight: '8px', color: '#888' }}>
            共 {filteredComments.length} 条评论
          </span>
          <button style={{
            padding: '8px 16px',
            background: '#52c41a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '8px'
          }} onClick={() => {
            const pendingComments = comments.filter(c => c.status === '待审核');
            if (pendingComments.length > 0) {
              setComments(comments.map(comment => 
                comment.status === '待审核' ? { ...comment, status: '已审核' } : comment
              ));
            }
          }}>
            全部审核通过
          </button>
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>ID</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>内容</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>用户</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>文章</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>状态</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>时间</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredComments.map(comment => (
              <tr key={comment.id} style={{ borderBottom: '1px solid #e8e8e8' }}>
                <td style={{ padding: '12px 16px' }}>{comment.id}</td>
                <td style={{ padding: '12px 16px', maxWidth: '300px' }}>{comment.content}</td>
                <td style={{ padding: '12px 16px' }}>{comment.author}</td>
                <td style={{ padding: '12px 16px' }}>{comment.article}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    background: comment.status === '已审核' ? '#f6ffed' : 
                               comment.status === '待审核' ? '#e6f7ff' : '#fff2f0',
                    color: comment.status === '已审核' ? '#52c41a' : 
                          comment.status === '待审核' ? '#1890ff' : '#ff4d4f'
                  }}>
                    {comment.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>{comment.date}</td>
                <td style={{ padding: '12px 16px' }}>
                  {comment.status === '待审核' && (
                    <>
                      <button style={{
                        marginRight: '8px',
                        padding: '4px 8px',
                        background: '#52c41a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }} onClick={() => handleApprove(comment.id)}>
                        通过
                      </button>
                      <button style={{
                        marginRight: '8px',
                        padding: '4px 8px',
                        background: '#ff4d4f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }} onClick={() => handleReject(comment.id)}>
                        拒绝
                      </button>
                    </>
                  )}
                  <button style={{
                    padding: '4px 8px',
                    background: '#fa8c16',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }} onClick={() => handleDelete(comment.id)}>
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