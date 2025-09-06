import React, { useState, useEffect } from 'react';
import { Save, Upload, Settings, Bell, Lock, User as UserIcon, Palette, Database, Monitor, BookOpen, MessageCircle, FileText, Star, Plus, Award, MapPin, Clock, Users, GraduationCap, Trophy, Heart, Share2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StudentProfile, TeacherProfile } from '../../types';
import { useData } from '../../contexts/DataContext';
import Modal from './Modal';
import PostEditor from './PostEditor';
import PostCard from './PostCard';

const ProfileFormImproved: React.FC = () => {
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
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  const subjects = ['Математика', 'Русский язык', 'Английский язык', 'Физика', 'Химия', 'Биология', 'История', 'География'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'Студент', 'Взрослый'];
  const goals = ['подготовка к экзаменам', 'помощь с домашним заданием', 'углубленное изучение', 'разговорная практика'];
  const experiences = ['beginner', 'experienced', 'professional'];
  const durations = [45, 60, 90];
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

  // Статистика для преподавателя
  let teacherLessonsCount = 0;
  let teacherStudentsCount = 0;
  if (user && user.role === 'teacher' && Array.isArray(lessons)) {
    const teacherLessons = lessons.filter(l => l.teacherId === user.id);
    teacherLessonsCount = teacherLessons.length;
    teacherStudentsCount = Array.from(new Set(teacherLessons.map(l => l.studentId))).length;
  }

  if (!user) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const avatarUrl = ev.target?.result as string;
        
        if (user.role === 'student') {
          const updatedProfile = { ...studentProfile, avatar: avatarUrl };
          setStudentProfile(updatedProfile);
          updateProfile(updatedProfile);
          updateStudentProfile(user.id, updatedProfile);
        } else {
          const updatedProfile = { ...teacherProfile, avatar: avatarUrl };
          setTeacherProfile(updatedProfile);
          updateProfile(updatedProfile);
          updateTeacherProfile(user.id, { ...updatedProfile, name: user.name, email: user.email });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative mb-8">
        {/* Background with animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl transform rotate-1 animate-pulse"></div>
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform -rotate-1">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Enhanced Avatar */}
            <div className="relative group">
              <div className="h-40 w-40 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-white group-hover:scale-105 transition-transform duration-300">
                {user.profile?.avatar ? (
                  <img src={user.profile.avatar} alt="Avatar" className="h-40 w-40 rounded-full object-cover" />
                ) : (
                  <UserIcon className="h-20 w-20 text-white" />
                )}
              </div>
              {/* Online status with pulse animation */}
              <div className="absolute bottom-3 right-3 h-8 w-8 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
              {/* Edit avatar button */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-300 flex items-center justify-center">
                <label className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium cursor-pointer shadow-lg">
                  <Upload className="h-4 w-4 inline mr-1" />
                  Изменить
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  {user ? user.name : ''}
                </h1>
                {user && user.nickname && (
                  <span className="text-gray-500 text-xl">@{user.nickname}</span>
                )}
              </div>
              
              {/* Role badge with enhanced styling */}
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200 shadow-lg">
                {user.role === 'student' ? '👨‍🎓 Ученик' : '👨‍🏫 Преподаватель'}
              </div>

              {/* Enhanced statistics */}
              {user && user.role === 'student' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 flex items-center justify-center gap-2 mb-1">
                      <BookOpen className="w-7 h-7" />
                      {studentLessonsCount}
                    </div>
                    <div className="text-sm text-blue-700 font-medium">Пройдено уроков</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                    <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-2 mb-1">
                      <UserIcon className="w-7 h-7" />
                      {uniqueTeachersCount}
                    </div>
                    <div className="text-sm text-green-700 font-medium">Учителей</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 flex items-center justify-center gap-2 mb-1">
                      <Award className="w-7 h-7" />
                      {studentProfile.subjects?.length || 0}
                    </div>
                    <div className="text-sm text-purple-700 font-medium">Предметов</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                    <div className="text-3xl font-bold text-orange-600 flex items-center justify-center gap-2 mb-1">
                      <Trophy className="w-7 h-7" />
                      {studentProfile.goals?.length || 0}
                    </div>
                    <div className="text-sm text-orange-700 font-medium">Целей</div>
                  </div>
                </div>
              )}

              {user && user.role === 'teacher' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-600 flex items-center justify-center gap-2 mb-1">
                      <Star className="w-7 h-7" />
                      {(user.profile as TeacherProfile)?.rating || 0}
                    </div>
                    <div className="text-sm text-yellow-700 font-medium">Рейтинг</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 flex items-center justify-center gap-2 mb-1">
                      <Users className="w-7 h-7" />
                      {teacherStudentsCount}
                    </div>
                    <div className="text-sm text-blue-700 font-medium">Учеников</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                    <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-2 mb-1">
                      <BookOpen className="w-7 h-7" />
                      {teacherLessonsCount}
                    </div>
                    <div className="text-sm text-green-700 font-medium">Уроков</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 flex items-center justify-center gap-2 mb-1">
                      <GraduationCap className="w-7 h-7" />
                      {(user.profile as TeacherProfile)?.experienceYears || 0}
                    </div>
                    <div className="text-sm text-purple-700 font-medium">Лет опыта</div>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons with enhanced styling */}
            <div className="flex flex-col gap-4">
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 flex items-center gap-3"
                onClick={() => setEditMode(true)}
              >
                <Save className="h-5 w-5" />
                Редактировать профиль
              </button>
              <button
                className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-3"
                onClick={() => setSettingsModalOpen(true)}
              >
                <Settings className="h-5 w-5" />
                Настройки
              </button>
              <div className="flex gap-2">
                <button className="flex-1 bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl font-semibold hover:bg-red-100 hover:border-red-300 transition-all duration-300 flex items-center justify-center gap-2">
                  <Heart className="h-4 w-4" />
                </button>
                <button className="flex-1 bg-blue-50 border-2 border-blue-200 text-blue-600 px-4 py-3 rounded-xl font-semibold hover:bg-blue-100 hover:border-blue-300 transition-all duration-300 flex items-center justify-center gap-2">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <UserIcon className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">О себе</h2>
        </div>
        
        {/* Bio */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-6 border border-gray-200">
          <p className="text-gray-700 leading-relaxed text-lg">
            {user.role === 'student' ? studentProfile.bio || 'Расскажите о себе, своих интересах и целях в обучении...' : user.profile?.bio || 'Расскажите о своем опыте преподавания, методах работы и достижениях...'}
          </p>
        </div>
        
        {/* Enhanced info cards */}
        {user.role === 'student' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Subjects */}
            {studentProfile.subjects && studentProfile.subjects.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Предметы
                </h3>
                <div className="flex flex-wrap gap-2">
                  {studentProfile.subjects.map((subject, index) => (
                    <span key={index} className="bg-blue-200 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Goals */}
            {studentProfile.goals && studentProfile.goals.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Цели обучения
                </h3>
                <div className="flex flex-wrap gap-2">
                  {studentProfile.goals.map((goal, index) => (
                    <span key={index} className="bg-purple-200 text-purple-800 text-sm px-3 py-1 rounded-full font-medium">
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Interests */}
            {studentProfile.interests && studentProfile.interests.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Интересы
                </h3>
                <div className="flex flex-wrap gap-2">
                  {studentProfile.interests.map((interest, index) => (
                    <span key={index} className="bg-green-200 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {user.role === 'teacher' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Subjects */}
            {user.profile?.subjects && user.profile.subjects.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Предметы
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.profile.subjects.map((subject, index) => (
                    <span key={index} className="bg-blue-200 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Grades */}
            {(user.profile as TeacherProfile)?.grades && (user.profile as TeacherProfile).grades.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Классы
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(user.profile as TeacherProfile).grades.map((grade, index) => (
                    <span key={index} className="bg-green-200 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                      {grade}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Experience */}
            {(user.profile as TeacherProfile)?.experience && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Опыт
                </h3>
                <div className="text-purple-700 font-semibold">
                  {getExperienceLabel((user.profile as TeacherProfile).experience)}
                </div>
                {(user.profile as TeacherProfile)?.experienceYears && (
                  <div className="text-sm text-purple-600 mt-1">
                    {(user.profile as TeacherProfile).experienceYears} лет опыта
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Posts Section */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Мои записи</h2>
          </div>
          <button
            onClick={() => setShowPostEditor(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3"
          >
            <Plus className="h-5 w-5" />
            Создать запись
          </button>
        </div>
        
        {/* Post Editor */}
        {showPostEditor && (
          <div className="mb-8">
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
        
        {/* Posts */}
        <div className="space-y-6">
          {posts.filter(post => post.userId === user?.id).length === 0 ? (
            <div className="text-center py-12">
              <div className="h-24 w-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">У вас пока нет записей</h3>
              <p className="text-gray-500">Создайте первую запись и поделитесь своими мыслями!</p>
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

      {/* Edit Modal - Simplified for now */}
      <Modal open={editMode} onClose={() => setEditMode(false)}>
        <div className="w-[800px] max-w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Редактирование профиля</h2>
            <div className="space-y-6">
              {/* Basic form fields would go here */}
              <div className="text-center py-8">
                <p className="text-gray-600">Форма редактирования будет добавлена в следующем обновлении</p>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Сохранить
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
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

export default ProfileFormImproved;
