import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Hash, 
  Filter, 
  Calendar, 
  User, 
  Image, 
  Video, 
  FileText,
  TrendingUp,
  Clock,
  Star,
  Bookmark,
  Heart,
  MessageCircle,
  Eye
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { SearchFilters, Post } from '../../types';

interface PostSearchProps {
  onSearchResults?: (results: Post[]) => void;
  onClose?: () => void;
  className?: string;
}

const PostSearch: React.FC<PostSearchProps> = ({ 
  onSearchResults, 
  onClose, 
  className = '' 
}) => {
  const { posts, searchPosts } = useData();
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<'all' | 'text' | 'image' | 'video'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'likes' | 'comments' | 'views'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Получаем уникальные теги из всех постов
  const allTags = Array.from(new Set(
    posts.flatMap(post => post.tags || [])
  )).sort();

  // Получаем уникальных пользователей
  const allUsers = Array.from(new Set(
    posts.map(post => ({ id: post.userId, name: post.userName }))
  )).filter((user, index, self) => 
    index === self.findIndex(u => u.id === user.id)
  );

  // Выполнение поиска
  const performSearch = () => {
    setIsSearching(true);
    
    const filters: SearchFilters = {
      query: query.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      userId: selectedUserId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      type: selectedType === 'all' ? undefined : selectedType,
      limit: 50
    };

    // Локальный поиск для мгновенных результатов
    let results = [...posts];

    // Фильтрация по запросу
    if (filters.query) {
      const searchQuery = filters.query.toLowerCase();
      results = results.filter(post => 
        post.text.toLowerCase().includes(searchQuery) ||
        post.userName.toLowerCase().includes(searchQuery)
      );
    }

    // Фильтрация по тегам
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(post => 
        post.tags && filters.tags!.some(tag => post.tags!.includes(tag))
      );
    }

    // Фильтрация по пользователю
    if (filters.userId) {
      results = results.filter(post => post.userId === filters.userId);
    }

    // Фильтрация по типу
    if (filters.type) {
      results = results.filter(post => post.type === filters.type);
    }

    // Фильтрация по дате
    if (filters.dateFrom) {
      results = results.filter(post => post.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      results = results.filter(post => post.date <= filters.dateTo!);
    }

    // Сортировка
    results.sort((a, b) => {
      switch (sortBy) {
        case 'likes':
          return (b.likes || 0) - (a.likes || 0);
        case 'comments':
          return b.comments.length - a.comments.length;
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'date':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    setSearchResults(results);
    setIsSearching(false);
    
    if (onSearchResults) {
      onSearchResults(results);
    }

    // Отправляем поиск на сервер для получения дополнительных результатов
    searchPosts(filters);
  };

  // Автоматический поиск при изменении параметров
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (query.trim() || selectedTags.length > 0 || selectedUserId || selectedType !== 'all' || dateFrom || dateTo) {
        performSearch();
      } else {
        setSearchResults([]);
        if (onSearchResults) {
          onSearchResults([]);
        }
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, selectedTags, selectedUserId, selectedType, dateFrom, dateTo, sortBy]);

  // Очистка поиска
  const clearSearch = () => {
    setQuery('');
    setSelectedTags([]);
    setSelectedUserId('');
    setSelectedType('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('date');
    setSearchResults([]);
    if (onSearchResults) {
      onSearchResults([]);
    }
  };

  // Переключение тега
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Форматирование времени
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'только что';
    if (diffInHours < 24) return `${diffInHours}ч назад`;
    if (diffInHours < 48) return 'вчера';
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 ${className}`}>
      {/* Заголовок */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Поиск записей</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-full transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Фильтры"
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={clearSearch}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              title="Очистить поиск"
            >
              <X className="w-5 h-5" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                title="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Поисковая строка */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по записям..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* Выбранные фильтры */}
        {(selectedTags.length > 0 || selectedUserId || selectedType !== 'all' || dateFrom || dateTo) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
              >
                <Hash className="w-3 h-3 mr-1" />
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-2 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedUserId && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                <User className="w-3 h-3 mr-1" />
                {allUsers.find(u => u.id === selectedUserId)?.name || selectedUserId}
                <button
                  onClick={() => setSelectedUserId('')}
                  className="ml-2 hover:bg-green-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedType !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
                {selectedType === 'text' && <FileText className="w-3 h-3 mr-1" />}
                {selectedType === 'image' && <Image className="w-3 h-3 mr-1" />}
                {selectedType === 'video' && <Video className="w-3 h-3 mr-1" />}
                {selectedType === 'text' ? 'Текст' : selectedType === 'image' ? 'Изображения' : 'Видео'}
                <button
                  onClick={() => setSelectedType('all')}
                  className="ml-2 hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Фильтры */}
      {showFilters && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Тип контента */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Тип контента</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Все типы</option>
                <option value="text">Только текст</option>
                <option value="image">С изображениями</option>
                <option value="video">С видео</option>
              </select>
            </div>

            {/* Пользователь */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Автор</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Все авторы</option>
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            {/* Сортировка */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Сортировка</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">По дате</option>
                <option value="likes">По лайкам</option>
                <option value="comments">По комментариям</option>
                <option value="views">По просмотрам</option>
              </select>
            </div>

            {/* Дата от */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата от</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Дата до */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата до</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Популярные теги */}
          {allTags.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Популярные теги</label>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Результаты поиска */}
      {searchResults.length > 0 && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">
              Найдено {searchResults.length} записей
            </h4>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {searchResults.map(post => (
              <div
                key={post.id}
                className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  {/* Аватар */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {post.userAvatar ? (
                      <img 
                        src={post.userAvatar} 
                        alt={post.userName} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {post.userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Контент */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">{post.userName}</span>
                      <span className="text-xs text-gray-500">{formatDate(post.date)}</span>
                      {post.type !== 'text' && (
                        <span className="text-xs text-gray-500">
                          {post.type === 'image' ? <Image className="w-3 h-3 inline" /> : <Video className="w-3 h-3 inline" />}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                      {post.text}
                    </p>

                    {/* Теги */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Статистика */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{post.likes || 0}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{post.comments.length}</span>
                      </span>
                      {post.views && (
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.views}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Пустое состояние */}
      {query.trim() && searchResults.length === 0 && !isSearching && (
        <div className="p-8 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">По вашему запросу ничего не найдено</p>
          <p className="text-sm text-gray-400 mt-1">Попробуйте изменить параметры поиска</p>
        </div>
      )}
    </div>
  );
};

export default PostSearch;
