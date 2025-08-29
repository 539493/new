import React, { useState } from 'react';
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
  Video,
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
  Share2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { TeacherProfile, TimeSlot } from '../../types';

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
  const { timeSlots, posts, lessons } = useData();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'posts' | 'lessons' | 'reviews'>('about');

  const profile = teacher.profile as TeacherProfile;

  // Получаем статистику
  const teacherSlots = timeSlots.filter(slot => slot.teacherId === teacher.id);
  const availableSlots = teacherSlots.filter(slot => !slot.isBooked);
  const teacherPosts = posts.filter(post => post.userId === teacher.id);
  const teacherLessons = lessons.filter(lesson => lesson.teacherId === teacher.id);
  const completedLessons = teacherLessons.filter(lesson => lesson.status === 'completed');

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
                
                {profile?.avatar && profile.avatar.trim() !== '' && profile.avatar !== 'undefined' && profile.avatar !== 'null' ? (
                  <img 
                    src={profile.avatar} 
                    alt={teacher.name} 
                    className="w-24 h-24 object-cover rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                
                <div className={`w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center ${profile?.avatar && profile.avatar.trim() !== '' && profile.avatar !== 'undefined' && profile.avatar !== 'null' ? 'hidden' : ''}`}>
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
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">О себе</h3>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed mb-4">
              {profile?.bio || 'Информация о себе не указана'}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-gray-500">Предметы:</span>
                <div className="text-base text-gray-900 mt-1">
                  {profile?.subjects?.length > 0 ? profile.subjects.join(', ') : 'Не указано'}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500">Классы:</span>
                <div className="text-base text-gray-900 mt-1">
                  {profile?.grades?.length > 0 ? profile.grades.join(', ') : 'Не указано'}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500">Город:</span>
                <div className="text-base text-gray-900 mt-1">
                  {profile?.city || 'Не указано'}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500">Опыт:</span>
                <div className="text-base text-gray-900 mt-1">
                  {profile?.experience ? getExperienceLabel(profile.experience) : 'Не указано'}
                </div>
              </div>
            </div>
          </div>

          {/* Available Slots Section */}
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Доступные слоты ({availableSlots.length})
            </h3>
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableSlots.slice(0, 6).map((slot) => (
                  <div key={slot.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">{slot.subject}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">{slot.price} ₽</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatSlotDate(slot.date)} • {slot.startTime}-{slot.endTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{getFormatLabel(slot.format)} • {slot.duration} мин</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onBookLesson(teacher.id)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      Записаться
                    </button>
                  </div>
                ))}
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
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Записи преподавателя</h3>
            </div>
            {teacherPosts.length > 0 ? (
              <div className="space-y-4">
                {teacherPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900">{post.userName}</span>
                          <span className="text-sm text-gray-500">{formatDate(post.date)}</span>
                        </div>
                        <p className="text-gray-700 mb-3">{post.text}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <button className="flex items-center space-x-1 hover:text-blue-600">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{post.reactions.length}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-blue-600">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments.length}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-blue-600">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">У вас пока нет записей</p>
                <p className="text-sm text-gray-400">Создайте первую запись!</p>
              </div>
            )}
          </div>



          {/* Education Section */}
          {profile?.education && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Образование
              </h3>
              <div className="space-y-3">
                {profile.education.university && (
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Университет:</span>
                    <div className="text-base text-gray-900">{profile.education.university}</div>
                  </div>
                )}
                {profile.education.degree && (
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Специальность:</span>
                    <div className="text-base text-gray-900">{profile.education.degree}</div>
                  </div>
                )}
                {profile.education.graduationYear && (
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Год выпуска:</span>
                    <div className="text-base text-gray-900">{profile.education.graduationYear}</div>
                  </div>
                )}
                {profile.education.courses && profile.education.courses.length > 0 && (
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Курсы:</span>
                    <div className="space-y-1 mt-1">
                      {profile.education.courses.map((course, index) => (
                        <div key={index} className="text-sm text-gray-700">
                          • {course.name} ({course.institution}, {course.year})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing Section */}
          {profile?.hourlyRate && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Стоимость занятий
              </h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {profile.hourlyRate} ₽/час
              </div>
              <div className="text-sm text-gray-600">
                Стоимость может варьироваться в зависимости от формата и длительности занятия
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default TeacherProfileModal;
