'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCredentials, logout as logoutAction, User } from '@/redux/authSlice';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // 从Redux存储中获取认证状态
  const { user, token, isAuthenticated: reduxIsAuthenticated } = useAppSelector((state) => state.auth);

  // 登录方法
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('开始登录请求...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('登录响应:', data);

      if (data.status === 200 && data.data?.user) {
        console.log('登录成功, 设置用户信息:', data.data.user);
        
        // 保存到Redux
        dispatch(setCredentials({
          user: data.data.user,
          token: data.data.accessToken
        }));
        
        // 将token保存到cookie，可以在middleware中使用
        document.cookie = `token=${data.data.accessToken}; path=/; max-age=${60 * 60}`;
        
        console.log('Cookie已设置, token有效期1小时');
        return true;
      }
      
      console.log('登录失败:', data.msg || '未知错误');
      return false;
    } catch (error) {
      console.error('登录请求出错:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出方法
  const logout = () => {
    // 清除Redux存储
    dispatch(logoutAction());
    
    // 清除cookie中的token
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
  };

  // 检查认证状态
  const checkAuth = async (): Promise<boolean> => {
    try {
      // 如果Redux中已有token和用户信息，直接返回true
      if (token && user) {
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(true);
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status === 200) {
        // 更新Redux存储
        // 注意：这里我们无法获取token，因为API没有返回
        // 但是通过cookie的方式，我们不需要在此处保存token
        dispatch(setCredentials({
          user: data.data,
          token: token || '' // 保留原有token
        }));
        return true;
      } else {
        // 清除Redux存储
        dispatch(logoutAction());
        return false;
      }
    } catch (error) {
      console.error('身份验证检查失败:', error);
      // 清除Redux存储
      dispatch(logoutAction());
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化时检查认证状态
  useEffect(() => {
    // 只有在没有用户信息或token时才需要检查
    if (!user || !token) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: reduxIsAuthenticated, 
      isLoading, 
      login, 
      logout,
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义hook，方便获取认证上下文
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内使用');
  }
  return context;
} 