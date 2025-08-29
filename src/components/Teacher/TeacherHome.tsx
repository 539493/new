import React, { useState } from 'react';
import { BookOpen, Users, Calendar, TrendingUp, Clock, Star, Plus, Settings } from 'lucide-react';
import ProfileEditModal from './ProfileEditModal';

const TeacherHome: React.FC = () => {
  const [showCreateSlot, setShowCreateSlot] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const handleProfileSave = (profile: any) => {
    console.log('Profile saved:', profile);
    // Здесь можно добавить логику обновления профиля
  };

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
              <div className="text-3xl font-bold">0</div>
              <div className="text-blue-100">Учеников</div>
            </div>
            <Users className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">0</div>
              <div className="text-green-100">Всего уроков</div>
            </div>
            <BookOpen className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">0</div>
              <div className="text-purple-100">Средний рейтинг</div>
            </div>
            <Star className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">0</div>
              <div className="text-orange-100">Уроков в этом месяце</div>
            </div>
            <TrendingUp className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <button
            onClick={() => setShowProfileEdit(true)}
            className="flex items-center space-x-3 p-4 bg-orange-50 text-orange-700 rounded-2xl hover:bg-orange-100 transition-all duration-200 hover:scale-105"
          >
            <Settings className="h-6 w-6" />
            <span className="font-medium">Редактировать профиль</span>
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
              <input
                type="date"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Время начала</label>
              <input
                type="time"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Длительность (минуты)</label>
              <input
                type="number"
                min="30"
                max="180"
                step="30"
                defaultValue="60"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => setShowCreateSlot(false)}
              className="px-6 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              Создать слот
            </button>
          </div>
        </div>
      )}

      {/* Последние уроки */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Последние уроки</h2>
        <div className="space-y-4">
          <div className="text-center text-gray-500 py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>У вас пока нет уроков</p>
            <p className="text-sm">Создайте слоты для начала работы</p>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        onSave={handleProfileSave}
      />
    </div>
  );
};

export default TeacherHome;