import React, { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import type { StudentProfile } from '../../types';
import { TimeSlot } from '../../types';
import TeacherCalendar from './TeacherCalendar';
import Modal from '../../components/Shared/Modal';
import UserProfile from '../Shared/UserProfile';

// Вспомогательная функция для получения профиля ученика по studentId
function getStudentProfile(studentId: string) {
function getStudentProfile(studentId: string) {
  try {
    const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
    const student = users.find((u: any) => u.id === studentId && u.role === 'student');
    return student?.profile as StudentProfile | undefined;
  } catch {
    return undefined;
  }
}
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<null | { studentName: string; studentId: string }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState<{ id: string; name: string } | null>(null);
  const [slotForm, setSlotForm] = useState({
    subject: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: 60,
    lessonType: 'regular' as 'regular' | 'trial',
    format: 'online' as 'online' | 'offline',
    price: 1000,
    experience: 'beginner' as 'beginner' | 'experienced',
    grades: [] as string[],
    goals: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarStudent, setCalendarStudent] = useState<{ id: string; name: string } | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<string | null>(null);

  // Собираем всех учеников, которые бронировали уроки у этого преподавателя
  const teacherLessons = lessons.filter(lesson => lesson.teacherId === user?.id);
  const studentsMap: Record<string, { studentName: string; studentId: string; lessons: typeof teacherLessons }> = {};
  teacherLessons.forEach(lesson => {
    if (!studentsMap[lesson.studentId]) {
      studentsMap[lesson.studentId] = {
        studentName: lesson.studentName,
        studentId: lesson.studentId,
        lessons: [],
      };
    }
    studentsMap[lesson.studentId].lessons.push(lesson);
  });

  const handleOpenChat = (studentId: string, studentName: string) => {
    alert(`Чат с ${studentName} открыт! Перейдите в раздел 'Чаты' для общения.`);
  };

  const handleCardClick = (student: { studentName: string; studentId: string }) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
  };

  // Функция открытия модального окна для назначения урока
  const handleAssignLesson = (student: { id: string; name: string }) => {
    setAssigningStudent(student);
    setAssignModalOpen(true);
    setSlotForm({
      subject: '',
      date: '',
      startTime: '',
      endTime: '',
      duration: 60,
      lessonType: 'regular',
      format: 'online',
      price: 1000,
      experience: 'beginner',
      grades: [],
      goals: [],
    });
    setError('');
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
    setError('');
    try {
      await createSlot({
        ...slotForm,
        teacherId: user.id,
        teacherName: user.name,
      }, assigningStudent.id, assigningStudent.name, { mode: 'assign' });
      setAssignModalOpen(false);
    } catch (e) {
      setError('Ошибка при создании или бронировании слота');
    } finally {
      setLoading(false);
  };

  // Получить профиль выбранного ученика
  // �������� ������� ���������� �������
  const selectedProfile = selectedStudent ? (studentProfiles[selectedStudent.studentId] || getStudentProfile(selectedStudent.studentId)) : undefined;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ученики</h1>
        <p className="text-gray-600">Здесь отображаются все ученики, которые бронировали у вас уроки, и история ваших занятий с ними</p>
      </div>
      {students.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <UserIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Пока нет учеников</h3>
          <p className="text-gray-600">Ученики появятся здесь после бронирования уроков</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map(student => (
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
                  <h4 className="text-md font-bold text-gray-800 mb-2 flex items-center"><Calendar className="h-4 w-4 mr-1 text-blue-500" />Забронированные уроки</h4>
                  {student.lessons.length === 0 ? (
                    <div className="text-gray-500 text-sm">Нет уроков</div>
                  ) : (
                    <ul className="space-y-2">
                      {student.lessons.map(lesson => (
                        <li key={lesson.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                          <div>
                            <span className="font-medium text-gray-700">{lesson.subject}</span>
                            <span className="ml-2 text-xs text-gray-500">{lesson.date} {lesson.startTime}-{lesson.endTime}</span>
                            <span className="ml-2 text-xs text-gray-500">({lesson.status === 'completed' ? 'Завершен' : 'Запланирован'})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={e => { e.stopPropagation(); handleOpenChat(student.studentId, student.studentName); }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                              title="Чат с учеником"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Полноценное модальное окно профиля ученика */}
      {modalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto relative">
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
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex flex-col lg:flex-row gap-6 mb-8">
                <div className="flex flex-col items-center lg:items-start">
                  {selectedProfile?.avatar && selectedProfile.avatar.trim() !== '' ? (
                    <img 
                      src={selectedProfile.avatar} 
                      alt="avatar" 
                      className="w-32 h-32 rounded-full object-cover mb-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center mb-4 ${selectedProfile?.avatar && selectedProfile.avatar.trim() !== '' ? 'hidden' : ''}`}>
                    <UserIcon className="h-16 w-16 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedStudent.studentName}</h1>
                  {selectedProfile?.grade && (
                    <div className="flex items-center text-lg text-gray-600 mb-2">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      <span>{selectedProfile.grade} класс</span>
                    </div>
                  )}
                  {selectedProfile?.age && (
                    <div className="text-gray-600 mb-2">
                      <span className="font-medium">Возраст:</span> {selectedProfile.age} лет
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {studentsMap[selectedStudent.studentId]?.lessons.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Всего уроков</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {studentsMap[selectedStudent.studentId]?.lessons.filter(l => l.status === 'completed').length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Завершено</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedProfile?.subjects?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Предметов</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedProfile?.experience ? 
                        (selectedProfile.experience === 'beginner' ? 'Начинающий' : 
                         selectedProfile.experience === 'intermediate' ? 'Средний' : 'Продвинутый') 
                        : 'Не указан'}
                    </div>
                    <div className="text-sm text-gray-600">Уровень</div>
                  </div>
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
                    {selectedProfile?.school && (
                      <div className="flex items-center text-gray-700">
                        <School className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium mr-2">Школа:</span>
                        <span>{selectedProfile.school}</span>
                      </div>
                    )}
                    {selectedProfile?.city && (
                      <div className="flex items-center text-gray-700">
                        <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium mr-2">Город:</span>
                        <span>{selectedProfile.city}</span>
                      </div>
                    )}
                    {selectedProfile?.phone && (
                      <div className="flex items-center text-gray-700">
                        <Phone className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium mr-2">Телефон:</span>
                        <span>{selectedProfile.phone}</span>
                      </div>
                    )}
                    {selectedProfile?.parentName && (
                      <div className="flex items-center text-gray-700">
                        <User className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium mr-2">Родитель:</span>
                        <span>{selectedProfile.parentName}</span>
                      </div>
                    )}
                    {selectedProfile?.parentPhone && (
                      <div className="flex items-center text-gray-700">
                        <Phone className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium mr-2">Телефон родителя:</span>
                        <span>{selectedProfile.parentPhone}</span>
                      </div>
                    )}
                    {selectedProfile?.timeZone && (
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium mr-2">Часовой пояс:</span>
                        <span>{selectedProfile.timeZone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-green-500" />
                    Учебная информация
                  </h3>
                  <div className="space-y-3">
                    {selectedProfile?.subjects && selectedProfile.subjects.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">Изучаемые предметы:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.subjects.map((subject, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedProfile?.goals && selectedProfile.goals.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">Цели обучения:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.goals.map((goal, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                              {goal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedProfile?.learningStyle && (
                      <div className="flex items-center text-gray-700">
                        <Target className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium mr-2">Стиль обучения:</span>
                        <span>{selectedProfile.learningStyle === 'visual' ? 'Визуальный' : 
                               selectedProfile.learningStyle === 'auditory' ? 'Аудиальный' :
                               selectedProfile.learningStyle === 'kinesthetic' ? 'Кинестетический' : 'Смешанный'}</span>
                      </div>
                    )}
                    {selectedProfile?.preferredFormats && selectedProfile.preferredFormats.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">Предпочитаемые форматы:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.preferredFormats.map((format, index) => (
                            <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                              {format}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedProfile?.preferredDurations && selectedProfile.preferredDurations.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">Предпочитаемая длительность:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.preferredDurations.map((duration, index) => (
                            <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                              {duration} мин
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interests & Hobbies */}
                {selectedProfile?.interests && selectedProfile.interests.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-red-500" />
                      Интересы и хобби
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.interests.map((interest, index) => (
                        <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Biography */}
                {selectedProfile?.bio && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                      О себе
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{selectedProfile.bio}</p>
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
                      {studentsMap[selectedStudent.studentId].lessons.map((lesson, index) => (
                        <div key={lesson.id} className={`p-4 border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
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
                                lesson.status === 'completed' ? 'bg-green-100 text-green-800' :
                                lesson.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {lesson.status === 'completed' ? 'Завершен' :
                                 lesson.status === 'scheduled' ? 'Запланирован' : 'Отменен'}
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

              {/* No Profile Data */}
              {!selectedProfile && (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Профиль не заполнен</h3>
                  <p className="text-gray-600">Ученик еще не заполнил информацию о себе</p>
                </div>
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
              <select value={slotForm.lessonType} onChange={e => setSlotForm({ ...slotForm, lessonType: e.target.value as 'regular' | 'trial' })}>
                <option value="regular">Обычный</option>
                <option value="trial">Пробный</option>
              </select>
              <select value={slotForm.format} onChange={e => setSlotForm({ ...slotForm, format: e.target.value as 'online' | 'offline' })}>
                <option value="online">Онлайн</option>
                <option value="offline">Оффлайн</option>
              </select>
              <select value={slotForm.experience} onChange={e => setSlotForm({ ...slotForm, experience: e.target.value as 'beginner' | 'experienced' })}>
                <option value="beginner">Начинающий</option>
                <option value="experienced">Опытный</option>
              </select>
              {error && <div className="text-red-500">{error}</div>}
              <button type="button" className="btn btn-success mt-2" onClick={handleCreateAndBookSlot} disabled={loading}>
                {loading ? 'Назначение...' : 'Назначить'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно с календарём для выбора слота */}
      {calendarModalOpen && calendarStudent && (
        <Modal open={calendarModalOpen} onClose={() => setCalendarModalOpen(false)}>
          <div style={{ minWidth: 1100, minHeight: 600, maxWidth: '98vw' }}>
            <h2 style={{ marginBottom: 16 }}>Назначить урок для {calendarStudent.name}</h2>
            <TeacherCalendar
              mode="assign"
              student={calendarStudent}
              onAssign={() => setCalendarModalOpen(false)}
            />
          </div>
        </Modal>
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
export default TeacherStudents;
