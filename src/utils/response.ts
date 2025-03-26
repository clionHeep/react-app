import { AxiosError, AxiosResponse } from 'axios';
import { ApiError, ApiResponse } from '@/types/api';
import { message } from 'antd';

/**
 * 处理成功响应
 * @param response 响应对象
 * @returns 统一格式的响应数据
 */
export function handleSuccess<T>(response: AxiosResponse): ApiResponse<T> {
  const { data } = response;
  
  // 如果返回数据已经是ApiResponse格式
  if (data && typeof data === 'object' && 'success' in data) {
    return data as ApiResponse<T>;
  }
  
  // 转换为统一格式
  return {
    success: true,
    code: response.status,
    message: '操作成功',
    data: data as T
  };
}

/**
 * 处理错误响应
 * @param error 错误对象
 * @returns 统一格式的错误响应
 */
export function handleError(error: unknown): ApiResponse<null> {
  // 默认错误响应
  const response: ApiResponse<null> = {
    success: false,
    code: 500,
    message: '服务器错误，请稍后再试'
  };
  
  if (error instanceof AxiosError) {
    const { response: errorResponse, message: errorMessage } = error;
    
    // 更新错误代码
    if (errorResponse?.status) {
      response.code = errorResponse.status;
    }
    
    // 尝试提取API错误信息
    if (errorResponse?.data) {
      const apiError = errorResponse.data as ApiError;
      if (apiError.message) {
        response.message = apiError.message;
      }
      if (apiError.error) {
        response.error = apiError.error;
      }
    } else if (errorMessage) {
      response.message = errorMessage;
    }
  } else if (error instanceof Error) {
    response.message = error.message;
    response.error = error.name;
  }
  
  return response;
}

/**
 * 显示统一的响应消息
 * @param response API响应
 */
export function showResponseMessage<T>(response: ApiResponse<T>): void {
  if (response.success) {
    if (response.message && response.message !== '操作成功') {
      message.success(response.message);
    }
  } else {
    message.error(response.message || '操作失败');
  }
} 