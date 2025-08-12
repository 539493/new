import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Target, Award, Clock, DollarSign, Users, BookOpen, Star } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { TimeSlot, User } from '../../types';

interface AnalyticsProps {
  userId: string;
  userRole: 'student' | 'teacher';
}

interface AnalyticsData {
  totalLessons: number;
  completedLessons: number;
  upcomingLessons: number;
  totalHours: number;
  averageRating: number;
  totalEarnings?: number;
  totalStudents?: number;
  subjects: { [key: string]: number };
  monthlyProgress: { month: string; lessons: number; hours: number }[];
}

const Analytics: React.FC<AnalyticsProps> = ({ userId, userRole }) => {
  const { lessons, timeSlots, allUsers } = useData();
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && lessons && timeSlots) {
      calculateAnalytics();
    }
  }, [userId, lessons, timeSlots, timeRange]);

  const calculateAnalytics = () => {
    setLoading(true);
    
    // Фильтруем уроки для конкретного пользователя
    const userLessons = lessons.filter(lesson => 
      userRole === 'student' ? lesson.studentId === userId : lesson.teacherId === userId
    );

    // Фильтруем по временному диапазону
    const now = new Date();
    const filteredLessons = userLessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      switch (timeRange) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return lessonDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return lessonDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return lessonDate >= yearAgo;
        default:
          return true;
      }
    });

    // Подсчитываем статистику
    const totalLessons = filteredLessons.length;
    const completedLessons = filteredLessons.filter(lesson => lesson.status === 'completed').length;
    const upcomingLessons = filteredLessons.filter(lesson => lesson.status === 'scheduled').length;
    
    // Подсчитываем часы
    const totalHours = filteredLessons.reduce((total, lesson) => {
      const duration = lesson.duration || 60;
      return total + (duration / 60);
    }, 0);

    // Подсчитываем средний рейтинг (пока используем заглушку, так как рейтинг хранится в отдельной таблице)
    const averageRating = 0; // TODO: Добавить логику для получения рейтинга из таблицы Review

    // Подсчитываем доходы (для преподавателей)
    const totalEarnings = userRole === 'teacher' 
      ? filteredLessons.reduce((total, lesson) => total + (lesson.price || 0), 0)
      : 0;

    // Подсчитываем количество студентов (для преподавателей)
    const totalStudents = userRole === 'teacher'
      ? new Set(filteredLessons.map(lesson => lesson.studentId)).size
      : 0;

    // Подсчитываем статистику по предметам
    const subjects: { [key: string]: number } = {};
    filteredLessons.forEach(lesson => {
      const subject = lesson.subject || 'Неизвестно';
      subjects[subject] = (subjects[subject] || 0) + 1;
    });

    // Подсчитываем месячный прогресс
    const monthlyProgress = calculateMonthlyProgress(filteredLessons);

    setAnalyticsData({
      totalLessons,
      completedLessons,
      upcomingLessons,
      totalHours,
      averageRating,
      totalEarnings,
      totalStudents,
      subjects,
      monthlyProgress
    });

    setLoading(false);
  };

  const calculateMonthlyProgress = (lessons: any[]) => {
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const currentYear = new Date().getFullYear();
    const progress = [];

    for (let i = 0; i < 12; i++) {
      const monthLessons = lessons.filter(lesson => {
        const lessonDate = new Date(lesson.date);
        return lessonDate.getFullYear() === currentYear && lessonDate.getMonth() === i;
      });

      const monthHours = monthLessons.reduce((total, lesson) => {
        const duration = lesson.duration || 60;
        return total + (duration / 60);
      }, 0);

      progress.push({
        month: months[i],
        lessons: monthLessons.length,
        hours: monthHours
      });
    }

    return progress;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const { 
    totalLessons, 
    completedLessons, 
    upcomingLessons, 
    totalHours, 
    averageRating, 
    totalEarnings, 
    totalStudents,
    subjects,
    monthlyProgress
  } = analyticsData;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span>Аналитика</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Статистика за {timeRange === 'week' ? 'неделю' : timeRange === 'month' ? 'месяц' : 'год'}
          </p>
        </div>

        <div className="flex space-x-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                timeRange === range
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === 'week' ? 'Неделя' : range === 'month' ? 'Месяц' : 'Год'}
            </button>
          ))}
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{totalLessons}</div>
              <div className="text-blue-100 text-sm">Всего уроков</div>
            </div>
            <BookOpen className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{Math.round(totalHours * 10) / 10}</div>
              <div className="text-green-100 text-sm">Часов обучения</div>
            </div>
            <Clock className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{Math.round(averageRating * 10) / 10}</div>
              <div className="text-purple-100 text-sm">Средний рейтинг</div>
            </div>
            <Star className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        {userRole === 'teacher' ? (
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalEarnings}₽</div>
                <div className="text-orange-100 text-sm">Общий доход</div>
              </div>
              <DollarSign className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{upcomingLessons}</div>
                <div className="text-indigo-100 text-sm">Предстоящих уроков</div>
              </div>
              <Target className="h-8 w-8 text-indigo-200" />
            </div>
          </div>
        )}
      </div>

      {/* Дополнительные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Прогресс по месяцам */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Прогресс по месяцам</span>
          </h3>
          <div className="space-y-3">
            {monthlyProgress.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-8">{month.month}</span>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((month.lessons / Math.max(...monthlyProgress.map(m => m.lessons))) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {month.lessons}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Статистика по предметам */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-blue-600" />
            <span>Предметы</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(subjects)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([subject, count]) => (
                <div key={subject} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{subject}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(count / totalLessons) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Дополнительная информация для преподавателей */}
      {userRole === 'teacher' && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-900 mb-3 flex items-center space-x-2">
            <Users className="h-5 w-5 text-emerald-600" />
            <span>Информация о студентах</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">{totalStudents}</div>
              <div className="text-emerald-600 text-sm">Уникальных студентов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">
                {totalStudents && totalStudents > 0 ? Math.round((completedLessons / totalStudents) * 10) / 10 : 0}
              </div>
              <div className="text-emerald-600 text-sm">Уроков на студента</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
