import React, { useState, useEffect } from 'react';
import { Save, Upload, Settings, Bell, Lock, User as UserIcon, Palette, Database, Monitor, BookOpen, MessageCircle, FileText, Star, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StudentProfile, TeacherProfile } from '../../types';
import { useData } from '../../contexts/DataContext';
import Modal from './Modal';
import PostEditor from './PostEditor';
import PostCard from './PostCard';



const ProfileForm: React.FC = () => {
  const { user, updateProfile } = useAuth();
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
          ...profile,
          goals: profile.goals || [],
          interests: profile.interests || [],
          preferredFormats: profile.preferredFormats || [],
          preferredDurations: profile.preferredDurations || [],
        });
      } else {
        const profile = user.profile as TeacherProfile;
        setTeacherProfile({
          ...teacherProfile,
          ...profile,
          formats: profile.formats || [],
          subjects: profile.subjects || [],
          grades: profile.grades || [],
          goals: profile.goals || [],
          lessonTypes: profile.lessonTypes || [],
          durations: profile.durations || [],
          education: profile.education || {
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
      const reader = new FileReader();
      reader.onload = (ev) => {
        const avatarUrl = ev.target?.result as string;
        
        if (user.role === 'student') {
          const updatedProfile = { ...studentProfile, avatar: avatarUrl };
          setStudentProfile(updatedProfile);
          // Автоматически сохраняем и синхронизируем
          updateProfile(updatedProfile);
          updateStudentProfile(user.id, updatedProfile);
        } else {
          const updatedProfile = { ...teacherProfile, avatar: avatarUrl };
          setTeacherProfile(updatedProfile);
          // Автоматически сохраняем и синхронизируем
          updateProfile(updatedProfile);
          updateTeacherProfile(user.id, { ...updatedProfile, name: user.name, email: user.email });
        }
      };
      reader.readAsDataURL(file);
    }
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
          <button
            className="btn-primary text-sm px-3 py-2"
            onClick={() => setEditMode(true)}
          >Редактировать</button>
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
      <div className="bg-white rounded-2xl shadow p-4 mb-6 text-sm flex flex-col gap-2 card-gradient">
        <h3 className="text-base font-bold text-gray-900 mb-2">О себе</h3>
        <div className="text-gray-700 whitespace-pre-line leading-relaxed mb-2">
          {user.role === 'student' ? studentProfile.bio || '—' : user.profile?.bio || '—'}
        </div>
        {/* В блоке 'О себе' убираю преподавательские поля для ученика */}
        <div className="flex flex-col gap-1">
          <div><span className="text-xs font-semibold text-gray-500">Предметы:</span> <span className="text-base text-gray-900">{user.profile?.subjects?.join(', ') || '—'}</span></div>
          {user.role === 'teacher' && (
            <>
              <div><span className="text-xs font-semibold text-gray-500">Классы:</span> <span className="text-base text-gray-900">{(user.profile as TeacherProfile)?.grades?.join(', ') || '—'}</span></div>
              <div><span className="text-xs font-semibold text-gray-500">Страна:</span> <span className="text-base text-gray-900">{(user.profile as TeacherProfile)?.country || '—'}</span></div>
            </>
          )}
        </div>
        {user.role === 'teacher' && (user.profile as TeacherProfile)?.experience && (
          <div className="mt-2"><span className="text-xs font-semibold text-gray-500">Опыт:</span> <span className="text-base text-gray-900">{(user.profile as TeacherProfile).experience}</span></div>
        )}
      </div>
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
          <button className="w-full mt-8 mb-2 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-base hover:bg-red-100 transition">Удалить аккаунт</button>
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
      {/* Форма редактирования оставляю как есть, по editMode */}
      <Modal open={editMode} onClose={() => setEditMode(false)}>
        <div className="w-[720px] max-w-full max-h-[80vh] overflow-y-auto">
          <div className="space-y-8 p-4">
          {/* Avatar */}
              <div className="flex items-center gap-8">
                <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
              {(user.role === 'student' ? studentProfile.avatar : teacherProfile.avatar) ? (
                <img
                  src={user.role === 'student' ? studentProfile.avatar : teacherProfile.avatar}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="h-10 w-10 text-white" />
              )}
            </div>
            <div>
                  <label className="btn-primary cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Загрузить фото</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
              <p className="text-sm text-gray-500 mt-1">Рекомендуемый размер: 200x200px</p>
            </div>
          </div>
          {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
              <input
                type="text"
                value={user?.name}
                disabled
                    className="input-modern w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Никнейм</label>
              <input
                type="text"
                value={`@${user?.nickname}`}
                disabled
                    className="input-modern w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                    className="input-modern w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Номер телефона</label>
              <input
                type="tel"
                value={user?.phone || ''}
                onChange={(e) => {
                  // Обновляем номер телефона в контексте аутентификации
                  if (user) {
                    // Здесь нужно обновить пользователя в контексте
                    // Пока просто сохраняем в localStorage
                    try {
                      const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
                      const userIndex = users.findIndex((u: any) => u.id === user.id);
                      if (userIndex !== -1) {
                        users[userIndex].phone = e.target.value;
                        localStorage.setItem('tutoring_users', JSON.stringify(users));
                      }
                    } catch (error) {
                    }
                  }
                }}
                className="input-modern w-full"
                placeholder="+7 (999) 123-45-67"
              />
            </div>
          </div>
              {/* Teaching Info — только для преподавателя */}
              {user.role === 'teacher' && (
                <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Предметы, которые вы преподаете</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {subjects.map(subject => (
                <label key={subject} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={teacherProfile.subjects.includes(subject)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTeacherProfile({
                          ...teacherProfile,
                          subjects: [...teacherProfile.subjects, subject]
                        });
                      } else {
                        setTeacherProfile({
                          ...teacherProfile,
                          subjects: teacherProfile.subjects.filter(s => s !== subject)
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Классы, с которыми работаете</label>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {grades.map(grade => (
                <label key={grade} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={teacherProfile.grades.includes(grade)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTeacherProfile({
                          ...teacherProfile,
                          grades: [...teacherProfile.grades, grade]
                        });
                      } else {
                        setTeacherProfile({
                          ...teacherProfile,
                          grades: teacherProfile.grades.filter(g => g !== grade)
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{grade}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Опыт преподавания</label>
              <select
                value={teacherProfile.experience}
                onChange={(e) => setTeacherProfile({ ...teacherProfile, experience: e.target.value as any })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {experiences.map(exp => (
                  <option key={exp} value={exp}>{getExperienceLabel(exp)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Тип преподавателя</label>
              <select
                value={teacherProfile.teacherType || 'private'}
                onChange={(e) => setTeacherProfile({ ...teacherProfile, teacherType: e.target.value as any })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="private">Частный преподаватель</option>
                <option value="school">Преподаватель школы</option>
                <option value="both">Частный + Школа</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Возраст</label>
              <input
                type="number"
                value={teacherProfile.age || ''}
                onChange={(e) => setTeacherProfile({ ...teacherProfile, age: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="18"
                max="100"
                placeholder="Укажите возраст"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Лет опыта</label>
              <input
                type="number"
                value={teacherProfile.experienceYears || ''}
                onChange={(e) => setTeacherProfile({ ...teacherProfile, experienceYears: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                max="50"
                placeholder="Количество лет"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Стоимость часа (₽)</label>
              <input
                type="number"
                value={teacherProfile.hourlyRate}
                onChange={(e) => setTeacherProfile({ ...teacherProfile, hourlyRate: Number(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Цели занятий</label>
            <div className="grid grid-cols-2 gap-2">
              {goals.map(goal => (
                <label key={goal} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={teacherProfile.goals.includes(goal)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTeacherProfile({
                          ...teacherProfile,
                          goals: [...teacherProfile.goals, goal]
                        });
                      } else {
                        setTeacherProfile({
                          ...teacherProfile,
                          goals: teacherProfile.goals.filter(g => g !== goal)
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Продолжительность уроков</label>
            <div className="flex space-x-4">
              {durations.map(duration => (
                <label key={duration} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={teacherProfile.durations.includes(duration)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTeacherProfile({
                          ...teacherProfile,
                          durations: [...teacherProfile.durations, duration]
                        });
                      } else {
                        setTeacherProfile({
                          ...teacherProfile,
                          durations: teacherProfile.durations.filter(d => d !== duration)
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Форматы проведения</label>
            <div className="flex space-x-4">
              {formats.map(format => (
                <label key={format} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={teacherProfile.formats?.includes(format) || false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTeacherProfile({
                          ...teacherProfile,
                          formats: [...(teacherProfile.formats || []), format]
                        });
                      } else {
                        setTeacherProfile({
                          ...teacherProfile,
                          formats: (teacherProfile.formats || []).filter(f => f !== format)
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={teacherProfile.offlineAvailable}
                  onChange={(e) => setTeacherProfile({ ...teacherProfile, offlineAvailable: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Провожу оффлайн занятия</span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={teacherProfile.overbookingEnabled}
                  onChange={(e) => setTeacherProfile({ ...teacherProfile, overbookingEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Участвую в овербукинге</span>
              </label>
            </div>
          </div>
                </>
              )}

          {teacherProfile.offlineAvailable && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
              <input
                type="text"
                value={teacherProfile.city}
                onChange={(e) => setTeacherProfile({ ...teacherProfile, city: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Введите ваш город"
              />
            </div>
          )}

          {/* О себе — для студента и преподавателя */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">О себе</label>
            <textarea
              value={user.role === 'student' ? studentProfile.bio : teacherProfile.bio}
              onChange={e => {
                if (user.role === 'student') {
                  setStudentProfile({ ...studentProfile, bio: e.target.value });
                } else {
                  setTeacherProfile({ ...teacherProfile, bio: e.target.value });
                }
              }}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Расскажите о себе..."
            />
          </div>

          {/* Дополнительная информация — только для учеников */}
          {user.role === 'student' && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Дополнительная информация</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Возраст</label>
                    <input
                      type="number"
                      value={studentProfile.age || ''}
                      onChange={(e) => setStudentProfile({ ...studentProfile, age: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="5"
                      max="25"
                      placeholder="Укажите возраст"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Школа</label>
                    <input
                      type="text"
                      value={studentProfile.school || ''}
                      onChange={(e) => setStudentProfile({ ...studentProfile, school: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Название школы"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
                    <input
                      type="text"
                      value={studentProfile.city || ''}
                      onChange={(e) => setStudentProfile({ ...studentProfile, city: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ваш город"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                    <input
                      type="tel"
                      value={studentProfile.phone || ''}
                      onChange={(e) => setStudentProfile({ ...studentProfile, phone: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Имя родителя</label>
                    <input
                      type="text"
                      value={studentProfile.parentName || ''}
                      onChange={(e) => setStudentProfile({ ...studentProfile, parentName: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Имя родителя"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Телефон родителя</label>
                    <input
                      type="tel"
                      value={studentProfile.parentPhone || ''}
                      onChange={(e) => setStudentProfile({ ...studentProfile, parentPhone: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Цели обучения</label>
                  <div className="flex flex-wrap gap-2">
                    {goals.map(goal => (
                      <label key={goal} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={studentProfile.goals?.includes(goal) || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStudentProfile({
                                ...studentProfile,
                                goals: [...(studentProfile.goals || []), goal]
                              });
                            } else {
                              setStudentProfile({
                                ...studentProfile,
                                goals: (studentProfile.goals || []).filter(g => g !== goal)
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

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Интересы и хобби</label>
                  <textarea
                    value={studentProfile.interests?.join(', ') || ''}
                    onChange={(e) => setStudentProfile({ 
                      ...studentProfile, 
                      interests: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                    })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Напишите через запятую: спорт, музыка, рисование..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Стиль обучения</label>
                    <select
                      value={studentProfile.learningStyle || 'mixed'}
                      onChange={(e) => setStudentProfile({ ...studentProfile, learningStyle: e.target.value as any })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="visual">Визуальный</option>
                      <option value="auditory">Аудиальный</option>
                      <option value="kinesthetic">Кинестетический</option>
                      <option value="mixed">Смешанный</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Уровень знаний</label>
                    <select
                      value={studentProfile.experience || 'beginner'}
                      onChange={(e) => setStudentProfile({ ...studentProfile, experience: e.target.value as any })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Начинающий</option>
                      <option value="intermediate">Средний</option>
                      <option value="advanced">Продвинутый</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Предпочитаемые форматы занятий</label>
                  <div className="flex space-x-4">
                    {formats.map(format => (
                      <label key={format} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={studentProfile.preferredFormats?.includes(format) || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStudentProfile({
                                ...studentProfile,
                                preferredFormats: [...(studentProfile.preferredFormats || []), format]
                              });
                            } else {
                              setStudentProfile({
                                ...studentProfile,
                                preferredFormats: (studentProfile.preferredFormats || []).filter(f => f !== format)
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

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Предпочитаемая длительность занятий</label>
                  <div className="flex space-x-4">
                    {durations.map(duration => (
                      <label key={duration} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={studentProfile.preferredDurations?.includes(duration) || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStudentProfile({
                                ...studentProfile,
                                preferredDurations: [...(studentProfile.preferredDurations || []), duration]
                              });
                            } else {
                              setStudentProfile({
                                ...studentProfile,
                                preferredDurations: (studentProfile.preferredDurations || []).filter(d => d !== duration)
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Часовой пояс</label>
                  <input
                    type="text"
                    value={studentProfile.timeZone || ''}
                    onChange={(e) => setStudentProfile({ ...studentProfile, timeZone: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="UTC+3 (Москва)"
                  />
                </div>
              </div>
            </>
          )}

          {/* Образование — только для преподавателей */}
          {user.role === 'teacher' && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Образование</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Университет</label>
                    <input
                      type="text"
                      value={teacherProfile.education?.university || ''}
                      onChange={(e) => setTeacherProfile({
                        ...teacherProfile,
                        education: {
                          ...teacherProfile.education,
                          university: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Название университета"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Специальность/Степень</label>
                    <input
                      type="text"
                      value={teacherProfile.education?.degree || ''}
                      onChange={(e) => setTeacherProfile({
                        ...teacherProfile,
                        education: {
                          ...teacherProfile.education,
                          degree: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ваша специальность"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Год окончания</label>
                  <input
                    type="number"
                    value={teacherProfile.education?.graduationYear || ''}
                    onChange={(e) => setTeacherProfile({
                      ...teacherProfile,
                      education: {
                        ...teacherProfile.education,
                        graduationYear: e.target.value ? Number(e.target.value) : undefined
                      }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1950"
                    max={new Date().getFullYear()}
                    placeholder="Год окончания"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Курсы и сертификаты</h3>
                
                <div className="space-y-4">
                  {teacherProfile.education?.courses?.map((course, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Название курса</label>
                          <input
                            type="text"
                            value={course.name}
                            onChange={(e) => {
                              const newCourses = [...(teacherProfile.education?.courses || [])];
                              newCourses[index] = { ...course, name: e.target.value };
                              setTeacherProfile({
                                ...teacherProfile,
                                education: {
                                  ...teacherProfile.education,
                                  courses: newCourses
                                }
                              });
                            }}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Название курса"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Учреждение</label>
                          <input
                            type="text"
                            value={course.institution}
                            onChange={(e) => {
                              const newCourses = [...(teacherProfile.education?.courses || [])];
                              newCourses[index] = { ...course, institution: e.target.value };
                              setTeacherProfile({
                                ...teacherProfile,
                                education: {
                                  ...teacherProfile.education,
                                  courses: newCourses
                                }
                              });
                            }}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Название учреждения"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Год прохождения</label>
                          <input
                            type="number"
                            value={course.year}
                            onChange={(e) => {
                              const newCourses = [...(teacherProfile.education?.courses || [])];
                              newCourses[index] = { ...course, year: Number(e.target.value) };
                              setTeacherProfile({
                                ...teacherProfile,
                                education: {
                                  ...teacherProfile.education,
                                  courses: newCourses
                                }
                              });
                            }}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            min="1950"
                            max={new Date().getFullYear()}
                            placeholder="Год"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка на сертификат</label>
                          <input
                            type="url"
                            value={course.certificate || ''}
                            onChange={(e) => {
                              const newCourses = [...(teacherProfile.education?.courses || [])];
                              newCourses[index] = { ...course, certificate: e.target.value };
                              setTeacherProfile({
                                ...teacherProfile,
                                education: {
                                  ...teacherProfile.education,
                                  courses: newCourses
                                }
                              });
                            }}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/certificate.pdf"
                          />
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const newCourses = teacherProfile.education?.courses?.filter((_, i) => i !== index) || [];
                          setTeacherProfile({
                            ...teacherProfile,
                            education: {
                              ...teacherProfile.education,
                              courses: newCourses
                            }
                          });
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Удалить курс
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => {
                      const newCourse = {
                        name: '',
                        institution: '',
                        year: new Date().getFullYear(),
                        certificate: ''
                      };
                      setTeacherProfile({
                        ...teacherProfile,
                        education: {
                          ...teacherProfile.education,
                          courses: [...(teacherProfile.education?.courses || []), newCourse]
                        }
                      });
                    }}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Добавить курс
                  </button>
                </div>
              </div>
            </>
          )}

              <div className="flex justify-end gap-4">
            <button
              onClick={handleSave}
                  className="btn-primary flex items-center gap-2"
            >
              <Save className="h-5 w-5" />
              <span>Сохранить профиль</span>
            </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="btn-secondary"
                >
                  Отмена
            </button>
          </div>
        </div>
      </div>
      </Modal>
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