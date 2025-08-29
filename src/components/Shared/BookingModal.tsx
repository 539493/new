import React, { useState } from 'react';
import { X, Calendar, Clock, User, BookOpen, MapPin, Users, DollarSign, MessageSquare } from 'lucide-react';

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

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(comment);
      onClose();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'online': return <BookOpen className="h-4 w-4" />;
      case 'offline': return <MapPin className="h-4 w-4" />;
      case 'mini-group': return <Users className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Подтверждение бронирования</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Информация об уроке */}
        <div className="p-6 space-y-6">
          {/* Информация о преподавателе */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Преподаватель</h3>
            <div className="flex items-center space-x-3">
              {teacher?.avatar ? (
                <img 
                  src={teacher.avatar} 
                  alt={teacher.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-900">{teacher?.name || 'Преподаватель'}</h4>
                <p className="text-sm text-gray-600">{slot?.subject}</p>
                {teacher?.profile?.rating && (
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-gray-600 ml-1">{teacher.profile.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Детали урока */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Детали урока</h3>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Дата: {new Date(slot?.date).toLocaleDateString('ru-RU')}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-700">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Время: {slot?.startTime} - {slot?.endTime}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-700">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Предмет: {slot?.subject}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-700">
                  {getFormatIcon(slot?.format)}
                  <span className="text-sm">Формат: {getFormatLabel(slot?.format)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-700">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Тип: {getLessonTypeLabel(slot?.lessonType)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-700">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Стоимость: {slot?.price} ₽</span>
                </div>
              </div>
            </div>

            {/* Информация о студенте */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Студент</h3>
              
              <div className="flex items-center space-x-3">
                {student?.avatar ? (
                  <img 
                    src={student.avatar} 
                    alt={student.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{student?.name}</h4>
                  <p className="text-sm text-gray-600">Студент</p>
                </div>
              </div>
            </div>
          </div>

          {/* Комментарий */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Примечание к уроку</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Опишите ваши цели, задачи или особые пожелания к уроку..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
            <p className="text-sm text-gray-500">
              Это поможет преподавателю лучше подготовиться к уроку
            </p>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Бронирование...</span>
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4" />
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