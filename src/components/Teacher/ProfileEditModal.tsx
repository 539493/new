import React, { useState, useEffect } from 'react';
import { X, Save, User, BookOpen, MapPin, Award, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { TeacherProfile } from '../../types';
import AvatarUpload from '../Shared/AvatarUpload';
import { SERVER_URL } from '../../config';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: TeacherProfile) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { user } = useAuth();
  const { updateTeacherProfile } = useData();
  
  const [profile, setProfile] = useState<TeacherProfile>({
    subjects: [],
    experience: 'beginner',
    grades: [],
    goals: [],
    lessonTypes: [],
    durations: [],
    formats: [],
    offlineAvailable: false,
    city: '',
    overbookingEnabled: true,
    bio: '',
    avatar: '',
    rating: 0,
    hourlyRate: 0,
    students: [],
    lessonsCount: 0,
    country: '',
    age: 0,
    experienceYears: 0,
    reviewsCount: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.profile) {
      setProfile(user.profile as TeacherProfile);
    }
  }, [user]);

  const handleInputChange = (field: keyof TeacherProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof TeacherProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(Boolean)
    }));
  };

  const handleAvatarUploaded = (avatarUrl: string) => {
    setProfile(prev => ({
      ...prev,
      avatar: avatarUrl
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      await updateTeacherProfile(user.id, profile);
      onSave(profile);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения профиля');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Редактирование профиля</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center space-x-6">
            <AvatarUpload
              userId={user?.id || ''}
              currentAvatar={profile.avatar}
              onAvatarUploaded={handleAvatarUploaded}
              size="lg"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Фото профиля</h3>
              <p className="text-sm text-gray-600">
                Загрузите фото для вашего профиля. Рекомендуемый размер: 400x400 пикселей
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Имя
              </label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Award className="w-4 h-4 inline mr-2" />
                Возраст
              </label>
              <input
                type="number"
                value={profile.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Укажите ваш возраст"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Город
              </label>
              <input
                type="text"
                value={profile.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Введите ваш город"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Award className="w-4 h-4 inline mr-2" />
                Годы опыта
              </label>
              <input
                type="number"
                value={profile.experienceYears || ''}
                onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Сколько лет преподаете"
              />
            </div>
          </div>

          {/* Subjects and Grades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-2" />
                Предметы (через запятую)
              </label>
              <input
                type="text"
                value={profile.subjects?.join(', ') || ''}
                onChange={(e) => handleArrayChange('subjects', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Математика, Физика, Химия"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Классы (через запятую)
              </label>
              <input
                type="text"
                value={profile.grades?.join(', ') || ''}
                onChange={(e) => handleArrayChange('grades', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="5, 6, 7, 8, 9, 10, 11"
              />
            </div>
          </div>

          {/* Experience and Formats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Award className="w-4 h-4 inline mr-2" />
                Уровень опыта
              </label>
              <select
                value={profile.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="beginner">Начинающий</option>
                <option value="experienced">Опытный</option>
                <option value="professional">Профессионал</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-2" />
                Форматы обучения (через запятую)
              </label>
              <input
                type="text"
                value={profile.formats?.join(', ') || ''}
                onChange={(e) => handleArrayChange('formats', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="online, offline, mini-group"
              />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Стоимость за час (₽)
            </label>
            <input
              type="number"
              value={profile.hourlyRate || ''}
              onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1000"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              О себе
            </label>
            <textarea
              value={profile.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Расскажите о себе, своем опыте преподавания и методиках..."
            />
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="overbookingEnabled"
                checked={profile.overbookingEnabled}
                onChange={(e) => handleInputChange('overbookingEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="overbookingEnabled" className="ml-2 text-sm text-gray-700">
                Разрешить автоподбор учеников (овербукинг)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="offlineAvailable"
                checked={profile.offlineAvailable}
                onChange={(e) => handleInputChange('offlineAvailable', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="offlineAvailable" className="ml-2 text-sm text-gray-700">
                Доступны оффлайн занятия
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{isLoading ? 'Сохранение...' : 'Сохранить профиль'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
