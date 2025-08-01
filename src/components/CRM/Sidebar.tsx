import React from 'react';
import { LayoutDashboard, Users, Ticket, BarChart3, Settings, LogOut } from 'lucide-react';

type ViewType = 'dashboard' | 'users' | 'tickets' | 'analytics' | 'profile';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'tickets', label: 'Тикеты', icon: Ticket },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">EduCRM</h1>
        <p className="text-sm text-gray-600 mt-1">Система поддержки</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewType)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">А</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">Администратор</p>
            <p className="text-xs text-gray-600">admin@educrm.com</p>
          </div>
        </div>
        <button className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
          <LogOut className="w-4 h-4 mr-2" />
          <span className="text-sm">Выйти</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;