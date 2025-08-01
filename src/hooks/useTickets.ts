import { useState, useEffect } from 'react';
import { TicketService, TicketFilters } from '../services/ticketService';
import type { Ticket } from '../App';

export interface UseTicketsResult {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  refetch: () => void;
  updateFilters: (filters: TicketFilters) => void;
}

export const useTickets = (initialFilters: TicketFilters = {}): UseTicketsResult => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<TicketFilters>(initialFilters);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await TicketService.getTickets(filters);
      
      if (response.success) {
        setTickets(response.data.data);
        setTotal(response.data.total);
        setCurrentPage(response.data.page);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.message || 'Ошибка при загрузке тикетов');
      }
    } catch (err) {
      setError('Ошибка при загрузке тикетов');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: TicketFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  return {
    tickets,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    refetch: fetchTickets,
    updateFilters,
  };
};