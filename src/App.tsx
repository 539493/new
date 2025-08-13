import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import AuthForm from './components/Auth/AuthForm';
import Navigation from './components/Layout/Navigation';
import StudentHome from './components/Student/StudentHome';
import TeacherHome from './components/Teacher/TeacherHome';
import { Routes, Route } from 'react-router-dom';
import './index.css';

// Простой компонент для отображения ошибок
const ErrorFallback: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Что-то пошло не так</h1>
      <p className="text-gray-600 mb-4">Приложение не может загрузиться</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Перезагрузить страницу
      </button>
    </div>
  </div>
);

// Упрощенный компонент для отображения контента
const AppContent: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Пытаемся получить пользователя из localStorage
      const savedUser = localStorage.getItem('tutoring_currentUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log('User loaded from localStorage:', parsedUser);
      } else {
        // Создаем демо-пользователя
        const demoUser = {
          id: 'demo_user_1',
          email: 'demo@example.com',
          name: 'Демо Ученик',
          nickname: 'demo_student',
          role: 'student',
          phone: '+7 (999) 123-45-67',
          avatar: 'https://via.placeholder.com/150',
          profile: {
            name: 'Демо Ученик',
            email: 'demo@example.com',
            phone: '+7 (999) 123-45-67',
            grade: '10',
            preferredSubjects: ['Математика', 'Физика'],
            goals: ['подготовка к экзаменам'],
            learningStyle: 'mixed',
            availability: 'flexible'
          }
        };
        
        localStorage.setItem('tutoring_currentUser', JSON.stringify(demoUser));
        localStorage.setItem('tutoring_users', JSON.stringify([demoUser]));
        setUser(demoUser);
        console.log('Demo user created and set:', demoUser);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing app:', error);
      setError('Ошибка инициализации');
      setIsLoading(false);
    }
  }, []);

  // Если есть ошибка, показываем fallback
  if (error) {
    return <ErrorFallback />;
  }

  // Показываем загрузку
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка приложения...</p>
        </div>
      </div>
    );
  }

  // Если нет пользователя, показываем форму авторизации
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="animate-fade-in-up">
          <AuthForm onSuccess={() => {}} />
        </div>
      </div>
    );
  }

  // Показываем основной контент
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Navigation activeTab="home" onTabChange={() => {}} />
      <main className="container mx-auto px-4 py-8 pt-24">
        {user.role === 'student' ? <StudentHome /> : <TeacherHome />}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="App">
      <AppContent />
    </div>
  );
};

export default App;