import React from 'react';
import { useData } from '../../contexts/DataContext';
import { User, Users } from 'lucide-react';

const UsersList: React.FC = () => {
  const { allUsers } = useData();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Все пользователи в системе ({allUsers.length})
        </h2>
      </div>
      
      <div className="space-y-3">
        {allUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Пользователи не найдены</p>
        ) : (
          allUsers.map((user: User) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  user.role === 'teacher' ? 'bg-blue-500' : 'bg-green-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">
                    {user.name || user.nickname || 'Без имени'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {user.role === 'teacher' ? 'Преподаватель' : 'Студент'} • {user.email}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  ID: {user.id.slice(0, 8)}...
                </p>
                {user.createdAt && (
                  <p className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Синхронизация в реальном времени:</strong> Когда новый пользователь регистрируется 
          на любом устройстве, он автоматически появится в этом списке на всех подключенных устройствах.
        </p>
      </div>
    </div>
  );
};

export default UsersList;
