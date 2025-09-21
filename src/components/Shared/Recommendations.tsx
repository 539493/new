import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, Clock, Star, Users, BookOpen, Target, ArrowRight, Heart, Calendar, MapPin, Zap, Award, CheckCircle, XCircle } from 'lucide-react';
import { TimeSlot, User, Lesson } from '../../types';

interface RecommendationsProps {
  userId: string;
  userRole: 'student' | 'teacher';
  timeSlots: TimeSlot[];
  lessons: Lesson[];
  allUsers: User[];
}

interface Recommendation {
  id: string;
  type: 'lesson' | 'teacher' | 'subject' | 'schedule' | 'goal';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  actionText: string;
  onAction?: () => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({
  userId,
  userRole,
  timeSlots,
  lessons,
  allUsers
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    generateRecommendations();
  }, [userId, userRole, timeSlots, lessons, allUsers]);

  const generateRecommendations = () => {
    const newRecommendations: Recommendation[] = [];

    if (userRole === 'student') {
      // Рекомендации для студентов
      
      // Рекомендации по предметам
      const completedLessons = lessons.filter(l => l.studentId === userId && l.status === 'completed');
      const subjectStats = completedLessons.reduce((acc, lesson) => {
        acc[lesson.subject] = (acc[lesson.subject] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Найти предметы с наименьшим количеством уроков
      const subjects = Object.keys(subjectStats);
      if (subjects.length > 0) {
        const leastStudiedSubject = subjects.reduce((a, b) => 
          subjectStats[a] < subjectStats[b] ? a : b
        );
        
        newRecommendations.push({
          id: 'subject-1',
          type: 'subject',
          title: 'Улучшите знания по предмету',
          description: `У вас меньше всего уроков по предмету "${leastStudiedSubject}". Рекомендуем уделить ему больше внимания.`,
          priority: 'high',
          icon: <BookOpen className="h-5 w-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          actionText: 'Найти преподавателя'
        });
      }

      // Рекомендации по расписанию
      const upcomingLessons = lessons.filter(l => 
        l.studentId === userId && 
        l.status === 'scheduled' && 
        new Date(l.date) > new Date()
      );

      if (upcomingLessons.length === 0) {
        newRecommendations.push({
          id: 'schedule-1',
          type: 'schedule',
          title: 'Запланируйте следующие уроки',
          description: 'У вас нет запланированных уроков. Регулярные занятия помогут быстрее достичь целей.',
          priority: 'high',
          icon: <Calendar className="h-5 w-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          actionText: 'Посмотреть доступные слоты'
        });
      }

      // Рекомендации по целям
      const student = allUsers.find(u => u.id === userId);
      if (student?.profile && 'goals' in student.profile && student.profile.goals?.length === 0) {
        newRecommendations.push({
          id: 'goal-1',
          type: 'goal',
          title: 'Поставьте цели обучения',
          description: 'Определите, чего хотите достичь в обучении. Это поможет выбрать правильных преподавателей и составить план.',
          priority: 'medium',
          icon: <Target className="h-5 w-5" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          actionText: 'Настроить цели'
        });
      }

      // Рекомендации по преподавателям
      const availableTeachers = allUsers.filter(u => 
        u.role === 'teacher' && 
        u.id !== userId
      );

      if (availableTeachers.length > 0) {
        const topTeacher = availableTeachers[0]; // В реальном приложении здесь была бы логика выбора лучшего
        newRecommendations.push({
          id: 'teacher-1',
          type: 'teacher',
          title: 'Попробуйте нового преподавателя',
          description: `Преподаватель ${topTeacher.name} специализируется на ваших предметах. Новый подход может быть полезен.`,
          priority: 'medium',
          icon: <Users className="h-5 w-5" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          actionText: 'Посмотреть профиль'
        });
      }

    } else {
      // Рекомендации для преподавателей
      
      // Рекомендации по расписанию
      const availableSlots = timeSlots.filter(s => !s.isBooked);
      if (availableSlots.length > 10) {
        newRecommendations.push({
          id: 'schedule-teacher-1',
          type: 'schedule',
          title: 'Оптимизируйте расписание',
          description: 'У вас много свободных слотов. Попробуйте изменить время или добавить новые предметы.',
          priority: 'medium',
          icon: <Clock className="h-5 w-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          actionText: 'Настроить расписание'
        });
      }

      // Рекомендации по профилю
      const teacher = allUsers.find(u => u.id === userId);
      if (teacher?.profile && 'subjects' in teacher.profile && teacher.profile.subjects?.length < 3) {
        newRecommendations.push({
          id: 'profile-teacher-1',
          type: 'subject',
          title: 'Расширьте специализацию',
          description: 'Добавьте больше предметов в профиль. Это увеличит количество потенциальных студентов.',
          priority: 'medium',
          icon: <BookOpen className="h-5 w-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          actionText: 'Редактировать профиль'
        });
      }

      // Рекомендации по рейтингу
      if (teacher?.profile && 'rating' in teacher.profile && (!teacher.profile.rating || teacher.profile.rating < 4.5)) {
        newRecommendations.push({
          id: 'rating-teacher-1',
          type: 'goal',
          title: 'Повысьте рейтинг',
          description: 'Ваш рейтинг ниже среднего. Качественные уроки и общение со студентами помогут его улучшить.',
          priority: 'high',
          icon: <Star className="h-5 w-5" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          actionText: 'Посмотреть отзывы'
        });
      }
    }

    // Общие рекомендации
    const lastLesson = lessons
      .filter(l => (userRole === 'student' ? l.studentId === userId : l.teacherId === userId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (lastLesson) {
      const daysSinceLastLesson = Math.floor((new Date().getTime() - new Date(lastLesson.date).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastLesson > 7) {
        newRecommendations.push({
          id: 'activity-1',
          type: 'schedule',
          title: 'Вернитесь к обучению',
          description: `Прошло ${daysSinceLastLesson} дней с последнего урока. Регулярность важна для прогресса.`,
          priority: 'high',
          icon: <Zap className="h-5 w-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          actionText: 'Запланировать урок'
        });
      }
    }

    setRecommendations(newRecommendations);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <CheckCircle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <ArrowRight className="h-4 w-4 text-blue-600" />;
      default:
        return <ArrowRight className="h-4 w-4 text-gray-600" />;
    }
  };

  const categories = [
    { id: 'all', name: 'Все', count: recommendations.length },
    { id: 'lesson', name: 'Уроки', count: recommendations.filter(r => r.type === 'lesson').length },
    { id: 'teacher', name: 'Преподаватели', count: recommendations.filter(r => r.type === 'teacher').length },
    { id: 'subject', name: 'Предметы', count: recommendations.filter(r => r.type === 'subject').length },
    { id: 'schedule', name: 'Расписание', count: recommendations.filter(r => r.type === 'schedule').length },
    { id: 'goal', name: 'Цели', count: recommendations.filter(r => r.type === 'goal').length }
  ];

  const filteredRecommendations = recommendations.filter(rec => 
    selectedCategory === 'all' || rec.type === selectedCategory
  );

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        <Lightbulb className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Рекомендации появятся позже</h3>
        <p className="text-gray-500">
          Продолжайте использовать платформу, и мы предложим персональные рекомендации
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
          <Lightbulb className="h-8 w-8 text-yellow-500" />
          <span>Персональные рекомендации</span>
        </h2>
        <p className="text-xl text-gray-600">
          Мы проанализировали ваш прогресс и подготовили полезные советы
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white text-center">
          <div className="text-2xl font-bold">{recommendations.length}</div>
          <div className="text-blue-100 text-sm">Всего рекомендаций</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white text-center">
          <div className="text-2xl font-bold">
            {recommendations.filter(r => r.priority === 'high').length}
          </div>
          <div className="text-green-100 text-sm">Важные</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 text-white text-center">
          <div className="text-2xl font-bold">
            {recommendations.filter(r => r.priority === 'medium').length}
          </div>
          <div className="text-yellow-100 text-sm">Средние</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white text-center">
          <div className="text-2xl font-bold">
            {recommendations.filter(r => r.priority === 'low').length}
          </div>
          <div className="text-purple-100 text-sm">Низкие</div>
        </div>
      </div>

      {/* Фильтры по категориям */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.name}
              <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Список рекомендаций */}
      <div className="space-y-4">
        {filteredRecommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className={`bg-white rounded-2xl shadow-lg border-2 p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${getPriorityColor(recommendation.priority)}`}
          >
            <div className="flex items-start space-x-4">
              {/* Иконка */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${recommendation.bgColor}`}>
                <div className={recommendation.color}>
                  {recommendation.icon}
                </div>
              </div>

              {/* Содержание */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {recommendation.title}
                    </h3>
                    <p className="text-gray-600">
                      {recommendation.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(recommendation.priority)}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      recommendation.priority === 'high' ? 'bg-red-100 text-red-700' :
                      recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {recommendation.priority === 'high' ? 'Важно' :
                       recommendation.priority === 'medium' ? 'Средне' : 'Низко'}
                    </span>
                  </div>
                </div>

                {/* Действие */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <TrendingUp className="h-4 w-4" />
                    <span>Рекомендуем выполнить в ближайшее время</span>
                  </div>
                  
                  <button
                    onClick={recommendation.onAction}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                  >
                    <span>{recommendation.actionText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Пустое состояние для фильтров */}
      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
          <Lightbulb className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Рекомендации не найдены</h3>
          <p className="text-gray-500 mb-4">
            Попробуйте изменить фильтры или подождите, пока появятся новые рекомендации
          </p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-105"
          >
            Показать все
          </button>
        </div>
      )}
    </div>
  );
};

export default Recommendations;























