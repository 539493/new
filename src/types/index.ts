export interface User {
  id: string;
  email: string;
  name: string;
  nickname: string;
  role: 'student' | 'teacher';
  phone: string;
  avatar?: string;
  profile?: StudentProfile | TeacherProfile;
}

export interface StudentProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  bio?: string;
  grade?: string;
  interests?: string[];
  goals?: string[];
  parentContact?: string;
  school?: string;
  achievements?: string[];
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  preferredSubjects?: string[];
  availability?: 'flexible' | 'weekdays' | 'weekends' | 'evenings';
}

export interface TeacherProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  bio?: string;
  subjects: string[];
  experience: 'beginner' | 'experienced' | 'professional';
  education?: string;
  rating?: number;
  lessonsCount?: number;
  students?: string[];
  achievements?: string[];
  specializations?: string[];
  hourlyRate?: number;
  availability?: 'flexible' | 'weekdays' | 'weekends' | 'evenings';
  location?: string;
  languages?: string[];
  certificates?: string[];
}

export interface TimeSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  subject: string;
  lessonType: 'regular' | 'trial' | 'consultation' | 'exam_prep' | 'homework_help';
  format: 'online' | 'offline' | 'mini-group';
  price: number;
  grades: string[];
  experience: 'beginner' | 'experienced' | 'professional';
  rating?: number;
  city?: string;
  isBooked: boolean;
  bookedStudentId?: string;
  lessonId?: string;
  isDeleted?: boolean;
}

export interface Lesson {
  id: string;
  studentId: string;
  teacherId: string;
  studentName: string;
  teacherName: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  format: 'online' | 'offline' | 'mini-group';
  status: 'scheduled' | 'completed' | 'cancelled';
  price: number;
  lessonType: 'regular' | 'trial' | 'consultation' | 'exam_prep' | 'homework_help';
  comment?: string;
}

export interface Chat {
  id: string;
  participants: string[];
  participantNames: string[];
  messages: Message[];
  lastMessage?: Message;
  archived?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  media?: string[];
  type: 'text' | 'image' | 'video';
  date: string;
  reactions: Reaction[];
  comments: Comment[];
  isBookmarked: boolean;
}

export interface Reaction {
  type: 'like' | 'love' | 'smile' | 'thumbsup';
  count: number;
  userReacted: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  date: string;
}

export interface FilterOptions {
  grade?: string;
  subject?: string;
  experience?: string;
  lessonType?: string;
  duration?: number;
  format?: string;
  minRating?: number;
  city?: string;
  date?: string;
  timeRange?: {
    start: string;
    end: string;
  };
}

export interface OverbookingRequest {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  grade: string;
  goals: string[];
  experience: string;
  duration: number;
  format: string;
  city: string;
  date: string;
  startTime: string;
  comment: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// Типы для календаря
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  lesson?: Lesson;
  slot?: TimeSlot;
  resource?: any;
}

// Типы для уведомлений
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

// Типы для статистики
export interface Statistics {
  totalLessons: number;
  completedLessons: number;
  cancelledLessons: number;
  totalStudents: number;
  totalTeachers: number;
  averageRating: number;
  totalEarnings: number;
  monthlyStats: MonthlyStat[];
}

export interface MonthlyStat {
  month: string;
  lessons: number;
  earnings: number;
  students: number;
}

// Типы для настроек
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    showProfile: boolean;
    showSchedule: boolean;
    allowMessages: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

// Типы для платежей
export interface Payment {
  id: string;
  lessonId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'card' | 'bank_transfer' | 'digital_wallet';
  createdAt: string;
  completedAt?: string;
}

// Типы для отзывов
export interface Review {
  id: string;
  lessonId: string;
  studentId: string;
  teacherId: string;
  studentName: string;
  teacherName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isPublic: boolean;
}

// Типы для файлов
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  isPublic: boolean;
}

// Типы для групп
export interface Group {
  id: string;
  name: string;
  description?: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  students: string[];
  maxStudents: number;
  currentStudents: number;
  schedule: GroupSchedule[];
  price: number;
  isActive: boolean;
  createdAt: string;
}

export interface GroupSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
}

// Типы для домашних заданий
export interface Homework {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  dueDate: string;
  attachments?: string[];
  isCompleted: boolean;
  completedAt?: string;
  grade?: number;
  feedback?: string;
  createdAt: string;
}

// Типы для материалов
export interface Material {
  id: string;
  title: string;
  description?: string;
  type: 'document' | 'video' | 'audio' | 'link' | 'other';
  url: string;
  size?: number;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
  isPublic: boolean;
  downloads: number;
}

// Типы для событий
export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  organizer: string;
  participants: string[];
  maxParticipants?: number;
  isPublic: boolean;
  category: 'workshop' | 'seminar' | 'competition' | 'other';
  createdAt: string;
}

// Типы для достижений
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'academic' | 'participation' | 'excellence' | 'special';
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  userId: string;
}

// Типы для уровней
export interface Level {
  id: string;
  name: string;
  description: string;
  minPoints: number;
  maxPoints: number;
  icon: string;
  color: string;
  benefits: string[];
}

// Типы для системы геймификации
export interface GamificationProfile {
  userId: string;
  level: number;
  currentPoints: number;
  totalPoints: number;
  achievements: string[];
  streak: number;
  lastActivity: string;
  rank: number;
  badges: string[];
}