import React, { useState, useEffect } from "react";
import { 
  User, 
  Calendar, 
  MessageCircle, 
  User as UserIcon, 
  Info, 
  Eye, 
  FileText,
  X,
  Phone,
  Mail,
  MapPin,
  School,
  GraduationCap,
  Target,
  BookOpen,
  Clock,
  Users,
  Star,
  Heart,
  Award,
  TrendingUp,
  Edit,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  UserPlus,
  GraduationCap as ClassIcon
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { SERVER_URL } from "../../config";
import type { StudentProfile } from "../../types";
import { TimeSlot, Lesson } from "../../types";
import TeacherCalendar from "./TeacherCalendar";
import Modal from "../../components/Shared/Modal";
import UserProfile from "../Shared/UserProfile";

// Улучшенная функция для получения профиля ученика
async function getStudentProfile(studentId: string): Promise<StudentProfile | undefined> {
  try {
    // Сначала пытаемся получить из localStorage
    const studentProfiles = JSON.parse(localStorage.getItem("tutoring_studentProfiles") || "{}");
    if (studentProfiles[studentId]) {
      console.log(' Found student profile in localStorage:', studentProfiles[studentId]);
      return studentProfiles[studentId];
    }
    
    // Если не найдено, ищем в общем списке пользователей
    const users = JSON.parse(localStorage.getItem("tutoring_users") || "[]");
    const student = users.find((u: any) => u.id === studentId && u.role === "student");
    if (student?.profile) {
      console.log(' Found student profile in users list:', student.profile);
      return student.profile as StudentProfile;
    }

    // Если не найдено локально, пытаемся загрузить с сервера
    try {
      console.log(' Loading student profile from server for ID:', studentId);
      const response = await fetch(`${SERVER_URL}/api/students/${studentId}`);
      if (response.ok) {
        const studentData = await response.json();
        console.log(' Loaded student profile from server:', studentData);
        
        // Сохраняем в localStorage
        const updatedProfiles = { ...studentProfiles, [studentId]: studentData };
        localStorage.setItem("tutoring_studentProfiles", JSON.stringify(updatedProfiles));
        
        return studentData as StudentProfile;
      }
    } catch (serverError) {
      console.warn(' Failed to load student profile from server:', serverError);
    }

    return undefined;
  } catch (error) {
    console.error(' Error getting student profile:', error);
    return undefined;
  }
}

// Компонент для отображения статистики профиля
const ProfileStatCard: React.FC<{ icon: React.ReactNode; value: string | number; label: string; color: string }> = ({ icon, value, label, color }) => (
  <div className={`${color} rounded-xl p-4 text-center`}>
    <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
      {icon}
    </div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

// Компонент для отображения информации профиля
const ProfileInfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; fallback?: string }> = 
  ({ icon, label, value, fallback = "Не указано" }) => (
    <div className="flex items-center space-x-3">
      <div className="text-gray-400">{icon}</div>
      <div>
        <span className="font-medium text-gray-700">{label}:</span>{" "}
        <span>{value || fallback}</span>
      </div>
    </div>
  );

// Компонент для отображения тегов
const TagList: React.FC<{ items: string[]; color: string; emptyMessage?: string }> = ({ items, color, emptyMessage }) => {
  if (!items || items.length === 0) {
    return emptyMessage ? <span className="text-gray-500 text-sm">{emptyMessage}</span> : null;
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span key={index} className={`${color} px-3 py-1 rounded-full text-sm`}>
          {item}
        </span>
      ))}
    </div>
  );
};

