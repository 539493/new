import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types';
import { crmService, transformUserForCRM, createWelcomeTicket } from '../services/crmService';
import { userSyncService } from '../services/userSyncService';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, nickname: string, role: 'student' | 'teacher', phone: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: any) => void;
  clearAllUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Функции для работы с localStorage
const loadUsersFromStorage = (): User[] => {
  try {
    const saved = localStorage.getItem('tutoring_users');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error loading users from localStorage:', e);
    return [];
  }
};

const saveUsersToStorage = (users: User[]) => {
  try {
    localStorage.setItem('tutoring_users', JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to localStorage:', e);
  }
};

const saveUserToStorage = (user: User) => {
  try {
    localStorage.setItem('tutoring_currentUser', JSON.stringify(user));
  } catch (e) {
    console.error('Error saving current user to localStorage:', e);
  }
};

const loadUserFromStorage = (): User | null => {
  try {
    const saved = localStorage.getItem('tutoring_currentUser');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Error loading current user from localStorage:', e);
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => loadUserFromStorage());
  const { showNotification } = useNotification();

  // Автоматическая синхронизация при первом запуске
  useEffect(() => {
    const hasSynced = localStorage.getItem('crm_auto_sync_needed');
    if (!hasSynced) {
      localStorage.setItem('crm_auto_sync_needed', 'true');
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Симуляция API вызова
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = loadUsersFromStorage();
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      setUser(foundUser);
      saveUserToStorage(foundUser);
      console.log('User logged in:', foundUser);
      showNotification({
        type: 'success',
        title: 'Успешный вход',
        message: `Добро пожаловать, ${foundUser.name}!`
      });
      return true;
    }
    
    // Если пользователь не найден, показываем ошибку
    showNotification({
      type: 'error',
      title: 'Ошибка входа',
      message: 'Неверный email или пароль. Пожалуйста, проверьте данные и попробуйте снова.'
    });
    return false;
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    nickname: string, 
    role: 'student' | 'teacher',
    phone: string
  ): Promise<boolean> => {
    // Симуляция API вызова
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = loadUsersFromStorage();
    
    // Проверяем уникальность email и nickname
    const emailExists = users.some(u => u.email === email);
    const nicknameExists = users.some(u => u.nickname === nickname);
    
    if (emailExists) {
      showNotification({
        type: 'error',
        title: 'Ошибка регистрации',
        message: 'Пользователь с таким email уже существует'
      });
      return false;
    }
    
    if (nicknameExists) {
      showNotification({
        type: 'error',
        title: 'Ошибка регистрации',
        message: 'Пользователь с таким никнеймом уже существует'
      });
      return false;
    }
    
    const newUser: User = {
      id: uuidv4(),
      email,
      password, // Сохраняем пароль
      name,
      nickname,
      role,
      phone,
    };
    
    const updatedUsers = [...users, newUser];
    saveUsersToStorage(updatedUsers);
    setUser(newUser);
    saveUserToStorage(newUser);
    
    console.log('New user registered:', newUser);
    
    // Отправляем данные в CRM
    try {
      console.log('Отправка данных в CRM...');
      showNotification({
        type: 'info',
        title: 'Интеграция с CRM',
        message: 'Отправляем данные в систему управления...',
        duration: 3000
      });
      
      // Создаем пользователя в CRM с паролем
      const crmUserData = transformUserForCRM(name, email, role, phone, password);
      const crmUserResponse = await crmService.createUser(crmUserData);
      
      if (crmUserResponse.success) {
        console.log('Пользователь успешно создан в CRM:', crmUserResponse.data);
        showNotification({
          type: 'success',
          title: 'Успешная интеграция',
          message: 'Данные успешно отправлены в CRM систему',
          duration: 4000
        });
        
        // Создаем приветственный тикет
        const ticketData = createWelcomeTicket(newUser.id, name, role);
        const ticketResponse = await crmService.createTicket(ticketData);
        
        if (ticketResponse.success) {
          console.log('Приветственный тикет создан в CRM:', ticketResponse.data);
          showNotification({
            type: 'success',
            title: 'Тикет создан',
            message: 'Приветственный тикет создан в CRM',
            duration: 3000
          });
        } else {
          console.warn('Ошибка создания тикета в CRM:', ticketResponse.message);
          showNotification({
            type: 'warning',
            title: 'Частичная интеграция',
            message: 'Пользователь создан, но тикет не создан',
            duration: 4000
          });
        }
      } else {
        console.warn('Ошибка создания пользователя в CRM:', crmUserResponse.message);
        showNotification({
          type: 'warning',
          title: 'Ошибка интеграции',
          message: 'Не удалось отправить данные в CRM, но регистрация завершена',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Ошибка интеграции с CRM:', error);
      showNotification({
        type: 'error',
        title: 'Ошибка сети',
        message: 'Не удалось подключиться к CRM системе',
        duration: 5000
      });
      // Не блокируем регистрацию, если CRM недоступен
    }
    
    showNotification({
      type: 'success',
      title: 'Регистрация завершена',
      message: `Добро пожаловать, ${name}! Ваш аккаунт успешно создан.`
    });
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tutoring_currentUser');
    showNotification({
      type: 'info',
      title: 'Выход из системы',
      message: 'Вы успешно вышли из системы'
    });
  };

  const updateProfile = (profile: any) => {
    if (user) {
      const updatedUser = { ...user, profile, avatar: profile.avatar };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
      
      // Обновляем пользователя в общем списке
      const users = loadUsersFromStorage();
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      saveUsersToStorage(updatedUsers);
      
      showNotification({
        type: 'success',
        title: 'Профиль обновлен',
        message: 'Данные профиля успешно сохранены'
      });
    }
  };

  const clearAllUsers = () => {
    console.log('Clearing all users from system...');
    
    // Очищаем состояние
    setUser(null);
    
    // Очищаем localStorage
    localStorage.removeItem('tutoring_users');
    localStorage.removeItem('tutoring_currentUser');
    
    console.log('All users cleared successfully');
    
    showNotification({
      type: 'info',
      title: 'Система очищена',
      message: 'Все пользователи удалены из системы'
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, clearAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
};