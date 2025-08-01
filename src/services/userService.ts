import { apiService, ApiResponse, PaginatedResponse } from './api';
import type { User } from '../App';

export interface UserFilters {
  search?: string;
  type?: 'all' | 'tutor' | 'student';
  status?: 'all' | 'active' | 'inactive' | 'suspended';
  page?: number;
  limit?: number;
}

export class UserService {
  // Получить список пользователей с фильтрами
  static async getUsers(filters: UserFilters = {}): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    
    return apiService.get<PaginatedResponse<User>>(endpoint);
  }

  // Получить пользователя по ID
  static async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiService.get<User>(`/users/${id}`);
  }

  // Создать нового пользователя
  static async createUser(userData: Omit<User, 'id'>): Promise<ApiResponse<User>> {
    return apiService.post<User>('/users', userData);
  }

  // Обновить пользователя
  static async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.put<User>(`/users/${id}`, userData);
  }

  // Удалить пользователя
  static async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/users/${id}`);
  }

  // Заблокировать/разблокировать пользователя
  static async toggleUserStatus(id: string, status: 'active' | 'suspended'): Promise<ApiResponse<User>> {
    return apiService.put<User>(`/users/${id}/status`, { status });
  }

  // Получить статистику пользователей
  static async getUserStats(): Promise<ApiResponse<{
    total: number;
    tutors: number;
    students: number;
    active: number;
    inactive: number;
    suspended: number;
    newThisMonth: number;
  }>> {
    return apiService.get('/users/stats');
  }
}