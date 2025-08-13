import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import AuthForm from './components/Auth/AuthForm';
import Navigation from './components/Layout/Navigation';
import StudentHome from './components/Student/StudentHome';
import TeacherHome from './components/Teacher/TeacherHome';
import TeacherSlots from './components/Teacher/TeacherSlots';
import TeacherStudents from './components/Teacher/TeacherStudents';
import TeacherCalendar from './components/Teacher/TeacherCalendar';
import StudentLessons from './components/Student/StudentLessons';
import StudentCalendar from './components/Student/StudentCalendar';
import TeacherProfilePage from './components/Student/TeacherProfilePage';
import WebSocketTest from './components/Shared/WebSocketTest';
import ChatList from './components/Shared/ChatList';
import ProfileForm from './components/Shared/ProfileForm';
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

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Безопасное получение пользователя
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext.user;
    
    // Устанавливаем активную вкладку на основе роли пользователя
    if (user && !activeTab) {
      setActiveTab(user.role === 'teacher' ? 'slots' : 'home');
    }
  } catch (error) {
    console.error('Failed to get auth context:', error);
    setError('Ошибка авторизации');
  }

  // Отладочная информация
  useEffect(() => {
    console.log('AppContent: user =', user);
    console.log('AppContent: activeTab =', activeTab);
  }, [user, activeTab]);

  // Если есть ошибка, показываем fallback
  if (error) {
    return <ErrorFallback />;
  }

  // Обработчик изменения вкладки с анимацией
  const handleTabChange = (newTab: string) => {
    if (newTab === activeTab) return;
    
    setIsPageTransitioning(true);
    setPreviousTab(activeTab);
    
    // Небольшая задержка для плавного перехода
    setTimeout(() => {
      setActiveTab(newTab);
      setIsPageTransitioning(false);
    }, 150);
  };

  if (!user) {
    console.log('AppContent: No user, showing AuthForm');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="animate-fade-in-up">
          <AuthForm onSuccess={() => {}} />
        </div>
      </div>
    );
  }

  console.log('AppContent: Rendering content for user:', user.name, 'role:', user.role);

  const renderContent = () => {
    const content = (() => {
      switch (activeTab) {
        case 'home':
          return user.role === 'student' ? <StudentHome /> : <TeacherSlots />;
        case 'slots':
          return user.role === 'teacher' ? <TeacherSlots /> : <StudentHome />;
        case 'calendar':
          return user.role === 'student' ? <StudentCalendar /> : <TeacherCalendar />;
        case 'lessons':
          return user.role === 'student' ? <StudentLessons /> : null;
        case 'students':
          return user.role === 'teacher' ? <TeacherStudents /> : null;
        case 'chats':
          return <ChatList />;
        case 'profile':
          return <ProfileForm />;
        default:
          return user.role === 'student' ? <StudentHome /> : <TeacherSlots />;
      }
    })();

    return (
      <div className={`transition-all duration-300 ease-out ${
        isPageTransitioning 
          ? 'opacity-0 transform translate-y-4' 
          : 'opacity-100 transform translate-y-0'
      }`}>
        {content}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="page-transition">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('App: Starting initialization...');
    // Симуляция загрузки приложения
    const timer = setTimeout(() => {
      console.log('App: Initialization complete, setting isLoading to false');
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  console.log('App: isLoading =', isLoading);

  if (isLoading) {
    console.log('App: Showing loading screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="mb-6">
            <div className="h-16 w-16 mx-auto rounded-3xl flex items-center justify-center shadow-2xl bg-gradient-to-br from-blue-600 to-purple-600 transform animate-pulse">
              <span className="text-white font-bold text-2xl">Na</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-4">
              Nаuchi
            </h1>
          </div>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-gray-600 mt-4 text-sm">Загрузка приложения...</p>
        </div>
      </div>
    );
  }

  console.log('App: Rendering main app with providers');
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          <Route path="/websocket-test" element={<WebSocketTest />} />
          <Route path="/teacher/:teacherId" element={<TeacherProfilePage teacher={{}} onClose={() => {}} onBookLesson={() => {}} />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;