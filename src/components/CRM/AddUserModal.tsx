import React, { useState } from 'react';
import { X, User, Mail, Phone, BookOpen, Calendar } from 'lucide-react';
import { crmService } from '../../services/crmService';
import { useNotification } from '../../contexts/NotificationContext';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  type: 'student' | 'tutor';
  phone: string;
  subjects: string[];
  joinDate: string;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    type: 'student',
    phone: '',
    subjects: [],
    joinDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const { showNotification } = useNotification();

  const availableSubjects = [
    'Математика', 'Физика', 'Химия', 'Биология', 'История', 'Литература',
    'Русский язык', 'Английский язык', 'Информатика', 'География',
    'Обществознание', 'Экономика', 'Право', 'Философия', 'Психология'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      showNotification({
        type: 'error',
        title: 'Ошибка валидации',
        message: 'Пожалуйста, заполните все обязательные поля'
      });
      return;
    }

    setLoading(true);
    try {
      const userData = {
        ...formData,
        status: 'active' as const,
        rating: 0,
        totalStudents: 0
      };

      const response = await crmService.createUser(userData);

      if (response.success) {
        showNotification({
          type: 'success',
          title: 'Пользователь создан',
          message: 'Новый пользователь успешно добавлен в CRM систему'
        });
        
        // Создаем приветственный тикет
        const ticketData = {
          title: `Добро пожаловать, ${formData.name}!`,
          description: `Новый пользователь ${formData.type === 'tutor' ? 'преподавателя' : 'ученика'} зарегистрировался на платформе. Необходимо проверить профиль и при необходимости связаться для уточнения деталей.`,
          status: 'open' as const,
          priority: 'medium' as const,
          category: 'Новые пользователи',
          createdBy: 'crm_system',
          tags: ['регистрация', 'новый пользователь', formData.type === 'tutor' ? 'преподавателя' : 'ученика']
        };

        await crmService.createTicket(ticketData);

        // Сбрасываем форму
        setFormData({
          name: '',
          email: '',
          type: 'student',
          phone: '',
          subjects: [],
          joinDate: new Date().toISOString().split('T')[0]
        });
        
        onUserAdded();
        onClose();
      } else {
        showNotification({
          type: 'error',
          title: 'Ошибка создания',
          message: response.message || 'Не удалось создать пользователя'
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Ошибка сети',
        message: 'Проблема с подключением к CRM системе'
      });
    } finally {
      setLoading(false);
    }
  };

  const addSubject = () => {
    if (newSubject && !formData.subjects.includes(newSubject)) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, newSubject]
      });
      setNewSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(s => s !== subject)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Добавить пользователя</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Имя *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите полное имя"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Телефон *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+7 (999) 123-45-67"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-2" />
                Тип пользователя
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as 'student' | 'tutor'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="student">Ученик</option>
                <option value="tutor">Преподаватель</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Дата регистрации
              </label>
              <input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Предметы */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Предметы
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Добавить предмет"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
              />
              <button
                type="button"
                onClick={addSubject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Добавить
              </button>
            </div>
            
            {/* Быстрые предметы */}
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Популярные предметы:</p>
              <div className="flex flex-wrap gap-2">
                {availableSubjects.slice(0, 8).map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => {
                      if (!formData.subjects.includes(subject)) {
                        setFormData({
                          ...formData,
                          subjects: [...formData.subjects, subject]
                        });
                      }
                    }}
                    disabled={formData.subjects.includes(subject)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      formData.subjects.includes(subject)
                        ? 'bg-gray-100 text-gray-400 border-gray-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Выбранные предметы */}
            {formData.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-2"
                  >
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Создать пользователя'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal; 