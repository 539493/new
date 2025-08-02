// CRM API Integration Service
const API_KEY = process.env.CRM_API_KEY || 'crm_539493_2024_auth_token_secure_key';
// Используем новый CRM API сервер
const BASE_URL = process.env.CRM_API_URL || (process.env.NODE_ENV === 'production' 
  ? 'https://crm-api-server.onrender.com/api' 
  : 'http://localhost:3001/api');

interface CRMUserData {
  name: string;
  email: string;
  type: 'student' | 'tutor';
  phone: string;
  password?: string; // Добавляем поддержку паролей
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

  async getTickets(params: Record<string, any> = {}): Promise<CRMResponse> {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/tickets${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
    });
  }

  async healthCheck(): Promise<CRMResponse> {
    return this.makeRequest('/health', {
      method: 'GET',
    });
  }
}

export const crmService = new CRMService();

export const transformUserForCRM = (
  name: string,
  email: string,
  role: 'student' | 'teacher',
  phone: string,
  password?: string, // Добавляем пароль
  subjects: string[] = []
): CRMUserData => {
  return {
    name,
    email,
    type: role === 'teacher' ? 'tutor' : 'student',
    phone,
    password, // Включаем пароль в данные
    subjects: subjects.length > 0 ? subjects : ['Общие предметы'],
    joinDate: new Date().toISOString().split('T')[0],
  };
};

export const createWelcomeTicket = (
  userId: string,
  userName: string,
  userType: 'student' | 'teacher'
): CRMTicketData => {
  return {
    title: `Добро пожаловать, ${userName}!`,
    description: `Новый пользователь ${userType === 'teacher' ? 'преподавателя' : 'ученика'} зарегистрировался на платформе. Необходимо проверить профиль и при необходимости связаться для уточнения деталей.`,
    priority: 'medium',
    category: 'Новые пользователи',
    createdBy: userId,
    tags: ['регистрация', 'новый пользователь', userType === 'teacher' ? 'преподавателя' : 'ученика']
  };
}; 