'use client';

import React, { useState } from 'react';

export default function SystemPage() {
  // 模拟系统状态数据
  const [systemStatus, setSystemStatus] = useState({
    cpuUsage: 42,
    memoryUsage: 68,
    diskUsage: 57,
    networkIn: '12.5 MB/s',
    networkOut: '5.8 MB/s',
    uptime: '15天6小时32分钟',
    serverStatus: 'running',
    lastUpdated: new Date().toLocaleTimeString(),
  });

  // 模拟服务列表
  const [services, setServices] = useState([
    { id: 1, name: 'Web服务器', status: 'running', uptime: '15天6小时', cpu: 12, memory: 1.2 },
    { id: 2, name: '数据库服务', status: 'running', uptime: '15天5小时', cpu: 25, memory: 3.6 },
    { id: 3, name: '缓存服务', status: 'running', uptime: '10天2小时', cpu: 5, memory: 0.8 },
    { id: 4, name: '消息队列', status: 'running', uptime: '8天12小时', cpu: 8, memory: 1.5 },
    { id: 5, name: '定时任务', status: 'warning', uptime: '2天3小时', cpu: 18, memory: 2.1 },
    { id: 6, name: '日志服务', status: 'stopped', uptime: '0', cpu: 0, memory: 0 },
  ]);

  // 处理刷新系统状态
  const handleRefreshStatus = () => {
    // 模拟更新数据
    setSystemStatus({
      ...systemStatus,
      cpuUsage: Math.floor(Math.random() * 30) + 30,
      memoryUsage: Math.floor(Math.random() * 20) + 60,
      diskUsage: Math.floor(Math.random() * 10) + 50,
      networkIn: `${(Math.random() * 20).toFixed(1)} MB/s`,
      networkOut: `${(Math.random() * 10).toFixed(1)} MB/s`,
      lastUpdated: new Date().toLocaleTimeString(),
    });
  };

  // 处理服务操作
  const handleServiceAction = (id: number, action: 'start' | 'stop' | 'restart') => {
    setServices(services.map(service => {
      if (service.id === id) {
        if (action === 'start') {
          return { ...service, status: 'running', uptime: '刚刚', cpu: 5, memory: 0.8 };
        } else if (action === 'stop') {
          return { ...service, status: 'stopped', uptime: '0', cpu: 0, memory: 0 };
        } else if (action === 'restart') {
          return { ...service, status: 'running', uptime: '刚刚', cpu: service.cpu, memory: service.memory };
        }
      }
      return service;
    }));
  };

  return (
    <div style={{ padding: 24, borderRadius: 8 }}>
      <h1>系统运维</h1>
      <p>监控和管理系统运行状态与服务</p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16
      }}>
        <h2 style={{ margin: 0 }}>系统状态</h2>
        <div>
          <span style={{ marginRight: 16, color: '#8c8c8c' }}>
            最后更新: {systemStatus.lastUpdated}
          </span>
          <button style={{
            padding: '8px 16px',
            background: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }} onClick={handleRefreshStatus}>
            刷新
          </button>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: 16,
        marginBottom: 32
      }}>
        <div style={{ 
          background: 'white',
          padding: 16,
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: 14, color: '#8c8c8c' }}>CPU使用率</div>
          <div style={{ 
            fontSize: 24, 
            fontWeight: 'bold',
            margin: '8px 0'
          }}>{systemStatus.cpuUsage}%</div>
          <div style={{ 
            height: 8, 
            background: '#f5f5f5',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${systemStatus.cpuUsage}%`,
              background: systemStatus.cpuUsage > 80 ? '#ff4d4f' : 
                          systemStatus.cpuUsage > 60 ? '#faad14' : '#52c41a',
              borderRadius: 4
            }}></div>
          </div>
        </div>
        
        <div style={{ 
          background: 'white',
          padding: 16,
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: 14, color: '#8c8c8c' }}>内存使用率</div>
          <div style={{ 
            fontSize: 24, 
            fontWeight: 'bold',
            margin: '8px 0'
          }}>{systemStatus.memoryUsage}%</div>
          <div style={{ 
            height: 8, 
            background: '#f5f5f5',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${systemStatus.memoryUsage}%`,
              background: systemStatus.memoryUsage > 80 ? '#ff4d4f' : 
                          systemStatus.memoryUsage > 60 ? '#faad14' : '#52c41a',
              borderRadius: 4
            }}></div>
          </div>
        </div>
        
        <div style={{ 
          background: 'white',
          padding: 16,
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: 14, color: '#8c8c8c' }}>磁盘使用率</div>
          <div style={{ 
            fontSize: 24, 
            fontWeight: 'bold',
            margin: '8px 0'
          }}>{systemStatus.diskUsage}%</div>
          <div style={{ 
            height: 8, 
            background: '#f5f5f5',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${systemStatus.diskUsage}%`,
              background: systemStatus.diskUsage > 80 ? '#ff4d4f' : 
                          systemStatus.diskUsage > 60 ? '#faad14' : '#52c41a',
              borderRadius: 4
            }}></div>
          </div>
        </div>
        
        <div style={{ 
          background: 'white',
          padding: 16,
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: 14, color: '#8c8c8c' }}>网络流量</div>
          <div style={{ 
            fontSize: 24, 
            fontWeight: 'bold',
            margin: '8px 0'
          }}>
            <span style={{ fontSize: 14, fontWeight: 'normal', color: '#8c8c8c' }}>↑</span> {systemStatus.networkOut}
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 'normal', color: '#8c8c8c' }}>↓</span> {systemStatus.networkIn}
          </div>
        </div>
        
        <div style={{ 
          background: 'white',
          padding: 16,
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: 14, color: '#8c8c8c' }}>运行时间</div>
          <div style={{ 
            fontSize: 24, 
            fontWeight: 'bold',
            margin: '8px 0'
          }}>{systemStatus.uptime}</div>
        </div>
        
        <div style={{ 
          background: 'white',
          padding: 16,
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: 14, color: '#8c8c8c' }}>服务器状态</div>
          <div style={{ 
            fontSize: 24, 
            fontWeight: 'bold',
            margin: '8px 0',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ 
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: systemStatus.serverStatus === 'running' ? '#52c41a' : '#ff4d4f',
              marginRight: 8
            }}></span>
            {systemStatus.serverStatus === 'running' ? '运行中' : '已停止'}
          </div>
        </div>
      </div>
      
      <h2>服务管理</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>服务名称</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #e8e8e8' }}>状态</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e8e8e8' }}>运行时间</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e8e8e8' }}>CPU使用</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e8e8e8' }}>内存使用</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #e8e8e8' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id} style={{ borderBottom: '1px solid #e8e8e8' }}>
                <td style={{ padding: '12px 16px' }}>{service.name}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    background: service.status === 'running' ? '#f6ffed' : 
                                service.status === 'warning' ? '#fff7e6' : '#fff2f0',
                    color: service.status === 'running' ? '#52c41a' : 
                           service.status === 'warning' ? '#fa8c16' : '#ff4d4f'
                  }}>
                    {service.status === 'running' ? '运行中' : 
                     service.status === 'warning' ? '警告' : '已停止'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{service.uptime}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{service.cpu}%</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{service.memory} GB</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {service.status !== 'running' && (
                    <button style={{
                      marginRight: '8px',
                      padding: '4px 8px',
                      background: '#52c41a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }} onClick={() => handleServiceAction(service.id, 'start')}>
                      启动
                    </button>
                  )}
                  
                  {service.status === 'running' && (
                    <>
                      <button style={{
                        marginRight: '8px',
                        padding: '4px 8px',
                        background: '#1890ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }} onClick={() => handleServiceAction(service.id, 'restart')}>
                        重启
                      </button>
                      
                      <button style={{
                        padding: '4px 8px',
                        background: '#ff4d4f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }} onClick={() => handleServiceAction(service.id, 'stop')}>
                        停止
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 