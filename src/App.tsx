import React, { useState } from 'react';
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
import PostsPage from './components/Shared/PostsPage';
import UsersPage from './components/Shared/UsersPage';
import { Routes, Route } from 'react-router-dom';
import './index.css';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(user?.role === 'teacher' ? 'slots' : 'home');

  if (!user) {
    return <AuthForm onSuccess={() => {}} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return user.role === 'student' ? <StudentHome /> : <TeacherSlots />;
      case 'posts':
        return <PostsPage />;
      case 'users':
        return <UsersPage />;
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