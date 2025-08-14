import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, XCircle, Star } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  lessonId?: string;
  chatId?: string;
}

const NotificationSystem: React.FC = () => {
  const { user } = useAuth();
  const { lessons, chats } = useData();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Генерируем уведомления на основе данных
  useEffect(() => {
    if (!user) return;

    const newNotifications: Notification[] = [];

    // Уведомления о новых уроках
    const userLessons = lessons.filter(lesson => 
      lesson.studentId === user.id || lesson.teacherId === user.id
    );

    userLessons.forEach(lesson => {
      if (lesson.status === 'scheduled') {
        const lessonDate = new Date(`${lesson.date}T${lesson.startTime}`);
        const now = new Date();
        const timeUntilLesson = lessonDate.getTime() - now.getTime();
        const hoursUntilLesson = timeUntilLesson / (1000 * 60 * 60);

        // Напоминание за 1 час до урока
        if (hoursUntilLesson > 0 && hoursUntilLesson <= 1) {
          newNotifications.push({
            id: `lesson_reminder_${lesson.id}`,
            type: 'warning',
            title: 'Напоминание об уроке',
            message: `Урок "${lesson.subject}" начнется через ${Math.ceil(hoursUntilLesson)} минут`,
            timestamp: new Date(),
            isRead: false,
            lessonId: lesson.id
          });
        }
      }
    });

    // Уведомления о новых сообщениях в чатах
    const userChats = chats.filter(chat => 
      chat.participants.includes(user.id)
    );

    userChats.forEach(chat => {
      const unreadMessages = chat.messages.filter(msg => 
        !msg.isRead && msg.senderId !== user.id
      );

      if (unreadMessages.length > 0) {
        newNotifications.push({
          id: `new_message_${chat.id}`,
          type: 'info',
          title: 'Новое сообщение',
          message: `У вас ${unreadMessages.length} непрочитанных сообщений`,
          timestamp: new Date(),
          isRead: false,
          chatId: chat.id
        });
      }
    });

    // Уведомления о статусе соединения
    if (!useData().isConnected) {
      newNotifications.push({
        id: 'connection_lost',
        type: 'error',
        title: 'Соединение потеряно',
        message: 'Приложение работает в офлайн режиме. Некоторые функции могут быть недоступны.',
        timestamp: new Date(),
        isRead: false
      });
    }

    setNotifications(prev => {
      const existingIds = prev.map(n => n.id);
      const uniqueNewNotifications = newNotifications.filter(n => !existingIds.includes(n.id));
      return [...prev, ...uniqueNewNotifications];
    });
  }, [user, lessons, chats]);

  // Обновляем количество непрочитанных уведомлений
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    return timestamp.toLocaleDateString('ru-RU');
  };

  if (!user) return null;

  return (
    <>
      {/* Кнопка уведомлений */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-200"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Панель уведомлений */}
        {showNotifications && (
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-3xl shadow-2xl border border-gray-200 z-50 animate-scale-in">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Уведомления</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Прочитать все
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Нет уведомлений</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-2xl border mb-2 transition-all duration-200 hover:shadow-md ${
                        notification.isRead ? 'opacity-75' : ''
                      } ${getNotificationColor(notification.type)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                                title={notification.isRead ? 'Отметить как непрочитанное' : 'Отметить как прочитанное'}
                              >
                                <CheckCircle className={`h-3 w-3 ${notification.isRead ? 'text-green-500' : 'text-gray-400'}`} />
                              </button>
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                title="Удалить уведомление"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.timestamp)}
                            </span>
                            
                            {notification.lessonId && (
                              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                Перейти к уроку
                              </button>
                            )}
                            
                            {notification.chatId && (
                              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                Открыть чат
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50/50 rounded-b-3xl">
                <button
                  onClick={() => setNotifications([])}
                  className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium py-2 rounded-xl hover:bg-white transition-colors"
                >
                  Очистить все уведомления
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Автоматическое скрытие панели при клике вне её */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  );
};

export default NotificationSystem;






