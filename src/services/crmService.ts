// CRM API Integration Service
const API_KEY = process.env.CRM_API_KEY || 'crm_539493_2024_auth_token_secure_key';
// Используем продакшен API на Render или локальный для разработки
const BASE_URL = process.env.CRM_API_URL || 'http://localhost:3001/api';

interface CRMUserData {
  name: string;
  email: string;
  type: 'student' | 'tutor';
  phone: string;
  subjects: string[];
  joinDate: string;
}

interface CRMTicketData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdBy: string;
  tags: string[];
}

interface CRMResponse {
  success: boolean;
  data?: any;
  message?: string;
}

class CRMService {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<CRMResponse> {
    const url = `${BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('CRM API Error:', data);
        return {
          success: false,
          message: data.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      return data;
    } catch (error) {
      console.error('CRM API Request Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async createUser(userData: CRMUserData): Promise<CRMResponse> {
    return this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async createTicket(ticketData: CRMTicketData): Promise<CRMResponse> {
    return this.makeRequest('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async getUsers(params: Record<string, any> = {}): Promise<CRMResponse> {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
    });
  }

  async getUserStats(): Promise<CRMResponse> {
    return this.makeRequest('/users/stats', {
      method: 'GET',
    });
  }

  async getTicketStats(): Promise<CRMResponse> {
    return this.makeRequest('/tickets/stats', {
      method: 'GET',
    });
  }
}

// Экспортируем экземпляр сервиса
export const crmService = new CRMService();

// Вспомогательные функции для преобразования данных
export const transformUserForCRM = (
  name: string,
  email: string,
  role: 'student' | 'teacher',
  phone: string,
  subjects: string[] = []
): CRMUserData => {
  return {
    name,
    email,
    type: role === 'teacher' ? 'tutor' : 'student',
    phone,
    subjects: subjects.length > 0 ? subjects : ['Общие предметы'],
    joinDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD формат
  };
};

export const createWelcomeTicket = (
  userId: string,
  userName: string,
  userType: 'student' | 'teacher'
): CRMTicketData => {
  const typeText = userType === 'teacher' ? 'преподавателя' : 'ученика';
  
  return {
    title: `Добро пожаловать, ${userName}!`,
    description: `Новый пользователь ${typeText} зарегистрировался на платформе. Необходимо проверить профиль и при необходимости связаться для уточнения деталей.`,
    priority: 'medium',
    category: 'Новые пользователи',
    createdBy: userId,
    tags: ['регистрация', 'новый пользователь', typeText],
  };
}; 