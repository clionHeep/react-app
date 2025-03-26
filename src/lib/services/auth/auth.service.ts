import httpClient from '@/lib/axios';

// 类型定义
export interface User {
  id: number;
  username: string;
  name: string;
  roles: string;
  [key: string]: unknown; // 替代any的更安全类型
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// 认证相关API
export const AuthService = {
  // 登录API
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await httpClient.post('/api/auth/login', { username, password });
      return response.data;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  // 注册API
  register: async (userData: {
    username: string;
    password: string;
    name?: string;
  }): Promise<LoginResponse> => {
    try {
      const response = await httpClient.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await httpClient.get('/api/auth/profile');
      return response.data;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  },

  // 刷新令牌
  refreshToken: async (): Promise<{accessToken: string, refreshToken: string}> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('刷新令牌不存在');
      }
      
      const response = await httpClient.post('/api/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      console.error('刷新令牌失败:', error);
      throw error;
    }
  },

  // 登出API
  logout: async (): Promise<{success: boolean}> => {
    try {
      await httpClient.post('/api/auth/logout');
      
      // 清除本地存储
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return { success: true };
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  }
};
