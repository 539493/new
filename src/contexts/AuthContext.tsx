import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types';

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

  const login = async (email: string, password: string): Promise<boolean> => {
    // Симуляция API вызова
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = loadUsersFromStorage();
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      saveUserToStorage(foundUser);
      console.log('User logged in:', foundUser);
      return true;
    }
    
    // Если пользователь не найден, показываем ошибку
    alert('Пользователь с таким email не найден. Пожалуйста, зарегистрируйтесь.');
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
      alert('Пользователь с таким email уже существует');
      return false;
    }
    
    if (nicknameExists) {
      alert('Пользователь с таким никнеймом уже существует');
      return false;
    }
    
    const newUser: User = {
      id: uuidv4(),
      email,
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
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tutoring_currentUser');
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
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, clearAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
};