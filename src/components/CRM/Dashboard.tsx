import React from 'react';
import { Users, Ticket, TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useTickets } from '../hooks/useTickets';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface DashboardProps {
  onViewProfile: (userId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewProfile }) => {
  const { 
    users, 
    loading: usersLoading, 
    error: usersError,
    total: totalUsers
  } = useUsers({ limit: 5 });

  const { 
    tickets, 
    loading: ticketsLoading, 
    error: ticketsError,
    total: totalTickets
  } = useTickets({ limit: 5 });

  const loading = usersLoading || ticketsLoading;
  const error = usersError || ticketsError;

  // Вычисляем статистику только когда данные загружены
  const totalTutors = users.filter(u => u.type === 'tutor').length;
  const totalStudents = users.filter(u => u.type === 'student').length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const urgentTickets = tickets.filter(t => t.priority === 'urgent').length;
  const resolvedToday = tickets.filter(t => 
    t.status === 'resolved' && 
    new Date(t.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  const recentTickets = tickets
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentUsers = users
    .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-red-100 text-red-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return styles[status as keyof typeof styles] || styles.open;
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return styles[priority as keyof typeof styles] || styles.low;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Дашборд</h1>
        <div className="text-sm text-gray-600">
          Последнее обновление: {new Date().toLocaleString('ru-RU')}
        </div>
      </div>

      {/* Состояние загрузки */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Загрузка данных...</p>
        </div>
      )}

      {/* Состояние ошибки */}
      {error && !loading && (
        <ErrorMessage message={error} />
      )}

      {/* Статистические карточки */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
              <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
              <p className="text-sm text-green-600 mt-1">
                ↗ {activeUsers} активных
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Открытые тикеты</p>
              <p className="text-3xl font-bold text-gray-900">{openTickets}</p>
              <p className="text-sm text-red-600 mt-1">
                {urgentTickets} срочных
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Репетиторы</p>
              <p className="text-3xl font-bold text-gray-900">{totalTutors}</p>
              <p className="text-sm text-gray-600 mt-1">
                {Math.round((totalTutors / totalUsers) * 100)}% от общего числа
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Решено сегодня</p>
              <p className="text-3xl font-bold text-gray-900">{resolvedToday}</p>
              <p className="text-sm text-green-600 mt-1">
                Среднее время: 2.4ч
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Последние тикеты */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Последние тикеты</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{ticket.subject}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{ticket.userName} • {ticket.category}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Новые пользователи */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Новые пользователи</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => onViewProfile(user.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.type === 'tutor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.type === 'tutor' ? 'Репетитор' : 'Ученик'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(user.registrationDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Dashboard;