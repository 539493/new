import React, { useState, useEffect } from 'react';
import { Save, Upload, Settings, Bell, Lock, User as UserIcon, Palette, Database, Monitor, BookOpen, MessageCircle, FileText, Star, Plus, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StudentProfile, TeacherProfile } from '../../types';
import { useData } from '../../contexts/DataContext';
import Modal from './Modal';
import PostEditor from './PostEditor';
import PostCard from './PostCard';
import StudentProfileDisplayModal from '../Student/StudentProfileDisplayModal';
import StudentProfileEditModal from '../Student/StudentProfileEditModal';

const ProfileForm: React.FC = () => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const { 
    updateStudentProfile, 
    updateTeacherProfile, 
    lessons, 
    posts, 
    createPost, 
    addReaction, 
    addComment, 
    sharePost, 
    bookmarkPost, 
    editPost, 
    deletePost 
  } = useData();
  
  const [editMode, setEditMode] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTeacherEditModal, setShowTeacherEditModal] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
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
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>({
    subjects: [],
    experience: 'experienced',
    grades: [],
    goals: [],
    lessonTypes: [],
    durations: [],
    formats: [],
    offlineAvailable: false,
    city: '',
    overbookingEnabled: false,
    bio: '',
    avatar: '',
    rating: 0,
    hourlyRate: 1500,
    age: undefined,
    experienceYears: undefined,
    teacherType: 'private',
    education: {
      university: '',
      degree: '',
      graduationYear: undefined,
      courses: []
    }
  });
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  const subjects = ['Математика', 'Русский язык', 'Английский язык'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'Студент', 'Взрослый'];
  const goals = ['подготовка к экзаменам', 'помощь с домашним заданием', 'углубленное изучение', 'разговорная практика'];
  const experiences = ['beginner', 'experienced', 'professional'];
  const durations = [45, 60];
  const formats = ['online', 'offline', 'mini-group'];

  useEffect(() => {
    if (user?.profile) {
      if (user.role === 'student') {
        const profile = user.profile as StudentProfile;
        setStudentProfile({
          ...studentProfile,
          ...profile
        });
      } else {
        const profile = user.profile as TeacherProfile;
        setTeacherProfile({
          ...teacherProfile,
          ...profile,
          education: {
            university: '',
            degree: '',
            graduationYear: undefined,
            courses: []
          }
        });
      }
    } else if (user && !user.profile) {
      // Если у пользователя нет профиля, создаем базовый
      const baseProfile = user.role === 'teacher' ? {
        subjects: [],
        experience: 'experienced' as const,
        grades: [],
        goals: [],
        lessonTypes: [],
        durations: [],
        formats: [],
        offlineAvailable: false,
        city: '',
        overbookingEnabled: false,
        bio: '',
        avatar: '',
        rating: 0,
        hourlyRate: 1500,
        age: undefined,
        experienceYears: undefined,
        teacherType: 'private' as const,
        education: {
          university: '',
          degree: '',
          graduationYear: undefined,
          courses: []
        }
      } as TeacherProfile : {
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
        learningStyle: 'mixed' as const,
        experience: 'beginner' as const,
        preferredFormats: [],
        preferredDurations: [],
        timeZone: '',
      } as StudentProfile;
      
      // Обновляем профиль пользователя
      updateProfile(baseProfile);
    }
  }, [user]);

  const handleSave = () => {
    if (!user) return;
    const profile = user.role === 'student' ? studentProfile : teacherProfile;
    updateProfile(profile);
    if (user.role === 'student') {
      updateStudentProfile(user.id, studentProfile);
    } else if (user.role === 'teacher') {
      updateTeacherProfile(user.id, { ...teacherProfile, name: user.name, email: user.email });
    }
    setEditMode(false);
    alert('Профиль сохранен!');
  };

  const getExperienceLabel = (exp: string) => {
    switch (exp) {
      case 'beginner': return 'Начинающий';
      case 'experienced': return 'Опытный';
      case 'professional': return 'Профессионал';
      default: return exp;
    }
  };

  const getTeacherTypeLabel = (type: string) => {
    switch (type) {
      case 'private': return 'Частный преподаватель';
      case 'school': return 'Преподаватель школы';
      case 'both': return 'Частный + Школа';
      default: return 'Частный преподаватель';
    }
  };

  // Статистика для ученика
  let studentLessonsCount = 0;
  let uniqueTeachersCount = 0;
  if (user && user.role === 'student' && Array.isArray(lessons)) {
    const studentLessons = lessons.filter(l => l.studentId === user.id);
    studentLessonsCount = studentLessons.length;
    uniqueTeachersCount = Array.from(new Set(studentLessons.map(l => l.teacherId))).length;
  }

  // ----- UI -----
  if (!user) return null;

  // Функция для загрузки аватара (универсальная для студента и преподавателя)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (ev) => {
        try {
          const avatarUrl = ev.target?.result as string;
          
          if (user.role === 'student') {
            const updatedProfile = { ...studentProfile, avatar: avatarUrl };
            setStudentProfile(updatedProfile);
            // Автоматически сохраняем и синхронизируем
            updateProfile(updatedProfile);
            updateStudentProfile(user.id, updatedProfile);
            console.log(' Аватар студента сохранен');
          } else {
            const updatedProfile = { ...teacherProfile, avatar: avatarUrl };
            setTeacherProfile(updatedProfile);
            // Автоматически сохраняем и синхронизируем
            updateProfile(updatedProfile);
            updateTeacherProfile(user.id, { ...updatedProfile, name: user.name, email: user.email });
            console.log(' Аватар преподавателя сохранен');
          }
        } catch (error) {
          console.error(' Ошибка при сохранении аватара:', error);
          alert('Ошибка при сохранении фото. Попробуйте еще раз.');
        }
      };

      reader.onerror = () => {
        console.error(' Ошибка чтения файла');
        alert('Ошибка при чтении файла. Попробуйте выбрать другое изображение.');
      };

      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = (updatedProfile: StudentProfile) => {
    setStudentProfile(updatedProfile);
    // Сохраняем в локального пользователя и на сервере, как при обычном сохранении
    if (user) {
      updateProfile(updatedProfile);
      updateStudentProfile(user.id, updatedProfile);
    }
    setShowEditModal(false);
  };

  const handleTeacherProfileSave = (updatedProfile: TeacherProfile) => {
    setTeacherProfile(updatedProfile);
    setShowTeacherEditModal(false);
    // Сохраняем профиль
    if (user) {
      updateProfile(updatedProfile);
      updateTeacherProfile(user.id, { ...updatedProfile, name: user.name, email: user.email });
    }
    alert('Профиль преподавателя сохранен!');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Верхний блок профиля */}
      <div className="flex items-center gap-4 mb-6 relative">
        <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden shadow-lg">
          {user.profile?.avatar ? (
            <img src={user.profile.avatar} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <UserIcon className="h-10 w-10 text-white" />
                )}
              </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{user ? user.name : ''}</span>
            {user && user.nickname && <span className="text-gray-400 text-sm">@{user.nickname}</span>}
          </div>
          {/* Статистика для ученика */}
          {user && user.role === 'student' && (
            <div className="flex gap-4 mt-2">
              <div className="text-center">
                <div className="text-base font-bold text-gray-900 flex items-center justify-center gap-1">
                  <BookOpen className="w-5 h-5 text-blue-500 mr-1" />
                  {studentLessonsCount}
                </div>
                <div className="text-xs text-gray-500">Пройдено уроков</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-gray-900 flex items-center justify-center gap-1">
                  <UserIcon className="w-5 h-5 text-green-500 mr-1" />
                  {uniqueTeachersCount}
                </div>
                <div className="text-xs text-gray-500">Учителей</div>
              </div>
            </div>
          )}
            </div>
        <div className="flex items-center gap-2 ml-4">
          {user.role === 'student' ? (
            <>
              <button
                className="btn-primary text-sm px-3 py-2"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Редактировать
              </button>
            </>
          ) : (
            <button
              className="btn-primary text-sm px-3 py-2"
              onClick={() => setShowTeacherEditModal(true)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Редактировать
            </button>
          )}
              <button
            className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-blue-600 rounded-full p-2 shadow transition-colors duration-150 focus:outline-none"
            style={{ width: 36, height: 36 }}
            aria-label="Настройки"
            onClick={() => setSettingsModalOpen(true)}
          >
            <Settings className="w-5 h-5" />
              </button>
            </div>
      </div>
      {/* Блок информации */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6 text-sm flex flex-col gap-2 card-gradient">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1">
            {/* Переносим в блок 'О себе' */}
          </div>
          {/* Удалить блок с кнопкой 'Контактная информация' и само модальное окно */}
        </div>
      </div>
      {/* Блок 'О себе' */}
      <div className="bg-white rounded-2xl shadow p-5 mb-6 card-gradient">
        <h3 className="text-base font-bold text-gray-900 mb-3">О себе</h3>
        
        {/* Описание */}
        <div className="text-gray-700 whitespace-pre-line leading-relaxed mb-4 text-sm">
          {user.role === 'student' ? studentProfile.bio || '' : user.profile?.bio || ''}
        </div>
        
        {/* Информация для ученика */}
        {user.role === 'student' && (
          <div className="space-y-3">
            {/* Предметы */}
            {studentProfile.subjects && studentProfile.subjects.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Предметы:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {studentProfile.subjects.map((subject, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Основная информация */}
            {(studentProfile.age || studentProfile.school || studentProfile.city) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {studentProfile.age && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Возраст:</span>
                    <span className="text-sm text-gray-900 ml-1">{studentProfile.age} лет</span>
                  </div>
                )}
                {studentProfile.school && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Школа:</span>
                    <span className="text-sm text-gray-900 ml-1">{studentProfile.school}</span>
                  </div>
                )}
                {studentProfile.city && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Город:</span>
                    <span className="text-sm text-gray-900 ml-1">{studentProfile.city}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Цели обучения */}
            {studentProfile.goals && studentProfile.goals.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Цели обучения:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {studentProfile.goals.map((goal, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Интересы */}
            {studentProfile.interests && studentProfile.interests.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Интересы:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {studentProfile.interests.map((interest, index) => (
                    <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Стиль обучения и уровень */}
            {(studentProfile.learningStyle || studentProfile.experience) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {studentProfile.learningStyle && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Стиль обучения:</span>
                    <span className="text-sm text-gray-900 ml-1">
                      {studentProfile.learningStyle === 'visual' ? 'Визуальный' :
                       studentProfile.learningStyle === 'auditory' ? 'Аудиальный' :
                       studentProfile.learningStyle === 'kinesthetic' ? 'Кинестетический' :
                       'Смешанный'}
                    </span>
                  </div>
                )}
                {studentProfile.experience && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Уровень:</span>
                    <span className="text-sm text-gray-900 ml-1">
                      {studentProfile.experience === 'beginner' ? 'Начинающий' :
                       studentProfile.experience === 'intermediate' ? 'Средний' :
                       'Продвинутый'}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Предпочтения по форматам и длительности */}
            {((studentProfile.preferredFormats && studentProfile.preferredFormats.length > 0) || 
              (studentProfile.preferredDurations && studentProfile.preferredDurations.length > 0)) && (
              <div className="space-y-2">
                {studentProfile.preferredFormats && studentProfile.preferredFormats.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Форматы:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {studentProfile.preferredFormats.map((format, index) => (
                        <span key={index} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                          {format === 'online' ? 'Онлайн' : format === 'offline' ? 'Оффлайн' : 'Мини-группа'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {studentProfile.preferredDurations && studentProfile.preferredDurations.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Длительность:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {studentProfile.preferredDurations.map((duration, index) => (
                        <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          {duration} мин
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Информация для преподавателя */}
        {user.role === 'teacher' && (
          <div className="space-y-3">
            {/* Предметы */}
            {teacherProfile.subjects && teacherProfile.subjects.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Предметы:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {teacherProfile.subjects.map((subject, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Классы */}
            {teacherProfile.grades && teacherProfile.grades.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Классы:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {teacherProfile.grades.map((grade, index) => (
                    <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {grade}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Основная информация */}
            {(teacherProfile.city || teacherProfile.age || teacherProfile.experienceYears) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {teacherProfile.city && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Город:</span>
                    <span className="text-sm text-gray-900 ml-1">{teacherProfile.city}</span>
                  </div>
                )}
                {teacherProfile.age && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Возраст:</span>
                    <span className="text-sm text-gray-900 ml-1">{teacherProfile.age} лет</span>
                  </div>
                )}
                {teacherProfile.experienceYears && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Опыт:</span>
                    <span className="text-sm text-gray-900 ml-1">{teacherProfile.experienceYears} лет</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Уровень опыта и тип преподавателя */}
            {(teacherProfile.experience || teacherProfile.teacherType) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {teacherProfile.experience && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Уровень:</span>
                    <span className="text-sm text-gray-900 ml-1">{getExperienceLabel(teacherProfile.experience)}</span>
                  </div>
                )}
                {teacherProfile.teacherType && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Тип:</span>
                    <span className="text-sm text-gray-900 ml-1">{getTeacherTypeLabel(teacherProfile.teacherType)}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Цели обучения */}
            {teacherProfile.goals && teacherProfile.goals.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Цели обучения:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {teacherProfile.goals.map((goal, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Форматы и длительность */}
            {((teacherProfile.formats && teacherProfile.formats.length > 0) || 
              (teacherProfile.durations && teacherProfile.durations.length > 0)) && (
              <div className="space-y-2">
                {teacherProfile.formats && teacherProfile.formats.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Форматы:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacherProfile.formats.map((format, index) => (
                        <span key={index} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                          {format === 'online' ? 'Онлайн' : format === 'offline' ? 'Оффлайн' : 'Мини-группа'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {teacherProfile.durations && teacherProfile.durations.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Длительность:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacherProfile.durations.map((duration, index) => (
                        <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          {duration} мин
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Стоимость */}
            {teacherProfile.hourlyRate && (
              <div>
                <span className="text-sm font-medium text-gray-600">Стоимость:</span>
                <span className="text-sm text-gray-900 ml-1">{teacherProfile.hourlyRate} руб/час</span>
              </div>
            )}
            
            {/* Образование */}
            {teacherProfile.education && (teacherProfile.education.university || teacherProfile.education.degree) && (
              <div className="border-t pt-3">
                <span className="text-sm font-medium text-gray-600">Образование:</span>
                <div className="mt-1 space-y-1">
                  {teacherProfile.education.university && (
                    <div className="text-sm text-gray-900">{teacherProfile.education.university}</div>
                  )}
                  {teacherProfile.education.degree && (
                    <div className="text-sm text-gray-700">{teacherProfile.education.degree}</div>
                  )}
                  {teacherProfile.education.graduationYear && (
                    <div className="text-sm text-gray-500">Год окончания: {teacherProfile.education.graduationYear}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Модальные окна */}
      <StudentProfileDisplayModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <StudentProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleProfileSave}
      />

      {/* Модальное окно редактирования профиля преподавателя */}
      <Modal open={showTeacherEditModal} onClose={() => setShowTeacherEditModal(false)}>
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="text-lg font-bold mb-4 text-center">Редактирование профиля преподавателя</div>
          
          <div className="space-y-6">
            {/* Аватар */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden shadow-lg mx-auto">
                  {teacherProfile.avatar ? (
                    <img src={teacherProfile.avatar} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
                  ) : (
                    <UserIcon className="h-12 w-12 text-white" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
                  <Upload className="w-4 h-4" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">О себе (био)</label>
                <textarea
                  value={teacherProfile.bio || ''}
                  onChange={(e) => setTeacherProfile({...teacherProfile, bio: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Расскажите о себе..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
                <input
                  type="text"
                  value={teacherProfile.city || ''}
                  onChange={(e) => setTeacherProfile({...teacherProfile, city: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ваш город"
                />
              </div>
            </div>

            {/* Предметы */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Предметы</label>
              <div className="flex flex-wrap gap-2">
                {subjects.map(subject => (
                  <label key={subject} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={teacherProfile.subjects?.includes(subject) || false}
                      onChange={(e) => {
                        const newSubjects = e.target.checked
                          ? [...(teacherProfile.subjects || []), subject]
                          : (teacherProfile.subjects || []).filter(s => s !== subject);
                        setTeacherProfile({...teacherProfile, subjects: newSubjects});
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Классы */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Классы</label>
              <div className="flex flex-wrap gap-2">
                {grades.map(grade => (
                  <label key={grade} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={teacherProfile.grades?.includes(grade) || false}
                      onChange={(e) => {
                        const newGrades = e.target.checked
                          ? [...(teacherProfile.grades || []), grade]
                          : (teacherProfile.grades || []).filter(g => g !== grade);
                        setTeacherProfile({...teacherProfile, grades: newGrades});
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{grade}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Опыт и тип преподавателя */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Уровень опыта</label>
                <select
                  value={teacherProfile.experience || 'experienced'}
                  onChange={(e) => setTeacherProfile({...teacherProfile, experience: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Начинающий</option>
                  <option value="experienced">Опытный</option>
                  <option value="professional">Профессионал</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип преподавателя</label>
                <select
                  value={teacherProfile.teacherType || 'private'}
                  onChange={(e) => setTeacherProfile({...teacherProfile, teacherType: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="private">Частный преподаватель</option>
                  <option value="school">Преподаватель школы</option>
                  <option value="both">Частный + Школа</option>
                </select>
              </div>
            </div>

            {/* Возраст и годы опыта */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Возраст</label>
                <input
                  type="number"
                  value={teacherProfile.age || ''}
                  onChange={(e) => setTeacherProfile({...teacherProfile, age: parseInt(e.target.value) || undefined})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ваш возраст"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Годы опыта</label>
                <input
                  type="number"
                  value={teacherProfile.experienceYears || ''}
                  onChange={(e) => setTeacherProfile({...teacherProfile, experienceYears: parseInt(e.target.value) || undefined})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Количество лет опыта"
                />
              </div>
            </div>

            {/* Цели обучения */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Цели обучения</label>
              <div className="flex flex-wrap gap-2">
                {goals.map(goal => (
                  <label key={goal} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={teacherProfile.goals?.includes(goal) || false}
                      onChange={(e) => {
                        const newGoals = e.target.checked
                          ? [...(teacherProfile.goals || []), goal]
                          : (teacherProfile.goals || []).filter(g => g !== goal);
                        setTeacherProfile({...teacherProfile, goals: newGoals});
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{goal}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Форматы и длительность */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Форматы занятий</label>
                <div className="flex flex-wrap gap-2">
                  {formats.map(format => (
                    <label key={format} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={teacherProfile.formats?.includes(format) || false}
                        onChange={(e) => {
                          const newFormats = e.target.checked
                            ? [...(teacherProfile.formats || []), format]
                            : (teacherProfile.formats || []).filter(f => f !== format);
                          setTeacherProfile({...teacherProfile, formats: newFormats});
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {format === 'online' ? 'Онлайн' : format === 'offline' ? 'Оффлайн' : 'Мини-группа'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Длительность занятий</label>
                <div className="flex flex-wrap gap-2">
                  {durations.map(duration => (
                    <label key={duration} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={teacherProfile.durations?.includes(duration) || false}
                        onChange={(e) => {
                          const newDurations = e.target.checked
                            ? [...(teacherProfile.durations || []), duration]
                            : (teacherProfile.durations || []).filter(d => d !== duration);
                          setTeacherProfile({...teacherProfile, durations: newDurations});
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{duration} мин</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Стоимость часа */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Стоимость за час (руб.)</label>
              <input
                type="number"
                value={teacherProfile.hourlyRate || 1500}
                onChange={(e) => setTeacherProfile({...teacherProfile, hourlyRate: parseInt(e.target.value) || 1500})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1500"
              />
            </div>

            {/* Образование */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Образование</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Университет</label>
                  <input
                    type="text"
                    value={teacherProfile.education?.university || ''}
                    onChange={(e) => setTeacherProfile({
                      ...teacherProfile, 
                      education: {...teacherProfile.education, university: e.target.value}
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Название университета"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Степень/Специальность</label>
                  <input
                    type="text"
                    value={teacherProfile.education?.degree || ''}
                    onChange={(e) => setTeacherProfile({
                      ...teacherProfile, 
                      education: {...teacherProfile.education, degree: e.target.value}
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Степень или специальность"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Год окончания</label>
                  <input
                    type="number"
                    value={teacherProfile.education?.graduationYear || ''}
                    onChange={(e) => setTeacherProfile({
                      ...teacherProfile, 
                      education: {...teacherProfile.education, graduationYear: parseInt(e.target.value) || undefined}
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2020"
                  />
                </div>
              </div>
            </div>

            {/* Дополнительные настройки */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Дополнительные настройки</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={teacherProfile.offlineAvailable || false}
                    onChange={(e) => setTeacherProfile({...teacherProfile, offlineAvailable: e.target.checked})}
                    className="mr-3"
                  />
                  <span className="text-sm">Доступен для оффлайн занятий</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={teacherProfile.overbookingEnabled || false}
                    onChange={(e) => setTeacherProfile({...teacherProfile, overbookingEnabled: e.target.checked})}
                    className="mr-3"
                  />
                  <span className="text-sm">Разрешить перебронирование</span>
                </label>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              onClick={() => setShowTeacherEditModal(false)}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={() => handleTeacherProfileSave(teacherProfile)}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              Сохранить
            </button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно контактов */}
      <Modal open={contactModalOpen} onClose={() => setContactModalOpen(false)}>
        <div className="text-base font-bold mb-2">Контактная информация</div>
        <div className="mb-2 text-sm"><span className="font-semibold">Email:</span> {user.email}</div>
        {/* Можно добавить другие контакты */}
      </Modal>
      {/* Модальное окно настроек */}
      <Modal open={settingsModalOpen} onClose={() => setSettingsModalOpen(false)}>
        <div className="w-[320px] max-w-full">
          <div className="text-lg font-bold mb-4 text-center">Настройки</div>
          <div className="flex flex-col gap-1">
            <button
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
              onClick={() => { setSettingsModalOpen(false); setPushModalOpen(true); }}
            >
              <Bell className="w-5 h-5 text-red-500" />
              <span className="flex-1">Push-уведомления</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left">
              <Lock className="w-5 h-5 text-gray-700" />
              <span className="flex-1">Конфиденциальность</span>
            </button>
            <button
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
              onClick={() => { setSettingsModalOpen(false); setAccountModalOpen(true); }}
            >
              <UserIcon className="w-5 h-5 text-blue-500" />
              <span className="flex-1">Аккаунт</span>
            </button>
            {/* Тема */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-purple-500" />
                <span className="flex-1">Тема</span>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-300'}`}
                onClick={() => {
                  const newTheme = theme === 'dark' ? 'light' : 'dark';
                  setTheme(newTheme);
                  if (newTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  localStorage.setItem('theme', newTheme);
                }}
                aria-pressed={theme === 'dark'}
                type="button"
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-1'}`}></span>
              </button>
            </div>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left">
              <Database className="w-5 h-5 text-green-500" />
              <span className="flex-1">Память</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left">
              <Monitor className="w-5 h-5 text-indigo-500" />
              <span className="flex-1">Устройства</span>
            </button>
            <div className="border-t my-2" />
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span className="flex-1">База знаний</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="flex-1">Поддержка</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left">
              <FileText className="w-5 h-5 text-blue-700" />
              <span className="flex-1">Документация</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="flex-1">Оценить приложение</span>
            </button>
          </div>
        </div>
      </Modal>
      {/* Модальное окно push-уведомлений */}
      <Modal open={pushModalOpen} onClose={() => setPushModalOpen(false)}>
        <div className="w-[340px] max-w-full">
          <div className="flex items-center mb-4">
            <button onClick={() => setPushModalOpen(false)} className="mr-2 p-1 rounded hover:bg-gray-100">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-5 h-5 text-gray-500"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            </button>
            <div className="text-lg font-bold text-center flex-1">Уведомления</div>
          </div>
          {/* Группы уведомлений */}
          <div className="text-xs font-semibold text-gray-500 mb-1 mt-2">СООБЩЕНИЯ</div>
          <div className="bg-gray-50 rounded-xl mb-4 overflow-hidden">
            <SwitchRow label="Личные сообщения" />
            <SwitchRow label="Инфобот" />
            <SwitchRow label="Лиды" />
          </div>
          <div className="text-xs font-semibold text-gray-500 mb-1 mt-2">ПУБЛИКАЦИИ ОТ ПОДПИСОК</div>
          <div className="bg-gray-50 rounded-xl mb-4 overflow-hidden">
            <SwitchRow label="Новые публикации" />
          </div>
          <div className="text-xs font-semibold text-gray-500 mb-1 mt-2">ПОДПИСЧИКИ И ДЕЛОВЫЕ СВЯЗИ</div>
          <div className="bg-gray-50 rounded-xl mb-4 overflow-hidden">
            <SwitchRow label="Новые подписчики" />
            <SwitchRow label="Установлена деловая связь" />
          </div>
          <div className="text-xs font-semibold text-gray-500 mb-1 mt-2">МАРКЕТСПЕЙС</div>
          <div className="bg-gray-50 rounded-xl mb-4 overflow-hidden">
            <SwitchRow label="Отклики" />
            <SwitchRow label="Рекомендации" />
          </div>
          <div className="text-xs font-semibold text-gray-500 mb-1 mt-2">ГОСЗАКУПКИ</div>
          <div className="bg-gray-50 rounded-xl mb-2 overflow-hidden">
            <SwitchRow label="Подборка тендеров по ИНН" />
          </div>
        </div>
      </Modal>
      {/* Модальное окно аккаунта */}
      <Modal open={accountModalOpen} onClose={() => setAccountModalOpen(false)}>
        <div className="w-[340px] max-w-full flex flex-col min-h-[340px]">
          <div className="flex items-center mb-4">
            <button onClick={() => setAccountModalOpen(false)} className="mr-2 p-1 rounded hover:bg-gray-100">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-5 h-5 text-gray-500"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            </button>
            <div className="text-lg font-bold text-center flex-1">Аккаунт</div>
          </div>
          <div className="text-xs font-semibold text-gray-500 mb-1 mt-2">НОМЕР ТЕЛЕФОНА</div>
          <div className="bg-white rounded-xl mb-4 overflow-hidden flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-900">Изменить номер</span>
            <span className="text-gray-400 text-sm">{user.phone || '+7 (999) 300-18-02'}</span>
            <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
          </div>
          <div className="text-xs font-semibold text-gray-500 mb-1 mt-2">ЭЛЕКТРОННАЯ ПОЧТА</div>
          <div className="bg-white rounded-xl mb-4 overflow-hidden flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-900">Изменить эл. почту</span>
            <span className="text-gray-400 text-sm truncate max-w-[120px]">{user.email}</span>
            <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
          </div>
          <div className="flex-1" />
          <button 
            onClick={deleteAccount}
            className="w-full mt-8 mb-2 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-base hover:bg-red-100 transition"
          >
            Удалить аккаунт
          </button>
        </div>
      </Modal>
      {/* --- POSTS --- */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-base">Мои записи</div>
          <button
            onClick={() => setShowPostEditor(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Создать запись</span>
          </button>
        </div>
        
        {/* Редактор создания записи */}
        {showPostEditor && (
          <div className="mb-6">
            <PostEditor
              onSubmit={(postData) => {
                createPost(postData);
                setShowPostEditor(false);
              }}
              onCancel={() => setShowPostEditor(false)}
              userName={user?.name || 'Пользователь'}
              userAvatar={user?.avatar}
            />
          </div>
        )}
        
        {/* Лента записей пользователя */}
        <div className="space-y-4">
          {posts.filter(post => post.userId === user?.id).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">У вас пока нет записей</div>
              <p className="text-gray-500">Создайте первую запись!</p>
            </div>
          ) : (
            posts
              .filter(post => post.userId === user?.id)
              .map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onReaction={addReaction}
                  onComment={addComment}
                  onShare={sharePost}
                  onBookmark={bookmarkPost}
                  onEdit={editPost}
                  onDelete={deletePost}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
};

// SwitchRow компонент для переключателей
const SwitchRow: React.FC<{ label: string }> = ({ label }) => {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b last:border-b-0">
      <span className="text-sm text-gray-900">{label}</span>
      <button
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}
        onClick={() => setEnabled(e => !e)}
        aria-pressed={enabled}
        type="button"
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-1'}`}></span>
      </button>
    </div>
  );
};

export default ProfileForm;
