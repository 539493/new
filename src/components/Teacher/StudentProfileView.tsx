import React from 'react';
import { User, MapPin, Phone, School, Calendar, Target, Heart, Clock, Globe } from 'lucide-react';
import { StudentProfile } from '../../types';

interface StudentProfileViewProps {
  studentProfile: StudentProfile;
  studentName: string;
}

const StudentProfileView: React.FC<StudentProfileViewProps> = ({ studentProfile, studentName }) => {
  const getLearningStyleLabel = (style: string) => {
    switch (style) {
      case 'visual': return 'Визуальный';
      case 'auditory': return 'Аудиальный';
      case 'kinesthetic': return 'Кинестетический';
      case 'mixed': return 'Смешанный';
      default: return 'Не указан';
    }
  };

  const getExperienceLabel = (experience: string) => {
    switch (experience) {
      case 'beginner': return 'Начинающий';
      case 'intermediate': return 'Средний';
      case 'advanced': return 'Продвинутый';
      default: return 'Не указан';
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
          {studentProfile.avatar ? (
            <img src={studentProfile.avatar} alt={studentName} className="w-16 h-16 object-cover rounded-full" />
          ) : (
            <User className="h-8 w-8 text-white" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{studentName}</h2>
          <p className="text-gray-600">{studentProfile.grade && `${studentProfile.grade} класс`}</p>
        </div>
      </div>

      {/* Основная информация */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {studentProfile.age && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Возраст: {studentProfile.age} лет</span>
          </div>
        )}
        
        {studentProfile.city && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{studentProfile.city}</span>
          </div>
        )}
        
        {studentProfile.school && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <School className="h-4 w-4" />
            <span>{studentProfile.school}</span>
          </div>
        )}
        
        {studentProfile.phone && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{studentProfile.phone}</span>
          </div>
        )}
      </div>

      {/* Контактная информация родителей */}
      {(studentProfile.parentName || studentProfile.parentPhone) && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Контактная информация родителей</h3>
          <div className="space-y-2">
            {studentProfile.parentName && (
              <div className="text-sm text-blue-800">
                <span className="font-medium">Имя:</span> {studentProfile.parentName}
              </div>
            )}
            {studentProfile.parentPhone && (
              <div className="text-sm text-blue-800">
                <span className="font-medium">Телефон:</span> {studentProfile.parentPhone}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Цели обучения */}
      {studentProfile.goals && studentProfile.goals.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Цели обучения
          </h3>
          <div className="flex flex-wrap gap-2">
            {studentProfile.goals.map((goal, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {goal}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Интересы */}
      {studentProfile.interests && studentProfile.interests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Heart className="h-4 w-4 mr-2" />
            Интересы и хобби
          </h3>
          <div className="flex flex-wrap gap-2">
            {studentProfile.interests.map((interest, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Стиль обучения и уровень */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {studentProfile.learningStyle && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Стиль обучения</h4>
            <p className="text-sm text-gray-600">{getLearningStyleLabel(studentProfile.learningStyle)}</p>
          </div>
        )}
        
        {studentProfile.experience && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Уровень знаний</h4>
            <p className="text-sm text-gray-600">{getExperienceLabel(studentProfile.experience)}</p>
          </div>
        )}
      </div>

      {/* Предпочтения */}
      {(studentProfile.preferredFormats?.length || studentProfile.preferredDurations?.length) && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Предпочтения
          </h3>
          <div className="space-y-3">
            {studentProfile.preferredFormats && studentProfile.preferredFormats.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Форматы занятий:</h4>
                <div className="flex flex-wrap gap-2">
                  {studentProfile.preferredFormats.map((format, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                      {getFormatLabel(format)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {studentProfile.preferredDurations && studentProfile.preferredDurations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Длительность занятий:</h4>
                <div className="flex flex-wrap gap-2">
                  {studentProfile.preferredDurations.map((duration, index) => (
                    <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                      {duration} минут
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Часовой пояс */}
      {studentProfile.timeZone && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Globe className="h-4 w-4" />
          <span>Часовой пояс: {studentProfile.timeZone}</span>
        </div>
      )}

      {/* О себе */}
      {studentProfile.bio && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">О себе</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{studentProfile.bio}</p>
        </div>
      )}
    </div>
  );
};

export default StudentProfileView;
