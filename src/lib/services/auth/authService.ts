import httpClient from '@/lib/axios'; 
import { ApiResponse, LoginResponse, RegisterRequest, UserInfoResponse } from '@/types/api';
import { handleError, handleSuccess, showResponseMessage } from '@/utils/response';

/**
 * 登录API
 */
export const loginApi = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('发送登录请求:', { username });
    const response = await httpClient.post('/api/auth/login', { username, password });
    
    console.log('登录API响应格式:', response.data);
    
    // 从嵌套结构中提取数据
    const actualResponse = response.data.data || response.data;
    
    // 确保返回的数据包含必要的token
    if (!actualResponse || !actualResponse.accessToken) {
      console.error('登录API返回的数据缺少accessToken:', response.data);
      throw new Error('登录响应格式错误');
    }
    
    return actualResponse as LoginResponse;
  } catch (error) {
    console.error('登录API捕获到错误:', error);
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

/**
 * 获取用户详细信息（包括菜单和权限）
 */
export const getUserInfoApi = async (): Promise<UserInfoResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    console.log('获取用户信息，使用令牌:', token ? token.substring(0, 20) + '...' : '无令牌');
    
    const response = await httpClient.get('/api/auth/user-info', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('用户信息API响应格式:', response.data);
    
    // 从嵌套结构中提取数据
    const actualResponse = response.data.data || response.data;
    
    if (!actualResponse) {
      console.error('用户信息API返回的数据无效:', response.data);
      throw new Error('用户信息响应格式错误');
    }
    
    return actualResponse as UserInfoResponse;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
}; 