"use client";

import Link from "next/link";
import { Card, Button, Typography, Space } from "antd";

const { Title, Text } = Typography;

export default function AuthIndexPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1500')",
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      
      <Card className="shadow-lg bg-white/95 backdrop-blur-sm rounded-md p-6 relative z-10 w-80">
        <Title level={3} className="text-center mb-6">企业管理系统</Title>
        <Text className="block text-center mb-6">请选择登录或注册</Text>
        
        <Space direction="vertical" size="middle" className="w-full">
          <Link href="/login" className="block w-full">
            <Button type="primary" block size="large">
              登录
            </Button>
          </Link>
          
          <Link href="/register" className="block w-full">
            <Button block size="large">
              注册
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
}
