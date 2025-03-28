import request from '@/utils/request';
import type { Menu, MenuQuery, MenuCreate, MenuUpdate, PageResponse } from '@/types/api';

// 获取菜单列表
export const getMenuList = (params: MenuQuery) => {
  return request<PageResponse<Menu>>({
    url: '/api/menus',
    method: 'get',
    params,
  });
};

// 获取菜单树
export const getMenuTree = () => {
  return request<{ data: Menu[] }>({
    url: '/api/menus/tree',
    method: 'get',
  });
};

// 创建菜单
export const createMenu = (data: MenuCreate) => {
  return request<Menu>({
    url: '/api/menus',
    method: 'post',
    data,
  });
};

// 更新菜单
export const updateMenu = (id: number, data: MenuUpdate) => {
  return request<Menu>({
    url: `/api/menus/${id}`,
    method: 'put',
    data,
  });
};

// 删除菜单
export const deleteMenu = (id: number) => {
  return request<void>({
    url: `/api/menus/${id}`,
    method: 'delete',
  });
}; 