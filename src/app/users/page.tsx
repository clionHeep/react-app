'use client';

import React, { useState } from 'react';

export default function UsersPage() {
  // 模拟用户数据
  const [users, setUsers] = useState([
    { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员', department: '技术部', status: '活跃', lastLogin: '2023-06-15 10:30' },
    { id: 2, name: '李四', email: 'lisi@example.com', role: '用户', department: '市场部', status: '活跃', lastLogin: '2023-06-14 16:45' },
    { id: 3, name: '王五', email: 'wangwu@example.com', role: '用户', department: '财务部', status: '休眠', lastLogin: '2023-05-20 09:15' },
    { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: '用户', department: '人力资源', status: '活跃', lastLogin: '2023-06-15 14:20' },
    { id: 5, name: '钱七', email: 'qianqi@example.com', role: '开发者', department: '技术部', status: '活跃', lastLogin: '2023-06-15 11:30' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('全部');

  // 处理用户删除
  const handleDelete = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
  };

  // 处理用户状态切换
  const handleToggleStatus = (id: number) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: user.status === '活跃' ? '休眠' : '活跃' } : user
    ));
  };

  // 过滤用户
  const filteredUsers = users.filter(user => {
    return (
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === '全部' || user.role === roleFilter)
    );
  });

  return (
    <div style={{ padding: 24, borderRadius: 8 }}>
      <h1>用户管理</h1>
      <p>管理系统内的所有用户账户</p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <input
            type="text"
            placeholder="搜索用户..."
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9'
            }}
          >
            <option value="全部">全部角色</option>
            <option value="管理员">管理员</option>
            <option value="用户">用户</option>
            <option value="开发者">开发者</option>
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
          添加用户
        </button>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>ID</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>姓名</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>邮箱</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>角色</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>部门</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>状态</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>最后登录</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #e8e8e8' }}>
                <td style={{ padding: '12px 16px' }}>{user.id}</td>
                <td style={{ padding: '12px 16px' }}>{user.name}</td>
                <td style={{ padding: '12px 16px' }}>{user.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    background: user.role === '管理员' ? '#f6ffed' : 
                                user.role === '开发者' ? '#fff7e6' : '#e6f7ff',
                    color: user.role === '管理员' ? '#52c41a' : 
                           user.role === '开发者' ? '#fa8c16' : '#1890ff'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>{user.department}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    color: user.status === '活跃' ? '#52c41a' : '#d9d9d9'
                  }}>
                    <span style={{ 
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: user.status === '活跃' ? '#52c41a' : '#d9d9d9'
                    }}></span>
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>{user.lastLogin}</td>
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
                    marginRight: '8px',
                    padding: '4px 8px',
                    background: user.status === '活跃' ? '#faad14' : '#52c41a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }} onClick={() => handleToggleStatus(user.id)}>
                    {user.status === '活跃' ? '禁用' : '启用'}
                  </button>
                  <button style={{
                    padding: '4px 8px',
                    background: '#ff4d4f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }} onClick={() => handleDelete(user.id)}>
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