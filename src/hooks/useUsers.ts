import { useState, useEffect } from 'react';
import { UserService, UserFilters } from '../services/userService';
import type { User } from '../App';

export interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  refetch: () => void;
  updateFilters: (filters: UserFilters) => void;
}

export const useUsers = (initialFilters: UserFilters = {}): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<UserFilters>(initialFilters);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await UserService.getUsers(filters);
      
      if (response.success) {
        setUsers(response.data.data);
        setTotal(response.data.total);
        setCurrentPage(response.data.page);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.message || 'Ошибка при загрузке пользователей');
      }
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: UserFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  return {
    users,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    refetch: fetchUsers,
    updateFilters,
  };
};