import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UsersList from './UsersList';
import UserManagement from './UserManagement';

const UsersPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Требуется авторизация</h2>
          <p className="text-gray-600">Войдите в систему, чтобы просматривать пользователей</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Список пользователей */}
        <UsersList
          title="Все пользователи"
          showTeachers={true}
          showStudents={true}
        />
        
        {/* Управление пользователями (только для администраторов или преподавателей) */}
        {(user.role === 'teacher' || user.role === 'admin') && (
          <UserManagement
            title="Управление пользователями"
            showTeachers={true}
            showStudents={true}
          />
        )}
      </div>
    </div>
  );
};

export default UsersPage;
