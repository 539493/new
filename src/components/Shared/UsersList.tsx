import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  Users, 
  Star, 
  MapPin, 
  MessageCircle, 
  Eye,
  BookOpen,
  Calendar,
  Award,
  TrendingUp,
  Hash,
  FileText,
  Heart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User as UserType } from '../../types';
import UserProfile from './UserProfile';

interface UsersListProps {
  title?: string;
  showTeachers?: boolean;
  showStudents?: boolean;
  onUserSelect?: (user: UserType) => void;
  className?: string;
}

const UsersList: React.FC<UsersListProps> = ({ 
  title = "Пользователи",
  showTeachers = true,
  showStudents = true,
  onUserSelect,
  className = ''
}) => {
  const { user: currentUser } = useAuth();
  const { allUsers, posts } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'teacher' | 'student'>('all');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'posts' | 'rating' | 'recent'>('name');

  // Фильтрация пользователей
  const filteredUsers = allUsers.filter(user => {
    // Исключаем текущего пользователя
    if (user.id === currentUser?.id) return false;

    // Фильтр по роли
    if (selectedRole === 'teacher' && user.role !== 'teacher') return false;
    if (selectedRole === 'student' && user.role !== 'student') return false;

    // Фильтр по поиску
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = user.name?.toLowerCase().includes(query);
      const nicknameMatch = user.nickname?.toLowerCase().includes(query);
      const bioMatch = user.profile?.bio?.toLowerCase().includes(query);
      const subjectsMatch = user.profile?.subjects?.some(subject => 
        subject.toLowerCase().includes(query)
      );
      
      if (!nameMatch && !nicknameMatch && !bioMatch && !subjectsMatch) {
        return false;
      }
    }

    return true;
  });

  // Сортировка пользователей
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'posts':
        const aPosts = posts.filter(post => post.userId === a.id).length;
        const bPosts = posts.filter(post => post.userId === b.id).length;
        return bPosts - aPosts;
      case 'rating':
        const aRating = a.profile?.rating || 0;
        const bRating = b.profile?.rating || 0;
        return bRating - aRating;
      case 'recent':
        const aPosts2 = posts.filter(post => post.userId === a.id);
        const bPosts2 = posts.filter(post => post.userId === b.id);
        const aLatest = aPosts2.length > 0 ? new Date(aPosts2[0].date).getTime() : 0;
        const bLatest = bPosts2.length > 0 ? new Date(bPosts2[0].date).getTime() : 0;
        return bLatest - aLatest;
      case 'name':
      default:
        return (a.name || '').localeCompare(b.name || '');
    }
  });

  const handleUserClick = (user: UserType) => {
    if (onUserSelect) {
      onUserSelect(user);
    } else {
      setSelectedUser(user);
    }
  };

  const getExperienceLabel = (exp: string) => {
    switch (exp) {
      case 'beginner': return 'Начинающий';
      case 'experienced': return 'Опытный';
      case 'professional': return 'Профессионал';
      default: return exp;
    }
  };

  const getPostsCount = (userId: string) => {
    return posts.filter(post => post.userId === userId).length;
  };

  const getLatestPost = (userId: string) => {
    const userPosts = posts.filter(post => post.userId === userId);
    if (userPosts.length === 0) return null;
    return userPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

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
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {sortedUsers.length} пользователей
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск пользователей..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Все роли</option>
              {showTeachers && <option value="teacher">Преподаватели</option>}
              {showStudents && <option value="student">Ученики</option>}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">По имени</option>
              <option value="posts">По количеству записей</option>
              <option value="rating">По рейтингу</option>
              <option value="recent">По активности</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="p-6">
        {sortedUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Пользователи не найдены</h3>
            <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedUsers.map(user => {
              const postsCount = getPostsCount(user.id);
              const latestPost = getLatestPost(user.id);
              const isTeacher = user.role === 'teacher';

              return (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                >
                  {/* User Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.profile?.avatar && user.profile.avatar.trim() !== '' ? (
                        <img 
                          src={user.profile.avatar} 
                          alt={user.name} 
                          className="w-16 h-16 object-cover rounded-full"
                        />
                      ) : (
                        <User className="h-8 w-8 text-white" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isTeacher 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {isTeacher ? 'Преподаватель' : 'Ученик'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">@{user.nickname}</p>
                      
                      {/* Teacher-specific info */}
                      {isTeacher && user.profile && (
                        <div className="flex items-center space-x-2 mt-2">
                          {user.profile.experience && (
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <Award className="w-3 h-3" />
                              <span>{getExperienceLabel(user.profile.experience)}</span>
                            </div>
                          )}
                          {user.profile.rating && (
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span>{user.profile.rating}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {user.profile?.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {user.profile.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>{postsCount} записей</span>
                      </span>
                      {user.profile?.city && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{user.profile.city}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Latest Post Preview */}
                  {latestPost && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        {latestPost.text}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(latestPost.date)}</span>
                        <div className="flex items-center space-x-2">
                          {latestPost.likes && latestPost.likes > 0 && (
                            <span className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{latestPost.likes}</span>
                            </span>
                          )}
                          {latestPost.comments.length > 0 && (
                            <span className="flex items-center space-x-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{latestPost.comments.length}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      <Eye className="w-4 h-4" />
                      <span>Профиль</span>
                    </button>
                    {isTeacher && (
                      <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        <BookOpen className="w-4 h-4" />
                        <span>Уроки</span>
                      </button>
                    )}
                    <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      <MessageCircle className="w-4 h-4" />
                      <span>Чат</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfile
          userId={selectedUser.id}
          onClose={() => setSelectedUser(null)}
          onMessage={(userId) => {
            // Здесь можно добавить логику для открытия чата
            console.log('Open chat with user:', userId);
            setSelectedUser(null);
          }}
          onBookLesson={(teacherId) => {
            // Здесь можно добавить логику для записи на урок
            console.log('Book lesson with teacher:', teacherId);
            setSelectedUser(null);
          }}
          isModal={true}
        />
      )}
    </div>
  );
};

export default UsersList;
