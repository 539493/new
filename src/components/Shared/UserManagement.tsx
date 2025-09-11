import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, Trash2, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface UserManagementProps {
  showTeachers?: boolean;
  showStudents?: boolean;
  title?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  showTeachers = true, 
  showStudents = true, 
  title = "Управление пользователями" 
}) => {
  const { allUsers, deleteUser } = useData();
  const { user: currentUser } = useAuth();
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Фильтруем пользователей по ролям
  const filteredUsers = allUsers.filter(user => {
    if (user.id === currentUser?.id) return false; // Не показываем текущего пользователя
    if (showTeachers && user.role === 'teacher') return true;
    if (showStudents && user.role === 'student') return true;
    return false;
  });

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      const success = await deleteUser(userId);
      if (success) {
        console.log('✅ Пользователь успешно удален');
      } else {
        console.error('❌ Ошибка удаления пользователя');
        alert('Ошибка удаления пользователя');
      }
    } catch (error) {
      console.error('❌ Ошибка удаления пользователя:', error);
      alert('Ошибка удаления пользователя');
    } finally {
      setDeletingUserId(null);
      setShowDeleteConfirm(null);
    }
  };

  const confirmDelete = (userId: string, userName: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить пользователя "${userName}"?\n\nЭто действие удалит:\n- Профиль пользователя\n- Все слоты времени\n- Все уроки\n- Все чаты\n- Все посты\n- Все уведомления\n\nЭто действие нельзя отменить!`)) {
      handleDeleteUser(userId);
    }
  };

  if (filteredUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <User className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-500">Пользователи не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{title}</h2>
      
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">
                  {user.role === 'teacher' ? 'Преподаватель' : 'Ученик'}
                  {user.email && ` • ${user.email}`}
                </p>
                {user.profile?.nickname && (
                  <p className="text-xs text-gray-400">@{user.profile.nickname}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {deletingUserId === user.id ? (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Удаление...</span>
                </div>
              ) : (
                <button
                  onClick={() => confirmDelete(user.id, user.name)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Удалить пользователя"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Внимание!</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Удаление пользователя приведет к полному удалению всех связанных данных: 
              профиля, слотов времени, уроков, чатов, постов и уведомлений. 
              Это действие нельзя отменить.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

