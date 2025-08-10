import React, { useState, useEffect } from 'react';
import { User as UserIcon, Star, MapPin, Clock, BookOpen, MessageCircle, Phone, Mail, ArrowLeft, Heart, Share2, Calendar, X, Award, CheckCircle, Users, GraduationCap, Target, Zap } from 'lucide-react';
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
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto relative border border-gray-100">
        {/* Header with gradient background */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'text-red-400 bg-white/20' : 'text-white/80 hover:text-red-400 hover:bg-white/20'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-1">
                  {profile?.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt={teacher.name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                      <UserIcon className="h-20 w-20 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {profile?.name || teacher.name || 'Репетитор'}
            </h1>
            
            <div className="flex items-center justify-center space-x-6 text-gray-600 mb-6">
              {profile?.rating && (
                <div className="flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="font-semibold text-yellow-700">{profile.rating}</span>
                </div>
              )}
              {profile?.city && (
                <div className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-700">{profile.city}</span>
                </div>
              )}
              {profile?.experience && (
                <div className="flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-700">{getExperienceLabel(profile.experience)}</span>
                </div>
              )}
            </div>

            {/* Main CTA Button */}
            <div className="mb-8">
              <button
                onClick={() => onBookLesson(teacher.id)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 mx-auto"
              >
                <BookOpen className="h-6 w-6" />
                <span>Записаться на урок</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {profile?.lessonsCount || 0}
              </div>
              <div className="text-sm text-blue-700 font-medium">Проведено уроков</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {profile?.students?.length || 0}
              </div>
              <div className="text-sm text-green-700 font-medium">Учеников</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {profile?.rating || 0}
              </div>
              <div className="text-sm text-purple-700 font-medium">Рейтинг</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center border border-orange-200">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {profile?.hourlyRate || 0}
              </div>
              <div className="text-sm text-orange-700 font-medium">₽/час</div>
            </div>
          </div>

          {/* About Section */}
          {profile?.bio && (
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">О преподавателе</h2>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>
            </div>
          )}

          {/* Subjects and Grades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {profile?.subjects && profile.subjects.length > 0 && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Предметы</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {profile.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-200 hover:from-green-200 hover:to-emerald-200 transition-all duration-200"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile?.grades && profile.grades.length > 0 && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Классы</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {profile.grades.map((grade, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold border border-purple-200 hover:from-purple-200 hover:to-pink-200 transition-all duration-200"
                    >
                      {grade}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Teaching Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {profile?.formats && profile.formats.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Форматы</h3>
                </div>
                <div className="space-y-2">
                  {profile.formats.map((format, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700 font-medium">{getFormatLabel(format)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile?.durations && profile.durations.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Длительность</h3>
                </div>
                <div className="space-y-2">
                  {profile.durations.map((duration, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700 font-medium">{duration} минут</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile?.goals && profile.goals.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Цели</h3>
                </div>
                <div className="space-y-2">
                  {profile.goals.slice(0, 3).map((goal, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700 text-sm">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-12 justify-center">
            <button
              onClick={() => setShowSlots(!showSlots)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <Calendar className="h-5 w-5" />
              <span>Посмотреть слоты ({availableSlots.length})</span>
            </button>
            <button
              onClick={() => setShowContactInfo(!showContactInfo)}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Связаться</span>
            </button>
          </div>

          {/* Contact Info */}
          {showContactInfo && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Контактная информация</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacher.phone && (
                  <div className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-blue-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Телефон</div>
                      <div className="font-semibold text-gray-900">{teacher.phone}</div>
                    </div>
                  </div>
                )}
                {teacher.email && (
                  <div className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-blue-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-semibold text-gray-900">{teacher.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Available Slots */}
          {showSlots && (
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Доступные слоты</h2>
              </div>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableSlots.map((slot) => (
                    <div key={slot.id} className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      <div className="mb-4">
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">{slot.subject}</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>{formatDate(slot.date, slot.startTime)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-green-500" />
                            <span>{getFormatLabel(slot.format)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-4">
                        {slot.price} ₽
                      </div>
                      <button
                        onClick={() => handleBookSlot(slot)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                      >
                        <BookOpen className="h-5 w-5" />
                        <span>Забронировать</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 text-center border border-gray-200">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">Нет доступных слотов на данный момент</p>
                  <p className="text-gray-500">Попробуйте позже или свяжитесь с преподавателем</p>
                </div>
              )}
            </div>
          )}

          {/* Booked Slots */}
          {bookedSlots.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Забронированные уроки</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookedSlots.map((slot) => (
                  <div key={slot.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{slot.subject}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-green-500" />
                          <span>{formatDate(slot.date, slot.startTime)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-green-500" />
                          <span>{getFormatLabel(slot.format)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-4">
                      {slot.price} ₽
                    </div>
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl text-sm font-semibold text-center">
                      Забронировано
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Подтверждение бронирования</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200">
                <h4 className="font-bold text-gray-900 mb-3 text-lg">{selectedSlot.subject}</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>{formatDate(selectedSlot.date, selectedSlot.startTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span>{getFormatLabel(selectedSlot.format)}</span>
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    {selectedSlot.price} ₽
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Комментарий к уроку (необязательно)
                </label>
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
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
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  Подтвердить
                </button>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
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