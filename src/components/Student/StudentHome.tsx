import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Users, MapPin, BookOpen, RefreshCw, Wifi, WifiOff, Heart, MoreHorizontal, Calendar as CalendarIcon } from 'lucide-react';
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
import StudentCalendar from './StudentCalendar';
import BookingModal from '../Shared/BookingModal';
import { User as UserIcon } from 'lucide-react';

const StudentHome: React.FC = () => {
  const { getFilteredSlots, bookLesson, timeSlots, isConnected } = useData();
  const { user } = useAuth();
  
  // CSS анимация для результатов поиска
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filteredSlots, setFilteredSlots] = useState<TimeSlot[]>([]);
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

  // Новые состояния для календаря в фильтрах
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{ start: string; end: string } | null>(null);

  const subjects = ['Математика', 'Русский язык', 'Английский язык'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'Студент', 'Взрослый'];
  const goals = ['подготовка к экзаменам', 'помощь с домашним заданием', 'углубленное изучение', 'разговорная практика'];
  const experiences = ['beginner', 'experienced', 'professional'];
  const formats = ['online', 'offline', 'mini-group'];
  const durations = [45, 60];
  const locales = { 'ru': ru };
  const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

  const { allUsers } = useData();
  const [serverTeachers, setServerTeachers] = useState<User[]>([]);

  // Загружаем преподавателей с сервера при монтировании
  useEffect(() => {
    fetch(`${SERVER_URL}/api/teachers`)
      .then(res => res.json())
      .then(data => setServerTeachers(Array.isArray(data) ? data : []))
      .catch(() => setServerTeachers([]));
  }, []);

  const socket = React.useRef<Socket | null>(null);
  React.useEffect(() => {
    if (!socket.current) {
      socket.current = io(WEBSOCKET_URL);
    }
  }, []);

  // Функция для загрузки всех доступных слотов
  const loadAvailableSlots = () => {
    console.log('StudentHome: Loading available slots...');
    console.log('StudentHome: Total timeSlots in context:', timeSlots.length);
    
    // Показываем все незабронированные слоты, независимо от статуса преподавателя
    const availableSlots = timeSlots.filter(slot => !slot.isBooked);
    
    console.log('StudentHome: Available slots to display:', availableSlots.length);
    setFilteredSlots(availableSlots);
    
    return availableSlots;
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    setLoading(true);
    
    try {
      let results = getFilteredSlots(filters);
      
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
      
      console.log('Filter results:', results.length);
      setFilteredSlots(results);
      
      // Автоматическая прокрутка к результатам поиска
      setTimeout(() => {
        const teachersSection = document.querySelector('[data-section="teachers"]');
        if (teachersSection) {
          teachersSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
      
      // Панель фильтров остается открытой после применения
      // Теперь пользователь может изменять фильтры и применять их снова
      // setShowFilters(false);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    console.log('Clearing filters and loading all available slots');
    setFilters({});
    setSelectedDate(null);
    setSelectedTimeRange(null);
    loadAvailableSlots(); // Загружаем все доступные слоты вместо пустого массива
    // Панель фильтров остается открытой после сброса
    // Теперь пользователь может видеть, что фильтры были сброшены
    // setShowFilters(false);
  };

  const refreshSlots = () => {
    console.log('Refreshing slots manually');
    setLoading(true);
    
    setTimeout(() => {
      // Просто обновляем все доступные слоты
      loadAvailableSlots();
      setLoading(false);
    }, 500);
  };

  const handleBookSlot = (slotId: string) => {
    if (user) {
      const slot = timeSlots.find(s => s.id === slotId);
      if (slot) {
        setSelectedBookingSlot(slot);
        setShowBookingModal(true);
      }
    }
  };

  const handleConfirmBooking = async (comment: string) => {
    if (user && selectedBookingSlot) {
      console.log('Booking lesson:', selectedBookingSlot.id, 'for user:', user.name, 'with comment:', comment);
      bookLesson(selectedBookingSlot.id, user.id, user.name, comment);
      
      // После бронирования просто обновляем все доступные слоты
      setTimeout(() => {
        loadAvailableSlots();
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
      console.error('Socket not connected');
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

  const getFormatIcon = (format: string): JSX.Element | null => {
    switch (format) {
      case 'online': return null;
      case 'offline': return <MapPin className="h-4 w-4" />;
      case 'mini-group': return <Users className="h-4 w-4" />;
      default: return null;
    }
  };

  // Собираем всех преподавателей (не только с доступными слотами)
  const allTeachers: { id: string; name: string; avatar?: string; rating?: number; profile?: any }[] = React.useMemo(() => {
    // Получаем всех преподавателей из разных источников
    const teachersFromServer = serverTeachers.map(teacher => ({
      id: teacher.id,
      name: teacher.name || teacher.profile?.name || 'Репетитор',
      avatar: teacher.avatar || teacher.profile?.avatar,
      rating: teacher.profile?.rating,
      profile: teacher.profile
    }));

    const teachersFromUsers = allUsers
      ?.filter((u: any) => u.role === 'teacher')
      .map((user: any) => ({
        id: user.id,
        name: user.name || user.profile?.name || 'Репетитор',
        avatar: user.avatar || user.profile?.avatar,
        rating: user.profile?.rating,
        profile: user.profile
      })) || [];

    // Объединяем и убираем дубликаты
    const allTeachersMap = new Map();
    [...teachersFromServer, ...teachersFromUsers].forEach(teacher => {
      if (!allTeachersMap.has(teacher.id)) {
        allTeachersMap.set(teacher.id, teacher);
      }
    });

    return Array.from(allTeachersMap.values());
  }, [serverTeachers, allUsers]);

  // Фильтруем преподавателей по доступным слотам
  const filteredTeachers = React.useMemo(() => {
    console.log('DEBUG: filteredTeachers recalculating', {
      filtersCount: Object.keys(filters).length,
      selectedDate,
      selectedTimeRange,
      filteredSlotsCount: filteredSlots.length,
      allTeachersCount: allTeachers.length
    });

    if (Object.keys(filters).length === 0 && !selectedDate && !selectedTimeRange) {
      // Если фильтры не применены, показываем всех преподавателей
      console.log('DEBUG: No filters applied, showing all teachers');
      return allTeachers;
    }

    // Если есть фильтры, показываем только тех преподавателей, у которых есть подходящие слоты
    const teachersWithSlots = allTeachers.filter(teacher => {
      const teacherSlots = filteredSlots.filter(slot => slot.teacherId === teacher.id);
      const hasSlots = teacherSlots.length > 0;
      console.log(`DEBUG: Teacher ${teacher.name} (${teacher.id}) has ${teacherSlots.length} slots: ${hasSlots}`);
      return hasSlots;
    });

    console.log(`DEBUG: Filtered teachers result: ${teachersWithSlots.length} out of ${allTeachers.length}`);
    return teachersWithSlots;
  }, [allTeachers, filters, selectedDate, selectedTimeRange, filteredSlots]);

  function getTeacherProfileById(teacherId: string) {
    const teacher = serverTeachers.find(t => t.id === teacherId) ||
      allUsers?.find((u: any) => u.id === teacherId && u.role === 'teacher');
    const profile = teacher && teacher.profile ? teacher.profile : null;
    return profile;
  }

  // Функция для получения пользователя по id
  function getUserById(userId: string) {
    try {
      const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
      return users.find((u: any) => u.id === userId && u.role === 'teacher') || null;
    } catch {
      return null;
    }
  }

  const [modalSlot, setModalSlot] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showTeacherProfilePage, setShowTeacherProfilePage] = useState(false);
  const [teacherPosts, setTeacherPosts] = useState<any[]>([]);

  // Автоматическая подгрузка постов преподавателя
  useEffect(() => {
    if (!selectedTeacher) return;
    function updatePosts() {
      const teacher = getUserById(selectedTeacher.id);
      setTeacherPosts(teacher?.posts || []);
    }
    updatePosts();
    window.addEventListener('storage', updatePosts);
    return () => window.removeEventListener('storage', updatePosts);
  }, [selectedTeacher]);

  // Автоматическое обновление filteredSlots при изменении timeSlots, если фильтры уже применены
  React.useEffect(() => {
    if (Object.keys(filters).length > 0 || selectedDate || selectedTimeRange) {
      applyFilters();
    }
  }, [timeSlots]);

  // Убираем автоматическое применение фильтров при их изменении
  // Теперь фильтры применяются только при нажатии кнопки "Применить"
  // React.useEffect(() => {
  //   if (Object.keys(filters).length > 0 || selectedDate || selectedTimeRange) {
  //     applyFilters();
  //   }
  // }, [filters, selectedDate, selectedTimeRange]);

  React.useEffect(() => {
    console.log('DEBUG: timeSlots у ученика', timeSlots);
  }, [timeSlots]);

  // Первоначальная загрузка слотов при монтировании компонента
  React.useEffect(() => {
    if (timeSlots.length > 0) {
      loadAvailableSlots();
    }
  }, [timeSlots]);

  const handleTeacherClick = (teacher: any) => {
    console.log('Teacher clicked:', teacher);
    const teacherUser = getUserById(teacher.id);
    console.log('Teacher user data:', teacherUser);
    setSelectedTeacher(teacherUser);
    setShowTeacherProfilePage(true);
  };

  const handleBookLesson = (teacherId: string) => {
    // Здесь можно добавить логику для бронирования урока
    console.log('Booking lesson for teacher:', teacherId);
    setShowTeacherProfilePage(false);
    // Можно открыть модальное окно для выбора времени
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Рекомендации для вас</h1>
            <p className="text-gray-600">Выберите подходящий урок или воспользуйтесь овербукингом</p>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Real-time</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-amber-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Offline (кэшированные данные)</span>
                <button 
                  onClick={() => window.location.reload()}
                  className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200"
                >
                  Переподключиться
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={() => setShowOverbookingModal(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <BookOpen className="h-5 w-5 inline mr-2" />
          Овербукинг - Автоподбор преподавателя
        </button>
        
        <button
          onClick={() => setShowCalendar(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <CalendarIcon className="h-5 w-5" />
          <span>Календарь свободных слотов</span>
        </button>
        
        <button
          onClick={refreshSlots}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Обновить</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по предмету или преподавателю..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-6 py-3 border rounded-lg transition-colors ${
              (Object.keys(filters).length > 0 || selectedDate || selectedTimeRange)
                ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-5 w-5" />
            <span>Фильтры</span>
            {(Object.keys(filters).length > 0 || selectedDate || selectedTimeRange) && (
              <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {(Object.keys(filters).length + (selectedDate ? 1 : 0) + (selectedTimeRange ? 1 : 0))}
              </span>
            )}
          </button>
          <button
            onClick={applyFilters}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Применение...' : 'Применить'}
          </button>
          {(Object.keys(filters).length > 0 || selectedDate || selectedTimeRange) && (
            <button
              onClick={clearFilters}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Сбросить
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Фильтры поиска</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Закрыть фильтры"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Класс</label>
                <select
                  value={filters.grade || ''}
                  onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Любой</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Предмет</label>
                <select
                  value={filters.subject || ''}
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Любой</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Опыт</label>
                <select
                  value={filters.experience || ''}
                  onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Любой</option>
                  {experiences.map(exp => (
                    <option key={exp} value={exp}>{getExperienceLabel(exp)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Формат</label>
                <select
                  value={filters.format || ''}
                  onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Любой</option>
                  {formats.map(format => (
                    <option key={format} value={format}>
                      {format === 'online' ? 'Онлайн' : format === 'offline' ? 'Оффлайн' : 'Мини-группа'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Календарь в фильтрах */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Выберите дату и время</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Календарь */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Дата</label>
                  <Calendar
                    localizer={localizer}
                    events={[]}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 300 }}
                    views={['month']}
                    view="month"
                    selectable
                    onSelectSlot={(slotInfo) => {
                      setSelectedDate(slotInfo.start);
                    }}
                    onSelectEvent={() => {}}
                    className="border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Выбор времени */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Время</label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Начало</label>
                      <input
                        type="time"
                        value={selectedTimeRange?.start || ''}
                        onChange={(e) => setSelectedTimeRange(prev => ({
                          start: e.target.value,
                          end: prev?.end || '23:00'
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Конец</label>
                      <input
                        type="time"
                        value={selectedTimeRange?.end || ''}
                        onChange={(e) => setSelectedTimeRange(prev => ({
                          start: prev?.start || '00:00',
                          end: e.target.value
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {selectedDate && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Выбрана дата: {format(selectedDate, 'dd MMMM yyyy', { locale: ru })}
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
      <div className="mb-8" data-section="teachers">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Найденные преподаватели</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Найдено: {filteredTeachers.length}</span>
            {(Object.keys(filters).length > 0 || selectedDate || selectedTimeRange) && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                Фильтры применены
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTeachers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-lg mb-2">
                {Object.keys(filters).length > 0 || selectedDate || selectedTimeRange 
                  ? "Нет преподавателей подходящих под фильтры" 
                  : "Нет доступных преподавателей"}
              </div>
              <p className="text-gray-500">
                {Object.keys(filters).length > 0 || selectedDate || selectedTimeRange 
                  ? "Попробуйте изменить фильтры или воспользуйтесь овербукингом"
                  : "Попробуйте воспользоваться овербукингом"}
              </p>
            </div>
          ) : (
            filteredTeachers.map((teacher, index) => {
              const profile = teacher.profile;
              const teacherSlots = filteredSlots.filter(slot => slot.teacherId === teacher.id);
              const availableSlots = teacherSlots.filter(slot => !slot.isBooked);
              const hasAvailableSlots = availableSlots.length > 0;
              const minPrice = teacherSlots.length > 0 ? Math.min(...teacherSlots.map(slot => slot.price)) : profile?.hourlyRate || 0;
              const maxPrice = teacherSlots.length > 0 ? Math.max(...teacherSlots.map(slot => slot.price)) : profile?.hourlyRate || 0;
              
              return (
                <div 
                  key={teacher.id} 
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer max-w-sm"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                  onClick={() => handleTeacherClick(teacher)}
                >
                  {/* Изображение */}
                  <div className="aspect-square bg-gradient-to-br from-blue-400 to-indigo-500 rounded-t-lg flex items-center justify-center">
                    {profile?.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt={teacher.name} 
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 rounded-t-lg flex items-center justify-center">
                        <UserIcon className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Информация */}
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-xs leading-tight">
                        {profile?.name || teacher.name || 'Репетитор'}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <Heart className="h-3 w-3" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2">
                      {profile?.subjects?.slice(0, 2).join(', ')}...
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-900">
                        от {minPrice} ₽
                      </span>
                      {profile?.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-2 w-2 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">{profile.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <MapPin className="h-2 w-2 mr-1" />
                      {profile?.city || 'Онлайн'}
                    </div>
                    
                    {/* Индикатор статуса преподавателя */}
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <div className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-xs text-gray-500">
                        {isConnected ? 'Онлайн' : 'Слоты доступны'}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Предотвращаем всплытие события
                        if (hasAvailableSlots) {
                          // Находим первый доступный слот для этого преподавателя
                          const availableSlot = availableSlots[0];
                          if (availableSlot && user) {
                            console.log('Opening booking modal for slot:', availableSlot.id, 'for teacher:', teacher.id);
                            setSelectedBookingSlot(availableSlot);
                            setShowBookingModal(true);
                          }
                        } else {
                          // Если нет доступных слотов, открываем профиль преподавателя
                          handleTeacherClick(teacher);
                        }
                      }}
                      className={`w-full py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        hasAvailableSlots 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {hasAvailableSlots ? 'Забронировать' : 'Календарь'}
                    </button>
                  </div>
                </div>
              );
            })
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={() => setShowTeacherModal(false)} title="Закрыть">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col items-center mb-6">
              {selectedTeacher.avatar ? (
                <img src={selectedTeacher.avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover mb-2" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center mb-2">
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900">{selectedTeacher.name}</h2>
              <div className="text-gray-500">{selectedTeacher.email}</div>
            </div>
            {(() => {
              const profile = selectedTeacher.profile || {};
              const fieldMap: { key: string; label: string; icon: React.ReactNode }[] = [
                { key: 'bio', label: 'О себе', icon: <UserIcon className="inline-block w-5 h-5 mr-2 text-blue-500" /> },
                { key: 'country', label: 'Страна', icon: <span className="inline-block w-5 h-5 mr-2">🌍</span> },
                { key: 'city', label: 'Город', icon: <span className="inline-block w-5 h-5 mr-2">🏙️</span> },
                { key: 'experience', label: 'Опыт', icon: <span className="inline-block w-5 h-5 mr-2">🎓</span> },
                { key: 'rating', label: 'Рейтинг', icon: <span className="inline-block w-5 h-5 mr-2">⭐</span> },
                { key: 'hourlyRate', label: 'Цена за час', icon: <span className="inline-block w-5 h-5 mr-2">💸</span> },
                { key: 'subjects', label: 'Предметы', icon: <span className="inline-block w-5 h-5 mr-2">📚</span> },
                { key: 'grades', label: 'Классы', icon: <span className="inline-block w-5 h-5 mr-2">🏫</span> },
                { key: 'format', label: 'Формат', icon: <span className="inline-block w-5 h-5 mr-2">💻</span> },
                { key: 'duration', label: 'Длительность', icon: <span className="inline-block w-5 h-5 mr-2">⏱️</span> },
                { key: 'comment', label: 'Комментарий', icon: <span className="inline-block w-5 h-5 mr-2">💬</span> },
                { key: 'status', label: 'Статус', icon: <span className="inline-block w-5 h-5 mr-2">📋</span> },
              ];
              return (
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fieldMap.map(({ key, label, icon }) => {
                    const value = profile[key];
                    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) return null;
                    return (
                      <div key={key} className="flex items-start bg-gray-50 rounded-lg p-4 shadow-sm">
                        <div className="mt-1">{icon}</div>
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
                          {Array.isArray(value) ? (
                            <div className="flex flex-wrap gap-1">
                              {value.map((v: string, i: number) => (
                                <span key={i} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs mr-1 mb-1">{v}</span>
                              ))}
            </div>
                          ) : (
                            <div className="text-gray-900 text-sm break-all">{String(value)}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">Записи преподавателя</h3>
              {teacherPosts.length === 0 ? (
                <div className="text-gray-400 text-sm">Пока нет записей</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {teacherPosts.map(post => (
                    <div key={post.id} className="bg-gray-50 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        {selectedTeacher.avatar ? (
                          <img src={selectedTeacher.avatar} alt="avatar" className="h-7 w-7 rounded-full object-cover" />
                        ) : (
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="font-medium text-gray-900 text-sm">{selectedTeacher.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{post.date}</span>
                      </div>
                      <div className="text-gray-800 text-sm whitespace-pre-line">{post.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
        />
      )}

      {/* Календарь свободных слотов */}
      {showCalendar && (
        <StudentCalendar
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
};

export default StudentHome;