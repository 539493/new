const fs = require('fs');
const path = require('path');

// Создаем тестовые данные для преподавателей
const testTeacherProfiles = {
  'teacher_1': {
    name: 'Анна Петрова',
    email: 'anna.petrova@example.com',
    phone: '+7 (999) 123-45-67',
    subjects: ['Математика', 'Физика'],
    experience: 'experienced',
    grades: ['9', '10', '11'],
    goals: ['ЕГЭ', 'ОГЭ', 'Подготовка к олимпиадам'],
    lessonTypes: ['Индивидуальные', 'Групповые'],
    durations: ['60 минут', '90 минут'],
    formats: ['online', 'offline'],
    offlineAvailable: true,
    city: 'Москва',
    overbookingEnabled: true,
    bio: 'Опытный преподаватель математики и физики с 8-летним стажем. Специализируюсь на подготовке к ЕГЭ и ОГЭ. Индивидуальный подход к каждому ученику.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    rating: 4.8,
    hourlyRate: 1500,
    students: [],
    lessonsCount: 0,
    country: 'Россия',
    age: 32,
    experienceYears: 8,
    reviewsCount: 24
  },
  'teacher_2': {
    name: 'Михаил Сидоров',
    email: 'mikhail.sidorov@example.com',
    phone: '+7 (999) 234-56-78',
    subjects: ['Химия', 'Биология'],
    experience: 'professional',
    grades: ['8', '9', '10', '11'],
    goals: ['ЕГЭ', 'ОГЭ', 'Поступление в медицинский'],
    lessonTypes: ['Индивидуальные'],
    durations: ['60 минут', '90 минут', '120 минут'],
    formats: ['online'],
    offlineAvailable: false,
    city: 'Санкт-Петербург',
    overbookingEnabled: true,
    bio: 'Кандидат химических наук, преподаватель с 15-летним опытом. Специализируюсь на подготовке к поступлению в медицинские вузы.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    rating: 4.9,
    hourlyRate: 2000,
    students: [],
    lessonsCount: 0,
    country: 'Россия',
    age: 45,
    experienceYears: 15,
    reviewsCount: 67
  },
  'teacher_3': {
    name: 'Елена Козлова',
    email: 'elena.kozlova@example.com',
    phone: '+7 (999) 345-67-89',
    subjects: ['Английский язык', 'Немецкий язык'],
    experience: 'beginner',
    grades: ['5', '6', '7', '8', '9'],
    goals: ['Разговорный английский', 'Подготовка к школе'],
    lessonTypes: ['Индивидуальные', 'Мини-группы'],
    durations: ['45 минут', '60 минут'],
    formats: ['online', 'offline'],
    offlineAvailable: true,
    city: 'Казань',
    overbookingEnabled: true,
    bio: 'Молодой преподаватель иностранных языков. Использую современные методики обучения и игровой подход для детей.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    rating: 4.6,
    hourlyRate: 800,
    students: [],
    lessonsCount: 0,
    country: 'Россия',
    age: 25,
    experienceYears: 2,
    reviewsCount: 12
  },
  'teacher_4': {
    name: 'Дмитрий Волков',
    email: 'dmitry.volkov@example.com',
    phone: '+7 (999) 456-78-90',
    subjects: ['История', 'Обществознание'],
    experience: 'experienced',
    grades: ['9', '10', '11'],
    goals: ['ЕГЭ', 'ОГЭ', 'Подготовка к олимпиадам'],
    lessonTypes: ['Индивидуальные', 'Групповые'],
    durations: ['60 минут', '90 минут'],
    formats: ['online', 'offline'],
    offlineAvailable: true,
    city: 'Новосибирск',
    overbookingEnabled: false,
    bio: 'Историк-педагог с 10-летним опытом. Автор методических пособий по подготовке к ЕГЭ по истории и обществознанию.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    rating: 4.7,
    hourlyRate: 1200,
    students: [],
    lessonsCount: 0,
    country: 'Россия',
    age: 38,
    experienceYears: 10,
    reviewsCount: 45
  },
  'teacher_5': {
    name: 'Ольга Морозова',
    email: 'olga.morozova@example.com',
    phone: '+7 (999) 567-89-01',
    subjects: ['Русский язык', 'Литература'],
    experience: 'professional',
    grades: ['5', '6', '7', '8', '9', '10', '11'],
    goals: ['ЕГЭ', 'ОГЭ', 'Сочинение', 'Изложение'],
    lessonTypes: ['Индивидуальные'],
    durations: ['60 минут', '90 минут'],
    formats: ['online'],
    offlineAvailable: false,
    city: 'Екатеринбург',
    overbookingEnabled: true,
    bio: 'Филолог с 20-летним опытом преподавания. Специализируюсь на подготовке к ЕГЭ по русскому языку и литературе.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    rating: 4.9,
    hourlyRate: 1800,
    students: [],
    lessonsCount: 0,
    country: 'Россия',
    age: 52,
    experienceYears: 20,
    reviewsCount: 89
  }
};

