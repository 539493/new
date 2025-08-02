import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Star, BookOpen, MessageSquare, Edit, Ban, CheckCircle } from 'lucide-react';
import { UserService } from '../services/userService';
import { TicketService } from '../services/ticketService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import type { User } from '../App';

interface UserProfileProps {
  userId: string | null;
  onBack: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'activity'>('overview');
  const [user, setUser] = useState<User | null>(null);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const [userResponse, ticketsResponse] = await Promise.all([
          UserService.getUserById(userId),
          TicketService.getUserTickets(userId)
        ]);
        
        if (userResponse.success) {
          setUser(userResponse.data);
        } else {
          setError(userResponse.message || 'Ошибка при загрузке пользователя');
        }
        
        if (ticketsResponse.success) {
          setUserTickets(ticketsResponse.data);
        }
      } catch (err) {
        setError('Ошибка при загрузке данных пользователя');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к пользователям
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Загрузка профиля пользователя...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к пользователям
        </button>
        <ErrorMessage 
          message={error || 'Пользователь не найден'} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    const labels = {
      active: 'Активен',
      inactive: 'Неактивен',
      suspended: 'Заблокирован'
    };
    
    return {
      style: styles[status as keyof typeof styles],
      label: labels[status as keyof typeof labels]
    };
  };

  const statusBadge = getStatusBadge(user.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к пользователям
        </button>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Edit className="w-4 h-4 mr-2" />
            Редактировать
          </button>
          {user.status !== 'suspended' ? (
            <button className="flex items-center px-4 py-2 text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
              <Ban className="w-4 h-4 mr-2" />
              Заблокировать
            </button>
          ) : (
            <button className="flex items-center px-4 py-2 text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">
              <CheckCircle className="w-4 h-4 mr-2" />
              Разблокировать
            </button>
          )}
        </div>
      </div>

      {/* Профиль пользователя */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-blue-100 text-lg">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  user.type === 'tutor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.type === 'tutor' ? 'Репетитор' : 'Ученик'}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusBadge.style}`}>
                  {statusBadge.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Контактная информация */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">Email</p>
              </div>
            </div>
            
            {user.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                  <p className="text-xs text-gray-500">Телефон</p>
                </div>
              </div>
            )}
            
            {user.location && (
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.location}</p>
                  <p className="text-xs text-gray-500">Местоположение</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Статистика */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor((Date.now() - new Date(user.registrationDate).getTime()) / (1000 * 60 * 60 * 24))}
              </p>
              <p className="text-sm text-gray-500">дней с регистрации</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.completedLessons}</p>
              <p className="text-sm text-gray-500">завершенных уроков</p>
            </div>
            
            {user.rating && (
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{user.rating}</p>
                <p className="text-sm text-gray-500">рейтинг</p>
              </div>
            )}
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userTickets.length}</p>
              <p className="text-sm text-gray-500">обращений</p>
            </div>
          </div>
        </div>
      </div>

      {/* Табы */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Обзор
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tickets'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Тикеты ({userTickets.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Активность
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {user.subjects && user.subjects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Предметы</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Последняя активность</h3>
                <p className="text-gray-600">
                  Последний вход: {new Date(user.lastActivity).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-4">
              {userTickets.length > 0 ? (
                userTickets.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                          ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{ticket.description}</p>
                    <div className="text-xs text-gray-500">
                      Создан: {new Date(ticket.createdAt).toLocaleDateString('ru-RU')} •
                      Категория: {ticket.category}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">У пользователя нет тикетов</p>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Последний вход</span>
                  <span className="text-sm text-gray-500">
                    {new Date(user.lastActivity).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Регистрация</span>
                  <span className="text-sm text-gray-500">
                    {new Date(user.registrationDate).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;