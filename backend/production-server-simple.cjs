const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Настройка CORS для Render
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
  },
  transports: ['websocket', 'polling']
});

// Хранилище комнат для видео чата
const videoRooms = new Map();

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
  socket.emit('initialData', {
    teacherProfiles,
    studentProfiles,
    timeSlots,
    lessons,
    chats,
    overbookingRequests
  });

  // Обработка обновления профиля учителя
  socket.on('updateTeacherProfile', (data) => {
    const { teacherId, profile } = data;
    teacherProfiles[teacherId] = { ...teacherProfiles[teacherId], ...profile };
    saveServerData();
    socket.broadcast.emit('teacherProfileUpdated', { teacherId, profile });
  });

  // Обработка обновления профиля студента
  socket.on('updateStudentProfile', (data) => {
    const { studentId, profile } = data;
    studentProfiles[studentId] = { ...studentProfiles[studentId], ...profile };
    saveServerData();
    socket.broadcast.emit('studentProfileUpdated', { studentId, profile });
  });

  // Обработка создания временного слота
  socket.on('createTimeSlot', (slot) => {
    const newSlot = {
      id: Date.now().toString(),
      ...slot,
      createdAt: new Date().toISOString()
    };
    timeSlots.push(newSlot);
    saveServerData();
    socket.broadcast.emit('timeSlotCreated', newSlot);
  });

  // Обработка удаления временного слота
  socket.on('deleteTimeSlot', (slotId) => {
    const index = timeSlots.findIndex(slot => slot.id === slotId);
    if (index !== -1) {
      timeSlots.splice(index, 1);
      saveServerData();
      socket.broadcast.emit('timeSlotDeleted', slotId);
    }
  });

  // Обработка создания урока
  socket.on('createLesson', (lesson) => {
    const newLesson = {
      id: Date.now().toString(),
      ...lesson,
      createdAt: new Date().toISOString()
    };
    lessons.push(newLesson);
    saveServerData();
    socket.broadcast.emit('lessonCreated', newLesson);
  });

  // Обработка переноса урока
  socket.on('rescheduleLesson', (data) => {
    const { lessonId, newDate, newStartTime } = data;
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson) {
      lesson.date = newDate;
      lesson.startTime = newStartTime;
      saveServerData();
      socket.broadcast.emit('lessonRescheduled', { lessonId, newDate, newStartTime });
    }
  });

  // Обработка отправки сообщения
  socket.on('sendMessage', (data) => {
    const { chatId, senderId, senderName, content } = data;
    const message = {
      id: Date.now().toString(),
      senderId,
      senderName,
      content,
      timestamp: new Date().toISOString()
    };

    let chat = chats.find(c => c.id === chatId);
    if (!chat) {
      chat = {
        id: chatId,
        messages: []
      };
      chats.push(chat);
    }

    chat.messages.push(message);
    saveServerData();
    socket.broadcast.emit('messageReceived', { chatId, message });
  });

  // Обработка создания или получения чата
  socket.on('getOrCreateChat', (data) => {
    const { participant1Id, participant2Id, participant1Name, participant2Name } = data;
    const chatId = [participant1Id, participant2Id].sort().join('-');
    
    let chat = chats.find(c => c.id === chatId);
    if (!chat) {
      chat = {
        id: chatId,
        participants: [participant1Id, participant2Id],
        participantNames: [participant1Name, participant2Name],
        messages: []
      };
      chats.push(chat);
      saveServerData();
    }

    socket.emit('chatCreated', { chatId, chat });
  });

  // Обработка видео чата
  socket.on('join-video-room', (data) => {
    const { roomId, userName } = data;
    console.log(`User ${userName} joining video room ${roomId}`);

    if (!videoRooms.has(roomId)) {
      videoRooms.set(roomId, new Map());
    }

    const room = videoRooms.get(roomId);
    room.set(socket.id, userName);
    socket.join(roomId);

    // Уведомляем остальных участников
    socket.to(roomId).emit('video-user-joined', { userName });

    console.log(`User ${userName} joined video room ${roomId}`);
  });

  // Обработка WebRTC offer
  socket.on('video-offer', (data) => {
    const { roomId, offer } = data;
    console.log(`Video offer received in room ${roomId}`);
    socket.to(roomId).emit('video-offer', { offer });
  });

  // Обработка WebRTC answer
  socket.on('video-answer', (data) => {
    const { roomId, answer } = data;
    console.log(`Video answer received in room ${roomId}`);
    socket.to(roomId).emit('video-answer', { answer });
  });

  // Обработка ICE кандидатов
  socket.on('video-ice-candidate', (data) => {
    const { roomId, candidate } = data;
    console.log(`ICE candidate received in room ${roomId}`);
    socket.to(roomId).emit('video-ice-candidate', { candidate });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Удаляем пользователя из всех видео комнат
    videoRooms.forEach((room, roomId) => {
      if (room.has(socket.id)) {
        const userName = room.get(socket.id);
        room.delete(socket.id);
        
        // Уведомляем остальных участников
        socket.to(roomId).emit('video-user-left', { userName });
        
        // Удаляем комнату, если она пуста
        if (room.size === 0) {
          videoRooms.delete(roomId);
        }
        
        console.log(`User ${userName} left video room ${roomId}`);
      }
    });
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

// Обработка ошибок
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
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
}).on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
  }
  process.exit(1);
}); 