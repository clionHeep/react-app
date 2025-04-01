"use client";

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, TeamOutlined, MenuOutlined } from '@ant-design/icons';
import Link from 'next/link';
import request from '@/lib/axios';


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
      console.log('原始响应:', response);
      
      // 处理不同的响应格式
      let statsData = {
        userCount: 0,
        roleCount: 0,
        menuCount: 0,
      };

      // 如果响应数据在 data 字段中
      if (response.data?.data) {
        const data = response.data.data;
        statsData = {
          userCount: Number(data.userCount || 0),
          roleCount: Number(data.roleCount || 0),
          menuCount: Number(data.menuCount || 0),
        };
      }
      
      console.log('处理后的统计数据:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('获取系统统计数据失败:', error);
      // 设置默认值
      setStats({
        userCount: 0,
        roleCount: 0,
        menuCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      
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