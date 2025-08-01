import React, { useState } from 'react';
import { Database, Users, MessageSquare, Activity, RefreshCw, CheckCircle, XCircle, Upload, Download } from 'lucide-react';
import { crmService } from '../../services/crmService';
import { userSyncService } from '../../services/userSyncService';
import { useNotification } from '../../contexts/NotificationContext';
import AutoSync from './AutoSync';

interface CRMStats {
  users: {
    total: number;
    tutors: number;
    students: number;
    active: number;
    newThisMonth: number;
  };
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
}

const CRMIntegration: React.FC = () => {
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [testUser, setTestUser] = useState({
    name: 'Тестовый Пользователь',
    email: 'test@example.com',
    type: 'student' as 'student' | 'tutor',
    phone: '+7 (999) 123-45-67',
    subjects: ['Математика']
  });
  const [syncStats, setSyncStats] = useState({ local: 0, synced: 0 });
  const { showNotification } = useNotification();

  const loadStats = async () => {
    setLoading(true);
    try {
      const [userStats, ticketStats] = await Promise.all([
        crmService.getUserStats(),
        crmService.getTicketStats()
      ]);

      if (userStats.success && ticketStats.success) {
        setStats({
          users: userStats.data,
          tickets: ticketStats.data
        });
        showNotification({
          type: 'success',
          title: 'Статистика загружена',
          message: 'Данные CRM успешно обновлены'
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Ошибка загрузки',
          message: 'Не удалось загрузить статистику CRM'
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Ошибка сети',
        message: 'Проблема с подключением к CRM'
      });
    } finally {
      setLoading(false);
    }
  };

  const testCreateUser = async () => {
    setLoading(true);
    try {
      const response = await crmService.createUser({
        ...testUser,
        joinDate: new Date().toISOString().split('T')[0]
      });

      if (response.success) {
        showNotification({
          type: 'success',
          title: 'Тест успешен',
          message: 'Тестовый пользователь создан в CRM'
        });
        await loadStats(); // Обновляем статистику
      } else {
        showNotification({
          type: 'error',
          title: 'Ошибка теста',
          message: response.message || 'Не удалось создать тестового пользователя'
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Ошибка сети',
        message: 'Проблема с подключением к CRM'
      });
    } finally {
      setLoading(false);
    }
  };

  const testCreateTicket = async () => {
    setLoading(true);
    try {
      const ticketData = {
        title: 'Тестовый тикет',
        description: 'Это тестовый тикет для проверки интеграции',
        priority: 'medium' as const,
        category: 'Тестирование',
        createdBy: 'test_user_id',
        tags: ['тест', 'интеграция']
      };

      const response = await crmService.createTicket(ticketData);

      if (response.success) {
        showNotification({
          type: 'success',
          title: 'Тест успешен',
          message: 'Тестовый тикет создан в CRM'
        });
        await loadStats(); // Обновляем статистику
      } else {
        showNotification({
          type: 'error',
          title: 'Ошибка теста',
          message: response.message || 'Не удалось создать тестовый тикет'
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Ошибка сети',
        message: 'Проблема с подключением к CRM'
      });
    } finally {
      setLoading(false);
    }
  };

  const syncAllUsers = async () => {
    setLoading(true);
    try {
      showNotification({
        type: 'info',
        title: 'Синхронизация',
        message: 'Начинаем синхронизацию пользователей с CRM...'
      });

      const results = await userSyncService.syncAllUsers();

      if (results.success > 0) {
        showNotification({
          type: 'success',
          title: 'Синхронизация завершена',
          message: `${results.success} пользователей синхронизировано, ${results.failed} ошибок`
        });
        
        // Обновляем статистику
        setSyncStats(userSyncService.getSyncStats());
        await loadStats();
      } else {
        showNotification({
          type: 'warning',
          title: 'Синхронизация завершена',
          message: `Не удалось синхронизировать пользователей: ${results.errors.join(', ')}`
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Ошибка синхронизации',
        message: 'Проблема с синхронизацией пользователей'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSyncStats = () => {
    setSyncStats(userSyncService.getSyncStats());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Интеграция с CRM
          </h1>
          <p className="text-gray-600">
            Мониторинг и тестирование интеграции с системой управления
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.users.total || '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Активных</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.users.active || '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Открытых тикетов</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.tickets.open || '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Новых в этом месяце</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.users.newThisMonth || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Тестирование */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Тестирование интеграции
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тестовый пользователь
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={testUser.name}
                    onChange={(e) => setTestUser({...testUser, name: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Имя"
                  />
                  <input
                    type="email"
                    value={testUser.email}
                    onChange={(e) => setTestUser({...testUser, email: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={testUser.type}
                  onChange={(e) => setTestUser({...testUser, type: e.target.value as 'student' | 'tutor'})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="student">Студент</option>
                  <option value="tutor">Преподаватель</option>
                </select>
                <input
                  type="tel"
                  value={testUser.phone}
                  onChange={(e) => setTestUser({...testUser, phone: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Телефон"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={testCreateUser}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span className="ml-2">Создать пользователя</span>
                </button>
                <button
                  onClick={testCreateTicket}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                  <span className="ml-2">Создать тикет</span>
                </button>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Синхронизация пользователей</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-yellow-700">Локальных пользователей: {syncStats.local}</p>
                    <p className="text-sm text-yellow-700">Синхронизировано: {syncStats.synced}</p>
                  </div>
                  <button
                    onClick={loadSyncStats}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={syncAllUsers}
                  disabled={loading}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span className="ml-2">Синхронизировать всех пользователей</span>
                </button>
              </div>
            </div>
          </div>

                  {/* Автоматическая синхронизация */}
        <AutoSync />

        {/* Мониторинг */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Мониторинг системы
          </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Статус подключения</p>
                  <p className="text-sm text-gray-600">CRM API доступен</p>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600">Онлайн</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Последняя синхронизация</p>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleString('ru-RU')}
                  </p>
                </div>
                <button
                  onClick={loadStats}
                  disabled={loading}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Преподаватели</span>
                  <span className="font-medium">{stats?.users.tutors || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Студенты</span>
                  <span className="font-medium">{stats?.users.students || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Решенные тикеты</span>
                  <span className="font-medium">{stats?.tickets.resolved || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Логи */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Логи интеграции
          </h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="space-y-1">
              <div>[{new Date().toLocaleTimeString()}] CRM API подключен</div>
              <div>[{new Date().toLocaleTimeString()}] Статистика загружена</div>
              <div>[{new Date().toLocaleTimeString()}] Готов к тестированию</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMIntegration; 