import React, { useState } from 'react';
import { Mail, Lock, User, BookOpen, UserCheck, Github, Chrome, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthFormProps {
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
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
        if (!phone.trim()) {
          alert('Пожалуйста, введите номер телефона');
          setLoading(false);
          return;
        }
        const success = await register(email, password, name, nickname, role, phone);
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

  const handleSocialLogin = (provider: string) => {
    // Здесь можно добавить логику для социальных сетей
    console.log(`Login with ${provider}`);
  };

  // Если это регистрация и нужно выбрать роль
  if (!isLogin && showRoleSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
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
                  ? 'border-orange-500 bg-orange-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${role === 'student' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                  <User className={`h-6 w-6 ${role === 'student' ? 'text-orange-600' : 'text-gray-600'}`} />
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
                  ? 'border-orange-500 bg-orange-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${role === 'teacher' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                  <UserCheck className={`h-6 w-6 ${role === 'teacher' ? 'text-orange-600' : 'text-gray-600'}`} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Преподаватель</h3>
                  <p className="text-sm text-gray-600">Провожу уроки и делюсь знаниями</p>
                </div>
              </div>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                Никнейм
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                placeholder="Введите никнейм"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Номер телефона
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !nickname.trim() || !phone.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Создание аккаунта...' : 'Завершить регистрацию'}
            </button>

            <button
              onClick={() => setShowRoleSelection(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Основная форма входа/регистрации
  return (
    <div className="min-h-screen flex">
      {/* Левая часть - форма */}
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          {/* Логотип */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
            <span className="text-2xl font-bold text-gray-900">nauchi</span>
          </div>

          {/* Заголовок */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {isLogin ? 'Войти в аккаунт' : 'Создать аккаунт'}
            </h1>
          </div>

          {/* Социальные кнопки */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center space-x-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              <Chrome className="h-5 w-5" />
              <span>Продолжить с Google</span>
            </button>

            <button
              onClick={() => handleSocialLogin('github')}
              className="w-full flex items-center justify-center space-x-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              <Github className="h-5 w-5" />
              <span>Продолжить с GitHub</span>
            </button>

            <button
              onClick={() => handleSocialLogin('x')}
              className="w-full flex items-center justify-center space-x-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              <span className="text-lg font-bold">𝕏</span>
              <span>Продолжить с X</span>
            </button>
          </div>

          {/* Разделитель */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Или</span>
            </div>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Имя
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                    placeholder="Введите ваше имя"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Номер телефона
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={!isLogin}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  placeholder="Введите ваш email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  placeholder={isLogin ? "Введите пароль" : "Создайте пароль"}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (isLogin ? 'Вход...' : 'Создание аккаунта...') 
                : (isLogin ? 'Войти' : 'Создать аккаунт')
              }
            </button>
          </form>

          {/* Правовая информация */}
          <p className="text-xs text-gray-500 text-center">
            Продолжая, вы соглашаетесь с{' '}
            <a href="#" className="text-orange-500 hover:underline">Условиями использования</a>
            {' '}и{' '}
            <a href="#" className="text-orange-500 hover:underline">Политикой конфиденциальности</a>
          </p>

          {/* Ссылка на вход/регистрацию */}
          <div className="text-center">
            <span className="text-gray-600">
              {isLogin ? "Нет аккаунта? " : "Уже есть аккаунт? "}
            </span>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setShowRoleSelection(false);
                setEmail('');
                setPassword('');
                setName('');
                setPhone('');
                setNickname('');
              }}
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </div>

          {/* Помощь */}
          <div className="text-center">
            <button className="text-orange-500 hover:text-orange-600 text-sm">
              Получить помощь
            </button>
          </div>

          {/* reCAPTCHA */}
          <p className="text-xs text-gray-400 text-center">
            Этот сайт защищен reCAPTCHA Enterprise и применяются{' '}
            <a href="#" className="text-orange-500 hover:underline">Политика конфиденциальности</a>
            {' '}и{' '}
            <a href="#" className="text-orange-500 hover:underline">Условия использования</a>
            {' '}Google.
          </p>
        </div>
      </div>

      {/* Правая часть - маркетинг */}
      <div className="flex-1 bg-gray-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Логотип */}
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded mb-8"></div>
        
        {/* Заголовок */}
        <h2 className="text-4xl font-bold text-white mb-8 text-center">
          От идеи к приложению, быстро
        </h2>

        {/* Изображение Земли */}
        <div className="relative w-full h-64 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-black"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20"></div>
          </div>
          {/* Точки для имитации городов */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;