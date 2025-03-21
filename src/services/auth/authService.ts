import httpClient from '@/lib/axios';
import { ApiResponse, LoginResponse, RegisterRequest } from '@/types/api';
import { handleError, handleSuccess, showResponseMessage } from '@/utils/response';

/**
 * 登录API
 */
export const loginApi = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await httpClient.post('/api/auth/login', { email, password });
    const result = handleSuccess<LoginResponse>(response);
    showResponseMessage(result);
    return result.data as LoginResponse;
  } catch (error) {
    const errorResponse = handleError(error);
    showResponseMessage(errorResponse);
    throw errorResponse;
  }
};

/**
 * 注册API
 */
export const registerApi = async (userData: RegisterRequest): Promise<LoginResponse> => {
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
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async () => {
  try {
    const response = await httpClient.get('/api/auth/profile');
    return handleSuccess(response).data;
  } catch (error) {
    const errorResponse = handleError(error);
    showResponseMessage(errorResponse);
    throw errorResponse;
  }
};

/**
 * 刷新令牌
 */
export const refreshToken = async () => {
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
};

/**
 * 登出API
 */
export const logoutApi = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    // 调用登出API，忽略响应
    await httpClient.post('/api/auth/logout');

    // 清除本地存储
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // 直接返回成功状态
    return {
      success: true,
      code: 200,
      message: '已登出',
      data: { success: true }
    };
  } catch {
    // 即使API调用失败，我们仍然清除本地令牌
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // 直接返回成功状态
    return {
      success: true,
      code: 200,
      message: '已登出',
      data: { success: true }
    };
  }
}; 