import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, StudentProfile, TeacherProfile } from '../types';
import { SERVER_URL } from '../config';
import { useData } from './DataContext';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, nickname: string, role: 'student' | 'teacher', phone: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: StudentProfile | TeacherProfile) => void;
  clearAllUsers: () => void;
  deleteAccount: () => Promise<boolean>;
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
    // Error saving users to localStorage
  }
};

const saveUserToStorage = (user: User) => {
  try {
    localStorage.setItem('tutoring_currentUser', JSON.stringify(user));
  } catch (e) {
    // Error saving current user to localStorage
  }
};

const loadUserFromStorage = (): User | null => {
  try {
    const saved = localStorage.getItem('tutoring_currentUser');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

// Утилита для очистки кэшей профилей и связанных данных на устройстве
const clearLocalProfileCaches = () => {
  try {
    const keysToClear = [
      'tutoring_teacherProfiles',
      'tutoring_studentProfiles',
      'tutoring_timeSlots',
      'tutoring_lessons',
      'tutoring_chats',
      'tutoring_posts',
      'tutoring_notifications'
    ];

    keysToClear.forEach((key) => {
      localStorage.removeItem(key);
      // Сообщаем DataContext в этой же вкладке
      window.dispatchEvent(new CustomEvent('customStorage', {
        detail: {
          key,
          newValue: null,
          oldValue: null
        }
      }));
    });
  } catch (e) {
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return loadUserFromStorage();
    } catch (error) {
      return null;
    }
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Получаем функцию deleteUserData из DataContext
  let deleteUserData: ((userId: string) => void) | null = null;
  try {
    // Используем try-catch, так как DataContext может быть недоступен
    const dataContext = React.useContext(require('./DataContext').DataContext);
    if (dataContext) {
      deleteUserData = dataContext.deleteUserData;
    }
  } catch (error) {
    // DataContext недоступен, продолжаем без него
  }

  // Инициализация при монтировании
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Проверяем доступность сервера
        console.log('🔍 Checking server availability...');
        const serverCheck = await fetch(`${SERVER_URL}/api/health`);
        
        if (serverCheck.ok) {
          console.log('✅ Server is available');
        } else {
          console.warn('⚠️ Server health check failed');
        }
        
        // Проверяем, есть ли пользователи в системе
        const users = loadUsersFromStorage();
        console.log('👥 Loaded users from storage:', users.length);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Server not available:', error);
        console.log('🔄 Will retry connection in DataContext...');
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
    try {
      // На всякий случай очищаем локальные кэши профилей перед новой сессией
      clearLocalProfileCaches();
      
      // Сначала регистрируем на сервере
      console.log('🌐 SERVER_URL value:', SERVER_URL);
      console.log('🌐 Full registration URL:', `${SERVER_URL}/api/register`);
      
      // Проверяем, что URL не содержит двойных слешей
      const registrationUrl = `${SERVER_URL}/api/register`;
      if (registrationUrl.includes('//api/')) {
        console.error('❌ URL contains double slashes:', registrationUrl);
        alert('Ошибка конфигурации URL. Обратитесь к администратору.');
        return false;
      }
      
      console.log('📤 Registration data:', { email, name, nickname, role, phone });
      
      const response = await fetch(`${SERVER_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          nickname,
          role,
          phone
        })
      });
      
      console.log('📡 Server response status:', response.status);
      console.log('📡 Server response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server registration failed:', response.status, errorText);
        
        // Пытаемся парсить JSON ошибки
        try {
          const errorData = JSON.parse(errorText);
          console.error('❌ Server error details:', errorData);
          alert(`Ошибка сервера: ${errorData.error || 'Неизвестная ошибка'}`);
        } catch {
          console.error('❌ Server error (non-JSON):', errorText);
          alert(`Ошибка сервера: ${errorText || 'Неизвестная ошибка'}`);
        }
        
        // НЕ переходим к локальной регистрации - принудительно используем сервер
        throw new Error('Server registration failed - server is required');
      }

      const serverUser = await response.json();
      
      // Сохраняем локально
      const users = loadUsersFromStorage();
      const updatedUsers = [...users, serverUser];
      saveUsersToStorage(updatedUsers);
      setUser(serverUser);
      saveUserToStorage(serverUser);
      
      // УБРАНО: принудительная синхронизация после регистрации для предотвращения бесконечного цикла
      // Данные синхронизируются через WebSocket события и явные действия пользователя
      
      return true;
    } catch (error) {
      // Сервер недоступен - показываем ошибку и не регистрируем локально
      console.error('❌ Server registration failed:', error);
      alert('Сервер недоступен. Регистрация невозможна. Попробуйте позже.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tutoring_currentUser');
    // Очищаем локальные кэши профилей и связанные данные, чтобы исключить "прилипание" старого профиля
    clearLocalProfileCaches();
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
      
      // Отправляем обновление на сервер
      if (typeof window !== 'undefined') {
        // Отправляем на сервер
        fetch(`${SERVER_URL}/api/updateProfile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            profileData: profile,
            role: user.role
          })
        }).then(response => {
          if (response.ok) {
            console.log('Profile updated successfully on server');
            // Отправляем WebSocket уведомление
            const socket = (window as any).socket;
            if (socket) {
              socket.emit('profileUpdated', {
                userId: user.id,
                profileData: profile,
                role: user.role
              });
            }
          } else {
            console.error('Failed to update profile on server:', response.status);
          }
        }).catch(error => {
          console.error('Failed to update profile on server:', error);
        });
      }
    }
  };

  const clearAllUsers = () => {
    // Очищаем состояние
    setUser(null);
    
    // Очищаем localStorage
    localStorage.removeItem('tutoring_users');
    localStorage.removeItem('tutoring_currentUser');
    // Также чистим профили и связанные данные
    clearLocalProfileCaches();
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!user) {
      alert('Пользователь не найден');
      return false;
    }

    // Подтверждение удаления
    const confirmed = window.confirm(
      'Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить. Все ваши данные будут безвозвратно удалены.'
    );
    
    if (!confirmed) {
      return false;
    }

    try {
      // Удаляем пользователя с сервера
      const response = await fetch(`${SERVER_URL}/api/delete-user`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          role: user.role
        })
      });

      if (!response.ok) {
        console.warn('Не удалось удалить пользователя с сервера, продолжаем локальное удаление');
      }

      // Удаляем пользователя из локального списка
      const users = loadUsersFromStorage();
      const updatedUsers = users.filter(u => u.id !== user.id);
      saveUsersToStorage(updatedUsers);

      // Удаляем профиль пользователя
      if (user.role === 'teacher') {
        const teacherProfiles = JSON.parse(localStorage.getItem('tutoring_teacherProfiles') || '{}');
        delete teacherProfiles[user.id];
        localStorage.setItem('tutoring_teacherProfiles', JSON.stringify(teacherProfiles));
        
        // Отправляем событие для обновления DataContext
        window.dispatchEvent(new CustomEvent('customStorage', {
          detail: {
            key: 'tutoring_teacherProfiles',
            newValue: JSON.stringify(teacherProfiles)
          }
        }));
      } else if (user.role === 'student') {
        const studentProfiles = JSON.parse(localStorage.getItem('tutoring_studentProfiles') || '{}');
        delete studentProfiles[user.id];
        localStorage.setItem('tutoring_studentProfiles', JSON.stringify(studentProfiles));
        
        // Отправляем событие для обновления DataContext
        window.dispatchEvent(new CustomEvent('customStorage', {
          detail: {
            key: 'tutoring_studentProfiles',
            newValue: JSON.stringify(studentProfiles)
          }
        }));
      }

      // Удаляем связанные данные пользователя через DataContext
      if (deleteUserData) {
        deleteUserData(user.id);
      } else {
        // Fallback: удаляем данные напрямую из localStorage
        const timeSlots = JSON.parse(localStorage.getItem('tutoring_timeSlots') || '[]');
        const updatedTimeSlots = timeSlots.filter((slot: any) => slot.teacherId !== user.id);
        localStorage.setItem('tutoring_timeSlots', JSON.stringify(updatedTimeSlots));

        const lessons = JSON.parse(localStorage.getItem('tutoring_lessons') || '[]');
        const updatedLessons = lessons.filter((lesson: any) => 
          lesson.teacherId !== user.id && lesson.studentId !== user.id
        );
        localStorage.setItem('tutoring_lessons', JSON.stringify(updatedLessons));

        const chats = JSON.parse(localStorage.getItem('tutoring_chats') || '[]');
        const updatedChats = chats.filter((chat: any) => 
          !chat.participants.includes(user.id)
        );
        localStorage.setItem('tutoring_chats', JSON.stringify(updatedChats));

        const posts = JSON.parse(localStorage.getItem('tutoring_posts') || '[]');
        const updatedPosts = posts.filter((post: any) => post.userId !== user.id);
        localStorage.setItem('tutoring_posts', JSON.stringify(updatedPosts));

        const notifications = JSON.parse(localStorage.getItem('tutoring_notifications') || '[]');
        const updatedNotifications = notifications.filter((notification: any) => 
          notification.userId !== user.id
        );
        localStorage.setItem('tutoring_notifications', JSON.stringify(updatedNotifications));
      }

      // Выходим из аккаунта и дополнительно чистим локальные кэши
      logout();

      alert('Аккаунт успешно удален');
      return true;
    } catch (error) {
      console.error('Ошибка при удалении аккаунта:', error);
      alert('Произошла ошибка при удалении аккаунта');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, clearAllUsers, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};