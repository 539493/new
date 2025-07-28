import React, { useState } from 'react';
import { Mail, Lock, User, BookOpen, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthFormProps {
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        onSuccess();
      } else {
        if (!showRoleSelection) {
          setShowRoleSelection(true);
          setLoading(false);
          return;
        }
        if (!nickname.trim()) {
          alert('Пожалуйста, введите никнейм');
          setLoading(false);
          return;
        }
        const success = await register(email, password, name, nickname, role);
        if (success) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLogin && showRoleSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Выберите роль</h2>
            <p className="mt-2 text-gray-600">Кто вы на нашей платформе?</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setRole('student')}
              className={`w-full p-6 rounded-xl border-2 transition-all duration-200 ${
                role === 'student'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${role === 'student' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <User className={`h-6 w-6 ${role === 'student' ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Ученик</h3>
                  <p className="text-sm text-gray-600">Ищу репетитора для обучения</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setRole('teacher')}
              className={`w-full p-6 rounded-xl border-2 transition-all duration-200 ${
                role === 'teacher'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${role === 'teacher' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <UserCheck className={`h-6 w-6 ${role === 'teacher' ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Преподаватель</h3>
                  <p className="text-sm text-gray-600">Провожу уроки и делюсь знаниями</p>
                </div>
              </div>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Никнейм
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">@</span>
              </div>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className="block w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="your_nickname"
                required
                maxLength={20}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Только буквы, цифры и подчеркивания. Максимум 20 символов.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSubmit}
              disabled={!role || !nickname.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? 'Создание аккаунта...' : 'Создать аккаунт'}
            </button>

            <button
              onClick={() => setShowRoleSelection(false)}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors"
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Добро пожаловать!' : 'Создать аккаунт'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isLogin 
              ? 'Войдите в свой аккаунт для продолжения' 
              : 'Присоединяйтесь к нашей образовательной платформе'
            }
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Имя
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Введите ваше имя"
                  required
                />
              </div>
            </div>
          )}

          {!isLogin && !showRoleSelection && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Никнейм
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">@</span>
                </div>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  className="block w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="your_nickname"
                  required
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Только буквы, цифры и подчеркивания. Максимум 20 символов.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Введите ваш email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Введите пароль"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading 
              ? (isLogin ? 'Вход...' : 'Регистрация...') 
              : (isLogin ? 'Войти' : 'Продолжить')
            }
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setShowRoleSelection(false);
              }}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {isLogin 
                ? 'Нет аккаунта? Зарегистрироваться' 
                : 'Уже есть аккаунт? Войти'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;