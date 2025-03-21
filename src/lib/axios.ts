import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError, RequestWithRetry } from '@/types/api';
import { showMessage } from '@/utils/message';
import { AUTH_MESSAGES } from '@/constants/messages';

/**
 * Axios HTTP客户端实例
 * 配置了拦截器和默认设置
 */
const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证令牌
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 客户端才能访问localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误和刷新令牌
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    // 获取原始请求配置
    const originalRequest = error.config as RequestWithRetry;

    // 如果是401错误并有刷新令牌，尝试刷新令牌
    if (error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      localStorage.getItem('refreshToken') &&
      originalRequest &&
      !originalRequest._retry) {

      try {
        originalRequest._retry = true;

        // 获取刷新令牌
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/refresh', { refreshToken });

        // 更新令牌
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // 重新设置请求头
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // 重试原请求
        return axios(originalRequest);
      } catch (refreshError) {
        // 刷新令牌失败，清除令牌和用户信息
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        showMessage.error(AUTH_MESSAGES.TOKEN_EXPIRED);

        // 如果在浏览器环境，重定向到登录页
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // 统一处理网络错误
    if (!error.response) {
      showMessage.error(AUTH_MESSAGES.NETWORK_ERROR);
    }

    return Promise.reject(error);
  }
);

export default httpClient;