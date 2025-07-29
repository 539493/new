const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Настройка CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// Создание Socket.IO сервера
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Функции для работы с данными
const DATA_FILE = path.join(__dirname, 'server_data.json');
const INITIAL_DATA_FILE = path.join(__dirname, 'initial-data.json');

function loadInitialData() {
  try {
    if (fs.existsSync(INITIAL_DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(INITIAL_DATA_FILE, 'utf8'));
      console.log('Loaded initial data from file');
      return data;
    }
  } catch (error) {
    console.error('Error loading initial data:', error);
  }
  return {
    teacherProfiles: {},
    studentProfiles: {},
    overbookingRequests: [],
    timeSlots: [],
    lessons: [],
    chats: []
  };
}

function loadServerData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      console.log('Loaded server data from file');
      return data;
    }
  } catch (error) {
    console.error('Error loading server data:', error);
  }
  
  // Если файл данных не существует, загружаем начальные данные
  const initialData = loadInitialData();
  saveServerData(initialData);
  return initialData;
}

function saveServerData(data = null) {
  try {
    const dataToSave = data || {
      teacherProfiles,
      studentProfiles,
      overbookingRequests,
      timeSlots,
      lessons,
      chats
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
    console.log('Server data saved successfully');
  } catch (error) {
    console.error('Error saving server data:', error);
  }
}

// Загружаем данные при запуске сервера
const serverData = loadServerData();

// Хранилище данных
let teacherProfiles = serverData.teacherProfiles || {};
let studentProfiles = serverData.studentProfiles || {};
let timeSlots = serverData.timeSlots || [];
let lessons = serverData.lessons || [];
let chats = serverData.chats || [];
let overbookingRequests = serverData.overbookingRequests || [];

// Обработка подключений
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Отправляем текущие данные новому клиенту
  socket.emit('initialData', { timeSlots, lessons, chats });
  socket.emit('studentProfiles', studentProfiles);

  // Обработка создания нового слота
  socket.on('createSlot', (newSlot) => {
    console.log('New slot created:', newSlot);
    timeSlots.push(newSlot);
    saveServerData();
    io.emit('slotCreated', newSlot);
  });

  // Обработка создания нового чата
  socket.on('createChat', (newChat) => {
    console.log('New chat created:', newChat);
    chats.push(newChat);
    saveServerData();
    io.emit('chatCreated', newChat);
  });

  // Обработка бронирования слота
  socket.on('bookSlot', (data) => {
    console.log('Slot booked:', data);
    const { slotId, lesson } = data;
    
    const slotIndex = timeSlots.findIndex(slot => slot.id === slotId);
    if (slotIndex !== -1) {
      timeSlots[slotIndex].isBooked = true;
    }
    
    lessons.push(lesson);
    saveServerData();
    io.emit('slotBooked', data);
  });

  // Обработка отмены бронирования
  socket.on('cancelSlot', (data) => {
    console.log('Slot cancelled:', data);
    const { slotId, lessonId } = data;
    
    const slotIndex = timeSlots.findIndex(slot => slot.id === slotId);
    if (slotIndex !== -1) {
      timeSlots[slotIndex].isBooked = false;
    }
    
    const lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId);
    if (lessonIndex !== -1) {
      lessons.splice(lessonIndex, 1);
    }
    
    saveServerData();
    io.emit('slotCancelled', data);
  });

  // Обработка отправки сообщений в чате
  socket.on('sendMessage', (data) => {
    console.log('Message received:', data);
    io.emit('receiveMessage', data);
  });

  // Обработка завершения урока
  socket.on('lessonCompleted', (data) => {
    console.log('Lesson completed:', data);
    const { lessonId } = data;
    const lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId);
    let updatedLesson = null;
    if (lessonIndex !== -1) {
      lessons[lessonIndex].status = 'completed';
      updatedLesson = lessons[lessonIndex];
    }
    if (updatedLesson) {
      saveServerData();
      io.emit('lessonCompleted', { lesson: updatedLesson });
    }
  });

  // Обработка обновления профиля ученика
  socket.on('updateStudentProfile', (data) => {
    if (data && data.studentId && data.profile) {
      studentProfiles[data.studentId] = data.profile;
      saveServerData();
      io.emit('profileUpdated', { type: 'student', userId: data.studentId, profile: data.profile });
      io.emit('studentProfileUpdated', { studentId: data.studentId, profile: data.profile });
    }
  });

  // Обработка обновления профиля преподавателя
  socket.on('updateTeacherProfile', (data) => {
    if (data && data.teacherId && data.profile) {
      teacherProfiles[data.teacherId] = data.profile;
      saveServerData();
      io.emit('profileUpdated', { type: 'teacher', userId: data.teacherId, profile: data.profile });
      io.emit('teacherProfileUpdated', { teacherId: data.teacherId, profile: data.profile });
    }
  });

  // Обработка удаления слота
  socket.on('deleteSlot', (data) => {
    const { slotId } = data;
    if (slotId) {
      timeSlots = timeSlots.filter(slot => slot.id !== slotId);
      saveServerData();
      io.emit('slotDeleted', { slotId });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Tutoring Platform WebSocket Server',
    status: 'running',
    connectedClients: io.engine.clientsCount,
    timeSlots: timeSlots.length,
    lessons: lessons.length,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/api/teachers', (req, res) => {
  const teachers = Object.entries(teacherProfiles).map(([id, profile]) => ({
    id,
    name: profile.name || '',
    avatar: profile.avatar || '',
    profile
  }));
  res.json(teachers);
});

// Endpoint для получения начальных данных (для офлайн режима)
app.get('/api/initial-data', (req, res) => {
  res.json({
    teacherProfiles,
    studentProfiles,
    timeSlots,
    lessons,
    chats,
    overbookingRequests
  });
});

// Статические файлы из папки dist
app.use(express.static(path.join(__dirname, '../dist')));

// Все остальные GET запросы возвращают index.html для SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Production server running on port ${PORT}`);
  console.log(`📡 Server accessible at:`);
  console.log(`  - Local: http://localhost:${PORT}`);
  console.log(`  - Network: http://${HOST}:${PORT}`);
  console.log(`  - Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`  - WebSocket server: ws://${HOST}:${PORT}`);
  console.log(`  - Initial data loaded: ${Object.keys(teacherProfiles).length} teachers, ${timeSlots.length} slots`);
}); 