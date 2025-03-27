import { setUserInfo, setPathPermissionMap } from '@/store/index';
import { AppDispatch } from '@/store/index';
import { buildPathPermissionMap } from '@/utils/auth';

/**
 * 获取当前用户信息
 * @param dispatch Redux dispatcher
 */
export async function fetchUserInfo(dispatch: AppDispatch) {
  try {
    const response = await fetch('/api/auth/user-info', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 确保发送cookies
    });

    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      const { user, menus, permissions } = data.data;
      
      // 存储用户信息、菜单和权限
      dispatch(setUserInfo({ user, menus, permissions }));
      
      // 构建并存储路径-权限映射
      const pathPermissionMap = buildPathPermissionMap(menus, permissions);
      dispatch(setPathPermissionMap(pathPermissionMap));
      
      return { user, menus, permissions };
    } else {
      throw new Error(data.message || '获取用户信息失败');
    }
  } catch (error) {
    console.error('获取用户信息错误:', error);
    throw error;
  }
}

/**
 * 用于登录后初始化用户权限
 * @param token 认证令牌
 * @param dispatch Redux dispatcher
 */
export async function initializeAuth(token: string, dispatch: AppDispatch) {
  try {
    // 可以添加令牌验证逻辑
    
    // 获取用户信息和权限数据
    const { menus, permissions } = await fetchUserInfo(dispatch);
    
    // 附加步骤：可以在这里执行其他初始化逻辑
    
    return { menus, permissions };
  } catch (error) {
    console.error('初始化权限失败:', error);
    throw error;
  }
} 