import React, { useEffect, useState } from 'react';
import { Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { userSyncService } from '../../services/userSyncService';
import { useNotification } from '../../contexts/NotificationContext';

const AutoSync: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCompleted, setSyncCompleted] = useState(false);
  const [syncStats, setSyncStats] = useState({ local: 0, synced: 0 });
  const { showNotification } = useNotification();

  useEffect(() => {
    // Загружаем статистику при монтировании компонента
    loadSyncStats();
    
    // Проверяем, нужно ли выполнить автоматическую синхронизацию
    const shouldAutoSync = localStorage.getItem('crm_auto_sync_needed') === 'true';
    
    if (shouldAutoSync && !syncCompleted) {
      performAutoSync();
    }
  }, []);

  const loadSyncStats = () => {
    setSyncStats(userSyncService.getSyncStats());
  };

  const performAutoSync = async () => {
    setIsSyncing(true);
    
    try {
      showNotification({
        type: 'info',
        title: 'Автоматическая синхронизация',
        message: 'Синхронизируем пользователей с CRM...'
      });

      const results = await userSyncService.syncAllUsers();

      if (results.success > 0) {
        showNotification({
          type: 'success',
          title: 'Синхронизация завершена',
          message: `${results.success} пользователей синхронизировано с CRM`
        });
        
        setSyncCompleted(true);
        localStorage.setItem('crm_auto_sync_needed', 'false');
      } else {
        showNotification({
          type: 'warning',
          title: 'Синхронизация не выполнена',
          message: 'Не удалось синхронизировать пользователей'
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Ошибка синхронизации',
        message: 'Проблема с автоматической синхронизацией'
      });
    } finally {
      setIsSyncing(false);
      loadSyncStats();
    }
  };

  const manualSync = async () => {
    setIsSyncing(true);
    
    try {
      showNotification({
        type: 'info',
        title: 'Ручная синхронизация',
        message: 'Синхронизируем пользователей с CRM...'
      });

      const results = await userSyncService.syncAllUsers();

      if (results.success > 0) {
        showNotification({
          type: 'success',
          title: 'Синхронизация завершена',
          message: `${results.success} пользователей синхронизировано, ${results.failed} ошибок`
        });
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
      setIsSyncing(false);
      loadSyncStats();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Синхронизация с CRM</h2>
        <button
          onClick={loadSyncStats}
          className="text-gray-400 hover:text-gray-600"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Статистика */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Локальных пользователей</p>
                <p className="text-2xl font-bold text-blue-900">{syncStats.local}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Upload className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Синхронизировано</p>
                <p className="text-2xl font-bold text-green-900">{syncStats.synced}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Статус синхронизации */}
        <div className="flex items-center space-x-2">
          {syncCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
          <span className="text-sm text-gray-600">
            {syncCompleted 
              ? 'Автоматическая синхронизация выполнена'
              : 'Требуется синхронизация пользователей'
            }
          </span>
        </div>

        {/* Кнопки действий */}
        <div className="flex space-x-3">
          <button
            onClick={manualSync}
            disabled={isSyncing}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span className="ml-2">
              {isSyncing ? 'Синхронизация...' : 'Синхронизировать вручную'}
            </span>
          </button>

          <button
            onClick={() => {
              localStorage.setItem('crm_auto_sync_needed', 'true');
              setSyncCompleted(false);
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors duration-200"
          >
            Сбросить статус
          </button>
        </div>

        {/* Информация */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Информация о синхронизации</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Автоматическая синхронизация выполняется при первом запуске</li>
            <li>• Все существующие пользователи отправляются в CRM</li>
            <li>• Новые пользователи синхронизируются автоматически</li>
            <li>• Статус синхронизации сохраняется в localStorage</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AutoSync; 