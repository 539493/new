import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Users, MapPin, BookOpen, RefreshCw, Wifi, WifiOff, Heart, MoreHorizontal, Calendar as CalendarIcon, TrendingUp, Award, Clock, User, BookOpen as BookOpenIcon, MessageCircle, BarChart3, Trophy, Lightbulb } from 'lucide-react';

const StudentHome: React.FC = () => {
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLessonsList, setShowLessonsList] = useState(false);

  // Демо-данные
  const demoTimeSlots = [
    {
      id: 'slot_1',
      subject: 'Математика',
      teacherName: 'Анна Петрова',
      teacherAvatar: 'https://via.placeholder.com/40',
      date: '2024-01-15',
      startTime: '14:00',
      endTime: '15:00',
      duration: 60,
      format: 'online',
      price: 1500,
      experience: 'experienced',
      rating: 4.8,
      isBooked: false
    },
    {
      id: 'slot_2',
      subject: 'Физика',
      teacherName: 'Михаил Сидоров',
      teacherAvatar: 'https://via.placeholder.com/40',
      date: '2024-01-16',
      startTime: '16:00',
      endTime: '17:00',
      duration: 60,
      format: 'online',
      price: 1800,
      experience: 'professional',
      rating: 4.9,
      isBooked: false
    }
  ];

  const demoLessons = [
    {
      id: 'lesson_1',
      subject: 'Математика',
      teacherName: 'Елена Козлова',
      date: '2024-01-10',
      startTime: '15:00',
      endTime: '16:00',
      format: 'online',
      status: 'completed',
      price: 1500,
      duration: 60
    }
  ];

  const subjects = ['Математика', 'Русский язык', 'Английский язык', 'Физика', 'Химия', 'Биология', 'История', 'Литература'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'Студент', 'Взрослый'];
  const goals = ['подготовка к экзаменам', 'помощь с домашним заданием', 'углубленное изучение', 'разговорная практика'];
  const experiences = ['beginner', 'experienced', 'professional'];
  const formats = ['online', 'offline', 'mini-group'];
  const durations = [45, 60, 90, 120];

  // Получаем пользователя из localStorage
  const user = JSON.parse(localStorage.getItem('tutoring_currentUser') || '{}');

  // Функция для загрузки доступных слотов
  const loadAvailableSlots = () => {
    console.log('StudentHome: Loading available slots...');
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Обработчик бронирования урока
  const handleBookLesson = (slot: any) => {
    alert(`Урок по предмету "${slot.subject}" забронирован!`);
  };

  // Обработчик изменения фильтров
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setFilters({});
  };

  // Получение статистики
  const getStats = () => {
    return {
      totalSlots: demoTimeSlots.length,
      onlineSlots: demoTimeSlots.filter(s => s.format === 'online').length,
      offlineSlots: demoTimeSlots.filter(s => s.format === 'offline').length,
      averagePrice: Math.round(demoTimeSlots.reduce((sum, s) => sum + s.price, 0) / demoTimeSlots.length)
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Заголовок и приветствие */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Добро пожаловать, {user?.name || 'Ученик'}! 👋
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Найдите идеального преподавателя для достижения ваших целей
        </p>
        
        {/* Статус соединения */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700">
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Приложение готово к работе</span>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowLessonsList(!showLessonsList)}
            className="flex items-center space-x-3 p-4 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-100 transition-all duration-200 hover:scale-105"
          >
            <BookOpen className="h-6 w-6" />
            <span className="font-medium">Мои уроки</span>
          </button>
          
          <button
            className="flex items-center space-x-3 p-4 bg-green-50 text-green-700 rounded-2xl hover:bg-green-100 transition-all duration-200 hover:scale-105"
          >
            <Users className="h-6 w-6" />
            <span className="font-medium">Найти преподавателя</span>
          </button>
          
          <button
            className="flex items-center space-x-3 p-4 bg-purple-50 text-purple-700 rounded-2xl hover:bg-purple-100 transition-all duration-200 hover:scale-105"
          >
            <CalendarIcon className="h-6 w-6" />
            <span className="font-medium">Расписание</span>
          </button>
        </div>
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
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
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
                  onChange={(e) => handleFilterChange('grade', e.target.value)}
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
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
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
                  onChange={(e) => handleFilterChange('format', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Любой формат</option>
                  <option value="online">Онлайн</option>
                  <option value="offline">Очно</option>
                  <option value="mini-group">Мини-группа</option>
                </select>
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
                Найдено: {demoTimeSlots.length} уроков
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Список уроков */}
      {showLessonsList && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 animate-slide-in-top">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Мои уроки</h2>
          
          {/* Запланированные уроки */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Запланированные уроки</h3>
            {demoLessons.filter(l => l.status === 'scheduled').length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-2">Нет запланированных уроков</p>
                <p className="text-gray-500 text-sm">Забронируйте урок на главной странице</p>
              </div>
            ) : (
              <div className="space-y-4">
                {demoLessons.filter(l => l.status === 'scheduled').map(lesson => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{lesson.subject}</h4>
                        <p className="text-sm text-gray-600">{lesson.teacherName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{lesson.date} {lesson.startTime}</p>
                      <p className="text-sm text-gray-600">{lesson.format === 'online' ? 'Онлайн' : 'Очно'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Завершенные уроки */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Завершенные уроки</h3>
            {demoLessons.filter(l => l.status === 'completed').length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-2">Нет завершенных уроков</p>
                <p className="text-gray-500 text-sm">Ваши завершенные уроки будут отображаться здесь</p>
              </div>
            ) : (
              <div className="space-y-4">
                {demoLessons.filter(l => l.status === 'completed').map(lesson => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{lesson.subject}</h4>
                        <p className="text-sm text-gray-600">{lesson.teacherName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{lesson.date} {lesson.startTime}</p>
                      <p className="text-sm text-gray-600">{lesson.format === 'online' ? 'Онлайн' : 'Очно'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Результаты поиска */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Доступные уроки ({demoTimeSlots.length})
          </h2>
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoTimeSlots.map((slot, index) => (
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
                    <CalendarIcon className="h-4 w-4" />
                    <span>{slot.date} {slot.startTime} - {slot.endTime}</span>
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
    </div>
  );
};

export default StudentHome;