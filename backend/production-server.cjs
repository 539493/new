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
  "https://na-uchi.onrender.com",
  "https://nauchi.netlify.app",
  "https://*.netlify.app",
  "https://*.vercel.app"
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
      
      console.log('🔍 Socket.IO CORS check for origin:', origin);
      
      // Проверяем, соответствует ли origin разрешенным доменам
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (allowedOrigin.includes('*')) {
          const pattern = allowedOrigin.replace('*', '.*');
          return new RegExp(pattern).test(origin);
        }
        return allowedOrigin === origin;
      });
      
      console.log('✅ Socket.IO CORS allowed:', isAllowed);
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('❌ Socket.IO CORS rejected for:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
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
        posts: [],
        notifications: []
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
      posts: [],
      notifications: []
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
      posts,
      notifications
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
  posts,
  notifications
} = loadServerData();

// Инициализируем уведомления, если их нет
if (!notifications) {
  notifications = [];
}

// Обслуживание статических файлов фронтенда (если они есть)
const distPath = path.join(__dirname, '..', 'dist');
console.log('🔍 Проверка dist директории:', distPath);
console.log('📁 Dist существует:', fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
  console.log('📂 Содержимое dist:', fs.readdirSync(distPath));
  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));
  console.log('✅ Статические файлы настроены');
} else {
  console.log('⚠️ Dist директория не найдена, статические файлы не будут обслуживаться');
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
    
    // Отправляем обновленные данные всем клиентам для синхронизации
    io.emit('dataUpdated', {
      type: 'userRegistered',
      timeSlots: timeSlots,
      teacherProfiles: teacherProfiles,
      studentProfiles: studentProfiles
    });
    
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

// Endpoint для удаления пользователя
app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deleting user with ID: ${id}`);
    
    let deletedUser = null;
    let userRole = null;
    
    // Ищем и удаляем из преподавателей
    if (teacherProfiles[id]) {
      deletedUser = teacherProfiles[id];
      userRole = 'teacher';
      delete teacherProfiles[id];
      console.log(`👨‍🏫 Deleted teacher: ${deletedUser.name} (${id})`);
    }
    
    // Ищем и удаляем из студентов
    if (studentProfiles[id]) {
      deletedUser = studentProfiles[id];
      userRole = 'student';
      delete studentProfiles[id];
      console.log(`👨‍🎓 Deleted student: ${deletedUser.name} (${id})`);
    }
    
    if (!deletedUser) {
      console.log(`❌ User with ID ${id} not found`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Удаляем связанные данные
    // Удаляем слоты времени пользователя
    const userSlots = timeSlots.filter(slot => slot.teacherId === id);
    timeSlots = timeSlots.filter(slot => slot.teacherId !== id);
    console.log(`📅 Deleted ${userSlots.length} time slots for user ${id}`);
    
    // Удаляем уроки пользователя
    const userLessons = lessons.filter(lesson => 
      lesson.teacherId === id || lesson.studentId === id
    );
    lessons = lessons.filter(lesson => 
      lesson.teacherId !== id && lesson.studentId !== id
    );
    console.log(`📚 Deleted ${userLessons.length} lessons for user ${id}`);
    
    // Удаляем чаты пользователя
    const userChats = chats.filter(chat => 
      chat.participants.includes(id)
    );
    chats = chats.filter(chat => 
      !chat.participants.includes(id)
    );
    console.log(`💬 Deleted ${userChats.length} chats for user ${id}`);
    
    // Удаляем посты пользователя
    const userPosts = posts.filter(post => post.userId === id);
    posts = posts.filter(post => post.userId !== id);
    console.log(`📝 Deleted ${userPosts.length} posts for user ${id}`);
    
    // Удаляем уведомления пользователя
    const userNotifications = notifications.filter(notification => 
      notification.userId === id
    );
    notifications = notifications.filter(notification => 
      notification.userId !== id
    );
    console.log(`🔔 Deleted ${userNotifications.length} notifications for user ${id}`);
    
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
    io.emit('userDeleted', {
      userId: id,
      userRole: userRole,
      deletedUser: deletedUser,
      deletedData: {
        slots: userSlots.length,
        lessons: userLessons.length,
        chats: userChats.length,
        posts: userPosts.length,
        notifications: userNotifications.length
      }
    });
    
    // Отправляем обновленные данные всем клиентам для синхронизации
    io.emit('dataUpdated', {
      type: 'userDeleted',
      timeSlots: timeSlots,
      lessons: lessons,
      chats: chats,
      posts: posts,
      notifications: notifications,
      teacherProfiles: teacherProfiles,
      studentProfiles: studentProfiles
    });
    
    console.log(`✅ User ${id} deleted successfully`);
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: {
        id,
        name: deletedUser.name,
        role: userRole,
        deletedData: {
          slots: userSlots.length,
          lessons: userLessons.length,
          chats: userChats.length,
          posts: userPosts.length,
          notifications: userNotifications.length
        }
      }
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Endpoint для загрузки локальных данных на сервер
app.post('/api/upload-local-data', (req, res) => {
  try {
    const { teacherProfiles: localTeachers, studentProfiles: localStudents, users: localUsers } = req.body;
    
    console.log('📤 Получены локальные данные для загрузки:');
    console.log(`   👨‍🏫 Преподаватели: ${Object.keys(localTeachers || {}).length}`);
    console.log(`   👨‍🎓 Студенты: ${Object.keys(localStudents || {}).length}`);
    console.log(`   👥 Пользователи: ${(localUsers || []).length}`);
    
    let uploadedCount = 0;
    let skippedCount = 0;
    
    // Загружаем локальных преподавателей
    if (localTeachers && typeof localTeachers === 'object') {
      Object.entries(localTeachers).forEach(([id, profile]) => {
        if (!teacherProfiles[id]) {
          teacherProfiles[id] = profile;
          uploadedCount++;
          console.log(`✅ Загружен преподаватель: ${profile.name || id}`);
        } else {
          skippedCount++;
          console.log(`⏭️ Преподаватель уже существует: ${profile.name || id}`);
        }
      });
    }
    
    // Загружаем локальных студентов
    if (localStudents && typeof localStudents === 'object') {
      Object.entries(localStudents).forEach(([id, profile]) => {
        if (!studentProfiles[id]) {
          studentProfiles[id] = profile;
          uploadedCount++;
          console.log(`✅ Загружен студент: ${profile.name || id}`);
        } else {
          skippedCount++;
          console.log(`⏭️ Студент уже существует: ${profile.name || id}`);
        }
      });
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
    io.emit('dataUpdated', {
      type: 'localDataUploaded',
      timeSlots: timeSlots,
      teacherProfiles: teacherProfiles,
      studentProfiles: studentProfiles
    });
    
    // Отправляем обновленные профили
    io.emit('teacherProfiles', teacherProfiles);
    io.emit('studentProfiles', studentProfiles);
    
    console.log(`🎉 Загрузка завершена: ${uploadedCount} новых, ${skippedCount} пропущено`);
    
    res.json({
      success: true,
      message: 'Локальные данные успешно загружены на сервер',
      uploaded: uploadedCount,
      skipped: skippedCount,
      totalTeachers: Object.keys(teacherProfiles).length,
      totalStudents: Object.keys(studentProfiles).length
    });
    
  } catch (error) {
    console.error('❌ Ошибка загрузки локальных данных:', error);
    res.status(500).json({ 
      error: 'Failed to upload local data',
      details: error.message 
    });
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
    version: '1.0.0',
    socketConnections: io.engine.clientsCount,
    transports: io.engine.clientsCount > 0 ? Object.keys(io.engine.clients) : []
  });
});

// Socket.IO connection test endpoint
app.get('/api/socket-test', (req, res) => {
  res.json({
    status: 'socket_available',
    connections: io.engine.clientsCount,
    transports: ['websocket', 'polling'],
    cors: {
      allowedOrigins: allowedOrigins,
      currentOrigin: req.headers.origin || 'unknown'
    }
  });
});

// API endpoint для синхронизации данных
app.get('/api/sync', (req, res) => {
  try {
    const syncData = {
      timeSlots: timeSlots,
      lessons: lessons,
      chats: chats,
      posts: posts,
      teacherProfiles: teacherProfiles,
      studentProfiles: studentProfiles,
      overbookingRequests: overbookingRequests || []
    };
    
    res.json(syncData);
  } catch (error) {
    console.error('Error in /api/sync:', error);
    res.status(500).json({ error: 'Failed to sync data' });
  }
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
    const indexPath = path.join(distPath, 'index.html');
    console.log('🔄 SPA fallback для:', req.path, '->', indexPath);
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.log('❌ index.html не найден в:', indexPath);
      res.status(404).json({ 
        error: 'Frontend not built', 
        path: req.path,
        distPath: distPath,
        files: fs.existsSync(distPath) ? fs.readdirSync(distPath) : 'dist not found'
      });
    }
  });
} else {
  // Если dist не существует, возвращаем информацию об ошибке
  app.get('*', (req, res) => {
    res.status(503).json({ 
      error: 'Frontend not built', 
      message: 'Please run npm run build first',
      distPath: distPath,
      exists: fs.existsSync(distPath)
    });
  });
}

// WebSocket обработчики
io.on('connection', (socket) => {
  console.log(`🔌 Новое Socket.IO подключение: ${socket.id}`);
  console.log(`📊 Всего подключений: ${io.engine.clientsCount}`);
  
  // Отправляем все профили преподавателей новому клиенту
  socket.emit('teacherProfiles', teacherProfiles);
  
  // Отправляем все профили студентов новому клиенту
  socket.emit('studentProfiles', studentProfiles);
  
  // Принудительно отправляем всех пользователей новому клиенту (независимо от онлайн статуса)
  const allUsers = [];
  Object.entries(teacherProfiles).forEach(([id, profile]) => {
    allUsers.push({
      id,
      email: profile.email || '',
      name: profile.name || '',
      nickname: profile.nickname || '',
      role: 'teacher',
      phone: profile.phone || '',
      profile: profile,
      isOnline: false,
      isRegistered: true
    });
  });
  Object.entries(studentProfiles).forEach(([id, profile]) => {
    allUsers.push({
      id,
      email: profile.email || '',
      name: profile.name || '',
      nickname: profile.nickname || '',
      role: 'student',
      phone: profile.phone || '',
      profile: profile,
      isOnline: false,
      isRegistered: true
    });
  });
  socket.emit('allUsers', allUsers);
  console.log('📡 Отправляем всех пользователей новому клиенту:', allUsers.length);
  
  // Отправляем статус подключения
  socket.emit('connectionStatus', { 
    status: 'connected', 
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });
  
  socket.on('disconnect', () => {
    console.log(`🔌 Socket.IO отключение: ${socket.id}`);
    console.log(`📊 Осталось подключений: ${io.engine.clientsCount}`);
    
    // ВАЖНО: НЕ удаляем репетиторов из teacherProfiles при отключении!
    // Репетиторы должны оставаться видимыми всегда, независимо от онлайн статуса
    console.log('✅ Репетиторы остаются видимыми независимо от отключения WebSocket');
  });
  
  // Обработка регистрации пользователя
  socket.on('userRegistered', (user) => {
    io.emit('userRegistered', user);
  });

  // Обработка запроса всех пользователей
  socket.on('requestAllUsers', () => {
    const users = [];
    
    // ВСЕГДА добавляем ВСЕХ преподавателей из teacherProfiles (независимо от онлайн статуса)
    Object.entries(teacherProfiles).forEach(([id, profile]) => {
      users.push({
        id,
        email: profile.email || '',
        name: profile.name || '',
        nickname: profile.nickname || '',
        role: 'teacher',
        phone: profile.phone || '',
        profile: profile,
        isOnline: false, // Всегда false, так как мы не отслеживаем онлайн статус
        isRegistered: true // Флаг зарегистрированного пользователя
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
        profile: profile,
        isOnline: false,
        isRegistered: true
      });
    });
    
    console.log('📡 Отправляем всех пользователей (независимо от онлайн статуса):', users.length);
    console.log('👨‍🏫 Преподавателей:', users.filter(u => u.role === 'teacher').length);
    console.log('👨‍🎓 Студентов:', users.filter(u => u.role === 'student').length);
    
    socket.emit('allUsers', users);
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
  
  // Обработка проверки статуса подключения
  socket.on('ping', () => {
    socket.emit('pong', { 
      timestamp: new Date().toISOString(),
      serverTime: Date.now()
    });
  });
  
  // Обработка запроса статуса сервера
  socket.on('getServerStatus', () => {
    socket.emit('serverStatus', {
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      connections: io.engine.clientsCount,
      dataStats: {
        teachers: Object.keys(teacherProfiles).length,
        students: Object.keys(studentProfiles).length,
        slots: timeSlots.length,
        lessons: lessons.length
      }
    });
  });

  // ===== ОБРАБОТЧИКИ ДЛЯ ЧАТОВ =====
  
  // Обработка создания нового чата
  socket.on('createChat', (newChat) => {
    console.log('Creating new chat:', newChat.id);
    
    // Проверяем, не существует ли уже такой чат
    const existingChat = chats.find(chat => 
      chat.participants.includes(newChat.participants[0]) && 
      chat.participants.includes(newChat.participants[1])
    );
    
    if (existingChat) {
      // Отправляем существующий чат обратно
      io.emit('chatCreated', existingChat);
      return;
    }
    
    chats.push(newChat);
    
    // Сохраняем данные на сервере
    saveServerData();
    
    console.log(`New chat created: ${newChat.id} between ${newChat.participantNames.join(' and ')}`);
    
    // Отправляем новый чат всем подключенным клиентам
    io.emit('chatCreated', newChat);
  });

  // Обработка отправки сообщений в чате
  socket.on('sendMessage', (data) => {
    const { chatId, message } = data;
    
    // Находим чат и добавляем сообщение
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    if (chatIndex !== -1) {
      chats[chatIndex].messages.push(message);
      chats[chatIndex].lastMessage = message;
      
      // Сохраняем данные на сервере
      saveServerData();
      
      console.log(`Message saved to chat ${chatId}:`, message.content);
      
      // Отправляем сообщение всем клиентам
      io.emit('receiveMessage', data);
      
      // Создаем уведомление для получателя, если он не отправитель
      if (message.receiverId && message.receiverId !== message.senderId) {
        const notification = {
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: message.receiverId,
          type: 'new_message',
          title: 'Новое сообщение',
          message: `${message.senderName} написал вам сообщение`,
          data: {
            chatId: chatId,
            senderId: message.senderId,
            senderName: message.senderName,
            messageId: message.id
          },
          isRead: false,
          timestamp: new Date().toISOString()
        };
        
        if (notifications) {
          notifications.push(notification);
          saveServerData();
          
          // Отправляем уведомление конкретному пользователю
          io.to(`notifications_${message.receiverId}`).emit('newNotification', notification);
        }
      }
    }
  });

  // Обработка создания уведомлений
  socket.on('createNotification', (notification) => {
    console.log('createNotification event received:', notification);
    
    // Добавляем уведомление в массив
    if (notifications) {
      notifications.push(notification);
      
      // Сохраняем данные на сервере
      saveServerData();
      
      console.log(`Notification created: ${notification.id} for user ${notification.userId}`);
      
      // Отправляем уведомление конкретному пользователю
      io.to(`notifications_${notification.userId}`).emit('newNotification', notification);
      
      console.log(`Notification sent to user ${notification.userId}`);
    } else {
      console.error('Notifications array is not initialized');
    }
  });

  // Обработка удаления чата
  socket.on('deleteChat', (data) => {
    const { chatId } = data;
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    if (chatIndex !== -1) {
      chats.splice(chatIndex, 1);
      saveServerData();
      io.emit('chatDeleted', { chatId });
    }
  });

  // Обработка отметки чата как прочитанного
  socket.on('markChatAsRead', (data) => {
    const { chatId } = data;
    const chat = chats.find(chat => chat.id === chatId);
    if (chat) {
      chat.messages.forEach(message => {
        message.isRead = true;
      });
      saveServerData();
      io.emit('chatMarkedAsRead', { chatId });
    }
  });

  // Обработка очистки сообщений чата
  socket.on('clearChatMessages', (data) => {
    const { chatId } = data;
    const chat = chats.find(chat => chat.id === chatId);
    if (chat) {
      chat.messages = [];
      saveServerData();
      io.emit('chatMessagesCleared', { chatId });
    }
  });

  // Обработка архивирования чата
  socket.on('archiveChat', (data) => {
    const { chatId } = data;
    const chat = chats.find(chat => chat.id === chatId);
    if (chat) {
      chat.archived = true;
      saveServerData();
      io.emit('chatArchived', { chatId });
    }
  });

  // Обработка восстановления чата из архива
  socket.on('unarchiveChat', (data) => {
    const { chatId } = data;
    const chat = chats.find(chat => chat.id === chatId);
    if (chat) {
      chat.archived = false;
      saveServerData();
      io.emit('chatUnarchived', { chatId });
    }
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
  console.log(`🔌 Socket.IO server ready with CORS origins: ${allowedOrigins.join(', ')}`);
});