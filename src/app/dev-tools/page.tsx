'use client';

import React, { useState } from 'react';

export default function DevToolsPage() {
  const [activeTab, setActiveTab] = useState('apiTest');
  const [endpoint, setEndpoint] = useState('/api/users');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState('// 响应将显示在这里');
  const [requestStatus, setRequestStatus] = useState<'success' | 'error' | 'loading' | null>(null);
  
  // SQL查询相关状态
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [sqlResult, setSqlResult] = useState('-- 结果将显示在这里');
  
  // 日志查询相关状态
  const [logType, setLogType] = useState('application');
  const [logLevel, setLogLevel] = useState('all');
  const [logKeyword, setLogKeyword] = useState('');
  const [logResult, setLogResult] = useState('// 日志将显示在这里');

  // 处理API测试
  const handleApiTest = () => {
    setRequestStatus('loading');
    // 模拟API请求
    setTimeout(() => {
      let mockResponse;
      
      if (endpoint === '/api/users' && method === 'GET') {
        mockResponse = {
          status: 200,
          data: [
            { id: 1, name: '张三', email: 'zhangsan@example.com' },
            { id: 2, name: '李四', email: 'lisi@example.com' }
          ]
        };
      } else if (endpoint === '/api/users' && method === 'POST') {
        mockResponse = {
          status: 201,
          data: { id: 3, ...JSON.parse(requestBody || '{}') }
        };
      } else if (endpoint === '/api/login' && method === 'POST') {
        mockResponse = {
          status: 200,
          data: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
        };
      } else {
        mockResponse = {
          status: 404,
          error: 'Not Found',
          message: '未找到该接口或方法不支持'
        };
      }
      
      setResponse(JSON.stringify(mockResponse, null, 2));
      setRequestStatus(mockResponse.status >= 200 && mockResponse.status < 300 ? 'success' : 'error');
    }, 800);
  };

  // 处理SQL查询
  const handleSqlQuery = () => {
    // 模拟SQL查询
    setTimeout(() => {
      if (sqlQuery.toLowerCase().includes('select * from users')) {
        setSqlResult(`-- 查询成功，返回 5 条记录
| id | name  | email               | created_at          |
|----|-------|---------------------|---------------------|
| 1  | 张三  | zhangsan@example.com | 2023-05-10 14:30:00 |
| 2  | 李四  | lisi@example.com     | 2023-05-12 09:45:22 |
| 3  | 王五  | wangwu@example.com   | 2023-05-15 16:20:10 |
| 4  | 赵六  | zhaoliu@example.com  | 2023-05-18 11:05:33 |
| 5  | 钱七  | qianqi@example.com   | 2023-05-20 08:15:45 |`);
      } else if (sqlQuery.toLowerCase().includes('select * from orders')) {
        setSqlResult(`-- 查询成功，返回 3 条记录
| id | user_id | total  | status   | created_at          |
|----|---------|--------|----------|---------------------|
| 1  | 2       | 199.99 | 已完成   | 2023-06-01 10:30:00 |
| 2  | 1       | 299.50 | 已发货   | 2023-06-05 14:22:15 |
| 3  | 3       | 599.00 | 待付款   | 2023-06-10 09:15:30 |`);
      } else {
        setSqlResult(`-- 查询语法错误或表不存在
ERROR 1064 (42000): You have an error in your SQL syntax`);
      }
    }, 600);
  };

  // 处理日志查询
  const handleLogQuery = () => {
    // 模拟日志查询
    setTimeout(() => {
      setLogResult(`[2023-06-15 10:30:45] [${logLevel !== 'all' ? logLevel.toUpperCase() : 'INFO'}] 用户登录成功 [用户ID: 1]
[2023-06-15 10:35:22] [${logLevel !== 'all' ? logLevel.toUpperCase() : 'WARNING'}] 接口调用频率过高 [IP: 192.168.1.100]
[2023-06-15 11:15:30] [${logLevel !== 'all' ? logLevel.toUpperCase() : 'ERROR'}] 数据库连接失败 [Retry: 1/3]
[2023-06-15 11:15:35] [${logLevel !== 'all' ? logLevel.toUpperCase() : 'INFO'}] 数据库连接恢复
[2023-06-15 12:20:15] [${logLevel !== 'all' ? logLevel.toUpperCase() : 'INFO'}] 系统定时任务开始执行
[2023-06-15 12:25:10] [${logLevel !== 'all' ? logLevel.toUpperCase() : 'INFO'}] 系统定时任务执行完成 [耗时: 4m55s]`);
    }, 700);
  };

  return (
    <div style={{ padding: 24, borderRadius: 8 }}>
      <h1>开发工具</h1>
      <p>为开发人员提供的实用工具集</p>
      
      <div style={{ marginTop: 24 }}>
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #f0f0f0',
          marginBottom: 20
        }}>
          {['apiTest', 'sqlConsole', 'logViewer'].map(tab => (
            <div 
              key={tab}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid #1890ff' : 'none',
                color: activeTab === tab ? '#1890ff' : 'inherit',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                marginBottom: activeTab === tab ? '-1px' : '0'
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'apiTest' ? 'API测试工具' : 
               tab === 'sqlConsole' ? 'SQL控制台' : '日志查看器'}
            </div>
          ))}
        </div>
        
        {activeTab === 'apiTest' && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #d9d9d9',
                  width: '120px'
                }}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="API端点，如 /api/users"
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #d9d9d9',
                  flex: 1
                }}
              />
              
              <button 
                style={{
                  padding: '8px 16px',
                  background: '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={handleApiTest}
              >
                发送请求
              </button>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 8 }}>请求头</h3>
              <textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #d9d9d9',
                  fontFamily: 'monospace',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 8 }}>请求体</h3>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder={method === 'GET' ? '// GET请求不需要请求体' : '// 输入JSON格式的请求体\n{\n  "name": "测试用户",\n  "email": "test@example.com"\n}'}
                disabled={method === 'GET'}
                style={{
                  width: '100%',
                  height: '120px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #d9d9d9',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  backgroundColor: method === 'GET' ? '#f5f5f5' : 'white'
                }}
              />
            </div>
            
            <div>
              <h3 style={{ 
                marginBottom: 8, 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>响应结果</span>
                {requestStatus && (
                  <span style={{ 
                    fontSize: '14px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: requestStatus === 'success' ? '#f6ffed' : 
                                requestStatus === 'error' ? '#fff2f0' : '#e6f7ff',
                    color: requestStatus === 'success' ? '#52c41a' : 
                           requestStatus === 'error' ? '#ff4d4f' : '#1890ff'
                  }}>
                    {requestStatus === 'success' ? '请求成功' : 
                     requestStatus === 'error' ? '请求失败' : '正在请求...'}
                  </span>
                )}
              </h3>
              <pre style={{
                width: '100%',
                height: '200px',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                background: '#f5f5f5',
                fontFamily: 'monospace',
                overflow: 'auto',
                margin: 0
              }}>
                {response}
              </pre>
            </div>
          </div>
        )}
        
        {activeTab === 'sqlConsole' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 8 }}>SQL查询</h3>
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '120px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #d9d9d9',
                  fontFamily: 'monospace',
                  resize: 'vertical'
                }}
              />
              <div style={{ marginTop: 8 }}>
                <button 
                  style={{
                    padding: '8px 16px',
                    background: '#1890ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={handleSqlQuery}
                >
                  执行查询
                </button>
                <span style={{ marginLeft: 12, fontSize: 14, color: '#8c8c8c' }}>
                  提示: 尝试 SELECT * FROM users 或 SELECT * FROM orders
                </span>
              </div>
            </div>
            
            <div>
              <h3 style={{ marginBottom: 8 }}>查询结果</h3>
              <pre style={{
                width: '100%',
                height: '250px',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                background: '#f5f5f5',
                fontFamily: 'monospace',
                overflow: 'auto',
                margin: 0
              }}>
                {sqlResult}
              </pre>
            </div>
          </div>
        )}
        
        {activeTab === 'logViewer' && (
          <div>
            <div style={{ 
              display: 'flex', 
              gap: 16, 
              marginBottom: 16,
              alignItems: 'flex-end'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4 }}>日志类型</label>
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #d9d9d9',
                    width: '180px'
                  }}
                >
                  <option value="application">应用日志</option>
                  <option value="access">访问日志</option>
                  <option value="error">错误日志</option>
                  <option value="system">系统日志</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 4 }}>日志级别</label>
                <select
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #d9d9d9',
                    width: '150px'
                  }}
                >
                  <option value="all">全部</option>
                  <option value="info">信息</option>
                  <option value="warning">警告</option>
                  <option value="error">错误</option>
                  <option value="debug">调试</option>
                </select>
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>关键词</label>
                <input
                  type="text"
                  value={logKeyword}
                  onChange={(e) => setLogKeyword(e.target.value)}
                  placeholder="输入关键词过滤日志"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #d9d9d9',
                    width: '100%'
                  }}
                />
              </div>
              
              <button 
                style={{
                  padding: '8px 16px',
                  background: '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={handleLogQuery}
              >
                查询
              </button>
            </div>
            
            <div>
              <h3 style={{ marginBottom: 8 }}>日志内容</h3>
              <pre style={{
                width: '100%',
                height: '350px',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                background: '#f5f5f5',
                fontFamily: 'monospace',
                overflow: 'auto',
                margin: 0
              }}>
                {logResult}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 