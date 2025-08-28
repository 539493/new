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
  "http://localhost:4173", 
  "https://*.vercel.app",
  "https://*.onrender.com",
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

function loadServerData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      console.log('Loaded server data from file');
      return data;
    } else {
      console.log('No server data file found, creating new one');
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

function saveServerData() {
  try {
    const data = {
      teacherProfiles,
      studentProfiles,
      overbookingRequests,
      timeSlots,
      lessons,
      chats,
      posts
    };
    console.log('=== SAVING SERVER DATA ===');
    console.log('Data file path:', DATA_FILE);
    console.log('Teacher profiles count:', Object.keys(teacherProfiles).length);
    console.log('Student profiles count:', Object.keys(studentProfiles).length);
    console.log('Overbooking requests count:', overbookingRequests.length);
    console.log('Time slots count:', timeSlots.length);
    console.log('Lessons count:', lessons.length);
    console.log('Chats count:', chats.length);
    console.log('Posts count:', posts.length);
    
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
// Хранилище для постов
let posts = Array.isArray(serverData.posts) ? serverData.posts : [];

// Тестовое сохранение при запуске для проверки работы функции
console.log('=== TESTING SAVE FUNCTION ===');
saveServerData();
console.log('=== TEST COMPLETED ===');

// Очищаем старые слоты при запуске сервера
cleanupOldSlots();

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
  
  // Отправляем профили преподавателей новому клиенту
  socket.emit('teacherProfiles', teacherProfiles);
  
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
    console.log('Slot cancelled:', data);
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
      saveServerData(); // Сохраняем данные в файл
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

  // Обработка подключения к видео комнате
  socket.on('video-join', (data) => {
    const { roomId, userName, userRole } = data;
    if (!rooms[roomId]) rooms[roomId] = new Set();
    rooms[roomId].add(socket.id);
    socket.join(roomId);
    console.log(`[Video] ${userName} (${userRole}) joined video room ${roomId}`);
    
    // Уведомляем пользователя о успешном подключении
    socket.emit('video-connected', { roomId });
    
    // Уведомляем других участников о новом пользователе
    socket.to(roomId).emit('video-user-joined', { userName, userRole });
  });

  // Обработка WebRTC offer
  socket.on('video-offer', (data) => {
    const { roomId, offer } = data;
    console.log(`[Video] Forwarding offer in room ${roomId}`);
    socket.to(roomId).emit('video-offer', { offer });
  });

  // Обработка WebRTC answer
  socket.on('video-answer', (data) => {
    const { roomId, answer } = data;
    console.log(`[Video] Forwarding answer in room ${roomId}`);
    socket.to(roomId).emit('video-answer', { answer });
  });

  // Обработка ICE кандидатов
  socket.on('video-ice-candidate', (data) => {
    const { roomId, candidate } = data;
    console.log(`[Video] Forwarding ICE candidate in room ${roomId}`);
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
    console.log(`[Video] ${userName} left video room ${roomId}`);
  });

  // Старые события для обратной совместимости
  socket.on('join-room', (roomId) => {
    if (!rooms[roomId]) rooms[roomId] = new Set();
    rooms[roomId].add(socket.id);
    socket.join(roomId);
    console.log(`[WebRTC] ${socket.id} joined room ${roomId}`);
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
    console.log(`[WebRTC] ${socket.id} left room ${roomId}`);
  });

  // ===== ОБРАБОТЧИКИ ДЛЯ ПОСТОВ =====
  
  // Создание поста
  socket.on('createPost', (postData) => {
    console.log('[POSTS] Creating new post:', postData);
    
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
    
    console.log('[POSTS] Post created successfully, total posts:', posts.length);
  });

  // Добавление реакции
  socket.on('addReaction', (data) => {
    console.log('[POSTS] Adding reaction:', data);
    
    const { postId, reactionType, userId } = data;
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      console.log('[POSTS] Post not found:', postId);
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
    console.log('[POSTS] Adding comment:', data);
    
    const { postId, comment } = data;
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      console.log('[POSTS] Post not found:', postId);
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
    
    console.log('[POSTS] Comment added successfully');
  });

  // Редактирование поста
  socket.on('editPost', (data) => {
    console.log('[POSTS] Editing post:', data);
    
    const { postId, newText } = data;
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      console.log('[POSTS] Post not found:', postId);
      return;
    }
    
    post.text = newText;
    post.tags = extractTags(newText);
    post.editedAt = new Date().toISOString();
    saveServerData();
    
    // Отправляем обновление всем клиентам
    io.emit('postEdited', { postId, text: newText, tags: post.tags, editedAt: post.editedAt });
    
    console.log('[POSTS] Post edited successfully');
  });

  // Удаление поста
  socket.on('deletePost', (data) => {
    console.log('[POSTS] Deleting post:', data);
    
    const { postId } = data;
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) {
      console.log('[POSTS] Post not found:', postId);
      return;
    }
    
    posts.splice(postIndex, 1);
    saveServerData();
    
    // Отправляем всем клиентам
    io.emit('postDeleted', { postId });
    
    console.log('[POSTS] Post deleted successfully');
  });

  // Закладка поста
  socket.on('bookmarkPost', (data) => {
    console.log('[POSTS] Bookmarking post:', data);
    
    const { postId, userId } = data;
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      console.log('[POSTS] Post not found:', postId);
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
    
    console.log('[POSTS] Post bookmark updated');
  });

  // Запрос всех постов
  socket.on('requestAllPosts', () => {
    console.log('[POSTS] Requesting all posts');
    socket.emit('allPosts', posts);
  });

  // Поиск постов
  socket.on('searchPosts', (searchData) => {
    console.log('[POSTS] Searching posts:', searchData);
    
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
    console.log('[POSTS] Search completed, found:', filteredPosts.length, 'posts');
  });

  // Подписка на уведомления
  socket.on('subscribeNotifications', (userId) => {
    console.log('[NOTIFICATIONS] User subscribing to notifications:', userId);
    socket.join(`notifications_${userId}`);
  });

  // Отписка от уведомлений
  socket.on('unsubscribeNotifications', (userId) => {
    console.log('[NOTIFICATIONS] User unsubscribing from notifications:', userId);
    socket.leave(`notifications_${userId}`);
  });

  // Запрос уведомлений пользователя
  socket.on('requestUserNotifications', (userId) => {
    console.log('[NOTIFICATIONS] Requesting notifications for user:', userId);
    const userNotifications = notifications.filter(n => n.userId === userId);
    socket.emit('userNotifications', userNotifications);
  });

  // Отметка уведомления как прочитанного
  socket.on('markNotificationAsRead', (notificationId) => {
    console.log('[NOTIFICATIONS] Marking notification as read:', notificationId);
    
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date().toISOString();
      saveServerData();
      
      socket.emit('notificationMarkedAsRead', { notificationId });
    }
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
  // Собираем преподавателей из teacherProfiles
  const teachers = Object.entries(teacherProfiles).map(([id, profile]) => ({
    id,
    name: profile.name || '',
    avatar: profile.avatar || '',
    profile
  }));
  res.json(teachers);
});

// Endpoint для получения всех пользователей
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

// Endpoint для регистрации пользователя
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
    saveServerData();
    
    // Отправляем уведомление всем подключенным клиентам
    io.emit('userRegistered', newUser);
    
    console.log('New user registered:', newUser);
    res.status(201).json(newUser);
    
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Endpoint для получения пользователя по ID
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