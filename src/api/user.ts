import request from '@/utils/request';
import type { User, UserQuery, UserCreate, UserUpdate, PageResponse } from '@/types/api';

// 获取用户列表
export const getUserList = (params: UserQuery) => {
  return request<PageResponse<User>>({
    url: '/api/users',
    method: 'get',
    params,
  });
};

// 创建用户
export const createUser = (data: UserCreate) => {
  return request<User>({
    url: '/api/users',
    method: 'post',
    data,
  });
};

// 更新用户
export const updateUser = (id: number, data: UserUpdate) => {
  return request<User>({
    url: `/api/users/${id}`,
    method: 'put',
    data,
  });
};

// 删除用户
export const deleteUser = (id: number) => {
  return request<void>({
    url: `/api/users/${id}`,
    method: 'delete',
  });
}; 