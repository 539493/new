import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MessageCircle, 
  User, 
  MapPin, 
  Users, 
  X, 
  Edit, 
  Trash2, 
  Video, 
  Star, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Zap,
  CheckCircle,
  PlayCircle,
  Phone,
  MessageSquare,
  CalendarDays,
  Timer,
  Target,
  Sparkles
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

const StudentLessons: React.FC = () => {
  const { lessons, cancelLesson, rescheduleLesson, getOrCreateChat } = useData();
  const { user } = useAuth();

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const userLessons = lessons.filter(lesson => lesson.studentId === user?.id);
  const scheduledLessons = userLessons.filter(lesson => lesson.status === 'scheduled');
  const completedLessons = userLessons.filter(lesson => lesson.status === 'completed');

  const handleOpenChat = (teacherId: string, teacherName: string) => {
    if (user) {
      const chatId = getOrCreateChat(user.id, teacherId, user.name, teacherName);
    }
  };

  const handleCancelLesson = (lessonId: string) => {
    if (window.confirm('Вы уверены, что хотите отменить урок?')) {
      cancelLesson(lessonId);
    }
  };

  const handleRescheduleLesson = () => {
    if (selectedLesson && newDate && newTime) {
      rescheduleLesson(selectedLesson.id, newDate, newTime);
      setShowRescheduleModal(false);
      setSelectedLesson(null);
      setNewDate('');
      setNewTime('');
    }
  };

  const openRescheduleModal = (lesson: any) => {
    setSelectedLesson(lesson);
    setNewDate(lesson.date);
    setNewTime(lesson.startTime);
    setShowRescheduleModal(true);
  };

  const getFormatIcon = (format: string): JSX.Element => {
    switch (format) {
      case 'online': return <Video className="h-5 w-5" />;
      case 'offline': return <MapPin className="h-5 w-5" />;
      case 'mini-group': return <Users className="h-5 w-5" />;
      default: return <Video className="h-5 w-5" />;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'online': return 'Онлайн';
      case 'offline': return 'Оффлайн';
      case 'mini-group': return 'Мини-группа';
      default: return format;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'scheduled') {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Запланирован
        </div>
      );
    }
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
        <CheckCircle className="h-4 w-4 mr-2" />
        Завершен
      </div>
    );
  };

  const LessonCard = ({ lesson, isScheduled }: { lesson: any; isScheduled: boolean }) => (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
      {/* Header с градиентом */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{lesson.subject}</h3>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-200" />
                <span className="text-blue-100 font-medium">{lesson.teacherName}</span>
              </div>
            </div>
            {getStatusBadge(lesson.status)}
          </div>
          
          <div className="flex items-center space-x-3 text-blue-100">
            <div className="flex items-center space-x-2">
              {getFormatIcon(lesson.format)}
              <span className="text-sm font-medium">{getFormatLabel(lesson.format)}</span>
            </div>
            {lesson.lessonType === 'trial' && (
              <div className="flex items-center space-x-1 bg-yellow-400 bg-opacity-20 px-2 py-1 rounded-full">
                <Star className="h-4 w-4 text-yellow-300" />
                <span className="text-yellow-200 text-xs font-medium">Пробный</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Основная информация */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Дата</p>
              <p className="text-sm font-semibold text-gray-900">{lesson.date}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Время</p>
              <p className="text-sm font-semibold text-gray-900">
                {lesson.startTime} - {lesson.endTime}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Timer className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Длительность</p>
              <p className="text-sm font-semibold text-gray-900">{lesson.duration} мин</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">Стоимость</p>
            <p className="text-2xl font-bold text-gray-900">{lesson.price}₽</p>
          </div>
        </div>

        {/* Действия для запланированных уроков */}
        {isScheduled && (
          <div className="space-y-4">
            {/* Основные действия */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOpenChat(lesson.teacherId, lesson.teacherName)}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Чат</span>
              </button>
              
              {lesson.format === 'online' && (
                <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  <Video className="h-5 w-5" />
                  <span>Видеозвонок</span>
                </button>
              )}
            </div>
            
            {/* Дополнительные действия */}
            <div className="flex space-x-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => openRescheduleModal(lesson)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl font-medium transition-all duration-200 border border-orange-200 hover:border-orange-300"
              >
                <Edit className="h-4 w-4" />
                <span>Перенести</span>
              </button>
              
              <button
                onClick={() => handleCancelLesson(lesson.id)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-all duration-200 border border-red-200 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4" />
                <span>Отменить</span>
              </button>
            </div>
          </div>
        )}

        {/* Информация для завершенных уроков */}
        {!isScheduled && (
          <div className="flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-700 font-medium">Урок успешно завершен</span>
          </div>
        )}
      </div>

      {/* Декоративные элементы */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок страницы */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-lg mb-6">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="text-blue-600 font-semibold">Образовательная платформа</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Мои уроки
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Управляйте вашими запланированными и завершенными уроками. 
            Отслеживайте прогресс и достигайте новых высот в обучении.
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{scheduledLessons.length}</p>
                <p className="text-gray-600">Запланировано</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedLessons.length}</p>
                <p className="text-gray-600">Завершено</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{userLessons.length}</p>
                <p className="text-gray-600">Всего уроков</p>
              </div>
            </div>
          </div>
        </div>

        {/* Запланированные уроки */}
        <div className="mb-16">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Запланированные уроки</h2>
              <p className="text-gray-600">Ваши предстоящие занятия</p>
            </div>
          </div>
          
          {scheduledLessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {scheduledLessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} isScheduled={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                <Calendar className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Нет запланированных уроков</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Забронируйте свой первый урок на главной странице и начните свой путь к знаниям
              </p>
              <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <Zap className="h-5 w-5" />
                <span>Забронировать урок</span>
              </button>
            </div>
          )}
        </div>

        {/* Завершенные уроки */}
        <div className="mb-16">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-green-100 rounded-xl">
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Завершенные уроки</h2>
              <p className="text-gray-600">Ваши достижения и пройденный материал</p>
            </div>
          </div>
          
          {completedLessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {completedLessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} isScheduled={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Award className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Нет завершенных уроков</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                После завершения уроков здесь будут отображаться ваши достижения и прогресс
              </p>
              <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium">
                <Target className="h-5 w-5" />
                <span>Достижения появятся здесь</span>
              </div>
            </div>
          )}
        </div>

        {/* Призыв к действию */}
        <div className="text-center py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl text-white shadow-2xl">
          <div className="max-w-2xl mx-auto px-6">
            <h3 className="text-3xl font-bold mb-4">Готовы к следующему уроку?</h3>
            <p className="text-xl text-blue-100 mb-8">
              Продолжайте обучение и достигайте новых высот вместе с нашими преподавателями
            </p>
            <button className="inline-flex items-center space-x-3 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <PlayCircle className="h-6 w-6" />
              <span>Найти преподавателя</span>
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно переноса урока */}
      {showRescheduleModal && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Перенести урок</h2>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Урок:</strong> {selectedLesson.subject} с {selectedLesson.teacherName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Новая дата</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Новое время</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={handleRescheduleLesson}
                  disabled={!newDate || !newTime}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Перенести урок
                </button>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLessons;