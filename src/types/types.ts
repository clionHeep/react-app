// 用户信息接口
export interface UserInfo {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  roles: string[];
  permissions: string[];
  [key: string]: unknown;
} 