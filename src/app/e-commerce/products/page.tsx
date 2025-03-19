'use client';

import React, { useState } from 'react';

export default function ProductsPage() {
  // 模拟商品数据
  const [products, setProducts] = useState([
    { id: 'P001', name: '高级办公椅', category: '办公家具', price: 1299, stock: 125, status: '在售', sales: 58 },
    { id: 'P002', name: '人体工学键盘', category: '电子设备', price: 499, stock: 89, status: '在售', sales: 136 },
    { id: 'P003', name: '27寸4K显示器', category: '电子设备', price: 2399, stock: 42, status: '在售', sales: 67 },
    { id: 'P004', name: '无线蓝牙耳机', category: '电子设备', price: 899, stock: 0, status: '缺货', sales: 208 },
    { id: 'P005', name: '智能会议音箱', category: '办公设备', price: 1599, stock: 15, status: '在售', sales: 32 },
    { id: 'P006', name: '移动电源', category: '电子配件', price: 199, stock: 203, status: '在售', sales: 175 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('全部');

  // 处理商品下架
  const handleStatusToggle = (id: string) => {
    setProducts(products.map(product => 
      product.id === id ? { 
        ...product, 
        status: product.status === '在售' ? '下架' : '在售'
      } : product
    ));
  };

  // 过滤商品
  const filteredProducts = products.filter(product => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === '全部' || product.category === categoryFilter)
    );
  });

  // 提取所有商品类别
  const categories = ['全部', ...new Set(products.map(p => p.category))];

  return (
    <div style={{ padding: 24, borderRadius: 8 }}>
      <h1>商品管理</h1>
      <p>管理系统内所有商品信息</p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <input
            type="text"
            placeholder="搜索商品..."
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9'
            }}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
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
          添加商品
        </button>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>商品编号</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>商品名称</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>类别</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e8e8e8' }}>价格</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e8e8e8' }}>库存</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #e8e8e8' }}>状态</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e8e8e8' }}>销量</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid #e8e8e8' }}>
                <td style={{ padding: '12px 16px' }}>{product.id}</td>
                <td style={{ padding: '12px 16px' }}>{product.name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    background: product.category === '电子设备' ? '#e6f7ff' : 
                                product.category === '办公家具' ? '#f6ffed' : 
                                product.category === '办公设备' ? '#fff7e6' : '#f9f0ff',
                    color: product.category === '电子设备' ? '#1890ff' : 
                           product.category === '办公家具' ? '#52c41a' : 
                           product.category === '办公设备' ? '#fa8c16' : '#722ed1'
                  }}>
                    {product.category}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>¥{product.price.toFixed(2)}</td>
                <td style={{ 
                  padding: '12px 16px', 
                  textAlign: 'right',
                  color: product.stock === 0 ? '#ff4d4f' : 
                         product.stock < 20 ? '#fa8c16' : 'inherit'
                }}>
                  {product.stock}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    background: product.status === '在售' ? '#f6ffed' : 
                                product.status === '下架' ? '#fff2f0' : '#f5f5f5',
                    color: product.status === '在售' ? '#52c41a' : 
                           product.status === '下架' ? '#ff4d4f' : '#8c8c8c'
                  }}>
                    {product.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{product.sales}</td>
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
                    background: product.status === '在售' ? '#ff4d4f' : '#52c41a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }} onClick={() => handleStatusToggle(product.id)}>
                    {product.status === '在售' ? '下架' : '上架'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
        <div>总商品数：{filteredProducts.length}</div>
        <div>
          <button style={{
            padding: '6px 12px',
            background: 'white',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            marginRight: '8px'
          }}>导出数据</button>
          <button style={{
            padding: '6px 12px',
            background: 'white',
            border: '1px solid #d9d9d9',
            borderRadius: '4px'
          }}>批量操作</button>
        </div>
      </div>
    </div>
  );
} 