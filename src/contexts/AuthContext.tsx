import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, StudentProfile, TeacherProfile } from '../types';
import { SERVER_URL } from '../config';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return loadUserFromStorage();
    } catch (error) {
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
        // Система готова к работе с реальными пользователями
        
        setIsInitialized(true);
      } catch (error) {
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
      
      // Сначала регистрируем на сервере
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

      if (!response.ok) {
        const errorText = await response.text();
        // Server registration failed
        
        // Пытаемся парсить JSON ошибки
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.error || 'Ошибка регистрации на сервере');
        } catch {
          alert('Ошибка регистрации на сервере. Используется локальная регистрация.');
        }
        
        // Переходим к локальной регистрации
        throw new Error('Server registration failed');
      }

      const serverUser = await response.json();
      
      // Сохраняем локально
      const users = loadUsersFromStorage();
      const updatedUsers = [...users, serverUser];
      saveUsersToStorage(updatedUsers);
      setUser(serverUser);
      saveUserToStorage(serverUser);
      
      // Принудительно обновляем данные для синхронизации с другими клиентами
      try {
        // Запрашиваем обновленные данные с сервера
        const syncResponse = await fetch(`${SERVER_URL}/api/sync`);
        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          console.log('✅ Данные синхронизированы после регистрации');
          
          // Обновляем localStorage с новыми данными
          if (syncData.teacherProfiles) {
            localStorage.setItem('tutoring_teacherProfiles', JSON.stringify(syncData.teacherProfiles));
          }
          if (syncData.studentProfiles) {
            localStorage.setItem('tutoring_studentProfiles', JSON.stringify(syncData.studentProfiles));
          }
          
          // Обновляем список пользователей
          const allUsers = [];
          if (syncData.teacherProfiles) {
            Object.entries(syncData.teacherProfiles).forEach(([id, profile]) => {
              allUsers.push({
                id,
                email: profile.email || '',
                name: profile.name || '',
                nickname: profile.nickname || '',
                role: 'teacher',
                phone: profile.phone || '',
                profile: profile
              });
            });
          }
          if (syncData.studentProfiles) {
            Object.entries(syncData.studentProfiles).forEach(([id, profile]) => {
              allUsers.push({
                id,
                email: profile.email || '',
                name: profile.name || '',
                nickname: profile.nickname || '',
                role: 'student',
                phone: profile.phone || '',
                profile: profile
              });
            });
          }
          localStorage.setItem('tutoring_users', JSON.stringify(allUsers));
          
          // Отправляем кастомное событие для обновления в других компонентах
          window.dispatchEvent(new CustomEvent('customStorage', {
            detail: {
              key: 'tutoring_users',
              newValue: JSON.stringify(allUsers)
            }
          }));
        }
      } catch (syncError) {
        console.warn('⚠️ Не удалось синхронизировать данные после регистрации:', syncError);
      }
      
      return true;
    } catch (error) {
      // Fallback к локальной регистрации, если сервер недоступен
      
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
      
      // Создаем базовый профиль в зависимости от роли
      const baseProfile = role === 'teacher' ? {
        subjects: [],
        experience: 'experienced' as const,
        grades: [],
        goals: [],
        lessonTypes: [],
        durations: [],
        formats: [],
        offlineAvailable: false,
        city: '',
        overbookingEnabled: false,
        bio: '',
        avatar: '',
        rating: 0,
        hourlyRate: 1500,
        age: undefined,
        experienceYears: undefined,
        education: {
          university: '',
          degree: '',
          graduationYear: undefined,
          courses: []
        }
      } as TeacherProfile : {
        grade: '',
        bio: '',
        avatar: '',
        subjects: [],
        age: undefined,
        school: '',
        city: '',
        phone: '',
        parentName: '',
        parentPhone: '',
        goals: [],
        interests: [],
        learningStyle: 'mixed' as const,
        experience: 'beginner' as const,
        preferredFormats: [],
        preferredDurations: [],
        timeZone: '',
      } as StudentProfile;

      const newUser: User = {
        id: uuidv4(),
        email,
        name,
        nickname,
        role,
        phone,
        profile: baseProfile,
        avatar: baseProfile.avatar
      };
      
      const updatedUsers = [...users, newUser];
      saveUsersToStorage(updatedUsers);
      setUser(newUser);
      saveUserToStorage(newUser);
      
      // Если это преподаватель, сохраняем его профиль в teacherProfiles
      if (role === 'teacher') {
        const currentTeacherProfiles = JSON.parse(localStorage.getItem('tutoring_teacherProfiles') || '{}');
        currentTeacherProfiles[newUser.id] = baseProfile;
        localStorage.setItem('tutoring_teacherProfiles', JSON.stringify(currentTeacherProfiles));
        console.log('✅ Профиль преподавателя сохранен локально:', newUser.id);
        
        // Отправляем событие для обновления DataContext
        window.dispatchEvent(new CustomEvent('customStorage', {
          detail: {
            key: 'tutoring_teacherProfiles',
            newValue: JSON.stringify(currentTeacherProfiles)
          }
        }));
      }
      
      // Если это студент, сохраняем его профиль в studentProfiles
      if (role === 'student') {
        const currentStudentProfiles = JSON.parse(localStorage.getItem('tutoring_studentProfiles') || '{}');
        currentStudentProfiles[newUser.id] = baseProfile;
        localStorage.setItem('tutoring_studentProfiles', JSON.stringify(currentStudentProfiles));
        console.log('✅ Профиль студента сохранен локально:', newUser.id);
        
        // Отправляем событие для обновления DataContext
        window.dispatchEvent(new CustomEvent('customStorage', {
          detail: {
            key: 'tutoring_studentProfiles',
            newValue: JSON.stringify(currentStudentProfiles)
          }
        }));
      }
      
      // Пытаемся загрузить локальные данные на сервер
      try {
        const localTeacherProfiles = JSON.parse(localStorage.getItem('tutoring_teacherProfiles') || '{}');
        const localStudentProfiles = JSON.parse(localStorage.getItem('tutoring_studentProfiles') || '{}');
        const localUsers = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
        
        // Если есть локальные данные, пытаемся их загрузить на сервер
        if (Object.keys(localTeacherProfiles).length > 0 || Object.keys(localStudentProfiles).length > 0) {
          const uploadResponse = await fetch(`${SERVER_URL}/api/upload-local-data`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              teacherProfiles: localTeacherProfiles,
              studentProfiles: localStudentProfiles,
              users: localUsers
            })
          });
          
          if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            console.log('✅ Локальные данные загружены на сервер:', result);
            alert('Регистрация выполнена локально и данные синхронизированы с сервером!');
          } else {
            console.warn('⚠️ Не удалось загрузить локальные данные на сервер');
            alert('Регистрация выполнена локально. Данные будут синхронизированы при подключении к серверу.');
          }
        } else {
          alert('Регистрация выполнена локально. Данные будут синхронизированы при подключении к серверу.');
        }
      } catch (uploadError) {
        console.warn('⚠️ Ошибка загрузки локальных данных на сервер:', uploadError);
        alert('Регистрация выполнена локально. Данные будут синхронизированы при подключении к серверу.');
      }
      
      return true;
    }
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
      
      // Отправляем обновление на сервер
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        // В production отправляем на сервер
        fetch('https://tutoring-platform-1756666331-zjfl.onrender.com/api/updateProfile', {
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

      // Удаляем связанные данные пользователя
      // Удаляем слоты преподавателя
      const timeSlots = JSON.parse(localStorage.getItem('tutoring_timeSlots') || '[]');
      const updatedTimeSlots = timeSlots.filter((slot: any) => slot.teacherId !== user.id);
      localStorage.setItem('tutoring_timeSlots', JSON.stringify(updatedTimeSlots));

      // Удаляем уроки пользователя
      const lessons = JSON.parse(localStorage.getItem('tutoring_lessons') || '[]');
      const updatedLessons = lessons.filter((lesson: any) => 
        lesson.teacherId !== user.id && lesson.studentId !== user.id
      );
      localStorage.setItem('tutoring_lessons', JSON.stringify(updatedLessons));

      // Удаляем чаты пользователя
      const chats = JSON.parse(localStorage.getItem('tutoring_chats') || '[]');
      const updatedChats = chats.filter((chat: any) => 
        !chat.participants.includes(user.id)
      );
      localStorage.setItem('tutoring_chats', JSON.stringify(updatedChats));

      // Удаляем посты пользователя
      const posts = JSON.parse(localStorage.getItem('tutoring_posts') || '[]');
      const updatedPosts = posts.filter((post: any) => post.userId !== user.id);
      localStorage.setItem('tutoring_posts', JSON.stringify(updatedPosts));

      // Удаляем уведомления пользователя
      const notifications = JSON.parse(localStorage.getItem('tutoring_notifications') || '[]');
      const updatedNotifications = notifications.filter((notification: any) => 
        notification.userId !== user.id
      );
      localStorage.setItem('tutoring_notifications', JSON.stringify(updatedNotifications));

      // Выходим из аккаунта
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