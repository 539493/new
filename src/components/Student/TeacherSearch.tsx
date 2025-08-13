import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Star, MapPin, Clock, Users, BookOpen, Heart, MessageCircle, Calendar, X, Sliders } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, TimeSlot } from '../../types';

interface TeacherSearchProps {
  onTeacherSelect: (teacher: User) => void;
  onBookLesson: (slot: TimeSlot) => void;
}

interface SearchFilters {
  subject: string;
  experience: string;
  format: string;
  priceRange: [number, number];
  rating: number;
  city: string;
  availability: string;
}

const TeacherSearch: React.FC<TeacherSearchProps> = ({ onTeacherSelect, onBookLesson }) => {
  const { allUsers, timeSlots } = useData();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    subject: '',
    experience: '',
    format: '',
    priceRange: [0, 5000],
    rating: 0,
    city: '',
    availability: ''
  });
  
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience' | 'name'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Получаем всех преподавателей
  const teachers = useMemo(() => {
    return allUsers.filter(user => user.role === 'teacher');
  }, [allUsers]);

  // Фильтруем и сортируем преподавателей
  const filteredTeachers = useMemo(() => {
    let filtered = teachers.filter(teacher => {
      const profile = teacher.profile as any;
      
      // Поиск по имени или предметам
      if (searchQuery) {
        const matchesName = teacher.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubjects = profile?.subjects?.some((subject: string) => 
          subject.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (!matchesName && !matchesSubjects) return false;
      }

      // Фильтр по предмету
      if (filters.subject && (!profile?.subjects || !profile.subjects.includes(filters.subject))) {
        return false;
      }

      // Фильтр по опыту
      if (filters.experience && profile?.experience !== filters.experience) {
        return false;
      }

      // Фильтр по формату
      if (filters.format && (!profile?.formats || !profile.formats.includes(filters.format))) {
        return false;
      }

      // Фильтр по цене
      const hourlyRate = profile?.hourlyRate || 1000;
      if (hourlyRate < filters.priceRange[0] || hourlyRate > filters.priceRange[1]) {
        return false;
      }

      // Фильтр по рейтингу
      if (filters.rating > 0 && (!profile?.rating || profile.rating < filters.rating)) {
        return false;
      }

      // Фильтр по городу
      if (filters.city && profile?.city && !profile.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }

      return true;
    });

    // Сортируем
    filtered.sort((a, b) => {
      const profileA = a.profile as any;
      const profileB = b.profile as any;
      
      let valueA: any, valueB: any;
      
      switch (sortBy) {
        case 'rating':
          valueA = profileA?.rating || 0;
          valueB = profileB?.rating || 0;
          break;
        case 'price':
          valueA = profileA?.hourlyRate || 1000;
          valueB = profileB?.hourlyRate || 1000;
          break;
        case 'experience':
          const expOrder = { 'beginner': 1, 'experienced': 2, 'professional': 3 };
          valueA = expOrder[profileA?.experience] || 1;
          valueB = expOrder[profileB?.experience] || 1;
          break;
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    return filtered;
  }, [teachers, searchQuery, filters, sortBy, sortOrder]);

  // Получаем доступные слоты для преподавателя
  const getTeacherSlots = (teacherId: string) => {
    return timeSlots.filter(slot => 
      slot.teacherId === teacherId && !slot.isBooked
    );
  };

  // Получаем статистику преподавателя
  const getTeacherStats = (teacher: User) => {
    const profile = teacher.profile as any;
    const slots = getTeacherSlots(teacher.id);
    
    return {
      rating: profile?.rating || 0,
      lessonsCount: profile?.lessonsCount || 0,
      studentsCount: profile?.students?.length || 0,
      availableSlots: slots.length,
      hourlyRate: profile?.hourlyRate || 1000
    };
  };

  // Обработчик изменения фильтров
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Сброс фильтров
  const resetFilters = () => {
    setFilters({
      subject: '',
      experience: '',
      format: '',
      priceRange: [0, 5000],
      rating: 0,
      city: '',
      availability: ''
    });
    setSearchQuery('');
  };

  // Переключение избранного
  const toggleFavorite = (teacherId: string) => {
    setFavorites(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  // Получение иконки для опыта
  const getExperienceIcon = (experience: string) => {
    switch (experience) {
      case 'beginner':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'experienced':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'professional':
        return <div className="w-2 h-2 bg-purple-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  // Получение текста для опыта
  const getExperienceText = (experience: string) => {
    switch (experience) {
      case 'beginner':
        return 'Начинающий';
      case 'experienced':
        return 'Опытный';
      case 'professional':
        return 'Профессионал';
      default:
        return experience;
    }
  };

  return (
    <div className="space-y-6">
      {/* Поиск и фильтры */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Поиск */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по имени или предмету..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Кнопки действий */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-200 hover:scale-105"
            >
              <Sliders className="h-5 w-5" />
              <span>Фильтры</span>
            </button>
            
            <button
              onClick={resetFilters}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-2xl transition-all duration-200 hover:scale-105"
            >
              Сбросить
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
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Все предметы</option>
                  <option value="Математика">Математика</option>
                  <option value="Русский язык">Русский язык</option>
                  <option value="Английский язык">Английский язык</option>
                  <option value="Физика">Физика</option>
                  <option value="Химия">Химия</option>
                  <option value="Биология">Биология</option>
                  <option value="История">История</option>
                  <option value="Литература">Литература</option>
                </select>
              </div>

              {/* Опыт */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Опыт</label>
                <select
                  value={filters.experience}
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
                  value={filters.format}
                  onChange={(e) => handleFilterChange('format', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Любой формат</option>
                  <option value="online">Онлайн</option>
                  <option value="offline">Очно</option>
                  <option value="mini-group">Мини-группа</option>
                </select>
              </div>

              {/* Минимальный рейтинг */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Мин. рейтинг</label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value={0}>Любой</option>
                  <option value={4}>4+ звезды</option>
                  <option value={4.5}>4.5+ звезды</option>
                  <option value={5}>5 звезд</option>
                </select>
              </div>
            </div>

            {/* Дополнительные фильтры */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="Введите город"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Диапазон цен (₽/час)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                    placeholder="От"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                    placeholder="До"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Сортировка</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="rating">По рейтингу</option>
                    <option value="price">По цене</option>
                    <option value="experience">По опыту</option>
                    <option value="name">По имени</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>

            {/* Статистика фильтров */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Найдено: {filteredTeachers.length} преподавателей
              </div>
              
              <div className="text-sm text-gray-500">
                Активных фильтров: {
                  Object.values(filters).filter(v => 
                    v !== '' && v !== 0 && !(Array.isArray(v) && v[0] === 0 && v[1] === 5000)
                  ).length
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Результаты поиска */}
      <div className="space-y-6">
        {filteredTeachers.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Преподаватели не найдены</h3>
            <p className="text-gray-500 mb-6">
              Попробуйте изменить фильтры или поисковый запрос
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-105"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher, index) => {
              const stats = getTeacherStats(teacher);
              const profile = teacher.profile as any;
              const isFavorite = favorites.includes(teacher.id);
              
              return (
                <div
                  key={teacher.id}
                  className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Заголовок карточки */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        {teacher.avatar ? (
                          <img 
                            src={teacher.avatar} 
                            alt={teacher.name} 
                            className="w-full h-full rounded-2xl object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {teacher.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => onTeacherSelect(teacher)}>
                          {teacher.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {getExperienceIcon(profile?.experience)}
                          <span className="text-sm text-gray-600">
                            {getExperienceText(profile?.experience)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleFavorite(teacher.id)}
                      className={`p-2 rounded-2xl transition-all duration-200 hover:scale-110 ${
                        isFavorite 
                          ? 'text-red-500 bg-red-50' 
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Предметы */}
                  {profile?.subjects && profile.subjects.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {profile.subjects.slice(0, 3).map((subject: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                          >
                            {subject}
                          </span>
                        ))}
                        {profile.subjects.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{profile.subjects.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Статистика */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{stats.rating}</div>
                      <div className="text-xs text-gray-600">Рейтинг</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{stats.lessonsCount}</div>
                      <div className="text-xs text-gray-600">Уроков</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{stats.studentsCount}</div>
                      <div className="text-xs text-gray-600">Учеников</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{stats.availableSlots}</div>
                      <div className="text-xs text-gray-600">Свободно</div>
                    </div>
                  </div>

                  {/* Цена */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.hourlyRate} ₽/час
                    </div>
                    
                    {profile?.city && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Действия */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onTeacherSelect(teacher)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Профиль</span>
                    </button>
                    
                    <button
                      onClick={() => onTeacherSelect(teacher)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all duration-200 hover:scale-105"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Записаться</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSearch;


