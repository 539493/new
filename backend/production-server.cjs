const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Environment variables
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DEBUG = !IS_PRODUCTION;

// Logging helper - уменьшаем логирование в production
const log = (message, ...args) => {
  if (DEBUG) {
    console.log(message, ...args);
  }
};

// Настройка CORS - упрощенная версия
const allowedOrigins = [
  "https://na-uchi.onrender.com",
  "https://nauchi.onrender.com",
  "https://nauchi.netlify.app",
  "https://*.netlify.app"
];

// Кэш для CORS проверок
const corsCache = new Map();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Проверяем кэш
    if (corsCache.has(origin)) {
      return callback(null, corsCache.get(origin));
    }
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowedOrigin === origin;
    });
    
    corsCache.set(origin, isAllowed);
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// Middleware для парсинга JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Кэш для API ответов
const apiCache = new Map();
const CACHE_TTL = 30000; // 30 секунд

// Функция для кэширования
const getCachedResponse = (key) => {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  apiCache.delete(key);
  return null;
};

const setCachedResponse = (key, data) => {
  apiCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Создание Socket.IO сервера с оптимизированными настройками
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      if (corsCache.has(origin)) {
        return callback(null, corsCache.get(origin));
      }
      
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (allowedOrigin.includes('*')) {
          const pattern = allowedOrigin.replace('*', '.*');
          return new RegExp(pattern).test(origin);
        }
        return allowedOrigin === origin;
      });
      
      corsCache.set(origin, isAllowed);
      callback(null, isAllowed);
    },
    credentials: true,
    methods: ["GET", "POST"]
  },
  pingTimeout: 120000, // Увеличиваем timeout
  pingInterval: 60000, // Увеличиваем интервал
  maxHttpBufferSize: 1e6, // 1MB лимит
  allowEIO3: true
});

// Загрузка данных сервера
let serverData = {
  teacherProfiles: {},
  studentProfiles: {},
  timeSlots: [],
  lessons: [],
  chats: [],
  overbookingRequests: [],
  posts: [],
  notifications: []
};

const dataFilePath = path.join(__dirname, 'server_data.json');

// Асинхронная загрузка данных
const loadServerData = async () => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    const parsedData = JSON.parse(data);
    
    // Инициализируем данные с правильной структурой
    serverData = {
      teacherProfiles: parsedData.teacherProfiles && typeof parsedData.teacherProfiles === 'object' ? parsedData.teacherProfiles : {},
      studentProfiles: parsedData.studentProfiles && typeof parsedData.studentProfiles === 'object' ? parsedData.studentProfiles : {},
      timeSlots: Array.isArray(parsedData.timeSlots) ? parsedData.timeSlots : [],
      lessons: Array.isArray(parsedData.lessons) ? parsedData.lessons : [],
      chats: Array.isArray(parsedData.chats) ? parsedData.chats : [],
      overbookingRequests: Array.isArray(parsedData.overbookingRequests) ? parsedData.overbookingRequests : [],
      posts: Array.isArray(parsedData.posts) ? parsedData.posts : [],
      notifications: Array.isArray(parsedData.notifications) ? parsedData.notifications : []
    };
    
    log('Server data loaded successfully');
  } catch (error) {
    log('Error loading server data:', error.message);
    // Создаем файл с начальными данными
    await saveServerData();
  }
};

// Дебаунсинг для сохранения данных
let saveTimeout = null;
const saveServerData = async () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(async () => {
    try {
      await fs.writeFile(dataFilePath, JSON.stringify(serverData, null, 2));
      log('Server data saved successfully');
    } catch (error) {
      console.error('Error saving server data:', error);
    }
  }, 1000); // Дебаунсинг 1 секунда
};

// Статистика сервера
const getServerStats = () => {
  return {
    teacherProfilesCount: Object.keys(serverData.teacherProfiles).length,
    studentProfilesCount: Object.keys(serverData.studentProfiles).length,
    timeSlotsCount: serverData.timeSlots.length,
    lessonsCount: serverData.lessons.length,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };
};

// Health check endpoint
app.get('/health', (req, res) => {
  const stats = getServerStats();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    ...stats
  });
});

