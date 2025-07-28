import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Clock, Star, Users, MapPin, BookOpen, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, startOfHour, isSameDay, isSameHour, setHours, setMinutes, isWithinInterval } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { User as UserIcon, Star as StarIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { FilterOptions, TimeSlot } from '../../types';
import { io, Socket } from 'socket.io-client';

const StudentHome: React.FC = () => {
  const { getFilteredSlots, bookLesson, timeSlots, isConnected } = useData();
  const { user } = useAuth();
  
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  // filteredSlots изначально пустой
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
    date: '', // добавляем дату
    startTime: '',
    comment: '',
  });
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingTeacher, setBookingTeacher] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [teacherAvailableSlots, setTeacherAvailableSlots] = useState<any[]>([]);
  const [selectedBookingSlot, setSelectedBookingSlot] = useState<any>(null);
  const [bookingComment, setBookingComment] = useState('');

  const subjects = ['Математика', 'Русский язык', 'Английский язык'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'Студент', 'Взрослый'];
  const goals = ['подготовка к экзаменам', 'помощь с домашним заданием', 'углубленное изучение', 'разговорная практика'];
  const experiences = ['beginner', 'experienced', 'professional'];
  const lessonTypes = ['trial', 'regular'];
  const durations = [45, 60];
  const formats = ['online', 'offline', 'mini-group'];

  const locales = { 'ru': ru };
  const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const days = weekDays.map((d, idx) => ({
    label: format(d, 'EE', { locale: ru }),
    date: format(d, 'd MMM.', { locale: ru })
  }));
  const handlePrevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const handleNextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const weekRange = `${format(weekDays[0], 'd MMMM', { locale: ru })} — ${format(weekDays[6], 'd MMMM', { locale: ru })}`;

  // Для скролла по времени:
  const [scrollHour, setScrollHour] = useState(0); // индекс первого видимого часа (0-16)
  const visibleHours = Array.from({ length: 8 }, (_, i) => scrollHour + i); // 8 видимых часов
  const maxScroll = 24 - 8;

  const calendarScrollRef = useRef<HTMLDivElement>(null);

  const { allUsers } = useData();
  const [serverTeachers, setServerTeachers] = useState<any[]>([]);

  // Загружаем преподавателей с сервера при монтировании
  useEffect(() => {
    fetch('http://localhost:3001/api/teachers')
      .then(res => res.json())
      .then(data => setServerTeachers(Array.isArray(data) ? data : []))
      .catch(() => setServerTeachers([]));
  }, []);

  const socket = React.useRef<Socket | null>(null);
  React.useEffect(() => {
    if (!socket.current) {
      socket.current = io('http://localhost:3001');
    }
  }, []);

  // Функция для загрузки всех доступных слотов
  const loadAvailableSlots = () => {
    console.log('StudentHome: Loading available slots...');
    console.log('StudentHome: Total timeSlots in context:', timeSlots.length);
    
    // Показываем только свободные слоты (не забронированные)
    const availableSlots = timeSlots.filter(slot => !slot.isBooked);
    
    console.log('StudentHome: Available slots to display:', availableSlots.length);
    setFilteredSlots(availableSlots);
    
    return availableSlots;
  };

  // Убираю автоматическую загрузку всех слотов при монтировании и изменении timeSlots
  // useEffect(() => {
  //   console.log('StudentHome: useEffect triggered, timeSlots.length:', timeSlots.length);
  //   loadAvailableSlots();
  // }, [timeSlots]);

  // Автоскролл к текущему часу при монтировании
  useEffect(() => {
    if (calendarScrollRef.current) {
      const now = new Date();
      const hour = now.getHours();
      calendarScrollRef.current.scrollTop = hour * 48; // h-12 = 48px
    }
  }, []);
  // Функции для прокрутки вверх/вниз
  const scrollCalendarBy = (delta: number) => {
    setScrollHour((prev) => {
      let next = prev + delta;
      if (next < 0) next = 0;
      if (next > maxScroll) next = maxScroll;
      return next;
    });
    if (calendarScrollRef.current) {
      calendarScrollRef.current.scrollTop = 0;
    }
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    setLoading(true);
    
    try {
      const results = getFilteredSlots(filters);
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
    console.log('Clearing filters and hiding all slots');
    setFilters({});
    setFilteredSlots([]);
    setShowFilters(false);
  };

  const refreshSlots = () => {
    console.log('Refreshing slots manually');
    setLoading(true);
    
    setTimeout(() => {
      if (Object.keys(filters).length === 0) {
        loadAvailableSlots();
      } else {
        applyFilters();
      }
      setLoading(false);
    }, 500);
  };

  const handleBookLesson = (slotId: string) => {
    if (user) {
      console.log('Booking lesson:', slotId, 'for user:', user.name);
      bookLesson(slotId, user.id, user.name);
      
      // Обновляем список слотов после бронирования
      setTimeout(() => {
        if (Object.keys(filters).length === 0) {
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

  // Собираем уникальных преподавателей с доступными слотами
  const teachersWithSlots: { id: string; name: string; avatar?: string; rating?: number }[] = Array.from(
    filteredSlots.reduce((acc: Map<string, { id: string; name: string; avatar?: string; rating?: number }>, slot: any) => {
      if (!acc.has(slot.teacherId)) {
        acc.set(slot.teacherId, {
          id: slot.teacherId,
          name: slot.teacherName,
          avatar: slot.teacherAvatar,
          rating: slot.rating
        });
      }
      return acc;
    }, new Map()).values()
  );
  console.log('DEBUG teachersWithSlots:', teachersWithSlots);
  console.log('DEBUG serverTeachers:', serverTeachers);
  // События для календаря (только свободные слоты)
  const slotEvents = filteredSlots.map(slot => ({
    id: slot.id,
    title: `${slot.subject} - ${slot.teacherName}`,
    start: new Date(`${slot.date}T${slot.startTime}`),
    end: new Date(`${slot.date}T${slot.endTime}`),
    resource: slot,
    type: 'slot',
    teacherName: slot.teacherName,
    subject: slot.subject,
    price: slot.price,
    format: slot.format,
    lessonType: slot.lessonType,
    experience: slot.experience,
    rating: slot.rating
  }));
  const filteredEvents = selectedTeacherId
    ? slotEvents.filter(e => e.resource.teacherId === selectedTeacherId)
    : slotEvents;
  const eventStyleGetter = (event: any) => ({
    style: {
      borderRadius: '8px',
      border: 'none',
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: '500',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      backgroundColor: '#3b82f6',
      color: 'white',
      transition: 'all 0.2s ease',
    }
  });

  // Фильтруем события для текущей недели
  const weekSlots = Object.keys(filters).length === 0
    ? []
    : filteredSlots.filter(slot => {
    const slotDate = new Date(`${slot.date}T${slot.startTime}`);
    return isWithinInterval(slotDate, { start: weekDays[0], end: weekDays[6] });
  });

  const [modalSlot, setModalSlot] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherPosts, setTeacherPosts] = useState<any[]>([]);
  const [selectedTime, setSelectedTime] = useState<{ date: string; hour: number } | null>(null);

  function getTeacherProfileById(teacherId: string) {
    const teacher = serverTeachers.find(t => t.id === teacherId) ||
      allUsers?.find((u: any) => u.id === teacherId && u.role === 'teacher');
    const profile = teacher && teacher.profile ? teacher.profile : null;
    console.log('DEBUG getTeacherProfileById:', teacherId, profile);
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

  // Фильтрация преподавателей по выбранному времени
  const filteredTeachers = React.useMemo(() => {
    if (!selectedTime) return teachersWithSlots;
    // Найти всех преподавателей, у которых есть слот на выбранные дату и час
    return teachersWithSlots.filter(teacher =>
      filteredSlots.some(slot =>
        slot.teacherId === teacher.id &&
        slot.date === selectedTime.date &&
        Number(slot.startTime.split(':')[0]) === selectedTime.hour
      )
    );
  }, [teachersWithSlots, filteredSlots, selectedTime]);

  // Автоматическое обновление filteredSlots при изменении timeSlots, если фильтры уже применены
  React.useEffect(() => {
    if (Object.keys(filters).length > 0) {
      applyFilters();
    }
    // eslint-disable-next-line
  }, [timeSlots]);

  React.useEffect(() => {
    console.log('DEBUG: timeSlots у ученика', timeSlots);
  }, [timeSlots]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Найти преподавателя</h1>
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
          {Object.keys(filters).length > 0 && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          </div>
        )}
      </div>

      {/* Available Slots */}
      {/* УДАЛЁН блок с карточками слотов (grid с кнопкой 'Забронировать') */}

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

      {/* Календарь-сетка с вертикальным скроллом на 8 клеток и репетиторы справа */}
      <div className="mb-4 flex items-center gap-4">
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
          onClick={handlePrevWeek}
        >
          ← Пред. неделя
        </button>
        <span className="font-bold text-lg">{weekRange}</span>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
          onClick={handleNextWeek}
        >
          След. неделя →
        </button>
      </div>
      <div className="flex flex-row items-start">
        {/* Календарь (единый скролл) */}
        <div className="flex-1 flex">
          {/* Вся таблица в одном скролле */}
          <div className="flex flex-col w-full">
            {/* Заголовки дней */}
            <div className="flex sticky top-0 z-10 bg-white">
              <div className="w-16 h-10 flex items-center justify-center">
                {/* Кнопки прокрутки */}
                <button
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 mb-1"
                  onClick={() => scrollCalendarBy(-1)}
                  title="Прокрутить вверх на 1 час"
                  type="button"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 mt-1"
                  onClick={() => scrollCalendarBy(1)}
                  title="Прокрутить вниз на 1 час"
                  type="button"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M17 10l-5 5-5-5" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              {days.map((day) => (
                <div
                  className="flex-1 h-10 flex items-center justify-center border-b border-l border-gray-200 bg-gray-50 font-semibold text-sm text-gray-900"
                  key={day.label}
                >
                  {day.label}, {day.date}
                </div>
              ))}
            </div>
            {/* Время + сетка */}
            <div className="flex w-full overflow-y-hidden h-[384px]" ref={calendarScrollRef}>
              {/* Время слева */}
              <div className="flex flex-col w-16 flex-shrink-0">
                {visibleHours.map((hour) => (
                  <div
                    className="h-12 flex items-center justify-center text-xs text-gray-700 border-b border-gray-200 bg-white"
                    key={hour}
                  >
                    {hour}:00
                  </div>
                ))}
              </div>
              {/* Сетка дней */}
              <div className="flex-1 flex">
                {days.map((day, dayIdx) => (
                  <div className="flex-1 flex flex-col min-w-[90px]" key={day.label}>
                    {visibleHours.map((hourIdx) => {
                      const cellSlots = weekSlots.filter(s => {
                        const slotDate = new Date(`${s.date}T${s.startTime}`);
                        return slotDate.getDay() === (weekDays[dayIdx].getDay()) && slotDate.getHours() === hourIdx;
                      });
                      const isSelected = selectedTime &&
                        format(weekDays[dayIdx], 'yyyy-MM-dd') === selectedTime.date &&
                        hourIdx === selectedTime.hour;
                      return (
                        <div
                          className={`h-12 border-b border-l border-gray-200 flex items-center justify-center transition cursor-pointer ${cellSlots.length ? (isSelected ? 'bg-blue-600' : 'bg-blue-400 hover:bg-blue-500') : 'bg-white cursor-default'}`}
                          key={day.label + '-' + hourIdx}
                          onClick={() => {
                            if (cellSlots.length) {
                              setSelectedTime({ date: format(weekDays[dayIdx], 'yyyy-MM-dd'), hour: hourIdx });
                            }
                          }}
                        >
                          {/* Просто синяя ячейка, без текста */}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Преподаватели справа */}
        <div className="md:w-80 w-full md:sticky md:top-8 flex-shrink-0 ml-8">
          <div className="font-bold text-xl mb-4">Репетиторы</div>
          <div className="scrollable-teachers flex flex-col gap-4" style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredTeachers.length === 0 && (
              <div className="text-gray-400 text-sm flex items-center gap-2"><UserIcon className="w-4 h-4" />Нет свободных преподавателей</div>
            )}
            {filteredTeachers.map(teacher => {
              const profile = getTeacherProfileById(teacher.id) as import('../../types').TeacherProfile | null;
              // Найти слот этого преподавателя на выбранное время
              const slotForSelectedTime = selectedTime
                ? timeSlots.find(slot =>
                    slot.teacherId === teacher.id &&
                    !slot.isBooked &&
                    slot.date === selectedTime.date &&
                    Number(slot.startTime.split(':')[0]) === selectedTime.hour
                  )
                : null;
              return (
                <div key={teacher.id} className="bg-white rounded-xl border border-gray-200 shadow p-4 flex gap-4 items-start cursor-pointer hover:bg-gray-50 transition" onClick={() => { setSelectedTeacher(getUserById(teacher.id)); setShowTeacherModal(true); }}>
                  <img src={profile?.avatar || teacher.avatar || '/default-avatar.png'} alt={teacher.name} className="w-16 h-16 rounded-lg object-cover border" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg mb-1">{(profile as any)?.name || teacher.name || '—'}</div>
                    {profile ? (
                      <>
                        <div className="text-xs text-gray-500 mb-1">Email: {(profile as any)?.email || '—'}</div>
                        <div className="text-xs text-gray-500 mb-1">Страна: {(profile as any)?.country || '—'}</div>
                        <div className="text-xs text-gray-500 mb-1">Город: {(profile as any)?.city || '—'}</div>
                        <div className="text-xs text-gray-500 mb-1">Опыт: {getExperienceLabel((profile as any)?.experience)}</div>
                        <div className="text-xs text-gray-500 mb-1">Рейтинг: {(profile as any)?.rating ?? '—'}</div>
                        <div className="text-xs text-gray-500 mb-1">Цена за час: {(profile as any)?.hourlyRate ? (profile as any)?.hourlyRate + '₽' : '—'}</div>
                        <div className="text-xs text-gray-500 mb-1">Предметы: {(profile as any)?.subjects?.join(', ') || '—'}</div>
                        <div className="text-xs text-gray-500 mb-1">Классы: {(profile as any)?.grades?.join(', ') || '—'}</div>
                        <div className="text-xs text-gray-500 mb-2">О себе: {(profile as any)?.bio || '—'}</div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 mb-2">Нет подробной информации</div>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {slotForSelectedTime && (
                        <button className="border border-blue-500 text-blue-600 rounded px-3 py-1 text-xs hover:bg-blue-50 transition" onClick={e => {
                          e.stopPropagation();
                          setSelectedBookingSlot(slotForSelectedTime);
                          setBookingTeacher(teacher);
                          setShowBookingModal(true);
                        }}>Назначить урок</button>
                      )}
                      <button className="border border-gray-300 rounded px-3 py-1 text-xs hover:bg-gray-50 transition">Показать слоты</button>
                      <button className="border border-gray-300 rounded px-3 py-1 text-xs hover:bg-gray-50 transition">Скрыть слоты</button>
                      <button className="border border-gray-300 rounded px-3 py-1 text-xs hover:bg-gray-50 transition">К списку занятий</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {selectedTime && (
            <button className="mt-2 mb-4 px-4 py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 transition" onClick={() => setSelectedTime(null)}>
              Показать всех преподавателей
            </button>
          )}
        </div>
      </div>

      {/* Модалка */}
      {modalSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-xs w-full">
            <div className="font-bold text-lg mb-2">Выбор времени</div>
            <div className="mb-1">Время: {modalSlot.startTime} - {modalSlot.endTime}</div>
            <button
              className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              onClick={async () => {
                if (!user) return;
                setIsBooking(true);
                await bookLesson(modalSlot.id, user.id, user.name);
                setIsBooking(false);
                setModalSlot(null);
              }}
            >
              {isBooking ? 'Выбираем...' : 'Выбрать время'}
            </button>
            <button
              className="mt-2 w-full bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
              onClick={() => setModalSlot(null)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно с полной страницей преподавателя: */}
      {showTeacherModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={() => setShowTeacherModal(false)} title="Закрыть">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Новый красивый блок профиля преподавателя с карточками и иконками */}
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
            {/* Карточки профиля преподавателя */}
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
            {/* Блок записей преподавателя */}
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
      {/* Модальное окно для назначения урока: */}
      {showBookingModal && bookingTeacher && selectedBookingSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={() => { setShowBookingModal(false); setBookingComment(''); setSelectedBookingSlot(null); }} title="Закрыть">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4">Назначить урок у {bookingTeacher.name}</h2>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="mb-1 font-semibold">Детали урока:</div>
              <div><b>Предмет:</b> {selectedBookingSlot.subject}</div>
              <div><b>Дата:</b> {selectedBookingSlot.date}</div>
              <div><b>Время:</b> {selectedBookingSlot.startTime}–{selectedBookingSlot.endTime}</div>
              <div><b>Класс:</b> {selectedBookingSlot.grades?.join(', ') || '—'}</div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий к уроку</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                rows={2}
                placeholder="Например: хочу разобрать домашнее задание или подготовиться к контрольной..."
                value={bookingComment}
                onChange={e => setBookingComment(e.target.value)}
              />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded mt-4 disabled:opacity-50" onClick={async () => {
              if (!selectedBookingSlot || !user) return;
              setIsBooking(true);
              await bookLesson(selectedBookingSlot.id, user.id, user.name);
              setIsBooking(false);
              setShowBookingModal(false);
              setSelectedBookingSlot(null);
              setBookingComment('');
            }}>{isBooking ? 'Бронирование...' : 'Забронировать выбранное время'}</button>
          </div>
        </div>
      )}
      {/* В самом низу компонента StudentHome: */}
      {/* Удаляю отладочный блок DEBUG: Все timeSlots у ученика */}
    </div>
  );
};

export default StudentHome;