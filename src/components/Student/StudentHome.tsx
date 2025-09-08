import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, BookOpen, RefreshCw, Wifi, Heart, Calendar as CalendarIcon, Share2, MessageCircle, X } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { FilterOptions, TimeSlot, User } from '../../types';
import { io, Socket } from 'socket.io-client';
import { SERVER_URL, WEBSOCKET_URL } from '../../config';
import TeacherProfilePage from './TeacherProfilePage';
import TeacherProfileModal from './TeacherProfileModal';
import StudentCalendar from './StudentCalendar';
import BookingModal from '../Shared/BookingModal';
import EmptyState from '../Shared/EmptyState';
import { User as UserIcon } from 'lucide-react';

interface StudentHomeProps {
  setActiveTab: (tab: string) => void;
}

const StudentHome: React.FC<StudentHomeProps> = ({ setActiveTab }) => {
  const { bookLesson, timeSlots, allUsers, refreshUsers, refreshAllData, forceSyncData, sendMessageToUser, teacherProfiles } = useData();
  const { user } = useAuth();
  
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  // const [filteredSlots, setFilteredSlots] = useState<TimeSlot[]>([]); // Убрано, так как теперь показываем всех репетиторов
  const [loading, setLoading] = useState(false);
  const [showOverbookingModal, setShowOverbookingModal] = useState(false);
  const [overbookingData, setOverbookingData] = useState({
    grade: '',
    subject: '',
    goals: [] as string[],
    experience: '',
    duration: 60,
    format: 'online',
    city: '',
    date: '',
    startTime: '',
    comment: '',
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBookingSlot, setSelectedBookingSlot] = useState<TimeSlot | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTeacherCalendarModal, setShowTeacherCalendarModal] = useState(false);
  const [selectedTeacherForCalendar, setSelectedTeacherForCalendar] = useState<any>(null);

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });

  // Новые состояния для календаря в фильтрах
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{ start: string; end: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const subjects = ['Математика', 'Русский язык', 'Английский язык'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'Студент', 'Взрослый'];
  const goals = ['подготовка к экзаменам', 'помощь с домашним заданием', 'углубленное изучение', 'разговорная практика'];
  const experiences = ['beginner', 'experienced', 'professional'];
  const formats = ['online', 'offline', 'mini-group'];
  const durations = [45, 60];
  const locales = { 'ru': ru };
  const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

  const [serverTeachers, setServerTeachers] = useState<User[]>([]);

  // Функция для загрузки преподавателей
  const loadTeachers = async () => {
    try {
      console.log('🔄 Загружаем всех преподавателей...');
      console.log('🌐 SERVER_URL:', SERVER_URL);
      
      // Принудительно синхронизируем данные с сервером
      console.log('🔄 Синхронизируем данные с сервера...');
      await forceSyncData();
      
      // Загружаем всех пользователей через API /api/users (основной источник)
      console.log('📡 Запрашиваем пользователей с сервера...');
      const usersResponse = await fetch(`${SERVER_URL}/api/users`);
      console.log('📡 Ответ сервера:', usersResponse.status, usersResponse.statusText);
      
      if (usersResponse.ok) {
        const contentType = usersResponse.headers.get('content-type');
        console.log('📡 Content-Type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          const usersData = await usersResponse.json();
          console.log('✅ Все пользователи загружены с сервера:', usersData.length, usersData);
          
          // Фильтруем только преподавателей
          const teachers = usersData.filter((user: any) => user.role === 'teacher');
          console.log('✅ Преподаватели найдены:', teachers.length, teachers);
          
          // Обновляем состояние серверных преподавателей
          setServerTeachers(teachers);
          
          // Обновляем allUsers в контексте
          refreshUsers();
          
          // Принудительно обновляем данные в контексте
          refreshAllData();
        } else {
          console.warn('⚠️ Сервер вернул не-JSON ответ для пользователей');
          setServerTeachers([]);
        }
      } else {
        console.warn('⚠️ Не удалось загрузить пользователей с сервера:', usersResponse.status);
        setServerTeachers([]);
      }
      
      // Дополнительно загружаем преподавателей через API /api/teachers
      console.log('📡 Запрашиваем преподавателей через /api/teachers...');
      const teachersResponse = await fetch(`${SERVER_URL}/api/teachers`);
      console.log('📡 Ответ /api/teachers:', teachersResponse.status, teachersResponse.statusText);
      
      if (teachersResponse.ok) {
        const contentType = teachersResponse.headers.get('content-type');
        console.log('📡 Content-Type /api/teachers:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          const teachersData = await teachersResponse.json();
          console.log('✅ Преподаватели загружены через /api/teachers:', teachersData.length, teachersData);
          
          // Объединяем с уже загруженными данными
          setServerTeachers(prev => {
            const combined = [...prev, ...teachersData];
            const unique = combined.filter((teacher, index, self) => 
              index === self.findIndex(t => t.id === teacher.id)
            );
            console.log('✅ Объединенные преподаватели:', unique.length, unique);
            return unique;
          });
        } else {
          console.warn('⚠️ Сервер вернул не-JSON ответ для преподавателей');
        }
      } else {
        console.warn('⚠️ Не удалось загрузить преподавателей через /api/teachers:', teachersResponse.status);
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки преподавателей с сервера:', error);
      setServerTeachers([]);
    }
  };

  // Загружаем преподавателей с сервера при монтировании
  useEffect(() => {
    console.log('🚀 Компонент StudentHome смонтирован, загружаем преподавателей...');
    loadTeachers();
    
    // Также загружаем локальные профили преподавателей
    const localTeacherProfiles = JSON.parse(localStorage.getItem('tutoring_teacherProfiles') || '{}');
    console.log('📱 Локальные профили преподавателей при монтировании:', Object.keys(localTeacherProfiles).length);
    
    // Периодически обновляем список преподавателей, чтобы они всегда отображались
    const interval = setInterval(() => {
      console.log('🔄 Периодическое обновление списка преподавателей (каждые 30 сек)...');
      loadTeachers();
    }, 30000); // Обновляем каждые 30 секунд
    
    return () => clearInterval(interval);
  }, [forceSyncData, refreshUsers]);

  // Debouncing для поискового запроса
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms задержка

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Слушаем изменения в localStorage для обновления списка преподавателей
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tutoring_users' && e.newValue) {
        console.log('🔄 Обнаружены изменения в пользователях, обновляем список преподавателей');
        loadTeachers();
      }
    };

    const handleCustomStorage = (e: CustomEvent) => {
      if (e.detail?.key === 'tutoring_users') {
        console.log('🔄 Обнаружены кастомные изменения в пользователях, обновляем список преподавателей');
        loadTeachers();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customStorage', handleCustomStorage as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customStorage', handleCustomStorage as EventListener);
    };
  }, []);

  // Дополнительный эффект для загрузки при изменении teacherProfiles
  useEffect(() => {
    console.log('📱 teacherProfiles изменились:', Object.keys(teacherProfiles).length);
    if (Object.keys(teacherProfiles).length > 0) {
      console.log('✅ Найдены локальные профили преподавателей:', Object.keys(teacherProfiles));
    }
  }, [teacherProfiles]);


  const socket = React.useRef<Socket | null>(null);
  React.useEffect(() => {
    if (!socket.current) {
      socket.current = io(WEBSOCKET_URL);
      
      // Слушаем создание новых слотов
      socket.current.on('slotCreated', () => {
        // Обновляем доступные слоты при получении нового слота
        setTimeout(() => {
          loadAvailableSlots();
        }, 100);
      });
      
      // Слушаем регистрацию новых пользователей
      socket.current.on('userRegistered', () => {
        // Обновляем данные при регистрации нового пользователя
        setTimeout(() => {
          refreshAllData();
          loadAvailableSlots();
        }, 100);
      });
      
      // Слушаем обновление профиля пользователя
      socket.current.on('profileUpdated', (updatedUser: any) => {
        console.log('Profile updated via WebSocket:', updatedUser);
        // Обновляем данные при изменении профиля
        setTimeout(() => {
          refreshAllData();
          loadAvailableSlots();
        }, 100);
      });
    }
  }, []);

  // Функция для загрузки всех доступных слотов
  const loadAvailableSlots = () => {
    // Показываем все незабронированные слоты, независимо от статуса преподавателя
    const availableSlots = timeSlots.filter(slot => {
      // Проверяем, что слот не забронирован
      if (slot.isBooked) return false;
      
      // Проверяем, что дата слота не в прошлом
      const slotDate = new Date(slot.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (slotDate < today) return false;
      
      return true;
    });
    
    // setFilteredSlots(availableSlots); // Убрано, так как теперь показываем всех репетиторов
    
    return availableSlots;
  };

  const applyFilters = (closeModal = false) => {
    setLoading(true);
    
    try {
      // Получаем все доступные слоты
      let results = timeSlots.filter(slot => {
        // Базовые проверки
        if (slot.isBooked) return false;
        
        // Проверяем, что дата слота не в прошлом
        const slotDate = new Date(slot.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (slotDate < today) return false;
        
        return true;
      });

      // Применяем фильтры из FilterOptions
      if (filters.grade && filters.grade !== '') {
        results = results.filter(slot => 
          slot.grades && slot.grades.includes(filters.grade!)
        );
      }

      if (filters.subject && filters.subject !== '') {
        results = results.filter(slot => slot.subject === filters.subject);
      }

      if (filters.experience && filters.experience !== '') {
        results = results.filter(slot => slot.experience === filters.experience);
      }

      if (filters.format && filters.format !== '') {
        results = results.filter(slot => slot.format === filters.format);
      }

      if (filters.duration && filters.duration > 0) {
        results = results.filter(slot => slot.duration === filters.duration);
      }

      if (filters.minRating && filters.minRating > 0) {
        results = results.filter(slot => (slot.rating || 0) >= filters.minRating!);
      }

      if (filters.goals && filters.goals.length > 0) {
        results = results.filter(slot => 
          slot.goals && filters.goals!.some(goal => slot.goals!.includes(goal))
        );
      }

      // Дополнительная фильтрация по дате и времени
      if (selectedDate) {
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        results = results.filter(slot => slot.date === selectedDateStr);
      }
      
      if (selectedTimeRange) {
        results = results.filter(slot => {
          const slotHour = parseInt(slot.startTime.split(':')[0]);
          const startHour = parseInt(selectedTimeRange.start.split(':')[0]);
          const endHour = parseInt(selectedTimeRange.end.split(':')[0]);
          return slotHour >= startHour && slotHour < endHour;
        });
      }
      
      // setFilteredSlots(results); // Убрано, так как теперь показываем всех репетиторов
      
      // Закрываем модальное окно только если явно указано
      if (closeModal) {
      setShowFilters(false);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSelectedDate(null);
    setSelectedTimeRange(null);
    setSearchQuery('');
    loadAvailableSlots(); // Загружаем все доступные слоты
    setShowFilters(false);
  };



  const handleConfirmBooking = async (comment: string) => {
    if (user && selectedBookingSlot) {
      bookLesson(selectedBookingSlot.id, user.id, user.name, comment);
      
      setTimeout(() => {
        if (Object.keys(filters).length === 0 && !selectedDate && !selectedTimeRange) {
          loadAvailableSlots();
        } else {
          applyFilters(false);
        }
      }, 100);
    }
  };

  const handleOverbooking = () => {
    setShowOverbookingModal(false);
    if (socket.current) {
      const requestData = {
        studentId: user?.id,
        studentName: user?.name,
        ...overbookingData,
      };
      (socket.current as Socket).emit('overbookingRequest', requestData);
    } else {
    }
    alert('Заявка на овербукинг отправлена! Мы подберем лучшего преподавателя за 5 часов до занятия.');
  };

  const getExperienceLabel = (exp: string) => {
    switch (exp) {
      case 'beginner': return 'Начинающий';
      case 'experienced': return 'Опытный';
      case 'professional': return 'Профессионал';
      default: return exp;
    }
  };

  // Собираем всех преподавателей (не только с доступными слотами)
  // ВАЖНО: Преподаватели отображаются всегда, независимо от статуса онлайн
  const allTeachers: { id: string; name: string; avatar?: string; rating?: number; profile?: any }[] = React.useMemo(() => {
    console.log('🔄 Собираем всех преподавателей...');
    console.log('📊 Исходные данные:');
    console.log('- serverTeachers:', serverTeachers.length, serverTeachers);
    console.log('- allUsers:', allUsers?.length || 0, allUsers);
    console.log('- teacherProfiles:', Object.keys(teacherProfiles).length, teacherProfiles);
    console.log('- timeSlots:', timeSlots.length);
    
    // Получаем всех преподавателей из разных источников
    const teachersFromServer = serverTeachers.map(teacher => ({
      id: teacher.id,
      name: teacher.name || teacher.profile?.name || 'Репетитор',
      avatar: teacher.avatar || teacher.profile?.avatar || '',
      rating: teacher.profile?.rating,
      profile: teacher.profile
    }));
    console.log('📡 Преподаватели с сервера:', teachersFromServer.length, teachersFromServer);

    const teachersFromUsers = allUsers
      ?.filter((u: any) => u.role === 'teacher')
      .map((user: any) => ({
        id: user.id,
        name: user.name || user.profile?.name || 'Репетитор',
        avatar: user.avatar || user.profile?.avatar || '',
        rating: user.profile?.rating,
        profile: user.profile
      })) || [];
    console.log('👥 Преподаватели из allUsers:', teachersFromUsers.length, teachersFromUsers);

    // Получаем преподавателей из локальных профилей (fallback)
    const teachersFromProfiles = Object.entries(teacherProfiles).map(([id, profile]: [string, any]) => ({
      id,
      name: profile.name || 'Репетитор',
      avatar: profile.avatar || '',
      rating: profile.rating,
      profile: profile
    }));
    console.log('📱 Преподаватели из teacherProfiles:', teachersFromProfiles.length, teachersFromProfiles);

    // Также получаем преподавателей из слотов, если они еще не добавлены
    const teachersFromSlots = timeSlots
      .filter(slot => slot.teacherId && slot.teacherName)
      .map(slot => ({
        id: slot.teacherId,
        name: slot.teacherName,
        avatar: slot.teacherAvatar || '',
        rating: slot.rating,
        profile: {
          subjects: slot.subject ? [slot.subject] : [],
          experience: slot.experience || 'beginner',
          grades: slot.grades || [],
          goals: slot.goals || [],
          city: '',
          bio: '',
          rating: slot.rating || 0,
          hourlyRate: slot.price || 0,
        }
      }));
    console.log('📅 Преподаватели из слотов:', teachersFromSlots.length, teachersFromSlots);

    // Объединяем все источники
    const allSources = [...teachersFromServer, ...teachersFromUsers, ...teachersFromProfiles, ...teachersFromSlots];
    console.log('🔄 Всего источников:', allSources.length);

    // Убираем дубликаты, приоритет у тех, у кого есть аватары и полные профили
    const allTeachersMap = new Map();
    allSources.forEach(teacher => {
      const existingTeacher = allTeachersMap.get(teacher.id);
      
      if (!existingTeacher) {
        allTeachersMap.set(teacher.id, teacher);
      } else {
        // Если у нового преподавателя есть аватар, а у существующего нет, заменяем
        const newHasAvatar = teacher.avatar && teacher.avatar.trim() !== '' && teacher.avatar !== 'undefined' && teacher.avatar !== 'null';
        const existingHasAvatar = existingTeacher.avatar && existingTeacher.avatar.trim() !== '' && existingTeacher.avatar !== 'undefined' && existingTeacher.avatar !== 'null';
        
        // Если у нового преподавателя есть полный профиль, заменяем
        const newHasFullProfile = teacher.profile && teacher.profile.subjects && teacher.profile.subjects.length > 0;
        const existingHasFullProfile = existingTeacher.profile && existingTeacher.profile.subjects && existingTeacher.profile.subjects.length > 0;
        
        if ((newHasAvatar && !existingHasAvatar) || (newHasFullProfile && !existingHasFullProfile)) {
          allTeachersMap.set(teacher.id, teacher);
        }
      }
    });

    const result = Array.from(allTeachersMap.values());
    console.log('✅ Итоговые преподаватели (всегда отображаются):', result.length, result);
    
    return result;
  }, [serverTeachers, allUsers, timeSlots, teacherProfiles]);

  // Фильтруем преподавателей по профилю и поиску (НЕ по доступным слотам)
  const filteredTeachers = React.useMemo(() => {
    let teachers = allTeachers;

    // Применяем фильтры по профилям преподавателей
    if (Object.keys(filters).length > 0 || selectedDate || selectedTimeRange) {
      teachers = allTeachers.filter(teacher => {
        const profile = teacher.profile as any;
        
        // Проверяем фильтры по профилю преподавателя
        if (filters.subject && filters.subject !== '' && (!profile?.subjects || !profile.subjects.includes(filters.subject))) {
          return false;
        }
        
        if (filters.experience && filters.experience !== '' && profile?.experience !== filters.experience) {
          return false;
        }
        
        if (filters.format && filters.format !== '' && (!profile?.formats || !profile.formats.includes(filters.format))) {
          return false;
        }
        
        if (filters.city && filters.city !== '' && (!profile?.city || !profile.city.toLowerCase().includes(filters.city.toLowerCase()))) {
          return false;
        }
        
        if (filters.minRating && filters.minRating > 0 && (profile?.rating || 0) < filters.minRating) {
          return false;
        }
        
        if (filters.duration && filters.duration > 0 && (!profile?.durations || !profile.durations.includes(filters.duration))) {
          return false;
        }
        
        if (filters.grade && filters.grade !== '' && (!profile?.grades || !profile.grades.includes(filters.grade))) {
          return false;
        }
        
        if (filters.goals && filters.goals.length > 0 && (!profile?.goals || !filters.goals.some(goal => profile.goals.includes(goal)))) {
          return false;
        }
        
        return true;
      });
    }

    // Применяем поиск по имени преподавателя, предметам или городу
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      teachers = teachers.filter(teacher => {
        const profile = teacher.profile as any;
        
        // Поиск по имени преподавателя
        if (teacher.name.toLowerCase().includes(query)) return true;
        
        // Поиск по предметам
        if (profile?.subjects && profile.subjects.some((subject: string) => 
          subject.toLowerCase().includes(query)
        )) return true;
        
        // Поиск по городу
        if (profile?.city && profile.city.toLowerCase().includes(query)) return true;
        
        return false;
      });
    }

    return teachers;
  }, [allTeachers, filters, selectedDate, selectedTimeRange, debouncedSearchQuery]);


  // Функция для получения пользователя по id
  function getUserById(userId: string) {
    try {
      const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
      return users.find((u: any) => u.id === userId && u.role === 'teacher') || null;
    } catch {
      return null;
    }
  }

  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showTeacherProfilePage, setShowTeacherProfilePage] = useState(false);


  // Автоматическое применение фильтров при их изменении
  React.useEffect(() => {
    const hasActiveFilters = Object.keys(filters).length > 0 || selectedDate || selectedTimeRange;
    
    if (hasActiveFilters) {
      applyFilters();
    } else {
      loadAvailableSlots();
    }
  }, [filters, selectedDate, selectedTimeRange, timeSlots]);

  // Обновление доступных слотов при изменении списка пользователей
  React.useEffect(() => {
    loadAvailableSlots();
  }, [allUsers]);

  // Обновление списка преподавателей при изменении пользователей
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tutoring_users') {
        // Используем функцию refreshUsers из контекста для обновления списка пользователей
        refreshUsers();
        // Также обновляем серверных преподавателей
        setServerTeachers([]); // Сбрасываем серверных преподавателей
        // Перезагружаем преподавателей с сервера
        fetch(`${SERVER_URL}/api/teachers`)
          .then(res => res.json())
          .then(data => setServerTeachers(Array.isArray(data) ? data : []))
          .catch(() => setServerTeachers([]));
        // Обновляем доступные слоты
        loadAvailableSlots();
      }
    };

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === 'tutoring_users') {
        // Используем функцию refreshUsers из контекста для обновления списка пользователей
        refreshUsers();
        // Также обновляем серверных преподавателей
        setServerTeachers([]); // Сбрасываем серверных преподавателей
        // Перезагружаем преподавателей с сервера
        fetch(`${SERVER_URL}/api/teachers`)
          .then(res => res.json())
          .then(data => setServerTeachers(Array.isArray(data) ? data : []))
          .catch(() => setServerTeachers([]));
        // Обновляем доступные слоты
        loadAvailableSlots();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customStorage', handleCustomStorageChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customStorage', handleCustomStorageChange as EventListener);
    };
  }, []);

  // Первоначальная загрузка слотов при монтировании компонента
  React.useEffect(() => {
    // Загружаем доступные слоты при любом изменении timeSlots
    loadAvailableSlots();
  }, [timeSlots]);

  const handleTeacherClick = async (teacher: any) => {
    console.log('Teacher clicked:', teacher);
    
    // Принудительно обновляем данные учителя с сервера
    try {
      const response = await fetch(`${SERVER_URL}/api/users/${teacher.id}`);
      if (response.ok) {
        const freshTeacherData = await response.json();
        console.log('Fresh teacher data from server:', freshTeacherData);
        
        // Обновляем данные в контексте
        if (freshTeacherData) {
          // Обновляем пользователя в localStorage
          const existingUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
          const updatedUsers = existingUsers.map((user: any) => 
            user.id === freshTeacherData.id ? freshTeacherData : user
          );
          localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
          
          // Используем свежие данные
          const teacherUser = {
            id: freshTeacherData.id,
            name: freshTeacherData.name,
            email: freshTeacherData.email,
            avatar: freshTeacherData.profile?.avatar || freshTeacherData.avatar,
            role: 'teacher',
            profile: {
              ...freshTeacherData.profile,
              avatar: freshTeacherData.profile?.avatar || freshTeacherData.avatar,
              name: freshTeacherData.name,
              email: freshTeacherData.email
            }
          };
          
          console.log('Updated teacher data for modal:', teacherUser);
          setSelectedTeacher(teacherUser);
          setShowTeacherModal(true);
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching fresh teacher data:', error);
    }
    
    // Fallback к старому методу, если не удалось получить свежие данные
    let teacherUser = getUserById(teacher.id);
    
    if (!teacherUser) {
      teacherUser = {
        id: teacher.id,
        name: teacher.name,
        email: teacher.profile?.email || teacher.email || '',
        avatar: teacher.profile?.avatar || teacher.avatar,
        role: 'teacher',
        profile: {
          ...teacher.profile,
          avatar: teacher.profile?.avatar || teacher.avatar,
          name: teacher.name,
          email: teacher.profile?.email || teacher.email
        }
      };
    } else {
      teacherUser = {
        ...teacherUser,
        name: teacher.name || teacherUser.name,
        email: teacher.profile?.email || teacher.email || teacherUser.email,
        avatar: teacher.profile?.avatar || teacher.avatar || teacherUser.avatar,
        profile: {
          ...teacherUser.profile,
          ...teacher.profile,
          avatar: teacher.profile?.avatar || teacher.avatar || teacherUser.avatar,
          name: teacher.name || teacherUser.name,
          email: teacher.profile?.email || teacher.email || teacherUser.email
        }
      };
    }
    
    console.log('Fallback teacher data for modal:', teacherUser);
    setSelectedTeacher(teacherUser);
    setShowTeacherModal(true);
  };

  const handleBookLesson = (teacherId: string) => {
    // Находим преподавателя
    const teacher = allUsers.find(user => user.id === teacherId);
    if (teacher) {
      setSelectedTeacherForCalendar(teacher);
      setShowTeacherCalendarModal(true);
    }
    setShowTeacherProfilePage(false);
  };

  const handleMessage = (teacherId: string) => {
    console.log('🔍 StudentHome handleMessage DEBUG:');
    console.log('- Student user:', { id: user?.id, name: user?.name, role: user?.role });
    console.log('- Target teacher ID:', teacherId);
    
    // Находим преподавателя
    const teacher = allUsers.find(user => user.id === teacherId);
    console.log('- Found teacher:', teacher);
    
    if (teacher && user) {
      console.log('- Sending message to teacher:', { 
        studentId: user.id, 
        teacherId: teacherId, 
        studentName: user.name, 
        teacherName: teacher.name 
      });
      
      // Отправляем сообщение преподавателю (автоматически создается чат)
      const chatId = sendMessageToUser(
        user.id, 
        user.name, 
        teacherId, 
        teacher.name, 
        `Привет! Меня зовут ${user.name}. Можете ли вы помочь мне с обучением?`
      );
      console.log('- Message sent, chat ID:', chatId);
      
      // Переключаемся на вкладку чатов
      setActiveTab('chats');
    } else {
      console.log('❌ Teacher not found or user not available');
    }
    console.log('🔍 END StudentHome DEBUG');
    setShowTeacherProfilePage(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="mb-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Найди своего идеального репетитора
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Изучай профили преподавателей, связывайся с ними и записывайся на уроки
          </p>
          </div>
        
        {/* Connection Status */}
        <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <Wifi className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Подключено в реальном времени</span>
            </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setShowOverbookingModal(true)}
          className="group bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold text-base hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
        >
          <div className="p-1.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="font-bold">Овербукинг</div>
            <div className="text-xs opacity-90">Автоподбор</div>
          </div>
        </button>
        
        <button
          onClick={() => setShowCalendar(true)}
          className="group bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl font-semibold text-base hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
        >
          <div className="p-1.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
          <CalendarIcon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="font-bold">Календарь</div>
            <div className="text-xs opacity-90">Слоты</div>
          </div>
        </button>
        

      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Поиск по предмету, преподавателю или городу..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-base placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
                showFilters 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <Filter className="h-4 w-4" />
            <span>Фильтры</span>
              {(Object.keys(filters).length > 0 || selectedDate || selectedTimeRange || searchQuery.trim()) && (
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-xs font-bold">
                  {Object.keys(filters).length + (selectedDate ? 1 : 0) + (selectedTimeRange ? 1 : 0) + (searchQuery.trim() ? 1 : 0)}
                </span>
              )}
          </button>
          <button
            onClick={() => applyFilters(true)}
            disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center space-x-2 text-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Применение...</span>
                </>
              ) : (
                <>
                  <span>Применить</span>
                </>
              )}
          </button>
          {(Object.keys(filters).length > 0 || selectedDate || selectedTimeRange || searchQuery.trim()) && (
            <button
              onClick={clearFilters}
                className="bg-white border-2 border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm"
            >
              Сбросить
            </button>
          )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Класс</label>
                <select
                  value={filters.grade || ''}
                  onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Любой класс</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Предмет</label>
                <select
                  value={filters.subject || ''}
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Любой предмет</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Опыт</label>
                <select
                  value={filters.experience || ''}
                  onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Любой опыт</option>
                  {experiences.map(exp => (
                    <option key={exp} value={exp}>{getExperienceLabel(exp)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Формат</label>
                <select
                  value={filters.format || ''}
                  onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Любой формат</option>
                  {formats.map(format => (
                    <option key={format} value={format}>
                      {format === 'online' ? 'Онлайн' : format === 'offline' ? 'Оффлайн' : 'Мини-группа'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Дополнительные фильтры */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Длительность</label>
                <select
                  value={filters.duration || ''}
                  onChange={(e) => setFilters({ ...filters, duration: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Любая длительность</option>
                  {durations.map(duration => (
                    <option key={duration} value={duration}>{duration} мин</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Мин. рейтинг</label>
                <select
                  value={filters.minRating || ''}
                  onChange={(e) => setFilters({ ...filters, minRating: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Любой рейтинг</option>
                  <option value="4">4+ звезды</option>
                  <option value="4.5">4.5+ звезды</option>
                  <option value="5">5 звезд</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Город</label>
                <input
                  type="text"
                  value={filters.city || ''}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  placeholder="Введите город"
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Цели обучения</label>
                <select
                  value={filters.goals?.[0] || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    goals: e.target.value ? [e.target.value] : undefined 
                  })}
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Любые цели</option>
                  {goals.map(goal => (
                    <option key={goal} value={goal}>{goal}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Календарь в фильтрах */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Выберите дату и время</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Календарь */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">Дата</label>
                  <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                  <Calendar
                    localizer={localizer}
                    events={[]}
                    startAccessor="start"
                    endAccessor="end"
                      style={{ height: 280 }}
                    views={['month']}
                    view="month"
                    selectable
                    onSelectSlot={(slotInfo) => {
                      setSelectedDate(slotInfo.start);
                    }}
                    onSelectEvent={() => {}}

                  />
                  </div>
                </div>

                {/* Выбор времени */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">Время</label>
                  <div className="space-y-4">
                <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Начало</label>
                      <input
                        type="time"
                        value={selectedTimeRange?.start || ''}
                        onChange={(e) => setSelectedTimeRange(prev => ({
                          start: e.target.value,
                          end: prev?.end || '23:00'
                        }))}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Конец</label>
                      <input
                        type="time"
                        value={selectedTimeRange?.end || ''}
                        onChange={(e) => setSelectedTimeRange(prev => ({
                          start: prev?.start || '00:00',
                          end: e.target.value
                        }))}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-base"
                      />
                    </div>
                  </div>
                  
                  {selectedDate && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <CalendarIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-800">Выбрана дата:</span>
                      </div>
                      <p className="text-base font-medium text-blue-900">
                        {format(selectedDate, 'dd MMMM yyyy', { locale: ru })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Преподаватели в виде карточек */}
      <div className="mb-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {filteredTeachers.length > 0 
              ? `Найдено ${filteredTeachers.length} преподавателей` 
              : 'Преподаватели'
            }
          </h2>
          <p className="text-gray-500 text-sm">
            {filteredTeachers.length > 0 
              ? 'Выберите подходящего преподавателя для связи или бронирования урока'
              : 'Попробуйте изменить фильтры или воспользоваться овербукингом'
            }
          </p>
        </div>
        
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTeachers.length === 0 ? (
          <EmptyState
            title={Object.keys(filters).length > 0 || selectedDate || selectedTimeRange 
              ? 'Нет преподавателей подходящих под фильтры'
              : 'Нет зарегистрированных преподавателей'}
            description={Object.keys(filters).length > 0 || selectedDate || selectedTimeRange 
              ? 'Попробуйте изменить фильтры или воспользоваться овербукингом'
              : 'Попробуйте воспользоваться овербукингом или обратитесь к администратору'}
            actionPrimary={{
              label: 'Овербукинг',
              onClick: () => setShowOverbookingModal(true),
            }}
            actionSecondary={{
              label: 'Сбросить фильтры',
              onClick: clearFilters,
              variant: 'secondary',
            }}
          />
        ) : (
          <>
            {/* Список преподавателей */}
            {filteredTeachers.map(teacher => {
              const profile = teacher.profile;
              // Получаем слоты этого преподавателя из всех слотов (не только отфильтрованных)
              const allTeacherSlots = timeSlots.filter(slot => slot.teacherId === teacher.id);
              const availableTeacherSlots = allTeacherSlots.filter(slot => !slot.isBooked);
              
              // Определяем, есть ли доступные слоты у этого преподавателя
              const hasAvailableSlots = availableTeacherSlots.length > 0;
              
              return (
                <div 
                  key={teacher.id} 
                  className="bg-white rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden transform hover:-translate-y-2"
                  onClick={() => handleTeacherClick(teacher)}
                >
                  {/* Custom Background - Smaller */}
                  <div 
                    className="h-32 relative overflow-hidden"
                    style={{
                      background: profile?.cardBackground 
                        ? (profile.cardBackground.startsWith('http') || profile.cardBackground.startsWith('data:'))
                          ? `url(${profile.cardBackground}) center/cover`
                          : profile.cardBackground
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                    
                    {/* Action buttons on top */}
                    <div className="absolute top-3 right-3 flex items-center space-x-2">
                      <button 
                        className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors border border-white/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Здесь можно добавить логику для добавления в избранное
                        }}
                      >
                        <Heart className="h-3 w-3" />
                      </button>
                      <button 
                        className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors border border-white/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Здесь можно добавить логику для шаринга
                        }}
                      >
                        <Share2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Avatar - Centered on background, Bigger */}
                  <div className="relative -mt-12 flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl relative">
                      {/* Online Status - всегда зеленый для зарегистрированных репетиторов (отображаются всегда) */}
                      <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-lg" title="Доступен для контакта (всегда отображается)"></div>
                      
                      {/* Avatar Image */}
                      {(() => {
                        const avatarUrl = profile?.avatar || teacher.avatar;
                        const hasAvatar = avatarUrl && avatarUrl.trim() !== '' && avatarUrl !== 'undefined' && avatarUrl !== 'null';
                        
                        if (hasAvatar) {
                          return (
                            <img 
                              src={avatarUrl} 
                              alt={teacher.name} 
                              className="w-32 h-32 object-cover rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.classList.remove('hidden');
                              }}
                              onLoad={(e) => {
                                const target = e.target as HTMLImageElement;
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.classList.add('hidden');
                              }}
                            />
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Fallback Avatar */}
                      <div className={`w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center ${(() => {
                        const avatarUrl = profile?.avatar || teacher.avatar;
                        const hasAvatar = avatarUrl && avatarUrl.trim() !== '' && avatarUrl !== 'undefined' && avatarUrl !== 'null';
                        return hasAvatar ? 'hidden' : '';
                      })()}`}>
                        <UserIcon className="h-16 w-16 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content - Below avatar */}
                  <div className="px-6 pb-6 pt-4">
                    {/* Name and Profession */}
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {profile?.name || teacher.name || 'Репетитор'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {profile?.teacherType === 'private' ? 'Частный преподаватель' :
                         profile?.teacherType === 'school' ? 'Преподаватель школы' :
                         profile?.teacherType === 'both' ? 'Частный + Школа' :
                         'Частный преподаватель'}
                      </p>
                    </div>
                    
                    {/* Age and Experience */}
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-4">
                      {profile?.age && <span>возраст {profile.age} лет</span>}
                      {profile?.experienceYears && <span>стаж {profile.experienceYears} лет</span>}
                    </div>
                    
                    {/* Reviews */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center space-x-1 bg-green-50 px-3 py-1.5 rounded-full">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {profile?.reviewsCount && profile.reviewsCount > 0 ? `${profile.reviewsCount} отзывов` : 'отзывов нет'}
                      </span>
                        </div>
                    </div>
                    
                    {/* Location */}
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{profile?.city || 'Город не указан'}</span>
                    </div>
                    </div>
                    
                                      {/* Action Buttons */}
                    <div className="space-y-2">
                    <button
                      onClick={(e) => {
                          e.stopPropagation();
                        if (hasAvailableSlots) {
                            setSelectedTeacherForCalendar(teacher);
                            setShowTeacherCalendarModal(true);
                        } else {
                          handleTeacherClick(teacher);
                        }
                      }}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 text-base ${
                      hasAvailableSlots 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                      }`}
                    >
                      {hasAvailableSlots ? 'Забронировать урок' : 'Связаться с репетитором'}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTeacherClick(teacher);
                      }}
                      className="w-full py-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium"
                    >
                      Подробнее →
                  </button>
                  </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        </div>
      </div>

      {/* Overbooking Modal */}
      {showOverbookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Овербукинг - Автоподбор преподавателя</h2>
              <p className="text-gray-600 mb-6">
                Заполните форму, и мы автоматически подберем лучшего доступного преподавателя за 5 часов до занятия
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Класс</label>
                    <select
                      value={overbookingData.grade}
                      onChange={(e) => setOverbookingData({ ...overbookingData, grade: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Выберите класс</option>
                      {grades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Предмет</label>
                    <select
                      value={overbookingData.subject}
                      onChange={(e) => setOverbookingData({ ...overbookingData, subject: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Выберите предмет</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Дата занятия</label>
                    <input
                      type="date"
                      value={overbookingData.date}
                      onChange={e => setOverbookingData({ ...overbookingData, date: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Время начала</label>
                    <input
                      type="time"
                      value={overbookingData.startTime}
                      onChange={e => setOverbookingData({ ...overbookingData, startTime: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Цель занятий</label>
                  <div className="grid grid-cols-2 gap-2">
                    {goals.map(goal => (
                      <label key={goal} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={overbookingData.goals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setOverbookingData({
                                ...overbookingData,
                                goals: [...overbookingData.goals, goal]
                              });
                            } else {
                              setOverbookingData({
                                ...overbookingData,
                                goals: overbookingData.goals.filter(g => g !== goal)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Опыт преподавателя</label>
                    <select
                      value={overbookingData.experience}
                      onChange={(e) => setOverbookingData({ ...overbookingData, experience: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Любой</option>
                      {experiences.map(exp => (
                        <option key={exp} value={exp}>{getExperienceLabel(exp)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Продолжительность</label>
                    <select
                      value={overbookingData.duration}
                      onChange={(e) => setOverbookingData({ ...overbookingData, duration: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {durations.map(duration => (
                        <option key={duration} value={duration}>{duration} мин</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Формат</label>
                    <select
                      value={overbookingData.format}
                      onChange={(e) => setOverbookingData({ ...overbookingData, format: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {formats.map(format => (
                        <option key={format} value={format}>
                          {format === 'online' ? 'Онлайн' : format === 'offline' ? 'Оффлайн' : 'Мини-группа'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {overbookingData.format === 'offline' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
                    <input
                      type="text"
                      value={overbookingData.city}
                      onChange={(e) => setOverbookingData({ ...overbookingData, city: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Введите ваш город"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Примечание</label>
                  <textarea
                    value={overbookingData.comment}
                    onChange={e => setOverbookingData({ ...overbookingData, comment: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Например: хочу разобрать домашнее задание или подготовиться к контрольной..."
                  />
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleOverbooking}
                  disabled={!overbookingData.grade || !overbookingData.subject || !overbookingData.date || !overbookingData.startTime}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50"
                >
                  Отправить заявку
                </button>
                <button
                  onClick={() => setShowOverbookingModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* Модальное окно с полной страницей преподавателя */}
      {showTeacherModal && selectedTeacher && (
        <TeacherProfileModal
          teacher={selectedTeacher}
          onClose={() => setShowTeacherModal(false)}
          onBookLesson={(teacherId) => {
            setShowTeacherModal(false);
            handleBookLesson(teacherId);
          }}
          onMessage={(teacherId) => {
            setShowTeacherModal(false);
            handleMessage(teacherId);
          }}
        />
      )}

      {/* Модальное окно для бронирования урока */}
      {showBookingModal && selectedBookingSlot && user && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedBookingSlot(null);
          }}
          onConfirm={handleConfirmBooking}
          slot={selectedBookingSlot}
          teacher={getUserById(selectedBookingSlot.teacherId)}
          student={user}
        />
      )}

      {/* Полная страница преподавателя */}
      {showTeacherProfilePage && selectedTeacher && (
        <TeacherProfilePage
          teacher={selectedTeacher}
          onClose={() => setShowTeacherProfilePage(false)}
          onBookLesson={handleBookLesson}
          onMessage={handleMessage}
        />
      )}

      {/* Календарь свободных слотов */}
      {showCalendar && (
        <StudentCalendar
          onClose={() => setShowCalendar(false)}
        />
      )}

      {/* Модальное окно с календарем */}
      {showTeacherCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Календарь {selectedTeacherForCalendar?.name || 'Преподавателя'}
                    </h2>
                    <p className="text-gray-600">Выберите удобное время для занятия</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowTeacherCalendarModal(false);
                    setSelectedTeacherForCalendar(null);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Calendar Content */}
            <div className="p-6">
              {/* Week Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      const newWeekStart = new Date(currentWeekStart);
                      newWeekStart.setDate(newWeekStart.getDate() - 7);
                      setCurrentWeekStart(newWeekStart);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentWeekStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} — {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </h3>
                  
                  <button
                    onClick={() => {
                      const newWeekStart = new Date(currentWeekStart);
                      newWeekStart.setDate(newWeekStart.getDate() + 7);
                      setCurrentWeekStart(newWeekStart);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    const now = new Date();
                    const dayOfWeek = now.getDay();
                    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                    setCurrentWeekStart(new Date(now.setDate(diff)));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Сегодня
                </button>
              </div>
              
              {/* Calendar Grid */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Day headers */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                  <div className="w-20 p-3 border-r border-gray-200"></div>
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const currentDate = new Date(currentWeekStart);
                    currentDate.setDate(currentDate.getDate() + dayIndex);
                    return (
                      <div key={dayIndex} className="flex-1 p-3 border-r border-gray-200 last:border-r-0 text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {currentDate.toLocaleDateString('ru-RU', { weekday: 'short' })}
                        </div>
                        <div className="text-xs text-gray-600">
                          {currentDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Time slots with scroll */}
                <div className="max-h-[500px] overflow-y-auto">
                  {/* Time slots from 0:00 to 23:00 */}
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                    <div key={hour} className="flex border-b border-gray-200 last:border-b-0">
                      {/* Time column */}
                      <div className="w-20 bg-gray-50 p-3 border-r border-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 sticky left-0">
                        {hour.toString().padStart(2, '0')}:00
                      </div>
                      
                      {/* Days columns */}
                      {Array.from({ length: 7 }, (_, dayIndex) => {
                        const currentDate = new Date(currentWeekStart);
                        currentDate.setDate(currentDate.getDate() + dayIndex);
                        const dateString = currentDate.toISOString().split('T')[0];
                        
                        // Find slots for this time and date
                        const slotsForThisTime = timeSlots.filter(slot => 
                          slot.teacherId === selectedTeacherForCalendar?.id && 
                          !slot.isBooked &&
                          slot.date === dateString &&
                          parseInt(slot.startTime.split(':')[0]) === hour
                        );
                        
                        return (
                          <div key={dayIndex} className="flex-1 p-3 border-r border-gray-200 last:border-r-0 min-h-[60px]">
                            {slotsForThisTime.map(slot => (
                              <div
                                key={slot.id}
                                className="bg-blue-100 border border-blue-300 rounded-lg p-2 mb-2 cursor-pointer hover:bg-blue-200 transition-colors"
                                onClick={() => {
                                  if (user) {
                                    setSelectedBookingSlot(slot);
                                    setShowBookingModal(true);
                                    setShowTeacherCalendarModal(false);
                                    setSelectedTeacherForCalendar(null);
                                  }
                                }}
                              >
                                <div className="text-xs font-medium text-blue-900">
                                  {slot.startTime} - {slot.endTime}
                                </div>
                                <div className="text-xs text-blue-700">
                                  {slot.subject}
                                </div>
                                <div className="text-xs text-blue-600">
                                  {slot.price} ₽
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Available Slots Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Доступные слоты: {timeSlots.filter(slot => slot.teacherId === selectedTeacherForCalendar?.id && !slot.isBooked).length}</h4>
                <p className="text-sm text-gray-600">Нажмите на любой слот в календаре для бронирования</p>
              </div>
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default StudentHome;