// API endpoints с кэшированием
app.get('/api/stats', (req, res) => {
  const cacheKey = 'stats';
  const cached = getCachedResponse(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  const stats = getServerStats();
  setCachedResponse(cacheKey, stats);
  res.json(stats);
});

// Получение всех преподавателей
app.get('/api/teachers', (req, res) => {
  const cacheKey = 'teachers';
  const cached = getCachedResponse(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  const teachers = Object.entries(serverData.teacherProfiles).map(([id, profile]) => ({
    id,
    ...profile
  }));
  
  setCachedResponse(cacheKey, teachers);
  res.json(teachers);
});

// Получение всех студентов
app.get('/api/students', (req, res) => {
  const cacheKey = 'students';
  const cached = getCachedResponse(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  const students = Object.entries(serverData.studentProfiles).map(([id, profile]) => ({
    id,
    ...profile
  }));
  
  setCachedResponse(cacheKey, students);
  res.json(students);
});

// Получение всех слотов
app.get('/api/timeslots', (req, res) => {
  const cacheKey = 'timeslots';
  const cached = getCachedResponse(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  setCachedResponse(cacheKey, serverData.timeSlots);
  res.json(serverData.timeSlots);
});

// Получение всех уроков
app.get('/api/lessons', (req, res) => {
  const cacheKey = 'lessons';
  const cached = getCachedResponse(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  setCachedResponse(cacheKey, serverData.lessons);
  res.json(serverData.lessons);
});

// --- Доп. endpoints для совместимости с фронтендом ---

// Синхронизация всех основных данных
app.get('/api/sync', (req, res) => {
  try {
    res.json({
      timeSlots: serverData.timeSlots,
      teacherProfiles: serverData.teacherProfiles,
      studentProfiles: serverData.studentProfiles,
      lessons: serverData.lessons,
      chats: serverData.chats || [],
      posts: serverData.posts || [],
      overbookingRequests: serverData.overbookingRequests || []
    });
  } catch (error) {
    console.error('Error in /api/sync:', error);
    res.status(500).json({ error: 'Failed to sync data' });
  }
});

// Регистрация пользователя (ученик/преподаватель)
app.post('/api/register', async (req, res) => {
  try {
    const { email, name, nickname, role, phone } = req.body || {};
    if (!email || !name || !nickname || !role || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Проверяем уникальность email и nickname
    const allUsers = [
      ...Object.entries(serverData.teacherProfiles).map(([id, profile]) => ({ id, email: profile.email, nickname: profile.nickname })),
      ...Object.entries(serverData.studentProfiles).map(([id, profile]) => ({ id, email: profile.email, nickname: profile.nickname }))
    ];
    if (allUsers.some(u => u.email === email)) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    if (allUsers.some(u => u.nickname === nickname)) {
      return res.status(400).json({ error: 'User with this nickname already exists' });
    }

    const id = Date.now().toString();
    const baseUser = { id, email, name, nickname, role, phone, createdAt: new Date().toISOString() };

    if (role === 'teacher') {
      serverData.teacherProfiles[id] = {
        ...baseUser,
        subjects: [],
        grades: [],
        experience: 'experienced',
        hourlyRate: 1500,
        country: '',
        city: '',
        bio: '',
        avatar: '',
        rating: 0,
        lessonsCount: 0,
        studentsCount: 0,
        offlineAvailable: false,
        overbookingEnabled: true
      };
    } else {
      serverData.studentProfiles[id] = {
        ...baseUser,
        grade: '',
        subjects: [],
        goals: [],
        experience: 'beginner',
        city: '',
        school: '',
        bio: '',
        avatar: ''
      };
    }

    await saveServerData();

    // Сообщаем через WebSocket
    io.emit('userRegistered', baseUser);

    res.status(201).json(baseUser);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Обновление профиля пользователя (универсально)
app.post('/api/updateProfile', async (req, res) => {
  try {
    const { userId, profileData, role } = req.body || {};
    if (!userId || !profileData || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (role === 'teacher') {
      if (!serverData.teacherProfiles[userId]) return res.status(404).json({ error: 'Teacher profile not found' });
      serverData.teacherProfiles[userId] = { ...serverData.teacherProfiles[userId], ...profileData };
    } else if (role === 'student') {
      if (!serverData.studentProfiles[userId]) return res.status(404).json({ error: 'Student profile not found' });
      serverData.studentProfiles[userId] = { ...serverData.studentProfiles[userId], ...profileData };
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await saveServerData();
    io.emit('profileUpdated', { id: userId, role, profile: role === 'teacher' ? serverData.teacherProfiles[userId] : serverData.studentProfiles[userId] });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Список пользователей (для отображения зарегистрированных преподавателей)
app.get('/api/users', (req, res) => {
  try {
    const users = [];
    Object.entries(serverData.teacherProfiles).forEach(([id, profile]) => {
      users.push({ id, email: profile.email || '', name: profile.name || '', nickname: profile.nickname || '', role: 'teacher', phone: profile.phone || '', profile });
    });
    Object.entries(serverData.studentProfiles).forEach(([id, profile]) => {
      users.push({ id, email: profile.email || '', name: profile.name || '', nickname: profile.nickname || '', role: 'student', phone: profile.phone || '', profile });
    });
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Один пользователь по ID
app.get('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (serverData.teacherProfiles[id]) {
      const p = serverData.teacherProfiles[id];
      return res.json({ id, email: p.email || '', name: p.name || '', nickname: p.nickname || '', role: 'teacher', phone: p.phone || '', profile: p });
    }
    if (serverData.studentProfiles[id]) {
      const p = serverData.studentProfiles[id];
      return res.json({ id, email: p.email || '', name: p.name || '', nickname: p.nickname || '', role: 'student', phone: p.phone || '', profile: p });
    }
    res.status(404).json({ error: 'User not found' });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Удаление пользователя (совместимо с вызовом фронта)
app.delete('/api/delete-user', async (req, res) => {
  try {
    const { userId, role } = req.body || {};
    if (!userId || !role) return res.status(400).json({ error: 'Missing required fields' });

    let deleted = null;
    if (role === 'teacher' && serverData.teacherProfiles[userId]) {
      deleted = { id: userId, ...serverData.teacherProfiles[userId] };
      delete serverData.teacherProfiles[userId];
    } else if (role === 'student' && serverData.studentProfiles[userId]) {
      deleted = { id: userId, ...serverData.studentProfiles[userId] };
      delete serverData.studentProfiles[userId];
    } else {
      return res.status(404).json({ error: 'User not found' });
    }

    // Чистим связанные сущности по пользователю
    serverData.timeSlots = serverData.timeSlots.filter(ts => ts.teacherId !== userId);
    serverData.lessons = serverData.lessons.filter(l => l.teacherId !== userId && l.studentId !== userId);
    serverData.chats = (serverData.chats || []).filter(c => !c.participants || !c.participants.includes(userId));
    serverData.posts = (serverData.posts || []).filter(p => p.userId !== userId);
    serverData.notifications = (serverData.notifications || []).filter(n => n.userId !== userId);

    await saveServerData();
    io.emit('userDeleted', { userId, userRole: role });
    res.json({ success: true, deletedUser: deleted });
  } catch (error) {
    console.error('Error delete-user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Получение преподавателя по ID
app.get('/api/teachers/:id', (req, res) => {
  const { id } = req.params;
  const teacher = serverData.teacherProfiles[id];
  
  if (!teacher) {
    return res.status(404).json({ error: 'Teacher not found' });
  }
  
  res.json({ id, ...teacher });
});

// Получение студента по ID
app.get('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const student = serverData.studentProfiles[id];
  
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  res.json({ id, ...student });
});

// POST endpoints
app.post('/api/teachers', async (req, res) => {
  try {
    const teacherData = req.body;
    const id = teacherData.id || Date.now().toString();
    
    serverData.teacherProfiles[id] = teacherData;
    await saveServerData();
    
    // Очищаем кэш
    apiCache.delete('teachers');
    apiCache.delete('stats');
    
    io.emit('teacherAdded', { id, ...teacherData });
    res.json({ id, ...teacherData });
  } catch (error) {
    console.error('Error adding teacher:', error);
    res.status(500).json({ error: 'Failed to add teacher' });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const studentData = req.body;
    const id = studentData.id || Date.now().toString();
    
    serverData.studentProfiles[id] = studentData;
    await saveServerData();
    
    // Очищаем кэш
    apiCache.delete('students');
    apiCache.delete('stats');
    
    io.emit('studentAdded', { id, ...studentData });
    res.json({ id, ...studentData });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

app.post('/api/timeslots', async (req, res) => {
  try {
    const timeSlot = req.body;
    timeSlot.id = timeSlot.id || Date.now().toString();
    serverData.timeSlots.push(timeSlot);
    await saveServerData();
    
    // Очищаем кэш
    apiCache.delete('timeslots');
    apiCache.delete('stats');
    
    io.emit('timeSlotAdded', timeSlot);
    res.json(timeSlot);
  } catch (error) {
    console.error('Error adding time slot:', error);
    res.status(500).json({ error: 'Failed to add time slot' });
  }
});

app.post('/api/lessons', async (req, res) => {
  try {
    const lesson = req.body;
    lesson.id = lesson.id || Date.now().toString();
    serverData.lessons.push(lesson);
    await saveServerData();
    
    // Очищаем кэш
    apiCache.delete('lessons');
    apiCache.delete('stats');
    
    io.emit('lessonAdded', lesson);
    res.json(lesson);
  } catch (error) {
    console.error('Error adding lesson:', error);
    res.status(500).json({ error: 'Failed to add lesson' });
  }
});

// PUT endpoints
app.put('/api/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTeacher = req.body;
    
    if (!serverData.teacherProfiles[id]) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    serverData.teacherProfiles[id] = { ...updatedTeacher, id };
    await saveServerData();
    
    // Очищаем кэш
    apiCache.delete('teachers');
    apiCache.delete('stats');
    
    io.emit('teacherUpdated', { id, ...serverData.teacherProfiles[id] });
    res.json({ id, ...serverData.teacherProfiles[id] });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ error: 'Failed to update teacher' });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStudent = req.body;
    
    if (!serverData.studentProfiles[id]) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    serverData.studentProfiles[id] = { ...updatedStudent, id };
    await saveServerData();
    
    // Очищаем кэш
    apiCache.delete('students');
    apiCache.delete('stats');
    
    io.emit('studentUpdated', { id, ...serverData.studentProfiles[id] });
    res.json({ id, ...serverData.studentProfiles[id] });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

app.put('/api/timeslots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTimeSlot = req.body;
    
    const index = serverData.timeSlots.findIndex(ts => ts.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Time slot not found' });
    }
    
    serverData.timeSlots[index] = { ...updatedTimeSlot, id };
    await saveServerData();
    
    // Очищаем кэш
    apiCache.delete('timeslots');
    apiCache.delete('stats');
    
    io.emit('timeSlotUpdated', serverData.timeSlots[index]);
    res.json(serverData.timeSlots[index]);
  } catch (error) {
    console.error('Error updating time slot:', error);
    res.status(500).json({ error: 'Failed to update time slot' });
  }
});

app.put('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLesson = req.body;
    
    const index = serverData.lessons.findIndex(l => l.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    serverData.lessons[index] = { ...updatedLesson, id };
    await saveServerData();
    
    // Очищаем кэш
    apiCache.delete('lessons');
    apiCache.delete('stats');
    
    io.emit('lessonUpdated', serverData.lessons[index]);
    res.json(serverData.lessons[index]);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// DELETE endpoints
app.delete('/api/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!serverData.teacherProfiles[id]) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    const deletedTeacher = { id, ...serverData.teacherProfiles[id] };
    delete serverData.teacherProfiles[id];
    await saveServerData();
    
    // Очищаем кэш
    apiCache.delete('teachers');
    apiCache.delete('stats');
    
    io.emit('teacherDeleted', id);
    res.json(deletedTeacher);
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!serverData.studentProfiles[id]) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const deletedStudent = { id, ...serverData.studentProfiles[id] };
    delete serverData.studentProfiles[id];
    await saveServerData();
    
    // Очищаем кэш
    apiCache.delete('students');
    apiCache.delete('stats');
    
    io.emit('studentDeleted', id);
    res.json(deletedStudent);
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

app.delete('/api/timeslots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const index = serverData.timeSlots.findIndex(ts => ts.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Time slot not found' });
    }
    
    const deletedTimeSlot = serverData.timeSlots.splice(index, 1)[0];
    await saveServerData();
    
    // Очищаем кэш
    apiCache.delete('timeslots');
    apiCache.delete('stats');
    
    io.emit('timeSlotDeleted', id);
    res.json(deletedTimeSlot);
  } catch (error) {
    console.error('Error deleting time slot:', error);
    res.status(500).json({ error: 'Failed to delete time slot' });
  }
});

app.delete('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const index = serverData.lessons.findIndex(l => l.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    const deletedLesson = serverData.lessons.splice(index, 1)[0];
    await saveServerData();
    
    // Очищаем кэш
    apiCache.delete('lessons');
    apiCache.delete('stats');
    
    io.emit('lessonDeleted', id);
    res.json(deletedLesson);
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// Статические файлы
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath, {
  maxAge: IS_PRODUCTION ? '1d' : 0,
  etag: true,
  lastModified: true
}));

// Fallback для SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Socket.IO обработчики
io.on('connection', (socket) => {
  log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    log('Client disconnected:', socket.id);
  });
  
  // Обработчики для real-time обновлений
  socket.on('joinRoom', (room) => {
    socket.join(room);
    log('Client joined room:', room);
  });
  
  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    log('Client left room:', room);
  });

  // Обработчик обновления профиля студента
  socket.on('updateStudentProfile', (data) => {
    log('Received updateStudentProfile:', data);
    if (data && data.studentId && data.profile) {
      serverData.studentProfiles[data.studentId] = data.profile;
      saveServerData();
      
      // Отправляем обновление всем клиентам
      io.emit('studentProfileUpdated', { studentId: data.studentId, profile: data.profile });
      io.emit('profileUpdated', { type: 'student', userId: data.studentId, profile: data.profile });
      
      log('Student profile updated and broadcasted');
    }
  });

  // Обработчик обновления профиля преподавателя
  socket.on('updateTeacherProfile', (data) => {
    log('Received updateTeacherProfile:', data);
    if (data && data.teacherId && data.profile) {
      serverData.teacherProfiles[data.teacherId] = data.profile;
      saveServerData();
      
      // Отправляем обновление всем клиентам
      io.emit('teacherProfileUpdated', { teacherId: data.teacherId, profile: data.profile });
      io.emit('profileUpdated', { type: 'teacher', userId: data.teacherId, profile: data.profile });
      
      log('Teacher profile updated and broadcasted');
    }
  });

  // Обработчик создания слота
  socket.on('createSlot', (data) => {
    log('Received createSlot:', data);
    if (data) {
      const slot = { ...data, id: Date.now().toString() };
      serverData.timeSlots.push(slot);
      saveServerData();
      
      io.emit('slotCreated', slot);
      log('Slot created and broadcasted');
    }
  });

  // Обработчик бронирования урока
  socket.on('bookLesson', (data) => {
    log('Received bookLesson:', data);
    if (data && data.slotId && data.studentId) {
      const slotIndex = serverData.timeSlots.findIndex(slot => slot.id === data.slotId);
      if (slotIndex !== -1) {
        serverData.timeSlots[slotIndex].isBooked = true;
        serverData.timeSlots[slotIndex].studentId = data.studentId;
        serverData.timeSlots[slotIndex].studentName = data.studentName;
        
        const lesson = {
          id: Date.now().toString(),
          slotId: data.slotId,
          teacherId: serverData.timeSlots[slotIndex].teacherId,
          teacherName: serverData.timeSlots[slotIndex].teacherName,
          studentId: data.studentId,
          studentName: data.studentName,
          subject: serverData.timeSlots[slotIndex].subject,
          date: serverData.timeSlots[slotIndex].date,
          startTime: serverData.timeSlots[slotIndex].startTime,
          endTime: serverData.timeSlots[slotIndex].endTime,
          price: serverData.timeSlots[slotIndex].price,
          status: 'scheduled',
          comment: data.comment || ''
        };
        
        serverData.lessons.push(lesson);
        saveServerData();
        
        io.emit('lessonBooked', lesson);
        log('Lesson booked and broadcasted');
      }
    }
  });

  // Обработчик завершения урока
  socket.on('lessonCompleted', (data) => {
    log('Received lessonCompleted:', data);
    if (data && data.lessonId) {
      const lessonIndex = serverData.lessons.findIndex(lesson => lesson.id === data.lessonId);
      if (lessonIndex !== -1) {
        serverData.lessons[lessonIndex].status = 'completed';
        saveServerData();
        
        io.emit('lessonCompleted', { lessonId: data.lessonId });
        log('Lesson completed and broadcasted');
      }
    }
  });

  // Обработчик удаления слота
  socket.on('deleteSlot', (data) => {
    log('Received deleteSlot:', data);
    if (data && data.slotId) {
      const slotIndex = serverData.timeSlots.findIndex(slot => slot.id === data.slotId);
      if (slotIndex !== -1) {
        serverData.timeSlots.splice(slotIndex, 1);
        saveServerData();
        
        io.emit('slotDeleted', { slotId: data.slotId });
        log('Slot deleted and broadcasted');
      }
    }
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  log(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    log('HTTP server closed');
    process.exit(0);
  });
  
  // Принудительное завершение через 10 секунд
  setTimeout(() => {
    console.error('Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Запуск сервера
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    await loadServerData();
    
    server.listen(PORT, HOST, () => {
      console.log(` Сервер запущен на http://${HOST}:${PORT}`);
      
      if (DEBUG) {
        const stats = getServerStats();
        console.log(' Статистика сервера:');
        console.log(`    Преподавателей: ${stats.teacherProfilesCount}`);
        console.log(`    Студентов: ${stats.studentProfilesCount}`);
        console.log(`    Слотов: ${stats.timeSlotsCount}`);
        console.log(`    Уроков: ${stats.lessonsCount}`);
      }
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
