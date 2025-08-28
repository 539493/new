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
  "https://tutoring-platform-*.onrender.com"
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
      console.log('Blocked origin:', origin);
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
        console.log('Socket.IO blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Функции для работы с данными
const DATA_FILE = path.join(__dirname, 'server_data.json');
const INITIAL_DATA_FILE = path.join(__dirname, 'initial-data.json');

function loadServerData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      console.log('Loaded server data from file');
      
      // Если нет преподавателей в сохраненных данных, загружаем из initial-data.json
      if (!data.teacherProfiles || Object.keys(data.teacherProfiles).length === 0) {
        console.log('No teacher profiles found in server data, loading from initial-data.json');
        if (fs.existsSync(INITIAL_DATA_FILE)) {
          const initialData = JSON.parse(fs.readFileSync(INITIAL_DATA_FILE, 'utf8'));
          data.teacherProfiles = initialData.teacherProfiles || {};
          data.studentProfiles = initialData.studentProfiles || {};
          data.timeSlots = initialData.timeSlots || [];
          console.log('Loaded initial data:', {
            teachers: Object.keys(data.teacherProfiles).length,
            students: Object.keys(data.studentProfiles).length,
            slots: data.timeSlots.length
          });
        }
      }
      
      return data;
    } else {
      console.log('No server data file found, creating new one');
      const initialData = JSON.parse(fs.readFileSync(INITIAL_DATA_FILE, 'utf8'));
      saveServerData(initialData);
      return initialData;
    }
  } catch (error) {
    console.error('Error loading server data:', error);
    return {
      teacherProfiles: {},
      studentProfiles: {},
      timeSlots: [],
      lessons: [],
      chats: [],
      overbookingRequests: [],
      posts: [],
      notifications: []
    };
  }
}

function saveServerData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('Server data saved to file');
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
  posts,
  notifications
} = loadServerData();

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
      posts,
      notifications
    });
    
    // Отправляем уведомление всем подключенным клиентам
    io.emit('userRegistered', newUser);
    
    console.log('New user registered:', newUser);
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

// Простой endpoint для проверки работы сервера
app.get('/', (req, res) => {
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

// Обслуживание статических файлов фронтенда (если они есть)
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // Fallback для SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// WebSocket обработчики
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Обработка регистрации пользователя
  socket.on('userRegistered', (user) => {
    io.emit('userRegistered', user);
  });
});

// Запуск сервера
const PORT = process.env.PORT || 10000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Nauchi API server running on port ${PORT}`);
  console.log(`📡 Server accessible at:`);
  console.log(`  - Local: http://localhost:${PORT}`);
  console.log(`  - Network: http://${HOST}:${PORT}`);
  console.log(`  - Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  - CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`  - Teachers: ${Object.keys(teacherProfiles).length}`);
  console.log(`  - Students: ${Object.keys(studentProfiles).length}`);
}); 