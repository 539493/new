const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Настройка CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001", 
  "http://localhost:3002",
  "http://localhost:4173",
  "https://*.vercel.app",
  "https://*.onrender.com",
  "https://tutoring-platform.vercel.app",
  "https://tutoring-platform.onrender.com",
  "https://tutoring-platform-*.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
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

// Создание Socket.IO сервера
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
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

// Раздаем статические файлы из папки dist
app.use(express.static(path.join(__dirname, '../dist')));

// API маршруты
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Tutoring Platform WebSocket Server',
    status: 'running',
    connectedClients: io.engine.clientsCount,
    timeSlots: 0,
    lessons: 0,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Обработка всех остальных маршрутов - возвращаем index.html для SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Функции для работы с данными
const fs = require('fs');
const DATA_FILE = path.join(__dirname, 'server_data.json');

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
  return {
    teacherProfiles: {},
    studentProfiles: {},
    overbookingRequests: [],
    timeSlots: [],
    lessons: [],
    chats: []
  };
}

function saveServerData() {
  try {
    const data = {
      teacherProfiles,
      studentProfiles,
      overbookingRequests,
      timeSlots,
      lessons,
      chats
    };
    console.log('=== SAVING SERVER DATA ===');
    console.log('Data file path:', DATA_FILE);
    console.log('Teacher profiles count:', Object.keys(teacherProfiles).length);
    console.log('Student profiles count:', Object.keys(studentProfiles).length);
    console.log('Overbooking requests count:', overbookingRequests.length);
    console.log('Time slots count:', timeSlots.length);
    console.log('Lessons count:', lessons.length);
    console.log('Chats count:', chats.length);
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('Server data saved to file successfully');
    console.log('=== SAVE COMPLETED ===');
  } catch (error) {
    console.error('Error saving server data:', error);
  }
}

// Загружаем данные при запуске сервера
const serverData = loadServerData();

// Хранилище для данных
let teacherProfiles = serverData.teacherProfiles && typeof serverData.teacherProfiles === 'object' ? serverData.teacherProfiles : {};
let studentProfiles = serverData.studentProfiles && typeof serverData.studentProfiles === 'object' ? serverData.studentProfiles : {};
let timeSlots = Array.isArray(serverData.timeSlots) ? serverData.timeSlots : [];
let lessons = Array.isArray(serverData.lessons) ? serverData.lessons : [];
let chats = Array.isArray(serverData.chats) ? serverData.chats : [];
let overbookingRequests = Array.isArray(serverData.overbookingRequests) ? serverData.overbookingRequests : [];

// Функция для очистки старых слотов (старше 30 дней)
function cleanupOldSlots() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const oldSlots = timeSlots.filter(slot => {
    const slotDate = new Date(slot.date);
    return slotDate < thirtyDaysAgo;
  });
  
  if (oldSlots.length > 0) {
    timeSlots = timeSlots.filter(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= thirtyDaysAgo;
    });
    
    console.log(`Cleaned up ${oldSlots.length} old slots`);
    saveServerData();
  }
}

// Очищаем старые слоты при запуске сервера
cleanupOldSlots();

