import React from 'react';
import { BarChart3, TrendingUp, Users, Ticket, Calendar, PieChart } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useTickets } from '../hooks/useTickets';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const Analytics: React.FC = () => {
  const { 
    users, 
    loading: usersLoading, 
    error: usersError,
    total: totalUsers
  } = useUsers({ limit: 1000 }); // Получаем все данные для аналитики

  const { 
    tickets, 
    loading: ticketsLoading, 
    error: ticketsError,
    total: totalTickets
  } = useTickets({ limit: 1000 }); // Получаем все данные для аналитики

  const loading = usersLoading || ticketsLoading;
  const error = usersError || ticketsError;

  // Подсчет статистики только когда данные загружены
  const totalTutors = users.filter(u => u.type === 'tutor').length;
  const totalStudents = users.filter(u => u.type === 'student').length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const urgentTickets = tickets.filter(t => t.priority === 'urgent').length;

  // Статистика по категориям тикетов
  const ticketCategories = tickets.reduce((acc, ticket) => {
    acc[ticket.category] = (acc[ticket.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Регистрации по месяцам (последние 6 месяцев)
  const getMonthlyRegistrations = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('ru-RU', { month: 'short' });
      const registrations = users.filter(user => {
        const regDate = new Date(user.registrationDate);
        return regDate.getMonth() === date.getMonth() && regDate.getFullYear() === date.getFullYear();
      }).length;
      
      months.push({ month: monthName, count: registrations });
    }
    
    return months;
  };

  const monthlyData = !loading && !error ? getMonthlyRegistrations() : [];
  const maxRegistrations = Math.max(...monthlyData.map(m => m.count));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Аналитика</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">За последние 30 дней</span>
        </div>
      </div>

      {/* Состояние загрузки */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Загрузка аналитики...</p>
        </div>
      )}

      {/* Состояние ошибки */}
      {error && !loading && (
        <ErrorMessage message={error} />
      )}

      {/* Основные метрики */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Общий коэффициент активности</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round((activeUsers / totalUsers) * 100)}%
              </p>
              <p className="text-sm text-green-600 mt-1">
                ↗ +2.5% за месяц
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Коэффициент решения тикетов</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round((resolvedTickets / totalTickets) * 100)}%
              </p>
              <p className="text-sm text-green-600 mt-1">
                ↗ +5.2% за месяц
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Соотношение репетиторы/ученики</p>
              <p className="text-3xl font-bold text-gray-900">
                1:{Math.round(totalStudents / totalTutors)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Оптимальное соотношение
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Среднее время ответа</p>
              <p className="text-3xl font-bold text-gray-900">2.4ч</p>
              <p className="text-sm text-green-600 mt-1">
                ↓ -15 мин за месяц
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* График регистраций */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Регистрации по месяцам</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 w-12">{data.month}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(data.count / maxRegistrations) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-8 text-right">{data.count}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Итого за период:</span> {monthlyData.reduce((sum, m) => sum + m.count, 0)} новых пользователей
            </p>
          </div>
        </div>

        {/* Категории тикетов */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Категории обращений</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {Object.entries(ticketCategories)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count], index) => {
                const percentage = Math.round((count / totalTickets) * 100);
                const colors = [
                  'bg-blue-600',
                  'bg-purple-600', 
                  'bg-green-600',
                  'bg-yellow-600',
                  'bg-red-600',
                  'bg-indigo-600'
                ];
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{percentage}%</span>
                      <span className="text-sm font-semibold text-gray-900">({count})</span>
                    </div>
                  </div>
                );
              })}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Всего категорий:</span>
              <span className="font-semibold text-gray-900">{Object.keys(ticketCategories).length}</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Детальная статистика */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Детальная статистика</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Пользователи</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Всего пользователей</span>
                <span className="font-medium text-gray-900">{totalUsers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Репетиторы</span>
                <span className="font-medium text-gray-900">{totalTutors}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ученики</span>
                <span className="font-medium text-gray-900">{totalStudents}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Активные</span>
                <span className="font-medium text-green-600">{activeUsers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Неактивные</span>
                <span className="font-medium text-gray-600">{users.filter(u => u.status === 'inactive').length}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Тикеты</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Всего тикетов</span>
                <span className="font-medium text-gray-900">{totalTickets}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Открытые</span>
                <span className="font-medium text-red-600">{openTickets}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">В работе</span>
                <span className="font-medium text-yellow-600">{tickets.filter(t => t.status === 'in-progress').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Решенные</span>
                <span className="font-medium text-green-600">{resolvedTickets}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Срочные</span>
                <span className="font-medium text-red-600">{urgentTickets}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Производительность</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Среднее время ответа</span>
                <span className="font-medium text-gray-900">2.4 часа</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Коэффициент решения</span>
                <span className="font-medium text-green-600">{Math.round((resolvedTickets / totalTickets) * 100)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Тикетов за день</span>
                <span className="font-medium text-gray-900">
                  {tickets.filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString()).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Активность пользователей</span>
                <span className="font-medium text-green-600">{Math.round((activeUsers / totalUsers) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Analytics;