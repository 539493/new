import React from 'react';
import { User as UserIcon, Star, BookOpen, Heart, Share2, CheckCircle, Users, Award } from 'lucide-react';

export default function StudentHome(): JSX.Element {
  // Демо-данные для профиля ученика
  const studentProfile = {
    name: 'Lena',
    avatar: null, // Можно добавить реальное изображение
    rating: 0,
    experience: 'Опытный',
    lessonsCount: 0,
    studentsCount: 0,
    hourlyRate: 1500,
    subjects: ['Математика'],
    grades: ['1']
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <span className="text-white text-xl">←</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-1">
                {studentProfile.avatar ? (
                  <img 
                    src={studentProfile.avatar} 
                    alt={studentProfile.name} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <UserIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {studentProfile.name}
          </h1>
          
          <div className="flex items-center justify-center space-x-4 text-gray-600 mb-4">
            <div className="flex items-center space-x-2 bg-purple-100 px-3 py-1.5 rounded-full">
              <Award className="h-3 w-3 text-purple-600" />
              <span className="font-medium text-purple-700 text-sm">{studentProfile.experience}</span>
            </div>
          </div>

          {/* Main CTA Button */}
          <div className="mb-6">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold text-base hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 mx-auto">
              <BookOpen className="h-5 w-5" />
              <span>Записаться на урок</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          <div className="bg-white rounded-lg p-2 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="text-xl font-bold text-blue-600 mb-0.5 group-hover:text-blue-700 transition-colors">
              {studentProfile.lessonsCount}
            </div>
            <div className="text-xs text-gray-500 font-medium">Проведено уроков</div>
          </div>
          <div className="bg-white rounded-lg p-2 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="text-xl font-bold text-emerald-600 mb-0.5 group-hover:text-emerald-700 transition-colors">
              {studentProfile.studentsCount}
            </div>
            <div className="text-xs text-gray-500 font-medium">Учеников</div>
          </div>
          <div className="bg-white rounded-lg p-2 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="text-xl font-bold text-purple-600 mb-0.5 group-hover:text-purple-700 transition-colors">
              {studentProfile.rating}
            </div>
            <div className="text-xs text-gray-500 font-medium">Рейтинг</div>
          </div>
          <div className="bg-white rounded-lg p-2 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="text-xl font-bold text-orange-600 mb-0.5 group-hover:text-orange-700 transition-colors">
              {studentProfile.hourlyRate}
            </div>
            <div className="text-xs text-gray-500 font-medium">₽/час</div>
          </div>
        </div>

        {/* Subjects and Grades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {studentProfile.subjects && studentProfile.subjects.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-3 h-3 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Предметы</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {studentProfile.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-200 hover:from-green-200 hover:to-emerald-200 transition-all duration-200"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {studentProfile.grades && studentProfile.grades.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Users className="w-3 h-3 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Классы</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {studentProfile.grades.map((grade, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-semibold border border-purple-200 hover:from-purple-200 hover:to-pink-200 transition-all duration-200"
                  >
                    {grade}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Добро пожаловать!</h2>
          <p className="text-gray-700 leading-relaxed">
            Здесь вы можете просматривать доступные слоты, свои уроки и управлять профилем. 
            Используйте кнопку "Записаться на урок" для поиска преподавателей.
          </p>
        </div>
      </div>
    </div>
  );
}


