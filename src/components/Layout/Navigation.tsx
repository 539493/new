import React from 'react';
import { Home, Calendar, MessageCircle, User, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const studentTabs = [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'lessons', label: 'Мои уроки', icon: Calendar },
    { id: 'chats', label: 'Чаты', icon: MessageCircle },
    { id: 'profile', label: 'Профиль', icon: User },
  ];

  const teacherTabs = [
    { id: 'slots', label: 'Слоты', icon: Calendar },
    { id: 'calendar', label: 'Календарь', icon: BarChart3 },
    { id: 'students', label: 'Ученики', icon: User },
    { id: 'chats', label: 'Чаты', icon: MessageCircle },
    { id: 'profile', label: 'Профиль', icon: User },
  ];

  const tabs = user?.role === 'teacher' ? teacherTabs : studentTabs;

  return (
    <nav className="bg-card-light dark:bg-card-dark shadow-lg border-b border-border-light dark:border-border-dark transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: '#175b8c' }}>
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'Inter, sans-serif', fontSize: 28 }}>Na</span>
              </div>
              <span className="ml-3 text-2xl font-bold" style={{ color: '#175b8c', fontFamily: 'Inter, sans-serif' }}>uchi</span>
            </div>

            <div className="hidden md:flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-base font-semibold transition-all duration-200 shadow-none ${
                      activeTab === tab.id
                        ? 'bg-primary-light/10 text-primary-light dark:bg-primary-dark/20 dark:text-primary-dark shadow-md'
                        : 'text-textSecondary-light dark:text-textSecondary-dark hover:bg-border-light dark:hover:bg-border-dark hover:text-primary-light dark:hover:text-primary-dark'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.nickname.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-700">{user?.name}</div>
                <div className="text-xs text-gray-500">@{user?.nickname}</div>
              </div>
              <span className="hidden md:block text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {user?.role === 'teacher' ? 'Преподаватель' : 'Ученик'}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              title="Выйти"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden border-t border-border-light dark:border-border-dark">
          <div className="flex space-x-1 py-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-light/10 text-primary-light dark:bg-primary-dark/20 dark:text-primary-dark shadow-md'
                      : 'text-textSecondary-light dark:text-textSecondary-dark hover:bg-border-light dark:hover:bg-border-dark hover:text-primary-light dark:hover:text-primary-dark'
                  }`}
                >
                  <Icon className="h-5 w-5" />
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