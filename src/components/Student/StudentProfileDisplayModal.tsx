import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  X, 
  Edit,
  MapPin,
  Phone,
  Clock,
  School,
  User,
  BookOpen,
  Eye,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { StudentProfile } from '../../types';
import StudentProfileEditModal from './StudentProfileEditModal';

interface StudentProfileDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudentProfileDisplayModal: React.FC<StudentProfileDisplayModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { user } = useAuth();
  const { lessons } = useData();
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Получаем профиль пользователя
  const profile = user?.profile as StudentProfile;

  // Вычисляем статистику
  const studentLessons = lessons.filter(lesson => lesson.studentId === user?.id);
  const completedLessons = studentLessons.filter(lesson => lesson.status === 'completed');
  const subjectsCount = profile?.subjects?.length || 0;

  // Вычисляем процент заполнения профиля
  useEffect(() => {
    if (profile) {
      const fields = [
        'bio', 'age', 'school', 'city', 'phone', 'parentName', 'parentPhone',
        'subjects', 'goals', 'interests', 'learningStyle', 'experience',
        'preferredFormats', 'preferredDurations', 'timeZone'
      ];
      
      const filledFields = fields.filter(field => {
        const value = profile[field as keyof StudentProfile];
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value && value !== '';
      }).length;
      
      const completion = Math.round((filledFields / fields.length) * 100);
      setProfileCompletion(completion);
    }
  }, [profile]);

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

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = (updatedProfile: StudentProfile) => {
    // Профиль уже обновлен через контекст
    setShowEditModal(false);
  };

  if (!isOpen) return null;

  return (
    <>
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
              <h2 className="text-xl font-bold text-gray-900">Профиль ученика</h2>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Редактировать</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Profile Header */}
            <div className="flex items-start gap-6 mb-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg relative">
                  {profile?.avatar && profile.avatar.trim() !== '' && profile.avatar !== 'undefined' && profile.avatar !== 'null' ? (
                    <img 
                      src={profile.avatar} 
                      alt={user?.name} 
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

              {/* Name and Profile Completion */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                    <p className="text-gray-500">@{user?.id}</p>
                  </div>
                </div>

                {/* Profile Completion */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    Профиль заполнен на {profileCompletion}%
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{studentLessons.length} уроков</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>{completedLessons.length} завершено</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{subjectsCount} предметов</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{profile?.experience ? getExperienceLabel(profile.experience) : 'Не указан'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Personal Information */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Личная информация
                </h3>
                
                <div className="space-y-4">
                  {/* School */}
                  <div className="flex items-center gap-3">
                    <School className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-500">Школа</span>
                      <div className="text-base text-gray-900">
                        {profile?.school || 'Не указана'}
                      </div>
                    </div>
                  </div>

                  {/* City */}
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-500">Город</span>
                      <div className="text-base text-gray-900">
                        {profile?.city || 'Не указан'}
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-500">Телефон</span>
                      <div className="text-base text-gray-900">
                        {profile?.phone || 'Не указан'}
                      </div>
                    </div>
                  </div>

                  {/* Parent Name */}
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-500">Родитель</span>
                      <div className="text-base text-gray-900">
                        {profile?.parentName || 'Не указан'}
                      </div>
                    </div>
                  </div>

                  {/* Parent Phone */}
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-500">Телефон родителя</span>
                      <div className="text-base text-gray-900">
                        {profile?.parentPhone || 'Не указан'}
                      </div>
                    </div>
                  </div>

                  {/* Time Zone */}
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-500">Часовой пояс</span>
                      <div className="text-base text-gray-900">
                        {profile?.timeZone || 'Не указан'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Educational Information */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Учебная информация
                </h3>
                
                <div className="space-y-4">
                  {/* Subjects */}
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-500">Изучаемые предметы</span>
                    <div className="text-base text-gray-900 mt-1">
                      {profile?.subjects && profile.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {profile.subjects.map((subject, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {subject}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'Не указаны'
                      )}
                    </div>
                  </div>

                  {/* Learning Goals */}
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-500">Цели обучения</span>
                    <div className="text-base text-gray-900 mt-1">
                      {profile?.goals && profile.goals.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {profile.goals.map((goal, index) => (
                            <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                              {goal}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'Не указаны'
                      )}
                    </div>
                  </div>

                  {/* Learning Style */}
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-500">Стиль обучения</span>
                      <div className="text-base text-gray-900">
                        {profile?.learningStyle ? getLearningStyleLabel(profile.learningStyle) : 'Не указан'}
                      </div>
                    </div>
                  </div>

                  {/* Preferred Formats */}
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-500">Предпочитаемые форматы</span>
                    <div className="text-base text-gray-900 mt-1">
                      {profile?.preferredFormats && profile.preferredFormats.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {profile.preferredFormats.map((format, index) => (
                            <span key={index} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                              {format === 'online' ? 'Онлайн' : format === 'offline' ? 'Оффлайн' : 'Мини-группа'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'Не указаны'
                      )}
                    </div>
                  </div>

                  {/* Preferred Duration */}
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-500">Предпочитаемая длительность</span>
                    <div className="text-base text-gray-900 mt-1">
                      {profile?.preferredDurations && profile.preferredDurations.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {profile.preferredDurations.map((duration, index) => (
                            <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                              {duration} мин
                            </span>
                          ))}
                        </div>
                      ) : (
                        'Не указана'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-white rounded-2xl shadow p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">О себе</h3>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {profile?.bio || 'Информация о себе не указана'}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Age */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Возраст</h3>
                <div className="text-base text-gray-900">
                  {profile?.age ? `${profile.age} лет` : 'Не указан'}
                </div>
              </div>

              {/* Experience Level */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Уровень знаний</h3>
                <div className="text-base text-gray-900">
                  {profile?.experience ? getExperienceLabel(profile.experience) : 'Не указан'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <StudentProfileEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
};

export default StudentProfileDisplayModal;
