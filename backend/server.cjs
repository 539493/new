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
  "https://na-uchi.onrender.com"
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

// Простой тестовый API маршрут
app.get('/api/test', (req, res) => {
  res.json({ message: 'API работает!', timestamp: new Date().toISOString() });
});

// API маршруты - должны быть ПЕРЕД статическими файлами
app.get('/api/sync', (req, res) => {
  try {
    const syncData = {
      timeSlots: timeSlots,
      teacherProfiles: teacherProfiles,
      studentProfiles: studentProfiles,
      lessons: lessons,
      chats: chats,
      posts: posts,
      overbookingRequests: overbookingRequests
    };
    
    console.log('Sync endpoint called, sending data:', {
      timeSlotsCount: timeSlots.length,
      teacherProfilesCount: Object.keys(teacherProfiles).length,
      studentProfilesCount: Object.keys(studentProfiles).length,
      lessonsCount: lessons.length
    });
    
    res.json(syncData);
  } catch (error) {
    console.error('Error in sync endpoint:', error);
    res.status(500).json({ error: 'Failed to sync data' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Tutoring Platform WebSocket Server',
    status: 'running',
    connectedClients: io.engine.clientsCount,
    timeSlots: timeSlots.length,
    lessons: lessons.length
  });
});

// Обслуживание статических файлов фронтенда
app.use(express.static(path.join(__dirname, '../dist')));

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
      console.log('Loaded server data:', {
        teacherProfilesCount: Object.keys(data.teacherProfiles || {}).length,
        studentProfilesCount: Object.keys(data.studentProfiles || {}).length,
        timeSlotsCount: (data.timeSlots || []).length,
        lessonsCount: (data.lessons || []).length
      });
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

function saveServerData() {
  try {
    const data = {
      teacherProfiles,
      studentProfiles,
      overbookingRequests,
      timeSlots,
      lessons,
      chats,
      posts,
      notifications
    };
    
    console.log('Saving server data:', {
      teacherProfilesCount: Object.keys(teacherProfiles).length,
      studentProfilesCount: Object.keys(studentProfiles).length,
      timeSlotsCount: timeSlots.length,
      lessonsCount: lessons.length
    });
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('Server data saved successfully');
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
// Хранилище для постов
let posts = Array.isArray(serverData.posts) ? serverData.posts : [];
// Хранилище для уведомлений
let notifications = Array.isArray(serverData.notifications) ? serverData.notifications : [];

// Тестовое сохранение при запуске для проверки работы функции
saveServerData();

// Очищаем старые слоты при запуске сервера
cleanupOldSlots();

// Хранилище для связи teacherId с socketId (ОБЫЧНЫЙ ОБЪЕКТ)
let teacherSocketMap = {};

// Обработка подключений
io.on('connection', (socket) => {
  
  // Отладочная информация для всех событий
  
  // Логируем все события для отладки
  const originalEmit = socket.emit;
  socket.emit = function(event, ...args) {
    return originalEmit.apply(this, arguments);
  };
  
  const originalOn = socket.on;
  socket.on = function(event, handler) {
    return originalOn.apply(this, arguments);
  };

  // Отправляем текущие данные новому клиенту
  socket.emit('stats', {
    timeSlotsCount: timeSlots.length,
    lessonsCount: lessons.length,
    chatsCount: chats.length,
    teacherProfilesCount: Object.keys(teacherProfiles).length
  });
  socket.emit('initialData', { timeSlots, lessons, chats });

  // Отправляем профили учеников новому клиенту
  socket.emit('studentProfiles', studentProfiles);
  
  // Отправляем профили преподавателей новому клиенту
  socket.emit('teacherProfiles', teacherProfiles);
  
  // Отправляем все слоты для синхронизации
  socket.emit('allSlots', timeSlots);
  
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
  
  // Обработка запроса всех слотов
  socket.on('requestAllSlots', () => {
    socket.emit('allSlots', timeSlots);
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

  // Обработка создания нового слота
  socket.on('createSlot', (newSlot) => {
    
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

  // Обработка создания нового чата
  socket.on('createChat', (newChat) => {
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

  // Обработка создания уведомлений
  socket.on('createNotification', (notification) => {
    console.log('createNotification event received:', notification);
    
    // Добавляем уведомление в массив
    notifications.push(notification);
    
    // Сохраняем данные на сервере
    saveServerData();
    
    console.log(`Notification created: ${notification.id} for user ${notification.userId}`);
    
    // Отправляем уведомление конкретному пользователю
    io.to(`notifications_${notification.userId}`).emit('newNotification', notification);
    
    console.log(`Notification sent to user ${notification.userId}`);
  });

  // Обработка бронирования слота
  socket.on('bookSlot', (data) => {
    const { slotId, lesson, bookedStudentId } = data;
    
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
  });

  // Обработка отмены бронирования
  socket.on('cancelSlot', (data) => {
    const { slotId, lessonId } = data;
    
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
  });

  // Обработка отправки сообщений в чате
  socket.on('sendMessage', (data) => {
    // data: { chatId, message }
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
        
        notifications.push(notification);
        saveServerData();
        
        // Отправляем уведомление конкретному пользователю
        io.to(`notifications_${message.receiverId}`).emit('newNotification', notification);
      }
    }
  });

  // Обработка завершения урока
  socket.on('lessonCompleted', (data) => {
    const { lessonId } = data;
    // Обновляем статус урока на сервере
    const lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId);
    let updatedLesson = null;
    if (lessonIndex !== -1) {
      lessons[lessonIndex].status = 'completed';
      updatedLesson = lessons[lessonIndex];
    }
    // Отправляем обновление всем клиентам
    if (updatedLesson) {
      io.emit('lessonCompleted', { lesson: updatedLesson });
    }
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
    } else {
    }
  });

  // Обработка удаления слота
  socket.on('deleteSlot', (data) => {
    const { slotId } = data;
    if (slotId) {
      timeSlots = timeSlots.filter(slot => slot.id !== slotId);
      saveServerData(); // Сохраняем данные в файл
      io.emit('slotDeleted', { slotId });
      
      // Отправляем обновленные данные всем клиентам для синхронизации
      io.emit('dataUpdated', {
        type: 'slotDeleted',
        timeSlots: timeSlots,
        teacherProfiles: teacherProfiles,
        studentProfiles: studentProfiles
      });
    }
  });

  // Обработка новой заявки на овербукинг
  socket.on('overbookingRequest', (request) => {
    // Гарантируем, что поле date присутствует
    if (!request.date || typeof request.date !== 'string' || request.date.length < 8) {
      request.date = new Date().toISOString().slice(0, 10);
    }
    request.id = `overbooking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    request.status = 'pending';
    request.createdAt = new Date().toISOString();
    overbookingRequests.push(request);
    
    // Находим преподавателей с подходящим временем
    const availableTeachers = findAvailableTeachers(request);
    
    // Отправляем заявку только преподавателям с подходящим временем
    if (availableTeachers.length > 0) {
      availableTeachers.forEach(teacherId => {
        const teacherSocketId = teacherSocketMap[teacherId];
        const teacherProfile = teacherProfiles[teacherId];
        if (teacherSocketId) {
          const teacherSocket = io.sockets.sockets.get(teacherSocketId);
          if (teacherSocket) {
            teacherSocket.emit('newOverbookingRequest', request);
          } else {
            // Сохраняем заявку для отправки при следующем подключении
            if (!pendingOverbookingForTeacher[teacherId]) pendingOverbookingForTeacher[teacherId] = [];
            pendingOverbookingForTeacher[teacherId].push(request);
          }
        } else {
          // Сохраняем заявку для отправки при следующем подключении
          if (!pendingOverbookingForTeacher[teacherId]) pendingOverbookingForTeacher[teacherId] = [];
          pendingOverbookingForTeacher[teacherId].push(request);
        }
      });
    } else {
    }
    
  });

  // Отправка всех актуальных заявок преподавателю при подключении
  socket.on('subscribeOverbooking', (teacherId) => {
    if (teacherId) {
      teacherSocketMap[teacherId] = socket.id;
      // 1. Отправляем все отложенные заявки, если есть
      if (pendingOverbookingForTeacher[teacherId] && pendingOverbookingForTeacher[teacherId].length > 0) {
        pendingOverbookingForTeacher[teacherId].forEach(request => {
          socket.emit('newOverbookingRequest', request);
        });
        pendingOverbookingForTeacher[teacherId] = [];
      } else {
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
      }
    } else {
      console.warn('[SERVER] subscribeOverbooking: teacherId is missing!');
    }
  });

  // Обработка отписки от овербукинга
  socket.on('unsubscribeOverbooking', (teacherId) => {
    if (teacherSocketMap[teacherId] === socket.id) {
      delete teacherSocketMap[teacherId];
    }
  });

  // Принятие заявки преподавателем
  socket.on('acceptOverbookingRequest', ({ requestId, teacherId }) => {
    const idx = overbookingRequests.findIndex(r => r.id === requestId);
    if (idx !== -1) {
      overbookingRequests[idx].status = 'accepted';
      overbookingRequests[idx].acceptedBy = teacherId;
      io.emit('overbookingRequestAccepted', overbookingRequests[idx]);
    }
  });

  // --- WebRTC Signaling ---
  // roomId -> Set(socket.id)
  const rooms = {};

  // Обработка подключения к видео комнате
  socket.on('video-join', (data) => {
    const { roomId, userName, userRole } = data;
    if (!rooms[roomId]) rooms[roomId] = new Set();
    rooms[roomId].add(socket.id);
    socket.join(roomId);
    
    // Уведомляем пользователя о успешном подключении
    socket.emit('video-connected', { roomId });
    
    // Уведомляем других участников о новом пользователе
    socket.to(roomId).emit('video-user-joined', { userName, userRole });
  });

  // Обработка WebRTC offer
  socket.on('video-offer', (data) => {
    const { roomId, offer } = data;
    socket.to(roomId).emit('video-offer', { offer });
  });

  // Обработка WebRTC answer
  socket.on('video-answer', (data) => {
    const { roomId, answer } = data;
    socket.to(roomId).emit('video-answer', { answer });
  });

  // Обработка ICE кандидатов
  socket.on('video-ice-candidate', (data) => {
    const { roomId, candidate } = data;
    socket.to(roomId).emit('video-ice-candidate', { candidate });
  });

  // Обработка выхода из видео комнаты
  socket.on('video-leave', (data) => {
    const { roomId, userName } = data;
    if (rooms[roomId]) {
      rooms[roomId].delete(socket.id);
      if (rooms[roomId].size === 0) delete rooms[roomId];
    }
    socket.leave(roomId);
    socket.to(roomId).emit('video-user-left', { userName });
  });

  // Старые события для обратной совместимости
  socket.on('join-room', (roomId) => {
    if (!rooms[roomId]) rooms[roomId] = new Set();
    rooms[roomId].add(socket.id);
    socket.join(roomId);
    socket.to(roomId).emit('peer-joined', { socketId: socket.id });
  });

  socket.on('signal', ({ roomId, to, data }) => {
    io.to(to).emit('signal', { from: socket.id, data });
  });

  socket.on('leave-room', (roomId) => {
    if (rooms[roomId]) {
      rooms[roomId].delete(socket.id);
      if (rooms[roomId].size === 0) delete rooms[roomId];
    }
    socket.leave(roomId);
    socket.to(roomId).emit('peer-left', { socketId: socket.id });
  });

  // ===== ОБРАБОТЧИКИ ДЛЯ ПОСТОВ =====
  
  // Создание поста
  socket.on('createPost', (postData) => {
    
    const newPost = {
      ...postData,
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      reactions: [],
      comments: [],
      isBookmarked: false,
      tags: extractTags(postData.text),
      likes: 0,
      views: 0
    };
    
    posts.unshift(newPost);
    saveServerData();
    
    // Отправляем всем клиентам
    io.emit('postCreated', newPost);
    
    // Создаем уведомления для подписчиков
    createPostNotifications(newPost);
    
  });

  // Добавление реакции
  socket.on('addReaction', (data) => {
    
    const { postId, reactionType, userId } = data;
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      return;
    }
    
    // Проверяем, есть ли уже реакция от этого пользователя
    const existingReaction = post.reactions.find(r => r.userId === userId);
    
    if (existingReaction) {
      if (existingReaction.type === reactionType) {
        // Убираем реакцию
        post.reactions = post.reactions.filter(r => r.userId !== userId);
        post.likes = Math.max(0, post.likes - 1);
      } else {
        // Меняем тип реакции
        existingReaction.type = reactionType;
      }
    } else {
      // Добавляем новую реакцию
      post.reactions.push({
        id: `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: reactionType,
        date: new Date().toISOString()
      });
      post.likes++;
    }
    
    saveServerData();
    
    // Отправляем обновление всем клиентам
    io.emit('postReactionUpdated', { postId, reactions: post.reactions, likes: post.likes });
    
    // Создаем уведомление о реакции
    if (existingReaction && existingReaction.type !== reactionType) {
      createReactionNotification(post, userId, reactionType);
    }
  });

  // Добавление комментария
  socket.on('addComment', (data) => {
    
    const { postId, comment } = data;
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      return;
    }
    
    const newComment = {
      ...comment,
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString()
    };
    
    post.comments.push(newComment);
    saveServerData();
    
    // Отправляем обновление всем клиентам
    io.emit('postCommentAdded', { postId, comment: newComment });
    
    // Создаем уведомление о комментарии
    createCommentNotification(post, newComment);
    
  });

  // Редактирование поста
  socket.on('editPost', (data) => {
    
    const { postId, newText } = data;
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      return;
    }
    
    post.text = newText;
    post.tags = extractTags(newText);
    post.editedAt = new Date().toISOString();
    saveServerData();
    
    // Отправляем обновление всем клиентам
    io.emit('postEdited', { postId, text: newText, tags: post.tags, editedAt: post.editedAt });
    
  });

  // Удаление поста
  socket.on('deletePost', (data) => {
    
    const { postId } = data;
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) {
      return;
    }
    
    posts.splice(postIndex, 1);
    saveServerData();
    
    // Отправляем всем клиентам
    io.emit('postDeleted', { postId });
    
  });

  // Закладка поста
  socket.on('bookmarkPost', (data) => {
    
    const { postId, userId } = data;
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      return;
    }
    
    if (!post.bookmarks) post.bookmarks = [];
    
    const bookmarkIndex = post.bookmarks.indexOf(userId);
    if (bookmarkIndex === -1) {
      post.bookmarks.push(userId);
    } else {
      post.bookmarks.splice(bookmarkIndex, 1);
    }
    
    saveServerData();
    
    // Отправляем обновление клиенту
    socket.emit('postBookmarkUpdated', { postId, bookmarks: post.bookmarks });
    
  });

  // Запрос всех постов
  socket.on('requestAllPosts', () => {
    socket.emit('allPosts', posts);
  });

  // Поиск постов
  socket.on('searchPosts', (searchData) => {
    
    const { query, tags, userId, limit = 20 } = searchData;
    let filteredPosts = [...posts];
    
    if (query) {
      const searchQuery = query.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.text.toLowerCase().includes(searchQuery) ||
        post.userName.toLowerCase().includes(searchQuery)
      );
    }
    
    if (tags && tags.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        post.tags && tags.some(tag => post.tags.includes(tag))
      );
    }
    
    if (userId) {
      filteredPosts = filteredPosts.filter(post => post.userId === userId);
    }
    
    // Сортируем по дате (новые сначала)
    filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Ограничиваем количество
    filteredPosts = filteredPosts.slice(0, limit);
    
    socket.emit('searchResults', filteredPosts);
  });

  // Подписка на уведомления
  socket.on('subscribeNotifications', (userId) => {
    socket.join(`notifications_${userId}`);
  });

  // Отписка от уведомлений
  socket.on('unsubscribeNotifications', (userId) => {
    socket.leave(`notifications_${userId}`);
  });

  // Запрос уведомлений пользователя
  socket.on('requestUserNotifications', (userId) => {
    const userNotifications = notifications.filter(n => n.userId === userId);
    socket.emit('userNotifications', userNotifications);
  });

  // Отметка уведомления как прочитанного
  socket.on('markNotificationAsRead', (notificationId) => {
    
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date().toISOString();
      saveServerData();
      
      socket.emit('notificationMarkedAsRead', { notificationId });
    }
  });

  // Отметка всех уведомлений пользователя как прочитанных
  socket.on('markAllNotificationsAsRead', (userId) => {
    const userNotifications = notifications.filter(n => n.userId === userId);
    userNotifications.forEach(notification => {
      notification.isRead = true;
      notification.readAt = new Date().toISOString();
    });
    saveServerData();
    
    socket.emit('allNotificationsMarkedAsRead', { userId });
  });

  // Обработка удаления чата
  socket.on('deleteChat', (data) => {
    const { chatId } = data;
    console.log('Server: deleteChat event received for chatId:', chatId);
    console.log('Server: Current chats count:', chats.length);
    
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    if (chatIndex !== -1) {
      const deletedChat = chats[chatIndex];
      chats.splice(chatIndex, 1);
      saveServerData();
      console.log(`Server: Chat ${chatId} deleted. New count: ${chats.length}`);
      io.emit('chatDeleted', { chatId });
      console.log('Server: chatDeleted event sent to all clients');
    } else {
      console.warn('Server: Chat not found for deletion:', chatId);
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

  // Обработка создания уведомлений
  socket.on('createNotification', (notification) => {
    notifications.push(notification);
    saveServerData();
    
    // Отправляем уведомление конкретному пользователю
    io.emit('newNotification', notification);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket.IO отключение: ${socket.id}`);
    console.log(`📊 Осталось подключений: ${io.engine.clientsCount}`);
    
    // Удаляем сокет из всех комнат
    for (const roomId in rooms) {
      if (rooms[roomId].has(socket.id)) {
        rooms[roomId].delete(socket.id);
        socket.to(roomId).emit('peer-left', { socketId: socket.id });
        if (rooms[roomId].size === 0) delete rooms[roomId];
      }
    }
    
    // Удаляем из teacherSocketMap только для овербукинга (не влияет на отображение репетиторов)
    let removed = false;
    for (const [teacherId, sockId] of Object.entries(teacherSocketMap)) {
      if (sockId === socket.id) {
        delete teacherSocketMap[teacherId];
        removed = true;
        console.log(`👨‍🏫 Удален из teacherSocketMap (только для овербукинга): ${teacherId}`);
      }
    }
    
    // ВАЖНО: НЕ удаляем репетиторов из teacherProfiles при отключении!
    // Репетиторы должны оставаться видимыми всегда, независимо от онлайн статуса
    console.log('✅ Репетиторы остаются видимыми независимо от отключения WebSocket');
  });
});

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
    
    saveServerData();
  }
}

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

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ПОСТОВ =====

// Извлечение тегов из текста
function extractTags(text) {
  if (!text) return [];
  const hashtagRegex = /#[\wа-яё]+/gi;
  const matches = text.match(hashtagRegex);
  return matches ? [...new Set(matches.map(tag => tag.toLowerCase()))] : [];
}

// Создание уведомлений о новом посте
function createPostNotifications(post) {
  // Получаем всех пользователей, кроме автора поста
  const allUsers = [
    ...Object.keys(teacherProfiles).map(id => ({ id, type: 'teacher' })),
    ...Object.keys(studentProfiles).map(id => ({ id, type: 'student' }))
  ].filter(user => user.id !== post.userId);

  // Создаем уведомления для каждого пользователя
  allUsers.forEach(user => {
    const notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      type: 'new_post',
      title: 'Новая запись',
      message: `${post.userName} опубликовал новую запись`,
      data: {
        postId: post.id,
        authorId: post.userId,
        authorName: post.userName
      },
      isRead: false,
      createdAt: new Date().toISOString()
    };

    notifications.push(notification);
  });

  saveServerData();
}

// Создание уведомления о реакции
function createReactionNotification(post, userId, reactionType) {
  if (post.userId === userId) return; // Не уведомляем автора о его собственной реакции

  const reactionEmojis = {
    'like': '👍',
    'love': '❤️',
    'smile': '😊',
    'thumbsup': '👍'
  };

  const notification = {
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: post.userId,
    type: 'reaction',
    title: 'Новая реакция',
    message: `Кто-то поставил ${reactionEmojis[reactionType] || '👍'} на вашу запись`,
    data: {
      postId: post.id,
      reactorId: userId,
      reactionType
    },
    isRead: false,
    createdAt: new Date().toISOString()
  };

  notifications.push(notification);
  saveServerData();

  // Отправляем уведомление в реальном времени
  io.to(`notifications_${post.userId}`).emit('newNotification', notification);
}

// Создание уведомления о комментарии
function createCommentNotification(post, comment) {
  if (post.userId === comment.userId) return; // Не уведомляем автора о его собственном комментарии

  const notification = {
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: post.userId,
    type: 'comment',
    title: 'Новый комментарий',
    message: `${comment.userName} прокомментировал вашу запись`,
    data: {
      postId: post.id,
      commentId: comment.id,
      commenterId: comment.userId,
      commenterName: comment.userName
    },
    isRead: false,
    createdAt: new Date().toISOString()
  };

  notifications.push(notification);
  saveServerData();

  // Отправляем уведомление в реальном времени
  io.to(`notifications_${post.userId}`).emit('newNotification', notification);
}

// Модерация контента
function moderateContent(text) {
  const forbiddenWords = [
    'спам', 'реклама', 'оскорбление', 'нецензурная лексика'
  ];
  
  const lowerText = text.toLowerCase();
  const hasForbiddenContent = forbiddenWords.some(word => 
    lowerText.includes(word)
  );
  
  return {
    isAppropriate: !hasForbiddenContent,
    flaggedWords: forbiddenWords.filter(word => lowerText.includes(word))
  };
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
  console.log('Requesting all teachers');
  console.log('Available teacher profiles:', Object.keys(teacherProfiles));
  
  // Собираем преподавателей из teacherProfiles
  const teachers = Object.entries(teacherProfiles).map(([id, profile]) => ({
    id,
    name: profile.name || '',
    avatar: profile.avatar || '',
    profile
  }));
  
  console.log('Returning teachers:', teachers);
  res.json(teachers);
});

// Endpoint для получения всех пользователей
app.get('/api/users', (req, res) => {
  try {
    console.log('📡 /api/users endpoint called');
    console.log('📊 Current data:');
    console.log('- teacherProfiles keys:', Object.keys(teacherProfiles));
    console.log('- studentProfiles keys:', Object.keys(studentProfiles));
    console.log('- teacherProfiles count:', Object.keys(teacherProfiles).length);
    console.log('- studentProfiles count:', Object.keys(studentProfiles).length);
    
    // Получаем пользователей из server_data.json
    const users = [];
    
    // Добавляем преподавателей
    Object.entries(teacherProfiles).forEach(([id, profile]) => {
      const user = {
        id,
        email: profile.email || '',
        name: profile.name || '',
        nickname: profile.nickname || '',
        role: 'teacher',
        phone: profile.phone || '',
        profile: profile
      };
      users.push(user);
      console.log('👨‍🏫 Added teacher:', user.id, user.name, user.email);
    });
    
    // Добавляем студентов
    Object.entries(studentProfiles).forEach(([id, profile]) => {
      const user = {
        id,
        email: profile.email || '',
        name: profile.name || '',
        nickname: profile.nickname || '',
        role: 'student',
        phone: profile.phone || '',
        profile: profile
      };
      users.push(user);
      console.log('👨‍🎓 Added student:', user.id, user.name, user.email);
    });
    
    console.log('✅ Total users to return:', users.length);
    console.log('📤 Sending users:', users);
    
    res.json(users);
  } catch (error) {
    console.error('❌ Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Endpoint для получения всех уроков
app.get('/api/lessons', (req, res) => {
  try {
    console.log('Lessons endpoint called, returning', lessons.length, 'lessons');
    res.json(lessons);
  } catch (error) {
    console.error('Error getting lessons:', error);
    res.status(500).json({ error: 'Failed to get lessons' });
  }
});

// Endpoint для регистрации пользователя
app.post('/api/register', (req, res) => {
  try {
    console.log('📝 /api/register endpoint called');
    console.log('📝 Request body:', req.body);
    
    const { email, password, name, nickname, role, phone } = req.body;
    
    // Проверяем обязательные поля
    if (!email || !name || !nickname || !role || !phone) {
      console.log('❌ Missing required fields:', { email: !!email, name: !!name, nickname: !!nickname, role: !!role, phone: !!phone });
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
    
    console.log('👤 Creating new user:', newUser);
    
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
      console.log('👨‍🏫 Added teacher profile:', userId, teacherProfiles[userId]);
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
      console.log('👨‍🎓 Added student profile:', userId, studentProfiles[userId]);
    }
    
    // Сохраняем данные на сервере
    saveServerData();
    
    // Отправляем уведомление всем подключенным клиентам
    io.emit('userRegistered', newUser);
    
    // Также отправляем обновленные профили в зависимости от роли
    if (role === 'teacher') {
      io.emit('teacherProfiles', teacherProfiles);
    } else if (role === 'student') {
      io.emit('studentProfiles', studentProfiles);
    }
    
    // Отправляем обновленные данные всем клиентам для синхронизации
    console.log('📡 Emitting dataUpdated event to all clients');
    io.emit('dataUpdated', {
      type: 'userRegistered',
      timeSlots: timeSlots,
      teacherProfiles: teacherProfiles,
      studentProfiles: studentProfiles
    });
    
    console.log('✅ Registration successful, sending response:', newUser);
    res.status(201).json(newUser);
    
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Endpoint для обновления профиля пользователя
app.post('/api/updateProfile', (req, res) => {
  try {
    const { userId, profileData, role } = req.body;
    
    if (!userId || !profileData || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Обновляем профиль в зависимости от роли
    if (role === 'teacher') {
      if (teacherProfiles[userId]) {
        teacherProfiles[userId] = {
          ...teacherProfiles[userId],
          ...profileData
        };
      } else {
        return res.status(404).json({ error: 'Teacher profile not found' });
      }
    } else if (role === 'student') {
      if (studentProfiles[userId]) {
        studentProfiles[userId] = {
          ...studentProfiles[userId],
          ...profileData
        };
      } else {
        return res.status(404).json({ error: 'Student profile not found' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    // Сохраняем данные на сервере
    saveServerData();
    
    // Отправляем уведомление всем подключенным клиентам
    io.emit('profileUpdated', {
      id: userId,
      role: role,
      profile: role === 'teacher' ? teacherProfiles[userId] : studentProfiles[userId]
    });
    
    console.log(`Profile updated for ${role} ${userId}:`, profileData);
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile: role === 'teacher' ? teacherProfiles[userId] : studentProfiles[userId]
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Endpoint для получения пользователя по ID
app.get('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Requesting user with ID: ${id}`);
    console.log('Available teacher profiles:', Object.keys(teacherProfiles));
    console.log('Available student profiles:', Object.keys(studentProfiles));
    
    // Ищем в преподавателях
    if (teacherProfiles[id]) {
      console.log('Found teacher profile:', teacherProfiles[id]);
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
      console.log('Found student profile:', studentProfiles[id]);
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
    
    console.log(`User with ID ${id} not found`);
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
    saveServerData();
    
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
    saveServerData();
    
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

// Обработчик для SPA маршрутов - должен быть последним
app.get('*', (req, res) => {
  // Не обрабатываем API маршруты через SPA
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Для всех остальных маршрутов возвращаем SPA
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

  server.listen(PORT, HOST, () => {
    console.log(`🚀 Сервер запущен на http://${HOST}:${PORT}`);
    console.log(`📊 Статистика сервера:`);
    console.log(`   👨‍🏫 Преподавателей: ${Object.keys(teacherProfiles).length}`);
    console.log(`   👨‍🎓 Студентов: ${Object.keys(studentProfiles).length}`);
    console.log(`   📅 Слотов: ${timeSlots.length}`);
    console.log(`   📚 Уроков: ${lessons.length}`);
  });