import React, { useState, useEffect } from 'react';
import { Home, Calendar, MessageCircle, User, LogOut, BarChart3, BookOpen, Users, GraduationCap, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationSystem from '../Shared/NotificationSystem';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Отслеживаем скролл для изменения стиля навигации
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleLogout = () => {
    // Добавляем анимацию перед выходом
    const nav = document.querySelector('nav');
    if (nav) {
      nav.style.transform = 'translateY(-100%)';
      nav.style.opacity = '0';
    }
    
    setTimeout(() => {
      logout();
    }, 300);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-200/30' 
        : 'bg-gradient-to-r from-white via-blue-50 to-purple-50 shadow-xl border-b border-gray-200/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0 flex items-center group">
              <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 transform group-hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25">
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>Na</span>
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                uchi
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-2">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-white/90 hover:shadow-lg hover:shadow-blue-500/10'
                    }`}
                    title={tab.description}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Icon className={`h-4 w-4 transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600 group-hover:scale-110'
                    }`} />
                    <span className="transition-all duration-300">{tab.label}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Profile and Actions */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25">
                  <span className="text-white text-lg font-bold">
                    {user?.nickname.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
              
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{user?.name}</div>
                <div className="text-xs text-gray-600 group-hover:text-blue-500 transition-colors duration-300">@{user?.nickname}</div>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium transition-all duration-300 ${
                    user?.role === 'teacher' 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200 hover:from-purple-200 hover:to-pink-200'
                      : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 hover:from-blue-200 hover:to-indigo-200'
                  }`}>
                    {user?.role === 'teacher' ? '👨‍🏫 Преподаватель' : '👨‍🎓 Ученик'}
                  </span>
                </div>
              </div>
            </div>

            {/* Система уведомлений */}
            <NotificationSystem />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 transform hover:scale-110 hover:rotate-12 group"
              title="Выйти из системы"
            >
              <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-500 ease-out overflow-hidden ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100 border-t border-gray-200/50 bg-white/95 backdrop-blur-xl' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="flex flex-col space-y-2 py-4">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/80'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className={`h-5 w-5 ${
                    isActive ? 'text-white' : 'text-gray-600'
                  }`} />
                  <span>{tab.label}</span>
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