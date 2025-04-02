import { InternalAxiosRequestConfig } from 'axios';
import { Prisma } from '@prisma/client';

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
  type: "DIRECTORY" | "MENU" | "BUTTON";
  component?: string;
  permission?: string;
  routeName?: string;
  layout?: "DEFAULT" | "BLANK" | "CUSTOM";
  redirect?: string;
  i18nKey?: string;
  params?: Record<string, string | number | boolean> | Prisma.JsonValue;
  query?: Record<string, string | number | boolean> | Prisma.JsonValue;
  hidden?: boolean;
  hideTab?: boolean;
  hideMenu?: boolean;
  hideBreadcrumb?: boolean;
  hideChildren?: boolean;
  isExternal?: boolean;
  keepAlive?: boolean;
  constant?: boolean;
  affix?: boolean;
  remark?: string;
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
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  error?: string;
}

/**
 * 分页响应格式
 */
export interface PageResponse<T> {
  data: {
    total: number;
    list: T[];
  };
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

/**
 * 用户信息响应
 */
export interface UserInfoResponse {
  user: User;
  menus: Menu[];
  permissions: Permission[];
  roles: Role[];
}