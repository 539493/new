import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Edit, MapPin, Users, MessageCircle, CheckCircle, Bell, X, BookOpen, User, Star, TrendingUp, Award } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { TimeSlot, Lesson } from '../../types';
import VideoChatLink from '../Shared/VideoChatLink';

// убираем локальный socket, используем глобальный из DataContext

const TeacherSlots: React.FC = () => {
  const { timeSlots, lessons, createSlot, cancelLesson, getOrCreateChat, completeLesson, deleteSlot, isConnected } = useData();
  const { user } = useAuth();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    duration: 60,
    subject: '',
    lessonType: 'regular' as 'regular' | 'trial' | 'consultation' | 'exam_prep' | 'homework_help',
    format: 'online' as 'online' | 'offline' | 'mini-group',
    price: 1000,
    grades: [] as string[],
    experience: 'beginner' as 'beginner' | 'experienced' | 'professional',
    city: '',
  });

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showOverbookingModal, setShowOverbookingModal] = useState(false);
  const [overbookingRequests, setOverbookingRequests] = useState<any[]>([]);
  const [selectedOverbookingRequest, setSelectedOverbookingRequest] = useState<any>(null);
  const [showOverbookingRequestModal, setShowOverbookingRequestModal] = useState(false);
  const [view, setView] = useState<'slots' | 'lessons' | 'overbooking'>('slots');

  // Автоматическая подписка при подключении сокета и наличии user.id
  useEffect(() => {
    if (user?.id && isConnected) {
      console.log('[CLIENT][AUTO] subscribeOverbooking emit', user.id);
    }
  }, [user?.id, isConnected]);

  useEffect(() => {
    if (user && user.profile && Array.isArray((user.profile as any).subjects) && (user.profile as any).subjects.length >= 1) {
      setNewSlot((prev) => ({ ...prev, subject: (user.profile as any).subjects[0] }));
    }
  }, [user]);

  // Получение статистики
  const getStats = () => {
    const totalSlots = timeSlots.filter(s => s.teacherId === user?.id).length;
    const bookedSlots = timeSlots.filter(s => s.teacherId === user?.id && s.isBooked).length;
    const availableSlots = totalSlots - bookedSlots;
    const totalLessons = lessons.filter(l => l.teacherId === user?.id).length;
    const completedLessons = lessons.filter(l => l.teacherId === user?.id && l.status === 'completed').length;
    const totalEarnings = lessons
      .filter(l => l.teacherId === user?.id && l.status === 'completed')
      .reduce((sum, l) => sum + l.price, 0);

    return {
      totalSlots,
      bookedSlots,
      availableSlots,
      totalLessons,
      completedLessons,
      totalEarnings
    };
  };

  const stats = getStats();

  // Обработчик создания слота
  const handleCreateSlot = async () => {
    if (!user) return;

    try {
      await createSlot({
        teacherId: user.id,
        teacherName: user.name,
        teacherAvatar: user.avatar,
        date: newSlot.date,
        startTime: newSlot.startTime,
        endTime: calculateEndTime(newSlot.startTime, newSlot.duration),
        duration: newSlot.duration,
        subject: newSlot.subject,
        lessonType: newSlot.lessonType,
        format: newSlot.format,
        price: newSlot.price,
        grades: newSlot.grades,
        experience: newSlot.experience,
        city: newSlot.city,
        isBooked: false,
      });

      setShowCreateModal(false);
      setNewSlot({
        date: '',
        startTime: '',
        duration: 60,
        subject: '',
        lessonType: 'regular',
        format: 'online',
        price: 1000,
        grades: [],
        experience: 'beginner',
        city: '',
      });
    } catch (error) {
      console.error('Error creating slot:', error);
    }
  };

  // Вычисление времени окончания
  const calculateEndTime = (startTime: string, duration: number) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(start.getTime() + duration * 60000);
    return end.toTimeString().slice(0, 5);
  };

  // Обработчик завершения урока
  const handleCompleteLesson = async (lessonId: string) => {
    try {
      await completeLesson(lessonId);
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  // Обработчик отмены урока
  const handleCancelLesson = async (lessonId: string) => {
    try {
      await cancelLesson(lessonId);
    } catch (error) {
      console.error('Error cancelling lesson:', error);
    }
  };

  // Получение уроков для текущего преподавателя
  const teacherLessons = lessons.filter(lesson => lesson.teacherId === user?.id);

  // Получение слотов для текущего преподавателя
  const teacherSlots = timeSlots.filter(slot => slot.teacherId === user?.id);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Управление уроками 📚
        </h1>
        <p className="text-xl text-gray-600">
          Создавайте слоты, планируйте уроки и отслеживайте прогресс учеников
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.totalSlots}</div>
              <div className="text-blue-100 text-sm">Всего слотов</div>
            </div>
            <BookOpen className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.availableSlots}</div>
              <div className="text-green-100 text-sm">Свободно</div>
            </div>
            <Calendar className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.bookedSlots}</div>
              <div className="text-purple-100 text-sm">Забронировано</div>
            </div>
            <CheckCircle className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.totalLessons}</div>
              <div className="text-orange-100 text-sm">Всего уроков</div>
            </div>
            <Users className="h-10 w-10 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.completedLessons}</div>
              <div className="text-red-100 text-sm">Завершено</div>
            </div>
            <Award className="h-10 w-10 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.totalEarnings}₽</div>
              <div className="text-indigo-100 text-sm">Заработано</div>
            </div>
            <TrendingUp className="h-10 w-10 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Переключатели вида */}
      <div className="flex justify-center space-x-2">
        {(['slots', 'lessons', 'overbooking'] as const).map((viewType) => (
          <button
            key={viewType}
            onClick={() => setView(viewType)}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 hover:scale-105 ${
              view === viewType
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {viewType === 'slots' ? 'Слоты' : viewType === 'lessons' ? 'Уроки' : 'Заявки'}
          </button>
        ))}
      </div>

      {/* Кнопка создания слота */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-xl hover:shadow-2xl"
        >
          <Plus className="h-6 w-6" />
          <span className="text-lg font-semibold">Создать слот</span>
        </button>
      </div>

      {/* Контент в зависимости от выбранного вида */}
      {view === 'slots' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Мои временные слоты</h2>
          
          {teacherSlots.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Слоты не найдены</h3>
              <p className="text-gray-500">Создайте свой первый временной слот для проведения уроков</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherSlots.map((slot, index) => (
                <div
                  key={slot.id}
                  className={`bg-white rounded-3xl shadow-lg border-2 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up ${
                    slot.isBooked 
                      ? 'border-green-200 bg-green-50/30' 
                      : 'border-gray-100'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Статус слота */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      slot.isBooked
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {slot.isBooked ? 'Забронирован' : 'Свободен'}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedSlot(slot)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Информация о слоте */}
                  <div className="space-y-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{slot.subject}</h3>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(slot.date).toLocaleDateString('ru-RU')}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{slot.format === 'online' ? 'Онлайн' : 'Очно'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{slot.lessonType === 'regular' ? 'Обычный' : 
                             slot.lessonType === 'trial' ? 'Пробный' :
                             slot.lessonType === 'consultation' ? 'Консультация' :
                             slot.lessonType === 'exam_prep' ? 'Подготовка к экзамену' : 'Помощь с ДЗ'}</span>
                    </div>
                  </div>

                  {/* Цена */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-600">
                      {slot.price} ₽
                    </div>
                    
                    {slot.isBooked && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Забронирован</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'lessons' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Мои уроки</h2>
          
          {teacherLessons.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Уроки не найдены</h3>
              <p className="text-gray-500">Пока нет запланированных или проведенных уроков</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teacherLessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        lesson.status === 'completed' ? 'bg-green-100' :
                        lesson.status === 'cancelled' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <BookOpen className={`h-6 w-6 ${
                          lesson.status === 'completed' ? 'text-green-600' :
                          lesson.status === 'cancelled' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{lesson.subject}</h3>
                        <p className="text-sm text-gray-600">Ученик: {lesson.studentName}</p>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      lesson.status === 'completed' ? 'bg-green-100 text-green-800' :
                      lesson.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {lesson.status === 'completed' ? 'Завершен' :
                       lesson.status === 'cancelled' ? 'Отменен' : 'Запланирован'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(lesson.date).toLocaleDateString('ru-RU')}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{lesson.startTime} - {lesson.endTime}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{lesson.format === 'online' ? 'Онлайн' : 'Очно'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-blue-600">
                      {lesson.price} ₽
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {lesson.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => handleCompleteLesson(lesson.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all duration-200 hover:scale-105"
                          >
                            Завершить
                          </button>
                          <button
                            onClick={() => handleCancelLesson(lesson.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-200 hover:scale-105"
                          >
                            Отменить
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => getOrCreateChat(lesson.studentId, lesson.teacherId, lesson.studentName, lesson.teacherName)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'overbooking' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Заявки на уроки</h2>
          
          {overbookingRequests.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Заявки не найдены</h3>
              <p className="text-gray-500">Пока нет новых заявок от учеников</p>
            </div>
          ) : (
            <div className="space-y-4">
              {overbookingRequests.map((request, index) => (
                <div
                  key={request.id}
                  className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                        <Bell className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.subject}</h3>
                        <p className="text-sm text-gray-600">Ученик: {request.studentName}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Дата: {new Date(request.date).toLocaleDateString('ru-RU')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Время: {request.startTime}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>Формат: {request.format === 'online' ? 'Онлайн' : 'Очно'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Класс: {request.grade}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Star className="h-4 w-4" />
                        <span>Опыт: {request.experience === 'beginner' ? 'Начинающий' : 
                               request.experience === 'experienced' ? 'Опытный' : 'Профессионал'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Длительность: {request.duration} мин</span>
                      </div>
                    </div>
                  </div>

                  {request.comment && (
                    <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                      <p className="text-sm text-gray-700">{request.comment}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Город: {request.city}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedOverbookingRequest(request);
                          setShowOverbookingRequestModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                      >
                        Рассмотреть
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Модальное окно создания слота */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Создать временной слот</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-200 hover:scale-110"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Дата</label>
                  <input
                    type="date"
                    value={newSlot.date}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Время начала</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Длительность (мин)</label>
                  <select
                    value={newSlot.duration}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value={45}>45 минут</option>
                    <option value={60}>60 минут</option>
                    <option value={90}>90 минут</option>
                    <option value={120}>120 минут</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Предмет</label>
                  <input
                    type="text"
                    value={newSlot.subject}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тип урока</label>
                  <select
                    value={newSlot.lessonType}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, lessonType: e.target.value as any }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="regular">Обычный урок</option>
                    <option value="trial">Пробный урок</option>
                    <option value="consultation">Консультация</option>
                    <option value="exam_prep">Подготовка к экзамену</option>
                    <option value="homework_help">Помощь с домашним заданием</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Формат</label>
                  <select
                    value={newSlot.format}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, format: e.target.value as any }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="online">Онлайн</option>
                    <option value="offline">Очно</option>
                    <option value="mini-group">Мини-группа</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Цена (₽)</label>
                  <input
                    type="number"
                    value={newSlot.price}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
                  <input
                    type="text"
                    value={newSlot.city}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Москва"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-200"
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreateSlot}
                  className="px-6 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                >
                  Создать слот
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSlots; 