import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    // 如果响应成功，直接返回数据
    if (data.code === 0) {
      return data;
    }
    // 如果响应失败，显示错误信息
    message.error(data.message || '请求失败');
    return Promise.reject(new Error(data.message || '请求失败'));
  },
  (error) => {
    // 处理401未授权的情况
    if (error.response?.status === 401) {
      // 清除token
      localStorage.removeItem('accessToken');
      // 跳转到登录页
      window.location.href = '/login';
      return Promise.reject(new Error('未授权，请重新登录'));
    }
    // 显示错误信息
    message.error(error.response?.data?.message || '请求失败');
    return Promise.reject(error);
  }
);

export default request; 