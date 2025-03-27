"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginApi, getUserInfoApi } from '@/lib/services/auth/authService';
import { User, Menu, Permission, Role } from '@/types/api';
import { showMessage } from '@/utils/message';
import { Spin } from 'antd';

// 定义认证上下文的类型
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  menus: Menu[]; // 用户菜单
  permissions: Permission[]; // 用户权限
  roles: Role[]; // 用户角色
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供器组件
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // 用于防止重复请求的锁
  let isFetchingUserInfo = false;

  // 获取用户详细信息（菜单和权限）
  const fetchUserInfo = React.useCallback(async () => {
    // 如果已经在获取用户信息，则跳过
    if (isFetchingUserInfo) {
      console.log('用户信息请求已在进行中，跳过重复请求');
      return true;
    }

    isFetchingUserInfo = true;
    
    try {
      const userInfo = await getUserInfoApi();
      
      // 设置用户信息
      setUser(userInfo.user as unknown as User);
      setMenus(userInfo.menus || []);
      setPermissions(userInfo.permissions || []);
      setRoles(userInfo.roles || []);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      isFetchingUserInfo = false;
    }
  }, []);

  // 初始化时检查是否已登录
  useEffect(() => {
    // 定义一个节流的获取用户信息函数
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      console.log('初始化认证，检查令牌:', accessToken ? '存在' : '不存在');
      
      if (accessToken) {
        // 有token，获取用户信息
        await fetchUserInfo();
      } else {
        // 没有token，认为用户未登录
        setIsAuthenticated(false);
        setUser(null);
        setMenus([]);
        setPermissions([]);
        setRoles([]);
      }
      
      // 无论有没有token，都设置加载完成
      setIsLoading(false);
    };

    // 初始化认证状态
    initializeAuth();
    
    // 添加fetchUserInfo作为依赖
  }, [fetchUserInfo]);

  // 登录方法
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      // 调用登录API
      const response = await loginApi(username, password);
      
      // 安全记录令牌信息，防止undefined错误
      console.log('登录响应获取到:', response ? '成功' : '失败');
      
      // 保存token到本地存储 - 确保不含Bearer前缀
      if (response && response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.removeItem('token'); // 移除旧的token键，如果有的话
        
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        
        // 获取用户详细信息（菜单和权限）
        const success = await fetchUserInfo();
        return success;
      } else {
        console.error('登录响应中缺少token数据');
        return false;
      }
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出方法
  const logout = () => {
    // 清除本地存储和状态
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
    setMenus([]);
    setPermissions([]);
    setRoles([]);
    showMessage.success('已安全退出系统');
  };

  // 如果正在加载，显示加载指示器
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large">
          <div style={{ padding: '30px', textAlign: 'center' }}>
            <div>正在加载...</div>
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      logout,
      menus,
      permissions,
      roles
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义hook，方便在组件中使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};
