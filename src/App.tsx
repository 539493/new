import React, { useState } from 'react';
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
import StudentLessons from './components/Student/StudentLessons';
import StudentCalendar from './components/Student/StudentCalendar';
import TeacherProfilePage from './components/Student/TeacherProfilePage';
import ChatList from './components/Shared/ChatList';
import ProfileForm from './components/Shared/ProfileForm';
import { Routes, Route } from 'react-router-dom';
import './index.css';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { activeTab, setActiveTab } = useNavigation();

  if (!user) {
    return <AuthForm onSuccess={() => {}} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return user.role === 'student' ? <StudentHome /> : <TeacherSlots />;
      case 'slots':
        return user.role === 'teacher' ? <TeacherSlots /> : <StudentHome />;
      case 'calendar':
        return user.role === 'student' ? <StudentCalendar onClose={() => setActiveTab('home')} /> : <TeacherCalendar />;
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const { user } = useAuth();
  const initialTab = user?.role === 'teacher' ? 'slots' : 'home';
  
  return (
    <AuthProvider>
      <DataProvider>
        <NavigationProvider initialTab={initialTab}>
          <Routes>
            <Route path="/teacher/:teacherId" element={<TeacherProfilePage teacher={{}} onClose={() => {}} onBookLesson={() => {}} />} />
            <Route path="*" element={<AppContent />} />
          </Routes>
        </NavigationProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;