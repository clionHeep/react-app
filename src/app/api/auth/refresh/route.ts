import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { message: '请提供刷新令牌' }, 
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    console.log(`正在请求刷新令牌API: ${baseUrl}/auth/refresh`);

    const response = await axios.post(`${baseUrl}/auth/refresh`, {
      refreshToken
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('刷新令牌成功:', response.status);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('刷新令牌API错误:', error);
    
    // 定义接口来处理可能的Axios错误
    interface AxiosErrorResponse {
      response?: {
        status?: number;
        data?: {
          message?: string;
        };
      };
      message?: string;
      code?: string;
    }
    
    // 类型断言
    const axiosError = error as AxiosErrorResponse;
    
    const statusCode = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.message || '刷新令牌失败，请重新登录';
    
    return NextResponse.json(
      { 
        message, 
        error: process.env.NODE_ENV === 'development' && error instanceof Error 
          ? error.message 
          : undefined 
      }, 
      { status: statusCode }
    );
  }
}

