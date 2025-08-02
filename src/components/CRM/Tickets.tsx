import React, { useState } from 'react';
import { Search, Filter, Plus, Clock, AlertTriangle, CheckCircle, User } from 'lucide-react';
import { useTickets } from '../hooks/useTickets';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface TicketsProps {
  onViewProfile: (userId: string) => void;
}

const Tickets: React.FC<TicketsProps> = ({ onViewProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved' | 'closed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');

  const { 
    tickets, 
    loading, 
    error, 
    total, 
    currentPage, 
    totalPages, 
    refetch, 
    updateFilters 
  } = useTickets({
    search: searchTerm,
    status: statusFilter,
    priority: priorityFilter,
    limit: 10
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateFilters({ search: value, page: 1 });
  };

  const handleStatusFilter = (status: 'all' | 'open' | 'in-progress' | 'resolved' | 'closed') => {
    setStatusFilter(status);
    updateFilters({ status, page: 1 });
  };

  const handlePriorityFilter = (priority: 'all' | 'low' | 'medium' | 'high' | 'urgent') => {
    setPriorityFilter(priority);
    updateFilters({ priority, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-red-100 text-red-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      open: 'Открыт',
      'in-progress': 'В работе',
      resolved: 'Решен',
      closed: 'Закрыт'
    };
    
    return {
      style: styles[status as keyof typeof styles],
      label: labels[status as keyof typeof labels]
    };
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    const labels = {
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий',
      urgent: 'Срочный'
    };
    
    return {
      style: styles[priority as keyof typeof styles],
      label: labels[priority as keyof typeof labels]
    };
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Тикеты поддержки</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Создать тикет
        </button>
      </div>

      {/* Поиск и фильтры */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск по теме, автору или описанию..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Все статусы</option>
            <option value="open">Открытые</option>
            <option value="in-progress">В работе</option>
            <option value="resolved">Решенные</option>
            <option value="closed">Закрытые</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => handlePriorityFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Все приоритеты</option>
            <option value="urgent">Срочный</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>
        </div>
      </div>

      {/* Состояние загрузки */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Загрузка тикетов...</p>
        </div>
      )}

      {/* Состояние ошибки */}
      {error && !loading && (
        <ErrorMessage message={error} onRetry={refetch} />
      )}

      {/* Список тикетов */}
      {!loading && !error && (
        <div className="space-y-4">
        {tickets.map((ticket) => {
          const statusBadge = getStatusBadge(ticket.status);
          const priorityBadge = getPriorityBadge(ticket.priority);
          
          return (
            <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(ticket.priority)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadge.style}`}>
                        {statusBadge.label}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityBadge.style}`}>
                        {priorityBadge.label}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <button
                          onClick={() => onViewProfile(ticket.userId)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {ticket.userName}
                        </button>
                        <span>({ticket.userType === 'tutor' ? 'Репетитор' : 'Ученик'})</span>
                      </div>
                      
                      <span>•</span>
                      <span>Категория: {ticket.category}</span>
                      
                      <span>•</span>
                      <span>Создан: {new Date(ticket.createdAt).toLocaleDateString('ru-RU')}</span>
                      
                      {ticket.assignedTo && (
                        <>
                          <span>•</span>
                          <span>Назначен: {ticket.assignedTo}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Открыть
                  </button>
                  {ticket.status === 'open' && (
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      Взять в работу
                    </button>
                  )}
                  {ticket.status === 'in-progress' && (
                    <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                      Решить
                    </button>
                  )}
                </div>
              </div>
              
              {/* Временная шкала для срочных тикетов */}
              {ticket.priority === 'urgent' && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center text-sm text-red-600">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    <span>Срочный тикет - требует немедленного внимания</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Тикеты не найдены</p>
        </div>
      )}

      {/* Статистика по тикетам */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего тикетов</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Открытые</p>
              <p className="text-2xl font-bold text-red-600">
                {tickets.filter(t => t.status === 'open').length}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">В работе</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tickets.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Решенные</p>
              <p className="text-2xl font-bold text-green-600">
                {tickets.filter(t => t.status === 'resolved').length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Tickets;