const TeacherNewStudents: React.FC = () => {
  const { user } = useAuth();
  const { lessons, createSlot, studentProfiles } = useData();
  
  const [selectedStudent, setSelectedStudent] = useState<null | { studentName: string; studentId: string }>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState<{ id: string; name: string } | null>(null);
  const [slotForm, setSlotForm] = useState({
    subject: "",
    date: "",
    startTime: "",
    endTime: "",
    duration: 60,
    lessonType: "regular" as "regular" | "trial",
    format: "online" as "online" | "offline",
    price: 1000,
    experience: "beginner" as "beginner" | "experienced",
    grades: [] as string[],
    goals: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarStudent, setCalendarStudent] = useState<{ id: string; name: string } | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<StudentProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showAddToClassModal, setShowAddToClassModal] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);

  // Собираем всех учеников, которые бронировали уроки у этого преподавателя
  const teacherLessons = lessons.filter((lesson: Lesson) => lesson.teacherId === user?.id);
  const studentsMap: Record<string, { studentName: string; studentId: string; lessons: Lesson[] }> = {};
  teacherLessons.forEach((lesson: Lesson) => {
    if (!studentsMap[lesson.studentId]) {
      studentsMap[lesson.studentId] = {
        studentName: lesson.studentName,
        studentId: lesson.studentId,
        lessons: [],
      };
    }
    studentsMap[lesson.studentId].lessons.push(lesson);
  });

  const students = Object.values(studentsMap);

  // Загрузка классов
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/classes?teacherId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  // Улучшенная загрузка профиля при изменении выбранного ученика
  useEffect(() => {
    const loadProfile = async () => {
      if (selectedStudent) {
        setLoadingProfile(true);
        console.log(' Loading profile for student:', selectedStudent.studentId);
        
        // Сначала пытаемся получить из контекста
        let profile = studentProfiles[selectedStudent.studentId];
        
        // Если не найдено, пытаемся загрузить асинхронно
        if (!profile) {
          profile = await getStudentProfile(selectedStudent.studentId);
        }
        
        console.log(' Profile loaded:', profile);
        setProfileData(profile || null);
        setLoadingProfile(false);
      }
    };
    
    loadProfile();
  }, [selectedStudent, studentProfiles]);

  const handleOpenChat = (studentId: string, studentName: string) => {
    alert(`Чат с ${studentName} открыт! Перейдите в раздел "Чаты" для общения.`);
  };

  const handleCardClick = (student: { studentName: string; studentId: string }) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
    setProfileData(null);
  };

  // Функция для обновления профиля с сервера
  const refreshStudentProfile = async () => {
    if (!selectedStudent) return;
    
    setLoadingProfile(true);
    try {
      console.log(' Refreshing student profile from server...');
      const profile = await getStudentProfile(selectedStudent.studentId);
      setProfileData(profile || null);
    } catch (error) {
      console.error(' Error refreshing student profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Функция открытия модального окна для назначения урока
  const handleAssignLesson = (student: { id: string; name: string }) => {
    setAssigningStudent(student);
    setAssignModalOpen(true);
    setSlotForm({
      subject: "",
      date: "",
      startTime: "",
      endTime: "",
      duration: 60,
      lessonType: "regular",
      format: "online",
      price: 1000,
      experience: "beginner",
      grades: [],
      goals: [],
    });
    setError("");
  };

  // Открыть календарь для назначения урока
  const handleOpenCalendar = (student: { id: string; name: string }) => {
    setCalendarStudent(student);
    setCalendarModalOpen(true);
  };

  // Функция создания и бронирования слота
  const handleCreateAndBookSlot = async () => {
    if (!user || !assigningStudent) return;
    setLoading(true);
    setError("");
    try {
      await createSlot({
        ...slotForm,
        teacherId: user.id,
        teacherName: user.name,
      }, assigningStudent.id, assigningStudent.name, { mode: "assign" });
      setAssignModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Ошибка при создании урока");
    } finally {
      setLoading(false);
    }
  };

  // Функция добавления ученика в класс
  const handleAddToClass = (student: { id: string; name: string }) => {
    setAssigningStudent(student);
    setShowAddToClassModal(true);
  };

  const addStudentToClass = async (classId: string) => {
    if (!assigningStudent) return;
    
    try {
      const response = await fetch(`${SERVER_URL}/api/classes/${classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: assigningStudent.id })
      });

      if (response.ok) {
        setShowAddToClassModal(false);
        alert(`Ученик ${assigningStudent.name} добавлен в класс!`);
      } else {
        setError("Ошибка при добавлении ученика в класс");
      }
    } catch (error) {
      setError("Ошибка при добавлении ученика в класс");
    }
  };

  const getProfileCompleteness = (profile: StudentProfile | null): number => {
    if (!profile) return 0;
    
    const fields = [
      profile.grade, profile.age, profile.school, profile.city, 
      profile.phone, profile.parentName, profile.parentPhone,
      profile.subjects?.length, profile.goals?.length, profile.interests?.length,
      profile.learningStyle, profile.experience, profile.bio
    ];
    
    const filledFields = fields.filter(field => field && (Array.isArray(field) ? field.length > 0 : true)).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompleteness = getProfileCompleteness(profileData);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Новые ученики</h1>
        <p className="text-gray-600">Ученики, которые впервые записались на уроки. После первого урока вы можете добавить их в классы.</p>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Пока нет учеников</h3>
          <p className="text-gray-600">Ученики появятся здесь после того, как забронируют у вас уроки</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student.studentId}
              className="card-gradient hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer"
              onClick={() => handleCardClick(student)}
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{student.studentName}</h3>
                  </div>
                  <div className="ml-auto flex items-center space-x-1">
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="Просмотреть записи"
                      onClick={e => { e.stopPropagation(); setSelectedUserProfile(student.studentId); }}
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="Подробнее о профиле"
                      onClick={e => { e.stopPropagation(); handleCardClick(student); }}
                    >
                      <Info className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Уроки:</h4>
                  {student.lessons.length > 0 ? (
                    <ul className="text-sm text-gray-600 space-y-1">
                      {student.lessons.slice(0, 3).map((lesson: Lesson, index: number) => (
                        <li key={lesson.id} className="flex justify-between">
                          <span>{lesson.subject}</span>
                          <span className="text-gray-400">{lesson.date}</span>
                        </li>
                      ))}
                      {student.lessons.length > 3 && (
                        <li className="text-gray-400 text-xs">и еще {student.lessons.length - 3} уроков...</li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Нет уроков</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Улучшенное модальное окно профиля ученика */}
      {modalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto relative">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={refreshStudentProfile}
                    disabled={loadingProfile}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    title="Обновить данные"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingProfile ? 'animate-spin' : ''}`} />
                    <span>Обновить</span>
                  </button>
                  <button
                    onClick={() => handleOpenChat(selectedStudent.studentId, selectedStudent.studentName)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Написать</span>
                  </button>
                  <button
                    onClick={() => handleOpenCalendar({ id: selectedStudent.studentId, name: selectedStudent.studentName })}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Назначить урок</span>
                  </button>
                  <button
                    onClick={() => handleAddToClass({ id: selectedStudent.studentId, name: selectedStudent.studentName })}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                  >
                    <ClassIcon className="w-4 h-4" />
                    <span>Добавить в класс</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {loadingProfile ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
                  <p className="text-gray-600">Загружаем данные профиля...</p>
                </div>
              ) : (
                <>
                  {/* Profile Header */}
                  <div className="flex flex-col lg:flex-row gap-6 mb-8">
                    <div className="flex flex-col items-center lg:items-start">
                      {profileData?.avatar && profileData.avatar.trim() !== "" ? (
                        <img 
                          src={profileData.avatar} 
                          alt="avatar" 
                          className="w-32 h-32 rounded-full object-cover mb-4"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center mb-4">
                        <UserIcon className="h-16 w-16 text-white" />
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedStudent.studentName}</h1>
                      
                      {/* Индикатор заполненности профиля */}
                      <div className="flex items-center space-x-2 mb-4">
                        {profileCompleteness > 70 ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : profileCompleteness > 30 ? (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          profileCompleteness > 70 ? "text-green-600" : 
                          profileCompleteness > 30 ? "text-yellow-600" : "text-red-600"
                        }`}>
                          Профиль заполнен на {profileCompleteness}%
                        </span>
                      </div>

                      {profileData?.grade && (
                        <div className="flex items-center text-lg text-gray-600 mb-2">
                          <GraduationCap className="w-5 h-5 mr-2" />
                          <span>{profileData.grade} класс</span>
                        </div>
                      )}
                      {profileData?.age && (
                        <div className="text-gray-600 mb-2">
                          <span className="font-medium">Возраст:</span> {profileData.age} лет
                        </div>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <ProfileStatCard
                        icon={<BookOpen className="w-8 h-8 text-blue-500" />}
                        value={studentsMap[selectedStudent.studentId]?.lessons.length || 0}
                        label="Всего уроков"
                        color="bg-blue-50"
                      />
                      <ProfileStatCard
                        icon={<Award className="w-8 h-8 text-green-500" />}
                        value={studentsMap[selectedStudent.studentId]?.lessons.filter((l: Lesson) => l.status === "completed").length || 0}
                        label="Завершено"
                        color="bg-green-50"
                      />
                      <ProfileStatCard
                        icon={<Users className="w-8 h-8 text-purple-500" />}
                        value={profileData?.subjects?.length || 0}
                        label="Предметов"
                        color="bg-purple-50"
                      />
                      <ProfileStatCard
                        icon={<TrendingUp className="w-8 h-8 text-orange-500" />}
                        value={profileData?.experience ? 
                          (profileData.experience === "beginner" ? "Начинающий" : 
                           profileData.experience === "intermediate" ? "Средний" : "Продвинутый") 
                          : "Не указан"}
                        label="Уровень"
                        color="bg-orange-50"
                      />
                    </div>
                  </div>

                  {/* Detailed Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-500" />
                        Личная информация
                      </h3>
                      <div className="space-y-3">
                        <ProfileInfoItem
                          icon={<School className="w-4 h-4" />}
                          label="Школа"
                          value={profileData?.school || ""}
                          fallback="Не указана"
                        />
                        <ProfileInfoItem
                          icon={<MapPin className="w-4 h-4" />}
                          label="Город"
                          value={profileData?.city || ""}
                          fallback="Не указан"
                        />
                        <ProfileInfoItem
                          icon={<Phone className="w-4 h-4" />}
                          label="Телефон"
                          value={profileData?.phone || ""}
                          fallback="Не указан"
                        />
                        <ProfileInfoItem
                          icon={<User className="w-4 h-4" />}
                          label="Родитель"
                          value={profileData?.parentName || ""}
                          fallback="Не указан"
                        />
                        <ProfileInfoItem
                          icon={<Phone className="w-4 h-4" />}
                          label="Телефон родителя"
                          value={profileData?.parentPhone || ""}
                          fallback="Не указан"
                        />
                        <ProfileInfoItem
                          icon={<Clock className="w-4 h-4" />}
                          label="Часовой пояс"
                          value={profileData?.timeZone || ""}
                          fallback="Не указан"
                        />
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-green-500" />
                        Учебная информация
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <span className="font-medium text-gray-700 block mb-2">Изучаемые предметы:</span>
                          <TagList
                            items={profileData?.subjects || []}
                            color="bg-blue-100 text-blue-800"
                            emptyMessage="Не указаны"
                          />
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 block mb-2">Цели обучения:</span>
                          <TagList
                            items={profileData?.goals || []}
                            color="bg-green-100 text-green-800"
                            emptyMessage="Не указаны"
                          />
                        </div>
                        <ProfileInfoItem
                          icon={<Target className="w-4 h-4" />}
                          label="Стиль обучения"
                          value={profileData?.learningStyle === "visual" ? "Визуальный" : 
                                 profileData?.learningStyle === "auditory" ? "Аудиальный" :
                                 profileData?.learningStyle === "kinesthetic" ? "Кинестетический" : 
                                 profileData?.learningStyle === "mixed" ? "Смешанный" : ""}
                          fallback="Не указан"
                        />
                        <div>
                          <span className="font-medium text-gray-700 block mb-2">Предпочитаемые форматы:</span>
                          <TagList
                            items={profileData?.preferredFormats || []}
                            color="bg-purple-100 text-purple-800"
                            emptyMessage="Не указаны"
                          />
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 block mb-2">Предпочитаемая длительность:</span>
                          <TagList
                            items={profileData?.preferredDurations?.map(d => `${d} мин`) || []}
                            color="bg-orange-100 text-orange-800"
                            emptyMessage="Не указана"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interests & Hobbies */}
                    {profileData?.interests && profileData.interests.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <Heart className="w-5 h-5 mr-2 text-red-500" />
                          Интересы и хобби
                        </h3>
                        <TagList
                          items={profileData.interests}
                          color="bg-red-100 text-red-800"
                        />
                      </div>
                    )}

                    {/* Biography */}
                    {profileData?.bio && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                          О себе
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Lessons History */}
                  {studentsMap[selectedStudent.studentId]?.lessons && studentsMap[selectedStudent.studentId].lessons.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                        История уроков
                      </h3>
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="max-h-64 overflow-y-auto">
                          {studentsMap[selectedStudent.studentId].lessons.map((lesson: Lesson, index: number) => (
                            <div key={lesson.id} className="p-4 border-b border-gray-100">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">{lesson.subject}</h4>
                                  <p className="text-sm text-gray-600">
                                    {lesson.date} в {lesson.startTime}-{lesson.endTime}
                                  </p>
                                  {lesson.comment && (
                                    <p className="text-sm text-gray-500 mt-1">{lesson.comment}</p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    lesson.status === "completed" ? "bg-green-100 text-green-800" :
                                    lesson.status === "scheduled" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                                  }`}>
                                    {lesson.status === "completed" ? "Завершен" :
                                     lesson.status === "scheduled" ? "Запланирован" : "Отменен"}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">{lesson.price} ₽</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Profile Status */}
                  {!profileData && (
                    <div className="text-center py-12">
                      <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Профиль не заполнен</h3>
                      <p className="text-gray-600">Ученик еще не заполнил информацию о себе</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для назначения урока */}
      {assignModalOpen && assigningStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={() => setAssignModalOpen(false)}
              title="Закрыть"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3>Назначить урок для {assigningStudent.name}</h3>
            <form className="flex flex-col gap-2">
              <input type="text" placeholder="Предмет" value={slotForm.subject} onChange={e => setSlotForm({ ...slotForm, subject: e.target.value })} required />
              <input type="date" value={slotForm.date} onChange={e => setSlotForm({ ...slotForm, date: e.target.value })} required />
              <input type="time" value={slotForm.startTime} onChange={e => setSlotForm({ ...slotForm, startTime: e.target.value })} required />
              <input type="time" value={slotForm.endTime} onChange={e => setSlotForm({ ...slotForm, endTime: e.target.value })} required />
              <input type="number" placeholder="Цена" value={slotForm.price} onChange={e => setSlotForm({ ...slotForm, price: Number(e.target.value) })} />
              <select value={slotForm.lessonType} onChange={e => setSlotForm({ ...slotForm, lessonType: e.target.value as "regular" | "trial" })}>
                <option value="regular">Обычный</option>
                <option value="trial">Пробный</option>
              </select>
              <select value={slotForm.format} onChange={e => setSlotForm({ ...slotForm, format: e.target.value as "online" | "offline" })}>
                <option value="online">Онлайн</option>
                <option value="offline">Оффлайн</option>
              </select>
              <select value={slotForm.experience} onChange={e => setSlotForm({ ...slotForm, experience: e.target.value as "beginner" | "experienced" })}>
                <option value="beginner">Начинающий</option>
                <option value="experienced">Опытный</option>
              </select>
              {error && <div className="text-red-500">{error}</div>}
              <button type="button" className="btn btn-success mt-2" onClick={handleCreateAndBookSlot} disabled={loading}>
                {loading ? "Назначение..." : "Назначить"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно с календарём для выбора слота */}
      {calendarModalOpen && calendarStudent && (
        <Modal open={calendarModalOpen} onClose={() => setCalendarModalOpen(false)}>
          <div style={{ minWidth: 1100, minHeight: 600, maxWidth: "98vw" }}>
            <h2 style={{ marginBottom: 16 }}>Назначить урок для {calendarStudent.name}</h2>
            <TeacherCalendar
              mode="assign"
              student={calendarStudent}
              onAssign={() => setCalendarModalOpen(false)}
            />
          </div>
        </Modal>
      )}

      {/* Модальное окно добавления в класс */}
      {showAddToClassModal && assigningStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Добавить {assigningStudent.name} в класс
              </h3>
              <button
                onClick={() => setShowAddToClassModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {classes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ClassIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>У вас пока нет классов</p>
                  <p className="text-sm">Создайте класс в разделе "Классы"</p>
                </div>
              ) : (
                classes.map(cls => (
                  <div key={cls.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: cls.color }}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{cls.name}</div>
                        {cls.description && (
                          <div className="text-sm text-gray-500">{cls.description}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => addStudentToClass(cls.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Добавить
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно профиля пользователя */}
      {selectedUserProfile && (
        <UserProfile
          userId={selectedUserProfile}
          onClose={() => setSelectedUserProfile(null)}
          onMessage={(userId) => {
            setSelectedUserProfile(null);
          }}
          onBookLesson={(teacherId) => {
            setSelectedUserProfile(null);
          }}
          isModal={true}
        />
      )}
    </div>
  );
};

export default TeacherNewStudents;