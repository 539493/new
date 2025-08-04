import React, { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { TimeSlot } from '../../types';
import { Clock, MapPin, Star, User, BookOpen, X } from 'lucide-react';
import BookingModal from '../Shared/BookingModal';

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

interface StudentCalendarProps {
  onClose: () => void;
}

const StudentCalendar: React.FC<StudentCalendarProps> = ({ onClose }) => {
  const { timeSlots, bookLesson } = useData();
  const { user } = useAuth();
  
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Получаем все доступные слоты
  const availableSlots = timeSlots.filter(slot => !slot.isBooked);

  // Преобразуем слоты в события для календаря
  const events = availableSlots.map(slot => ({
    id: slot.id,
    title: `${slot.teacherName} - ${slot.subject}`,
    start: new Date(`${slot.date}T${slot.startTime}`),
    end: new Date(`${slot.date}T${slot.endTime}`),
    slot: slot,
    teacherName: slot.teacherName,
    subject: slot.subject,
    price: slot.price,
    format: slot.format,
    experience: slot.experience,
    rating: slot.rating,
    city: slot.city,
    teacherAvatar: slot.teacherAvatar
  }));

  const eventStyleGetter = useCallback((event: any) => {
    let style: any = {
      backgroundColor: '#3B82F6',
      borderRadius: '8px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: '500'
    };

    // Разные цвета для разных форматов
    if (event.format === 'offline') {
      style.backgroundColor = '#10B981';
    } else if (event.format === 'mini-group') {
      style.backgroundColor = '#8B5CF6';
    }

    return { style };
  }, []);

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleBookSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
    setIsModalOpen(false);
  };

  const handleConfirmBooking = async (comment: string) => {
    if (user && selectedSlot) {
      console.log('Booking lesson:', selectedSlot.id, 'for user:', user.name, 'with comment:', comment);
      bookLesson(selectedSlot.id, user.id, user.name, comment);
      setShowBookingModal(false);
      setSelectedSlot(null);
    }
  };

  const getExperienceLabel = (exp: string) => {
    switch (exp) {
      case 'beginner': return 'Начинающий';
      case 'experienced': return 'Опытный';
      case 'professional': return 'Профессионал';
      default: return exp;
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden relative">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Календарь свободных слотов</h1>
              <p className="text-gray-600 mt-2">Выберите удобное время для занятия с преподавателем</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              views={['month', 'week', 'day']}
              messages={{
                next: "Следующий",
                previous: "Предыдущий",
                today: "Сегодня",
                month: "Месяц",
                week: "Неделя",
                day: "День",
                noEventsInRange: "Нет свободных слотов в выбранном диапазоне",
                showMore: (total: number) => `+${total} еще`,
              }}
              className="custom-calendar"
            />
          </div>
        </div>

        {/* Event Details Modal */}
        {isModalOpen && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Детали слота</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Teacher Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden">
                    {selectedEvent.teacherAvatar ? (
                      <img 
                        src={selectedEvent.teacherAvatar} 
                        alt={selectedEvent.teacherName} 
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    ) : (
                      <User className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedEvent.teacherName}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {selectedEvent.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span>{selectedEvent.rating}</span>
                        </div>
                      )}
                      {selectedEvent.experience && (
                        <span className="text-blue-600">{getExperienceLabel(selectedEvent.experience)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Slot Details */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{selectedEvent.subject}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {format(selectedEvent.start, 'dd MMMM yyyy, HH:mm', { locale: ru })} - {format(selectedEvent.end, 'HH:mm', { locale: ru })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{getFormatLabel(selectedEvent.format)}</span>
                  </div>

                  <div className="text-lg font-bold text-blue-600">
                    {selectedEvent.price} ₽
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleBookSlot(selectedEvent.slot)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Забронировать</span>
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedSlot && (
          <BookingModal
            slot={selectedSlot}
            onClose={() => setShowBookingModal(false)}
            onConfirm={handleConfirmBooking}
          />
        )}
      </div>
    </div>
  );
};

export default StudentCalendar; 