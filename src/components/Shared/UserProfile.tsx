import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Star, 
  MapPin, 
  Clock, 
  BookOpen, 
  MessageCircle, 
  Phone, 
  Mail, 
  ArrowLeft, 
  Heart, 
  Share2, 
  Calendar, 
  X, 
  Users,
  Award,
  TrendingUp,
  Bookmark,
  Filter,
  Eye,
  ThumbsUp,
  Smile,
  Send,
  Play,
  Image as ImageIcon,
  Video,
  FileText,
  Edit,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User, Post } from '../../types';
import PostsFeed from './PostsFeed';

interface UserProfileProps {
  userId: string;
  onClose?: () => void;
  onMessage?: (userId: string) => void;
  onBookLesson?: (teacherId: string) => void;
  isModal?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  userId, 
  onClose, 
  onMessage, 
  onBookLesson,
  isModal = false 
}) => {
  const { user: currentUser } = useAuth();
  const { posts, createPost, addReaction, addComment, sharePost, bookmarkPost, editPost, deletePost, allUsers } = useData();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'lessons' | 'reviews'>('posts');

  // Получаем данные пользователя
  const user = allUsers.find(u => u.id === userId);
  const isOwnProfile = currentUser?.id === userId;
  const isTeacher = user?.role === 'teacher';

  // Получаем посты пользователя
  const userPosts = posts.filter(post => post.userId === userId);

  // Получаем профиль пользователя
  const profile = user?.profile;

  const getExperienceLabel = (exp: string) => {
    switch (exp) {
      case 'beginner': return 'Начинающий';
      case 'experienced': return 'Опытный';
      case 'professional': return 'Профессионал';
      default: return exp;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'online': return 'Онлайн';
      case 'offline': return 'Оффлайн';
      case 'mini-group': return 'Мини-группа';
      default: return format;
    }
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

  if (!user) {
  return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-12 h-12 text-gray-400" />
              </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Пользователь не найден</h3>
          <p className="text-gray-500">Пользователь с таким ID не существует</p>
            </div>
          </div>
    );
  }

  const ProfileContent = () => (
    <div className={`${isModal ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' : ''}`}>
      <div className={`bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto relative ${isModal ? '' : 'border border-gray-200'}`}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              {!isOwnProfile && (
                <>
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-2 rounded-full transition-colors ${
                      isBookmarked ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-blue-500'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-full transition-colors ${
                      isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                </>
              )}
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              {isOwnProfile && (
                <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Header - Hero Section */}
          <div className="relative mb-8">
            {/* Cover Image with Gradient Overlay */}
            <div className="h-56 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl relative overflow-hidden">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              {/* Profile Info on Cover */}
              <div className="absolute bottom-6 left-8 right-8">
                <div className="flex items-end justify-between">
                  {/* Left Side - Name and Experience */}
                  <div className="text-white flex-1 mr-8">
                    <h1 className="text-4xl font-bold mb-3 leading-tight">
                      {profile?.name || user.name || 'Пользователь'}
                    </h1>
                    <div className="flex items-center space-x-4 flex-wrap">
                      {isTeacher && profile?.experience && (
                        <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
                          <Award className="h-4 w-4 text-yellow-300" />
                          <span className="font-semibold text-xs">{getExperienceLabel(profile.experience)}</span>
                        </div>
                      )}
                      {profile?.rating && (
                        <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
                          <Star className="h-4 w-4 text-yellow-300 fill-current" />
                          <span className="font-semibold text-xs">{profile.rating}</span>
                        </div>
                      )}
                      {profile?.city && (
                        <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
                          <MapPin className="h-4 w-4" />
                          <span className="font-semibold text-xs">{profile.city}</span>
                        </div>
                      )}
        </div>
      </div>

                  {/* Right Side - Quick Stats */}
                  <div className="text-right text-white/90 flex-shrink-0">
                    <div className="text-2xl font-bold mb-1">{userPosts.length}</div>
                    <div className="text-sm opacity-80">записей</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Avatar and Quick Actions */}
            <div className="flex flex-col lg:flex-row gap-8 items-start mt-8">
              {/* Avatar - Floating above cover */}
              <div className="flex-shrink-0 -mt-12 ml-8 relative">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden border-6 border-white shadow-2xl relative">
                  {/* Online Status */}
                  <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 border-3 border-white rounded-full shadow-lg"></div>
                  
                  {profile?.avatar && profile.avatar.trim() !== '' ? (
                    <img 
                      src={profile.avatar} 
                      alt={user.name} 
                      className="w-36 h-36 object-cover rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-36 h-36 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center ${profile?.avatar && profile.avatar.trim() !== '' ? 'hidden' : ''}`}>
                    <UserIcon className="h-20 w-20 text-white" />
                  </div>
          </div>

                {/* Floating Action Buttons */}
                {!isOwnProfile && (
                  <div className="absolute -bottom-2 -right-2 flex space-x-2">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                        isLiked 
                          ? 'bg-red-500 text-white scale-110' 
                          : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white text-gray-600 hover:bg-gray-50 shadow-lg transition-all duration-200 flex items-center justify-center">
                      <Share2 className="w-5 h-5" />
                    </button>
            </div>
                )}
          </div>

              {/* Quick Actions */}
              <div className="flex-1 flex flex-wrap gap-4 mt-12 lg:mt-0">
                {!isOwnProfile && (
                  <>
                    {isTeacher && onBookLesson && (
                      <button
                        onClick={() => onBookLesson(user.id)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <BookOpen className="h-6 w-6" />
                        <span className="text-lg">Записаться на урок</span>
                      </button>
                    )}
                    {onMessage && (
                      <button
                        onClick={() => onMessage(user.id)}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <MessageCircle className="h-6 w-6" />
                        <span className="text-lg">Написать сообщение</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowContactInfo(!showContactInfo)}
                      className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center space-x-2 transform hover:-translate-y-1"
                    >
                      <Eye className="h-6 w-6" />
                      <span className="text-lg">Контактная информация</span>
                    </button>
                  </>
                )}
                {isOwnProfile && (
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <Edit className="h-6 w-6" />
                    <span className="text-lg">Редактировать профиль</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info Banner */}
          {showContactInfo && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 mt-8 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Контактная информация</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200">
                    <Phone className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700 font-medium">{user.phone}</span>
                  </div>
                )}
                {user.email && (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700 font-medium">{user.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 mt-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-3 text-center shadow-md">
              <div className="text-xl font-bold mb-1">{userPosts.length}</div>
              <div className="text-blue-100 text-xs">Записей</div>
            </div>
            {isTeacher && (
              <>
                <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg p-3 text-center shadow-md">
                  <div className="text-xl font-bold mb-1">{profile?.lessonsCount || 0}</div>
                  <div className="text-green-100 text-xs">Проведено уроков</div>
            </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg p-3 text-center shadow-md">
                  <div className="text-xl font-bold mb-1">{profile?.students?.length || 0}</div>
                  <div className="text-purple-100 text-xs">Учеников</div>
            </div>
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-lg p-3 text-center shadow-md">
                  <div className="text-xl font-bold mb-1">{profile?.rating || 0}</div>
                  <div className="text-orange-100 text-xs">Рейтинг</div>
          </div>
              </>
            )}
            {!isTeacher && (
              <>
                <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg p-3 text-center shadow-md">
                  <div className="text-xl font-bold mb-1">0</div>
                  <div className="text-green-100 text-xs">Посещено уроков</div>
        </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg p-3 text-center shadow-md">
                  <div className="text-xl font-bold mb-1">0</div>
                  <div className="text-purple-100 text-xs">Преподавателей</div>
                </div>
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-lg p-3 text-center shadow-md">
                  <div className="text-xl font-bold mb-1">0</div>
                  <div className="text-orange-100 text-xs">Дней в системе</div>
                </div>
              </>
              )}
            </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-8 mt-8">
            <nav className="flex space-x-8">
              {[
                { id: 'posts', label: 'Записи', count: userPosts.length },
                { id: 'about', label: 'О пользователе', count: null },
                { id: 'lessons', label: isTeacher ? 'Расписание' : 'Мои уроки', count: 0 },
                { id: 'reviews', label: 'Отзывы', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {/* Posts Tab */}
            {activeTab === 'posts' && (
          <div className="space-y-6">
                <PostsFeed
                  posts={userPosts}
                  currentUserId={currentUser?.id || ''}
                  currentUserName={currentUser?.name || ''}
                  currentUserAvatar={currentUser?.avatar}
                  onCreatePost={createPost}
                  onReaction={addReaction}
                  onComment={addComment}
                  onShare={sharePost}
                  onBookmark={bookmarkPost}
                  onEdit={editPost}
                  onDelete={deletePost}
                  showCreateButton={isOwnProfile} // Только автор может создавать записи
                  title={`Записи ${profile?.name || user.name}`}
                  showSearch={true}
                  showNotifications={false}
                  showTrending={false}
                  showBookmarks={true}
                />
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-3">
                {/* Bio */}
                {profile?.bio && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-2.5 shadow-sm">
                    <h3 className="text-sm font-bold text-indigo-900 mb-1.5 flex items-center">
                      <div className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center mr-1.5">
                        <div className="w-2 h-2 bg-white rounded-sm"></div>
                      </div>
                      О пользователе
                </h3>
                    <div className="bg-white/60 backdrop-blur-sm rounded-md p-2 border border-indigo-200/50">
                      <p className="text-indigo-800 leading-relaxed whitespace-pre-line text-xs">
                        {profile.bio}
                      </p>
                    </div>
                  </div>
                )}

                {/* Teacher-specific info */}
                {isTeacher && (
                  <>
                    {/* Subjects and Grades */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {profile?.subjects && profile.subjects.length > 0 && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2.5 shadow-sm">
                          <h3 className="text-sm font-bold text-blue-900 mb-1.5 flex items-center">
                            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center mr-1.5">
                              <div className="w-2 h-2 bg-white rounded-sm"></div>
                            </div>
                            Предметы
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {profile.subjects.map((subject: string, index: number) => (
                            <span
                              key={index}
                                className="bg-white/80 backdrop-blur-sm text-blue-800 px-2 py-0.5 rounded-md text-xs font-medium border border-blue-200/50 shadow-sm"
                            >
                              {subject}
                            </span>
                          ))}
                          </div>
                        </div>
                      )}

                      {profile?.grades && profile.grades.length > 0 && (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-2.5 shadow-sm">
                          <h3 className="text-sm font-bold text-emerald-900 mb-1.5 flex items-center">
                            <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center mr-1.5">
                              <div className="w-2 h-2 bg-white rounded-sm"></div>
                            </div>
                            Классы
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {profile.grades.map((grade: string, index: number) => (
                              <span
                                key={index}
                                className="bg-white/80 backdrop-blur-sm text-emerald-800 px-2 py-0.5 rounded-md text-xs font-medium border border-emerald-200/50 shadow-sm"
                              >
                                {grade}
                              </span>
                            ))}
                          </div>
                    </div>
                      )}
                    </div>

                    {/* Teaching Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {profile?.hourlyRate && (
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-2.5 text-center shadow-sm">
                          <h3 className="text-sm font-bold text-purple-900 mb-1.5 flex items-center justify-center">
                            <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded flex items-center justify-center mr-1.5">
                              <div className="w-2 h-2 bg-white rounded-sm"></div>
                            </div>
                            Стоимость
                          </h3>
                          <div className="text-base font-bold text-purple-700 bg-white/60 backdrop-blur-sm rounded-md py-1 px-1.5 border border-purple-200/50">
                            {profile.hourlyRate} ₽/час
                          </div>
                    </div>
                  )}

                      {profile?.formats && profile.formats.length > 0 && (
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-2.5 shadow-sm">
                          <h3 className="text-sm font-bold text-orange-900 mb-1.5 flex items-center">
                            <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded flex items-center justify-center mr-1.5">
                              <div className="w-2 h-2 bg-white rounded-sm"></div>
                </div>
                            Форматы
                </h3>
                          <div className="space-y-1">
                            {profile.formats.map((format: string, index: number) => (
                              <div key={index} className="flex items-center space-x-1.5 p-1 bg-white/60 backdrop-blur-sm rounded border border-orange-200/50">
                                <Clock className="h-3 w-3 text-orange-600" />
                                <span className="text-orange-800 text-xs font-medium">{getFormatLabel(format)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {profile?.durations && profile.durations.length > 0 && (
                        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-2.5 shadow-sm">
                          <h3 className="text-sm font-bold text-cyan-900 mb-1.5 flex items-center">
                            <div className="w-4 h-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center mr-1.5">
                              <div className="w-2 h-2 bg-white rounded-sm"></div>
                            </div>
                            Длительность
                          </h3>
                          <div className="space-y-1">
                            {profile.durations.map((duration: number, index: number) => (
                              <div key={index} className="flex items-center space-x-1.5 p-1 bg-white/60 backdrop-blur-sm rounded border border-cyan-200/50">
                                <Clock className="h-3 w-3 text-cyan-600" />
                                <span className="text-cyan-800 text-xs font-medium">{duration} минут</span>
                            </div>
                          ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Student-specific info */}
                {!isTeacher && profile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {profile.subjects && profile.subjects.length > 0 && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2.5 shadow-sm">
                        <h3 className="text-sm font-bold text-blue-900 mb-1.5 flex items-center">
                          <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center mr-1.5">
                            <div className="w-2 h-2 bg-white rounded-sm"></div>
                          </div>
                          Интересуется предметами
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {profile.subjects.map((subject: string, index: number) => (
                            <span
                              key={index}
                              className="bg-white/80 backdrop-blur-sm text-blue-800 px-2 py-0.5 rounded-md text-xs font-medium border border-blue-200/50 shadow-sm"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                    </div>
                  )}

                    {profile.grade && (
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-2.5 shadow-sm">
                        <h3 className="text-sm font-bold text-emerald-900 mb-1.5 flex items-center">
                          <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center mr-1.5">
                            <div className="w-2 h-2 bg-white rounded-sm"></div>
                          </div>
                          Класс
                        </h3>
                        <div className="bg-white/80 backdrop-blur-sm text-emerald-800 px-2 py-1 rounded-md text-xs font-medium border border-emerald-200/50 shadow-sm">
                          {profile.grade}
                        </div>
                      </div>
                      )}
                    </div>
                  )}
                </div>
            )}

            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-12 h-12 text-gray-400" />
          </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {isTeacher ? 'Расписание пока не настроено' : 'Уроки пока не запланированы'}
            </h3>
                <p className="text-gray-500">
                  {isTeacher ? 'Настройте расписание для проведения уроков' : 'Запишитесь на уроки к преподавателям'}
                </p>
                    </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Пока нет отзывов</h3>
                <p className="text-gray-500">Отзывы о пользователе появятся здесь</p>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return isModal ? <ProfileContent /> : <ProfileContent />;
};

export default UserProfile;
















