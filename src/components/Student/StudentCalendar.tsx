import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Lesson } from '../../types';
import { Clock, MapPin, User, BookOpen, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const locales = { 'ru': ru };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const StudentCalendar: React.FC = () => {
  const { lessons } = useData();
  const { user } = useAuth();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  // Фильтруем уроки для текущего студента
  const studentLessons = lessons.filter(lesson => lesson.studentId === user?.id);

  // Конвертируем уроки в формат для календаря
  const calendarEvents = studentLessons.map(lesson => ({
    id: lesson.id,
    title: `${lesson.subject} - ${lesson.teacherName}`,
    start: new Date(`${lesson.date}T${lesson.startTime}`),
    end: new Date(`${lesson.date}T${lesson.endTime}`),
    lesson: lesson,
    resource: lesson
  }));

  // Обработчик клика по событию
  const handleEventClick = (event: any) => {
    setSelectedLesson(event.lesson);
    setShowLessonModal(true);
  };

  // Получение цвета для статуса урока
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'scheduled':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Получение иконки для статуса
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-white" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-white" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-white" />;
      default:
        return <AlertCircle className="h-4 w-4 text-white" />;
    }
  };

  // Получение текста статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      case 'scheduled':
        return 'Запланирован';
      default:
        return 'Неизвестно';
    }
  };

  // Кастомный компонент события
  const EventComponent = ({ event }: { event: any }) => (
    <div className="flex items-center space-x-2 p-1">
      <div className={`w-2 h-2 rounded-full ${getStatusColor(event.lesson.status)}`}></div>
      <span className="text-xs font-medium truncate">{event.title}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Мой календарь</h1>
        <p className="text-gray-600">Планируйте и отслеживайте свои уроки</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {studentLessons.length}
              </div>
              <div className="text-sm text-gray-600">Всего уроков</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {studentLessons.filter(l => l.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Завершено</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {studentLessons.filter(l => l.status === 'scheduled').length}
              </div>
              <div className="text-sm text-gray-600">Запланировано</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {new Set(studentLessons.map(l => l.teacherId)).size}
              </div>
              <div className="text-sm text-gray-600">Преподавателей</div>
            </div>
          </div>
        </div>
      </div>

      {/* Переключатели вида */}
      <div className="flex justify-center space-x-2">
        {(['month', 'week', 'day'] as const).map((viewType) => (
          <button
            key={viewType}
            onClick={() => setView(viewType)}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 hover:scale-105 ${
              view === viewType
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {viewType === 'month' ? 'Месяц' : viewType === 'week' ? 'Неделя' : 'День'}
          </button>
        ))}
      </div>

      {/* Календарь */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          onView={(newView) => setView(newView as any)}
          onSelectEvent={handleEventClick}
          eventPropGetter={(event) => ({
            className: 'hover:shadow-lg transition-all duration-200 cursor-pointer'
          })}
          components={{
            event: EventComponent
          }}
          className="custom-calendar"
          messages={{
            next: "Следующий",
            previous: "Предыдущий",
            today: "Сегодня",
            month: "Месяц",
            week: "Неделя",
            day: "День",
            agenda: "Повестка",
            date: "Дата",
            time: "Время",
            event: "Событие",
            noEventsInRange: "В выбранном диапазоне нет событий."
          }}
        />
      </div>

      {/* Модальное окно урока */}
      {showLessonModal && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content">
            {/* Заголовок */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Детали урока</h2>
              <button
                onClick={() => setShowLessonModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-200 hover:scale-110"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Содержимое */}
            <div className="p-6 space-y-6">
              {/* Статус */}
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getStatusColor(selectedLesson.status)}`}></div>
                <span className="text-sm font-medium text-gray-600">
                  {getStatusText(selectedLesson.status)}
                </span>
              </div>

              {/* Основная информация */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <div>
                      <span className="text-sm text-gray-600">Предмет</span>
                      <div className="font-semibold text-gray-900">{selectedLesson.subject}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="text-sm text-gray-600">Преподаватель</span>
                      <div className="font-semibold text-gray-900">{selectedLesson.teacherName}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <span className="text-sm text-gray-600">Время</span>
                      <div className="font-semibold text-gray-900">
                        {selectedLesson.startTime} - {selectedLesson.endTime}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    <div>
                      <span className="text-sm text-gray-600">Дата</span>
                      <div className="font-semibold text-gray-900">
                        {new Date(selectedLesson.date).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    <div>
                      <span className="text-sm text-gray-600">Формат</span>
                      <div className="font-semibold text-gray-900">
                        {selectedLesson.format === 'online' ? 'Онлайн' : 'Очно'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 text-red-600 flex items-center justify-center">
                      ₽
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Стоимость</span>
                      <div className="font-semibold text-gray-900">{selectedLesson.price} ₽</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Комментарий */}
              {selectedLesson.comment && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Комментарий к уроку</h4>
                  <p className="text-gray-700">{selectedLesson.comment}</p>
                </div>
              )}

              {/* Действия */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowLessonModal(false)}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-200"
                >
                  Закрыть
                </button>
                {selectedLesson.status === 'scheduled' && (
                  <button className="px-6 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-200 hover:scale-105">
                    Отменить урок
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCalendar; 