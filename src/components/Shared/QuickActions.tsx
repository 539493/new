import React, { useState } from 'react';
import { Plus, Calendar, MessageCircle, BookOpen, Users, Settings, Bell, Star, Clock, Target, TrendingUp, Zap, Heart, Award, Globe, Phone, Video, MapPin } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  action: () => void;
  badge?: string;
  isNew?: boolean;
}

interface QuickActionsProps {
  userRole: 'student' | 'teacher';
  onAction: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ userRole, onAction }) => {
  const [showAllActions, setShowAllActions] = useState(false);

  const studentActions: QuickAction[] = [
    {
      id: 'book-lesson',
      title: 'Забронировать урок',
      description: 'Найти и забронировать урок с преподавателем',
      icon: <BookOpen className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      action: () => onAction('book-lesson'),
      isNew: true
    },
    {
      id: 'find-teacher',
      title: 'Найти преподавателя',
      description: 'Поиск по предметам и рейтингу',
      icon: <Users className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      action: () => onAction('find-teacher')
    },
    {
      id: 'schedule',
      title: 'Мое расписание',
      description: 'Просмотр запланированных уроков',
      icon: <Calendar className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      action: () => onAction('schedule')
    },
    {
      id: 'messages',
      title: 'Сообщения',
      description: 'Чат с преподавателями',
      icon: <MessageCircle className="h-6 w-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      action: () => onAction('messages'),
      badge: '3'
    },
    {
      id: 'goals',
      title: 'Мои цели',
      description: 'Управление целями обучения',
      icon: <Target className="h-6 w-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100',
      action: () => onAction('goals')
    },
    {
      id: 'progress',
      title: 'Прогресс',
      description: 'Отслеживание результатов',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
      action: () => onAction('progress')
    }
  ];

  const teacherActions: QuickAction[] = [
    {
      id: 'create-slot',
      title: 'Создать слот',
      description: 'Добавить новое время для уроков',
      icon: <Plus className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      action: () => onAction('create-slot'),
      isNew: true
    },
    {
      id: 'schedule',
      title: 'Мое расписание',
      description: 'Управление временными слотами',
      icon: <Calendar className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      action: () => onAction('schedule')
    },
    {
      id: 'students',
      title: 'Мои студенты',
      description: 'Список и управление студентами',
      icon: <Users className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      action: () => onAction('students')
    },
    {
      id: 'messages',
      title: 'Сообщения',
      description: 'Чат со студентами',
      icon: <MessageCircle className="h-6 w-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      action: () => onAction('messages'),
      badge: '5'
    },
    {
      id: 'analytics',
      title: 'Аналитика',
      description: 'Статистика и отчеты',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100',
      action: () => onAction('analytics')
    },
    {
      id: 'profile',
      title: 'Профиль',
      description: 'Редактирование профиля',
      icon: <Settings className="h-6 w-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
      action: () => onAction('profile')
    }
  ];

  const actions = userRole === 'student' ? studentActions : teacherActions;
  const displayedActions = showAllActions ? actions : actions.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Быстрые действия</h3>
          <p className="text-gray-600">Доступные функции и инструменты</p>
        </div>
        
        <button
          onClick={() => setShowAllActions(!showAllActions)}
          className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
        >
          <span>{showAllActions ? 'Скрыть' : 'Показать все'}</span>
          <Plus className={`h-4 w-4 transition-transform duration-200 ${showAllActions ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {/* Сетка действий */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`group relative p-6 rounded-2xl border-2 border-transparent transition-all duration-300 hover:scale-105 hover:shadow-lg ${action.bgColor}`}
          >
            {/* Бейдж "Новое" */}
            {action.isNew && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Новое
              </div>
            )}

            {/* Иконка */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${action.bgColor.replace('hover:', '')} group-hover:scale-110 transition-transform duration-200`}>
              <div className={action.color}>
                {action.icon}
              </div>
            </div>

            {/* Содержание */}
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-200">
                {action.title}
              </h4>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
                {action.description}
              </p>
            </div>

            {/* Бейдж уведомлений */}
            {action.badge && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium min-w-[20px] text-center">
                {action.badge}
              </div>
            )}

            {/* Стрелка */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Дополнительные виджеты */}
      {userRole === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Виджет следующего урока */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">Следующий урок</h4>
                <p className="text-blue-700 text-sm">Математика • Завтра в 15:00</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">Преподаватель:</span>
                <span className="text-blue-900 font-medium">Анна Петрова</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">Формат:</span>
                <span className="text-blue-900 font-medium">Онлайн</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">Длительность:</span>
                <span className="text-blue-900 font-medium">60 мин</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-4">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm">
                Присоединиться
              </button>
              <button className="px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-xl transition-all duration-200">
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Виджет целей */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-900">Цели обучения</h4>
                <p className="text-emerald-700 text-sm">Прогресс по целям</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-emerald-700">Подготовка к ЕГЭ</span>
                  <span className="text-emerald-900 font-medium">75%</span>
                </div>
                <div className="w-full bg-emerald-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-emerald-700">Разговорный английский</span>
                  <span className="text-emerald-900 font-medium">45%</span>
                </div>
                <div className="w-full bg-emerald-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-emerald-700">Физика 11 класс</span>
                  <span className="text-emerald-900 font-medium">90%</span>
                </div>
                <div className="w-full bg-emerald-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 text-sm">
              Управлять целями
            </button>
          </div>
        </div>
      )}

      {userRole === 'teacher' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Виджет статистики */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-900">Статистика недели</h4>
                <p className="text-purple-700 text-sm">Ваши результаты</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">12</div>
                <div className="text-purple-700 text-sm">Уроков</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">8</div>
                <div className="text-purple-700 text-sm">Студентов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">4.8</div>
                <div className="text-purple-700 text-sm">Рейтинг</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">24ч</div>
                <div className="text-purple-700 text-sm">Часов</div>
              </div>
            </div>
          </div>

          {/* Виджет расписания */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-orange-900">Сегодня</h4>
                <p className="text-orange-700 text-sm">Расписание уроков</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                <div>
                  <div className="font-medium text-orange-900">Математика</div>
                  <div className="text-orange-700 text-sm">Иван Смирнов</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-orange-900">14:00</div>
                  <div className="text-orange-700 text-sm">60 мин</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                <div>
                  <div className="font-medium text-orange-900">Физика</div>
                  <div className="text-orange-700 text-sm">Мария Козлова</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-orange-900">16:00</div>
                  <div className="text-orange-700 text-sm">90 мин</div>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all duration-200 text-sm">
              Управлять расписанием
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;




