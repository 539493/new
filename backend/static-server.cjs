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

// WebSocket обработчики
io.on('connection', (socket) => {
  console.log('=== CLIENT CONNECTED ===');
  console.log('Socket ID:', socket.id);
  console.log('Total connected clients:', io.engine.clientsCount);
  
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

  // Обработка основных событий приложения
  socket.on('createSlot', (slot) => {
    console.log('Slot created:', slot);
    socket.broadcast.emit('slotCreated', slot);
  });

  socket.on('bookSlot', (data) => {
    console.log('Slot booked:', data);
    socket.broadcast.emit('slotBooked', data);
  });

  socket.on('cancelSlot', (data) => {
    console.log('Slot cancelled:', data);
    socket.broadcast.emit('slotCancelled', data);
  });

  socket.on('sendMessage', (message) => {
    console.log('Message sent:', message);
    socket.broadcast.emit('messageReceived', message);
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