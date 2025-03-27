import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Menu, UserInfo, PathPermissionMap } from '@/types';

// 认证状态类型
interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  menus: Menu[];
  permissions: string[];
  pathPermissionMap: PathPermissionMap;
  token: string | null;
}

// 初始状态
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  menus: [],
  permissions: [],
  pathPermissionMap: {},
  token: null
};

// 创建认证Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 登录成功
    loginSuccess: (state, action: PayloadAction<{ token: string }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
    },
    // 登出
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.menus = [];
      state.permissions = [];
      state.pathPermissionMap = {};
      state.token = null;
    },
    // 设置用户信息
    setUserInfo: (state, action: PayloadAction<{ 
      user: UserInfo, 
      menus: Menu[], 
      permissions: string[] 
    }>) => {
      state.user = action.payload.user;
      state.menus = action.payload.menus;
      state.permissions = action.payload.permissions;
    },
    // 设置路径权限映射
    setPathPermissionMap: (state, action: PayloadAction<PathPermissionMap>) => {
      state.pathPermissionMap = action.payload;
    }
  }
});

// 导出actions
export const { loginSuccess, logout, setUserInfo, setPathPermissionMap } = authSlice.actions;

// 创建store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    // 其他reducer可以在这里添加
  },
  // 如果使用TypeScript，启用序列化检查
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略非序列化值，如Date对象
        ignoredActions: ['some/action/type'],
        ignoredPaths: ['some.path'],
      },
    }),
});

// 导出RootState类型
export type RootState = ReturnType<typeof store.getState>;
// 导出AppDispatch类型
export type AppDispatch = typeof store.dispatch; 