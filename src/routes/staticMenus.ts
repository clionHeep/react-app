import { Menu } from '@/types/api';

// 定义静态菜单
export const STATIC_MENUS: Menu[] = [
  {
    id: 1,
    name: "首页",
    path: "/",
    icon: "HomeOutlined",
    children: [],
    parentId: null,
    order: 0,
    status: 1,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
  },
]; 