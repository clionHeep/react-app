import { InternalAxiosRequestConfig } from 'axios';

// 菜单、权限和角色类型定义
export interface Menu {
  id: number;
  name: string;
  path?: string;
  icon?: string;
  component?: string;
  sort?: number;
  parentId?: number | null;
  hidden?: boolean;
  children?: Menu[];
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

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

// 用户详细信息响应类型
export interface UserInfoResponse {
  user: {
    id: number;
    username: string;
    name?: string;
    email?: string;
    phone?: string;
    status: string;
    avatar?: string;
    roles: string;
  };
  roles: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
  menus: Array<{
    id: number;
    name: string;
    path: string;
    icon?: string;
    parentId?: number;
    sort?: number;
    hidden?: boolean;
  }>;
  permissions: Array<{
    id: number;
    code: string;
    name: string;
    description?: string;
  }>;
} 