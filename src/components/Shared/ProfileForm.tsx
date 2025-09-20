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
  const [stories] = useState<Array<{id: number, avatar: string, name: string}>>([
    { id: 1, avatar: user?.profile?.avatar || '', name: user?.name || '' }
  ]);
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
    setShowEditModal(false);
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
                onClick={() => setShowProfileModal(true)}
              >
                Просмотр профиля
              </button>
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
              onClick={() => setEditMode(true)}
            >
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
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-600">Предметы:</span>
              <span className="text-sm text-gray-900 ml-1">{user.profile?.subjects?.join(', ') || ''}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Классы:</span>
              <span className="text-sm text-gray-900 ml-1">{(user.profile as TeacherProfile)?.grades?.join(', ') || ''}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Страна:</span>
              <span className="text-sm text-gray-900 ml-1">{(user.profile as TeacherProfile)?.country || ''}</span>
            </div>
            {(user.profile as TeacherProfile)?.experience && (
              <div>
                <span className="text-sm font-medium text-gray-600">Опыт:</span>
                <span className="text-sm text-gray-900 ml-1">{(user.profile as TeacherProfile).experience}</span>
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
      {/* --- STORIES --- */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold text-base">Истории</div>
          <button className="text-blue-500 text-xs font-medium hover:underline" onClick={() => alert('Скоро можно будет добавлять истории!')}>Добавить</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {/* Кнопка добавить свою историю */}
          <div className="flex flex-col items-center cursor-pointer group">
            <div className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden border-2 border-blue-400 group-hover:scale-105 transition">
              {(user.role === 'student' ? studentProfile.avatar : user.profile?.avatar) ? (
                <img src={user.role === 'student' ? studentProfile.avatar : user.profile?.avatar} alt="avatar" className="h-14 w-14 object-cover rounded-full" />
              ) : (
                <UserIcon className="h-7 w-7 text-white" />
              )}
              <span className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs border-2 border-white">+</span>
            </div>
            <span className="text-xs mt-1 text-gray-700">Ваша история</span>
          </div>
          {/* Сторис других пользователей */}
          {stories.map(story => (
            <div key={story.id} className="flex flex-col items-center cursor-pointer group">
              <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-pink-400 to-yellow-400 flex items-center justify-center overflow-hidden border-2 border-pink-400 group-hover:scale-105 transition">
                {story.avatar ? (
                  <img src={story.avatar} alt={story.name} className="h-14 w-14 object-cover rounded-full" />
                ) : (
                  <UserIcon className="h-7 w-7 text-white" />
                )}
              </div>
              <span className="text-xs mt-1 text-gray-700 truncate max-w-[60px]">{story.name}</span>
            </div>
          ))}
        </div>
      </div>
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
