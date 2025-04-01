import httpClient from '@/lib/axios';
import type { LoginResponse, RegisterRequest, UserInfoResponse } from '@/types/api';
import { handleError, handleSuccess, showResponseMessage } from '@/utils/response';

export const AuthService = {
  // 登录
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await httpClient.post('/api/auth/login', { username, password });
      const result = handleSuccess<LoginResponse>(response);
      showResponseMessage(result);
      return result.data as LoginResponse;
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  },

  // 注册
  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    try {
      const response = await httpClient.post('/api/auth/register', userData);
      const result = handleSuccess<LoginResponse>(response);
      showResponseMessage(result);
      return result.data as LoginResponse;
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  },

  // 获取用户信息
  getUserInfo: async (): Promise<UserInfoResponse> => {
    try {
      const response = await httpClient.get('/api/auth/user-info');
      return handleSuccess<UserInfoResponse>(response).data;
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  },

  // 刷新令牌
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('刷新令牌不存在');
      }
      const response = await httpClient.post('/api/auth/refresh', { refreshToken });
      return handleSuccess(response).data;
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  },

  // 登出
  logout: async () => {
    try {
      await httpClient.post('/api/auth/logout');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return { success: true };
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return { success: true };
    }
  }
}; 