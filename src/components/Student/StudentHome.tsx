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
      setShowFilters(false);
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
    setShowFilters(false);
  };

  const refreshSlots = () => {
    console.log('Refreshing slots manually');
    setLoading(true);
    
    setTimeout(() => {
      if (Object.keys(filters).length === 0 && !selectedDate && !selectedTimeRange) {
        loadAvailableSlots();
      } else {
        applyFilters();
      }
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
      
      setTimeout(() => {
        if (Object.keys(filters).length === 0 && !selectedDate && !selectedTimeRange) {
          loadAvailableSlots();
        } else {
          applyFilters();
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
    console.log('DEBUG: Building allTeachers...');
    console.log('DEBUG: serverTeachers:', serverTeachers);
    console.log('DEBUG: allUsers:', allUsers);
    
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

    console.log('DEBUG: teachersFromServer:', teachersFromServer);
    console.log('DEBUG: teachersFromUsers:', teachersFromUsers);

    // Объединяем и убираем дубликаты
    const allTeachersMap = new Map();
    [...teachersFromServer, ...teachersFromUsers].forEach(teacher => {
      if (!allTeachersMap.has(teacher.id)) {
        allTeachersMap.set(teacher.id, teacher);
      }
    });

    const result = Array.from(allTeachersMap.values());
    console.log('DEBUG: Final allTeachers result:', result);

    return result;
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
      // Если фильтры не применены, показываем ВСЕХ преподавателей
      console.log('DEBUG: No filters applied, showing ALL teachers');
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

  // Автоматическое применение фильтров при их изменении
  React.useEffect(() => {
    if (Object.keys(filters).length > 0 || selectedDate || selectedTimeRange) {
      applyFilters();
    }
  }, [filters, selectedDate, selectedTimeRange]);

  React.useEffect(() => {
    console.log('DEBUG: timeSlots у ученика', timeSlots);
  }, [timeSlots]);

  // Первоначальная загрузка слотов при монтировании компонента
  React.useEffect(() => {
    console.log('DEBUG: Initial load - timeSlots count:', timeSlots.length);
    
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
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-5 w-5" />
            <span>Фильтры</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              {Object.keys(filters).length > 0 || selectedDate || selectedTimeRange 
                ? "Нет преподавателей подходящих под фильтры" 
                : "Нет зарегистрированных преподавателей"}
            </div>
            <p className="text-gray-500">
              {Object.keys(filters).length > 0 || selectedDate || selectedTimeRange 
                ? "Попробуйте изменить фильтры или воспользуйтесь овербукингом"
                : "Попробуйте воспользоваться овербукингом или обратитесь к администратору"}
            </p>
          </div>
        ) : (
          filteredTeachers.map(teacher => {
            const profile = teacher.profile;
            // Получаем слоты этого преподавателя из всех слотов (не только отфильтрованных)
            const allTeacherSlots = timeSlots.filter(slot => slot.teacherId === teacher.id);
            const availableTeacherSlots = allTeacherSlots.filter(slot => !slot.isBooked);
            
            // Для отображения цены используем все слоты преподавателя
            const minPrice = allTeacherSlots.length > 0 ? Math.min(...allTeacherSlots.map(slot => slot.price)) : profile?.hourlyRate || 0;
            const maxPrice = allTeacherSlots.length > 0 ? Math.max(...allTeacherSlots.map(slot => slot.price)) : profile?.hourlyRate || 0;
            
            // Определяем, есть ли доступные слоты у этого преподавателя
            const hasAvailableSlots = availableTeacherSlots.length > 0;
            
            return (
              <div 
                key={teacher.id} 
                className="bg-white rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => handleTeacherClick(teacher)}
              >
                {/* Изображение с градиентной рамкой */}
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-indigo-500 relative">
                    {profile?.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt={teacher.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                        <UserIcon className="h-16 w-16 text-white" />
                      </div>
                    )}
                    
                    {/* Зеленая галочка верификации */}
                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Информация */}
                <div className="p-4">
                  {/* Имя и тег опыта */}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {profile?.name || teacher.name || 'Репетитор'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        <span>
                          {profile?.experience === 'beginner' ? 'Начинающий' : 
                           profile?.experience === 'experienced' ? 'Опытный' : 
                           profile?.experience === 'professional' ? 'Профессионал' : 'Опытный'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">0 лет</span>
                    </div>
                  </div>
                  
                  {/* Кнопка записи */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasAvailableSlots) {
                        const availableSlot = availableTeacherSlots[0];
                        if (availableSlot && user) {
                          setSelectedBookingSlot(availableSlot);
                          setShowBookingModal(true);
                        }
                      } else {
                        handleTeacherClick(teacher);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 mb-4"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Записаться на урок</span>
                  </button>
                  
                  {/* Статистические карточки */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-blue-600">0</div>
                      <div className="text-xs text-blue-600">Проведено уроков</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-green-600">0</div>
                      <div className="text-xs text-green-600">Учеников</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-purple-600">{profile?.rating || 0}</div>
                      <div className="text-xs text-purple-600">Рейтинг</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-orange-600">{minPrice}</div>
                      <div className="text-xs text-orange-600">₽/час</div>
                    </div>
                  </div>
                  
                  {/* Предметы и классы */}
                  <div className="space-y-3">
                    {profile?.subjects && profile.subjects.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold text-gray-900">Предметы</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profile.subjects.slice(0, 3).map((subject: string, index: number) => (
                            <span key={index} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                              {subject}
                            </span>
                          ))}
                          {profile.subjects.length > 3 && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                              +{profile.subjects.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {profile?.grades && profile.grades.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                          </svg>
                          <span className="font-semibold text-gray-900">Классы</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profile.grades.slice(0, 3).map((grade: string, index: number) => (
                            <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                              {grade}
                            </span>
                          ))}
                          {profile.grades.length > 3 && (
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                              +{profile.grades.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
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