// Создаем тестовые данные для студентов
const testStudentProfiles = {
  'student_1': {
    name: 'Алексей Иванов',
    email: 'alexey.ivanov@example.com',
    phone: '+7 (999) 111-22-33',
    grade: '10',
    subjects: ['Математика', 'Физика'],
    goals: ['ЕГЭ', 'Подготовка к олимпиадам'],
    city: 'Москва',
    bio: 'Ученик 10 класса, готовлюсь к ЕГЭ по математике и физике.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    country: 'Россия',
    age: 16
  },
  'student_2': {
    name: 'Мария Сидорова',
    email: 'maria.sidorova@example.com',
    phone: '+7 (999) 222-33-44',
    grade: '9',
    subjects: ['Химия', 'Биология'],
    goals: ['ОГЭ', 'Поступление в медицинский класс'],
    city: 'Санкт-Петербург',
    bio: 'Ученица 9 класса, мечтаю поступить в медицинский класс.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    country: 'Россия',
    age: 15
  }
};

// Создаем структуру данных
const serverData = {
  teacherProfiles: testTeacherProfiles,
  studentProfiles: testStudentProfiles,
  overbookingRequests: [],
  timeSlots: [],
  lessons: [],
  chats: [],
  posts: [],
  allUsers: [
    {
      id: 'teacher_1',
      name: 'Анна Петрова',
      email: 'anna.petrova@example.com',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      profile: testTeacherProfiles['teacher_1']
    },
    {
      id: 'teacher_2',
      name: 'Михаил Сидоров',
      email: 'mikhail.sidorov@example.com',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      profile: testTeacherProfiles['teacher_2']
    },
    {
      id: 'teacher_3',
      name: 'Елена Козлова',
      email: 'elena.kozlova@example.com',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      profile: testTeacherProfiles['teacher_3']
    },
    {
      id: 'teacher_4',
      name: 'Дмитрий Волков',
      email: 'dmitry.volkov@example.com',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      profile: testTeacherProfiles['teacher_4']
    },
    {
      id: 'teacher_5',
      name: 'Ольга Морозова',
      email: 'olga.morozova@example.com',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      profile: testTeacherProfiles['teacher_5']
    },
    {
      id: 'student_1',
      name: 'Алексей Иванов',
      email: 'alexey.ivanov@example.com',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      profile: testStudentProfiles['student_1']
    },
    {
      id: 'student_2',
      name: 'Мария Сидорова',
      email: 'maria.sidorova@example.com',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      profile: testStudentProfiles['student_2']
    }
  ]
};

// Сохраняем данные в файл
const dataFile = path.join(__dirname, 'server_data.json');
fs.writeFileSync(dataFile, JSON.stringify(serverData, null, 2));

console.log('✅ Тестовые данные созданы успешно!');
console.log(`📁 Файл сохранен: ${dataFile}`);
console.log(`👨‍🏫 Преподавателей: ${Object.keys(testTeacherProfiles).length}`);
console.log(`👨‍🎓 Студентов: ${Object.keys(testStudentProfiles).length}`);
console.log(`👥 Всего пользователей: ${serverData.allUsers.length}`);
