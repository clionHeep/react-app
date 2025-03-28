import { InternalAxiosRequestConfig } from 'axios';

/**
 * 菜单类型定义
 */
export interface Menu {
  id: number;
  name: string;
  path: string;
  icon: string;
  parentId: number | null;
  order: number;
  status: number;
  createTime: string;
  updateTime: string;
  children?: Menu[];
}

/**
 * 角色类型定义
 */
export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  createTime: string;
  updateTime: string;
  menus: Menu[];
}

/**
 * 用户类型定义
 */
export interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  status: number;
  createTime: string;
  updateTime: string;
  roles: Role[];
}

/**
 * 用户查询参数
 */
export interface UserQuery {
  page: number;
  pageSize: number;
  username?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  status?: number;
}

/**
 * 用户创建参数
 */
export interface UserCreate {
  username: string;
  nickname: string;
  email: string;
  phone: string;
  password: string;
  roleIds: number[];
  status: number;
}

/**
 * 用户更新参数
 */
export interface UserUpdate {
  nickname?: string;
  email?: string;
  phone?: string;
  roleIds?: number[];
  status?: number;
}

/**
 * 角色查询参数
 */
export interface RoleQuery {
  page: number;
  pageSize: number;
  name?: string;
  code?: string;
  status?: number;
}

/**
 * 角色创建参数
 */
export interface RoleCreate {
  name: string;
  code: string;
  description: string;
  menuIds: number[];
  status: number;
}

/**
 * 角色更新参数
 */
export interface RoleUpdate {
  name?: string;
  code?: string;
  description?: string;
  menuIds?: number[];
  status?: number;
}

/**
 * 菜单查询参数
 */
export interface MenuQuery {
  page: number;
  pageSize: number;
  name?: string;
  path?: string;
  status?: number;
}

/**
 * 菜单创建参数
 */
export interface MenuCreate {
  name: string;
  path: string;
  icon: string;
  parentId?: number;
  order: number;
  status: number;
}

/**
 * 菜单更新参数
 */
export interface MenuUpdate {
  name?: string;
  path?: string;
  icon?: string;
  parentId?: number;
  order?: number;
  status?: number;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
  phone?: string;
}

/**
 * API错误
 */
export interface ApiError {
  message: string;
  status?: number;
  error?: string;
}

/**
 * 带重试标记的请求配置
 */
export interface RequestWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * 统一API响应格式
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页响应格式
 */
export interface PageResponse<T> {
  total: number;
  list: T[];
}

/**
 * 权限类型定义
 */
export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  status: number;
  createTime: string;
  updateTime: string;
}