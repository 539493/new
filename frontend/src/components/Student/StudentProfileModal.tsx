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
  School,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { StudentProfile } from '../../types';

interface StudentProfileModalProps {
  student: any;
  onClose: () => void;
  onMessage: (studentId: string) => void;
}

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ 
  student, 
  onClose, 
  onMessage 
}) => {
  const { user } = useAuth();
  const { lessons, posts } = useData();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const profile = student.profile as StudentProfile;

  // Получаем статистику
  const studentLessons = lessons.filter(lesson => lesson.studentId === student.id);
  const completedLessons = studentLessons.filter(lesson => lesson.status === 'completed');
  const studentPosts = posts.filter(post => post.userId === student.id);
  const uniqueTeachers = Array.from(new Set(studentLessons.map(lesson => lesson.teacherId)));

  const getExperienceLabel = (exp: string) => {
    switch (exp) {
      case 'beginner': return 'Начинающий';
      case 'intermediate': return 'Средний';
      case 'advanced': return 'Продвинутый';
      default: return exp;
    }
  };

  const getLearningStyleLabel = (style: string) => {
    switch (style) {
      case 'visual': return 'Визуальный';
      case 'auditory': return 'Аудиальный';
      case 'kinesthetic': return 'Кинестетический';
      case 'mixed': return 'Смешанный';
      default: return style;
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
          <div className="flex items-start gap-6 mb-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg relative">
                {/* Online Status */}
                <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                
                {profile?.avatar && profile.avatar.trim() !== '' && profile.avatar !== 'undefined' && profile.avatar !== 'null' ? (
                  <img 
                    src={profile.avatar} 
                    alt={student.name} 
                    className="w-24 h-24 object-cover rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                
                <div className={`w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center ${profile?.avatar && profile.avatar.trim() !== '' && profile.avatar !== 'undefined' && profile.avatar !== 'null' ? 'hidden' : ''}`}>
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>

            {/* Name and Actions */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                  <p className="text-gray-500">@{student.id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-1">
                    <Edit className="w-4 h-4" />
                    <span>Редактировать</span>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{completedLessons.length} уроков</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{uniqueTeachers.length} учителей</span>
                </div>
                {profile?.age && (
                  <div className="flex items-center space-x-1">
                    <UserCheck className="w-4 h-4" />
                    <span>{profile.age} лет</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">О себе</h3>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed mb-4">
              {profile?.bio || 'Информация о себе не указана'}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-gray-500">Класс:</span>
                <div className="text-base text-gray-900 mt-1">
                  {profile?.grade || '—'}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500">Школа:</span>
                <div className="text-base text-gray-900 mt-1">
                  {profile?.school || '—'}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500">Город:</span>
                <div className="text-base text-gray-900 mt-1">
                  {profile?.city || '—'}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500">Уровень:</span>
                <div className="text-base text-gray-900 mt-1">
                  {profile?.experience ? getExperienceLabel(profile.experience) : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Goals Section */}
          {profile?.goals && profile.goals.length > 0 && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Цели обучения
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.goals.map((goal, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests Section */}
          {profile?.interests && profile.interests.length > 0 && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Интересы и хобби
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Learning Style Section */}
          {profile?.learningStyle && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Book className="w-5 h-5 mr-2" />
                Стиль обучения
              </h3>
              <div className="text-base text-gray-900">
                {getLearningStyleLabel(profile.learningStyle)}
              </div>
            </div>
          )}

          {/* Posts Section */}
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Мои записи</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Создать запись</span>
              </button>
            </div>
            {studentPosts.length > 0 ? (
              <div className="space-y-4">
                {studentPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0">
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

          {/* Statistics Section */}
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Статистика</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">{completedLessons.length}</div>
                <div className="text-sm text-gray-600">Пройдено уроков</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">{uniqueTeachers.length}</div>
                <div className="text-sm text-gray-600">Учителей</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">{studentPosts.length}</div>
                <div className="text-sm text-gray-600">Записей</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-1">{profile?.subjects?.length || 0}</div>
                <div className="text-sm text-gray-600">Предметов</div>
              </div>
            </div>
          </div>

          {/* Parent Contact Section */}
          {(profile?.parentName || profile?.parentPhone) && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Контактная информация родителя
              </h3>
              <div className="space-y-3">
                {profile.parentName && (
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Имя родителя:</span>
                    <div className="text-base text-gray-900">{profile.parentName}</div>
                  </div>
                )}
                {profile.parentPhone && (
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Телефон родителя:</span>
                    <div className="text-base text-gray-900">{profile.parentPhone}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onMessage(student.id)}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Написать сообщение</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;
