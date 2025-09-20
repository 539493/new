import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  X, 
  Save, 
  Upload,
  MapPin,
  Phone,
  Clock,
  School,
  User,
  BookOpen,
  Eye,
  Target,
  Heart,
  Book,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { StudentProfile } from '../../types';

interface StudentProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: StudentProfile) => void;
}

const StudentProfileEditModal: React.FC<StudentProfileEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const { user } = useAuth();
  const { updateStudentProfile } = useData();
  
  const [profile, setProfile] = useState<StudentProfile>({
    grade: '',
    bio: '',
    avatar: '',
    subjects: [],
    age: undefined,
    school: '',
    city: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    goals: [],
    interests: [],
    learningStyle: 'mixed',
    experience: 'beginner',
    preferredFormats: [],
    preferredDurations: [],
    timeZone: '',
  });

  const [profileCompletion, setProfileCompletion] = useState(0);

  // Загружаем данные профиля при открытии модального окна
  useEffect(() => {
    if (isOpen && user?.profile) {
      setProfile(user.profile as StudentProfile);
      calculateProfileCompletion(user.profile as StudentProfile);
    }
  }, [isOpen, user]);

  // Вычисляем процент заполнения профиля
  const calculateProfileCompletion = (profileData: StudentProfile) => {
    const fields = [
      'bio', 'age', 'school', 'city', 'phone', 'parentName', 'parentPhone',
      'subjects', 'goals', 'interests', 'learningStyle', 'experience',
      'preferredFormats', 'preferredDurations', 'timeZone'
    ];
    
    const filledFields = fields.filter(field => {
      const value = profileData[field as keyof StudentProfile];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && value !== '';
    }).length;
    
    const completion = Math.round((filledFields / fields.length) * 100);
    setProfileCompletion(completion);
  };

  // Обновляем процент заполнения при изменении данных
  useEffect(() => {
    calculateProfileCompletion(profile);
  }, [profile]);

  const handleSave = () => {
    if (user) {
      updateStudentProfile(user.id, profile);
      onSave(profile);
      onClose();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const avatarUrl = ev.target?.result as string;
        setProfile({ ...profile, avatar: avatarUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const getExperienceLabel = (exp: string) => {
    switch (exp) {
      case 'beginner': return 'Начинающий';
      case 'intermediate': return 'Средний';
      case 'advanced': return 'Продвинутый';
      default: return exp;
    }
  };

  if (!isOpen) return null;

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
            <h2 className="text-xl font-bold text-gray-900">Редактирование профиля</h2>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Сохранить</span>
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
              
              {/* Upload button */}
              <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
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
                  <span>1 урок</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>0 завершено</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>0 предметов</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{profile.experience ? getExperienceLabel(profile.experience) : 'Не указан'}</span>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Школа</label>
                    <input
                      type="text"
                      value={profile.school || ''}
                      onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Название школы"
                    />
                  </div>
                </div>

                {/* City */}
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
                    <input
                      type="text"
                      value={profile.city || ''}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ваш город"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                    <input
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                </div>

                {/* Parent Name */}
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Родитель</label>
                    <input
                      type="text"
                      value={profile.parentName || ''}
                      onChange={(e) => setProfile({ ...profile, parentName: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Имя родителя"
                    />
                  </div>
                </div>

                {/* Parent Phone */}
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон родителя</label>
                    <input
                      type="tel"
                      value={profile.parentPhone || ''}
                      onChange={(e) => setProfile({ ...profile, parentPhone: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                </div>

                {/* Time Zone */}
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Часовой пояс</label>
                    <input
                      type="text"
                      value={profile.timeZone || ''}
                      onChange={(e) => setProfile({ ...profile, timeZone: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="UTC+3 (Москва)"
                    />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Изучаемые предметы</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Математика', 'Русский язык', 'Физика', 'Химия', 'Биология', 'История', 'География', 'Английский язык'].map(subject => (
                      <label key={subject} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={profile.subjects?.includes(subject) || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfile({
                                ...profile,
                                subjects: [...(profile.subjects || []), subject]
                              });
                            } else {
                              setProfile({
                                ...profile,
                                subjects: (profile.subjects || []).filter(s => s !== subject)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Learning Goals */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Цели обучения</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Подготовка к ЕГЭ', 'Подготовка к ОГЭ', 'Повышение успеваемости', 'Углубленное изучение', 'Подготовка к олимпиаде'].map(goal => (
                      <label key={goal} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={profile.goals?.includes(goal) || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfile({
                                ...profile,
                                goals: [...(profile.goals || []), goal]
                              });
                            } else {
                              setProfile({
                                ...profile,
                                goals: (profile.goals || []).filter(g => g !== goal)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Learning Style */}
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Стиль обучения</label>
                    <select
                      value={profile.learningStyle || 'mixed'}
                      onChange={(e) => setProfile({ ...profile, learningStyle: e.target.value as any })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="visual">Визуальный</option>
                      <option value="auditory">Аудиальный</option>
                      <option value="kinesthetic">Кинестетический</option>
                      <option value="mixed">Смешанный</option>
                    </select>
                  </div>
                </div>

                {/* Preferred Formats */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Предпочитаемые форматы</label>
                  <div className="flex space-x-4">
                    {['online', 'offline', 'mini-group'].map(format => (
                      <label key={format} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={profile.preferredFormats?.includes(format) || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfile({
                                ...profile,
                                preferredFormats: [...(profile.preferredFormats || []), format]
                              });
                            } else {
                              setProfile({
                                ...profile,
                                preferredFormats: (profile.preferredFormats || []).filter(f => f !== format)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {format === 'online' ? 'Онлайн' : format === 'offline' ? 'Оффлайн' : 'Мини-группа'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preferred Duration */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Предпочитаемая длительность</label>
                  <div className="flex space-x-4">
                    {[30, 45, 60, 90].map(duration => (
                      <label key={duration} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={profile.preferredDurations?.includes(duration) || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfile({
                                ...profile,
                                preferredDurations: [...(profile.preferredDurations || []), duration]
                              });
                            } else {
                              setProfile({
                                ...profile,
                                preferredDurations: (profile.preferredDurations || []).filter(d => d !== duration)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{duration} мин</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-2xl shadow p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">О себе</h3>
            <textarea
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Расскажите о себе, своих интересах и целях..."
            />
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Age */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Возраст</h3>
              <input
                type="number"
                value={profile.age || ''}
                onChange={(e) => setProfile({ ...profile, age: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="5"
                max="25"
                placeholder="Укажите возраст"
              />
            </div>

            {/* Experience Level */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Уровень знаний</h3>
              <select
                value={profile.experience || 'beginner'}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value as any })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Начинающий</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileEditModal;