// WebSocket обработчики
io.on('connection', (socket) => {
  console.log('=== CLIENT CONNECTED ===');
  console.log('Socket ID:', socket.id);
  console.log('Total connected clients:', io.engine.clientsCount);
  
  // Отправляем текущие данные новому клиенту
  console.log('Sending initial data to client:', {
    timeSlotsCount: timeSlots.length,
    lessonsCount: lessons.length,
    chatsCount: chats.length,
    teacherProfilesCount: Object.keys(teacherProfiles).length
  });
  socket.emit('initialData', { timeSlots, lessons, chats });

  // Отправляем профили учеников новому клиенту
  socket.emit('studentProfiles', studentProfiles);
  
  // Отправляем все слоты для синхронизации
  socket.emit('allSlots', timeSlots);
  
  // Обработка запроса всех слотов
  socket.on('requestAllSlots', () => {
    console.log('Client requested all slots');
    socket.emit('allSlots', timeSlots);
  });

  // Обработка создания нового слота
  socket.on('createSlot', (newSlot) => {
    console.log('=== NEW SLOT CREATED ===');
    console.log('Slot data:', newSlot);
    
    // Проверяем, не существует ли уже слот с таким ID
    const existingSlotIndex = timeSlots.findIndex(slot => slot.id === newSlot.id);
    if (existingSlotIndex !== -1) {
      // Обновляем существующий слот
      timeSlots[existingSlotIndex] = { ...timeSlots[existingSlotIndex], ...newSlot };
      console.log('Updated existing slot:', newSlot.id);
    } else {
      // Добавляем новый слот
      timeSlots.push(newSlot);
      console.log('Added new slot:', newSlot.id);
    }
    
    console.log('Total slots on server:', timeSlots.length);
    
    // Сохраняем данные в файл
    saveServerData();
    
    // Отправляем новый слот всем подключенным клиентам
    io.emit('slotCreated', newSlot);
    console.log('Slot broadcasted to all clients');
    console.log('=== SLOT CREATION COMPLETED ===');
  });

  // Обработка бронирования слота
  socket.on('bookSlot', (data) => {
    console.log('Slot booked:', data);
    const { slotId, lesson } = data;
    
    // Обновляем статус слота
    const slotIndex = timeSlots.findIndex(slot => slot.id === slotId);
    if (slotIndex !== -1) {
      timeSlots[slotIndex].isBooked = true;
    }
    
    // Добавляем урок
    lessons.push(lesson);
    
    // Сохраняем данные в файл
    saveServerData();
    
    // Отправляем обновление всем клиентам
    io.emit('slotBooked', data);
  });

  // Обработка отмены бронирования
  socket.on('cancelSlot', (data) => {
    console.log('Slot cancelled:', data);
    const { slotId, lessonId } = data;
    
    // Обновляем статус слота
    const slotIndex = timeSlots.findIndex(slot => slot.id === slotId);
    if (slotIndex !== -1) {
      timeSlots[slotIndex].isBooked = false;
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
  });

  // Обработка удаления слота
  socket.on('deleteSlot', (data) => {
    const { slotId } = data;
    if (slotId) {
      timeSlots = timeSlots.filter(slot => slot.id !== slotId);
      saveServerData(); // Сохраняем данные в файл
      io.emit('slotDeleted', { slotId });
      console.log('Slot deleted:', slotId);
    }
  });

  // Обработка видео событий
  const rooms = {};

  socket.on('video-join', (data) => {
    const { roomId, userName, userRole } = data;
    if (!rooms[roomId]) rooms[roomId] = new Set();
    rooms[roomId].add(socket.id);
    socket.join(roomId);
    console.log(`[Video] ${userName} (${userRole}) joined video room ${roomId}`);
    
    socket.emit('video-connected', { roomId });
    socket.to(roomId).emit('video-user-joined', { userName, userRole });
  });

  socket.on('video-offer', (data) => {
    const { roomId, offer } = data;
    console.log(`[Video] Forwarding offer in room ${roomId}`);
    socket.to(roomId).emit('video-offer', { offer });
  });

  socket.on('video-answer', (data) => {
    const { roomId, answer } = data;
    console.log(`[Video] Forwarding answer in room ${roomId}`);
    socket.to(roomId).emit('video-answer', { answer });
  });

  socket.on('video-ice-candidate', (data) => {
    const { roomId, candidate } = data;
    console.log(`[Video] Forwarding ICE candidate in room ${roomId}`);
    socket.to(roomId).emit('video-ice-candidate', { candidate });
  });

  socket.on('video-leave', (data) => {
    const { roomId, userName } = data;
    if (rooms[roomId]) {
      rooms[roomId].delete(socket.id);
      if (rooms[roomId].size === 0) delete rooms[roomId];
    }
    socket.leave(roomId);
    socket.to(roomId).emit('video-user-left', { userName });
    console.log(`[Video] ${userName} left video room ${roomId}`);
  });

  // Обработка отправки сообщений в чате
  socket.on('sendMessage', (data) => {
    console.log('Message received:', data);
    io.emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Запуск сервера
const PORT = process.env.PORT || 10000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Static server running on port ${PORT}`);
  console.log(`📡 Server accessible at:`);
  console.log(`  - Local: http://localhost:${PORT}`);
  console.log(`  - Network: http://${HOST}:${PORT}`);
  console.log(`  - Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  - CORS enabled for: ${allowedOrigins.join(', ')}`);
}); 