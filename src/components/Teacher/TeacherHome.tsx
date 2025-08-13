import React, { useState } from 'react';
import { BookOpen, Users, Calendar, TrendingUp, Clock, Star, Plus } from 'lucide-react';

const TeacherHome: React.FC = () => {
  const [showCreateSlot, setShowCreateSlot] = useState(false);

  // Демо-данные
  const demoStats = {
    totalStudents: 12,
    totalLessons: 45,
    averageRating: 4.8,
    thisMonthLessons: 8
  };

  const demoRecentLessons = [
    {
      id: '1',
      studentName: 'Анна Иванова',
      subject: 'Математика',
      date: '2024-01-15',
      time: '14:00',
      status: 'completed'
    },
    {
      id: '2',
      studentName: 'Михаил Петров',
      subject: 'Физика',
      date: '2024-01-16',
      time: '16:00',
      status: 'scheduled'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Панель преподавателя 👨‍🏫
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Управляйте своими учениками и уроками
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{demoStats.totalStudents}</div>
              <div className="text-blue-100">Учеников</div>
            </div>
            <Users className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{demoStats.totalLessons}</div>
              <div className="text-green-100">Всего уроков</div>
            </div>
            <BookOpen className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{demoStats.averageRating}</div>
              <div className="text-purple-100">Средний рейтинг</div>
            </div>
            <Star className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{demoStats.thisMonthLessons}</div>
              <div className="text-orange-100">Уроков в этом месяце</div>
            </div>
            <TrendingUp className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowCreateSlot(!showCreateSlot)}
            className="flex items-center space-x-3 p-4 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-100 transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-6 w-6" />
            <span className="font-medium">Создать слот</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-green-50 text-green-700 rounded-2xl hover:bg-green-100 transition-all duration-200 hover:scale-105">
            <Users className="h-6 w-6" />
            <span className="font-medium">Мои ученики</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-purple-50 text-purple-700 rounded-2xl hover:bg-purple-100 transition-all duration-200 hover:scale-105">
            <Calendar className="h-6 w-6" />
            <span className="font-medium">Расписание</span>
          </button>
        </div>
      </div>

      {/* Создание слота */}
      {showCreateSlot && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 animate-slide-in-top">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Создать новый слот</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Предмет</label>
              <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Математика</option>
                <option>Физика</option>
                <option>Химия</option>
                <option>Английский язык</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата</label>
              <input type="date" className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Время начала</label>
              <input type="time" className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Длительность (мин)</label>
              <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>45</option>
                <option>60</option>
                <option>90</option>
                <option>120</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Формат</label>
              <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>online</option>
                <option>offline</option>
                <option>mini-group</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Цена (₽)</label>
              <input type="number" placeholder="1500" className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCreateSlot(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              Отмена
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 hover:scale-105">
              Создать слот
            </button>
          </div>
        </div>
      )}

      {/* Последние уроки */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Последние уроки</h2>
        <div className="space-y-4">
          {demoRecentLessons.map(lesson => (
            <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  lesson.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{lesson.studentName}</h4>
                  <p className="text-sm text-gray-600">{lesson.subject}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{lesson.date}</p>
                <p className="text-sm text-gray-600">{lesson.time}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  lesson.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {lesson.status === 'completed' ? 'Завершен' : 'Запланирован'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherHome;