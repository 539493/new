import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { TimeSlot, Lesson, Chat, FilterOptions, User, Post, Comment, StudentProfile, TeacherProfile, Notification, SearchFilters } from '../types';
import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_CONFIG } from '../config';
import { useAuth } from './AuthContext';

// Типизация контекста (можно расширить по необходимости)
interface DataContextType {
  timeSlots: TimeSlot[];
  lessons: Lesson[];
  chats: Chat[];
  posts: Post[];
  notifications: Notification[];
  createTimeSlot: (slot: Omit<TimeSlot, 'id'>) => void;
  bookLesson: (slotId: string, studentId: string, studentName: string, comment?: string) => void;
  cancelLesson: (lessonId: string) => void;
  rescheduleLesson: (lessonId: string, newDate: string, newStartTime: string) => void;
  getFilteredSlots: (filters: FilterOptions) => TimeSlot[];
  sendMessage: (chatId: string, senderId: string, senderName: string, content: string) => void;
  sendMessageToUser: (senderId: string, senderName: string, receiverId: string, receiverName: string, content: string) => string;
  getOrCreateChat: (participant1Id: string, participant2Id: string, participant1Name: string, participant2Name: string) => string;
  clearAllData: () => void;
  isConnected: boolean;
  completeLesson: (lessonId: string) => void;
  studentProfiles: Record<string, StudentProfile>;
  teacherProfiles: Record<string, TeacherProfile>;
  updateStudentProfile: (studentId: string, profile: StudentProfile) => void;
  deleteSlot: (slotId: string) => void;
  createSlot: (slot: Omit<TimeSlot, 'id' | 'isBooked'>, studentId?: string, studentName?: string, options?: { mode?: string }) => Promise<TimeSlot>;
  allUsers: User[];
  setAllUsers: (users: User[]) => void;
  refreshUsers: () => void; // Добавляем функцию для обновления пользователей
  loadRegisteredTeachers: () => Promise<any[]>; // Функция для загрузки зарегистрированных преподавателей (независимо от онлайн статуса)
  refreshAllData: () => void; // Функция для принудительного обновления всех данных
  forceSyncData: () => Promise<void>; // Функция для принудительной синхронизации с сервером
  uploadLocalDataToServer: () => Promise<any>; // Функция для загрузки локальных данных на сервер
  deleteUser: (userId: string) => Promise<boolean>; // Функция для удаления пользователя
  updateTeacherProfile: (teacherId: string, profile: TeacherProfile) => void;
  socketRef: React.MutableRefObject<Socket | null>;
  loadInitialData: () => void;
  // Функции для работы с записями
  createPost: (postData: { text: string; media: File[]; type: 'text' | 'image' | 'video' }) => void;
  addReaction: (postId: string, reactionType: string) => void;
  addComment: (postId: string, commentText: string) => void;
  sharePost: (postId: string) => void;
  bookmarkPost: (postId: string) => void;
  editPost: (postId: string, newText: string) => void;
  deletePost: (postId: string) => void;
  // Новые функции для постов
  searchPosts: (filters: SearchFilters) => void;
  getPostsByUser: (userId: string) => Post[];
  getBookmarkedPosts: (userId: string) => Post[];
  // Функции для уведомлений
  subscribeToNotifications: (userId: string) => void;
  unsubscribeFromNotifications: (userId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;
  deleteNotification: (notificationId: string) => void;
  // Функции для управления чатами
  deleteChat: (chatId: string) => void;
  markChatAsRead: (chatId: string) => void;
  clearChatMessages: (chatId: string) => void;
  archiveChat: (chatId: string) => void;
  unarchiveChat: (chatId: string) => void;
  loadChatsFromServer: () => Promise<void>;
  // Функция для удаления всех данных пользователя
  deleteUserData: (userId: string) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};

interface DataProviderProps {
  children: ReactNode;
}

// Функции для работы с localStorage
const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : defaultValue;
    }
  } catch (e) {
    // Error loading from localStorage
  }
  return defaultValue;
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Saved to localStorage
  } catch (e) {
    // Error saving to localStorage
  }
};

