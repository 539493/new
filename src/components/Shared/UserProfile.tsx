import React, { useState, useEffect } from 'react';
import { User, Edit3, Save, X, Camera, Star, Award, BookOpen, Users, MapPin, Phone, Mail, Globe, Calendar, Clock, Target, GraduationCap, Briefcase, Heart, Zap, Shield, Settings } from 'lucide-react';
import { User as UserType, StudentProfile, TeacherProfile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface UserProfileProps {
  user: UserType;
  isEditable?: boolean;
  onProfileUpdate?: (updatedProfile: Partial<StudentProfile | TeacherProfile>) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  isEditable = false, 
  onProfileUpdate 
}) => {
  const { updateUser } = useAuth();
  const { lessons, timeSlots } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<StudentProfile | TeacherProfile>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Статистика пользователя
  const userStats = {
    totalLessons: lessons.filter(l => 
      user.role === 'student' ? l.studentId === user.id : l.teacherId === user.id
    ).length,
    completedLessons: lessons.filter(l => 
      (user.role === 'student' ? l.studentId === user.id : l.teacherId === user.id) && 
      l.status === 'completed'
    ).length,
    rating: user.role === 'teacher' ? (user.profile as TeacherProfile)?.rating || 0 : 0,
    experience: user.role === 'teacher' ? (user.profile as TeacherProfile)?.experience || 'beginner' : null,
    subjects: user.role === 'teacher' ? (user.profile as TeacherProfile)?.subjects || [] : [],
    achievements: user.role === 'student' ? (user.profile as StudentProfile)?.achievements || [] : [],
    goals: user.role === 'student' ? (user.profile as StudentProfile)?.goals || [] : []
  };

  useEffect(() => {
    if (user.profile) {
      setEditForm(user.profile);
    }
  }, [user.profile]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(user.profile || {});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(user.profile || {});
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSave = async () => {
    try {
      if (onProfileUpdate) {
        await onProfileUpdate(editForm);
      }
      
      if (avatarFile) {
        // TODO: Загрузка аватара на сервер
        console.log('Uploading avatar:', avatarFile);
      }
      
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getExperienceText = (experience: string) => {
    switch (experience) {
      case 'beginner':
        return 'Начинающий';
      case 'experienced':
        return 'Опытный';
      case 'professional':
        return 'Профессионал';
      default:
        return experience;
    }
  };

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'experienced':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'professional':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Заголовок профиля */}
      <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Аватар */}
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt={user.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white/80" />
                )}
              </div>
              
              {isEditable && (
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all duration-200 shadow-lg">
                  <Camera className="w-4 h-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Основная информация */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-xl text-white/90 mb-3">
                {user.role === 'teacher' ? 'Преподаватель' : 'Студент'}
              </p>
              
              {user.role === 'teacher' && userStats.experience && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getExperienceColor(userStats.experience)}`}>
                  {getExperienceText(userStats.experience)}
                </span>
              )}
            </div>
          </div>

          {/* Кнопки действий */}
          {isEditable && (
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-2xl hover:bg-white/30 transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                    <span>Сохранить</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-2xl hover:bg-white/30 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Отмена</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-2xl hover:bg-white/30 transition-all duration-200"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Редактировать</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Статистика */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{userStats.totalLessons}</div>
            <div className="text-gray-600">Всего уроков</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{userStats.completedLessons}</div>
            <div className="text-gray-600">Завершено</div>
          </div>

          {user.role === 'teacher' ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{userStats.rating}</div>
              <div className="text-gray-600">Рейтинг</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{userStats.goals.length}</div>
              <div className="text-gray-600">Цели</div>
            </div>
          )}

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {user.role === 'teacher' ? userStats.subjects.length : userStats.achievements.length}
            </div>
            <div className="text-gray-600">
              {user.role === 'teacher' ? 'Предметов' : 'Достижений'}
            </div>
          </div>
        </div>

        {/* Детальная информация */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Основная информация */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Основная информация</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{user.email}</span>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{user.phone}</span>
              </div>

              {user.profile?.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{user.profile.location}</span>
                </div>
              )}

              {user.profile?.bio && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">О себе</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Расскажите о себе..."
                    />
                  ) : (
                    <p className="text-gray-700">{user.profile.bio}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Специализация / Цели */}
          <div className="space-y-6">
            {user.role === 'teacher' ? (
              <>
                <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  <span>Специализация</span>
                </h3>

                <div className="space-y-4">
                  {userStats.subjects.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Предметы</label>
                      {isEditing ? (
                        <div className="space-y-2">
                          {userStats.subjects.map((subject, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={subject}
                                onChange={(e) => {
                                  const newSubjects = [...userStats.subjects];
                                  newSubjects[index] = e.target.value;
                                  handleInputChange('subjects', newSubjects);
                                }}
                                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              />
                              <button
                                onClick={() => {
                                  const newSubjects = userStats.subjects.filter((_, i) => i !== index);
                                  handleInputChange('subjects', newSubjects);
                                }}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newSubjects = [...userStats.subjects, ''];
                              handleInputChange('subjects', newSubjects);
                            }}
                            className="px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 text-sm"
                          >
                            + Добавить предмет
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {userStats.subjects.map((subject, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {user.profile?.education && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Образование</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.education || ''}
                          onChange={(e) => handleInputChange('education', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Укажите образование..."
                        />
                      ) : (
                        <p className="text-gray-700">{user.profile.education}</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  <span>Цели обучения</span>
                </h3>

                <div className="space-y-4">
                  {userStats.goals.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Цели</label>
                      {isEditing ? (
                        <div className="space-y-2">
                          {userStats.goals.map((goal, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={goal}
                                onChange={(e) => {
                                  const newGoals = [...userStats.goals];
                                  newGoals[index] = e.target.value;
                                  handleInputChange('goals', newGoals);
                                }}
                                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              />
                              <button
                                onClick={() => {
                                  const newGoals = userStats.goals.filter((_, i) => i !== index);
                                  handleInputChange('goals', newGoals);
                                }}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newGoals = [...userStats.goals, ''];
                              handleInputChange('goals', newGoals);
                            }}
                            className="px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 text-sm"
                          >
                            + Добавить цель
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {userStats.goals.map((goal, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                            >
                              {goal}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {user.profile?.grade && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Класс</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.grade || ''}
                          onChange={(e) => handleInputChange('grade', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Укажите класс..."
                        />
                      ) : (
                        <p className="text-gray-700">{user.profile.grade}</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Достижения (для студентов) */}
        {user.role === 'student' && userStats.achievements.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2 mb-6">
              <Award className="w-5 h-5 text-yellow-600" />
              <span>Достижения</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userStats.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-yellow-800">{achievement}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;






