import httpClient from '@/lib/axios';
import type { Menu, MenuQuery, MenuCreate, MenuUpdate, PageResponse } from '@/types/api';
import { handleError, handleSuccess, showResponseMessage } from '@/utils/response';

export const MenuService = {
  // 获取菜单列表
  getList: async (params: MenuQuery) => {
    try {
      const response = await httpClient.get('/api/menus', { params });
      return handleSuccess<PageResponse<Menu>>(response).data;
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  },

  // 获取菜单树
  getTree: async () => {
    try {
      const response = await httpClient.get('/api/menus/tree');
      const result = handleSuccess<Menu[]>(response);
      if (result.data && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  },

  // 创建菜单
  create: async (data: MenuCreate) => {
    try {
      const response = await httpClient.post('/api/menus', data);
      const result = handleSuccess<Menu>(response);
      showResponseMessage(result);
      return result.data;
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  },

  // 更新菜单
  update: async (id: number, data: MenuUpdate) => {
    try {
      const response = await httpClient.put(`/api/menus/${id}`, data);
      const result = handleSuccess<Menu>(response);
      showResponseMessage(result);
      return result.data;
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  },

  // 删除菜单
  delete: async (id: number) => {
    try {
      const response = await httpClient.delete(`/api/menus/${id}`);
      const result = handleSuccess(response);
      showResponseMessage(result);
      return result.data;
    } catch (error) {
      const errorResponse = handleError(error);
      showResponseMessage(errorResponse);
      throw errorResponse;
    }
  }
}; 