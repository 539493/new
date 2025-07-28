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
  "http://localhost:4173", 
  "https://*.vercel.app",
  "https://*.onrender.com",
  "https://tutoring-platform.vercel.app"
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
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Загружаем данные при запуске сервера
const serverData = loadServerData();

// Хранилище для профилей преподавателей (объект)
let teacherProfiles = serverData.teacherProfiles && typeof serverData.teacherProfiles === 'object' ? serverData.teacherProfiles : {};
// Хранилище для профилей учеников (объект)
let studentProfiles = serverData.studentProfiles && typeof serverData.studentProfiles === 'object' ? serverData.studentProfiles : {};
// Хранилище для слотов
let timeSlots = Array.isArray(serverData.timeSlots) ? serverData.timeSlots : [];
// Хранилище для уроков
let lessons = Array.isArray(serverData.lessons) ? serverData.lessons : [];
// Хранилище для чатов
let chats = Array.isArray(serverData.chats) ? serverData.chats : [];
// Хранилище для заявок на овербукинг
let overbookingRequests = Array.isArray(serverData.overbookingRequests) ? serverData.overbookingRequests : [];
// Добавляем хранилище для отложенных заявок по teacherId
let pendingOverbookingForTeacher = {};

// Тестовое сохранение при запуске для проверки работы функции
console.log('=== TESTING SAVE FUNCTION ===');
saveServerData();
console.log('=== TEST COMPLETED ===');

// Хранилище для связи teacherId с socketId (ОБЫЧНЫЙ ОБЪЕКТ)
let teacherSocketMap = {};

