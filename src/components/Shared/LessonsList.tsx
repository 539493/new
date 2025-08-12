import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, User, BookOpen, Star, Filter, SortAsc, SortDesc, Search, X, Eye, MessageCircle, Video, Phone } from 'lucide-react';
import { Lesson, TimeSlot, User as UserType } from '../../types';

interface LessonsListProps {
  lessons: Lesson[];
  timeSlots?: TimeSlot[];
  userRole: 'student' | 'teacher';
  onLessonClick?: (lesson: Lesson) => void;
  onBookLesson?: (slot: TimeSlot) => void;
  showFilters?: boolean;
  showSearch?: boolean;
}

interface LessonFilters {
  status: string;
  subject: string;
  format: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
  search: string;
}

type SortField = 'date' | 'time' | 'subject' | 'status';
type SortOrder = 'asc' | 'desc';

const LessonsList: React.FC<LessonsListProps> = ({
  lessons,
  timeSlots = [],
  userRole,
  onLessonClick,
  onBookLesson,
  showFilters = true,
  showSearch = true
}) => {
  const [filters, setFilters] = useState<LessonFilters>({
    status: '',
    subject: '',
    format: '',
    dateRange: 'all',
    search: ''
  });
  
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Получаем уникальные значения для фильтров
  const subjects = useMemo(() => {
    const allSubjects = [...new Set([...lessons.map(l => l.subject), ...timeSlots.map(s => s.subject)])];
    return allSubjects.sort();
  }, [lessons, timeSlots]);

  const formats = useMemo(() => {
    const allFormats = [...new Set([...lessons.map(l => l.format), ...timeSlots.map(s => s.format)])];
    return allFormats.sort();
  }, [lessons, timeSlots]);

  // Фильтруем и сортируем уроки
  const filteredAndSortedLessons = useMemo(() => {
    let filtered = [...lessons];

    // Применяем фильтры
    if (filters.status) {
      filtered = filtered.filter(lesson => lesson.status === filters.status);
    }

    if (filters.subject) {
      filtered = filtered.filter(lesson => lesson.subject === filters.subject);
    }

    if (filters.format) {
      filtered = filtered.filter(lesson => lesson.format === filters.format);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(lesson => 
        lesson.subject.toLowerCase().includes(searchLower) ||
        lesson.studentName.toLowerCase().includes(searchLower) ||
        lesson.teacherName.toLowerCase().includes(searchLower)
      );
    }

    // Фильтруем по дате
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(lesson => {
        const lessonDate = new Date(lesson.date);
        
        switch (filters.dateRange) {
          case 'today':
            return lessonDate.getTime() === today.getTime();
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return lessonDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return lessonDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Сортируем
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'time':
          aValue = a.startTime;
          bValue = b.startTime;
          break;
        case 'subject':
          aValue = a.subject.toLowerCase();
          bValue = b.subject.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [lessons, filters, sortField, sortOrder]);

  // Фильтруем временные слоты
  const filteredTimeSlots = useMemo(() => {
    let filtered = [...timeSlots];

    if (filters.subject) {
      filtered = filtered.filter(slot => slot.subject === filters.subject);
    }

    if (filters.format) {
      filtered = filtered.filter(slot => slot.format === filters.format);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(slot => 
        slot.subject.toLowerCase().includes(searchLower) ||
        slot.teacherName.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [timeSlots, filters]);

  const handleFilterChange = (key: keyof LessonFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      subject: '',
      format: '',
      dateRange: 'all',
      search: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Запланирован';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Завтра';
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'short',
        weekday: 'short'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и управление */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {userRole === 'student' ? 'Мои уроки' : 'Уроки со студентами'}
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredAndSortedLessons.length} уроков
            {filteredTimeSlots.length > 0 && ` • ${filteredTimeSlots.length} доступных слотов`}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {showFilters && (
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
            >
              <Filter className="h-4 w-4" />
              <span>Фильтры</span>
            </button>
          )}

          <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => handleSort('date')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                sortField === 'date' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Дата
              {sortField === 'date' && (
                sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1 inline" /> : <SortDesc className="h-3 w-3 ml-1 inline" />
              )}
            </button>
            
            <button
              onClick={() => handleSort('subject')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                sortField === 'subject' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Предмет
              {sortField === 'subject' && (
                sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1 inline" /> : <SortDesc className="h-3 w-3 ml-1 inline" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Панель фильтров */}
      {showFilters && showFiltersPanel && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-slide-in-top">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Поиск */}
            {showSearch && (
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Поиск</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Поиск по предмету или имени..."
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Статус */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Все статусы</option>
                <option value="scheduled">Запланированные</option>
                <option value="completed">Завершенные</option>
                <option value="cancelled">Отмененные</option>
              </select>
            </div>

            {/* Предмет */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Предмет</label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Все предметы</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Формат */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Формат</label>
              <select
                value={filters.format}
                onChange={(e) => handleFilterChange('format', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Все форматы</option>
                {formats.map(format => (
                  <option key={format} value={format}>
                    {format === 'online' ? 'Онлайн' : format === 'offline' ? 'Очно' : 'Мини-группа'}
                  </option>
                ))}
              </select>
            </div>

            {/* Диапазон дат */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Период</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Все время</option>
                <option value="today">Сегодня</option>
                <option value="week">Неделя</option>
                <option value="month">Месяц</option>
              </select>
            </div>
          </div>

          {/* Кнопки управления фильтрами */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              Сбросить фильтры
            </button>
            
            <button
              onClick={() => setShowFiltersPanel(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
            >
              <X className="h-4 w-4 inline mr-2" />
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Список уроков */}
      <div className="space-y-4">
        {filteredAndSortedLessons.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
            <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Уроки не найдены</h3>
            <p className="text-gray-500">
              Попробуйте изменить фильтры или поиск
            </p>
          </div>
        ) : (
          filteredAndSortedLessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Основная информация */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{lesson.subject}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lesson.status)}`}>
                          {getStatusText(lesson.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(lesson.date)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.startTime} - {lesson.endTime}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{lesson.format === 'online' ? 'Онлайн' : 'Очно'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>
                            {userRole === 'student' ? lesson.teacherName : lesson.studentName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Действия */}
                <div className="flex items-center space-x-3">
                  {lesson.status === 'scheduled' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onLessonClick?.(lesson)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
                        title="Просмотреть детали"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      
                      <button
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200"
                        title="Написать сообщение"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </button>
                      
                      {lesson.format === 'online' ? (
                        <button
                          className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-200"
                          title="Присоединиться к уроку"
                        >
                          <Video className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-200"
                          title="Позвонить"
                        >
                          <Phone className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {lesson.price} ₽
                    </div>
                    <div className="text-sm text-gray-500">
                      {lesson.duration} мин
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Доступные слоты (если есть) */}
      {filteredTimeSlots.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Доступные слоты для бронирования
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTimeSlots.slice(0, 6).map((slot) => (
              <div
                key={slot.id}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200 hover:border-emerald-300 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-emerald-900">{slot.subject}</h4>
                  <div className="flex items-center space-x-1">
                    {slot.rating && (
                      <>
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-emerald-700">{slot.rating}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-emerald-700 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(slot.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{slot.teacherName}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-emerald-800">
                    {slot.price} ₽
                  </div>
                  
                  {onBookLesson && (
                    <button
                      onClick={() => onBookLesson(slot)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 hover:scale-105"
                    >
                      Забронировать
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonsList;

