"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Alert, Typography, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Link } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (values: { username: string; password: string }) => {
    setError("");
    setLoading(true);

    // 简单的模拟登录逻辑
    setTimeout(() => {
      if (values.username === "admin" && values.password === "admin123") {
        // 实际应用中应该设置cookie或localStorage，并调用API
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: "Admin",
            isAuthenticated: true,
            roles: ["admin"],
            permissions: ["basic:read", "dashboard:read", "admin:access"],
          })
        );
        router.push("/");
      } else if (values.username === "user" && values.password === "user123") {
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: "User",
            isAuthenticated: true,
            roles: ["user"],
            permissions: ["basic:read", "dashboard:read"],
          })
        );
        router.push("/");
      } else {
        setError("用户名或密码不正确，请尝试 admin/admin123 或 user/user123");
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1500')",
      }}
    >
      {/* 背景暗色覆盖 */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="w-80 relative z-10">
        <Card
          className="shadow-lg bg-white/95 backdrop-blur-sm rounded-md p-24"
          variant="borderless"
        >
          <div className="text-center mb-6">
            <Title level={3} className="font-normal">
              企业管理系统
            </Title>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="mb-6"
              style={{ fontSize: "12px" }}
            />
          )}

          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={handleLogin}
            size="large"
            layout="vertical"
            className="w-full"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: "请输入用户名" }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="用户名"
                className="rounded"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="密码"
                className="rounded"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                登录
              </Button>
            </Form.Item>

            <div className="flex justify-between text-sm text-gray-500">
              <Link className="text-gray-500 hover:text-gray-700">
                忘记密码?
              </Link>
              <Link className="text-gray-500 hover:text-gray-700">
                注册账号
              </Link>
            </div>
          </Form>

          <div className="text-center text-xs text-gray-400 mt-4">
            测试账户: admin/admin123 (管理员) 或 user/user123 (普通用户)
          </div>
        </Card>
      </div>
    </div>
  );
}
