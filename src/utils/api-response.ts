import { NextResponse } from 'next/server';

/**
 * API响应状态码
 */
export enum ApiStatus {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500
}

/**
 * API响应接口
 */
interface ApiResponse<T> {
  status: number;
  data: T | null;
  msg: string;
}

/**
 * 创建成功响应
 * @param data 响应数据
 * @param msg 成功消息
 * @param status 状态码
 * @returns NextResponse对象
 */
export function JsonResponse<T>(
  data: T,
  msg = '操作成功',
  status = ApiStatus.SUCCESS
): NextResponse {
  const response: ApiResponse<T> = {
    status,
    data,
    msg
  };

  return NextResponse.json(response);
}

/**
 * 创建错误响应
 * @param msg 错误消息
 * @param status 状态码
 * @param httpStatus HTTP状态码（默认与status相同）
 * @returns NextResponse对象
 */
export function createErrorResponse(
  msg: string,
  status = ApiStatus.BAD_REQUEST,
  httpStatus?: number
): NextResponse {
  const response: ApiResponse<null> = {
    status,
    data: null,
    msg
  };

  return NextResponse.json(response, { status: httpStatus || status });
}

/**
 * 创建服务器错误响应
 * @param error 错误对象
 * @param defaultMsg 默认错误消息
 * @returns NextResponse对象
 */
export function createServerErrorResponse(
  error: Error,
  defaultMsg = '服务器错误'
): NextResponse {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const msg = isDevelopment ? error.message : defaultMsg;

  return createErrorResponse(msg, ApiStatus.SERVER_ERROR, ApiStatus.SERVER_ERROR);
} 