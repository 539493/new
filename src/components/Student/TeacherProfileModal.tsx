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
  X, 
  Users,
  Award,
  TrendingUp,
  Bookmark,
  Eye,
  ThumbsUp,
  Smile,
  Send,
  Play,
  Image as ImageIcon,
  VideoIcon,
  FileText,
  Plus,
  Settings,
  Edit,
  GraduationCap,
  Calendar,
  DollarSign,
  Target,
  Book,
  Globe,
  Heart,
  Share2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { TeacherProfile, TimeSlot } from '../../types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? 'https://tutoring-platform-1756666331-zjfl.onrender.com' : 'http://localhost:3001');

interface TeacherProfileModalProps {
  teacher: any;
  onClose: () => void;
  onBookLesson: (teacherId: string) => void;
  onMessage: (teacherId: string) => void;
}

const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({ 
  teacher, 
  onClose, 
  onBookLesson,
  onMessage 
}) => {
  const { user } = useAuth();
  const { timeSlots, posts, lessons, refreshUsers } = useData();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'posts' | 'lessons' | 'reviews'>('about');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshTeacherData = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/users/${teacher.id}`);
      if (response.ok) {
        const freshData = await response.json();
        console.log('Fresh teacher data from refresh button:', freshData);
        
        // Обновляем данные в контексте
        const existingUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
        const updatedUsers = existingUsers.map((user: any) => 
          user.id === freshData.id ? freshData : user
        );
        localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
        
        // Обновляем данные в контексте приложения
        refreshUsers();
        
        // Обновляем данные в модальном окне
        const updatedTeacher = {
          ...teacher,
          name: freshData.name || teacher.name,
          email: freshData.email || teacher.email,
          avatar: freshData.profile?.avatar || freshData.avatar || teacher.avatar,
          profile: {
            ...teacher.profile,
            ...freshData.profile,
            avatar: freshData.profile?.avatar || freshData.avatar || teacher.avatar,
            name: freshData.name || teacher.name,
            email: freshData.email || teacher.email
          }
        };
        
        console.log('Updated teacher data in modal:', updatedTeacher);
        // Обновляем состояние без перезагрузки страницы
        // setSelectedTeacher(updatedTeacher); // This line was not in the original file, so it's removed.
      } else {
        console.warn('Failed to refresh teacher data:', response.status);
      }
    } catch (error) {
      console.error('Error refreshing teacher data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const profile = teacher.profile as TeacherProfile;
  
  // Отладочная информация
  console.log('Teacher in modal:', teacher);
  console.log('Profile in modal:', profile);

  // Принудительно обновляем данные при открытии модального окна
  useEffect(() => {
    const refreshTeacherData = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/users/${teacher.id}`);
        if (response.ok) {
          const freshData = await response.json();
          console.log('Fresh teacher data in modal:', freshData);
          
          // Обновляем данные в контексте
          const existingUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
          const updatedUsers = existingUsers.map((user: any) => 
            user.id === freshData.id ? freshData : user
          );
          localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
          
          // Обновляем данные в контексте приложения
          refreshUsers();
          
          // Обновляем данные в модальном окне
          const updatedTeacher = {
            ...teacher,
            name: freshData.name || teacher.name,
            email: freshData.email || teacher.email,
            avatar: freshData.profile?.avatar || freshData.avatar || teacher.avatar,
            profile: {
              ...teacher.profile,
              ...freshData.profile,
              avatar: freshData.profile?.avatar || freshData.avatar || teacher.avatar,
              name: freshData.name || teacher.name,
              email: freshData.email || teacher.email
            }
          };
          
          console.log('Updated teacher data in modal useEffect:', updatedTeacher);
          // Обновляем состояние без перезагрузки страницы
          // setSelectedTeacher(updatedTeacher);
        } else {
          console.warn('Failed to refresh teacher data in modal:', response.status);
        }
      } catch (error) {
        console.error('Error refreshing teacher data in modal:', error);
      }
    };

    refreshTeacherData();
  }, [teacher.id]);

  // Получаем статистику
  const teacherSlots = timeSlots.filter(slot => slot.teacherId === teacher.id);
  const availableSlots = teacherSlots.filter(slot => !slot.isBooked);
  const teacherPosts = posts.filter(post => post.userId === teacher.id);
  const teacherLessons = lessons.filter(lesson => lesson.teacherId === teacher.id);
  const completedLessons = teacherLessons.filter(lesson => lesson.status === 'completed');

  // Отладочная информация для слотов
  console.log('Teacher ID:', teacher.id);
  console.log('All timeSlots:', timeSlots);
  console.log('Teacher slots:', teacherSlots);
  console.log('Available slots:', availableSlots);

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

  const formatSlotDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
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
          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg relative">
                {/* Online Status */}
                <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                
                {(() => {
                  const avatarUrl = profile?.avatar || teacher.avatar;
                  const hasAvatar = avatarUrl && avatarUrl.trim() !== '' && avatarUrl !== 'undefined' && avatarUrl !== 'null';
                  
                  if (hasAvatar) {
                    return (
                      <img 
                        src={avatarUrl} 
                        alt={teacher.name} 
                        className="w-24 h-24 object-cover rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.classList.add('hidden');
                        }}
                      />
                    );
                  }
                  return null;
                })()}
                
                <div className={`w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center ${(() => {
                  const avatarUrl = profile?.avatar || teacher.avatar;
                  const hasAvatar = avatarUrl && avatarUrl.trim() !== '' && avatarUrl !== 'undefined' && avatarUrl !== 'null';
                  return hasAvatar ? 'hidden' : '';
                })()}`}>
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>

            {/* Name and Actions */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{teacher.name}</h1>
                  <p className="text-gray-500">@{teacher.id}</p>
                </div>
                            <div className="flex items-center space-x-2">
              <button 
                onClick={refreshTeacherData}
                disabled={isRefreshing}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                title="Обновить данные"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                {profile?.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{profile.rating}</span>
                  </div>
                )}
                {profile?.lessonsCount && (
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{profile.lessonsCount} уроков</span>
                  </div>
                )}
                {profile?.experienceYears && (
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>{profile.experienceYears} лет опыта</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Section - Compact */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">Статистика</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600 mb-1">{completedLessons.length}</div>
                <div className="text-xs text-gray-600">Проведено уроков</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600 mb-1">{availableSlots.length}</div>
                <div className="text-xs text-gray-600">Свободных слотов</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600 mb-1">{teacherPosts.length}</div>
                <div className="text-xs text-gray-600">Записей</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600 mb-1">{profile?.reviewsCount || 0}</div>
                <div className="text-xs text-gray-600">Отзывов</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={() => onBookLesson(teacher.id)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>Записаться на урок</span>
            </button>
            <button
              onClick={() => onMessage(teacher.id)}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Написать сообщение</span>
            </button>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              О преподавателе
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-gray-500 flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Предметы:
                  </span>
                  <div className="text-sm text-gray-900 mt-1">
                    {profile?.subjects?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {profile.subjects.map((subject, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            {subject}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">Не указано</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <span className="text-xs font-semibold text-gray-500 flex items-center">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    Классы:
                  </span>
                  <div className="text-sm text-gray-900 mt-1">
                    {profile?.grades?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {profile.grades.map((grade, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            {grade}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">Не указано</span>
                    )}
                  </div>
                </div>
                
              <div>
                  <span className="text-xs font-semibold text-gray-500 flex items-center">
                    <Target className="w-3 h-3 mr-1" />
                    Цели обучения:
                  </span>
                  <div className="text-sm text-gray-900 mt-1">
                    {profile?.goals?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {profile.goals.map((goal, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            {goal}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">Не указано</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-gray-500 flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    Опыт:
                  </span>
                  <div className="text-sm text-gray-900 mt-1">
                    {profile?.experience ? (
                      <div className="flex items-center space-x-2">
                        <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          {getExperienceLabel(profile.experience)}
                        </span>
                        {profile.experienceYears && (
                          <span className="text-gray-600 text-xs">
                            ({profile.experienceYears} лет)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">Не указано</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <span className="text-xs font-semibold text-gray-500 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    Город:
                  </span>
                  <div className="text-sm text-gray-900 mt-1">
                    {profile?.city ? (
                      <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        {profile.city}
                      </span>
                    ) : (
                      <span className="text-gray-500">Не указано</span>
                    )}
                  </div>
                </div>
                
              <div>
                  <span className="text-xs font-semibold text-gray-500 flex items-center">
                    <Globe className="w-3 h-3 mr-1" />
                    Форматы обучения:
                  </span>
                  <div className="text-base text-gray-900 mt-2">
                    {profile?.formats?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.formats.map((format, index) => (
                          <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                            {getFormatLabel(format)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">Не указано</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Education Section */}
          {profile?.education && (
            <div className="bg-white rounded-xl shadow p-4 mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                <GraduationCap className="w-4 h-4 mr-2" />
                Образование
              </h3>
              <div className="space-y-2">
                {profile.education.university && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Университет:</span>
                    <div className="text-sm text-gray-900">{profile.education.university}</div>
                  </div>
                )}
                {profile.education.degree && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Специальность:</span>
                    <div className="text-sm text-gray-900">{profile.education.degree}</div>
                  </div>
                )}
                {profile.education.graduationYear && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Год выпуска:</span>
                    <div className="text-sm text-gray-900">{profile.education.graduationYear}</div>
                  </div>
                )}
                {profile.education.courses && profile.education.courses.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Курсы:</span>
                    <div className="space-y-1 mt-1">
                      {profile.education.courses.map((course, index) => (
                        <div key={index} className="text-xs text-gray-700">
                          • {course.name} ({course.institution}, {course.year})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing and Services Section */}
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Стоимость и услуги
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Основная стоимость */}
              <div className="space-y-3">
              <div>
                  <span className="text-xs font-semibold text-gray-500">Базовая стоимость:</span>
                  <div className="text-xl font-bold text-blue-600 mt-1">
                    {profile?.hourlyRate ? `${profile.hourlyRate} ₽/час` : 'Не указана'}
                  </div>
                </div>
                
                {/* Длительности занятий */}
                {profile?.durations && profile.durations.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Длительности занятий:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.durations.map((duration, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg text-xs font-medium">
                          {duration} мин
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Типы уроков */}
                {profile?.lessonTypes && profile.lessonTypes.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Типы уроков:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.lessonTypes.map((type, index) => (
                        <span key={index} className="bg-green-50 text-green-700 px-2 py-0.5 rounded-lg text-xs font-medium">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Дополнительная информация */}
              <div className="space-y-3">
                {/* Рейтинг */}
                {profile?.rating && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Рейтинг:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= (profile.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{profile.rating}/5</span>
                    </div>
                  </div>
                )}
                
                {/* Овербукинг */}
              <div>
                  <span className="text-xs font-semibold text-gray-500">Автоподбор:</span>
                <div className="text-sm text-gray-900 mt-1">
                    {profile?.overbookingEnabled ? (
                      <span className="text-green-600 font-medium">✓ Доступен</span>
                    ) : (
                      <span className="text-gray-500">Недоступен</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 Стоимость может варьироваться в зависимости от формата, длительности занятия и сложности материала
              </p>
            </div>
          </div>


          {/* Available Slots Section */}
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Доступные слоты ({availableSlots.length})
            </h3>
            {availableSlots.length > 0 ? (
              <div className="space-y-3">
                {/* Сводка по ценам */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Сводка по ценам:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-600">Минимальная цена:</span>
                      <div className="font-semibold text-green-600">
                        {Math.min(...availableSlots.map(s => s.price))} ₽
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Максимальная цена:</span>
                      <div className="font-semibold text-green-600">
                        {Math.max(...availableSlots.map(s => s.price))} ₽
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Средняя цена:</span>
                      <div className="font-semibold text-green-600">
                        {Math.round(availableSlots.reduce((sum, slot) => sum + slot.price, 0) / availableSlots.length)} ₽
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Всего слотов:</span>
                      <div className="font-semibold text-blue-600">
                        {availableSlots.length}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Слоты */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableSlots.slice(0, 6).map((slot) => (
                  <div key={slot.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-3 h-3 text-blue-600" />
                        <span className="font-semibold text-gray-900 text-sm">{slot.subject}</span>
                      </div>
                        <span className="text-base font-bold text-green-600">{slot.price} ₽</span>
                    </div>
                      <div className="space-y-1 mb-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{formatSlotDate(slot.date)} • {slot.startTime}-{slot.endTime}</span>
                      </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{getFormatLabel(slot.format)} • {slot.duration} мин</span>
                        </div>
                        {slot.experience && (
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <Award className="w-3 h-3" />
                            <span>Опыт: {getExperienceLabel(slot.experience)}</span>
                          </div>
                        )}
                    </div>
                    <button
                      onClick={() => onBookLesson(teacher.id)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-semibold"
                    >
                        Записаться за {slot.price} ₽
                    </button>
                  </div>
                ))}
                </div>
                
                {availableSlots.length > 6 && (
                  <div className="text-center pt-4">
                    <p className="text-gray-600 text-sm">
                      И еще {availableSlots.length - 6} доступных слотов
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">Нет доступных слотов</p>
                <p className="text-sm text-gray-400">Следите за обновлениями расписания</p>
              </div>
            )}
          </div>



          {/* Posts Section */}
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Записи преподавателя ({teacherPosts.length})
              </h3>
            </div>
            {teacherPosts.length > 0 ? (
              <div className="space-y-3">
                {teacherPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900 text-sm">{post.userName}</span>
                          <span className="text-xs text-gray-500">{formatDate(post.date)}</span>
                        </div>
                        <p className="text-gray-700 mb-2 leading-relaxed text-sm">{post.text}</p>
                        
                        {/* Теги, если есть */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.tags.map((tag, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{post.reactions.length}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.comments.length}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                            <Share2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {teacherPosts.length > 3 && (
                  <div className="text-center pt-3">
                    <p className="text-gray-600 text-xs">
                      И еще {teacherPosts.length - 3} записей
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2 text-sm">У преподавателя пока нет записей</p>
                <p className="text-xs text-gray-400">Записи появятся здесь, когда преподаватель начнет публиковать контент</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherProfileModal;
