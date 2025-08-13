import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Users, MapPin, BookOpen, RefreshCw, Wifi, WifiOff, Heart, MoreHorizontal, Calendar as CalendarIcon, TrendingUp, Award, Clock, User, BookOpen as BookOpenIcon, MessageCircle, BarChart3, Trophy, Lightbulb } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { FilterOptions, TimeSlot, User as UserType } from '../../types';
import TeacherProfilePage from './TeacherProfilePage';
import StudentCalendar from './StudentCalendar';
import BookingModal from '../Shared/BookingModal';
import TeacherSearch from './TeacherSearch';
import Analytics from '../Shared/Analytics';
import LessonsList from '../Shared/LessonsList';
import UserProfile from '../Shared/UserProfile';
import Achievements from '../Shared/Achievements';
import Recommendations from '../Shared/Recommendations';
import QuickActions from '../Shared/QuickActions';

const StudentHome: React.FC = () => {
  // Безопасное получение данных из контекстов
  let dataContext = null;
  let authContext = null;
  
  try {
    dataContext = useData();
  } catch (error) {
    console.warn('DataContext not available yet');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }
  
  try {
    authContext = useAuth();
  } catch (error) {
    console.warn('AuthContext not available yet');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка авторизации...</p>
        </div>
      </div>
    );
  }

  const { getFilteredSlots, bookLesson, timeSlots, lessons, isConnected } = dataContext;
  const { user } = authContext;
  
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{ start: string; end: string } | null>(null);
  const [showTeacherSearch, setShowTeacherSearch] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<UserType | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showLessonsList, setShowLessonsList] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const subjects = ['Математика', 'Русский язык', 'Английский язык', 'Физика', 'Химия', 'Биология', 'История', 'Литература'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'Студент', 'Взрослый'];
  const goals = ['подготовка к экзаменам', 'помощь с домашним заданием', 'углубленное изучение', 'разговорная практика'];
  const experiences = ['beginner', 'experienced', 'professional'];
  const formats = ['online', 'offline', 'mini-group'];
  const durations = [45, 60, 90, 120];

  const { allUsers } = dataContext;
  const [serverTeachers, setServerTeachers] = useState<UserType[]>([]);

  // Загружаем преподавателей с сервера при монтировании
  useEffect(() => {
    // В реальном приложении здесь был бы API вызов
    setServerTeachers(allUsers.filter(u => u.role === 'teacher'));
  }, [allUsers]);

  // Функция для загрузки всех доступных слотов
  const loadAvailableSlots = () => {
    console.log('StudentHome: Loading available slots...');
    setLoading(true);
    
    setTimeout(() => {
      const filtered = getFilteredSlots(filters);
      setFilteredSlots(filtered);
      setLoading(false);
    }, 500);
  };

  // Применяем фильтры при их изменении
  useEffect(() => {
    loadAvailableSlots();
  }, [filters]);

  // Обработчик бронирования урока
  const handleBookLesson = (slot: TimeSlot) => {
    setSelectedBookingSlot(slot);
    setShowBookingModal(true);
  };

  // Обработчик подтверждения бронирования
  const handleConfirmBooking = async (comment: string) => {
    if (user && selectedBookingSlot) {
      try {
        await bookLesson(selectedBookingSlot.id, user.id, user.name, comment);
        setShowBookingModal(false);
        setSelectedBookingSlot(null);
        // Перезагружаем слоты
        loadAvailableSlots();
      } catch (error) {
        console.error('Error booking lesson:', error);
      }
    }
  };

  // Обработчик изменения фильтров
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setFilters({});
    setSelectedDate(null);
    setSelectedTimeRange(null);
  };

  // Обработчик выбора преподавателя
  const handleTeacherSelect = (teacher: UserType) => {
    setSelectedTeacher(teacher);
    setShowTeacherSearch(false);
  };

  // Обработчик бронирования урока у конкретного преподавателя
  const handleBookLessonWithTeacher = (slot: TimeSlot) => {
    setSelectedBookingSlot(slot);
    setShowBookingModal(true);
  };

  // Получение статистики
  const getStats = () => {
    const totalSlots = filteredSlots.length;
    const onlineSlots = filteredSlots.filter(s => s.format === 'online').length;
    const offlineSlots = filteredSlots.filter(s => s.format === 'offline').length;
    const averagePrice = totalSlots > 0 
      ? Math.round(filteredSlots.reduce((sum, s) => sum + s.price, 0) / totalSlots)
      : 0;

    return { totalSlots, onlineSlots, offlineSlots, averagePrice };
  };

  const stats = getStats();

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Заголовок и приветствие */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Добро пожаловать, {user?.name}! 👋
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Найдите идеального преподавателя для достижения ваших целей
        </p>
        
        {/* Статус соединения */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700">
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Подключено к серверу</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Работаем офлайн</span>
            </>
          )}
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.totalSlots}</div>
              <div className="text-blue-100">Доступных уроков</div>
            </div>
            <BookOpen className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.onlineSlots}</div>
              <div className="text-green-100">Онлайн уроков</div>
            </div>
            <Wifi className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.offlineSlots}</div>
              <div className="text-purple-100">Очных уроков</div>
            </div>
            <MapPin className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.averagePrice}₽</div>
              <div className="text-orange-100">Средняя цена</div>
            </div>
            <TrendingUp className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <QuickActions
          userRole="student"
          onAction={(action) => {
            switch (action) {
              case 'book-lesson':
                setShowTeacherSearch(true);
                break;
              case 'find-teacher':
                setShowTeacherSearch(true);
                break;
              case 'schedule':
                setShowLessonsList(true);
                break;
              case 'messages':
                // TODO: Открыть чаты
                console.log('Open messages');
                break;
              case 'goals':
                setShowProfile(true);
                break;
              case 'progress':
                setShowAnalytics(true);
                break;
              default:
                console.log('Action:', action);
            }
          }}
        />
      </div>

      {/* Поиск и фильтры */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Поиск */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по предмету или преподавателю..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Кнопки действий */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="flex items-center space-x-2 px-4 py-3 bg-teal-100 text-teal-700 rounded-2xl hover:bg-teal-200 transition-all duration-200 hover:scale-105"
            >
              <Lightbulb className="h-5 w-5" />
              <span>{showRecommendations ? 'Скрыть рекомендации' : 'Рекомендации'}</span>
            </button>
            
            <button
              onClick={() => setShowAchievements(!showAchievements)}
              className="flex items-center space-x-2 px-4 py-3 bg-yellow-100 text-yellow-700 rounded-2xl hover:bg-yellow-200 transition-all duration-200 hover:scale-105"
            >
              <Trophy className="h-5 w-5" />
              <span>{showAchievements ? 'Скрыть достижения' : 'Достижения'}</span>
            </button>
            
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 px-4 py-3 bg-rose-100 text-rose-700 rounded-2xl hover:bg-rose-200 transition-all duration-200 hover:scale-105"
            >
              <User className="h-5 w-5" />
              <span>{showProfile ? 'Скрыть профиль' : 'Профиль'}</span>
            </button>
            
            <button
              onClick={() => setShowLessonsList(!showLessonsList)}
              className="flex items-center space-x-2 px-4 py-3 bg-indigo-100 text-indigo-700 rounded-2xl hover:bg-indigo-200 transition-all duration-200 hover:scale-105"
            >
              <BookOpen className="h-5 w-5" />
              <span>{showLessonsList ? 'Скрыть уроки' : 'Мои уроки'}</span>
            </button>
            
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-2 px-4 py-3 bg-emerald-100 text-emerald-700 rounded-2xl hover:bg-emerald-200 transition-all duration-200 hover:scale-105"
            >
              <BarChart3 className="h-5 w-5" />
              <span>{showAnalytics ? 'Скрыть аналитику' : 'Аналитика'}</span>
            </button>
            
            <button
              onClick={() => setShowTeacherSearch(!showTeacherSearch)}
              className="flex items-center space-x-2 px-4 py-3 bg-purple-100 text-purple-700 rounded-2xl hover:bg-purple-200 transition-all duration-200 hover:scale-105"
            >
              <Users className="h-5 w-5" />
              <span>{showTeacherSearch ? 'Скрыть поиск' : 'Найти преподавателя'}</span>
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-200 hover:scale-105"
            >
              <Filter className="h-5 w-5" />
              <span>Фильтры</span>
            </button>
            
            <button
              onClick={loadAvailableSlots}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-200 hover:scale-105"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Загрузка...' : 'Обновить'}</span>
            </button>
          </div>
        </div>

        {/* Расширенные фильтры */}
        {showFilters && (
          <div className="mt-6 p-6 bg-gray-50 rounded-2xl space-y-6 animate-slide-in-top">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Предмет */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Предмет</label>
                <select
                  value={filters.subject || ''}
                  onChange={(e) => handleFilterChange('subject', e.target.value || undefined)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Все предметы</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Класс */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Класс</label>
                <select
                  value={filters.grade || ''}
                  onChange={(e) => handleFilterChange('grade', e.target.value || undefined)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Все классы</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              {/* Опыт */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Опыт</label>
                <select
                  value={filters.experience || ''}
                  onChange={(e) => handleFilterChange('experience', e.target.value || undefined)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Любой опыт</option>
                  <option value="beginner">Начинающий</option>
                  <option value="experienced">Опытный</option>
                  <option value="professional">Профессионал</option>
                </select>
              </div>

              {/* Формат */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Формат</label>
                <select
                  value={filters.format || ''}
                  onChange={(e) => handleFilterChange('format', e.target.value || undefined)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Любой формат</option>
                  <option value="online">Онлайн</option>
                  <option value="offline">Очно</option>
                  <option value="mini-group">Мини-группа</option>
                </select>
              </div>
            </div>

            {/* Дополнительные фильтры */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Длительность (мин)</label>
                <select
                  value={filters.duration || ''}
                  onChange={(e) => handleFilterChange('duration', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Любая</option>
                  {durations.map(duration => (
                    <option key={duration} value={duration}>{duration}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Минимальный рейтинг</label>
                <select
                  value={filters.minRating || ''}
                  onChange={(e) => handleFilterChange('minRating', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Любой</option>
                  <option value="4">4+ звезды</option>
                  <option value="4.5">4.5+ звезды</option>
                  <option value="5">5 звезд</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
                <input
                  type="text"
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                  placeholder="Введите город"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Кнопки управления фильтрами */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                Сбросить фильтры
              </button>
              
              <div className="text-sm text-gray-500">
                Найдено: {filteredSlots.length} уроков
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Рекомендации */}
      {showRecommendations && user && (
        <div className="animate-slide-in-top">
          <Recommendations
            userId={user.id}
            userRole="student"
            timeSlots={timeSlots}
            lessons={lessons}
            allUsers={allUsers}
          />
        </div>
      )}

      {/* Достижения */}
      {showAchievements && user && (
        <div className="animate-slide-in-top">
          <Achievements
            userId={user.id}
            achievements={[
              {
                id: '1',
                title: 'Первый урок',
                description: 'Завершите свой первый урок',
                icon: '🎯',
                category: 'academic',
                points: 50,
                isUnlocked: true,
                unlockedAt: new Date().toISOString(),
                userId: user.id
              },
              {
                id: '2',
                title: 'Неделя обучения',
                description: 'Занимайтесь 7 дней подряд',
                icon: '🔥',
                category: 'participation',
                points: 100,
                isUnlocked: false,
                userId: user.id
              },
              {
                id: '3',
                title: 'Отличник',
                description: 'Получите 5 звезд за урок',
                icon: '⭐',
                category: 'excellence',
                points: 200,
                isUnlocked: false,
                userId: user.id
              }
            ]}
            currentLevel={2}
            currentPoints={150}
            totalPoints={150}
            streak={3}
            rank={25}
          />
        </div>
      )}

      {/* Профиль пользователя */}
      {showProfile && user && (
        <div className="animate-slide-in-top">
          <UserProfile
            user={user}
            isEditable={true}
            onProfileUpdate={async (updatedProfile) => {
              // TODO: Обновление профиля через API
              console.log('Profile updated:', updatedProfile);
            }}
          />
        </div>
      )}

      {/* Список уроков */}
      {showLessonsList && user && (
        <div className="animate-slide-in-top">
          <LessonsList
            lessons={lessons.filter(l => l.studentId === user.id)}
            timeSlots={timeSlots.filter(s => !s.isBooked)}
            userRole="student"
            onLessonClick={(lesson) => console.log('Lesson clicked:', lesson)}
            onBookLesson={handleBookLesson}
          />
        </div>
      )}

      {/* Аналитика */}
      {showAnalytics && user && (
        <div className="animate-slide-in-top">
          <Analytics userId={user.id} userRole="student" />
        </div>
      )}

      {/* Поиск преподавателей */}
      {showTeacherSearch && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 animate-slide-in-top">
          <TeacherSearch
            onTeacherSelect={handleTeacherSelect}
            onBookLesson={handleBookLessonWithTeacher}
          />
        </div>
      )}

      {/* Результаты поиска */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Доступные уроки ({filteredSlots.length})
          </h2>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-2xl hover:bg-purple-200 transition-all duration-200 hover:scale-105"
            >
              <CalendarIcon className="h-5 w-5" />
              <span>{showCalendar ? 'Список' : 'Календарь'}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded-2xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Уроки не найдены</h3>
            <p className="text-gray-500 mb-6">
              Попробуйте изменить фильтры или загрузить больше уроков
            </p>
            <button
              onClick={loadAvailableSlots}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-105"
            >
              Обновить поиск
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSlots.map((slot, index) => (
              <div
                key={slot.id}
                className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Заголовок карточки */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{slot.subject}</h3>
                      <p className="text-sm text-gray-600">{slot.teacherName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {slot.rating && (
                      <>
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700">{slot.rating}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Детали урока */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{slot.format === 'online' ? 'Онлайн' : 'Очно'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{slot.experience === 'beginner' ? 'Начинающий' : 
                           slot.experience === 'experienced' ? 'Опытный' : 'Профессионал'}</span>
                  </div>
                </div>

                {/* Цена и кнопка */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">
                    {slot.price} ₽
                  </div>
                  
                  <button
                    onClick={() => handleBookLesson(slot)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    Забронировать
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно бронирования */}
      {showBookingModal && selectedBookingSlot && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onConfirm={handleConfirmBooking}
          slot={selectedBookingSlot}
          teacher={{ name: selectedBookingSlot.teacherName, avatar: selectedBookingSlot.teacherAvatar }}
          student={user}
        />
      )}
    </div>
  );
};

export default StudentHome;