import React from 'react';
import { Home, Calendar, MessageCircle, User, LogOut, BarChart3, BookOpen, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const studentTabs = [
    { id: 'home', label: 'Главная', icon: Home, description: 'Домашняя страница' },
    { id: 'lessons', label: 'Мои уроки', icon: Calendar, description: 'Расписание занятий' },
    { id: 'chats', label: 'Чаты', icon: MessageCircle, description: 'Общение с преподавателями' },
    { id: 'profile', label: 'Профиль', icon: User, description: 'Личные настройки' },
  ];

  const teacherTabs = [
    { id: 'slots', label: 'Слоты', icon: BookOpen, description: 'Управление временными слотами' },
    { id: 'calendar', label: 'Календарь', icon: Calendar, description: 'Планирование занятий' },
    { id: 'students', label: 'Ученики', icon: Users, description: 'Список учеников' },
    { id: 'chats', label: 'Чаты', icon: MessageCircle, description: 'Общение с учениками' },
    { id: 'profile', label: 'Профиль', icon: GraduationCap, description: 'Профессиональный профиль' },
  ];

  const tabs = user?.role === 'teacher' ? teacherTabs : studentTabs;

  return (
    <nav className="bg-gradient-to-r from-white via-blue-50 to-purple-50 shadow-xl border-b border-gray-200/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 flex items-center group">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 transform group-hover:scale-110 transition-all duration-300">
                <span className="text-white font-bold text-xl" style={{ fontFamily: 'Inter, sans-serif' }}>Na</span>
              </div>
              <span className="ml-3 text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" style={{ fontFamily: 'Inter, sans-serif' }}>
                uchi
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`group relative flex items-center gap-3 px-6 py-4 rounded-2xl text-base font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-white/80 hover:shadow-md'
                    }`}
                    title={tab.description}
                  >
                    <Icon className={`h-5 w-5 transition-transform duration-300 ${
                      isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                    }`} />
                    <span>{tab.label}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Profile and Actions */}
          <div className="flex items-center space-x-6">
            {/* User Info */}
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300">
                  <span className="text-white text-lg font-bold">
                    {user?.nickname.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
              </div>
              
              <div className="hidden md:block">
                <div className="text-base font-semibold text-gray-800">{user?.name}</div>
                <div className="text-sm text-gray-600">@{user?.nickname}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    user?.role === 'teacher' 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200'
                      : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                  }`}>
                    {user?.role === 'teacher' ? '👨‍🏫 Преподаватель' : '👨‍🎓 Ученик'}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 transform hover:scale-105 group"
              title="Выйти из системы"
            >
              <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
          <div className="flex space-x-2 py-3 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/80 hover:shadow-md'
                  }`}
                  title={tab.description}
                >
                  <Icon className={`h-5 w-5 ${
                    isActive ? 'text-white' : 'text-gray-600'
                  }`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;