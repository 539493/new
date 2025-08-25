export interface User {
  id: string;
  email: string;
  name: string;
  nickname: string;
  role: 'student' | 'teacher';
  phone?: string;
  avatar?: string;
  profile?: StudentProfile | TeacherProfile;
}

export interface StudentProfile {
  grade?: string;
  bio?: string;
  avatar?: string;
  subjects?: string[];
  // Новые поля для ученика:
  age?: number; // возраст ученика
  school?: string; // школа
  city?: string; // город
  phone?: string; // телефон
  parentName?: string; // имя родителя
  parentPhone?: string; // телефон родителя
  goals?: string[]; // цели обучения
  interests?: string[]; // интересы и хобби
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'; // стиль обучения
  experience?: 'beginner' | 'intermediate' | 'advanced'; // уровень знаний
  preferredFormats?: string[]; // предпочитаемые форматы занятий
  preferredDurations?: number[]; // предпочитаемая длительность занятий
  timeZone?: string; // часовой пояс
  [key: string]: unknown;
}

export interface TeacherProfile {
  subjects: string[];
  experience: 'beginner' | 'experienced' | 'professional';
  grades: string[];
  goals: string[];
  lessonTypes: string[];
  durations: number[];
  formats: string[];
  offlineAvailable: boolean;
  city?: string;
  overbookingEnabled: boolean;
  bio?: string;
  avatar?: string;
  rating?: number;
  hourlyRate?: number;
  // Новые поля для соцсети:
  students?: string[]; // id учеников
  lessonsCount?: number; // всего проведённых уроков
  country?: string;
  // Поле для кастомного фона карточки
  cardBackground?: string; // URL изображения или CSS градиент
  // Новые поля для возраста и опыта:
  age?: number; // возраст преподавателя
  experienceYears?: number; // количество лет опыта
  // Поле для отзывов:
  reviewsCount?: number; // количество отзывов
  // Поле для образования и курсов:
  education?: {
    university?: string; // университет
    degree?: string; // степень/специальность
    graduationYear?: number; // год окончания
    courses?: Array<{
      name: string; // название курса
      institution: string; // учреждение
      year: number; // год прохождения
      certificate?: string; // ссылка на сертификат
    }>;
  };
  [key: string]: unknown;
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
  lessonType: 'regular' | 'trial';
  format: 'online' | 'offline' | 'mini-group';
  price: number;
  isBooked: boolean;
  experience: 'beginner' | 'experienced' | 'professional';
  goals: string[];
  grades: string[];
  rating?: number;
  bookedStudentId?: string;
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
  lessonType: 'regular' | 'trial';
  comment?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage?: ChatMessage;
  messages: ChatMessage[];
  archived?: boolean;
}

export interface FilterOptions {
  overbooking?: boolean;
  grade?: string;
  subject?: string;
  goals?: string[];
  experience?: string;
  lessonType?: string;
  duration?: number;
  format?: string;
  city?: string;
  minRating?: number;
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