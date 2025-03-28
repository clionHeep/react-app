"use client";

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, TeamOutlined, MenuOutlined } from '@ant-design/icons';
import Link from 'next/link';
import request from '@/utils/request';

const SystemManagement: React.FC = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    roleCount: 0,
    menuCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await request.get('/api/system/stats');
      console.log('系统统计数据:', response.data);
      setStats(response.data || {
        userCount: 0,
        roleCount: 0,
        menuCount: 0,
      });
    } catch (error) {
      console.error('获取系统统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">系统管理</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Link href="/system/users">
            <Card hoverable className="h-full">
              <Statistic
                title="用户管理"
                value={stats.userCount}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
                loading={loading}
              />
            </Card>
          </Link>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Link href="/system/roles">
            <Card hoverable className="h-full">
              <Statistic
                title="角色管理"
                value={stats.roleCount}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#cf1322' }}
                loading={loading}
              />
            </Card>
          </Link>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Link href="/system/menus">
            <Card hoverable className="h-full">
              <Statistic
                title="菜单管理"
                value={stats.menuCount}
                prefix={<MenuOutlined />}
                valueStyle={{ color: '#1677ff' }}
                loading={loading}
              />
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
};

export default SystemManagement; 