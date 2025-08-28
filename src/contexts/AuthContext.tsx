import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, StudentProfile, TeacherProfile } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, nickname: string, role: 'student' | 'teacher', phone: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: StudentProfile | TeacherProfile) => void;
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
    // Генерируем событие storage для обновления DataContext
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'tutoring_users',
      newValue: JSON.stringify(users),
      oldValue: localStorage.getItem('tutoring_users'),
      storageArea: localStorage
    }));
    
    // Также генерируем кастомное событие для обновления в рамках одной вкладки
    window.dispatchEvent(new CustomEvent('customStorage', {
      detail: {
        key: 'tutoring_users',
        newValue: JSON.stringify(users),
        oldValue: localStorage.getItem('tutoring_users')
      }
    }));
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
  const [user, setUser] = useState<User | null>(() => {
    try {
      return loadUserFromStorage();
    } catch (error) {
      console.warn('Failed to load user from storage:', error);
      return null;
    }
  });
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализация при монтировании
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Проверяем, есть ли пользователи в системе
        const users = loadUsersFromStorage();
        if (users.length === 0) 
            }
          };
          
          saveUsersToStorage([demoUser]);
          setUser(demoUser);
          saveUserToStorage(demoUser);
          console.log('Demo user created and logged in');
        }
        
        setIsInitialized(true);
        console.log('AuthContext initialized successfully');
      } catch (error) {
        console.error('Failed to initialize AuthContext:', error);
        setIsInitialized(true); // Все равно помечаем как инициализированный
      }
    };

    // Небольшая задержка для правильной последовательности инициализации
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  // Показываем загрузочный экран, пока контекст не инициализирован
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Инициализация авторизации...</p>
        </div>
      </div>
    );
  }

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

  const updateProfile = (profile: StudentProfile | TeacherProfile) => {
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