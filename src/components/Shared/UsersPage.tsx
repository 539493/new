import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UsersList from './UsersList';

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
      <div className="max-w-7xl mx-auto px-4">
        <UsersList
          title="Все пользователи"
          showTeachers={true}
          showStudents={true}
        />
      </div>
    </div>
  );
};

export default UsersPage;
