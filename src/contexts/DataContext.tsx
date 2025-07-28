import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { TimeSlot, Lesson, Chat, FilterOptions, User } from '../types';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type { TeacherProfile } from '../types';

// Типизация контекста (можно расширить по необходимости)
interface DataContextType {
  timeSlots: any[];
  lessons: any[];
  chats: any[];
  createTimeSlot: (slot: any) => void;
  bookLesson: (slotId: string, studentId: string, studentName: string) => void;
  cancelLesson: (lessonId: string) => void;
  rescheduleLesson: (...args: any[]) => void;
  getFilteredSlots: (filters: any) => any[];
  sendMessage: (...args: any[]) => void;
  getOrCreateChat: (...args: any[]) => any;
  clearAllData: () => void;
  isConnected: boolean;
  completeLesson: (lessonId: string) => void;
  studentProfiles: Record<string, any>;
  updateStudentProfile: (studentId: string, profile: any) => void;
  deleteSlot: (slotId: string) => void;
  createSlot: (slot: Omit<TimeSlot, 'id' | 'isBooked'>, studentId?: string, studentName?: string, options?: { mode?: string }) => Promise<TimeSlot>;
  allUsers: User[];
  updateTeacherProfile: (teacherId: string, profile: any) => void;
  socketRef: React.MutableRefObject<Socket | null>;
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
    console.error(`Error loading ${key} from localStorage:`, e);
  }
  return defaultValue;
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Saved ${key} to localStorage:`, data.length, 'items');
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // WebSocket состояние
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Инициализация состояния с пустыми массивами - только реальные данные пользователей
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => {
    return loadFromStorage('tutoring_timeSlots', []);
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    return loadFromStorage('tutoring_lessons', []);
  });

  const [chats, setChats] = useState<Chat[]>(() => {
    return loadFromStorage('tutoring_chats', []);
  });

  const [studentProfiles, setStudentProfiles] = useState<Record<string, any>>({});

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('tutoring_users') || '[]');
    } catch {
      return [];
    }
  });

  const { user, updateProfile } = useAuth();

  // Инициализация WebSocket соединения
  useEffect(() => {
    // Динамически определяем адрес сервера
    let WS_URL;
    
    // Проверяем переменную окружения
    if (import.meta.env.VITE_WS_URL) {
      WS_URL = import.meta.env.VITE_WS_URL;
    }
    // В продакшене используем тот же домен
    else if (import.meta.env.PROD) {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      WS_URL = `${protocol}//${hostname}`;
    } else {
      // Локальная разработка
      const WS_HOST = window.location.hostname;
      WS_URL = `http://${WS_HOST}:3000`;
    }
    
    console.log('Connecting to WebSocket:', WS_URL);
    
    const newSocket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      // Добавляем дополнительные опции для Render
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    // Добавляем обработку ошибок подключения
    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      
      // Fallback: загружаем данные из localStorage
      const cachedTimeSlots = loadFromStorage('tutoring_timeSlots', []);
      const cachedLessons = loadFromStorage('tutoring_lessons', []);
      const cachedChats = loadFromStorage('tutoring_chats', []);
      
      if (cachedTimeSlots.length > 0) {
        setTimeSlots(cachedTimeSlots);
        console.log('Loaded cached timeSlots:', cachedTimeSlots.length);
      }
      if (cachedLessons.length > 0) {
        setLessons(cachedLessons);
        console.log('Loaded cached lessons:', cachedLessons.length);
      }
      if (cachedChats.length > 0) {
        setChats(cachedChats);
        console.log('Loaded cached chats:', cachedChats.length);
      }
    });

    // Получаем все актуальные данные при подключении
    newSocket.on('initialData', (data: { timeSlots: TimeSlot[]; lessons: Lesson[]; chats: Chat[] }) => {
      console.log('Received initialData from server:', data);
      setTimeSlots(data.timeSlots);
      setLessons(data.lessons);
      saveToStorage('tutoring_timeSlots', data.timeSlots);
      saveToStorage('tutoring_lessons', data.lessons);
      if (data.chats) {
        setChats(data.chats);
        saveToStorage('tutoring_chats', data.chats);
      }
    });

    // Слушаем обновления слотов от других клиентов
    newSocket.on('slotCreated', (newSlot: TimeSlot) => {
      console.log('DEBUG: slotCreated received on client:', newSlot);
      setTimeSlots(prev => {
        const exists = prev.find(slot => slot.id === newSlot.id);
        if (!exists) {
          const updated = [...prev, newSlot];
          saveToStorage('tutoring_timeSlots', updated);
          return updated;
        }
        return prev;
      });
    });

    // Слушаем обновления бронирования
    newSocket.on('slotBooked', (data: { slotId: string; lesson: Lesson; bookedStudentId?: string }) => {
      console.log('Received slot booking from server:', data);
      setTimeSlots(prev => 
        prev.map(slot => 
          slot.id === data.slotId ? { ...slot, isBooked: true, bookedStudentId: data.bookedStudentId || data.lesson.studentId } : slot
        )
      );
      setLessons(prev => {
        const exists = prev.find(lesson => lesson.id === data.lesson.id);
        if (!exists) {
          const updated = [...prev, data.lesson];
          saveToStorage('tutoring_lessons', updated);
          return updated;
        }
        return prev;
      });
    });

    // Слушаем отмены бронирования
    newSocket.on('slotCancelled', (data: { slotId: string; lessonId: string }) => {
      console.log('Received slot cancellation from server:', data);
      setTimeSlots(prev => 
        prev.map(slot => 
          slot.id === data.slotId ? { ...slot, isBooked: false, bookedStudentId: undefined } : slot
        )
      );
      setLessons(prev => prev.filter(lesson => lesson.id !== data.lessonId));
    });

    // Слушаем новые чаты
    newSocket.on('chatCreated', (newChat: Chat) => {
      console.log('Received new chat from server:', newChat);
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
      console.log('Received message from server:', data);
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

    // Слушаем удаление слота
    newSocket.on('slotDeleted', (data: { slotId: string }) => {
      setTimeSlots(prev => {
        const updated = prev.filter(slot => slot.id !== data.slotId);
        saveToStorage('tutoring_timeSlots', updated);
        return updated;
      });
    });

    // Добавляем обработку события завершения урока
    if (socketRef.current) {
      socketRef.current.on('lessonCompleted', (data: { lesson: any }) => {
        console.log('Received lessonCompleted from server (raw):', data.lesson);
        setLessons(prev => {
          const updated = prev.map(l => l.id === data.lesson.id ? data.lesson : l);
          console.log('Updated lessons after lessonCompleted:', updated);
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

    newSocket.on('studentProfiles', (profiles: Record<string, any>) => {
      setStudentProfiles(profiles || {});
    });
    newSocket.on('studentProfileUpdated', (data: { studentId: string; profile: any }) => {
      console.log('Получено обновление профиля:', data);
      setStudentProfiles(prev => ({ ...prev, [data.studentId]: data.profile }));
    });

    // --- Синхронизация профиля преподавателя между устройствами ---
    newSocket.on('teacherProfileUpdated', (data: { teacherId: string; profile: any }) => {
      try {
        const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
        const updatedUsers = users.map((u: any) =>
          u.id === data.teacherId ? { ...u, profile: data.profile, avatar: data.profile.avatar } : u
        );
        localStorage.setItem('tutoring_users', JSON.stringify(updatedUsers));
        setAllUsers(updatedUsers);
        console.log('[SOCKET] teacherProfileUpdated: updated tutoring_users in localStorage and allUsers');
      } catch (e) {
        console.error('[SOCKET] teacherProfileUpdated: failed to update tutoring_users:', e);
      }
    });

    // --- Универсальная синхронизация профиля между устройствами ---
    newSocket.on('profileUpdated', (data: { type: string; userId: string; profile: any }) => {
      try {
        const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
        let found = false;
        const updatedUsers = users.map((u: any) => {
          if (u.id === data.userId) {
            found = true;
            return { ...u, profile: data.profile, avatar: data.profile.avatar, name: data.profile.name || u.name, email: data.profile.email || u.email };
          }
          return u;
        });
        if (!found) {
          // Добавляем нового пользователя, если его не было
          updatedUsers.push({
            id: data.userId,
            role: data.type,
            profile: data.profile,
            avatar: data.profile.avatar,
            name: data.profile.name || '',
            email: data.profile.email || ''
          });
        }
        localStorage.setItem('tutoring_users', JSON.stringify(updatedUsers));
        setAllUsers(updatedUsers);
        console.log('[SOCKET] profileUpdated:', data.type, data.userId, data.profile);
      } catch (e) {
        console.warn('[SOCKET] profileUpdated error:', e);
      }
    });

    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    // Слушаем обновления пользователей (например, при изменении профиля)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'tutoring_users') {
        try {
          setAllUsers(JSON.parse(e.newValue || '[]'));
        } catch {
          setAllUsers([]);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Сохранение в localStorage при изменении состояния
  useEffect(() => {
    saveToStorage('tutoring_timeSlots', timeSlots);
    console.log('DEBUG: timeSlots changed:', timeSlots);
  }, [timeSlots]);

  useEffect(() => {
    saveToStorage('tutoring_lessons', lessons);
  }, [lessons]);

  useEffect(() => {
    saveToStorage('tutoring_chats', chats);
  }, [chats]);

  const createTimeSlot = (slot: Omit<TimeSlot, 'id'>) => {
    console.log('DEBUG: createTimeSlot called, isConnected:', isConnected, 'socketRef:', !!socketRef.current);
    const newSlot: TimeSlot = {
      ...slot,
      id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    console.log('Creating new slot:', newSlot);
    
    setTimeSlots(prev => {
      const updated = [...prev, newSlot];
      console.log('Updated timeSlots count:', updated.length);
      saveToStorage('tutoring_timeSlots', updated);
      return updated;
    });

    // Отправляем новый слот на сервер для других клиентов
    if (socketRef.current && isConnected) {
      socketRef.current.emit('createSlot', newSlot);
      console.log('Sent new slot to server for real-time updates');
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
        console.error('ERROR: createSlot called in assign mode without studentId/studentName!', { slot, studentId, studentName, options });
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
      console.log('DEBUG: createSlot - newSlot:', newSlot);
      setTimeSlots(prev => {
        const updated = [...prev, newSlot];
        saveToStorage('tutoring_timeSlots', updated);
        return updated;
      });
      if (socketRef.current && isConnected) {
        socketRef.current.emit('createSlot', newSlot);
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
      console.log('Slot not found or already booked:', slotId);
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

    console.log('Booking lesson for slot:', slot);

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
    
    console.log('Lesson booked successfully:', newLesson);

    // Отправляем информацию о бронировании на сервер
    if (socketRef.current && isConnected) {
      socketRef.current.emit('bookSlot', { slotId, lesson: newLesson, bookedStudentId: studentId });
      console.log('Sent booking info to server for real-time updates');
    }
  };

  const cancelLesson = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    console.log('Cancelling lesson:', lesson);

    // Находим соответствующий слот
    const slot = timeSlots.find(s => 
      s.teacherId === lesson.teacherId && 
      s.date === lesson.date && 
      s.startTime === lesson.startTime
    );

    // Удаляем урок
    setLessons(prev => prev.filter(l => l.id !== lessonId));

    // Освобождаем слот
    if (slot) {
      setTimeSlots(prev => 
        prev.map(s => s.id === slot.id ? { ...s, isBooked: false } : s)
      );

      // Отправляем информацию об отмене на сервер
      if (socketRef.current && isConnected) {
        socketRef.current.emit('cancelSlot', { slotId: slot.id, lessonId });
        console.log('Sent cancellation info to server for real-time updates');
      }
    }
  };

  const rescheduleLesson = (lessonId: string, newDate: string, newStartTime: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    console.log('Rescheduling lesson:', lesson, 'to', newDate, newStartTime);

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

    // Освобождаем старый слот
    setTimeSlots(prev => 
      prev.map(s => 
        s.teacherId === lesson.teacherId && 
        s.date === lesson.date && 
        s.startTime === lesson.startTime 
          ? { ...s, isBooked: false } 
          : s
      )
    );
  };

  const getFilteredSlots = (filters: FilterOptions): TimeSlot[] => {
    console.log('getFilteredSlots called with filters:', filters);
    console.log('Total timeSlots available:', timeSlots.length);
    console.log('All timeSlots:', timeSlots.map(slot => ({
      id: slot.id,
      subject: slot.subject,
      teacherName: slot.teacherName,
      date: slot.date,
      startTime: slot.startTime,
      isBooked: slot.isBooked
    })));
    
    const filtered = timeSlots.filter(slot => {
      console.log(`Checking slot ${slot.id}: isBooked=${slot.isBooked}`);
      if (slot.isBooked) return false;
      if (filters.grade && !slot.grades.includes(filters.grade)) return false;
      if (filters.subject && slot.subject !== filters.subject) return false;
      if (filters.experience && slot.experience !== filters.experience) return false;
      if (filters.lessonType && slot.lessonType !== filters.lessonType) return false;
      if (filters.duration && slot.duration !== filters.duration) return false;
      if (filters.format && slot.format !== filters.format) return false;
      if (filters.minRating && (slot.rating || 0) < filters.minRating) return false;
      return true;
    });
    
    console.log('Filtered result:', filtered.length, 'slots:', filtered.map(slot => ({
      id: slot.id,
      subject: slot.subject,
      teacherName: slot.teacherName,
      date: slot.date,
      startTime: slot.startTime
    })));
    return filtered;
  };

  const getOrCreateChat = (participant1Id: string, participant2Id: string, participant1Name: string, participant2Name: string): string => {
    const existingChat = chats.find(chat => 
      chat.participants.includes(participant1Id) && chat.participants.includes(participant2Id)
    );

    if (existingChat) {
      return existingChat.id;
    }

    const newChat: Chat = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants: [participant1Id, participant2Id],
      participantNames: [participant1Name, participant2Name],
      messages: [],
    };

    setChats(prev => {
      const updated = [...prev, newChat];
      saveToStorage('tutoring_chats', updated);
      return updated;
    });

    // Отправляем новый чат на сервер для других клиентов
    if (socketRef.current && isConnected) {
      socketRef.current.emit('createChat', newChat);
      console.log('Sent new chat to server for real-time updates');
    }

    return newChat.id;
  };

  const sendMessage = (chatId: string, senderId: string, senderName: string, content: string) => {
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      senderName,
      receiverId: '', // Will be set based on chat participants
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    // Не добавляем сообщение локально, ждем receiveMessage от сервера

    // Отправляем сообщение на сервер для других клиентов
    if (socketRef.current && isConnected) {
      socketRef.current.emit('sendMessage', { chatId, message: newMessage });
      console.log('Sent message to server for real-time updates');
    }
  };

  const completeLesson = (lessonId: string) => {
    console.log('Вызвана completeLesson для урока', lessonId, 'isConnected:', isConnected, 'socketRef:', !!socketRef.current);
    if (socketRef.current && isConnected) {
      socketRef.current.emit('lessonCompleted', { lessonId });
      console.log('Sent lessonCompleted to server', lessonId);
    }
  };

  const updateStudentProfile = (studentId: string, profile: any) => {
    if (socketRef.current) {
      socketRef.current.emit('updateStudentProfile', { studentId, profile });
    }
    setStudentProfiles(prev => ({ ...prev, [studentId]: profile }));
  };

  const deleteSlot = (slotId: string) => {
    setTimeSlots(prev => {
      const updated = prev.filter(slot => slot.id !== slotId);
      saveToStorage('tutoring_timeSlots', updated);
      return updated;
    });
    if (socketRef.current && isConnected) {
      socketRef.current.emit('deleteSlot', { slotId });
      console.log('Sent deleteSlot to server for real-time updates');
    }
  };

  const clearAllData = () => {
    console.log('Clearing all data from system...');
    
    // Очищаем состояние
    setTimeSlots([]);
    setLessons([]);
    setChats([]);
    
    // Очищаем localStorage
    localStorage.removeItem('tutoring_timeSlots');
    localStorage.removeItem('tutoring_lessons');
    localStorage.removeItem('tutoring_chats');
    localStorage.removeItem('tutoring_users');
    localStorage.removeItem('tutoring_currentUser');
    
    console.log('All data cleared successfully');
  };

  // Функция для обновления профиля преподавателя на сервере
  const updateTeacherProfile = (teacherId: string, profile: any) => {
    console.log('[updateTeacherProfile] called:', { teacherId, profile, isConnected, socket: !!socketRef.current });
    if (socketRef.current && isConnected) {
      socketRef.current.emit('updateTeacherProfile', { teacherId, profile });
    }
    // --- Синхронизация профиля в общем списке пользователей ---
    try {
      const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
      const updatedUsers = users.map((u: any) =>
        u.id === teacherId ? { ...u, profile, avatar: profile.avatar } : u
      );
      localStorage.setItem('tutoring_users', JSON.stringify(updatedUsers));
      console.log('[updateTeacherProfile] updated tutoring_users in localStorage');
    } catch (e) {
      console.error('[updateTeacherProfile] failed to update tutoring_users:', e);
    }
  };

  return (
    <DataContext.Provider
      value={{
        timeSlots,
        lessons,
        chats,
        createTimeSlot,
        bookLesson,
        cancelLesson,
        rescheduleLesson,
        getFilteredSlots,
        sendMessage,
        getOrCreateChat,
        clearAllData,
        isConnected,
        completeLesson,
        studentProfiles,
        updateStudentProfile,
        deleteSlot,
        createSlot, // теперь поддерживает 4 параметра
        allUsers,
        updateTeacherProfile, // добавлено
        socketRef,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};