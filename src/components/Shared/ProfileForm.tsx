import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Camera, Save, Edit3, X, Star, Award, BookOpen, Users, MapPin, Calendar, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { StudentProfile, TeacherProfile } from '../../types';

const ProfileForm: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { updateStudentProfile, updateTeacherProfile } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Состояние профиля
  const [profile, setProfile] = useState<StudentProfile | TeacherProfile>(() => {
    if (user?.profile) {
      return user.profile;
    }
    
    // Создаем базовый профиль в зависимости от роли
    if (user?.role === 'teacher') {
      return {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: '',
        bio: '',
        subjects: [],
        experience: 'beginner',
        education: '',
        rating: 0,
        lessonsCount: 0,
        students: [],
        achievements: [],
        specializations: [],
        hourlyRate: 1000,
        availability: 'flexible',
        location: '',
        languages: ['Русский'],
        certificates: []
      } as TeacherProfile;
    } else {
      return {
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        avatar: '',
        bio: '',
        grade: '',
        interests: [],
        goals: [],
        parentContact: '',
        school: '',
        achievements: [],
        learningStyle: 'visual',
        preferredSubjects: [],
        availability: 'flexible'
      } as StudentProfile;
    }
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Обработка загрузки аватара
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Обработка изменения полей
  const handleFieldChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Обработка добавления предмета (для преподавателей)
  const handleAddSubject = () => {
    if (user?.role === 'teacher') {
      const newSubject = prompt('Введите название предмета:');
      if (newSubject && newSubject.trim()) {
        setProfile(prev => ({
          ...prev,
          subjects: [...(prev as TeacherProfile).subjects, newSubject.trim()]
        }));
      }
    }
  };

  // Обработка удаления предмета
  const handleRemoveSubject = (index: number) => {
    if (user?.role === 'teacher') {
      setProfile(prev => ({
        ...prev,
        subjects: (prev as TeacherProfile).subjects.filter((_, i) => i !== index)
      }));
    }
  };

  // Сохранение профиля
  const handleSave = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Обновляем аватар если загружен новый
      if (avatarFile) {
        // В реальном приложении здесь была бы загрузка на сервер
        const avatarUrl = URL.createObjectURL(avatarFile);
        setProfile(prev => ({ ...prev, avatar: avatarUrl }));
      }

      // Обновляем профиль
      if (user.role === 'teacher') {
        await updateTeacherProfile(user.id, profile as TeacherProfile);
      } else {
        await updateStudentProfile(user.id, profile as StudentProfile);
      }

      // Обновляем профиль в контексте аутентификации
      updateProfile(profile);
      
      setShowSuccess(true);
      setIsEditing(false);
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Отмена редактирования
  const handleCancel = () => {
    setProfile(user?.profile || profile);
    setAvatarFile(null);
    setAvatarPreview('');
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Профиль пользователя</h1>
        <p className="text-gray-600">Управляйте своими личными данными и настройками</p>
      </div>

      {/* Уведомление об успехе */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center space-x-3 animate-slide-in-top">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Star className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-green-800 font-medium">Профиль успешно обновлен!</span>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Основная информация */}
        <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Основная информация</h2>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-200"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Редактировать</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-8">
            {/* Аватар */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                {avatarPreview || profile.avatar ? (
                  <img 
                    src={avatarPreview || profile.avatar} 
                    alt="Avatar" 
                    className="w-full h-full rounded-3xl object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-white" />
                )}
              </div>
              
              {isEditing && (
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                  <Camera className="h-5 w-5 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Основные поля */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>

                {user.role === 'teacher' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Почасовая ставка (₽)</label>
                    <input
                      type="number"
                      value={(profile as TeacherProfile).hourlyRate || 0}
                      onChange={(e) => handleFieldChange('hourlyRate', parseInt(e.target.value))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                {user.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Класс/Курс</label>
                    <input
                      type="text"
                      value={(profile as StudentProfile).grade || ''}
                      onChange={(e) => handleFieldChange('grade', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Например: 10 класс, 2 курс"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">О себе</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleFieldChange('bio', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Расскажите о себе, своих интересах и целях..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Специфичные для роли поля */}
        {user.role === 'teacher' && (
          <div className="p-8 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <GraduationCap className="h-6 w-6 mr-2 text-blue-600" />
              Преподавательская информация
            </h3>
            
            <div className="space-y-6">
              {/* Предметы */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Предметы</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(profile as TeacherProfile).subjects?.map((subject, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
                      <span className="text-sm font-medium">{subject}</span>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSubject(index)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <button
                    onClick={handleAddSubject}
                    className="px-4 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-200"
                  >
                    + Добавить предмет
                  </button>
                )}
              </div>

              {/* Опыт и образование */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Опыт работы</label>
                  <select
                    value={(profile as TeacherProfile).experience}
                    onChange={(e) => handleFieldChange('experience', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="beginner">Начинающий (до 1 года)</option>
                    <option value="experienced">Опытный (1-5 лет)</option>
                    <option value="professional">Профессионал (5+ лет)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Образование</label>
                  <input
                    type="text"
                    value={(profile as TeacherProfile).education || ''}
                    onChange={(e) => handleFieldChange('education', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Укажите ваше образование"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Статистика */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {(profile as TeacherProfile).rating || 0}
                  </div>
                  <div className="text-sm text-blue-700">Рейтинг</div>
                </div>
                
                <div className="bg-green-50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {(profile as TeacherProfile).lessonsCount || 0}
                  </div>
                  <div className="text-sm text-green-700">Проведено уроков</div>
                </div>
                
                <div className="bg-purple-50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {(profile as TeacherProfile).students?.length || 0}
                  </div>
                  <div className="text-sm text-purple-700">Учеников</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {user.role === 'student' && (
          <div className="p-8 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-green-600" />
              Учебная информация
            </h3>
            
            <div className="space-y-6">
              {/* Школа/Университет */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Учебное заведение</label>
                <input
                  type="text"
                  value={(profile as StudentProfile).school || ''}
                  onChange={(e) => handleFieldChange('school', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Название школы или университета"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Цели обучения */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Цели обучения</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Подготовка к экзаменам', 'Помощь с домашним заданием', 'Углубленное изучение', 'Разговорная практика'].map((goal) => (
                    <label key={goal} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(profile as StudentProfile).goals?.includes(goal) || false}
                        onChange={(e) => {
                          const currentGoals = (profile as StudentProfile).goals || [];
                          if (e.target.checked) {
                            handleFieldChange('goals', [...currentGoals, goal]);
                          } else {
                            handleFieldChange('goals', currentGoals.filter(g => g !== goal));
                          }
                        }}
                        disabled={!isEditing}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{goal}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Стиль обучения */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Стиль обучения</label>
                <select
                  value={(profile as StudentProfile).learningStyle}
                  onChange={(e) => handleFieldChange('learningStyle', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="visual">Визуальный</option>
                  <option value="auditory">Аудиальный</option>
                  <option value="kinesthetic">Кинестетический</option>
                  <option value="mixed">Смешанный</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Дополнительная информация */}
        <div className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Award className="h-6 w-6 mr-2 text-purple-600" />
            Дополнительная информация
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Местоположение</label>
              <input
                type="text"
                value={(profile as any).location || ''}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                disabled={!isEditing}
                placeholder="Город или район"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Доступность</label>
              <select
                value={(profile as any).availability || 'flexible'}
                onChange={(e) => handleFieldChange('availability', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="flexible">Гибкий график</option>
                <option value="weekdays">По будням</option>
                <option value="weekends">По выходным</option>
                <option value="evenings">По вечерам</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;