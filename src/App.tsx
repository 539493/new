import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Navigation from './components/Layout/Navigation';
import StudentHome from './components/Student/StudentHome';
import TeacherHome from './components/Teacher/TeacherHome';
import TeacherSlots from './components/Teacher/TeacherSlots';
import TeacherStudents from './components/Teacher/TeacherStudents';
import TeacherCalendar from './components/Teacher/TeacherCalendar';
import StudentLessons from './components/Student/StudentLessons';
import StudentCalendar from './components/Student/StudentCalendar';
import TeacherProfilePage from './components/Student/TeacherProfilePage';
import VideoChatPage from './components/Shared/VideoChatPage';
import VideoTestPage from './components/Shared/VideoTestPage';
import WebSocketTest from './components/Shared/WebSocketTest';
import './index.css';

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab="home" onTabChange={() => {}} />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<StudentHome />} />
          <Route path="/teacher" element={<TeacherHome />} />
          <Route path="/teacher/slots" element={<TeacherSlots />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/calendar" element={<TeacherCalendar />} />
          <Route path="/student/lessons" element={<StudentLessons />} />
          <Route path="/student/calendar" element={<StudentCalendar />} />
          <Route path="/teacher/:teacherId" element={<TeacherProfilePage teacher={{}} onClose={() => {}} onBookLesson={() => {}} />} />
          <Route path="/video-chat" element={<VideoChatPage />} />
          <Route path="/video-test" element={<VideoTestPage />} />
          <Route path="/websocket-test" element={<WebSocketTest />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;