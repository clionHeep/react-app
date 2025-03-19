'use client';

import React, { useState } from 'react';

export default function OrdersPage() {
  // 模拟订单数据
  const [orders, setOrders] = useState([
    { id: 'ORD-001', customer: '张三', product: '高级办公椅', amount: 1299, status: '已支付', date: '2023-06-15 14:30' },
    { id: 'ORD-002', customer: '李四', product: '人体工学键盘', amount: 499, status: '已发货', date: '2023-06-14 09:45' },
    { id: 'ORD-003', customer: '王五', product: '27寸4K显示器', amount: 2399, status: '已完成', date: '2023-06-12 16:20' },
    { id: 'ORD-004', customer: '赵六', product: '无线蓝牙耳机', amount: 899, status: '待支付', date: '2023-06-10 10:15' },
    { id: 'ORD-005', customer: '钱七', product: '智能会议音箱', amount: 1599, status: '已支付', date: '2023-06-08 17:50' },
    { id: 'ORD-006', customer: '孙八', product: '移动电源', amount: 199, status: '已取消', date: '2023-06-05 13:25' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');

  // 处理订单状态更新
  const handleStatusUpdate = (id: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  // 过滤订单
  const filteredOrders = orders.filter(order => {
    return (
      (order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
       order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order.product.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === '全部' || order.status === statusFilter)
    );
  });

  return (
    <div style={{ padding: 24, borderRadius: 8 }}>
      <h1>订单管理</h1>
      <p>查看和管理所有商品订单</p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <input
            type="text"
            placeholder="搜索订单..."
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
            <option value="待支付">待支付</option>
            <option value="已支付">已支付</option>
            <option value="已发货">已发货</option>
            <option value="已完成">已完成</option>
            <option value="已取消">已取消</option>
          </select>
        </div>
        
        <div>
          <button style={{
            padding: '8px 16px',
            background: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            创建订单
          </button>
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>订单编号</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>客户</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>商品</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e8e8e8' }}>金额</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #e8e8e8' }}>状态</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>下单时间</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #e8e8e8' }}>
                <td style={{ padding: '12px 16px' }}>{order.id}</td>
                <td style={{ padding: '12px 16px' }}>{order.customer}</td>
                <td style={{ padding: '12px 16px' }}>{order.product}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>¥{order.amount.toFixed(2)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    background: order.status === '已完成' ? '#f6ffed' : 
                              order.status === '已支付' ? '#e6f7ff' : 
                              order.status === '已发货' ? '#fff7e6' : 
                              order.status === '待支付' ? '#f9f0ff' : '#fff2f0',
                    color: order.status === '已完成' ? '#52c41a' : 
                           order.status === '已支付' ? '#1890ff' : 
                           order.status === '已发货' ? '#fa8c16' : 
                           order.status === '待支付' ? '#722ed1' : '#ff4d4f'
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>{order.date}</td>
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
                    详情
                  </button>
                  
                  {order.status === '待支付' && (
                    <button style={{
                      marginRight: '8px',
                      padding: '4px 8px',
                      background: '#52c41a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }} onClick={() => handleStatusUpdate(order.id, '已支付')}>
                      确认支付
                    </button>
                  )}
                  
                  {order.status === '已支付' && (
                    <button style={{
                      marginRight: '8px',
                      padding: '4px 8px',
                      background: '#fa8c16',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }} onClick={() => handleStatusUpdate(order.id, '已发货')}>
                      发货
                    </button>
                  )}
                  
                  {order.status === '已发货' && (
                    <button style={{
                      marginRight: '8px',
                      padding: '4px 8px',
                      background: '#52c41a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }} onClick={() => handleStatusUpdate(order.id, '已完成')}>
                      完成
                    </button>
                  )}
                  
                  {(order.status === '待支付') && (
                    <button style={{
                      padding: '4px 8px',
                      background: '#ff4d4f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }} onClick={() => handleStatusUpdate(order.id, '已取消')}>
                      取消
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
        <div>总订单数：{filteredOrders.length}</div>
        <div>
          <button style={{
            padding: '6px 12px',
            background: 'white',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            marginRight: '8px'
          }}>导出订单</button>
        </div>
      </div>
    </div>
  );
}
 