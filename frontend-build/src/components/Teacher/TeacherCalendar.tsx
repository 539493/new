import React, { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

const locales = {
  'ru': ru,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface AssignProps {
  mode?: 'assign';
  student?: { id: string; name: string };
  onAssign?: () => void;
}

const TeacherCalendar: React.FC<AssignProps> = ({ mode, student, onAssign }) => {
  const { timeSlots, lessons, bookLesson, createSlot } = useData();
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  
  // Состояние для создания нового слота
  const [isCreateSlotModalOpen, setIsCreateSlotModalOpen] = useState(false);
  const [newSlotData, setNewSlotData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    subject: '',
    lessonType: 'regular',
    format: 'online',
    price: 1000,
    experience: 'beginner',
    goals: [],
    grades: []
  });
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [booking, setBooking] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Фильтруем только незанятые слоты преподавателя
  const teacherSlots = timeSlots.filter((slot: any) => {
    if (slot.teacherId !== user?.id || slot.status === 'completed') return false;
    // В режиме назначения показываем только слоты, которые не забронированы или забронированы на этого ученика
    if (mode === 'assign' && student) {
      if (slot.isBooked && slot.bookedStudentId !== student.id) return false;
    } else {
      if (slot.isBooked) return false;
    }
    return true;
  });
  const teacherLessons = lessons.filter((lesson: any) => lesson.teacherId === user?.id && lesson.status !== 'completed');

  // Если режим назначения, показываем все слоты преподавателя (занятые и свободные)
  const assignSlots = mode === 'assign'
    ? timeSlots.filter((slot: any) => slot.teacherId === user?.id && slot.status !== 'completed')
    : teacherSlots;
  const assignLessons = mode === 'assign'
    ? lessons.filter((lesson: any) => lesson.teacherId === user?.id && lesson.status !== 'completed')
    : teacherLessons;

  // Преобразуем слоты в события календаря
  const slotEvents = assignSlots.map(slot => ({
    id: slot.id,
    title: `${slot.subject} - ${slot.isBooked ? 'Забронирован' : 'Свободен'}`,
    start: new Date(`${slot.date}T${slot.startTime}`),
    end: new Date(`${slot.date}T${slot.endTime}`),
    resource: slot,
    type: 'slot',
    isBooked: slot.isBooked,
    subject: slot.subject,
    price: slot.price,
    format: slot.format,
    lessonType: slot.lessonType
  }));

  // Преобразуем уроки в события календаря
  const lessonEvents = assignLessons.map(lesson => ({
    id: lesson.id,
    title: `${lesson.subject} - ${lesson.studentName}`,
    start: new Date(`${lesson.date}T${lesson.startTime}`),
    end: new Date(`${lesson.date}T${lesson.endTime}`),
    resource: lesson,
    type: 'lesson',
    studentName: lesson.studentName,
    subject: lesson.subject,
    price: lesson.price,
    format: lesson.format,
    status: lesson.status,
  }));

  const events = [...slotEvents, ...lessonEvents];

  const eventStyleGetter = useCallback((event: any) => {
    let style: any = {
      borderRadius: '8px',
      border: 'none',
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: '500',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease',
    };

    if (event.type === 'slot') {
      if (event.isBooked) {
        style.backgroundColor = '#10b981';
        style.color = 'white';
      } else {
        style.backgroundColor = '#3b82f6';
        style.color = 'white';
      }
    } else if (event.type === 'lesson') {
      style.backgroundColor = '#f59e0b';
      style.color = 'white';
    }

    return { style };
  }, []);

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    setStudentName(''); // Сбрасываем имя студента при открытии модалки
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setStudentName('');
  };

  // Функция бронирования слота на выбранного ученика
  const handleBookSlot = async (slot: any) => {
    if (mode === 'assign' && student) {
      await bookLesson(slot.id, student.id, student.name);
      if (onAssign) onAssign();
    }
  };

  // Обработчик двойного клика по календарю для создания нового слота
  const handleSelectSlot = useCallback((slotInfo: any) => {
    const { start, end } = slotInfo;
    const date = format(start, 'yyyy-MM-dd');
    const startTime = format(start, 'HH:mm');
    const endTime = format(end, 'HH:mm');
    
    setNewSlotData({
      date,
      startTime,
      endTime,
      subject: '',
      lessonType: 'regular',
      format: 'online',
      price: 1000,
      experience: 'beginner',
      goals: [],
      grades: []
    });
    setIsCreateSlotModalOpen(true);
  }, []);

  // Обработчик создания нового слота
  const handleCreateSlot = async () => {
    if (!user || !newSlotData.subject.trim()) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    // Валидация времени
    if (!newSlotData.startTime || !newSlotData.endTime || newSlotData.startTime >= newSlotData.endTime) {
      alert('Проверьте корректность времени начала и окончания');
      return;
    }
    setIsCreatingSlot(true);
    try {
      if (mode === 'assign' && student) {
        await createSlot({
          ...newSlotData,
          teacherId: user.id,
          teacherName: user.name,
          duration: 60,
          lessonType: newSlotData.lessonType as 'regular' | 'trial',
          format: newSlotData.format as 'online' | 'offline',
          experience: newSlotData.experience as 'beginner' | 'experienced',
          goals: newSlotData.goals || [],
          grades: newSlotData.grades || []
        }, student.id, student.name, { mode: 'assign' });
        setIsCreateSlotModalOpen(false);
        setNewSlotData({
          date: '',
          startTime: '',
          endTime: '',
          subject: '',
          lessonType: 'regular',
          format: 'online',
          price: 1000,
          experience: 'beginner',
          goals: [],
          grades: []
        });
        return;
      }
      await createSlot({
        ...newSlotData,
        teacherId: user.id,
        teacherName: user.name,
        duration: 60,
        lessonType: newSlotData.lessonType as 'regular' | 'trial',
        format: newSlotData.format as 'online' | 'offline',
        experience: newSlotData.experience as 'beginner' | 'experienced',
        goals: newSlotData.goals || [],
        grades: newSlotData.grades || []
      });
      setIsCreateSlotModalOpen(false);
      setNewSlotData({
        date: '',
        startTime: '',
        endTime: '',
        subject: '',
        lessonType: 'regular',
        format: 'online',
        price: 1000,
        experience: 'beginner',
        goals: [],
        grades: []
      });
      alert('Слот успешно создан!');
    } catch (error) {
      alert('Ошибка при создании слота');
    } finally {
      setIsCreatingSlot(false);
    }
  };

  // Функция бронирования слота на ученика
  const handleBookForStudent = async (slot: any) => {
    if (!student) return;
    setBooking(true);
    try {
      await bookLesson(slot.id, student.id, student.name);
      setSuccessMsg(`Урок назначен для ${student.name}`);
      setTimeout(() => {
        setSuccessMsg('');
        setSelectedSlot(null);
        if (onAssign) onAssign();
      }, 1200);
    } catch (e) {
      alert('Ошибка при бронировании слота');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-2">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Календарь занятий</h1>
          <p className="text-xs text-gray-600">Управляйте своим расписанием и отслеживайте забронированные уроки</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="p-3">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 400 }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              views={['month', 'week', 'day']}
              messages={{
                next: "Следующий",
                previous: "Предыдущий",
                today: "Сегодня",
                month: "Месяц",
                week: "Неделя",
                day: "День",
                noEventsInRange: "Нет событий в выбранном диапазоне",
                showMore: (total: number) => `+${total} еще`,
              }}
              className="custom-calendar"
            />
          </div>
        </div>

        {/* Легенда */}
        <div className="mt-3 bg-white rounded-lg shadow-sm border border-gray-100 p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Легенда</h3>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded"></div>
              <span className="text-xs text-gray-700">Свободные слоты</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-700">Забронированные слоты</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded"></div>
              <span className="text-xs text-gray-700">Запланированные уроки</span>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно с деталями события */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg shadow-lg max-w-xs w-full p-3 transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-bold text-gray-900">
                {selectedEvent.type === 'slot' ? 'Детали слота' : 'Детали урока'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-1.5">
              <div>
                <span className="text-xs font-medium text-gray-500">Предмет:</span>
                <p className="text-xs text-gray-900">{selectedEvent.subject}</p>
              </div>

              {selectedEvent.type === 'slot' ? (
                <>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Статус:</span>
                    <p className={`text-xs font-medium ${selectedEvent.isBooked ? 'text-green-600' : 'text-blue-600'}`}>
                      {selectedEvent.isBooked ? 'Забронирован' : 'Свободен'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Тип урока:</span>
                    <p className="text-xs text-gray-900 capitalize">{selectedEvent.lessonType}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Формат:</span>
                    <p className="text-xs text-gray-900 capitalize">{selectedEvent.format}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Цена:</span>
                    <p className="text-xs text-gray-900">{selectedEvent.price} ₽</p>
                  </div>
                  {!selectedEvent.isBooked && (
                    <div className="mt-3">
                      <span className="text-xs font-medium text-gray-500">Имя студента для бронирования:</span>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1.5 text-xs"
                        placeholder="Введите имя студента"
                      />
                      <button
                        onClick={() => handleBookSlot(selectedEvent.resource)}
                        disabled={isBooking}
                        className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                      >
                        {isBooking ? 'Бронирую...' : 'Забронировать слот'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Ученик:</span>
                    <p className="text-xs text-gray-900">{selectedEvent.studentName}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Статус:</span>
                    <p className="text-xs text-gray-900 capitalize">{selectedEvent.status}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Формат:</span>
                    <p className="text-xs text-gray-900 capitalize">{selectedEvent.format}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Цена:</span>
                    <p className="text-xs text-gray-900">{selectedEvent.price} ₽</p>
                  </div>
                </>
              )}

              <div>
                <span className="text-xs font-medium text-gray-500">Время:</span>
                <p className="text-gray-900 text-xs">
                  {format(selectedEvent.start, 'HH:mm')} - {format(selectedEvent.end, 'HH:mm')}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500">Дата:</span>
                <p className="text-gray-900 text-xs">
                  {format(selectedEvent.start, 'dd MMMM yyyy', { locale: ru })}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно создания нового слота */}
      {isCreateSlotModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-4 transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-gray-900">Создать новый слот</h3>
              <button
                onClick={() => setIsCreateSlotModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Предмет *
                </label>
                <input
                  type="text"
                  value={newSlotData.subject}
                  onChange={(e) => setNewSlotData({...newSlotData, subject: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-1.5 text-xs"
                  placeholder="Например: Математика"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Время начала
                  </label>
                  <input
                    type="time"
                    value={newSlotData.startTime}
                    onChange={(e) => setNewSlotData({...newSlotData, startTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Время окончания
                  </label>
                  <input
                    type="time"
                    value={newSlotData.endTime}
                    onChange={(e) => setNewSlotData({...newSlotData, endTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Тип урока
                  </label>
                  <select
                    value={newSlotData.lessonType}
                    onChange={(e) => setNewSlotData({...newSlotData, lessonType: e.target.value})}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1.5 text-xs"
                  >
                    <option value="regular">Обычный</option>
                    <option value="trial">Пробный</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Формат
                  </label>
                  <select
                    value={newSlotData.format}
                    onChange={(e) => setNewSlotData({...newSlotData, format: e.target.value})}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-1.5 text-xs"
                  >
                    <option value="online">Онлайн</option>
                    <option value="offline">Офлайн</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Цена (₽)
                </label>
                <input
                  type="number"
                  value={newSlotData.price}
                  onChange={(e) => setNewSlotData({...newSlotData, price: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-1.5 text-xs"
                  placeholder="1000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Опыт
                </label>
                <select
                  value={newSlotData.experience}
                  onChange={(e) => setNewSlotData({...newSlotData, experience: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-1.5 text-xs"
                >
                  <option value="beginner">Начинающий</option>
                  <option value="experienced">Опытный</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsCreateSlotModalOpen(false)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateSlot}
                disabled={isCreatingSlot || !newSlotData.subject.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {isCreatingSlot ? 'Создаю...' : 'Создать слот'}
              </button>
            </div>
          </div>
        </div>
      )}
      {mode === 'assign' && student && selectedSlot && !selectedSlot.isBooked && (
        <button
          onClick={() => handleBookForStudent(selectedSlot)}
          disabled={booking}
          style={{ marginTop: 12, padding: '6px 16px', fontSize: 14 }}
        >
          {booking ? 'Назначение...' : `Забронировать для ${student.name}`}
        </button>
      )}
      {successMsg && <div style={{ color: 'green', marginTop: 8, fontSize: 14 }}>{successMsg}</div>}
    </div>
  );
};

export default TeacherCalendar; 