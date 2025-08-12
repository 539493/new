import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, BookOpen, MapPin, Users, DollarSign, MessageSquare, CheckCircle, AlertCircle, Star } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  slot: any;
  teacher: any;
  student: any;
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  slot, 
  teacher, 
  student 
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Сброс состояния при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setComment('');
      setIsSubmitting(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(comment);
      setShowSuccess(true);
      
      // Показываем успешное сообщение перед закрытием
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error booking lesson:', error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return; // Не закрываем во время отправки
    
    const modal = document.querySelector('.modal-content');
    if (modal) {
      modal.classList.add('modal-closing');
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      onClose();
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'online': return <BookOpen className="h-5 w-5" />;
      case 'offline': return <MapPin className="h-5 w-5" />;
      case 'mini-group': return <Users className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'online': return 'Онлайн';
      case 'offline': return 'Очно';
      case 'mini-group': return 'Мини-группа';
      default: return format;
    }
  };

  const getLessonTypeLabel = (type: string) => {
    switch (type) {
      case 'regular': return 'Обычный урок';
      case 'consultation': return 'Консультация';
      case 'exam_prep': return 'Подготовка к экзамену';
      case 'homework_help': return 'Помощь с домашним заданием';
      default: return type;
    }
  };

  if (!isOpen) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center animate-scale-in">
          <div className="mb-6">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Урок забронирован!</h2>
            <p className="text-gray-600">Мы уведомим преподавателя о вашем запросе</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">
                {new Date(slot?.date).toLocaleDateString('ru-RU')} в {slot?.startTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-content">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Подтверждение бронирования</h2>
            <p className="text-gray-600">Проверьте детали урока перед подтверждением</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:scale-110"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Информация об уроке */}
        <div className="p-8 space-y-8">
          {/* Информация о преподавателе */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
            <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Преподаватель
            </h3>
            <div className="flex items-center space-x-4">
              {teacher?.avatar ? (
                <img 
                  src={teacher.avatar} 
                  alt={teacher.name} 
                  className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="h-8 w-8 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-900 mb-1">{teacher?.name || 'Преподаватель'}</h4>
                <p className="text-blue-700 font-medium mb-2">{slot?.subject}</p>
                {teacher?.profile?.rating && (
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(teacher.profile.rating) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">{teacher.profile.rating}/5</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Детали урока */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Детали урока
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="text-sm text-gray-600">Дата</span>
                    <div className="font-semibold text-gray-900">{new Date(slot?.date).toLocaleDateString('ru-RU')}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <span className="text-sm text-gray-600">Время</span>
                    <div className="font-semibold text-gray-900">{slot?.startTime} - {slot?.endTime}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <div>
                    <span className="text-sm text-gray-600">Предмет</span>
                    <div className="font-semibold text-gray-900">{slot?.subject}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                  {getFormatIcon(slot?.format)}
                  <div>
                    <span className="text-sm text-gray-600">Формат</span>
                    <div className="font-semibold text-gray-900">{getFormatLabel(slot?.format)}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                  <div>
                    <span className="text-sm text-gray-600">Тип</span>
                    <div className="font-semibold text-gray-900">{getLessonTypeLabel(slot?.lessonType)}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <div>
                    <span className="text-sm text-green-600">Стоимость</span>
                    <div className="text-2xl font-bold text-green-700">{slot?.price} ₽</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Информация о студенте */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Студент
              </h3>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200">
                <div className="flex items-center space-x-4">
                  {student?.avatar ? (
                    <img 
                      src={student.avatar} 
                      alt={student.name} 
                      className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-1">{student?.name}</h4>
                    <p className="text-green-700 font-medium">Студент</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600">Активный</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Важно знать</h4>
                    <p className="text-sm text-blue-700">
                      Отмена урока возможна не позднее чем за 2 часа до начала. 
                      При отмене в более позднее время может взиматься плата.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Комментарий */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Примечание к уроку
            </h3>
            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Опишите ваши цели, задачи или особые пожелания к уроку..."
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300 hover:border-gray-300 focus:scale-[1.01]"
                rows={4}
                disabled={isSubmitting}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {comment.length}/500
              </div>
            </div>
            <p className="text-sm text-gray-500 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Это поможет преподавателю лучше подготовиться к уроку
            </p>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex items-center justify-between p-8 border-t border-gray-200 bg-gray-50/50">
          <button
            onClick={handleClose}
            className="px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-2xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-3"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Бронирование...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Забронировать урок</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal; 