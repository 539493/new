import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import AuthForm from './components/Auth/AuthForm';
import Navigation from './components/Layout/Navigation';
import StudentHome from './components/Student/StudentHome';
import TeacherHome from './components/Teacher/TeacherHome';
import TeacherSlots from './components/Teacher/TeacherSlots';
import TeacherStudents from './components/Teacher/TeacherStudents';
import TeacherCalendar from './components/Teacher/TeacherCalendar';
import TeacherMaterials from './components/Teacher/TeacherMaterials';
import StudentLessons from './components/Student/StudentLessons';
import StudentCalendar from './components/Student/StudentCalendar';
import TeacherProfilePage from './components/Student/TeacherProfilePage';
import ChatList from './components/Shared/ChatList';
import ProfileForm from './components/Shared/ProfileForm';
import { Routes, Route } from 'react-router-dom';
import './index.css';

const AppContent: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  try {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(user?.role === 'teacher' ? 'slots' : 'home');

    // Инициализируем активную вкладку на основе роли пользователя только один раз
    useEffect(() => {
      if (user && !isInitialized) {
        const defaultTab = user.role === 'teacher' ? 'slots' : 'home';
        setActiveTab(defaultTab);
        setIsInitialized(true);
      }
      setIsLoading(false);
    }, [user, isInitialized]);

    // Показываем загрузку
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка приложения...</p>
          </div>
        </div>
      );
    }

    // Если нет пользователя, показываем форму входа
    if (!user) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Добро пожаловать в Nauchi</h1>
            <p className="text-gray-600 mb-4">Платформа для репетиторов и учеников</p>
            <AuthForm onSuccess={() => {}} />
          </div>
        </div>
      );
    }

    const renderContent = () => {
      try {
        switch (activeTab) {
          case 'home':
            return user.role === 'student' ? <StudentHome setActiveTab={setActiveTab} /> : <TeacherSlots />;
          case 'slots':
            return user.role === 'teacher' ? <TeacherSlots /> : <StudentHome setActiveTab={setActiveTab} />;
          case 'calendar':
            return user.role === 'student' ? <StudentCalendar onClose={() => setActiveTab('home')} /> : <TeacherCalendar />;
          case 'lessons':
            return user.role === 'student' ? <StudentLessons setActiveTab={setActiveTab} /> : null;
          case 'students':
            return user.role === 'teacher' ? <TeacherStudents /> : null;
          case 'new-students':
            return user.role === 'teacher' ? <TeacherStudents /> : null;
          case 'classes':
            return user.role === 'teacher' ? <TeacherStudents /> : null;
          case 'materials':
            return user.role === 'teacher' ? <TeacherMaterials /> : null;
          case 'chats':
            return <ChatList />;
          case 'profile':
            return <ProfileForm />;
          default:
            return user.role === 'student' ? <StudentHome setActiveTab={setActiveTab} /> : <TeacherSlots />;
        }
      } catch (contentError) {
        console.error('Error rendering content:', contentError);
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки контента</h1>
              <p className="text-gray-600 mb-4">Попробуйте перезагрузить страницу</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Перезагрузить
              </button>
            </div>
          </div>
        );
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className={activeTab === 'chats' ? 'h-[calc(100vh-64px)]' : 'container mx-auto px-4 py-8'}>
          {renderContent()}
        </main>
      </div>
    );
  } catch (err) {
    console.error('Error in AppContent:', err);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки</h1>
          <p className="text-gray-600 mb-4">Произошла ошибка при загрузке приложения</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Перезагрузить страницу
          </button>
        </div>
      </div>
    );
  }
};

const App: React.FC = () => {
  return (
    <div className="App">
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/teacher/:teacherId" element={<TeacherProfilePage teacher={{}} onClose={() => {}} onBookLesson={() => {}} />} />
            <Route path="*" element={<AppContent />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </div>
  );
};

export default App;