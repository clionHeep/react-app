import httpClient from '@/lib/axios';
import type { User, UserQuery, UserCreate, UserUpdate, PageResponse } from '@/types/api';
import { handleError, handleSuccess, showResponseMessage } from '@/utils/response';

export const UserService = {
  // 获取用户列表
  getList: async (params: UserQuery) => {
    try {
      const response = await httpClient.get('/api/users', { params });
      return handleSuccess<PageResponse<User>>(response).data;
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  },

  // 创建用户
  create: async (data: UserCreate) => {
    try {
      const response = await httpClient.post('/api/users', data);
      const result = handleSuccess<User>(response);
      showResponseMessage(result);
      return result.data;
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  },

  // 更新用户
  update: async (id: number, data: UserUpdate) => {
    try {
      const response = await httpClient.put(`/api/users/${id}`, data);
      const result = handleSuccess<User>(response);
      showResponseMessage(result);
      return result.data;
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  },

  // 删除用户
  delete: async (id: number) => {
    try {
      const response = await httpClient.delete(`/api/users/${id}`);
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