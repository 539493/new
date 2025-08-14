import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User, StudentProfile, TeacherProfile } from '../../types';
import { Camera, Upload, X } from 'lucide-react';

interface ProfileFormProps {
  onClose: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const { updateStudentProfile, updateTeacherProfile } = useData();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    country: '',
    city: '',
    experience: 'beginner',
    rating: 0,
    hourlyRate: 1000,
    subjects: [] as string[],
    grades: [] as string[],
    format: 'online',
    duration: 60,
    comment: '',
    status: 'active'
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const subjects = ['Математика', 'Русский язык', 'Английский язык', 'Физика', 'Химия', 'Биология', 'История', 'География'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'Студент', 'Взрослый'];
  const experiences = ['beginner', 'experienced', 'professional'];
  const formats = ['online', 'offline', 'mini-group'];
  const durations = [45, 60];

  useEffect(() => {
    if (user?.profile) {
      setFormData(prev => ({
        ...prev,
        ...user.profile
      }));
    }
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatar(file);
      
      // Создаем превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview('');
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // В реальном приложении здесь был бы запрос к серверу
        // Пока сохраняем как base64
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let avatarUrl = user?.avatar || '';
      
      // Загружаем аватар, если он был выбран
      if (avatar) {
        avatarUrl = await uploadAvatar(avatar);
      }

      const updatedUser: User = {
        ...user!,
        name: formData.name,
        email: formData.email,
        avatar: avatarUrl,
        profile: {
          ...user?.profile,
          ...formData
        }
      };

      // Обновляем пользователя
      updateUser(updatedUser);

      // Обновляем профиль в зависимости от роли
      if (user?.role === 'student') {
        updateStudentProfile(user.id, formData as StudentProfile);
      } else if (user?.role === 'teacher') {
        updateTeacherProfile(user.id, formData as TeacherProfile);
      }

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleArrayChange = (field: 'subjects' | 'grades', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Редактировать профиль</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Загрузка аватара */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="h-12 w-12 text-white" />
                  )}
                </div>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Загрузить фото</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Основная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">О себе</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Расскажите о себе..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Страна</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {user?.role === 'teacher' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Опыт</label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {experiences.map(exp => (
                        <option key={exp} value={exp}>
                          {exp === 'beginner' ? 'Начинающий' : exp === 'experienced' ? 'Опытный' : 'Профессионал'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Рейтинг</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Цена за час (₽)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Предметы</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {subjects.map(subject => (
                      <label key={subject} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.subjects.includes(subject)}
                          onChange={() => handleArrayChange('subjects', subject)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Классы</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {grades.map(grade => (
                      <label key={grade} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.grades.includes(grade)}
                          onChange={() => handleArrayChange('grades', grade)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{grade}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Формат</label>
                    <select
                      value={formData.format}
                      onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {formats.map(format => (
                        <option key={format} value={format}>
                          {format === 'online' ? 'Онлайн' : format === 'offline' ? 'Оффлайн' : 'Мини-группа'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Длительность (мин)</label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {durations.map(duration => (
                        <option key={duration} value={duration}>{duration}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Активный</option>
                      <option value="inactive">Неактивный</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;