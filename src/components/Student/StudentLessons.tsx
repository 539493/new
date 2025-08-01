import React, { useState } from 'react';
import { Calendar, Clock, MessageCircle, User, MapPin, Users, X, Edit, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

const StudentLessons: React.FC = () => {
  const { lessons, cancelLesson, rescheduleLesson, getOrCreateChat } = useData();
  const { user } = useAuth();

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  // Удаляю переменные и функции, связанные с видеозвонком

  const userLessons = lessons.filter(lesson => lesson.studentId === user?.id);
  const scheduledLessons = userLessons.filter(lesson => lesson.status === 'scheduled');
  const completedLessons = userLessons.filter(lesson => lesson.status === 'completed');

  // --- Видеозвонок ---
  // Удаляю все переменные и функции, связанные с видеозвонком



  const handleOpenChat = (teacherId: string, teacherName: string) => {
    if (user) {
      const chatId = getOrCreateChat(user.id, teacherId, user.name, teacherName);
      // В реальном приложении здесь бы был переход к чату
      console.log('Opening chat:', chatId);
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

  const getFormatIcon = (format: string): JSX.Element | null => {
    switch (format) {
      case 'online': return null;
      case 'offline': return <MapPin className="h-4 w-4" />;
      case 'mini-group': return <Users className="h-4 w-4" />;
      default: return null;
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

  const LessonCard = ({ lesson, isScheduled }: { lesson: any; isScheduled: boolean }) => (
    <div className="card-gradient hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{lesson.subject}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{lesson.teacherName}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            lesson.status === 'scheduled' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {lesson.status === 'scheduled' ? 'Запланирован' : 'Завершен'}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{lesson.date}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{lesson.startTime} - {lesson.endTime} ({lesson.duration} мин)</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            {getFormatIcon(lesson.format)}
            <span className="text-sm">{getFormatLabel(lesson.format)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-lg font-bold text-gray-900">{lesson.price}₽</span>
            {lesson.lessonType === 'trial' && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Пробный
              </span>
            )}
          </div>
        </div>
        
        {isScheduled && (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <button
                onClick={() => handleOpenChat(lesson.teacherId, lesson.teacherName)}
                className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">Чат</span>
              </button>
              {/* Кнопка видеозвонка */}
              {lesson.format === 'online' && (
                <button
                  onClick={() => {
                    const roomId = `lesson_${lesson.id}`;
                    const userName = user?.name || 'Student';
                    const url = `/video-chat?room=${roomId}&user=${encodeURIComponent(userName)}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex items-center space-x-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>
                  <span className="text-sm">Видеозвонок</span>
                </button>
              )}
            </div>
            
            <div className="flex space-x-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => openRescheduleModal(lesson)}
                className="flex items-center space-x-1 px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span className="text-sm">Перенести</span>
              </button>
              <button
                onClick={() => handleCancelLesson(lesson.id)}
                className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm">Отменить</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои уроки</h1>
        <p className="text-gray-600">Управляйте вашими запланированными и завершенными уроками</p>
      </div>

      {/* Scheduled Lessons */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Запланированные уроки</h2>
        {scheduledLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scheduledLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} isScheduled={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет запланированных уроков</h3>
            <p className="text-gray-600">Забронируйте урок на главной странице</p>
          </div>
        )}
      </div>

      {/* Completed Lessons */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Завершенные уроки</h2>
        {completedLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} isScheduled={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет завершенных уроков</h3>
            <p className="text-gray-600">Ваши завершенные уроки будут отображаться здесь</p>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Перенести урок</h2>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Урок: {selectedLesson.subject} с {selectedLesson.teacherName}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Новая дата</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Новое время</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleRescheduleLesson}
                  disabled={!newDate || !newTime}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Перенести урок
                </button>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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