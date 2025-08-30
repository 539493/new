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
  VideoIcon,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { TeacherProfile, TimeSlot } from '../../types';
import BookingModal from '../Shared/BookingModal';

interface TeacherProfilePageProps {
  teacher: any;
  onClose: () => void;
  onBookLesson: (teacherId: string) => void;
  onMessage?: (teacherId: string) => void;
}

const TeacherProfilePage: React.FC<TeacherProfilePageProps> = ({ teacher, onClose, onBookLesson, onMessage }) => {
  const { user } = useAuth();
  const { timeSlots, bookLesson, posts, createPost, addReaction, addComment, sharePost, bookmarkPost, editPost, deletePost } = useData();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showSlots, setShowSlots] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'slots' | 'reviews'>('about');
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  // Получаем слоты этого преподавателя
  const teacherSlots = timeSlots.filter(slot => slot.teacherId === teacher.id);
  const availableSlots = teacherSlots.filter(slot => !slot.isBooked);
  const bookedSlots = teacherSlots.filter(slot => slot.isBooked);

  const profile = teacher.profile as TeacherProfile;

  // Получаем посты преподавателя
  const teacherPosts = posts.filter(post => post.userId === teacher.id);

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

  const handleBookSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (comment: string) => {
    if (user && selectedSlot) {
      bookLesson(selectedSlot.id, user.id, user.name, comment);
      setShowBookingModal(false);
      setSelectedSlot(null);
    }
  };

  const formatDate = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPostDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'только что';
    if (diffInHours < 24) return `${diffInHours}ч назад`;
    if (diffInHours < 48) return 'вчера';
    return date.toLocaleDateString('ru-RU');
  };

  const handleReaction = (postId: string, reactionType: string) => {
    // Здесь можно добавить логику для обработки реакций
  };

  const handleComment = (postId: string) => {
    const comment = newComment[postId];
    if (comment && comment.trim()) {
      // Здесь можно добавить логику для добавления комментария
      setNewComment({ ...newComment, [postId]: '' });
    }
  };

  const handleShare = (postId: string) => {
    // Здесь можно добавить логику для шаринга
  };

  const handleBookmark = (postId: string) => {
    // Здесь можно добавить логику для закладок
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
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
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
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
                      {profile?.name || teacher.name || 'Репетитор'}
                    </h1>
                    <div className="flex items-center space-x-4 flex-wrap">
                      {profile?.experience && (
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
                    <div className="text-2xl font-bold mb-1">{profile?.lessonsCount || 0}</div>
                    <div className="text-sm opacity-80">уроков</div>
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
                  
                  {/* Avatar Image with Error Handling */}
                  {profile?.avatar && profile.avatar.trim() !== '' && profile.avatar !== 'undefined' && profile.avatar !== 'null' ? (
                    <img 
                      src={profile.avatar} 
                      alt={profile?.name || teacher.name || 'Репетитор'} 
                      className="w-36 h-36 object-cover rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.classList.remove('hidden');
                        }
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.classList.add('hidden');
                        }
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback Avatar */}
                  <div className={`w-36 h-36 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center ${profile?.avatar && profile.avatar.trim() !== '' && profile.avatar !== 'undefined' && profile.avatar !== 'null' ? 'hidden' : ''}`}>
                    <div className="text-center">
                      <UserIcon className="h-16 w-16 text-white mb-2" />
                      <div className="text-white text-sm font-semibold">
                        {(profile?.name || teacher.name || 'Репетитор').charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Action Buttons */}
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
              </div>

              {/* Quick Actions */}
              <div className="flex-1 flex flex-wrap gap-4 mt-12 lg:mt-0">
                <button
                  onClick={() => onBookLesson(teacher.id)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <BookOpen className="h-6 w-6" />
                  <span className="text-lg">Записаться на урок</span>
                </button>
                {onMessage && (
                  <button
                    onClick={() => onMessage(teacher.id)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-lg">Написать сообщение</span>
                  </button>
                )}
                <button
                  onClick={() => setShowSlots(!showSlots)}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center space-x-2 transform hover:-translate-y-1"
                >
                  <Calendar className="h-6 w-6" />
                  <span className="text-lg">Слоты ({availableSlots.length})</span>
                </button>
                <button
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center space-x-2 transform hover:-translate-y-1"
                >
                  <Eye className="h-6 w-6" />
                  <span className="text-lg">Контактная информация</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Info Banner */}
          {showContactInfo && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 mt-8 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Контактная информация</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacher.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200">
                    <Phone className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700 font-medium">{teacher.phone}</span>
                  </div>
                )}
                {teacher.email && (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700 font-medium">{teacher.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 mt-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-3 text-center shadow-md">
              <div className="text-xl font-bold mb-1">{profile?.lessonsCount || 0}</div>
              <div className="text-blue-100 text-xs">Проведено уроков</div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-3 text-center shadow-md">
              <div className="text-xl font-bold mb-1">{profile?.students?.length || 0}</div>
              <div className="text-blue-100 text-xs">Учеников</div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-3 text-center shadow-md">
              <div className="text-xl font-bold mb-1">{profile?.rating || 0}</div>
              <div className="text-blue-100 text-xs">Рейтинг</div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-3 text-center shadow-md">
              <div className="text-xl font-bold mb-1">{availableSlots.length}</div>
              <div className="text-blue-100 text-xs">Свободных слотов</div>
            </div>
          </div>

          {/* Teacher Posts Section */}
          {teacherPosts.length > 0 && (
            <div className="mb-8 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Записи {profile?.name || teacher.name}
                  <span className="ml-2 bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-sm">
                    {teacherPosts.length}
                  </span>
                </h3>
              </div>
              
              <div className="space-y-4">
                {teacherPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {(profile?.name || teacher.name).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900">{profile?.name || teacher.name}</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(post.date).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="text-gray-700 mb-3 whitespace-pre-line">
                          {post.text.length > 200 
                            ? `${post.text.substring(0, 200)}...` 
                            : post.text
                          }
                        </div>
                        
                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-gray-500 text-xs">
                                +{post.tags.length - 3} еще
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Post Stats */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes || post.reactions.length}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments.length}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.views || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {teacherPosts.length > 3 && (
                  <div className="text-center">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Показать все записи ({teacherPosts.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-8 mt-8">
            <nav className="flex space-x-8">
              {[
                { id: 'about', label: 'О преподавателе', count: null },
                { id: 'slots', label: 'Расписание', count: availableSlots.length },
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
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                {/* Основная информация о репетиторе */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center mr-3">
                      <div className="w-3 h-3 bg-white rounded-sm"></div>
                    </div>
                    Основная информация
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Имя и опыт */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="text-sm text-gray-600">Имя</div>
                          <div className="font-semibold text-gray-900">{profile?.name || teacher.name || 'Репетитор'}</div>
                        </div>
                      </div>
                      
                      {profile?.experience && (
                        <div className="flex items-center space-x-3">
                          <Award className="w-5 h-5 text-yellow-600" />
                          <div>
                            <div className="text-sm text-gray-600">Опыт</div>
                            <div className="font-semibold text-gray-900">{getExperienceLabel(profile.experience)}</div>
                          </div>
                        </div>
                      )}
                      
                      {profile?.experienceYears && (
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="text-sm text-gray-600">Лет преподавания</div>
                            <div className="font-semibold text-gray-900">{profile.experienceYears}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Рейтинг и уроки */}
                    <div className="space-y-3">
                      {profile?.rating && (
                        <div className="flex items-center space-x-3">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          <div>
                            <div className="text-sm text-gray-600">Рейтинг</div>
                            <div className="font-semibold text-gray-900">{profile.rating}/5</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="text-sm text-gray-600">Проведено уроков</div>
                          <div className="font-semibold text-gray-900">{profile?.lessonsCount || 0}</div>
                        </div>
                      </div>
                      
                      {profile?.hourlyRate && (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 text-green-600 font-bold text-lg">₽</div>
                          <div>
                            <div className="text-sm text-gray-600">Стоимость урока</div>
                            <div className="font-semibold text-gray-900">{profile.hourlyRate} ₽/час</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Предметы и классы */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile?.subjects && profile.subjects.length > 0 && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded flex items-center justify-center mr-3">
                          <div className="w-3 h-3 bg-white rounded-sm"></div>
                        </div>
                        Предметы
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.subjects.map((subject: string, index: number) => (
                          <span
                            key={index}
                            className="bg-white/80 backdrop-blur-sm text-green-800 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-200/50 shadow-sm"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profile?.grades && profile.grades.length > 0 && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded flex items-center justify-center mr-3">
                          <div className="w-3 h-3 bg-white rounded-sm"></div>
                        </div>
                        Классы
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.grades.map((grade: string, index: number) => (
                          <span
                            key={index}
                            className="bg-white/80 backdrop-blur-sm text-purple-800 px-3 py-1.5 rounded-lg text-sm font-medium border border-purple-200/50 shadow-sm"
                          >
                            {grade}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Образование */}
                {profile?.education && (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded flex items-center justify-center mr-3">
                        <div className="w-3 h-3 bg-white rounded-sm"></div>
                      </div>
                      Образование
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.education.university && (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 text-orange-600 font-bold text-lg">🎓</div>
                          <div>
                            <div className="text-sm text-gray-600">Университет</div>
                            <div className="font-semibold text-gray-900">{profile.education.university}</div>
                          </div>
                        </div>
                      )}
                      
                      {profile.education.degree && (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 text-orange-600 font-bold text-lg">📜</div>
                          <div>
                            <div className="text-sm text-gray-600">Степень</div>
                            <div className="font-semibold text-gray-900">{profile.education.degree}</div>
                          </div>
                        </div>
                      )}
                      
                      {profile.education.graduationYear && (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 text-orange-600 font-bold text-lg">📅</div>
                          <div>
                            <div className="text-sm text-gray-600">Год выпуска</div>
                            <div className="font-semibold text-gray-900">{profile.education.graduationYear}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Биография */}
                {profile?.bio && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center mr-3">
                        <div className="w-3 h-3 bg-white rounded-sm"></div>
                      </div>
                      О преподавателе
                    </h3>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-indigo-200/50">
                      <p className="text-indigo-800 leading-relaxed whitespace-pre-line">
                        {profile.bio}
                      </p>
                    </div>
                  </div>
                )}

                {/* Форматы обучения */}
                {profile?.formats && profile.formats.length > 0 && (
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-teal-900 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded flex items-center justify-center mr-3">
                        <div className="w-3 h-3 bg-white rounded-sm"></div>
                      </div>
                      Форматы обучения
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.formats.map((format: string, index: number) => (
                        <span
                          key={index}
                          className="bg-white/80 backdrop-blur-sm text-teal-800 px-3 py-1.5 rounded-lg text-sm font-medium border border-teal-200/50 shadow-sm"
                        >
                          {getFormatLabel(format)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Slots Tab */}
            {activeTab === 'slots' && (
              <div className="space-y-6">
                {/* Available Slots */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Доступные слоты</h3>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableSlots.map((slot) => (
                        <div key={slot.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">{slot.subject}</h4>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatDate(slot.date, slot.startTime)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{getFormatLabel(slot.format)}</span>
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-blue-600 mt-3">
                                {slot.price} ₽
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleBookSlot(slot)}
                            className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <BookOpen className="h-4 w-4" />
                            <span>Забронировать</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-8 text-center">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg mb-2">Нет доступных слотов</p>
                      <p className="text-gray-500">Попробуйте позже или свяжитесь с преподавателем</p>
                    </div>
                  )}
                </div>

                {/* Booked Slots */}
                {bookedSlots.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Забронированные уроки</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {bookedSlots.map((slot) => (
                        <div key={slot.id} className="bg-green-50 border border-green-200 rounded-2xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">{slot.subject}</h4>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatDate(slot.date, slot.startTime)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{getFormatLabel(slot.format)}</span>
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-green-600 mt-3">
                                {slot.price} ₽
                              </div>
                            </div>
                          </div>
                          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl text-sm font-medium text-center">
                            Забронировано
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Пока нет отзывов</h3>
                <p className="text-gray-500">Будьте первым, кто оставит отзыв о преподавателе</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <BookingModal
          isOpen={showBookingModal}
          slot={selectedSlot}
          onClose={() => setShowBookingModal(false)}
          onConfirm={handleConfirmBooking}
          teacher={teacher}
          student={user}
        />
      )}
    </div>
  );
};

export default TeacherProfilePage; 