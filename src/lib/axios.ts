import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError, RequestWithRetry } from '@/types/api';
import { showMessage } from '@/utils/message';
import { AUTH_MESSAGES } from '@/providers/message/messages';

/**
 * Axios HTTP客户端实例
 * 配置了拦截器和默认设置
 */
const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
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
    console.log('发送请求:', config.url, config.method, config.data);
    return config;
  },
  (error: unknown) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 添加一个函数来判断是否应该重定向到登录页
const shouldRedirectToLogin = (() => {
  let lastRedirectTime = 0;
  let pendingUserInfoRequest = false; // 添加一个标志来跟踪是否正在获取用户信息
  
  return () => {
    // 如果正在获取用户信息，不进行重定向
    if (pendingUserInfoRequest) {
      console.log('正在获取用户信息，暂时不重定向到登录页');
      return false;
    }
    
    const now = Date.now();
    if (now - lastRedirectTime > 3000) { // 至少间隔3秒才允许再次重定向
      lastRedirectTime = now;
      return true;
    }
    return false;
  };
})();

// 设置一个标志来跟踪用户信息请求
export const setUserInfoRequestStatus = (isPending: boolean) => {
  shouldRedirectToLogin['pendingUserInfoRequest'] = isPending;
};

// 响应拦截器 - 处理错误和刷新令牌
httpClient.interceptors.response.use(
  (response) => {
    console.log('响应成功:', response.status, response.data);
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    console.error('响应错误:', error.message, error.response?.status);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }

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
        console.log('尝试刷新令牌...');

        // 获取刷新令牌
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${httpClient.defaults.baseURL}/auth/refresh`, { refreshToken });

        console.log('刷新令牌成功，获取新令牌');
        
        // 更新令牌
        const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;
        
        if (!accessToken) {
          throw new Error('刷新令牌API没有返回有效的令牌');
        }
        
        localStorage.setItem('accessToken', accessToken);
        
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // 重新设置请求头
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // 重试原请求
        return axios(originalRequest);
      } catch (refreshError) {
        // 记录详细的刷新令牌错误
        console.error('刷新令牌失败:', refreshError);
        console.error('刷新令牌响应详情:', refreshError.response?.data);
        
        // 刷新令牌失败，清除令牌和用户信息
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        showMessage.error(AUTH_MESSAGES.TOKEN_EXPIRED);

        // 如果应该重定向到登录页
        if (shouldRedirectToLogin()) {
          console.log('重定向到登录页...');
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // 处理401错误但没有刷新令牌的情况
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // 检查当前URL是否已经是登录页
      const currentPath = window.location.pathname;
      if (currentPath.includes('/login')) {
        console.log('已在登录页，不再重定向');
        return Promise.reject(error);
      }
      
      // 清除可能存在的无效令牌
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // 显示认证失败消息
      showMessage.error(AUTH_MESSAGES.UNAUTHORIZED);
      
      // 检查是否是API请求还是导航请求
      const isApiRequest = error.config?.url?.includes('/api/');
      
      // 只有在确认token无效(401)且不是用户信息请求时才重定向
      if (shouldRedirectToLogin() && !error.config?.url?.includes('/api/user/info')) {
        console.log('认证失败，重定向到登录页...');
        window.location.href = '/login';
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