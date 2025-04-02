import { InternalAxiosRequestConfig } from 'axios';

/**
 * 菜单类型定义
 */
export enum MenuType {
  DIRECTORY = 'DIRECTORY',  // 目录
  MENU = 'MENU',       // 菜单
  BUTTON = 'BUTTON'    // 按钮
}

/**
 * 操作类型定义
 */
export enum ActionType {
  VIEW = 'VIEW',     // 查看
  ADD = 'ADD',      // 添加
  EDIT = 'EDIT',    // 编辑
  DELETE = 'DELETE', // 删除
  EXPORT = 'EXPORT', // 导出
  IMPORT = 'IMPORT'  // 导入
}

export interface Menu {
  id: number;
  name: string;
  path?: string;
  component?: string;
  icon?: string;
  type: MenuType;
  permission?: string;
  parentId?: number | null;
  sort: number;
  status: number;
  children?: Menu[];
  createTime?: string;
  updateTime?: string;
  remark?: string;
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
 * 创建菜单请求参数
 */
export interface MenuCreate {
  name: string;
  type: MenuType;
  path?: string;
  component?: string;
  icon?: string;
  permission?: string;
  parentId?: number;
  sort?: number;
  status?: number;
}

/**
 * 更新菜单请求参数
 */
export interface MenuUpdate extends Partial<MenuCreate> {
  id: number;
}

/**
 * 菜单权限接口
 */
export interface MenuPermission {
  id: number;
  menuId: number;
  permissionId: number;
  actionType: ActionType;
  createdAt: string;
  updatedAt: string;
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
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
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

// 菜单列表响应
export type MenuListResponse = ApiResponse<{
  total: number;
  list: Menu[];
}>;

// 菜单详情响应
export type MenuDetailResponse = ApiResponse<Menu>;

// 菜单权限响应
export type MenuPermissionResponse = ApiResponse<MenuPermission[]>;