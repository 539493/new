import React, { useState } from 'react';
import { Plus, Calendar, Clock, Edit, Trash2, Save, X, User } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { TimeSlot } from '../../types';
import TeacherCalendar from './TeacherCalendar';

const TeacherHome: React.FC = () => {
  const { timeSlots, lessons, createTimeSlot } = useData();
  const { user } = useAuth();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    duration: 60,
    subject: '',
    lessonType: 'regular' as 'regular' | 'trial',
    format: 'online' as 'online' | 'offline' | 'mini-group',
    price: 1500,
    experience: 'experienced' as 'beginner' | 'experienced' | 'professional',
    goals: [] as string[],
    grades: [] as string[],
  });

  const teacherSlots = timeSlots.filter(slot => slot.teacherId === user?.id);
  const bookedSlots = teacherSlots.filter(slot => slot.isBooked);
  const availableSlots = teacherSlots.filter(slot => !slot.isBooked);

  const subjects = ['Математика', 'Русский язык', 'Английский язык'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'Студент', 'Взрослый'];
  const goals = ['подготовка к экзаменам', 'помощь с домашним заданием', 'углубленное изучение', 'разговорная практика'];
  const experiences = ['beginner', 'experienced', 'professional'];

  const handleCreateSlot = () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.subject) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const endTime = new Date(`2000-01-01T${newSlot.startTime}`);
    endTime.setMinutes(endTime.getMinutes() + newSlot.duration);
    
    const slot: Omit<TimeSlot, 'id'> = {
      teacherId: user?.id || '',
      teacherName: user?.name || '',
      teacherAvatar: user?.profile?.avatar,
      date: newSlot.date,
      startTime: newSlot.startTime,
      endTime: endTime.toTimeString().slice(0, 5),
      duration: newSlot.duration,
      subject: newSlot.subject,
      lessonType: newSlot.lessonType,
      format: newSlot.format,
      price: newSlot.price,
      isBooked: false,
      experience: newSlot.experience,
      goals: newSlot.goals,
      grades: newSlot.grades,
      rating: 4.8, // Mock rating
    };

    createTimeSlot(slot);
    
    console.log('TeacherHome: Slot created successfully');
    console.log('TeacherHome: New slot data:', slot);
    
    setShowCreateModal(false);
    setNewSlot({
      date: '',
      startTime: '',
      duration: 60,
      subject: '',
      lessonType: 'regular',
      format: 'online',
      price: 1500,
      experience: 'experienced',
      goals: [],
      grades: [],
    });
  };

  const getExperienceLabel = (exp: string) => {
    switch (exp) {
      case 'beginner': return 'Начинающий';
      case 'experienced': return 'Опытный';
      case 'professional': return 'Профессионал';
      default: return exp;
    }
  };

  const getStatusLabel = (slot: TimeSlot) => {
    if (slot.isBooked) return 'Забронирован';
    return 'Доступен';
  };

  const getStatusColor = (slot: TimeSlot) => {
    if (slot.isBooked) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TeacherCalendar />
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Мое расписание</h1>
            <p className="text-gray-600">Управляйте вашими временными слотами для уроков</p>
            <p className="text-sm text-gray-500 mt-1">
              Создавайте временные слоты, которые ученики смогут бронировать
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Добавить слот</span>
          </button>
        </div>
      </div>

      {/* Info Message */}
      {teacherSlots.length === 0 && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Добро пожаловать в систему управления расписанием!
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Создайте ваши первые временные слоты, чтобы ученики могли их бронировать. 
                  Каждый слот представляет доступное время для проведения урока.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Overview */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-gradient p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teacherSlots.length}</p>
              <p className="text-gray-600">Всего слотов</p>
            </div>
          </div>
        </div>

        <div className="card-gradient p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-full">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{bookedSlots.length}</p>
              <p className="text-gray-600">Забронировано</p>
            </div>
          </div>
        </div>

        <div className="card-gradient p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{availableSlots.length}</p>
              <p className="text-gray-600">Доступно</p>
            </div>
          </div>
        </div>

      </div>

      {/* Time Slots */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Мои временные слоты</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherSlots.map((slot) => (
            <div key={slot.id} className="card-gradient hover:shadow-lg transition-shadow duration-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{slot.subject}</h3>
                    <p className="text-gray-600 text-sm">
                      {slot.lessonType === 'trial' ? 'Пробный урок' : 'Обычный урок'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(slot)}`}>
                    {getStatusLabel(slot)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{slot.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{slot.startTime} - {slot.endTime}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Формат: {slot.format === 'online' ? 'Онлайн' : slot.format === 'offline' ? 'Оффлайн' : 'Мини-группа'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Опыт: {getExperienceLabel(slot.experience)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-gray-900">{slot.price}₽</span>
                    <span className="text-sm text-gray-600">/{slot.duration} мин</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {slot.goals.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {slot.goals.map((goal, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {teacherSlots.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет созданных слотов</h3>
            <p className="text-gray-600 mb-4">Создайте первый временной слот для ваших уроков</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Создать первый слот</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Slot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Создать временной слот</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Дата</label>
                    <input
                      type="date"
                      value={newSlot.date}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Время начала</label>
                    <input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Предмет</label>
                    <select
                      value={newSlot.subject}
                      onChange={(e) => setNewSlot({ ...newSlot, subject: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Выберите предмет</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Продолжительность</label>
                    <select
                      value={newSlot.duration}
                      onChange={(e) => setNewSlot({ ...newSlot, duration: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={45}>45 минут</option>
                      <option value={60}>60 минут</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Тип урока</label>
                    <select
                      value={newSlot.lessonType}
                      onChange={(e) => setNewSlot({ ...newSlot, lessonType: e.target.value as 'regular' | 'trial' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="regular">Обычный</option>
                      <option value="trial">Пробный</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Формат</label>
                    <select
                      value={newSlot.format}
                      onChange={(e) => setNewSlot({ ...newSlot, format: e.target.value as 'online' | 'offline' | 'mini-group' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="online">Онлайн</option>
                      <option value="offline">Оффлайн</option>
                      <option value="mini-group">Мини-группа</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Цена (₽)</label>
                    <input
                      type="number"
                      value={newSlot.price}
                      onChange={(e) => setNewSlot({ ...newSlot, price: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Цели занятий</label>
                  <div className="grid grid-cols-2 gap-2">
                    {goals.map(goal => (
                      <label key={goal} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newSlot.goals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewSlot({ ...newSlot, goals: [...newSlot.goals, goal] });
                            } else {
                              setNewSlot({ ...newSlot, goals: newSlot.goals.filter(g => g !== goal) });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Классы</label>
                  <div className="grid grid-cols-4 gap-2">
                    {grades.map(grade => (
                      <label key={grade} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newSlot.grades.includes(grade)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewSlot({ ...newSlot, grades: [...newSlot.grades, grade] });
                            } else {
                              setNewSlot({ ...newSlot, grades: newSlot.grades.filter(g => g !== grade) });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{grade}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleCreateSlot}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>Создать слот</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherHome;