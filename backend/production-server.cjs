const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Настройка CORS для всех доменов
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:4173", 
  "https://*.vercel.app",
  "https://*.onrender.com",
  "https://na-uchi.onrender.com",
  "https://tutoring-platform.vercel.app",
  "https://tutoring-platform.onrender.com",
  "https://tutoring-platform-*.onrender.com",
  "https://tutoring-platform-am88.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // Разрешаем запросы без origin (например, мобильные приложения)
    if (!origin) return callback(null, true);
    
    // Проверяем, соответствует ли origin разрешенным доменам
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// Middleware для парсинга JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Создание Socket.IO сервера
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Разрешаем запросы без origin
      if (!origin) return callback(null, true);
      
      // Проверяем, соответствует ли origin разрешенным доменам
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (allowedOrigin.includes('*')) {
          const pattern = allowedOrigin.replace('*', '.*');
          return new RegExp(pattern).test(origin);
        }
        return allowedOrigin === origin;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Функции для работы с данными
const DATA_FILE = path.join(__dirname, 'server_data.json');

function loadServerData() {
  try {
    console.log('Loading server data from:', DATA_FILE);
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      console.log('📊 Загружены данные:');
      console.log(`👨‍🏫 Преподавателей: ${Object.keys(data.teacherProfiles || {}).length}`);
      console.log(`👨‍🎓 Студентов: ${Object.keys(data.studentProfiles || {}).length}`);
      console.log(`📅 Слотов: ${(data.timeSlots || []).length}`);
      console.log(`📚 Уроков: ${(data.lessons || []).length}`);
      return data;
    } else {
      console.log('No server data file found, creating default structure');
      return {
        teacherProfiles: {},
        studentProfiles: {},
        overbookingRequests: [],
        timeSlots: [],
        lessons: [],
        chats: [],
        posts: []
      };
    }
  } catch (error) {
    console.error('Error loading server data:', error);
    return {
      teacherProfiles: {},
      studentProfiles: {},
      overbookingRequests: [],
      timeSlots: [],
      lessons: [],
      chats: [],
      posts: []
    };
  }
}

function saveServerData(data) {
  try {
    const dataToSave = data || {
      teacherProfiles,
      studentProfiles,
      timeSlots,
      lessons,
      chats,
      overbookingRequests,
      posts
    };
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
  } catch (error) {
    console.error('Error saving server data:', error);
  }
}

// Загружаем данные
let {
  teacherProfiles,
  studentProfiles,
  timeSlots,
  lessons,
  chats,
  overbookingRequests,
  posts
} = loadServerData();

// Обслуживание статических файлов фронтенда (если они есть)
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// API endpoints
app.get('/api/teachers', (req, res) => {
  // Собираем преподавателей из teacherProfiles
  const teachers = Object.entries(teacherProfiles).map(([id, profile]) => ({
    id,
    name: profile.name || '',
    avatar: profile.avatar || '',
    profile
  }));
  
  res.json(teachers);
});

app.get('/api/users', (req, res) => {
  try {
    // Получаем пользователей из server_data.json
    const users = [];
    
    // Добавляем преподавателей
    Object.entries(teacherProfiles).forEach(([id, profile]) => {
      users.push({
        id,
        email: profile.email || '',
        name: profile.name || '',
        nickname: profile.nickname || '',
        role: 'teacher',
        phone: profile.phone || '',
        profile: profile
      });
    });
    
    // Добавляем студентов
    Object.entries(studentProfiles).forEach(([id, profile]) => {
      users.push({
        id,
        email: profile.email || '',
        name: profile.name || '',
        nickname: profile.nickname || '',
        role: 'student',
        phone: profile.phone || '',
        profile: profile
      });
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Endpoint для обновления профиля пользователя
app.post('/api/updateProfile', (req, res) => {
  try {
    const { userId, profile, role } = req.body;
    
    if (!userId || !profile || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (role === 'teacher') {
      teacherProfiles[userId] = { ...teacherProfiles[userId], ...profile };
    } else if (role === 'student') {
      studentProfiles[userId] = { ...studentProfiles[userId], ...profile };
    }
    
    // Сохраняем данные
    saveServerData();
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.post('/api/register', (req, res) => {
  try {
    const { email, password, name, nickname, role, phone } = req.body;
    
    // Проверяем обязательные поля
    if (!email || !name || !nickname || !role || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Проверяем уникальность email и nickname
    const allUsers = [];
    Object.entries(teacherProfiles).forEach(([id, profile]) => {
      allUsers.push({ id, email: profile.email, nickname: profile.nickname });
    });
    Object.entries(studentProfiles).forEach(([id, profile]) => {
      allUsers.push({ id, email: profile.email, nickname: profile.nickname });
    });
    
    const emailExists = allUsers.some(user => user.email === email);
    const nicknameExists = allUsers.some(user => user.nickname === nickname);
    
    if (emailExists) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    if (nicknameExists) {
      return res.status(400).json({ error: 'User with this nickname already exists' });
    }
    
    // Создаем нового пользователя
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser = {
      id: userId,
      email,
      name,
      nickname,
      role,
      phone,
      createdAt: new Date().toISOString()
    };
    
    // Сохраняем в соответствующий профиль
    if (role === 'teacher') {
      teacherProfiles[userId] = {
        ...newUser,
        subjects: [],
        grades: [],
        experience: 'beginner',
        hourlyRate: 0,
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
    } else if (role === 'student') {
      studentProfiles[userId] = {
        ...newUser,
        grade: '',
        subjects: [],
        goals: [],
        experience: 'beginner',
        city: '',
        bio: ''
      };
    }
    
    // Сохраняем данные на сервере
    saveServerData({
      teacherProfiles,
      studentProfiles,
      timeSlots,
      lessons,
      chats,
      overbookingRequests,
      posts
    });
    
    // Отправляем уведомление всем подключенным клиентам
    io.emit('userRegistered', newUser);
    
    // Также отправляем обновленные профили в зависимости от роли
    if (role === 'teacher') {
      io.emit('teacherProfiles', teacherProfiles);
    } else if (role === 'student') {
      io.emit('studentProfiles', studentProfiles);
    }
    
    res.status(201).json(newUser);
    
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Ищем в преподавателях
    if (teacherProfiles[id]) {
      return res.json({
        id,
        email: teacherProfiles[id].email || '',
        name: teacherProfiles[id].name || '',
        nickname: teacherProfiles[id].nickname || '',
        role: 'teacher',
        phone: teacherProfiles[id].phone || '',
        profile: teacherProfiles[id]
      });
    }
    
    // Ищем в студентах
    if (studentProfiles[id]) {
      return res.json({
        id,
        email: studentProfiles[id].email || '',
        name: studentProfiles[id].name || '',
        nickname: studentProfiles[id].nickname || '',
        role: 'student',
        phone: studentProfiles[id].phone || '',
        profile: studentProfiles[id]
      });
    }
    
    res.status(404).json({ error: 'User not found' });
    
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// API endpoint для проверки работы сервера
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Nauchi API Server',
    status: 'running',
    connectedClients: io.engine.clientsCount,
    timeSlots: timeSlots.length,
    lessons: lessons.length,
    teachers: Object.keys(teacherProfiles).length,
    students: Object.keys(studentProfiles).length
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Root endpoint for service verification
app.get('/', (req, res) => {
  res.json({ 
    message: 'Nauchi API Server',
    status: 'running',
    note: 'API server is operational',
    connectedClients: io.engine.clientsCount,
    timeSlots: timeSlots.length,
    lessons: lessons.length,
    teachers: Object.keys(teacherProfiles).length,
    students: Object.keys(studentProfiles).length,
    health: '/health',
    apiHealth: '/api/health'
  });
});

// Fallback для SPA - должен быть последним
if (fs.existsSync(distPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// WebSocket обработчики
io.on('connection', (socket) => {
  // Отправляем все профили преподавателей новому клиенту
  socket.emit('teacherProfiles', teacherProfiles);
  
  // Отправляем все профили студентов новому клиенту
  socket.emit('studentProfiles', studentProfiles);
  
  socket.on('disconnect', () => {
    // Клиент отключился
  });
  
  // Обработка регистрации пользователя
  socket.on('userRegistered', (user) => {
    io.emit('userRegistered', user);
  });

  // Обработка обновления профиля ученика
  socket.on('updateStudentProfile', (data) => {
    // data: { studentId, profile }
    if (data && data.studentId && data.profile) {
      studentProfiles[data.studentId] = data.profile;
      saveServerData(); // Сохраняем данные в файл
      // Универсальное событие
      io.emit('profileUpdated', { type: 'student', userId: data.studentId, profile: data.profile });
      // Старое событие для обратной совместимости
      io.emit('studentProfileUpdated', { studentId: data.studentId, profile: data.profile });
      // Отправляем событие регистрации для синхронизации между устройствами
      const userData = {
        id: data.studentId,
        email: data.profile.email || '',
        name: data.profile.name || '',
        nickname: data.profile.nickname || '',
        role: 'student',
        phone: data.profile.phone || '',
        createdAt: data.profile.createdAt || new Date().toISOString()
      };
      io.emit('userRegistered', userData);
    }
  });

  // Обработка обновления профиля преподавателя
  socket.on('updateTeacherProfile', (data) => {
    // data: { teacherId, profile }
    if (data && data.teacherId && data.profile) {
      teacherProfiles[data.teacherId] = data.profile;
      saveServerData(); // Сохраняем данные в файл
      // Универсальное событие
      io.emit('profileUpdated', { type: 'teacher', userId: data.teacherId, profile: data.profile });
      // Старое событие для обратной совместимости
      io.emit('teacherProfileUpdated', { teacherId: data.teacherId, profile: data.profile });
      // Отправляем событие регистрации для синхронизации между устройствами
      const userData = {
        id: data.teacherId,
        email: data.profile.email || '',
        name: data.profile.name || '',
        nickname: data.profile.nickname || '',
        role: 'teacher',
        phone: data.profile.phone || '',
        createdAt: data.profile.createdAt || new Date().toISOString()
      };
      io.emit('userRegistered', userData);
      
      // Отправляем обновленные данные всем клиентам для синхронизации
      io.emit('dataUpdated', {
        type: 'teacherProfileUpdated',
        timeSlots: timeSlots,
        teacherProfiles: teacherProfiles,
        studentProfiles: studentProfiles
      });
    }
  });

  // Обработка создания нового слота
  socket.on('createSlot', (newSlot) => {
    console.log('Creating new slot:', newSlot);
    
    // Проверяем, не существует ли уже слот с таким ID
    const existingSlotIndex = timeSlots.findIndex(slot => slot.id === newSlot.id);
    if (existingSlotIndex !== -1) {
      // Обновляем существующий слот
      timeSlots[existingSlotIndex] = { ...timeSlots[existingSlotIndex], ...newSlot };
    } else {
      // Добавляем новый слот
      timeSlots.push(newSlot);
    }
    
    // Сохраняем данные в файл
    saveServerData();
    
    // Отправляем новый слот всем подключенным клиентам
    io.emit('slotCreated', newSlot);
    
    // Отправляем обновленные данные всем клиентам для синхронизации
    io.emit('dataUpdated', {
      type: 'slotCreated',
      timeSlots: timeSlots,
      teacherProfiles: teacherProfiles,
      studentProfiles: studentProfiles
    });
  });

  // Обработка бронирования слота
  socket.on('bookSlot', (data) => {
    const { slotId, lesson, bookedStudentId } = data;
    console.log('Booking slot:', data);
    
    // Обновляем статус слота и устанавливаем bookedStudentId
    const slotIndex = timeSlots.findIndex(slot => slot.id === slotId);
    if (slotIndex !== -1) {
      timeSlots[slotIndex].isBooked = true;
      timeSlots[slotIndex].bookedStudentId = bookedStudentId || lesson.studentId;
    }
    
    // Добавляем урок
    lessons.push(lesson);
    
    // Сохраняем данные в файл
    saveServerData();
    
    // Отправляем обновление всем клиентам
    io.emit('slotBooked', data);
    
    // Отправляем обновленные данные всем клиентам для синхронизации
    io.emit('dataUpdated', {
      type: 'slotBooked',
      timeSlots: timeSlots,
      lessons: lessons,
      teacherProfiles: teacherProfiles,
      studentProfiles: studentProfiles
    });
  });

  // Обработка отмены бронирования
  socket.on('cancelSlot', (data) => {
    const { slotId, lessonId } = data;
    console.log('Cancelling slot:', data);
    
    // Обновляем статус слота и очищаем bookedStudentId
    const slotIndex = timeSlots.findIndex(slot => slot.id === slotId);
    if (slotIndex !== -1) {
      timeSlots[slotIndex].isBooked = false;
      timeSlots[slotIndex].bookedStudentId = undefined;
    }
    
    // Удаляем урок
    const lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId);
    if (lessonIndex !== -1) {
      lessons.splice(lessonIndex, 1);
    }
    
    // Сохраняем данные в файл
    saveServerData();
    
    // Отправляем обновление всем клиентам
    io.emit('slotCancelled', data);
    
    // Отправляем обновленные данные всем клиентам для синхронизации
    io.emit('dataUpdated', {
      type: 'slotCancelled',
      timeSlots: timeSlots,
      lessons: lessons,
      teacherProfiles: teacherProfiles,
      studentProfiles: studentProfiles
    });
  });

  // Обработка удаления слота
  socket.on('deleteSlot', (data) => {
    const { slotId } = data;
    console.log('Deleting slot:', slotId);
    
    // Удаляем слот
    const slotIndex = timeSlots.findIndex(slot => slot.id === slotId);
    if (slotIndex !== -1) {
      timeSlots.splice(slotIndex, 1);
    }
    
    // Сохраняем данные в файл
    saveServerData();
    
    // Отправляем обновление всем клиентам
    io.emit('slotDeleted', { slotId });
    
    // Отправляем обновленные данные всем клиентам для синхронизации
    io.emit('dataUpdated', {
      type: 'slotDeleted',
      timeSlots: timeSlots,
      teacherProfiles: teacherProfiles,
      studentProfiles: studentProfiles
    });
  });

  // Обработка завершения урока
  socket.on('lessonCompleted', (data) => {
    const { lessonId } = data;
    console.log('Completing lesson:', lessonId);
    
    // Обновляем статус урока
    const lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId);
    if (lessonIndex !== -1) {
      lessons[lessonIndex].status = 'completed';
    }
    
    // Сохраняем данные в файл
    saveServerData();
    
    // Отправляем обновление всем клиентам
    io.emit('lessonCompleted', { lessonId });
    
    // Отправляем обновленные данные всем клиентам для синхронизации
    io.emit('dataUpdated', {
      type: 'lessonCompleted',
      timeSlots: timeSlots,
      lessons: lessons,
      teacherProfiles: teacherProfiles,
      studentProfiles: studentProfiles
    });
  });

  // Обработка запроса всех слотов
  socket.on('requestAllSlots', () => {
    console.log('Sending all slots to client');
    socket.emit('allSlots', timeSlots);
  });

  // Обработка запроса всех уроков
  socket.on('requestAllLessons', () => {
    console.log('Sending all lessons to client');
    socket.emit('allLessons', lessons);
  });
});

// Запуск сервера
const PORT = process.env.PORT || 10000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Nauchi API server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check available at: http://${HOST}:${PORT}/api/health`);
  console.log(`🔍 Root endpoint: http://${HOST}:${PORT}/`);
  console.log(`📁 Dist path: ${distPath} (exists: ${fs.existsSync(distPath)})`);
});