// Начальные данные для офлайн режима
const getInitialData = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return {
    timeSlots: [],
    lessons: [],
    chats: [],
    studentProfiles: {},
    teacherProfiles: {}
  };
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // WebSocket состояние
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  // Инициализация состояния с данными из localStorage или начальными данными
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => {
    const saved = loadFromStorage('tutoring_timeSlots', []);
    if (saved.length > 0) {
      return saved;
    }
    // Если нет сохраненных данных, загружаем начальные
    const initialData = getInitialData();
    saveToStorage('tutoring_timeSlots', initialData.timeSlots);
    return initialData.timeSlots;
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    return loadFromStorage('tutoring_lessons', []);
  });

  const [chats, setChats] = useState<Chat[]>(() => {
    return loadFromStorage('tutoring_chats', []);
  });

  const [studentProfiles, setStudentProfiles] = useState<Record<string, StudentProfile>>(() => {
    const saved = loadFromStorage('tutoring_studentProfiles', {});
    if (Object.keys(saved).length > 0) {
      return saved;
    }
    // Если нет сохраненных данных, загружаем начальные
    const initialData = getInitialData();
    saveToStorage('tutoring_studentProfiles', initialData.studentProfiles);
    return initialData.studentProfiles;
  });

  const [teacherProfiles, setTeacherProfiles] = useState<Record<string, TeacherProfile>>(() => {
    const saved = loadFromStorage('tutoring_teacherProfiles', {});
    if (Object.keys(saved).length > 0) {
      console.log('📱 Загружены локальные профили преподавателей:', Object.keys(saved).length);
      return saved;
    }
    // Если нет сохраненных данных, загружаем начальные
    const initialData = getInitialData();
    saveToStorage('tutoring_teacherProfiles', initialData.teacherProfiles);
    return initialData.teacherProfiles;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
      console.log('🔄 Загружаем пользователей из localStorage при инициализации:', users.length);
      
      // Загружаем зарегистрированных преподавателей из отдельного ключа
      const registeredTeachers = JSON.parse(localStorage.getItem('tutoring_registeredTeachers') || '[]');
      console.log('👨‍🏫 Зарегистрированных преподавателей (постоянно сохраненных):', registeredTeachers.length);
      
      // Объединяем обычных пользователей с зарегистрированными преподавателями
      const allUsersCombined = [...users];
      registeredTeachers.forEach((teacher: any) => {
        const exists = allUsersCombined.find((u: any) => u.id === teacher.id);
        if (!exists) {
          allUsersCombined.push(teacher);
        }
      });
      
      // Фильтруем и логируем зарегистрированных преподавателей
      const teachers = allUsersCombined.filter((u: any) => u.role === 'teacher');
      console.log('👨‍🏫 Зарегистрированных преподавателей (включая постоянно сохраненных):', teachers.length, teachers.map((t: any) => ({ id: t.id, name: t.name })));
      
      return allUsersCombined;
    } catch (error) {
      console.error('❌ Ошибка загрузки пользователей из localStorage:', error);
      return [];
    }
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    return loadFromStorage('tutoring_posts', []);
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    return loadFromStorage('tutoring_notifications', []);
  });

  const { user, updateProfile } = useAuth();

  // Функция для загрузки начальных данных
  const loadInitialData = () => {
    // Загружаем данные из localStorage или используем начальные данные
    const savedTimeSlots = loadFromStorage('tutoring_timeSlots', []);
    const savedLessons = loadFromStorage('tutoring_lessons', []);
    const savedChats = loadFromStorage('tutoring_chats', []);
    const initialData = getInitialData();
    
    // Приоритет отдаем сохраненным слотам, так как они содержат актуальные данные
    const allTimeSlots = savedTimeSlots.length > 0 ? savedTimeSlots : initialData.timeSlots;
    
    // Убираем дубликаты по ID, приоритет у более новых слотов
    const uniqueTimeSlots = allTimeSlots.filter((slot: TimeSlot, index: number, self: TimeSlot[]) => 
      index === self.findIndex((s: TimeSlot) => s.id === slot.id)
    );
    
    setTimeSlots(uniqueTimeSlots);
    setLessons(savedLessons);
    setChats(savedChats);
    setStudentProfiles(initialData.studentProfiles);
    
    // Сохраняем объединенные данные
    saveToStorage('tutoring_timeSlots', uniqueTimeSlots);
    saveToStorage('tutoring_lessons', savedLessons);
    saveToStorage('tutoring_chats', savedChats);
    saveToStorage('tutoring_studentProfiles', initialData.studentProfiles);
    
    // Загружаем чаты с сервера
    loadChatsFromServer();
  };

  // Функция для загрузки пользователей с сервера
  const loadUsersFromServer = async () => {
    try {
      console.log('🔄 Загружаем пользователей с сервера Render...');
      const response = await fetch(`${SERVER_URL}/api/users`);
      
      if (!response.ok) {
        console.warn('⚠️ Не удалось загрузить пользователей с сервера:', response.status);
        return [];
      }
      
      const serverUsers = await response.json();
      console.log('✅ Пользователи загружены с сервера Render:', serverUsers.length);
      
      // Объединяем с локальными пользователями
      const localUsers = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
      console.log('📱 Локальные пользователи:', localUsers.length);
      
      const allUsers = [...localUsers, ...serverUsers];
      
      // Убираем дубликаты по ID, приоритет у серверных данных
      const uniqueUsers = allUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      );
      
      console.log('✅ Уникальные пользователи:', uniqueUsers.length);
      console.log('👨‍🏫 Преподаватели (включая офлайн):', uniqueUsers.filter(u => u.role === 'teacher').length);
      console.log('👨‍🎓 Студенты:', uniqueUsers.filter(u => u.role === 'student').length);
      
      setAllUsers(uniqueUsers);
      localStorage.setItem('tutoring_users', JSON.stringify(uniqueUsers));
      return uniqueUsers;
    } catch (error) {
      console.error('❌ Ошибка загрузки пользователей с сервера:', error);
      return [];
    }
  };

  // Функция для загрузки уроков с сервера
  const loadLessonsFromServer = async () => {
    try {
      console.log('Loading lessons from server...');
      const response = await fetch(`${SERVER_URL}/api/lessons`);
      
      if (!response.ok) {
        console.error('Failed to load lessons from server:', response.status);
        return [];
      }
      
      const serverLessons = await response.json();
      console.log('Loaded lessons from server:', serverLessons.length, serverLessons);
      
      // Объединяем с локальными уроками
      const localLessons = JSON.parse(localStorage.getItem('tutoring_lessons') || '[]');
      console.log('Local lessons:', localLessons.length, localLessons);
      
      const allLessons = [...localLessons, ...serverLessons];
      
      // Убираем дубликаты по ID, приоритет у серверных данных
      const uniqueLessons = allLessons.filter((lesson, index, self) => 
        index === self.findIndex(l => l.id === lesson.id)
      );
      
      console.log('Setting lessons in context:', uniqueLessons.length, uniqueLessons);
      setLessons(uniqueLessons);
      saveToStorage('tutoring_lessons', uniqueLessons);
      return uniqueLessons;
    } catch (error) {
      console.error('Error loading lessons from server:', error);
      return [];
    }
  };

  // Функция для принудительного обновления списка пользователей
  const refreshUsers = () => {
    try {
      console.log('🔄 Принудительное обновление списка пользователей...');
      const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
      console.log('👥 Загружено пользователей из localStorage:', users.length);
      
      // Загружаем зарегистрированных преподавателей из отдельного ключа
      const registeredTeachers = JSON.parse(localStorage.getItem('tutoring_registeredTeachers') || '[]');
      console.log('👨‍🏫 Зарегистрированных преподавателей (постоянно сохраненных):', registeredTeachers.length);
      
      // Объединяем обычных пользователей с зарегистрированными преподавателями
      const allUsersCombined = [...users];
      registeredTeachers.forEach((teacher: any) => {
        const exists = allUsersCombined.find((u: any) => u.id === teacher.id);
        if (!exists) {
          allUsersCombined.push(teacher);
          console.log('✅ Добавлен зарегистрированный преподаватель:', teacher.name);
        } else {
          console.log('⏭️ Преподаватель уже существует:', teacher.name);
        }
      });
      
      // Фильтруем только преподавателей для логирования
      const teachers = allUsersCombined.filter((u: any) => u.role === 'teacher');
      console.log('👨‍🏫 Зарегистрированных преподавателей (включая постоянно сохраненных):', teachers.length, teachers.map((t: any) => ({ id: t.id, name: t.name })));
      
      // ВАЖНО: НЕ перезаписываем allUsers, если они уже содержат нужных преподавателей
      const currentUsers = allUsers || [];
      const currentTeachers = currentUsers.filter((u: any) => u.role === 'teacher');
      
      if (teachers.length > currentTeachers.length) {
        setAllUsers(allUsersCombined);
        console.log('✅ Обновлены пользователи, добавлено преподавателей:', teachers.length - currentTeachers.length);
      } else {
        console.log('⏭️ Пользователи уже актуальны, обновление не требуется');
      }
      
      // Также принудительно обновляем teacherProfiles из localStorage
      const teacherProfilesData = JSON.parse(localStorage.getItem('tutoring_teacherProfiles') || '{}');
      console.log('📱 Обновляем teacherProfiles из localStorage:', Object.keys(teacherProfilesData).length);
      setTeacherProfiles(teacherProfilesData);
      
      console.log('✅ Обновление пользователей завершено');
    } catch (error) {
      console.error('❌ Ошибка при обновлении пользователей:', error);
      // НЕ очищаем allUsers при ошибке - это может привести к потере данных
      console.log('⚠️ Сохраняем текущих пользователей при ошибке');
    }
  };

  // Функция для принудительной загрузки зарегистрированных преподавателей (независимо от онлайн статуса)
  const loadRegisteredTeachers = async () => {
    try {
      console.log('👨‍🏫 Принудительная загрузка зарегистрированных преподавателей...');
      
      // Сначала пытаемся загрузить с сервера Render
      try {
        await loadUsersFromServer();
      } catch (serverError) {
        console.warn('⚠️ Не удалось загрузить с сервера, используем локальные данные:', serverError);
      }
      
      // Загружаем из localStorage (включая данные с сервера)
      const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
      const teachers = users.filter((u: any) => u.role === 'teacher');
      
      console.log('📱 Зарегистрированных преподавателей (включая офлайн):', teachers.length);
      teachers.forEach((teacher: any) => {
        console.log(`  - ${teacher.name} (${teacher.email}) - ID: ${teacher.id} - Статус: зарегистрирован`);
      });
      
      // Принудительно сохраняем зарегистрированных преподавателей в отдельном ключе
      const registeredTeachers = teachers.map(teacher => ({
        ...teacher,
        isRegistered: true,
        isOnline: false, // Всегда показываем как зарегистрированных, независимо от онлайн статуса
        lastSeen: new Date().toISOString()
      }));
      
      // Сохраняем зарегистрированных преподавателей в отдельном ключе для постоянного хранения
      localStorage.setItem('tutoring_registeredTeachers', JSON.stringify(registeredTeachers));
      
      // Обновляем состояние
      setAllUsers(users);
      
      // Также загружаем teacherProfiles
      const teacherProfilesData = JSON.parse(localStorage.getItem('tutoring_teacherProfiles') || '{}');
      setTeacherProfiles(teacherProfilesData);
      
      // Принудительно обновляем состояние для гарантии отображения
      console.log('🔄 Принудительное обновление состояния для гарантии видимости репетиторов...');
      
      console.log('✅ Зарегистрированные преподаватели загружены (независимо от онлайн статуса)');
      return teachers;
    } catch (error) {
      console.error('❌ Ошибка загрузки зарегистрированных преподавателей:', error);
      return [];
    }
  };

  // Функция для принудительного обновления всех данных
  const refreshAllData = () => {
    console.log('🔄 Принудительное обновление всех данных...');
    // Сначала принудительно загружаем зарегистрированных преподавателей (независимо от онлайн статуса)
    loadRegisteredTeachers().catch(console.error);
    // Затем обновляем локальные данные
    refreshUsers();
    // Затем загружаем с сервера (если есть соединение)
    loadUsersFromServer().catch(console.error);
    loadLessonsFromServer().catch(console.error);
    
    // Запрашиваем все слоты и пользователей с сервера
    if (socketRef.current && isConnected) {
      socketRef.current.emit('requestAllSlots');
      socketRef.current.emit('requestAllUsers');
    }
    
    // Принудительно синхронизируем с сервером (включая слоты)
    forceSyncData().catch(error => {
      console.error('❌ Ошибка при синхронизации данных:', error);
    });
  };

  // Функция для принудительной синхронизации всех данных с сервера
  const forceSyncData = async () => {
    try {
      console.log('🔄 Принудительная синхронизация данных с сервера...');
      
      // Сначала загружаем пользователей
      await loadUsersFromServer();
      
      const response = await fetch(`${SERVER_URL}/api/sync`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Добавляем timeout для запроса
        signal: AbortSignal.timeout(10000) // 10 секунд timeout
      });
      
      if (!response.ok) {
        console.warn('⚠️ Не удалось синхронизировать данные с сервера:', response.status, response.statusText);
        // Не выбрасываем ошибку, продолжаем работу с локальными данными
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('⚠️ Сервер вернул не-JSON ответ:', contentType);
        return;
      }
      
      const syncData = await response.json();
      console.log('✅ Данные синхронизации получены:', Object.keys(syncData));
      
      // Обновляем слоты
      if (syncData.timeSlots) {
        setTimeSlots(syncData.timeSlots);
        saveToStorage('tutoring_timeSlots', syncData.timeSlots);
        console.log('✅ Слоты обновлены:', syncData.timeSlots.length);
      }
      
      // Обновляем уроки
      if (syncData.lessons) {
        setLessons(syncData.lessons);
        saveToStorage('tutoring_lessons', syncData.lessons);
        console.log('✅ Уроки обновлены:', syncData.lessons.length);
      }
      
      // Обновляем чаты
      if (syncData.chats) {
        setChats(syncData.chats);
        saveToStorage('tutoring_chats', syncData.chats);
        console.log('✅ Чаты обновлены:', syncData.chats.length);
      }
      
      // Обновляем посты
      if (syncData.posts) {
        setPosts(syncData.posts);
        saveToStorage('tutoring_posts', syncData.posts);
        console.log('✅ Посты обновлены:', syncData.posts.length);
      }
      
      // Обновляем пользователей
      const users: User[] = [];
      if (syncData.teacherProfiles) {
        console.log('👨‍🏫 Обновляем профили преподавателей:', Object.keys(syncData.teacherProfiles).length);
        Object.entries(syncData.teacherProfiles).forEach(([id, profile]) => {
          const teacherProfile = profile as TeacherProfile;
          const user = {
            id,
            email: String(teacherProfile.email || ''),
            name: String(teacherProfile.name || ''),
            nickname: String(teacherProfile.nickname || ''),
            role: 'teacher' as const,
            phone: String(teacherProfile.phone || ''),
            profile: teacherProfile
          };
          users.push(user);
          console.log('👨‍🏫 Добавлен преподаватель:', user.id, user.name, user.email);
        });
      }
      if (syncData.studentProfiles) {
        Object.entries(syncData.studentProfiles).forEach(([id, profile]) => {
          const studentProfile = profile as StudentProfile;
          users.push({
            id,
            email: String(studentProfile.email || ''),
            name: String(studentProfile.name || ''),
            nickname: String(studentProfile.nickname || ''),
            role: 'student' as const,
            phone: String(studentProfile.phone || ''),
            profile: studentProfile
          });
        });
      }
      setAllUsers(users);
      saveToStorage('tutoring_users', users);
      
      console.log('✅ Синхронизация завершена успешно');
      console.log('📊 Итоговые данные:');
      console.log('- Всего пользователей:', users.length);
      console.log('- Преподавателей:', users.filter(u => u.role === 'teacher').length);
      console.log('- Студентов:', users.filter(u => u.role === 'student').length);
      console.log('- Пользователи:', users);
    } catch (error) {
      console.warn('Error syncing data (continuing with local data):', error);
      // Не выбрасываем ошибку, продолжаем работу с локальными данными
    }
  };

  // Функция для загрузки локальных данных на сервер
  const uploadLocalDataToServer = async () => {
    try {
      console.log('📤 Загружаем локальные данные на сервер...');
      
      // Получаем локальные данные
      const localTeacherProfiles = JSON.parse(localStorage.getItem('tutoring_teacherProfiles') || '{}');
      const localStudentProfiles = JSON.parse(localStorage.getItem('tutoring_studentProfiles') || '{}');
      const localUsers = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
      
      console.log('📊 Локальные данные:');
      console.log(`   👨‍🏫 Преподаватели: ${Object.keys(localTeacherProfiles).length}`);
      console.log(`   👨‍🎓 Студенты: ${Object.keys(localStudentProfiles).length}`);
      console.log(`   👥 Пользователи: ${localUsers.length}`);
      
      // Отправляем данные на сервер
      const response = await fetch(`${SERVER_URL}/api/upload-local-data`, {
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки данных на сервер');
      }
      
      const result = await response.json();
      console.log('✅ Локальные данные успешно загружены на сервер:', result);
      
      // После успешной загрузки синхронизируем данные с сервера
      await forceSyncData();
      
      return result;
    } catch (error) {
      console.error('❌ Ошибка загрузки локальных данных на сервер:', error);
      throw error;
    }
  };

  // Функция для удаления пользователя
  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      console.log(`🗑️ Удаляем пользователя: ${userId}`);
      
      // Отправляем запрос на удаление на сервер
      const response = await fetch(`${SERVER_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка удаления пользователя');
      }
      
      const result = await response.json();
      console.log('✅ Пользователь успешно удален:', result);
      
      // Удаляем пользователя из локального состояния
      setAllUsers(prev => {
        const updated = prev.filter(user => user.id !== userId);
        saveToStorage('tutoring_users', updated);
        return updated;
      });
      
      // Удаляем из профилей
      setTeacherProfiles(prev => {
        const updated = { ...prev };
        delete updated[userId];
        saveToStorage('tutoring_teacherProfiles', updated);
        return updated;
      });
      
      setStudentProfiles(prev => {
        const updated = { ...prev };
        delete updated[userId];
        saveToStorage('tutoring_studentProfiles', updated);
        return updated;
      });
      
      // Удаляем связанные данные
      setTimeSlots(prev => prev.filter(slot => slot.teacherId !== userId));
      setLessons(prev => prev.filter(lesson => 
        lesson.teacherId !== userId && lesson.studentId !== userId
      ));
      setChats(prev => prev.filter(chat => 
        !chat.participants.includes(userId)
      ));
      setPosts(prev => prev.filter(post => post.userId !== userId));
      setNotifications(prev => prev.filter(notification => 
        notification.userId !== userId
      ));
      
      return true;
    } catch (error) {
      console.error('❌ Ошибка удаления пользователя:', error);
      return false;
    }
  };

  // Инициализация WebSocket соединения
  useEffect(() => {
    // Сначала загружаем локальных репетиторов для гарантии их отображения
    console.log('🔄 Инициализация: загружаем локальных репетиторов...');
    loadRegisteredTeachers();
    
    // Проверяем, доступен ли сервер перед подключением
    const checkServerAvailability = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 секунд timeout
        });
        if (response.ok) {
          const healthData = await response.json();
          console.log('Server health check passed:', healthData);
          return true;
        }
        return false;
      } catch (error) {
        console.warn('Server not available, working in offline mode:', error);
        return false;
      }
    };

    const initializeConnection = async () => {
      const serverAvailable = await checkServerAvailability();
      
      if (!serverAvailable) {
        console.log('Server not available, loading local data only');
        loadInitialData();
        loadLessonsFromServer();
        // Принудительно загружаем репетиторов даже при отсутствии сервера
        loadRegisteredTeachers().catch(console.error);
        return;
      }

      console.log('Server is available, initializing Socket.IO connection...');
    
    const newSocket = io(SERVER_URL, {
      ...SOCKET_CONFIG,
      reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        timeout: 10000,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setIsConnected(true);
        console.log('✅ Connected to server via Socket.IO');
        console.log(`🌐 Server URL: ${SERVER_URL}`);
        console.log(`🔌 Socket ID: ${newSocket.id}`);
        
        // При подключении принудительно обновляем все данные
        console.log('🔄 Первоначальное подключение - обновляем данные...');
        refreshAllData();
      
      // Синхронизируем локальные слоты с сервером при восстановлении соединения
      const localSlots = loadFromStorage('tutoring_timeSlots', []);
      if (localSlots.length > 0) {
        localSlots.forEach((slot: TimeSlot) => {
          if (socketRef.current) {
            socketRef.current.emit('createSlot', slot);
          }
        });
      }

        // Запрашиваем все посты и уведомления
        if (socketRef.current) {
          socketRef.current.emit('requestAllPosts');
          if (user) {
            socketRef.current.emit('requestUserNotifications', user.id);
            socketRef.current.emit('subscribeNotifications', user.id);
          }
        }
    });

    newSocket.on('disconnect', () => {
      // setIsConnected(false); // Всегда онлайн
        console.log('🔌 Disconnected from server');
      });

      newSocket.on('reconnect', (attemptNumber) => {
        setIsConnected(true);
        console.log(`🔄 Reconnected to server after ${attemptNumber} attempts`);
        
        // При восстановлении соединения принудительно обновляем данные
        console.log('🔄 Восстановление соединения - обновляем данные...');
        refreshAllData();
      });

      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    // Добавляем обработку ошибок подключения
    newSocket.on('connect_error', (error) => {
      // setIsConnected(false); // Всегда онлайн
        console.warn('❌ Socket.IO connection error:', error);
        console.warn('🔧 Working in offline mode until reconnection...');
      
      // При ошибке подключения загружаем начальные данные
      loadInitialData();
        loadLessonsFromServer();
        // Принудительно загружаем репетиторов даже при ошибке подключения
        loadRegisteredTeachers().catch(console.error);
    });

    // Получаем все актуальные данные при подключении
    newSocket.on('initialData', (data: { timeSlots: TimeSlot[]; lessons: Lesson[]; chats: Chat[] }) => {
      
      // Объединяем серверные данные с локальными
      const currentTimeSlots = loadFromStorage('tutoring_timeSlots', []);
      const allTimeSlots = [...currentTimeSlots, ...data.timeSlots];
      
      // Убираем дубликаты по ID, приоритет у серверных данных
      const uniqueTimeSlots = allTimeSlots.filter((slot: TimeSlot, index: number, self: TimeSlot[]) => 
        index === self.findIndex((s: TimeSlot) => s.id === slot.id)
      );
      
      setTimeSlots(uniqueTimeSlots);
      setLessons(data.lessons);
      saveToStorage('tutoring_timeSlots', uniqueTimeSlots);
      saveToStorage('tutoring_lessons', data.lessons);
      if (data.chats) {
        setChats(data.chats);
        saveToStorage('tutoring_chats', data.chats);
      }
    });

    // Слушаем все слоты при подключении для синхронизации
    newSocket.on('allSlots', (allSlots: TimeSlot[]) => {
      console.log('✅ Received all slots from server:', allSlots.length);
      setTimeSlots(allSlots);
      saveToStorage('tutoring_timeSlots', allSlots);
      console.log('✅ All slots synchronized, total slots:', allSlots.length);
      });

      // Слушаем всех пользователей при подключении для синхронизации
      newSocket.on('allUsers', (allUsers: User[]) => {
        setAllUsers(allUsers);
        saveToStorage('tutoring_users', allUsers);
      });

      // Запрашиваем все слоты при подключении
      if (socketRef.current && isConnected) {
        socketRef.current.emit('requestAllSlots');
        socketRef.current.emit('requestAllUsers');
      }

    // Слушаем обновления слотов от других клиентов
    newSocket.on('slotCreated', (newSlot: TimeSlot) => {
        console.log('✅ Slot created via WebSocket:', newSlot);
      setTimeSlots(prev => {
        const exists = prev.find(slot => slot.id === newSlot.id);
        if (!exists) {
          const updated = [...prev, newSlot];
          saveToStorage('tutoring_timeSlots', updated);
            console.log('✅ New slot added, total slots:', updated.length);
            
            // ВАЖНО: Гарантируем, что репетитор остается видимым после создания слота
            try {
              const currentUsers = allUsers || [];
              const teacherExists = currentUsers.find((u: any) => u.id === newSlot.teacherId);
              
              if (!teacherExists) {
                console.log('⚠️ Репетитор не найден в allUsers после создания слота, добавляем...');
                const teacherUser = {
                  id: newSlot.teacherId,
                  name: newSlot.teacherName,
                  avatar: newSlot.teacherAvatar || '',
                  role: 'teacher',
                  isRegistered: true,
                  isOnline: false,
                  lastSeen: new Date().toISOString()
                };
                
                const updatedUsers = [...currentUsers, teacherUser];
                setAllUsers(updatedUsers);
                localStorage.setItem('tutoring_users', JSON.stringify(updatedUsers));
                
                // Также добавляем в зарегистрированных преподавателей
                const registeredTeachers = JSON.parse(localStorage.getItem('tutoring_registeredTeachers') || '[]');
                const teacherExistsInRegistered = registeredTeachers.find((t: any) => t.id === newSlot.teacherId);
                if (!teacherExistsInRegistered) {
                  const updatedRegisteredTeachers = [...registeredTeachers, teacherUser];
                  localStorage.setItem('tutoring_registeredTeachers', JSON.stringify(updatedRegisteredTeachers));
                  console.log('✅ Репетитор добавлен в зарегистрированных преподавателей');
                }
                
                console.log('✅ Репетитор добавлен в allUsers для гарантии отображения');
              }
            } catch (error) {
              console.error('❌ Ошибка при проверке видимости репетитора:', error);
            }
            
            return updated;
          } else {
            // Обновляем существующий слот
            const updated = prev.map(slot => slot.id === newSlot.id ? newSlot : slot);
            saveToStorage('tutoring_timeSlots', updated);
            console.log('✅ Existing slot updated, total slots:', updated.length);
          return updated;
        }
      });
      
      // Принудительно обновляем данные для всех компонентов
      console.log('🔄 Принудительно обновляем данные после создания слота...');
      forceSyncData().catch(console.error);
    });

    // Слушаем обновления бронирования
    newSocket.on('slotBooked', (data: { slotId: string; lesson: Lesson; bookedStudentId?: string }) => {
        console.log('Slot booked via WebSocket:', data);
        setTimeSlots(prev => {
          const updated = prev.map(slot => 
          slot.id === data.slotId ? { ...slot, isBooked: true, bookedStudentId: data.bookedStudentId || data.lesson.studentId } : slot
      );
          saveToStorage('tutoring_timeSlots', updated);
          return updated;
        });
      setLessons(prev => {
        const exists = prev.find(lesson => lesson.id === data.lesson.id);
        if (!exists) {
          const updated = [...prev, data.lesson];
          saveToStorage('tutoring_lessons', updated);
            console.log('New lesson added, total lessons:', updated.length);
          return updated;
        }
        return prev;
      });
    });

    // Слушаем отмены бронирования
    newSocket.on('slotCancelled', (data: { slotId: string; lessonId: string }) => {
        console.log('Slot cancelled via WebSocket:', data);
        setTimeSlots(prev => {
          const updated = prev.map(slot => 
          slot.id === data.slotId ? { ...slot, isBooked: false, bookedStudentId: undefined } : slot
          );
          saveToStorage('tutoring_timeSlots', updated);
          return updated;
        });
        setLessons(prev => {
          const updated = prev.filter(lesson => lesson.id !== data.lessonId);
          saveToStorage('tutoring_lessons', updated);
          console.log('Lesson removed, total lessons:', updated.length);
          return updated;
        });
    });

    // Слушаем бронирование уроков
    newSocket.on('lessonBooked', (lesson: Lesson) => {
        console.log('Lesson booked via WebSocket:', lesson);
        setLessons(prev => {
          const exists = prev.find(l => l.id === lesson.id);
          if (!exists) {
            const updated = [...prev, lesson];
            saveToStorage('tutoring_lessons', updated);
            console.log('New lesson added via WebSocket, total lessons:', updated.length);
            return updated;
          }
          return prev;
        });
    });

    // Слушаем новые чаты
    newSocket.on('chatCreated', (newChat: Chat) => {
      setChats(prev => {
        const exists = prev.find(chat => chat.id === newChat.id);
        if (!exists) {
          const updated = [...prev, newChat];
          saveToStorage('tutoring_chats', updated);
          return updated;
        }
        return prev;
      });
    });

    newSocket.on('receiveMessage', (data: { chatId: string, message: any }) => {
      setChats(prev => prev.map(chat => {
        if (chat.id === data.chatId) {
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, data.message],
            lastMessage: data.message,
          };
          saveToStorage('tutoring_chats', prev.map(c => c.id === chat.id ? updatedChat : c));
          return updatedChat;
        }
        return chat;
      }));
    });

      // Обработчики событий чатов
      newSocket.on('chatDeleted', (data: { chatId: string }) => {
        console.log('chatDeleted event received:', data);
        setChats(prev => {
          const updated = prev.filter(chat => chat.id !== data.chatId);
          console.log(`Chat ${data.chatId} removed from state. Total chats: ${updated.length}`);
          saveToStorage('tutoring_chats', updated);
          return updated;
        });
      });

      newSocket.on('chatMarkedAsRead', (data: { chatId: string }) => {
        setChats(prev => {
          const updated = prev.map(chat => 
            chat.id === data.chatId 
              ? { ...chat, messages: chat.messages.map(msg => ({ ...msg, isRead: true })) }
              : chat
          );
          saveToStorage('tutoring_chats', updated);
          return updated;
        });
      });

      newSocket.on('chatMessagesCleared', (data: { chatId: string }) => {
        setChats(prev => {
          const updated = prev.map(chat => 
            chat.id === data.chatId 
              ? { ...chat, messages: [] }
              : chat
          );
          saveToStorage('tutoring_chats', updated);
          return updated;
        });
      });

      newSocket.on('chatArchived', (data: { chatId: string }) => {
        setChats(prev => {
          const updated = prev.map(chat => 
            chat.id === data.chatId 
              ? { ...chat, archived: true }
              : chat
          );
          saveToStorage('tutoring_chats', updated);
          return updated;
        });
      });

      // Слушаем восстановление чата из архива
      newSocket.on('chatUnarchived', (data: { chatId: string }) => {
        setChats(prev => {
          const updated = prev.map(chat => 
            chat.id === data.chatId 
              ? { ...chat, archived: false }
              : chat
          );
          saveToStorage('tutoring_chats', updated);
          return updated;
        });
      });

      // Слушаем новые уведомления
      newSocket.on('newNotification', (notification: Notification) => {
        setNotifications(prev => {
          const updated = [...prev, notification];
          saveToStorage('tutoring_notifications', updated);
          return updated;
        });
      });

    // Слушаем удаление слота
    newSocket.on('slotDeleted', (data: { slotId: string }) => {
        console.log('Slot deleted via WebSocket:', data);
      setTimeSlots(prev => {
        const updated = prev.filter(slot => slot.id !== data.slotId);
        saveToStorage('tutoring_timeSlots', updated);
          console.log('Slot removed, total slots:', updated.length);
        return updated;
      });
    });

    // (dedup) Слушатель allSlots уже зарегистрирован выше

      // Слушаем получение всех уроков
      newSocket.on('allLessons', (allLessons: Lesson[]) => {
        console.log('Received all lessons from server:', allLessons.length);
        setLessons(allLessons);
        saveToStorage('tutoring_lessons', allLessons);
      });

      // Слушаем обновления данных от сервера для синхронизации между устройствами
      newSocket.on('dataUpdated', (data: { 
        type: string; 
        timeSlots: TimeSlot[]; 
        lessons?: Lesson[];
        teacherProfiles: Record<string, TeacherProfile>; 
        studentProfiles: Record<string, StudentProfile>; 
      }) => {
        console.log('Received dataUpdated event:', data.type);
        
        // Обновляем слоты
        if (data.timeSlots) {
          setTimeSlots(data.timeSlots);
          saveToStorage('tutoring_timeSlots', data.timeSlots);
          console.log('Slots updated via dataUpdated:', data.timeSlots.length);
        }
        
        // Обновляем уроки
        if (data.lessons) {
          setLessons(data.lessons);
          saveToStorage('tutoring_lessons', data.lessons);
          console.log('Lessons updated via dataUpdated:', data.lessons.length);
        }
        
        // Обновляем профили преподавателей
        if (data.teacherProfiles) {
          setTeacherProfiles(data.teacherProfiles);
          saveToStorage('tutoring_teacherProfiles', data.teacherProfiles);
          
          // Обновляем список пользователей
          const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
          const updatedUsers = users.map((u: User) => {
            if (u.role === 'teacher' && data.teacherProfiles[u.id]) {
              return { ...u, profile: data.teacherProfiles[u.id] };
            }
            return u;
          });
          setAllUsers(updatedUsers);
          saveToStorage('tutoring_users', updatedUsers);
        }
        
        // Обновляем профили студентов
        if (data.studentProfiles) {
          setStudentProfiles(data.studentProfiles);
          saveToStorage('tutoring_studentProfiles', data.studentProfiles);
          
          // Обновляем список пользователей
          const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
          const updatedUsers = users.map((u: User) => {
            if (u.role === 'student' && data.studentProfiles[u.id]) {
              return { ...u, profile: data.studentProfiles[u.id] };
            }
            return u;
          });
          setAllUsers(updatedUsers);
          saveToStorage('tutoring_users', updatedUsers);
        }
      });

      // Слушаем регистрацию новых пользователей
      newSocket.on('userRegistered', (newUser: User) => {
        setAllUsers(prev => {
          const exists = prev.find(user => user.id === newUser.id);
          if (!exists) {
            const updated = [...prev, newUser];
            saveToStorage('tutoring_users', updated);
            
            // Если это преподаватель, сохраняем его в отдельном ключе для постоянного хранения
            if (newUser.role === 'teacher') {
              const registeredTeachers = JSON.parse(localStorage.getItem('tutoring_registeredTeachers') || '[]');
              const teacherToSave = {
                ...newUser,
                isRegistered: true,
                isOnline: false,
                lastSeen: new Date().toISOString()
              };
              const updatedRegisteredTeachers = [...registeredTeachers, teacherToSave];
              localStorage.setItem('tutoring_registeredTeachers', JSON.stringify(updatedRegisteredTeachers));
              console.log('👨‍🏫 Преподаватель сохранен для постоянного отображения:', newUser.name);
            }
            
            return updated;
          }
          return prev;
        });
        // Гарантируем мгновенное отображение нового репетитора у учеников
        try {
          loadRegisteredTeachers();
          if (socketRef.current && isConnected) {
            socketRef.current.emit('requestAllUsers');
          }
        } catch {}
      });

      // Слушаем удаление пользователей
      newSocket.on('userDeleted', (data: { userId: string; userRole: string; deletedUser: any; deletedData: any }) => {
        console.log('🗑️ Получено событие удаления пользователя:', data);
        
        // Удаляем пользователя из списка
        setAllUsers(prev => {
          const updated = prev.filter(user => user.id !== data.userId);
          saveToStorage('tutoring_users', updated);
          return updated;
        });
        
        // Удаляем из профилей
        if (data.userRole === 'teacher') {
          setTeacherProfiles(prev => {
            const updated = { ...prev };
            delete updated[data.userId];
            saveToStorage('tutoring_teacherProfiles', updated);
            return updated;
          });
        } else if (data.userRole === 'student') {
          setStudentProfiles(prev => {
            const updated = { ...prev };
            delete updated[data.userId];
            saveToStorage('tutoring_studentProfiles', updated);
            return updated;
          });
        }
        
        // Удаляем связанные данные
        setTimeSlots(prev => prev.filter(slot => slot.teacherId !== data.userId));
        setLessons(prev => prev.filter(lesson => 
          lesson.teacherId !== data.userId && lesson.studentId !== data.userId
        ));
        setChats(prev => prev.filter(chat => 
          !chat.participants.includes(data.userId)
        ));
        setPosts(prev => prev.filter(post => post.userId !== data.userId));
        setNotifications(prev => prev.filter(notification => 
          notification.userId !== data.userId
        ));
        
        console.log('✅ Пользователь удален из локального состояния');
      });

    // Добавляем обработку события завершения урока
    if (socketRef.current) {
      socketRef.current.on('lessonCompleted', (data: { lesson: any }) => {
        setLessons(prev => {
          const updated = prev.map(l => l.id === data.lesson.id ? data.lesson : l);
          saveToStorage('tutoring_lessons', updated);
          return updated;
        });
        // --- СТАТИСТИКА завершённых уроков ---
        if (user && user.role === 'teacher' && data.lesson.status === 'completed') {
          const profile: TeacherProfile = { ...(user.profile as TeacherProfile) };
          profile.lessonsCount = (profile.lessonsCount || 0) + 1;
          updateProfile(profile);
        }
        // --- КОНЕЦ СТАТИСТИКИ ---
      });
    }

    newSocket.on('studentProfiles', (profiles: Record<string, StudentProfile>) => {
      setStudentProfiles(profiles || {});
        // Обновляем список всех пользователей с профилями студентов
        const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
        const updatedUsers = [...users];
        
        Object.entries(profiles).forEach(([studentId, profile]) => {
          const existingUserIndex = updatedUsers.findIndex((u: User) => u.id === studentId);
          if (existingUserIndex >= 0) {
            updatedUsers[existingUserIndex] = { ...updatedUsers[existingUserIndex], profile };
          } else {
            updatedUsers.push({
              id: studentId,
              email: profile.email || '',
              name: profile.name || '',
              nickname: profile.nickname || '',
              role: 'student',
              phone: profile.phone || '',
              profile
            });
          }
        });
        
        localStorage.setItem('tutoring_users', JSON.stringify(updatedUsers));
        setAllUsers(updatedUsers);
      });
      
      newSocket.on('teacherProfiles', (profiles: Record<string, TeacherProfile>) => {
        // Обновляем состояние teacherProfiles
        setTeacherProfiles(profiles);
        saveToStorage('tutoring_teacherProfiles', profiles);
        
        // Обновляем список всех пользователей с профилями преподавателей
        const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
        const updatedUsers = [...users];
        
        Object.entries(profiles).forEach(([teacherId, profile]) => {
          const existingUserIndex = updatedUsers.findIndex((u: User) => u.id === teacherId);
          if (existingUserIndex >= 0) {
            updatedUsers[existingUserIndex] = { ...updatedUsers[existingUserIndex], profile };
          } else {
            updatedUsers.push({
              id: teacherId,
              email: profile.email || '',
              name: profile.name || '',
              nickname: profile.nickname || '',
              role: 'teacher',
              phone: profile.phone || '',
              profile
            });
          }
        });
        
        localStorage.setItem('tutoring_users', JSON.stringify(updatedUsers));
        setAllUsers(updatedUsers);
      });

      // (dedup) Повторный обработчик studentProfiles удалён
    newSocket.on('studentProfileUpdated', (data: { studentId: string; profile: StudentProfile }) => {
      setStudentProfiles(prev => ({ ...prev, [data.studentId]: data.profile }));
    });

    // --- Синхронизация профиля преподавателя между устройствами ---
    newSocket.on('teacherProfileUpdated', (data: { teacherId: string; profile: TeacherProfile }) => {
      try {
        const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
        const updatedUsers = users.map((u: User) =>
          u.id === data.teacherId ? { ...u, profile: data.profile, avatar: data.profile.avatar } : u
        );
        localStorage.setItem('tutoring_users', JSON.stringify(updatedUsers));
        setAllUsers(updatedUsers);
      } catch (e) {
      }
    });

    // --- Универсальная синхронизация профиля между устройствами ---
      newSocket.on('profileUpdated', (data: { type: string; userId: string; profile: StudentProfile | TeacherProfile } | { id: string; role: string; profile: StudentProfile | TeacherProfile }) => {
      try {
        const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
        let found = false;
          
          // Обрабатываем оба формата данных
          const userId = 'userId' in data ? data.userId : data.id;
          const role = 'type' in data ? data.type : data.role;
          const profile = data.profile;
          
        const updatedUsers = users.map((u: User) => {
            if (u.id === userId) {
            found = true;
              return { ...u, profile: profile, avatar: profile.avatar, name: profile.name || u.name, email: profile.email || u.email };
          }
          return u;
        });
        if (!found) {
          // Добавляем нового пользователя, если его не было
          updatedUsers.push({
              id: userId,
              role: role,
              profile: profile,
              avatar: profile.avatar,
              name: profile.name || '',
              email: profile.email || ''
          });
        }
        localStorage.setItem('tutoring_users', JSON.stringify(updatedUsers));
        setAllUsers(updatedUsers);
          
          // Обновляем профили в соответствующих состояниях
          if (role === 'teacher') {
            setTeacherProfiles(prev => ({ ...prev, [userId]: profile as TeacherProfile }));
          } else if (role === 'student') {
            setStudentProfiles(prev => ({ ...prev, [userId]: profile as StudentProfile }));
          }
          
          console.log('Profile updated via WebSocket:', { userId, role, profile });
      } catch (e) {
          console.error('Error processing profileUpdated event:', e);
        }
      });

      // --- Обработка регистрации нового пользователя ---
      newSocket.on('userRegistered', (newUser: User) => {
        try {
          const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
          
          // Проверяем, есть ли уже такой пользователь
          const existingUserIndex = users.findIndex((u: User) => u.id === newUser.id);
          
          if (existingUserIndex >= 0) {
            // Обновляем существующего пользователя
            users[existingUserIndex] = newUser;
          } else {
            // Добавляем нового пользователя
            users.push(newUser);
          }
          
          localStorage.setItem('tutoring_users', JSON.stringify(users));
          setAllUsers(users);
          
          // Если это преподаватель, сохраняем его в отдельном ключе для постоянного хранения
          if (newUser.role === 'teacher') {
            const registeredTeachers = JSON.parse(localStorage.getItem('tutoring_registeredTeachers') || '[]');
            const teacherToSave = {
              ...newUser,
              isRegistered: true,
              isOnline: false,
              lastSeen: new Date().toISOString()
            };
            const updatedRegisteredTeachers = [...registeredTeachers, teacherToSave];
            localStorage.setItem('tutoring_registeredTeachers', JSON.stringify(updatedRegisteredTeachers));
            console.log('👨‍🏫 Преподаватель сохранен для постоянного отображения:', newUser.name);
          }
          
          // Обновляем зарегистрированных репетиторов и запрашиваем актуальный список
          loadRegisteredTeachers().catch(console.error);
          if (socketRef.current && isConnected) {
            socketRef.current.emit('requestAllUsers');
          }
        } catch (e) {
        }
      });

      // ===== ОБРАБОТЧИКИ ДЛЯ ПОСТОВ =====
      
      // Получение всех постов
      newSocket.on('allPosts', (allPosts: Post[]) => {
        setPosts(allPosts);
        saveToStorage('tutoring_posts', allPosts);
      });

      // Новый пост создан
      newSocket.on('postCreated', (newPost: Post) => {
        setPosts(prev => {
          const updated = [newPost, ...prev];
          saveToStorage('tutoring_posts', updated);
          return updated;
        });
      });

      // Обновление реакции на пост
      newSocket.on('postReactionUpdated', (data: { postId: string; reactions: any[]; likes: number }) => {
        setPosts(prev => {
          const updated = prev.map(post => 
            post.id === data.postId 
              ? { ...post, reactions: data.reactions, likes: data.likes }
              : post
          );
          saveToStorage('tutoring_posts', updated);
          return updated;
        });
      });

      // Добавлен комментарий к посту
      newSocket.on('postCommentAdded', (data: { postId: string; comment: Comment }) => {
        setPosts(prev => {
          const updated = prev.map(post => 
            post.id === data.postId 
              ? { ...post, comments: [...post.comments, data.comment] }
              : post
          );
          saveToStorage('tutoring_posts', updated);
          return updated;
        });
      });

      // Пост отредактирован
      newSocket.on('postEdited', (data: { postId: string; text: string; tags: string[]; editedAt: string }) => {
        setPosts(prev => {
          const updated = prev.map(post => 
            post.id === data.postId 
              ? { 
                  ...post, 
                  text: data.text, 
                  tags: data.tags,
                  editedAt: data.editedAt 
                }
              : post
          );
          saveToStorage('tutoring_posts', updated);
          return updated;
        });
      });

      // Пост удален
      newSocket.on('postDeleted', (data: { postId: string }) => {
        setPosts(prev => {
          const updated = prev.filter(post => post.id !== data.postId);
          saveToStorage('tutoring_posts', updated);
          return updated;
        });
      });

      // Обновление закладки поста
      newSocket.on('postBookmarkUpdated', (data: { postId: string; bookmarks: string[] }) => {
        setPosts(prev => {
          const updated = prev.map(post => 
            post.id === data.postId 
              ? { ...post, bookmarks: data.bookmarks }
              : post
          );
          saveToStorage('tutoring_posts', updated);
          return updated;
        });
      });

      // Результаты поиска постов
      newSocket.on('searchResults', (results: Post[]) => {
        // Здесь можно добавить состояние для результатов поиска
      });

      // ===== ОБРАБОТЧИКИ ДЛЯ УВЕДОМЛЕНИЙ =====
      
      // Получение уведомлений пользователя
      newSocket.on('userNotifications', (userNotifications: Notification[]) => {
        setNotifications(userNotifications);
        saveToStorage('tutoring_notifications', userNotifications);
      });

      // (dedup) Повторный обработчик newNotification удалён (он уже зарегистрирован выше)

      // Уведомление отмечено как прочитанное
      newSocket.on('notificationMarkedAsRead', (data: { notificationId: string }) => {
        setNotifications(prev => {
          const updated = prev.map(n => 
            n.id === data.notificationId 
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          );
          saveToStorage('tutoring_notifications', updated);
          return updated;
        });
      });

      // Все уведомления пользователя отмечены как прочитанные
      newSocket.on('allNotificationsMarkedAsRead', (data: { userId: string }) => {
        setNotifications(prev => {
          const updated = prev.map(n => 
            n.userId === data.userId 
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          );
          saveToStorage('tutoring_notifications', updated);
          return updated;
        });
      });

    return () => {
      try {
        newSocket.removeAllListeners();
      } catch {}
      try {
        newSocket.disconnect();
      } catch {}
      socketRef.current = null;
    };
    };

    initializeConnection();
  }, []);

  // Слушатель изменений localStorage для синхронизации между вкладками
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'tutoring_users') {
        try {
          const newUsers = JSON.parse(e.newValue || '[]');
          setAllUsers(newUsers);
          
          // Принудительно загружаем репетиторов при изменении данных
          const teachers = newUsers.filter((u: any) => u.role === 'teacher');
          console.log('🔄 Обновление репетиторов через localStorage:', teachers.length);
        } catch (error) {
          setAllUsers([]);
        }
      }
    };
    
    // Также слушаем кастомные события для обновления в рамках одной вкладки
    const handleCustomStorage = (e: CustomEvent) => {
      if (e.detail?.key === 'tutoring_users') {
        try {
          const newUsers = JSON.parse(e.detail.newValue || '[]');
          setAllUsers(newUsers);
          console.log('🔄 Пользователи обновлены через customStorage:', newUsers.length);
        } catch (error) {
          setAllUsers([]);
        }
      }
      
      // Обновляем профили преподавателей
      if (e.detail?.key === 'tutoring_teacherProfiles') {
        try {
          const newProfiles = JSON.parse(e.detail.newValue || '{}');
          setTeacherProfiles(newProfiles);
          console.log('🔄 Профили преподавателей обновлены через customStorage:', Object.keys(newProfiles).length);
        } catch (error) {
          console.error('❌ Ошибка обновления профилей преподавателей:', error);
        }
      }
      
      // Обновляем профили студентов
      if (e.detail?.key === 'tutoring_studentProfiles') {
        try {
          const newProfiles = JSON.parse(e.detail.newValue || '{}');
          setStudentProfiles(newProfiles);
          console.log('🔄 Профили студентов обновлены через customStorage:', Object.keys(newProfiles).length);
        } catch (error) {
          console.error('❌ Ошибка обновления профилей студентов:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('customStorage', handleCustomStorage as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('customStorage', handleCustomStorage as EventListener);
    };
  }, []);

  // Сохранение в localStorage при изменении состояния
  useEffect(() => {
    saveToStorage('tutoring_timeSlots', timeSlots);
    // Принудительно синхронизируем слоты при изменении timeSlots
    if (timeSlots.length > 0) {
      console.log('🔄 timeSlots изменились, принудительно синхронизируем с сервером...');
      forceSyncData().catch(console.error);
    }
  }, [timeSlots, forceSyncData]);

  useEffect(() => {
    saveToStorage('tutoring_lessons', lessons);
  }, [lessons]);

  useEffect(() => {
    saveToStorage('tutoring_chats', chats);
  }, [chats]);

  useEffect(() => {
    saveToStorage('tutoring_posts', posts);
  }, [posts]);

  useEffect(() => {
    saveToStorage('tutoring_notifications', notifications);
  }, [notifications]);

  // Подписка на уведомления при изменении пользователя
  useEffect(() => {
    if (user && socketRef.current && isConnected) {
      socketRef.current.emit('subscribeNotifications', user.id);
      socketRef.current.emit('requestUserNotifications', user.id);
    }
  }, [user, isConnected]);

  const createTimeSlot = (slot: Omit<TimeSlot, 'id'>) => {
    const newSlot: TimeSlot = {
      ...slot,
      id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    
    setTimeSlots(prev => {
      const updated = [...prev, newSlot];
      saveToStorage('tutoring_timeSlots', updated);
      return updated;
    });

    // Отправляем новый слот на сервер для других клиентов
    if (socketRef.current && isConnected) {
      socketRef.current.emit('createSlot', newSlot);
    }
  };

  // Новая функция для создания слота с возвратом Promise
  const createSlot = async (
    slot: Omit<TimeSlot, 'id' | 'isBooked'>,
    studentId?: string,
    studentName?: string,
    options?: { mode?: string }
  ): Promise<TimeSlot> => {
    return new Promise<TimeSlot>((resolve, reject) => {
      // Если режим назначения и не передан studentId/studentName — ошибка
      if (options?.mode === 'assign' && (!studentId || !studentName)) {
        alert('Ошибка: не выбран ученик для назначения урока!');
        reject(new Error('createSlot: assign mode without studentId/studentName'));
        return;
      }
      const isBooked = !!studentId;
      const newSlot: TimeSlot = {
        ...slot,
        id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isBooked,
        ...(isBooked ? { bookedStudentId: studentId } : {}),
      };
      setTimeSlots(prev => {
        const updated = [...prev, newSlot];
        saveToStorage('tutoring_timeSlots', updated);
        console.log('✅ Слот создан и сохранен локально:', newSlot.id);
        return updated;
      });
      
      // ВАЖНО: Гарантируем, что репетитор остается видимым после создания слота
      try {
        const currentUsers = allUsers || [];
        const teacherExists = currentUsers.find((u: any) => u.id === newSlot.teacherId);
        
        if (!teacherExists) {
          console.log('⚠️ Репетитор не найден в allUsers, добавляем...');
          const teacherUser = {
            id: newSlot.teacherId,
            name: newSlot.teacherName,
            avatar: newSlot.teacherAvatar || '',
            role: 'teacher',
            isRegistered: true,
            isOnline: false,
            lastSeen: new Date().toISOString()
          };
          
          const updatedUsers = [...currentUsers, teacherUser];
          setAllUsers(updatedUsers);
          localStorage.setItem('tutoring_users', JSON.stringify(updatedUsers));
          
          // Также добавляем в зарегистрированных преподавателей
          const registeredTeachers = JSON.parse(localStorage.getItem('tutoring_registeredTeachers') || '[]');
          const teacherExistsInRegistered = registeredTeachers.find((t: any) => t.id === newSlot.teacherId);
          if (!teacherExistsInRegistered) {
            const updatedRegisteredTeachers = [...registeredTeachers, teacherUser];
            localStorage.setItem('tutoring_registeredTeachers', JSON.stringify(updatedRegisteredTeachers));
            console.log('✅ Репетитор добавлен в зарегистрированных преподавателей');
          }
          
          console.log('✅ Репетитор добавлен в allUsers для гарантии отображения');
        } else {
          console.log('✅ Репетитор уже существует в allUsers');
        }
      } catch (error) {
        console.error('❌ Ошибка при проверке видимости репетитора:', error);
      }
      
      // Отправляем слот на сервер, если есть соединение
      if (socketRef.current && isConnected) {
        socketRef.current.emit('createSlot', newSlot);
        console.log('📡 Слот отправлен на сервер');
      } else {
        console.log('⚠️ Нет соединения с сервером, слот сохранен локально');
      }
      // Если слот сразу бронируется на ученика, создаём Lesson
      if (isBooked && studentId && studentName) {
        const newLesson: Lesson = {
          id: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          studentId,
          teacherId: newSlot.teacherId,
          studentName,
          teacherName: newSlot.teacherName,
          subject: newSlot.subject,
          date: newSlot.date,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
          duration: newSlot.duration,
          format: newSlot.format,
          status: 'scheduled',
          price: newSlot.price,
          lessonType: newSlot.lessonType,
        };
        setLessons(prev => [...prev, newLesson]);
        getOrCreateChat(studentId, newSlot.teacherId, studentName, newSlot.teacherName);
        // --- СТАТИСТИКА ---
        if (user && user.role === 'teacher') {
          const profile: TeacherProfile = { ...(user.profile as TeacherProfile) };
          if (!profile.students) profile.students = [];
          if (!profile.students.includes(studentId)) profile.students.push(studentId);
          updateProfile(profile);
        }
        // --- КОНЕЦ СТАТИСТИКИ ---
        if (socketRef.current && isConnected) {
          socketRef.current.emit('bookSlot', { slotId: newSlot.id, lesson: newLesson, bookedStudentId: studentId });
        }
      }
      resolve(newSlot);
    });
  };

  // Изменяю функцию bookLesson, чтобы принимать комментарий
  const bookLesson = (slotId: string, studentId: string, studentName: string, comment?: string) => {
    const slot = timeSlots.find(s => s.id === slotId);
    if (!slot || slot.isBooked) {
      return;
    }

    // --- СТАТИСТИКА ---
    if (user && user.role === 'teacher') {
      const profile: TeacherProfile = { ...(user.profile as TeacherProfile) };
      if (!profile.students) profile.students = [];
      if (!profile.students.includes(studentId)) profile.students.push(studentId);
      updateProfile(profile);
    }
    // --- КОНЕЦ СТАТИСТИКИ ---


    // Отмечаем слот как забронированный и сохраняем bookedStudentId
    setTimeSlots(prev => 
      prev.map(s => s.id === slotId ? { ...s, isBooked: true, bookedStudentId: studentId } : s)
    );

    // Создаем урок
    const newLesson: Lesson = {
      id: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      teacherId: slot.teacherId,
      studentName,
      teacherName: slot.teacherName,
      subject: slot.subject,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      format: slot.format,
      status: 'scheduled',
      price: slot.price,
      lessonType: slot.lessonType,
      comment: comment || '',
    };

    setLessons(prev => [...prev, newLesson]);

    // Создаем чат между учеником и преподавателем
    getOrCreateChat(studentId, slot.teacherId, studentName, slot.teacherName);
    

    // Отправляем информацию о бронировании на сервер
    if (socketRef.current && isConnected) {
      socketRef.current.emit('bookSlot', { slotId, lesson: newLesson, bookedStudentId: studentId });
    }
  };

  const cancelLesson = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;


    // Находим соответствующий слот
    const slot = timeSlots.find(s => 
      s.teacherId === lesson.teacherId && 
      s.date === lesson.date && 
      s.startTime === lesson.startTime
    );

    // Удаляем урок
    setLessons(prev => prev.filter(l => l.id !== lessonId));

    // Освобождаем слот и очищаем bookedStudentId
    if (slot) {
      setTimeSlots(prev => 
        prev.map(s => s.id === slot.id ? { ...s, isBooked: false, bookedStudentId: undefined } : s)
      );

      // Отправляем информацию об отмене на сервер
      if (socketRef.current && isConnected) {
        socketRef.current.emit('cancelSlot', { slotId: slot.id, lessonId });
      }
    }
  };

  const rescheduleLesson = (lessonId: string, newDate: string, newStartTime: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;


    // Вычисляем новое время окончания
    const endTime = new Date(`2000-01-01T${newStartTime}`);
    endTime.setMinutes(endTime.getMinutes() + lesson.duration);

    // Обновляем урок
    setLessons(prev => 
      prev.map(l => 
        l.id === lessonId 
          ? { 
              ...l, 
              date: newDate, 
              startTime: newStartTime, 
              endTime: endTime.toTimeString().slice(0, 5) 
            } 
          : l
      )
    );

    // Освобождаем старый слот и очищаем bookedStudentId
    setTimeSlots(prev => 
      prev.map(s => 
        s.teacherId === lesson.teacherId && 
        s.date === lesson.date && 
        s.startTime === lesson.startTime 
          ? { ...s, isBooked: false, bookedStudentId: undefined } 
          : s
      )
    );
  };

  const getFilteredSlots = (filters: FilterOptions): TimeSlot[] => {
    const filtered = timeSlots.filter(slot => {
      // Базовые проверки
      if (slot.isBooked) return false;
      
      // Проверяем, что дата слота не в прошлом
      const slotDate = new Date(slot.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (slotDate < today) return false;
      
      // Фильтр по классу
      if (filters.grade && filters.grade !== '') {
        if (!slot.grades || !slot.grades.includes(filters.grade)) return false;
      }
      
      // Фильтр по предмету
      if (filters.subject && filters.subject !== '') {
        if (slot.subject !== filters.subject) return false;
      }
      
      // Фильтр по опыту
      if (filters.experience && filters.experience !== '') {
        if (slot.experience !== filters.experience) return false;
      }
      
      // Фильтр по типу урока
      if (filters.lessonType && filters.lessonType !== '') {
        if (slot.lessonType !== filters.lessonType) return false;
      }
      
      // Фильтр по длительности
      if (filters.duration && filters.duration > 0) {
        if (slot.duration !== filters.duration) return false;
      }
      
      // Фильтр по формату
      if (filters.format && filters.format !== '') {
        if (slot.format !== filters.format) return false;
      }
      
      // Фильтр по минимальному рейтингу
      if (filters.minRating && filters.minRating > 0) {
        if ((slot.rating || 0) < filters.minRating) return false;
      }
      
      // Фильтр по целям обучения
      if (filters.goals && filters.goals.length > 0) {
        if (!slot.goals || !filters.goals.some(goal => slot.goals!.includes(goal))) return false;
      }
      
      // Фильтр по городу (если есть в слоте)
      if (filters.city && filters.city !== '') {
        // Проверяем город преподавателя через профиль
        const teacher = allUsers.find(u => u.id === slot.teacherId);
        const teacherCity = teacher?.profile?.city || '';
        if (teacherCity && !teacherCity.toLowerCase().includes(filters.city.toLowerCase())) return false;
      }
      
      return true;
    });
    
    return filtered;
  };

  const getOrCreateChat = (participant1Id: string, participant2Id: string, participant1Name: string, participant2Name: string): string => {
    console.log('🔍 getOrCreateChat DEBUG:');
    console.log('- Participant 1:', { id: participant1Id, name: participant1Name });
    console.log('- Participant 2:', { id: participant2Id, name: participant2Name });
    console.log('- Current chats count:', chats.length);
    
    const existingChat = chats.find(chat => 
      chat.participants.includes(participant1Id) && chat.participants.includes(participant2Id)
    );

    if (existingChat) {
      console.log('✅ Found existing chat:', existingChat.id);
      return existingChat.id;
    }

    console.log('🆕 Creating new chat...');
    const newChat: Chat = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants: [participant1Id, participant2Id],
      participantNames: [participant1Name, participant2Name],
      messages: [],
    };

    console.log('📝 New chat created:', newChat.id);

    setChats(prev => {
      const updated = [...prev, newChat];
      saveToStorage('tutoring_chats', updated);
      console.log('💾 Chat saved to localStorage, total chats:', updated.length);
      return updated;
    });

    // Отправляем новый чат на сервер для других клиентов
    if (socketRef.current && isConnected) {
      console.log('📡 Sending chat to server...');
      socketRef.current.emit('createChat', newChat);
      
      // Создаем уведомление для репетитора о новом чате
      const notification = {
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: participant2Id, // ID репетитора
        type: 'new_chat',
        title: 'Новый чат',
        message: `${participant1Name} создал с вами чат`,
        isRead: false,
        timestamp: new Date().toISOString(),
        data: { chatId: newChat.id, studentId: participant1Id, studentName: participant1Name }
      };
      
      socketRef.current.emit('createNotification', notification);
      console.log('📬 Notification sent to server');
    } else {
      console.log('⚠️ Socket not connected, chat not sent to server');
    }

    console.log('🔍 END getOrCreateChat DEBUG');
    return newChat.id;
  };

  const sendMessage = (chatId: string, senderId: string, senderName: string, content: string) => {
    console.log('🔍 sendMessage DEBUG:');
    console.log('- Chat ID:', chatId);
    console.log('- Sender:', { id: senderId, name: senderName });
    console.log('- Content:', content);
    
    // Находим чат и определяем получателя
    const chat = chats.find(c => c.id === chatId);
    if (!chat) {
      console.error('❌ Chat not found:', chatId);
      return;
    }
    
    console.log('✅ Chat found:', { 
      id: chat.id, 
      participants: chat.participants, 
      participantNames: chat.participantNames 
    });
    
    // Определяем получателя (другой участник чата)
    const receiverId = chat.participants.find(id => id !== senderId);
    const receiverName = chat.participantNames.find((name, index) => chat.participants[index] !== senderId);
    
    if (!receiverId) {
      console.error('❌ Receiver not found in chat participants');
      return;
    }
    
    console.log('📬 Receiver:', { id: receiverId, name: receiverName });
    
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      senderName,
      receiverId,
      receiverName: receiverName || 'Неизвестный пользователь',
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    console.log('📝 Message created:', newMessage.id);

    // Добавляем сообщение локально сразу для мгновенного отображения
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updatedChat = {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: newMessage,
        };
        saveToStorage('tutoring_chats', prev.map(c => c.id === chat.id ? updatedChat : c));
        console.log('💾 Message saved locally, total messages in chat:', updatedChat.messages.length);
        return updatedChat;
      }
      return chat;
    }));

    // Отправляем сообщение на сервер для других клиентов
    if (socketRef.current && isConnected) {
      console.log('📡 Sending message to server...');
      socketRef.current.emit('sendMessage', { chatId, message: newMessage });
      console.log('✅ Message sent to server');
    } else {
      console.log('⚠️ Socket not connected, message not sent to server');
    }
    
    console.log('🔍 END sendMessage DEBUG');
  };

  // Новая функция для отправки сообщения любому пользователю с автоматическим созданием чата
  const sendMessageToUser = (senderId: string, senderName: string, receiverId: string, receiverName: string, content: string): string => {
    console.log('🔍 sendMessageToUser DEBUG:');
    console.log('- Sender:', { id: senderId, name: senderName });
    console.log('- Receiver:', { id: receiverId, name: receiverName });
    console.log('- Content:', content);
    
    // Проверяем, что все параметры переданы
    if (!senderId || !senderName || !receiverId || !receiverName || !content) {
      console.error('❌ Missing required parameters for sendMessageToUser');
      return '';
    }
    
    // Создаем или находим чат между пользователями
    const chatId = getOrCreateChat(senderId, receiverId, senderName, receiverName);
    console.log('- Chat ID:', chatId);
    
    if (!chatId) {
      console.error('❌ Failed to create or find chat');
      return '';
    }
    
    // Отправляем сообщение в созданный/найденный чат
    sendMessage(chatId, senderId, senderName, content);
    
    console.log('✅ Message sent successfully to chat:', chatId);
    console.log('🔍 END sendMessageToUser DEBUG');
    return chatId;
  };

  const completeLesson = (lessonId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('lessonCompleted', { lessonId });
    }
  };

  const updateStudentProfile = (studentId: string, profile: StudentProfile) => {
    if (socketRef.current) {
      socketRef.current.emit('updateStudentProfile', { studentId, profile });
    }
    setStudentProfiles(prev => ({ ...prev, [studentId]: profile }));
  };

  const deleteSlot = (slotId: string) => {
    setTimeSlots(prev => {
      // Вместо удаления помечаем слот как неактивный
      const updated = prev.map(slot => 
        slot.id === slotId ? { ...slot, isDeleted: true } : slot
      );
      saveToStorage('tutoring_timeSlots', updated);
      return updated;
    });
    if (socketRef.current && isConnected) {
      socketRef.current.emit('deleteSlot', { slotId });
    }
  };

  const clearAllData = () => {
    
    // Очищаем состояние
    setTimeSlots([]);
    setLessons([]);
    setChats([]);
    
    // Очищаем localStorage, но НЕ удаляем зарегистрированных преподавателей
    localStorage.removeItem('tutoring_timeSlots');
    localStorage.removeItem('tutoring_lessons');
    localStorage.removeItem('tutoring_chats');
    localStorage.removeItem('tutoring_users');
    localStorage.removeItem('tutoring_currentUser');
    
    // НЕ удаляем 'tutoring_registeredTeachers' - они должны остаться для постоянного отображения
    
  };

  // Функция для обновления профиля преподавателя на сервере
  const updateTeacherProfile = (teacherId: string, profile: TeacherProfile) => {
    console.log('🔄 Обновляем профиль преподавателя:', teacherId, profile);
    
    // Сохраняем профиль преподавателя в локальном хранилище
    setTeacherProfiles(prev => {
      const updated = { ...prev, [teacherId]: profile };
      saveToStorage('tutoring_teacherProfiles', updated);
      console.log('✅ Профиль преподавателя сохранен в teacherProfiles');
      return updated;
    });

    if (socketRef.current && isConnected) {
      socketRef.current.emit('updateTeacherProfile', { teacherId, profile });
      console.log('📡 Профиль преподавателя отправлен на сервер');
    }
    
    // --- Синхронизация профиля в общем списке пользователей ---
    try {
      const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
      const updatedUsers = users.map((u: any) =>
        u.id === teacherId ? { ...u, profile, avatar: profile.avatar } : u
      );
      localStorage.setItem('tutoring_users', JSON.stringify(updatedUsers));
      console.log('✅ Профиль преподавателя обновлен в tutoring_users');
      
      // ВАЖНО: Обновляем allUsers в состоянии, чтобы репетитор остался видимым
      setAllUsers(prev => {
        const updated = prev.map((u: any) =>
          u.id === teacherId ? { ...u, profile, avatar: profile.avatar } : u
        );
        console.log('✅ allUsers обновлен, репетитор остался видимым');
        return updated;
      });
      
      // Также обновляем зарегистрированных преподавателей
      const registeredTeachers = JSON.parse(localStorage.getItem('tutoring_registeredTeachers') || '[]');
      const updatedRegisteredTeachers = registeredTeachers.map((t: any) =>
        t.id === teacherId ? { ...t, profile, avatar: profile.avatar } : t
      );
      localStorage.setItem('tutoring_registeredTeachers', JSON.stringify(updatedRegisteredTeachers));
      console.log('✅ Зарегистрированные преподаватели обновлены');
      
    } catch (e) {
      console.error('❌ Ошибка обновления списка пользователей:', e);
    }
  };

  // Функции для работы с записями
  const createPost = (postData: { text: string; media: File[]; type: 'text' | 'image' | 'video' }) => {
    if (!user) return;


    // Извлекаем теги из текста
    const extractTags = (text: string) => {
      if (!text) return [];
      const hashtagRegex = /#[\wа-яё]+/gi;
      const matches = text.match(hashtagRegex);
      return matches ? [...new Set(matches.map(tag => tag.toLowerCase()))] : [];
    };

    // Создаем URL для медиафайлов
    const mediaUrls = postData.media.map(file => {
      const url = URL.createObjectURL(file);
      return url;
    });

    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: postData.text,
      media: mediaUrls,
      type: postData.type,
      date: new Date().toISOString(),
      reactions: [],
      comments: [],
      isBookmarked: false,
      tags: extractTags(postData.text),
      likes: 0,
      views: 0,
      bookmarks: []
    };


    setPosts(prev => {
      const updated = [newPost, ...prev];
      saveToStorage('tutoring_posts', updated);
      return updated;
    });

    if (socketRef.current && isConnected) {
      socketRef.current.emit('createPost', newPost);
    }
  };

  const addReaction = (postId: string, reactionType: string) => {
    if (!user) return;

    setPosts(prev => {
      const updated = prev.map(post => {
        if (post.id === postId) {
          // Проверяем, есть ли уже реакция от этого пользователя
          const existingReaction = post.reactions.find(r => r.userId === user.id);
          
          let newReactions = [...post.reactions];
          let newLikes = post.likes || 0;
          
          if (existingReaction) {
            if (existingReaction.type === reactionType) {
              // Убираем реакцию
              newReactions = post.reactions.filter(r => r.userId !== user.id);
              newLikes = Math.max(0, newLikes - 1);
            } else {
              // Меняем тип реакции
              existingReaction.type = reactionType as 'like' | 'love' | 'smile' | 'thumbsup';
            }
          } else {
            // Добавляем новую реакцию
            newReactions.push({
              id: `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userId: user.id,
              type: reactionType as 'like' | 'love' | 'smile' | 'thumbsup',
              date: new Date().toISOString()
            });
            newLikes++;
          }

          return { ...post, reactions: newReactions, likes: newLikes };
        }
        return post;
      });

      saveToStorage('tutoring_posts', updated);
      return updated;
    });

    if (socketRef.current && isConnected) {
      socketRef.current.emit('addReaction', { postId, reactionType, userId: user.id });
    }
  };

  const addComment = (postId: string, commentText: string) => {
    if (!user) return;

    const newComment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: commentText,
      date: new Date().toISOString()
    };

    setPosts(prev => {
      const updated = prev.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      );
      saveToStorage('tutoring_posts', updated);
      return updated;
    });

    if (socketRef.current && isConnected) {
      socketRef.current.emit('addComment', { postId, comment: newComment });
    }
  };

  const sharePost = (postId: string) => {
    // В реальном приложении здесь была бы логика шаринга
  };

  const bookmarkPost = (postId: string) => {
    if (!user) return;

    setPosts(prev => {
      const updated = prev.map(post => {
        if (post.id === postId) {
          const bookmarks = post.bookmarks || [];
          const bookmarkIndex = bookmarks.indexOf(user.id);
          
          let newBookmarks = [...bookmarks];
          if (bookmarkIndex === -1) {
            newBookmarks.push(user.id);
          } else {
            newBookmarks.splice(bookmarkIndex, 1);
          }
          
          return { ...post, bookmarks: newBookmarks };
        }
        return post;
      });
      saveToStorage('tutoring_posts', updated);
      return updated;
    });

    if (socketRef.current && isConnected) {
      socketRef.current.emit('bookmarkPost', { postId, userId: user.id });
    }
  };

  const editPost = (postId: string, newText: string) => {
    // Извлекаем теги из текста
    const extractTags = (text: string) => {
      if (!text) return [];
      const hashtagRegex = /#[\wа-яё]+/gi;
      const matches = text.match(hashtagRegex);
      return matches ? [...new Set(matches.map(tag => tag.toLowerCase()))] : [];
    };

    setPosts(prev => {
      const updated = prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              text: newText, 
              tags: extractTags(newText),
              editedAt: new Date().toISOString()
            }
          : post
      );
      saveToStorage('tutoring_posts', updated);
      return updated;
    });

    if (socketRef.current && isConnected) {
      socketRef.current.emit('editPost', { postId, newText });
    }
  };

  const deletePost = (postId: string) => {
    setPosts(prev => {
      const updated = prev.filter(post => post.id !== postId);
      saveToStorage('tutoring_posts', updated);
      return updated;
    });

    if (socketRef.current && isConnected) {
      socketRef.current.emit('deletePost', { postId });
    }
  };

  // Функции для управления чатами
  const deleteChat = (chatId: string) => {
    console.log('deleteChat called with chatId:', chatId);
    console.log('Current chats count:', chats.length);
    
    setChats(prev => {
      const chatToDelete = prev.find(chat => chat.id === chatId);
      if (!chatToDelete) {
        console.warn('Chat not found for deletion:', chatId);
        return prev;
      }
      
      const updated = prev.filter(chat => chat.id !== chatId);
      console.log(`Chat ${chatId} removed. New count: ${updated.length}`);
      saveToStorage('tutoring_chats', updated);
      return updated;
    });

    if (socketRef.current && isConnected) {
      console.log('Sending deleteChat event to server');
      socketRef.current.emit('deleteChat', { chatId });
    } else {
      console.warn('Socket not connected, chat deletion not synced to server');
    }
  };

  const markChatAsRead = (chatId: string) => {
    setChats(prev => {
      const updated = prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: chat.messages.map(msg => ({ ...msg, isRead: true })) }
          : chat
      );
      saveToStorage('tutoring_chats', updated);
      return updated;
    });

    if (socketRef.current && isConnected) {
      socketRef.current.emit('markChatAsRead', { chatId });
    }
  };

  const clearChatMessages = (chatId: string) => {
    setChats(prev => {
      const updated = prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: [] }
          : chat
      );
      saveToStorage('tutoring_chats', updated);
      return updated;
    });

    if (socketRef.current && isConnected) {
      socketRef.current.emit('clearChatMessages', { chatId });
    }
  };

  const archiveChat = (chatId: string) => {
    setChats(prev => {
      const updated = prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, archived: true }
          : chat
      );
      saveToStorage('tutoring_chats', updated);
      return updated;
    });

    if (socketRef.current && isConnected) {
      socketRef.current.emit('archiveChat', { chatId });
    }
  };

  const unarchiveChat = (chatId: string) => {
    setChats(prev => {
      const updated = prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, archived: false }
          : chat
      );
      saveToStorage('tutoring_chats', updated);
      return updated;
    });

    if (socketRef.current && isConnected) {
      socketRef.current.emit('unarchiveChat', { chatId });
    }
  };

  const loadChatsFromServer = async () => {
    try {
      console.log('🔄 Loading chats from server:', `${SERVER_URL}/api/sync`);
      const response = await fetch(`${SERVER_URL}/api/sync`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.chats) {
            console.log('✅ Loaded chats from server:', data.chats.length);
            setChats(data.chats);
            saveToStorage('tutoring_chats', data.chats);
          }
        } else {
          console.warn('⚠️ Server returned non-JSON response, using local chats');
        }
      } else {
        console.error('❌ Failed to load chats from server:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('⚠️ Error loading chats from server, using local chats:', error);
    }
  };

  // Функция для удаления всех данных пользователя
  const deleteUserData = (userId: string) => {
    console.log('🗑️ Удаляем все данные пользователя:', userId);
    
    // Удаляем слоты преподавателя
    setTimeSlots(prev => {
      const updated = prev.filter(slot => slot.teacherId !== userId);
      saveToStorage('tutoring_timeSlots', updated);
      return updated;
    });

    // Удаляем уроки пользователя
    setLessons(prev => {
      const updated = prev.filter(lesson => 
        lesson.teacherId !== userId && lesson.studentId !== userId
      );
      saveToStorage('tutoring_lessons', updated);
      return updated;
    });

    // Удаляем чаты пользователя
    setChats(prev => {
      const updated = prev.filter(chat => 
        !chat.participants.includes(userId)
      );
      saveToStorage('tutoring_chats', updated);
      return updated;
    });

    // Удаляем посты пользователя
    setPosts(prev => {
      const updated = prev.filter(post => post.userId !== userId);
      saveToStorage('tutoring_posts', updated);
      return updated;
    });

    // Удаляем уведомления пользователя
    setNotifications(prev => {
      const updated = prev.filter(notification => notification.userId !== userId);
      saveToStorage('tutoring_notifications', updated);
      return updated;
    });

    // Удаляем профили пользователя
    if (user?.role === 'teacher') {
      setTeacherProfiles(prev => {
        const updated = { ...prev };
        delete updated[userId];
        saveToStorage('tutoring_teacherProfiles', updated);
        return updated;
      });
    } else if (user?.role === 'student') {
      setStudentProfiles(prev => {
        const updated = { ...prev };
        delete updated[userId];
        saveToStorage('tutoring_studentProfiles', updated);
        return updated;
      });
    }

    // Удаляем пользователя из общего списка
    setAllUsers(prev => {
      const updated = prev.filter(u => u.id !== userId);
      saveToStorage('tutoring_users', updated);
      return updated;
    });

    console.log('✅ Все данные пользователя удалены');
  };

  return (
    <DataContext.Provider
      value={{
        timeSlots,
        lessons,
        chats,
        posts,
        createTimeSlot,
        bookLesson,
        cancelLesson,
        rescheduleLesson,
        getFilteredSlots,
        sendMessage,
        sendMessageToUser,
        getOrCreateChat,
        clearAllData,
        isConnected,
        completeLesson,
        studentProfiles,
        updateStudentProfile,
        deleteSlot,
        createSlot, // теперь поддерживает 4 параметра
        allUsers,
        setAllUsers: (users: User[]) => {
          setAllUsers(users);
          localStorage.setItem('tutoring_users', JSON.stringify(users));
          
          // Также сохраняем зарегистрированных преподавателей в отдельном ключе
          const teachers = users.filter((u: any) => u.role === 'teacher');
          if (teachers.length > 0) {
            const registeredTeachers = teachers.map(teacher => ({
              ...teacher,
              isRegistered: true,
              isOnline: false, // Всегда показываем как зарегистрированных, независимо от онлайн статуса
              lastSeen: new Date().toISOString()
            }));
            localStorage.setItem('tutoring_registeredTeachers', JSON.stringify(registeredTeachers));
          }
        },
        refreshUsers, // Добавляем функцию для обновления пользователей
        loadRegisteredTeachers, // Функция для загрузки зарегистрированных преподавателей (независимо от онлайн статуса)
        refreshAllData, // Функция для принудительного обновления всех данных
        forceSyncData, // Добавлено
        uploadLocalDataToServer, // Функция для загрузки локальных данных на сервер
        deleteUser, // Функция для удаления пользователя
        teacherProfiles,
        updateTeacherProfile, // добавлено
        socketRef,
        loadInitialData, // добавлено
        // Функции для работы с записями
        createPost,
        addReaction,
        addComment,
        sharePost,
        bookmarkPost,
        editPost,
        deletePost,
        // Новые функции для постов
        searchPosts: (filters: SearchFilters) => {
          if (socketRef.current && isConnected) {
            socketRef.current.emit('searchPosts', filters);
          }
        },
        getPostsByUser: (userId: string) => {
          return posts.filter(post => post.userId === userId);
        },
        getBookmarkedPosts: (userId: string) => {
          return posts.filter(post => post.bookmarks?.includes(userId));
        },
        // Функции для уведомлений
        notifications,
        subscribeToNotifications: (userId: string) => {
          if (socketRef.current && isConnected) {
            socketRef.current.emit('subscribeNotifications', userId);
          }
        },
        unsubscribeFromNotifications: (userId: string) => {
          if (socketRef.current && isConnected) {
            socketRef.current.emit('unsubscribeNotifications', userId);
          }
        },
        markNotificationAsRead: (notificationId: string) => {
          setNotifications(prev => {
            const updated = prev.map(n => 
              n.id === notificationId 
                ? { ...n, isRead: true, readAt: new Date().toISOString() }
                : n
            );
            saveToStorage('tutoring_notifications', updated);
            return updated;
          });
          
          if (socketRef.current && isConnected) {
            socketRef.current.emit('markNotificationAsRead', notificationId);
          }
        },
        markAllNotificationsAsRead: (userId: string) => {
          setNotifications(prev => {
            const updated = prev.map(n => 
              n.userId === userId 
                ? { ...n, isRead: true, readAt: new Date().toISOString() }
                : n
            );
            saveToStorage('tutoring_notifications', updated);
            return updated;
          });
          
          if (socketRef.current && isConnected) {
            socketRef.current.emit('markAllNotificationsAsRead', userId);
          }
        },
        deleteNotification: (notificationId: string) => {
          setNotifications(prev => {
            const updated = prev.filter(n => n.id !== notificationId);
            saveToStorage('tutoring_notifications', updated);
            return updated;
          });
        },
        // Функции для управления чатами
        deleteChat,
        markChatAsRead,
        clearChatMessages,
        archiveChat,
        unarchiveChat,
        loadChatsFromServer,
        deleteUserData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};