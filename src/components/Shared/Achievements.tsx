import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Target, Award, TrendingUp, Flame, Crown, Heart, Shield, BookOpen, Users, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Achievement, Level, GamificationProfile } from '../../types';

interface AchievementsProps {
  userId: string;
  achievements: Achievement[];
  currentLevel: number;
  currentPoints: number;
  totalPoints: number;
  streak: number;
  rank: number;
}

const Achievements: React.FC<AchievementsProps> = ({
  userId,
  achievements,
  currentLevel,
  currentPoints,
  totalPoints,
  streak,
  rank
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  // Категории достижений
  const categories = [
    { id: 'all', name: 'Все', icon: Trophy, color: 'text-gray-600' },
    { id: 'academic', name: 'Учёба', icon: BookOpen, color: 'text-blue-600' },
    { id: 'participation', name: 'Участие', icon: Users, color: 'text-green-600' },
    { id: 'excellence', name: 'Отличник', icon: Star, color: 'text-yellow-600' },
    { id: 'special', name: 'Особые', icon: Crown, color: 'text-purple-600' }
  ];

  // Уровни
  const levels: Level[] = [
    { id: '1', name: 'Новичок', description: 'Первые шаги в обучении', minPoints: 0, maxPoints: 100, icon: '🌱', color: '#10B981', benefits: ['Доступ к базовым материалам'] },
    { id: '2', name: 'Ученик', description: 'Активно изучает предметы', minPoints: 101, maxPoints: 300, icon: '📚', color: '#3B82F6', benefits: ['Доступ к расширенным материалам', 'Персональные рекомендации'] },
    { id: '3', name: 'Студент', description: 'Уверенно владеет знаниями', minPoints: 301, maxPoints: 600, icon: '🎓', color: '#8B5CF6', benefits: ['Приоритетная поддержка', 'Доступ к эксклюзивным курсам'] },
    { id: '4', name: 'Мастер', description: 'Высокий уровень знаний', minPoints: 601, maxPoints: 1000, icon: '🏆', color: '#F59E0B', benefits: ['Менторство других студентов', 'Специальные награды'] },
    { id: '5', name: 'Эксперт', description: 'Профессиональный уровень', minPoints: 1001, maxPoints: 9999, icon: '👑', color: '#EF4444', benefits: ['Все преимущества платформы', 'Статус VIP-пользователя'] }
  ];

  // Фильтруем достижения
  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
      return false;
    }
    if (showUnlockedOnly && !achievement.isUnlocked) {
      return false;
    }
    return true;
  });

  // Получаем текущий уровень
  const currentLevelData = levels.find(level => level.id === currentLevel.toString()) || levels[0];
  const nextLevel = levels.find(level => level.id === (currentLevel + 1).toString());

  // Прогресс до следующего уровня
  const progressToNextLevel = nextLevel 
    ? ((currentPoints - currentLevelData.minPoints) / (nextLevel.minPoints - currentLevelData.minPoints)) * 100
    : 100;

  // Статистика по категориям
  const categoryStats = categories.map(category => {
    const categoryAchievements = achievements.filter(a => 
      category.id === 'all' || a.category === category.id
    );
    const unlocked = categoryAchievements.filter(a => a.isUnlocked).length;
    const total = categoryAchievements.length;
    
    return {
      ...category,
      unlocked,
      total,
      percentage: total > 0 ? (unlocked / total) * 100 : 0
    };
  });

  // Ранги
  const getRankInfo = (rank: number) => {
    if (rank <= 10) return { name: 'Топ-10', icon: Crown, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (rank <= 25) return { name: 'Топ-25', icon: Star, color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (rank <= 50) return { name: 'Топ-50', icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-100' };
    if (rank <= 100) return { name: 'Топ-100', icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-100' };
    return { name: 'Участник', icon: Users, color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  const rankInfo = getRankInfo(rank);

  return (
    <div className="space-y-8">
      {/* Заголовок и статистика */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <span>Достижения и награды</span>
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Отслеживайте свой прогресс и получайте награды за достижения
        </p>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{currentLevel}</div>
              <div className="text-blue-100">Текущий уровень</div>
            </div>
            <div className="text-4xl">{currentLevelData.icon}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{currentPoints}</div>
              <div className="text-green-100">Очки опыта</div>
            </div>
            <Zap className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{streak}</div>
              <div className="text-purple-100">Дней подряд</div>
            </div>
            <Flame className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">#{rank}</div>
              <div className="text-orange-100">Место в рейтинге</div>
            </div>
            <Crown className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Прогресс уровня */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <span className="text-4xl">{currentLevelData.icon}</span>
              <div>
                <div>{currentLevelData.name}</div>
                <div className="text-lg text-gray-600">{currentLevelData.description}</div>
              </div>
            </h3>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{currentPoints} / {nextLevel?.minPoints || currentPoints}</div>
            <div className="text-gray-600">очков опыта</div>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Прогресс до следующего уровня</span>
            <span>{Math.round(progressToNextLevel)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progressToNextLevel, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Следующий уровень */}
        {nextLevel && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{nextLevel.icon}</div>
              <div>
                <h4 className="font-semibold text-emerald-900">Следующий уровень: {nextLevel.name}</h4>
                <p className="text-emerald-700 text-sm">{nextLevel.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Преимущества текущего уровня */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 mb-3">Преимущества текущего уровня:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentLevelData.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Рейтинг */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <span>Ваш рейтинг</span>
          </h3>
          <div className={`px-4 py-2 rounded-full ${rankInfo.bgColor} ${rankInfo.color} font-medium flex items-center space-x-2`}>
            <rankInfo.icon className="h-4 w-4" />
            <span>{rankInfo.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">#{rank}</div>
            <div className="text-gray-600">Место в общем рейтинге</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{totalPoints}</div>
            <div className="text-gray-600">Всего очков</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{achievements.filter(a => a.isUnlocked).length}</div>
            <div className="text-gray-600">Полученных достижений</div>
          </div>
        </div>
      </div>

      {/* Фильтры достижений */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Достижения</h3>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showUnlockedOnly}
                onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Только полученные</span>
            </label>
          </div>
        </div>

        {/* Категории */}
        <div className="flex flex-wrap gap-3 mb-6">
          {categoryStats.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border-2 transition-all duration-200 hover:scale-105 ${
                selectedCategory === category.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <category.icon className={`h-4 w-4 ${category.color}`} />
              <span>{category.name}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {category.unlocked}/{category.total}
              </span>
            </button>
          ))}
        </div>

        {/* Список достижений */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-2xl p-4 border-2 transition-all duration-300 hover:scale-105 ${
                achievement.isUnlocked
                  ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  achievement.isUnlocked
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                    : 'bg-gray-300'
                }`}>
                  {achievement.isUnlocked ? (
                    <Award className="h-6 w-6 text-white" />
                  ) : (
                    <Lock className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${
                    achievement.isUnlocked ? 'text-green-900' : 'text-gray-600'
                  }`}>
                    {achievement.title}
                  </h4>
                  <p className={`text-sm mb-2 ${
                    achievement.isUnlocked ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {achievement.points} очков
                      </span>
                    </div>
                    
                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <div className="text-xs text-green-600">
                        Получено {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Достижения не найдены</h3>
            <p className="text-gray-500">
              Попробуйте изменить фильтры или выполнить больше заданий
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Временный компонент Lock для неразблокированных достижений
const Lock: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default Achievements;
