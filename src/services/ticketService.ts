import { apiService, ApiResponse, PaginatedResponse } from './api';
import type { Ticket } from '../App';

export interface TicketFilters {
  search?: string;
  status?: 'all' | 'open' | 'in-progress' | 'resolved' | 'closed';
  priority?: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  userId?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}

export class TicketService {
  // Получить список тикетов с фильтрами
  static async getTickets(filters: TicketFilters = {}): Promise<ApiResponse<PaginatedResponse<Ticket>>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters.category) params.append('category', filters.category);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/tickets${queryString ? `?${queryString}` : ''}`;
    
    return apiService.get<PaginatedResponse<Ticket>>(endpoint);
  }

  // Получить тикет по ID
  static async getTicketById(id: string): Promise<ApiResponse<Ticket>> {
    return apiService.get<Ticket>(`/tickets/${id}`);
  }

  // Создать новый тикет
  static async createTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Ticket>> {
    return apiService.post<Ticket>('/tickets', ticketData);
  }

  // Обновить тикет
  static async updateTicket(id: string, ticketData: Partial<Ticket>): Promise<ApiResponse<Ticket>> {
    return apiService.put<Ticket>(`/tickets/${id}`, ticketData);
  }

  // Изменить статус тикета
  static async updateTicketStatus(id: string, status: Ticket['status']): Promise<ApiResponse<Ticket>> {
    return apiService.put<Ticket>(`/tickets/${id}/status`, { status });
  }

  // Назначить тикет сотруднику
  static async assignTicket(id: string, assignedTo: string): Promise<ApiResponse<Ticket>> {
    return apiService.put<Ticket>(`/tickets/${id}/assign`, { assignedTo });
  }

  // Получить тикеты пользователя
  static async getUserTickets(userId: string): Promise<ApiResponse<Ticket[]>> {
    return apiService.get<Ticket[]>(`/users/${userId}/tickets`);
  }

  // Получить статистику тикетов
  static async getTicketStats(): Promise<ApiResponse<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    urgent: number;
    resolvedToday: number;
    averageResponseTime: number;
    categoriesStats: Record<string, number>;
  }>> {
    return apiService.get('/tickets/stats');
  }
}