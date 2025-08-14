import React, { useState, useEffect } from 'react';
import { User as UserIcon, Star, MapPin, Clock, BookOpen, MessageCircle, Phone, Mail, ArrowLeft, Heart, Share2, Calendar, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { TeacherProfile, TimeSlot } from '../../types';
import BookingModal from '../Shared/BookingModal';

interface TeacherProfilePageProps {
  teacher: any;
  onClose: () => void;
  onBookLesson: (teacherId: string) => void;
}

const TeacherProfilePage: React.FC<TeacherProfilePageProps> = ({ teacher, onClose, onBookLesson }) => {
  const { user } = useAuth();
  const { timeSlots, bookLesson } = useData();
  const [isLiked, setIsLiked] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showSlots, setShowSlots] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Получаем слоты этого преподавателя
  const teacherSlots = timeSlots.filter(slot => slot.teacherId === teacher.id);
  const availableSlots = teacherSlots.filter(slot => !slot.isBooked);
  const bookedSlots = teacherSlots.filter(slot => slot.isBooked);

  const profile = teacher.profile as TeacherProfile;

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

  const handleBookSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (comment: string) => {
    if (user && selectedSlot) {
      console.log('Booking lesson:', selectedSlot.id, 'for user:', user.name, 'with comment:', comment);
      bookLesson(selectedSlot.id, user.id, user.name, comment);
      setShowBookingModal(false);
      setSelectedSlot(null);
    }
  };

  const formatDate = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative card-gradient">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden">
                {profile?.avatar && profile.avatar.trim() !== '' ? (
                  <img 
                    src={profile.avatar} 
                    alt={teacher.name} 
                    className="w-32 h-32 object-cover rounded-full"
                    onError={(e) => {
                      // Если изображение не загрузилось, показываем заглушку
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center ${profile?.avatar && profile.avatar.trim() !== '' ? 'hidden' : ''}`}>
                  <UserIcon className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile?.name || teacher.name || 'Репетитор'}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    {profile?.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{profile.rating}</span>
                      </div>
                    )}
                    {profile?.city && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.city}</span>
                      </div>
                    )}
                    {profile?.experience && (
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{getExperienceLabel(profile.experience)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => onBookLesson(teacher.id)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Записаться на урок</span>
                </button>
                <button
                  onClick={() => setShowSlots(!showSlots)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Посмотреть слоты ({availableSlots.length})</span>
                </button>
                <button
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Связаться</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          {showContactInfo && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Контактная информация</h3>
              <div className="space-y-2">
                {teacher.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{teacher.phone}</span>
                  </div>
                )}
                {teacher.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{teacher.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* About */}
          {profile?.bio && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">О преподавателе</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>
            </div>
          )}

          {/* Subjects and Grades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {profile?.subjects && profile.subjects.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Предметы</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile?.grades && profile.grades.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Классы</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.grades.map((grade, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {grade}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Teaching Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {profile?.hourlyRate && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Стоимость</h3>
                <div className="text-2xl font-bold text-blue-600">
                  {profile.hourlyRate} ₽/час
                </div>
              </div>
            )}

            {profile?.formats && profile.formats.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Форматы</h3>
                <div className="space-y-1">
                  {profile.formats.map((format, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{getFormatLabel(format)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile?.durations && profile.durations.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Длительность</h3>
                <div className="space-y-1">
                  {profile.durations.map((duration, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{duration} минут</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Goals */}
          {profile?.goals && profile.goals.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Цели занятий</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.goals.map((goal, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {profile?.lessonsCount || 0}
              </div>
              <div className="text-sm text-gray-600">Проведено уроков</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {profile?.students?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Учеников</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {profile?.rating || 0}
              </div>
              <div className="text-sm text-gray-600">Рейтинг</div>
            </div>
          </div>

          {/* Available Slots */}
          {showSlots && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Доступные слоты</h2>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableSlots.map((slot) => (
                    <div key={slot.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{slot.subject}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(slot.date, slot.startTime)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                            <MapPin className="h-3 w-3" />
                            <span>{getFormatLabel(slot.format)}</span>
                          </div>
                          <div className="text-lg font-bold text-blue-600">
                            {slot.price} ₽
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleBookSlot(slot)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Забронировать</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Нет доступных слотов на данный момент</p>
                  <p className="text-sm text-gray-500 mt-2">Попробуйте позже или свяжитесь с преподавателем</p>
                </div>
              )}
            </div>
          )}

          {/* Booked Slots */}
          {bookedSlots.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Забронированные уроки</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookedSlots.map((slot) => (
                  <div key={slot.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{slot.subject}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(slot.date, slot.startTime)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <MapPin className="h-3 w-3" />
                          <span>{getFormatLabel(slot.format)}</span>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {slot.price} ₽
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium text-center">
                      Забронировано
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Дополнительная информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile?.country && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Страна:</span>
                  <div className="text-gray-900">{profile.country}</div>
                </div>
              )}
              {profile?.offlineAvailable !== undefined && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Оффлайн занятия:</span>
                  <div className="text-gray-900">
                    {profile.offlineAvailable ? 'Доступны' : 'Недоступны'}
                  </div>
                </div>
              )}
              {profile?.overbookingEnabled !== undefined && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Овербукинг:</span>
                  <div className="text-gray-900">
                    {profile.overbookingEnabled ? 'Участвует' : 'Не участвует'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Подтверждение бронирования</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedSlot.subject}</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(selectedSlot.date, selectedSlot.startTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{getFormatLabel(selectedSlot.format)}</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {selectedSlot.price} ₽
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Комментарий к уроку (необязательно)
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Укажите цели занятия, особенности и т.д."
                  id="booking-comment"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    const comment = (document.getElementById('booking-comment') as HTMLTextAreaElement)?.value || '';
                    handleConfirmBooking(comment);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Подтвердить
                </button>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
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

export default TeacherProfilePage; 