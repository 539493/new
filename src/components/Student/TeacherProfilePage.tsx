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
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
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

        {/* Profile Content */}
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-start space-x-6 mb-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                {teacher.avatar || profile?.avatar ? (
                  <img 
                    src={teacher.avatar || profile?.avatar} 
                    alt={teacher.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-16 w-16 text-white" />
                )}
              </div>
            </div>

            {/* Teacher Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {profile?.name || teacher.name || 'Репетитор'}
              </h1>
              
              {/* Experience */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>0 {getExperienceLabel(profile?.experience || 'experienced')}</span>
                </div>
              </div>

              {/* Book Lesson Button */}
              <button
                onClick={() => {
                  if (availableSlots.length > 0) {
                    handleBookSlot(availableSlots[0]);
                  } else {
                    setShowSlots(true);
                  }
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>Записаться на урок</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-blue-600">Проведено уроков</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-green-600">Учеников</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{profile?.rating || 0}</div>
              <div className="text-sm text-purple-600">Рейтинг</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{profile?.hourlyRate || 0}</div>
              <div className="text-sm text-orange-600">₽/час</div>
            </div>
          </div>

          {/* Subjects and Classes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Subjects */}
            {profile?.subjects && profile.subjects.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <span>Предметы</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.subjects.map((subject: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Classes */}
            {profile?.grades && profile.grades.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <UserIcon className="w-5 h-5 text-purple-600" />
                  <span>Классы</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.grades.map((grade: string, index: number) => (
                    <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                      {grade}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Контактная информация</h3>
              <div className="space-y-2">
                {teacher.email && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{teacher.email}</span>
                  </div>
                )}
                {teacher.phone && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
                {profile?.city && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.city}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Teaching Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Информация о преподавании</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Длительность урока: {profile?.duration || 60} мин</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>Формат: {getFormatLabel(profile?.format || 'online')}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Star className="w-4 h-4" />
                  <span>Опыт: {getExperienceLabel(profile?.experience || 'experienced')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">О преподавателе</h3>
              <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Available Slots */}
          {availableSlots.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Доступные слоты</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSlots.slice(0, 6).map((slot) => (
                  <div key={slot.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{slot.subject}</span>
                      <span className="text-sm text-gray-500">{slot.price} ₽</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {formatDate(slot.date, slot.startTime)}
                    </div>
                    <button
                      onClick={() => handleBookSlot(slot)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Забронировать
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedSlot && (
          <BookingModal
            isOpen={showBookingModal}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedSlot(null);
            }}
            onConfirm={handleConfirmBooking}
            slot={selectedSlot}
            teacher={teacher}
            student={user!}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherProfilePage; 