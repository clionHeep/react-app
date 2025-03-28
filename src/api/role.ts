import request from '@/utils/request';
import type { Role, RoleQuery, RoleCreate, RoleUpdate, PageResponse } from '@/types/api';

// 获取角色列表
export const getRoleList = (params: RoleQuery) => {
  return request<PageResponse<Role>>({
    url: '/api/roles',
    method: 'get',
    params,
  });
};

// 创建角色
export const createRole = (data: RoleCreate) => {
  return request<Role>({
    url: '/api/roles',
    method: 'post',
    data,
  });
};

// 更新角色
export const updateRole = (id: number, data: RoleUpdate) => {
  return request<Role>({
    url: `/api/roles/${id}`,
    method: 'put',
    data,
  });
};

// 删除角色
export const deleteRole = (id: number) => {
  return request<void>({
    url: `/api/roles/${id}`,
    method: 'delete',
  });
}; 