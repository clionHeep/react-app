import httpClient from '@/lib/axios';
import type { Role, RoleQuery, RoleCreate, RoleUpdate } from '@/types/api';
import { handleError, handleSuccess, showResponseMessage } from '@/utils/response';

export const RoleService = {
  // 获取角色列表
  getList: async (params: RoleQuery) => {
    try {
      const response = await httpClient.get('/api/roles', { params });
      return response.data;
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  },

  // 创建角色
  create: async (data: RoleCreate) => {
    try {
      const response = await httpClient.post('/api/roles', data);
      const result = handleSuccess<Role>(response);
      showResponseMessage(result);
      return result.data;
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  },

  // 更新角色
  update: async (id: number, data: RoleUpdate) => {
    try {
      const response = await httpClient.put(`/api/roles/${id}`, data);
      const result = handleSuccess<Role>(response);
      showResponseMessage(result);
      return result.data;
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  },

  // 删除角色
  delete: async (id: number) => {
    try {
      const response = await httpClient.delete(`/api/roles/${id}`);
      const result = handleSuccess(response);
      showResponseMessage(result);
      return result.data;
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  }
}; 