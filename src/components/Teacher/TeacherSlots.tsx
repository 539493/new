import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, Edit, MapPin, Users, MessageCircle, CheckCircle, Bell, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { TimeSlot, Lesson } from '../../types';
// убираем локальный socket, используем глобальный из DataContext

const TeacherSlots: React.FC = () => {
  const { timeSlots, lessons, createSlot, cancelLesson, getOrCreateChat, completeLesson, deleteSlot, isConnected, socketRef } = useData() as any;
  const { user } = useAuth();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    duration: 60,
    subject: '',
    lessonType: 'regular' as 'regular' | 'trial',
    format: 'online' as 'online' | 'offline' | 'mini-group',
    price: 1000,
  });

  const [selectedSlot, setSelectedSlot] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedLesson, setSelectedLesson] = React.useState<any>(null);
  const [showOverbookingModal, setShowOverbookingModal] = useState(false);
  const [overbookingRequests, setOverbookingRequests] = useState<any[]>([]);
  const [selectedOverbookingRequest, setSelectedOverbookingRequest] = useState<any>(null);
  const [showOverbookingRequestModal, setShowOverbookingRequestModal] = useState(false);

  // Автоматическая подписка при подключении сокета и наличии user.id
  React.useEffect(() => {
    if (socketRef.current && user?.id && isConnected) {
      console.log('[CLIENT][AUTO] subscribeOverbooking emit', user.id);
      socketRef.current.emit('subscribeOverbooking', user.id);
    } else {
      if (!socketRef.current) console.warn('[CLIENT][AUTO] socketRef.current is null!');
      if (!user?.id) console.warn('[CLIENT][AUTO] user.id is missing!');
      if (!isConnected) console.warn('[CLIENT][AUTO] socket is not connected!');
    }
  }, [socketRef.current, user?.id, isConnected]);

  React.useEffect(() => {
    if (!socketRef.current) return;
    // Подписка на событие connect сокета
    const subscribe = () => {
      if (user?.id && user?.profile && isConnected) {
        console.log('[CLIENT] subscribeOverbooking emit', user.id);
        socketRef.current.emit('subscribeOverbooking', user.id);
      }
    };
    socketRef.current.off('connect', subscribe); // убираем старую подписку
    socketRef.current.on('connect', subscribe);
    // Подписка при изменении user.id
    if (user?.id && user?.profile) {
      console.log('[CLIENT] subscribeOverbooking emit (user.id changed)', user.id);
      socketRef.current.emit('subscribeOverbooking', user.id);
      socketRef.current.on('overbookingRequests', (requests: any[]) => {
        console.log('[SOCKET] overbookingRequests received:', requests);
        setOverbookingRequests(requests);
        setTimeout(() => {
          console.log('[STATE] overbookingRequests after set:', requests);
        }, 100);
      });
      socketRef.current.on('newOverbookingRequest', (request: any) => {
        console.log('[SOCKET] newOverbookingRequest received:', request);
        setOverbookingRequests(prev => {
          const updated = [...prev, request];
          console.log('[STATE] overbookingRequests after push:', updated);
          return updated;
        });
      });
      socketRef.current.on('overbookingRequestAccepted', (request: any) => {
        console.log('Overbooking request accepted:', request);
        setOverbookingRequests((prev) => prev.filter((r: any) => r.id !== request.id));
      });
    } else {
      console.log('Teacher not subscribing to overbooking - no user ID or profile', user);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('overbookingRequests');
        socketRef.current.off('newOverbookingRequest');
        socketRef.current.off('overbookingRequestAccepted');
        socketRef.current.off('connect', subscribe);
      }
    };
  }, [user?.id, user?.profile, isConnected]);

  React.useEffect(() => {
    if (user && user.profile && Array.isArray((user.profile as any).subjects) && (user.profile as any).subjects.length >= 1) {
      setNewSlot((prev) => ({ ...prev, subject: (user.profile as any).subjects[0] }));
    }
  }, [user]);

  // Получаем слоты и уроки текущего преподавателя
  const teacherSlots = timeSlots.filter((slot: any) => slot.teacherId === user?.id);
  const availableSlots = teacherSlots.filter((slot: any) => !slot.isBooked);
  // Получаем уроки преподавателя
  const teacherLessons = lessons.filter((lesson: any) => lesson.teacherId === user?.id);
  const bookedLessons = teacherLessons.filter((lesson: any) => lesson.status === 'scheduled');
  const completedLessons = teacherLessons.filter((lesson: any) => lesson.status === 'completed');

  // Сортировка по дате и времени (от ранних к поздним)
  const sortByDateTime = (a: any, b: any) => {
    const dateA = new Date(`${a.date}T${a.startTime}`);
    const dateB = new Date(`${b.date}T${b.startTime}`);
    return dateA.getTime() - dateB.getTime();
  };

  const sortedAvailableSlots = [...availableSlots].sort(sortByDateTime);
  const sortedBookedLessons = [...bookedLessons].sort(sortByDateTime);
  const sortedCompletedLessons = [...completedLessons].sort(sortByDateTime);

  const handleCreateSlot = () => {
    if (!user || !newSlot.date || !newSlot.startTime || !newSlot.subject) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    // Вычисляем время окончания
    const startTime = new Date(`2000-01-01T${newSlot.startTime}`);
    const endTime = new Date(startTime.getTime() + newSlot.duration * 60000);

    // Получаем дополнительные данные из профиля преподавателя
    let teacherProfile: import('../../types').TeacherProfile | undefined = undefined;
    if (user.profile && user.role === 'teacher') {
      teacherProfile = user.profile as import('../../types').TeacherProfile;
    }
    const slotData = {
      teacherId: user.id,
      teacherName: user.name,
      teacherAvatar: user.avatar,
      date: newSlot.date,
      startTime: newSlot.startTime,
      endTime: endTime.toTimeString().slice(0, 5),
      duration: newSlot.duration,
      subject: newSlot.subject,
      lessonType: newSlot.lessonType,
      format: newSlot.format,
      price: newSlot.price,
      experience: teacherProfile?.experience || 'beginner',
      goals: teacherProfile?.goals || [],
      grades: teacherProfile?.grades || [],
      rating: teacherProfile?.rating,
      bio: teacherProfile?.bio || '',
      ...(newSlot.format === 'offline' && teacherProfile?.city ? { city: teacherProfile.city } : {}),
    };

    createSlot(slotData); // только слот, без студента
    setShowCreateModal(false);
    setNewSlot({
      date: '',
      startTime: '',
      duration: 60,
      subject: '',
      lessonType: 'regular',
      format: 'online',
      price: 1000,
    });
  };

  const handleOpenSlot = (slot: any) => {
    if (!user) return;
    setSelectedSlot(slot);
    setSelectedLesson(null);
    setIsModalOpen(true);
  };
  const handleOpenLesson = (lesson: any) => {
    if (!user) return;
    setSelectedLesson(lesson);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
    setSelectedLesson(null);
  };

  const handleAcceptOverbooking = async (request: any) => {
    if (!user) return;
    if (socketRef.current) {
      socketRef.current.emit('acceptOverbookingRequest', { requestId: request.id, teacherId: user.id });
    }
    // Создаём слот и бронируем на ученика (глобально)
    const slotData = {
      teacherId: user.id,
      teacherName: user.name,
      teacherAvatar: user.avatar || '',
      date: request.date || new Date().toISOString().slice(0, 10),
      startTime: request.startTime || '15:00',
      endTime: request.endTime || '16:00',
      duration: request.duration || 60,
      subject: request.subject,
      lessonType: 'regular' as 'regular' | 'trial',
      format: request.format,
      price: 1000,
      experience: (user.profile as any)?.experience || 'beginner',
      goals: (user.profile as any)?.goals || [],
      grades: (user.profile as any)?.grades || [],
      rating: (user.profile as any)?.rating,
      bio: (user.profile as any)?.bio || '',
      city: (user.profile as any)?.city || '',
    };
    await createSlot(slotData, request.studentId, request.studentName);
    setShowOverbookingModal(false);
    alert('Вы приняли заявку. Слот создан и забронирован!');
  };

  const getFormatIcon = (format: string): JSX.Element | null => {
    switch (format) {
      case 'online': return null;
      case 'offline': return <MapPin className="h-4 w-4" />;
      case 'mini-group': return <Users className="h-4 w-4" />;
      default: return null;
    }
  };

  const getFormatLabel = (format: string): string => {
    switch (format) {
      case 'online': return 'Онлайн';
      case 'offline': return 'Оффлайн';
      case 'mini-group': return 'Мини-группа';
      default: return format;
    }
  };

  const getLessonTypeLabel = (type: string): string => {
    switch (type) {
      case 'trial': return 'Пробный';
      case 'regular': return 'Обычный';
      default: return type;
    }
  };

  const getSubjectLabel = (subject: string): string => {
    switch (subject) {
      case 'Математика': return 'Математика';
      case 'Русский язык': return 'Русский язык';
      case 'Английский язык': return 'Английский язык';
      default: return subject;
    }
  };

  // Минималистичная карточка слота
  const SlotCard: React.FC<{ slot: TimeSlot; isBooked: boolean; onClick: () => void }> = ({ slot, isBooked, onClick }) => (
    <div className={`card-gradient hover:shadow-lg transition-shadow duration-200 overflow-hidden border-l-4 ${
      isBooked ? 'border-green-500' : 'border-blue-500'
    } cursor-pointer`} onClick={onClick}>
      <div className="p-3">
        <h3 className="text-base font-semibold text-gray-900 leading-tight mb-1">{slot.subject}</h3>
        <div className="text-xs text-gray-500">
          {slot.date} • {slot.startTime}–{slot.endTime}
        </div>
      </div>
    </div>
  );

  // Минималистичная карточка урока
  const LessonCard: React.FC<{ lesson: Lesson; status: string; onClick: () => void }> = ({ lesson, status, onClick }) => (
    <div className={`card-gradient hover:shadow-lg transition-shadow duration-200 overflow-hidden border-l-4 ${
      status === 'completed' ? 'border-gray-400' : 'border-green-500'
    } cursor-pointer`} onClick={onClick}>
      <div className="p-3">
        <h3 className="text-base font-semibold text-gray-900 leading-tight mb-1">{lesson.subject}</h3>
        <div className="text-xs text-gray-500">
          {lesson.date} • {lesson.startTime}–{lesson.endTime}
        </div>
      </div>
    </div>
  );

  const hasOverbooking = user?.profile && 'overbookingEnabled' in user.profile && (user.profile as any).overbookingEnabled;

  // ВРЕМЕННАЯ КНОПКА ДЛЯ ОТЛАДКИ ПОДПИСКИ НА ОВЕРБУКИНГ (toggle)
  // Удаляю все упоминания isSubscribed, setIsSubscribed и связанные кнопки/логику

  const subjects: string[] = user?.profile && 'subjects' in user.profile ? (user.profile as any).subjects : [];
  const durations: number[] = [45, 60, 90];
  const lessonTypes: string[] = ['regular', 'trial'];
  const formats: string[] = ['online', 'offline', 'mini-group'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ВРЕМЕННАЯ КНОПКА ДЛЯ ОТЛАДКИ */}
      {/* Удаляю все упоминания isSubscribed, setIsSubscribed и связанные кнопки/логику */}
      <div className="mb-8 relative">
        {hasOverbooking && (
          <button className="absolute top-0 right-0 p-2 rounded-full hover:bg-gray-100 transition z-10" title="Уведомления" onClick={() => setShowOverbookingModal(true)}>
            <Bell className="w-7 h-7 text-blue-500" />
            {overbookingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">{overbookingRequests.length}</span>
            )}
          </button>
        )}
        <h1 className="text-3xl font-bold gradient-text mb-2">Управление слотами</h1>
        <p className="text-gray-600">Создавайте временные слоты для уроков и управляйте своим расписанием</p>
      </div>
      {/* Модалка овербукинга для преподавателя */}
      {showOverbookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={() => setShowOverbookingModal(false)} title="Закрыть">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4">Заявки на овербукинг</h2>
            {overbookingRequests.length === 0 ? (
              <div className="text-gray-500 text-center">Нет новых заявок</div>
            ) : (
              <div className="space-y-2">
                {overbookingRequests.map(request => (
                  <div
                    key={request.id}
                    className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-purple-50 cursor-pointer hover:bg-purple-100 transition"
                    onClick={() => { setSelectedOverbookingRequest(request); setShowOverbookingRequestModal(true); }}
                  >
                    <span className="font-semibold text-purple-800">{request.studentName}</span>
                    <span className="text-xs text-gray-500">{request.subject}</span>
                    <span className="text-xs text-gray-500">{request.startTime || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Slot Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Создать новый слот</span>
        </button>
      </div>

      {/* Три колонки: Свободные слоты, Забронированные уроки, Завершённые уроки, Овербукинг */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Свободные слоты */}
        <div>
          <h2 className="text-xl font-bold text-blue-700 mb-4">Свободные слоты</h2>
          {sortedAvailableSlots.length > 0 ? (
            <div className="space-y-4">
              {sortedAvailableSlots.map((slot) => (
                <SlotCard key={slot.id} slot={slot} isBooked={false} onClick={() => handleOpenSlot(slot)} />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">Нет свободных слотов</div>
          )}
        </div>
        {/* Забронированные уроки */}
        <div>
          <h2 className="text-xl font-bold text-green-700 mb-4">Забронированные уроки</h2>
          {sortedBookedLessons.length > 0 ? (
            <div className="space-y-4">
              {sortedBookedLessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} status="scheduled" onClick={() => handleOpenLesson(lesson)} />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">Нет забронированных уроков</div>
          )}
        </div>
        {/* Завершённые уроки */}
        <div>
          <h2 className="text-xl font-bold text-gray-700 mb-4">Завершённые уроки</h2>
          {sortedCompletedLessons.length > 0 ? (
            <div className="space-y-4">
              {sortedCompletedLessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} status="completed" onClick={() => handleOpenLesson(lesson)} />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">Нет завершённых уроков</div>
          )}
        </div>
        {/* Овербукинг */}
        <div>
          <h2 className="text-xl font-bold text-purple-700 mb-4">Овербукинг</h2>
          <div className="text-gray-400 text-center py-8">Нет новых заявок</div>
        </div>
      </div>

      {/* Create Slot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
          <div className="modal-content bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold gradient-text">Создать новый слот</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Предмет *</label>
                  <select
                    value={newSlot.subject}
                    onChange={(e) => setNewSlot({ ...newSlot, subject: e.target.value })}
                    className="input-modern w-full"
                  >
                    <option value="">Выберите предмет</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Дата *</label>
                    <input
                      type="date"
                      value={newSlot.date}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                      className="input-modern w-full"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Время начала *</label>
                    <input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="input-modern w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Длительность</label>
                    <select
                      value={newSlot.duration}
                      onChange={(e) => setNewSlot({ ...newSlot, duration: parseInt(e.target.value) })}
                      className="input-modern w-full"
                    >
                      {durations.map(duration => (
                        <option key={duration} value={duration}>{duration} минут</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Цена (₽)</label>
                    <input
                      type="number"
                      value={newSlot.price}
                      onChange={(e) => setNewSlot({ ...newSlot, price: parseInt(e.target.value) })}
                      className="input-modern w-full"
                      min="100"
                      step="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Тип урока</label>
                    <select
                      value={newSlot.lessonType}
                      onChange={(e) => setNewSlot({ ...newSlot, lessonType: e.target.value as 'regular' | 'trial' })}
                      className="input-modern w-full"
                    >
                      {lessonTypes.map(type => (
                        <option key={type} value={type}>{getLessonTypeLabel(type)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Формат</label>
                    <select
                      value={newSlot.format}
                      onChange={(e) => setNewSlot({ ...newSlot, format: e.target.value as 'online' | 'offline' | 'mini-group' })}
                      className="input-modern w-full"
                    >
                      {formats.map(format => (
                        <option key={format} value={format}>{getFormatLabel(format)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleCreateSlot}
                    className="btn-primary flex-1"
                  >
                    Создать слот
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для выбранного слота или урока */}
      {isModalOpen && (selectedSlot || selectedLesson) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold mb-4">{selectedSlot ? 'Детали слота' : 'Детали урока'}</h3>
            <div className="space-y-2 mb-4">
              <div><span className="font-medium">Предмет:</span> {(selectedSlot || selectedLesson).subject}</div>
              <div><span className="font-medium">Дата:</span> {(selectedSlot || selectedLesson).date} {(selectedSlot || selectedLesson).startTime} - {(selectedSlot || selectedLesson).endTime}</div>
              <div><span className="font-medium">Формат:</span> {(selectedSlot || selectedLesson).format}</div>
              <div><span className="font-medium">Цена:</span> {(selectedSlot || selectedLesson).price}₽</div>
              {selectedSlot && selectedSlot.studentName && (
                <div><span className="font-medium">Ученик:</span> {selectedSlot.studentName}</div>
              )}
              {selectedLesson && (
                <div><span className="font-medium">Ученик:</span> {selectedLesson.studentName}</div>
              )}
              {/* Показываем комментарий к уроку, если есть */}
              {(selectedLesson?.comment || selectedSlot?.comment) && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-blue-900">
                  <span className="font-medium">Комментарий ученика:</span> {selectedLesson?.comment || selectedSlot?.comment}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {/* Для слота */}
              {selectedSlot && selectedSlot.isBooked && selectedSlot.studentId && user && (
                <button onClick={() => { getOrCreateChat(user.id, selectedSlot.studentId, user.name, selectedSlot.studentName); handleCloseModal(); }} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200">
                  <MessageCircle className="w-5 h-5" /> Чат с учеником
                </button>
              )}
              {selectedSlot && selectedSlot.isBooked && selectedSlot.format === 'online' && (
                <button
                  onClick={() => {
                    const roomName = `lesson_${selectedSlot.lessonId || selectedSlot.id}`;
                    const url = `https://video-chat-web-lp8d.onrender.com?room=${roomName}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>
                  Видеозвонок
                </button>
              )}
              {selectedSlot && selectedSlot.isBooked && (
                <button onClick={() => { completeLesson(selectedSlot.lessonId); handleCloseModal(); }} className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-200">
                  <CheckCircle className="w-5 h-5" /> Завершить урок
                </button>
              )}
              {selectedSlot && (
                <button onClick={() => { deleteSlot(selectedSlot.id); handleCloseModal(); }} className="absolute top-4 left-4 text-red-500 hover:text-red-700">
                  <Trash2 className="w-6 h-6" />
                </button>
              )}
              {/* Для урока */}
              {selectedLesson && selectedLesson.status === 'scheduled' && user && (
                <>
                  <button onClick={() => { getOrCreateChat(user.id, selectedLesson.studentId, user.name, selectedLesson.studentName); handleCloseModal(); }} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200">
                    <MessageCircle className="w-5 h-5" /> Чат с учеником
                  </button>
                  {/* Кнопка видеозвонка через внешний сервис */}
                  {selectedLesson.format === 'online' && (
                    <button
                      onClick={() => {
                        const roomName = `lesson_${selectedLesson.id}`;
                        const url = `https://video-chat-web-lp8d.onrender.com?room=${roomName}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                      className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>
                      Видеозвонок
                    </button>
                  )}
                  <button onClick={() => { completeLesson(selectedLesson.id); handleCloseModal(); }} className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-200">
                    <CheckCircle className="w-5 h-5" /> Завершить урок
                  </button>
                </>
              )}
              {selectedLesson && selectedLesson.status === 'completed' && (
                <div className="bg-gray-50 p-3 rounded-lg text-center text-gray-800">Урок завершён</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для выбранной заявки на овербукинг */}
      {showOverbookingRequestModal && selectedOverbookingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => { setShowOverbookingRequestModal(false); setSelectedOverbookingRequest(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold mb-4">Заявка на овербукинг</h3>
            <div className="space-y-2 mb-4">
              <div><span className="font-medium">Ученик:</span> {selectedOverbookingRequest.studentName}</div>
              <div><span className="font-medium">Предмет:</span> {selectedOverbookingRequest.subject}</div>
              <div><span className="font-medium">Класс:</span> {selectedOverbookingRequest.grade}</div>
              <div><span className="font-medium">Формат:</span> {selectedOverbookingRequest.format}</div>
              <div><span className="font-medium">Длительность:</span> {selectedOverbookingRequest.duration} мин</div>
              <div><span className="font-medium">Время:</span> {selectedOverbookingRequest.startTime || '—'} - {selectedOverbookingRequest.endTime || '—'}</div>
              <div><span className="font-medium">Цели:</span> {Array.isArray(selectedOverbookingRequest.goals) ? selectedOverbookingRequest.goals.join(', ') : selectedOverbookingRequest.goals}</div>
              {selectedOverbookingRequest.comment && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-blue-900">
                  <span className="font-medium">Комментарий:</span> {selectedOverbookingRequest.comment}
                </div>
              )}
            </div>
            <button
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              onClick={() => { handleAcceptOverbooking(selectedOverbookingRequest); setShowOverbookingRequestModal(false); setSelectedOverbookingRequest(null); }}
            >
              Забронировать слот
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSlots; 