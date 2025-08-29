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
}

const TeacherProfilePage: React.FC<TeacherProfilePageProps> = ({ teacher, onClose, onBookLesson }) => {
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
                  
                {profile?.avatar && profile.avatar.trim() !== '' ? (
                  <img 
                    src={profile.avatar} 
                    alt={teacher.name} 
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
                <button
                  onClick={() => setShowSlots(!showSlots)}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Calendar className="h-6 w-6" />
                  <span className="text-lg">Слоты ({availableSlots.length})</span>
                </button>
                <button
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center space-x-2 transform hover:-translate-y-1"
                >
                  <MessageCircle className="h-6 w-6" />
                  <span className="text-lg">Связаться</span>
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
              <div className="space-y-3">
                {/* Bio */}
          {profile?.bio && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-2.5 shadow-sm">
                    <h3 className="text-sm font-bold text-indigo-900 mb-1.5 flex items-center">
                      <div className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center mr-1.5">
                        <div className="w-2 h-2 bg-white rounded-sm"></div>
                      </div>
                      О преподавателе
                    </h3>
                    <div className="bg-white/60 backdrop-blur-sm rounded-md p-2 border border-indigo-200/50">
                      <p className="text-indigo-800 leading-relaxed whitespace-pre-line text-xs">
                  {profile.bio}
                </p>
              </div>
            </div>
          )}

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

          {/* Goals */}
          {profile?.goals && profile.goals.length > 0 && (
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-2.5 shadow-sm">
              <h3 className="text-sm font-bold text-pink-900 mb-1.5 flex items-center">
                <div className="w-4 h-4 bg-gradient-to-br from-pink-500 to-rose-600 rounded flex items-center justify-center mr-1.5">
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                </div>
                Цели занятий
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {profile.goals.map((goal: string, index: number) => (
                  <div key={index} className="flex items-center space-x-1.5 p-1 bg-white/60 backdrop-blur-sm rounded border border-pink-200/50">
                    <div className="w-1 h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-sm"></div>
                    <span className="text-pink-800 text-xs font-medium">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {(profile?.education?.university || profile?.education?.courses?.length) && (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h3 className="text-base font-bold text-gray-900 mb-3">Образование и курсы</h3>
              
              {/* University */}
              {profile?.education?.university && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                    Высшее образование
                  </h4>
                  <div className="bg-blue-50 rounded-lg p-2.5">
                    <div className="font-medium text-blue-900 mb-1 text-sm">{profile.education.university}</div>
                    {profile.education.degree && (
                      <div className="text-xs text-blue-700 mb-1">{profile.education.degree}</div>
                    )}
                    {profile.education.graduationYear && (
                      <div className="text-xs text-blue-600">Год окончания: {profile.education.graduationYear}</div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Courses */}
              {profile?.education?.courses && profile.education.courses.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    Курсы и сертификаты
                  </h4>
                  <div className="space-y-2">
                    {profile.education.courses.map((course, index) => (
                      <div key={index} className="bg-green-50 rounded-lg p-2.5 border border-green-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-green-900 mb-1 text-sm">{course.name}</div>
                            <div className="text-xs text-green-700 mb-1">{course.institution}</div>
                            <div className="text-xs text-green-600">Год: {course.year}</div>
                          </div>
                          {course.certificate && (
                            <a 
                              href={course.certificate} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs font-medium"
                            >
                              Сертификат
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
              </div>
              )}
            </div>
          )}

          {/* Additional Info */}
          {(profile?.country || profile?.offlineAvailable !== undefined || profile?.overbookingEnabled !== undefined) && (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-lg p-2.5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-1.5 flex items-center">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center mr-1.5">
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                </div>
                Дополнительная информация
              </h3>
              
              <div className="space-y-1.5">
                {profile?.country && (
                  <div className="flex items-center justify-between p-1.5 bg-white/60 backdrop-blur-sm rounded border border-white/20">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-5 h-5 bg-gradient-to-br from-emerald-100 to-teal-100 rounded flex items-center justify-center">
                        <span className="text-emerald-600 text-xs">🌍</span>
                      </div>
                      <span className="text-xs font-medium text-slate-600">Страна</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-800 bg-white/80 px-1.5 py-0.5 rounded">
                      {profile.country}
                    </span>
                  </div>
                )}
                
                {profile?.offlineAvailable !== undefined && (
                  <div className="flex items-center justify-between p-1.5 bg-white/60 backdrop-blur-sm rounded border border-white/20">
                    <div className="flex items-center space-x-1.5">
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                        profile.offlineAvailable 
                          ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                          : 'bg-gradient-to-br from-red-100 to-pink-100'
                      }`}>
                        <span className={`text-xs ${
                          profile.offlineAvailable ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {profile.offlineAvailable ? '🏠' : '💻'}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-600">Оффлайн занятия</span>
                    </div>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                      profile.offlineAvailable 
                        ? 'text-green-700 bg-green-100/80' 
                        : 'text-red-700 bg-red-100/80'
                    }`}>
                      {profile.offlineAvailable ? 'Доступны' : 'Недоступны'}
                    </span>
                  </div>
                )}
                
                {profile?.overbookingEnabled !== undefined && (
                  <div className="flex items-center justify-between p-1.5 bg-white/60 backdrop-blur-sm rounded border border-white/20">
                    <div className="flex items-center space-x-1.5">
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                        profile.overbookingEnabled 
                          ? 'bg-gradient-to-br from-purple-100 to-violet-100' 
                          : 'bg-gradient-to-br from-gray-100 to-slate-100'
                      }`}>
                        <span className={`text-xs ${
                          profile.overbookingEnabled ? 'text-purple-600' : 'text-gray-600'
                        }`}>
                          {profile.overbookingEnabled ? '⚡' : '📅'}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-600">Овербукинг</span>
                    </div>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                      profile.overbookingEnabled 
                        ? 'text-purple-700 bg-purple-100/80' 
                        : 'text-gray-700 bg-gray-100/80'
                    }`}>
                      {profile.overbookingEnabled ? 'Участвует' : 'Не участвует'}
                    </span>
                  </div>
                )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Подтверждение бронирования</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedSlot.subject}</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(selectedSlot.date, selectedSlot.startTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{getFormatLabel(selectedSlot.format)}</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {selectedSlot.price} ₽
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Комментарий к уроку (необязательно)
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Укажите цели занятия, особенности и т.д."
                  id="booking-comment"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    const comment = (document.getElementById('booking-comment') as HTMLTextAreaElement)?.value || '';
                    handleConfirmBooking(comment);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Подтвердить
                </button>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherProfilePage; 