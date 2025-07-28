import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import AuthForm from './components/Auth/AuthForm';
import Navigation from './components/Layout/Navigation';
import StudentHome from './components/Student/StudentHome';
import StudentLessons from './components/Student/StudentLessons';
import StudentCalendar from './components/Student/StudentCalendar';
import TeacherHome from './components/Teacher/TeacherHome';
import TeacherSlots from './components/Teacher/TeacherSlots';
import TeacherCalendar from './components/Teacher/TeacherCalendar';
import ChatList from './components/Shared/ChatList';
import ProfileForm from './components/Shared/ProfileForm';
import TeacherStudents from './components/Teacher/TeacherStudents';
import { Routes, Route } from 'react-router-dom';

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
    <Routes>
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-50">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
            <main>
              {renderContent()}
            </main>
          </div>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;