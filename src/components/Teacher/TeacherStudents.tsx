import React, { useState } from 'react';
import { User, Calendar, MessageCircle, User as UserIcon, Info, Eye, FileText } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import type { StudentProfile } from '../../types';
import { TimeSlot } from '../../types';
import TeacherCalendar from './TeacherCalendar';
import Modal from '../../components/Shared/Modal';
import UserProfile from '../Shared/UserProfile';

// Вспомогательная функция для получения профиля ученика по studentId
function getStudentProfile(studentId: string) {
  try {
    const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
    const student = users.find((u: any) => u.id === studentId && u.role === 'student');
    return student?.profile as StudentProfile | undefined;
  } catch {
    return undefined;
  }
}

const TeacherStudents: React.FC = () => {
  const { lessons, studentProfiles, createSlot, bookLesson } = useData();
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
  const students = Object.values(studentsMap);

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
    }
  };

  // Получить профиль выбранного ученика
  const selectedProfile = selectedStudent ? studentProfiles[selectedStudent.studentId] : undefined;
  if (modalOpen && selectedStudent) {
    console.log('studentProfiles:', studentProfiles);
    console.log('selectedStudent:', selectedStudent);
    console.log('selectedProfile:', selectedProfile);
  }

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

      {/* Модальное окно профиля ученика */}
      {modalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={closeModal}
              title="Закрыть"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col items-center mb-6">
              {selectedProfile?.avatar && selectedProfile.avatar.trim() !== '' ? (
                <img 
                  src={selectedProfile.avatar} 
                  alt="avatar" 
                  className="w-20 h-20 rounded-full object-cover mb-2"
                  onError={(e) => {
                    // Если изображение не загрузилось, показываем заглушку
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center mb-2 ${selectedProfile?.avatar && selectedProfile.avatar.trim() !== '' ? 'hidden' : ''}`}>
                <UserIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{selectedStudent.studentName}</h2>
            </div>
            <div className="space-y-2">
              {selectedProfile?.grade && (
                <div className="flex items-center text-gray-700"><span className="font-semibold mr-2">Класс:</span> {selectedProfile.grade}</div>
              )}
              {selectedProfile?.subjects && selectedProfile.subjects.length > 0 && (
                <div className="flex items-center text-gray-700"><span className="font-semibold mr-2">Предметы:</span> {selectedProfile.subjects.join(', ')}</div>
              )}
              {selectedProfile?.bio && (
                <div className="text-gray-700"><span className="font-semibold mr-2">О себе:</span> {selectedProfile.bio}</div>
              )}
              {!selectedProfile && (
                <div className="text-gray-400 text-sm">Профиль не заполнен</div>
              )}
              <button onClick={() => handleOpenCalendar({ id: selectedStudent.studentId, name: selectedStudent.studentName })} className="btn btn-primary mt-4">Назначить урок</button>
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
            console.log('Open chat with user:', userId);
            setSelectedUserProfile(null);
          }}
          onBookLesson={(teacherId) => {
            console.log('Book lesson with teacher:', teacherId);
            setSelectedUserProfile(null);
          }}
          isModal={true}
        />
      )}
    </div>
  );
};

export default TeacherStudents; 