import httpClient from '@/lib/axios';
import { User } from '../auth/auth.service';

export const UserService = {
  getUsers: async (): Promise<User[]> => {
    const response = await httpClient.get('/api/users');
    return response.data;
  },
  
  getUserById: async (id: number): Promise<User> => {
    const response = await httpClient.get(`/api/users/${id}`);
    return response.data;
  },
  
  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await httpClient.put(`/api/users/${id}`, data);
    return response.data;
  }
};
