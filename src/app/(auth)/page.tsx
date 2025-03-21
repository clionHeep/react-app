"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, Input, Button, Alert, Typography, Card, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { loginApi, registerApi } from "@/services/auth/authService";
import { showMessage } from "@/utils/message";
import { AUTH_MESSAGES } from "@/constants/messages";

const { Title } = Typography;

interface AuthFormProps {
  type: "login" | "register";
}

export default function AuthForm({ type }: AuthFormProps) {
  const isLogin = type === "login";
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage(); // 使用 Hook 方式

  const handleLogin = async (values: { email: string; password: string }) => {
    setError("");
    setLoading(true);

    try {
      const response = await loginApi(values.email, values.password);
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("user", JSON.stringify(response.user));

      showMessage.success(AUTH_MESSAGES.LOGIN_SUCCESS);
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("登录失败:", error);
      showMessage.error(AUTH_MESSAGES.LOGIN_FAILED);

      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: { message?: string };
          };
        };

        // 根据状态码显示不同错误信息
        if (axiosError.response?.status === 401) {
          setError(axiosError.response?.data?.message || "邮箱或密码错误");
        } else {
          setError(
            axiosError.response?.data?.message || "登录失败，请稍后再试"
          );
        }
      } else if (error instanceof Error) {
        setError(error.message || "登录失败");
      } else {
        setError("登录失败，请稍后再试");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await registerApi({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      messageApi.success("注册成功！"); // 使用 messageApi
      router.push("/login");
    } catch (error: unknown) {
      console.error("注册失败:", error);
      messageApi.error("注册失败！"); // 使用 messageApi
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        setError(axiosError.response?.data?.message || "注册失败，请稍后再试");
      } else {
        setError("注册失败，请稍后再试");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder} {/* 添加 contextHolder */}
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1500')",
        }}
      >
        {/* 背景暗色覆盖 */}
        <div className="absolute inset-0 bg-black/50"></div>

        <div className={`${isLogin ? "w-80" : "w-96"} relative z-10`}>
          <Card
            className="shadow-lg bg-white/95 backdrop-blur-sm rounded-md p-24"
            variant="borderless"
          >
            <div className="text-center mb-6">
              <Title level={3} className="font-normal">
                {isLogin ? "企业管理系统" : "创建新账户"}
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
              name={isLogin ? "login" : "register"}
              initialValues={{ remember: true }}
              onFinish={isLogin ? handleLogin : handleRegister}
              size="large"
              layout="vertical"
              className="w-full"
            >
              {!isLogin && (
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: "请输入姓名" }]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="姓名"
                    className="rounded"
                  />
                </Form.Item>
              )}

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "请输入邮箱" },
                  { type: "email", message: "请输入有效的邮箱地址" },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="邮箱"
                  className="rounded"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "请输入密码" },
                  ...(!isLogin
                    ? [{ min: 6, message: "密码长度至少为6位" }]
                    : []),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="密码"
                  className="rounded"
                />
              </Form.Item>

              {!isLogin && (
                <Form.Item
                  name="confirmPassword"
                  rules={[{ required: true, message: "请确认密码" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="确认密码"
                    className="rounded"
                  />
                </Form.Item>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                >
                  {isLogin ? "登录" : "注册"}
                </Button>
              </Form.Item>

              {isLogin ? (
                <div className="flex justify-between text-sm text-gray-500">
                  <Link
                    href="/forgot-password"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    忘记密码?
                  </Link>
                  <Link
                    href="/register"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    注册账号
                  </Link>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500">
                  已有账号？{" "}
                  <Link
                    href="/login"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    登录
                  </Link>
                </div>
              )}
            </Form>

            {isLogin && (
              <div className="text-center text-xs text-gray-400 mt-4">
                <div>测试账户:</div>
                <div>admin@example.com / admin123 (管理员)</div>
                <div>user@example.com / user123 (普通用户)</div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
