import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Clock, Star, Users, MapPin, BookOpen, RefreshCw, Wifi, WifiOff, Heart, MoreHorizontal } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, startOfHour, isSameDay, isSameHour, setHours, setMinutes, isWithinInterval } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { User as UserIcon, Star as StarIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { FilterOptions, TimeSlot } from '../../types';
import { io, Socket } from 'socket.io-client';
import { SERVER_URL, WEBSOCKET_URL } from '../../config';

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
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingTeacher, setBookingTeacher] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [teacherAvailableSlots, setTeacherAvailableSlots] = useState<any[]>([]);
  const [selectedBookingSlot, setSelectedBookingSlot] = useState<any>(null);
  const [bookingComment, setBookingComment] = useState('');

  // Новые состояния для календаря в фильтрах
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{ start: string; end: string } | null>(null);

  const subjects = ['Математика', 'Русский язык', 'Английский язык'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'Студент', 'Взрослый'];
  const goals = ['подготовка к экзаменам', 'помощь с домашним заданием', 'углубленное изучение', 'разговорная практика'];
  const experiences = ['beginner', 'experienced', 'professional'];
  const lessonTypes = ['trial', 'regular'];
  const durations = [45, 60];
  const formats = ['online', 'offline', 'mini-group'];

  const locales = { 'ru': ru };
  const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

  const { allUsers } = useData();
  const [serverTeachers, setServerTeachers] = useState<any[]>([]);

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
    console.log('Clearing filters and hiding all slots');
    setFilters({});
    setSelectedDate(null);
    setSelectedTimeRange(null);
    setFilteredSlots([]);
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

  const handleBookLesson = (slotId: string) => {
    if (user) {
      console.log('Booking lesson:', slotId, 'for user:', user.name);
      bookLesson(slotId, user.id, user.name);
      
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

  // Собираем уникальных преподавателей с доступными слотами
  const teachersWithSlots: { id: string; name: string; avatar?: string; rating?: number; profile?: any }[] = Array.from(
    filteredSlots.reduce((acc: Map<string, { id: string; name: string; avatar?: string; rating?: number; profile?: any }>, slot: any) => {
      if (!acc.has(slot.teacherId)) {
        acc.set(slot.teacherId, {
          id: slot.teacherId,
          name: slot.teacherName,
          avatar: slot.teacherAvatar,
          rating: slot.rating,
          profile: getTeacherProfileById(slot.teacherId)
        });
      }
      return acc;
    }, new Map()).values()
  );

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

  React.useEffect(() => {
    console.log('DEBUG: timeSlots у ученика', timeSlots);
  }, [timeSlots]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teachersWithSlots.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-lg mb-2">Нет доступных преподавателей</div>
            <p className="text-gray-500">Попробуйте изменить фильтры или воспользуйтесь овербукингом</p>
          </div>
        ) : (
          teachersWithSlots.map(teacher => {
            const profile = teacher.profile;
            const teacherSlots = filteredSlots.filter(slot => slot.teacherId === teacher.id);
            const minPrice = Math.min(...teacherSlots.map(slot => slot.price));
            const maxPrice = Math.max(...teacherSlots.map(slot => slot.price));
            
            return (
              <div key={teacher.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
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
                      <UserIcon className="h-16 w-16 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Информация */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                      {profile?.name || teacher.name || 'Репетитор'}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {profile?.subjects?.slice(0, 3).join(', ')}...
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      от {minPrice} ₽ за услугу
                    </span>
                    {profile?.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600">{profile.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    {profile?.city || 'Онлайн'}
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedTeacher(getUserById(teacher.id));
                      setShowTeacherModal(true);
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Записаться
                  </button>
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

      {/* Модальное окно для назначения урока */}
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
    </div>
  );
};

export default StudentHome;