import { InternalAxiosRequestConfig } from 'axios';

// 用户相关接口
export interface User {
  id: number;
  username: string;
  name: string;
  roles: string;
  [key: string]: unknown;
}

// 登录响应
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// 注册请求
export interface RegisterRequest {
  username: string;
  password: string;
  name?: string;
}

// API错误
export interface ApiError {
  message: string;
  status?: number;
  error?: string;
}

// 带重试标记的请求配置
export interface RequestWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 统一API响应格式
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  error?: string;
} 