import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  Heart, 
  MessageCircle, 
  FileText, 
  Users, 
  Calendar,
  Settings,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Notification } from '../../types';

interface NotificationSystemProps {
  className?: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ className = '' }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useData();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Фильтрация уведомлений
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const displayedNotifications = showAll ? filteredNotifications : filteredNotifications.slice(0, 5);

  // Получение иконки для типа уведомления
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_post':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'reaction':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'follow':
        return <Users className="w-5 h-5 text-purple-500" />;
      case 'lesson_reminder':
        return <Calendar className="w-5 h-5 text-orange-500" />;
      case 'system':
        return <Settings className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Форматирование времени
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'только что';
    if (diffInMinutes < 60) return `${diffInMinutes}м назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}ч назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const handleMarkAllAsRead = () => {
    if (user) {
      markAllNotificationsAsRead(user.id);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }
    
    // Здесь можно добавить навигацию к соответствующему контенту
    if (notification.data?.postId) {
      // Навигация к посту
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Кнопка уведомлений */}
        <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
        <Bell className="w-6 h-6 text-gray-600" />
          {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden">
          {/* Заголовок */}
          <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Уведомления</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                    onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                    Отметить все как прочитанные
                    </button>
                  )}
                  <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                  <X className="w-4 h-4 text-gray-500" />
                  </button>
              </div>
            </div>

            {/* Фильтры */}
            <div className="flex items-center space-x-2 mt-3">
              {[
                { key: 'all', label: 'Все', count: notifications.length },
                { key: 'unread', label: 'Непрочитанные', count: unreadCount },
                { key: 'read', label: 'Прочитанные', count: notifications.length - unreadCount }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Список уведомлений */}
          <div className="overflow-y-auto max-h-[400px]">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {filter === 'all' && 'Нет уведомлений'}
                  {filter === 'unread' && 'Нет непрочитанных уведомлений'}
                  {filter === 'read' && 'Нет прочитанных уведомлений'}
                </p>
                </div>
              ) : (
              <div className="divide-y divide-gray-100">
                {displayedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                      {/* Иконка */}
                      <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                      {/* Контент */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          
                          {/* Индикатор непрочитанного */}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>

                      {/* Действия */}
                      <div className="flex-shrink-0 flex items-center space-x-1">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationAsRead(notification.id);
                            }}
                            className="p-1 rounded-full hover:bg-green-100 transition-colors"
                            title="Отметить как прочитанное"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 rounded-full hover:bg-red-100 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          {/* Показать больше/меньше */}
          {filteredNotifications.length > 5 && (
            <div className="p-4 border-t border-gray-100">
                <button
                onClick={() => setShowAll(!showAll)}
                className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>Показать меньше</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>Показать все ({filteredNotifications.length})</span>
                  </>
                )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
  );
};

export default NotificationSystem;
















