import React, { useState } from 'react';
import { Mail, Lock, User, BookOpen, UserCheck, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (!showRoleSelection) {
    return (
      <div className="min-h-screen flex">
        {/* Левая часть - форма регистрации */}
        <div className="flex-1 bg-white flex items-center justify-center p-8">
          <div className="max-w-md w-full space-y-8">
            {/* Заголовок */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Добро пожаловать
              </h1>
              <p className="text-lg text-gray-600">
                Создайте новый аккаунт
              </p>
            </div>

            {/* Форма */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Имя
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D3C69] focus:border-[#0D3C69] transition-colors duration-200 text-lg"
                    placeholder="Введите ваше имя"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D3C69] focus:border-[#0D3C69] transition-colors duration-200 text-lg"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D3C69] focus:border-[#0D3C69] transition-colors duration-200 text-lg"
                    placeholder="Введите ваш email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D3C69] focus:border-[#0D3C69] transition-colors duration-200 text-lg"
                    placeholder="Создайте пароль"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0D3C69] hover:bg-[#0A2F56] text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? 'Создание аккаунта...' : 'Создать аккаунт'}
              </button>
            </form>

            {/* Правовая информация */}
            <p className="text-xs text-gray-500 text-center">
              Продолжая, вы соглашаетесь с{' '}
              <a href="#" className="text-[#0D3C69] hover:underline">Условиями использования</a>
              {' '}и{' '}
              <a href="#" className="text-[#0D3C69] hover:underline">Политикой конфиденциальности</a>
            </p>

            {/* Ссылка на вход */}
            <div className="text-center">
              <span className="text-gray-600">Уже есть аккаунт? </span>
              <button
                onClick={onBackToLogin}
                className="text-[#0D3C69] hover:text-[#0A2F56] font-medium"
              >
                Войти
              </button>
            </div>

            {/* Помощь */}
            <div className="text-center">
              <button className="text-[#0D3C69] hover:text-[#0A2F56] text-sm">
                Получить помощь
              </button>
            </div>

            {/* reCAPTCHA */}
            <p className="text-xs text-gray-400 text-center">
              Этот сайт защищен reCAPTCHA Enterprise и применяются{' '}
              <a href="#" className="text-[#0D3C69] hover:underline">Политика конфиденциальности</a>
              {' '}и{' '}
              <a href="#" className="text-[#0D3C69] hover:underline">Условия использования</a>
              {' '}Google.
            </p>
          </div>
        </div>

        {/* Правая часть - маркетинг */}
        <div className="flex-1 bg-gray-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          {/* Заголовок */}
          <h2 className="text-5xl font-bold text-white mb-8 text-center">
            Платформа для обучения
          </h2>

          {/* Цитата Толстого */}
          <div className="text-center mb-8">
            <blockquote className="text-xl text-gray-300 italic leading-relaxed">
              "Важно не количество знаний, а качество их. Можно знать очень многое не зная самого нужного."
            </blockquote>
            <cite className="text-sm text-gray-400 mt-4 block">
              — Л. Толстой
            </cite>
          </div>

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
  }

  // Выбор роли
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-[#0D3C69] rounded-xl flex items-center justify-center mb-4">
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
                ? 'border-[#0D3C69] bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${role === 'student' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <User className={`h-6 w-6 ${role === 'student' ? 'text-[#0D3C69]' : 'text-gray-600'}`} />
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
                ? 'border-[#0D3C69] bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${role === 'teacher' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <UserCheck className={`h-6 w-6 ${role === 'teacher' ? 'text-[#0D3C69]' : 'text-gray-600'}`} />
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
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D3C69] focus:border-[#0D3C69] transition-colors duration-200"
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
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D3C69] focus:border-[#0D3C69] transition-colors duration-200"
                placeholder="+7 (999) 123-45-67"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !nickname.trim() || !phone.trim()}
            className="w-full bg-[#0D3C69] hover:bg-[#0A2F56] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
};

export default RegisterForm; 