// Обработка подключений
io.on('connection', (socket) => {
  console.log('=== CLIENT CONNECTED ===');
  console.log('Socket ID:', socket.id);
  console.log('Total connected clients:', io.engine.clientsCount);
  
  // Отладочная информация для всех событий
  console.log('Socket event handlers registered for:', socket.id);
  console.log('Current teacherSocketMap:', teacherSocketMap);
  
  // Логируем все события для отладки
  const originalEmit = socket.emit;
  socket.emit = function(event, ...args) {
    console.log(`[SOCKET EMIT] ${event}:`, args);
    return originalEmit.apply(this, arguments);
  };
  
  const originalOn = socket.on;
  socket.on = function(event, handler) {
    console.log(`[SOCKET ON] ${event} registered`);
    return originalOn.apply(this, arguments);
  };

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

  // Обработка создания нового слота
  socket.on('createSlot', (newSlot) => {
    console.log('=== NEW SLOT CREATED ===');
    console.log('Slot data:', newSlot);
    timeSlots.push(newSlot);
    console.log('Total slots on server:', timeSlots.length);
    
    // Отправляем новый слот всем подключенным клиентам
    io.emit('slotCreated', newSlot);
    console.log('Slot broadcasted to all clients');
    console.log('=== SLOT CREATION COMPLETED ===');
  });

  // Обработка создания нового чата
  socket.on('createChat', (newChat) => {
    console.log('New chat created:', newChat);
    chats.push(newChat);
    
    // Отправляем новый чат всем подключенным клиентам
    io.emit('chatCreated', newChat);
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

  // Обработка отправки сообщений в чате
  socket.on('sendMessage', (data) => {
    console.log('Message received:', data);
    // data: { chatId, message }
    io.emit('receiveMessage', data);
  });

  // Обработка завершения урока
  socket.on('lessonCompleted', (data) => {
    console.log('Lesson completed:', data);
    const { lessonId } = data;
    // Обновляем статус урока на сервере
    const lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId);
    let updatedLesson = null;
    if (lessonIndex !== -1) {
      lessons[lessonIndex].status = 'completed';
      updatedLesson = lessons[lessonIndex];
      console.log('Updated lesson on server:', updatedLesson);
    }
    // Отправляем обновление всем клиентам
    if (updatedLesson) {
      io.emit('lessonCompleted', { lesson: updatedLesson });
      console.log('Sent lessonCompleted to all clients:', updatedLesson);
    }
  });

  // Обработка обновления профиля ученика
  socket.on('updateStudentProfile', (data) => {
    // data: { studentId, profile }
    console.log('Сервер получил updateStudentProfile:', data);
    if (data && data.studentId && data.profile) {
      studentProfiles[data.studentId] = data.profile;
      saveServerData(); // Сохраняем данные в файл
      // Универсальное событие
      io.emit('profileUpdated', { type: 'student', userId: data.studentId, profile: data.profile });
      // Старое событие для обратной совместимости
      io.emit('studentProfileUpdated', { studentId: data.studentId, profile: data.profile });
      console.log('Сервер рассылает profileUpdated (student):', { userId: data.studentId, profile: data.profile });
    }
  });

  // Обработка обновления профиля преподавателя
  socket.on('updateTeacherProfile', (data) => {
    // data: { teacherId, profile }
    console.log('=== TEACHER PROFILE UPDATE ===');
    console.log('Received data:', data);
    if (data && data.teacherId && data.profile) {
      teacherProfiles[data.teacherId] = data.profile;
      saveServerData(); // Сохраняем данные в файл
      // Универсальное событие
      io.emit('profileUpdated', { type: 'teacher', userId: data.teacherId, profile: data.profile });
      // Старое событие для обратной совместимости
      io.emit('teacherProfileUpdated', { teacherId: data.teacherId, profile: data.profile });
      console.log('Сервер рассылает profileUpdated (teacher):', { userId: data.teacherId, profile: data.profile });
    } else {
      console.log('Invalid profile data received');
    }
    console.log('=== PROFILE UPDATE COMPLETED ===');
  });

  // Обработка удаления слота
  socket.on('deleteSlot', (data) => {
    const { slotId } = data;
    if (slotId) {
      timeSlots = timeSlots.filter(slot => slot.id !== slotId);
      io.emit('slotDeleted', { slotId });
      console.log('Slot deleted:', slotId);
    }
  });

  // Обработка новой заявки на овербукинг
  socket.on('overbookingRequest', (request) => {
    console.log('=== OVERBOOKING REQUEST RECEIVED ===');
    console.log('Request data:', request);
    // Гарантируем, что поле date присутствует
    if (!request.date || typeof request.date !== 'string' || request.date.length < 8) {
      request.date = new Date().toISOString().slice(0, 10);
      console.log('[SERVER] date was missing in overbookingRequest, set to today:', request.date);
    }
    request.id = `overbooking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    request.status = 'pending';
    request.createdAt = new Date().toISOString();
    overbookingRequests.push(request);
    console.log('Request saved to server. Total requests:', overbookingRequests.length);
    
    // Находим преподавателей с подходящим временем
    const availableTeachers = findAvailableTeachers(request);
    console.log('Available teachers for this request:', availableTeachers);
    
    // Отправляем заявку только преподавателям с подходящим временем
    if (availableTeachers.length > 0) {
      availableTeachers.forEach(teacherId => {
        const teacherSocketId = teacherSocketMap[teacherId];
        const teacherProfile = teacherProfiles[teacherId];
        console.log('[SERVER] Trying to send overbooking request:', { teacherId, teacherSocketId, teacherProfile, teacherSocketMap });
        if (teacherSocketId) {
          const teacherSocket = io.sockets.sockets.get(teacherSocketId);
          if (teacherSocket) {
            console.log(`Sending overbooking request to teacher ${teacherId} (socketId=${teacherSocketId})`);
            teacherSocket.emit('newOverbookingRequest', request);
          } else {
            console.log(`Teacher ${teacherId} is not connected (no socket found, teacherSocketId=${teacherSocketId})`);
            console.log('[SERVER] teacherSocketMap at fail:', teacherSocketMap);
            // Сохраняем заявку для отправки при следующем подключении
            if (!pendingOverbookingForTeacher[teacherId]) pendingOverbookingForTeacher[teacherId] = [];
            pendingOverbookingForTeacher[teacherId].push(request);
          }
        } else {
          console.log(`Teacher ${teacherId} is not connected (no socketId found)`);
          console.log('[SERVER] teacherSocketMap at fail:', teacherSocketMap);
          // Сохраняем заявку для отправки при следующем подключении
          if (!pendingOverbookingForTeacher[teacherId]) pendingOverbookingForTeacher[teacherId] = [];
          pendingOverbookingForTeacher[teacherId].push(request);
        }
      });
    } else {
      console.log('No available teachers found for this request');
    }
    
    console.log('=== OVERBOOKING REQUEST PROCESSED ===');
  });

  // Отправка всех актуальных заявок преподавателю при подключении
  socket.on('subscribeOverbooking', (teacherId) => {
    console.log('[SERVER] subscribeOverbooking received:', teacherId, 'socket.id:', socket.id);
    if (teacherId) {
      teacherSocketMap[teacherId] = socket.id;
      console.log('[SERVER] teacherSocketMap after subscribe:', teacherSocketMap);
      // 1. Отправляем все отложенные заявки, если есть
      if (pendingOverbookingForTeacher[teacherId] && pendingOverbookingForTeacher[teacherId].length > 0) {
        pendingOverbookingForTeacher[teacherId].forEach(request => {
          console.log(`[SERVER] EMIT pending newOverbookingRequest to teacherId=${teacherId} socket.id=${socket.id}`, request);
          socket.emit('newOverbookingRequest', request);
        });
        console.log(`[SERVER] Sent ${pendingOverbookingForTeacher[teacherId].length} pending overbooking requests to teacher ${teacherId}`);
        pendingOverbookingForTeacher[teacherId] = [];
      } else {
        console.log(`[SERVER] No pending overbooking requests for teacher ${teacherId}`);
      }
      // 2. Отправляем все актуальные заявки из overbookingRequests, которые подходят этому педагогу и не были приняты
      const activeRequests = overbookingRequests.filter(req => {
        if (req.status !== 'pending') return false;
        // Используем ту же логику, что и findAvailableTeachers
        const teacherProfile = teacherProfiles[teacherId];
        if (!teacherProfile || !teacherProfile.overbookingEnabled) return false;
        if (teacherId === req.studentId) return false;
        // Проверяем конфликт уроков
        const requestDate = req.date || new Date().toISOString().slice(0, 10);
        const requestStartTime = req.startTime;
        const hasLessonConflict = lessons.some((lesson) => {
          return lesson.teacherId === teacherId && lesson.date === requestDate && lesson.startTime === requestStartTime;
        });
        if (hasLessonConflict) return false;
        return true;
      });
      if (activeRequests.length > 0) {
        activeRequests.forEach(request => {
          socket.emit('newOverbookingRequest', request);
        });
        console.log(`[SERVER] Sent ${activeRequests.length} active overbooking requests to teacher ${teacherId}`);
      }
    } else {
      console.warn('[SERVER] subscribeOverbooking: teacherId is missing!');
    }
  });

  // Обработка отписки от овербукинга
  socket.on('unsubscribeOverbooking', (teacherId) => {
    if (teacherSocketMap[teacherId] === socket.id) {
      delete teacherSocketMap[teacherId];
      console.log(`[SERVER] UNSUBSCRIBE: removed teacherId ${teacherId} from teacherSocketMap`);
    }
    console.log('[SERVER] teacherSocketMap after unsubscribe:', teacherSocketMap);
  });

  // Принятие заявки преподавателем
  socket.on('acceptOverbookingRequest', ({ requestId, teacherId }) => {
    const idx = overbookingRequests.findIndex(r => r.id === requestId);
    if (idx !== -1) {
      overbookingRequests[idx].status = 'accepted';
      overbookingRequests[idx].acceptedBy = teacherId;
      io.emit('overbookingRequestAccepted', overbookingRequests[idx]);
      console.log('Overbooking request accepted:', overbookingRequests[idx]);
    }
  });

  // --- WebRTC Signaling ---
  // roomId -> Set(socket.id)
  const rooms = {};

  socket.on('join-room', (roomId) => {
    if (!rooms[roomId]) rooms[roomId] = new Set();
    rooms[roomId].add(socket.id);
    socket.join(roomId);
    console.log(`[WebRTC] ${socket.id} joined room ${roomId}`);
    // Сообщаем другим участникам комнаты о новом участнике
    socket.to(roomId).emit('peer-joined', { socketId: socket.id });
  });

  socket.on('signal', ({ roomId, to, data }) => {
    // Пересылаем signaling-сообщение конкретному участнику
    io.to(to).emit('signal', { from: socket.id, data });
  });

  socket.on('leave-room', (roomId) => {
    if (rooms[roomId]) {
      rooms[roomId].delete(socket.id);
      if (rooms[roomId].size === 0) delete rooms[roomId];
    }
    socket.leave(roomId);
    socket.to(roomId).emit('peer-left', { socketId: socket.id });
    console.log(`[WebRTC] ${socket.id} left room ${roomId}`);
  });

  socket.on('disconnect', () => {
    // Удаляем сокет из всех комнат
    for (const roomId in rooms) {
      if (rooms[roomId].has(socket.id)) {
        rooms[roomId].delete(socket.id);
        socket.to(roomId).emit('peer-left', { socketId: socket.id });
        if (rooms[roomId].size === 0) delete rooms[roomId];
      }
    }
    let removed = false;
    for (const [teacherId, sockId] of Object.entries(teacherSocketMap)) {
      if (sockId === socket.id) {
        delete teacherSocketMap[teacherId];
        removed = true;
        console.log(`[SERVER] Removed teacherId=${teacherId} from teacherSocketMap on disconnect`);
      }
    }
    if (!removed) {
      console.log(`[SERVER] No teacher mapping found for socket.id=${socket.id} on disconnect`);
    }
    console.log('[SERVER] teacherSocketMap after disconnect:', teacherSocketMap);
  });
});

// Функция для поиска всех преподавателей с включённым овербукингом и свободным временем
function findAvailableTeachers(request) {
  const availableTeachers = [];
  const requestDate = request.date || new Date().toISOString().slice(0, 10);
  const requestStartTime = request.startTime;
  const requestDuration = request.duration || 60;
  const requestSubject = request.subject;
  const requestExperience = request.experience;
  const requestFormat = request.format;
  const requestGrade = request.grade;
  const requestCity = request.city;
  const requestGoals = Array.isArray(request.goals) ? request.goals : (request.goals ? [request.goals] : []);

  Object.entries(teacherProfiles).forEach(([teacherId, teacherProfile]) => {
    if (teacherId === request.studentId) return;
    if (!teacherProfile.overbookingEnabled) return;
    // Предмет
    if (requestSubject && (!teacherProfile.subjects || !teacherProfile.subjects.includes(requestSubject))) return;
    // Опыт
    if (requestExperience && teacherProfile.experience && teacherProfile.experience !== requestExperience) return;
    // Формат
    if (requestFormat && (!teacherProfile.formats || !teacherProfile.formats.includes(requestFormat))) return;
    // Длительность
    if (requestDuration && teacherProfile.durations && !teacherProfile.durations.includes(requestDuration)) return;
    // Класс
    if (requestGrade && teacherProfile.grades && !teacherProfile.grades.includes(requestGrade)) return;
    // Город (для offline)
    if (requestFormat === 'offline' && requestCity && teacherProfile.city && teacherProfile.city !== requestCity) return;
    // Цели
    if (requestGoals.length > 0 && teacherProfile.goals && !teacherProfile.goals.some(goal => requestGoals.includes(goal))) return;
    // Проверяем, что у преподавателя нет урока на это время
    const hasLessonConflict = lessons.some((lesson) => {
      return lesson.teacherId === teacherId && lesson.date === requestDate && lesson.startTime === requestStartTime;
    });
    if (hasLessonConflict) return;
    availableTeachers.push(teacherId);
  });
  return availableTeachers;
}

// Функция для поиска сокета преподавателя по teacherId
function findSocketByTeacherId(teacherId) {
  const socketId = teacherSocketMap[teacherId];
  if (socketId) {
    return io.sockets.sockets.get(socketId);
  }
  return null;
}

// Вспомогательная функция для получения уникальных преподавателей из timeSlots
function getTeachersFromSlots() {
  const teachersMap = new Map();
  for (const slot of timeSlots) {
    if (slot.teacherId && slot.teacherName) {
      if (!teachersMap.has(slot.teacherId)) {
        teachersMap.set(slot.teacherId, {
          id: slot.teacherId,
          name: slot.teacherName,
          avatar: slot.teacherAvatar || '',
          profile: {
            subjects: slot.subject ? [slot.subject] : [],
            experience: slot.experience || 'beginner',
            grades: slot.grades || [],
            goals: slot.goals || [],
            lessonTypes: slot.lessonType ? [slot.lessonType] : [],
            durations: slot.duration ? [slot.duration] : [],
            formats: slot.format ? [slot.format] : [],
            offlineAvailable: slot.format === 'offline',
            city: slot.city || '',
            overbookingEnabled: true,
            bio: slot.bio || '',
            avatar: slot.teacherAvatar || '',
            rating: slot.rating || 0,
            hourlyRate: slot.price || 0,
            students: [],
            lessonsCount: 0,
            country: slot.country || '',
          }
        });
      }
    }
  }
  return Array.from(teachersMap.values());
}

// Endpoint для получения преподавателей
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

// Простой endpoint для проверки работы сервера
app.get('/', (req, res) => {
  res.json({ 
    message: 'Tutoring Platform WebSocket Server',
    status: 'running',
    connectedClients: io.engine.clientsCount,
    timeSlots: timeSlots.length,
    lessons: lessons.length
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
  console.log(`📡 Server accessible at:`);
  console.log(`  - Local: http://localhost:${PORT}`);
  console.log(`  - Network: http://${HOST}:${PORT}`);
  console.log(`  - Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  - CORS enabled for: ${allowedOrigins.join(', ')}`);
}); 