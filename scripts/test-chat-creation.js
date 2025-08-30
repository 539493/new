const io = require('socket.io-client');

// Тестовые данные
const testData = {
  student: {
    id: 'student_test_001',
    name: 'Тестовый Ученик',
    email: 'student@test.com'
  },
  teacher: {
    id: 'teacher_test_001', 
    name: 'Тестовый Репетитор',
    email: 'teacher@test.com'
  }
};

// Подключаемся к серверу
const socket = io('http://localhost:3001');

console.log('🔗 Подключение к серверу...');

socket.on('connect', () => {
  console.log('✅ Подключен к серверу');
  
  // Тест 1: Создание чата
  console.log('\n📝 Тест 1: Создание чата между учеником и репетитором');
  
  const newChat = {
    id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    participants: [testData.student.id, testData.teacher.id],
    participantNames: [testData.student.name, testData.teacher.name],
    messages: []
  };
  
  console.log('Отправляем createChat:', newChat);
  socket.emit('createChat', newChat);
});

// Слушаем событие создания чата
socket.on('chatCreated', (chat) => {
  console.log('✅ Чат создан:', chat);
  
  // Тест 2: Отправка сообщения
  console.log('\n💬 Тест 2: Отправка сообщения');
  
  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    senderId: testData.student.id,
    senderName: testData.student.name,
    content: 'Привет! Можете ли вы помочь мне с математикой?',
    timestamp: new Date().toISOString(),
    isRead: false
  };
  
  console.log('Отправляем сообщение:', message);
  socket.emit('sendMessage', { chatId: chat.id, message });
});

// Слушаем получение сообщений
socket.on('receiveMessage', (data) => {
  console.log('✅ Сообщение получено:', data);
  
  // Тест 3: Отметка как прочитанное
  console.log('\n👁️ Тест 3: Отметка чата как прочитанного');
  socket.emit('markChatAsRead', { chatId: data.chatId });
});

// Слушаем отметку как прочитанное
socket.on('chatMarkedAsRead', (data) => {
  console.log('✅ Чат отмечен как прочитанный:', data);
  
  // Тест 4: Архивирование чата
  console.log('\n📦 Тест 4: Архивирование чата');
  socket.emit('archiveChat', { chatId: data.chatId });
});

// Слушаем архивирование
socket.on('chatArchived', (data) => {
  console.log('✅ Чат архивирован:', data);
  
  // Завершаем тест
  console.log('\n🎉 Все тесты завершены успешно!');
  setTimeout(() => {
    socket.disconnect();
    process.exit(0);
  }, 1000);
});

// Обработка ошибок
socket.on('connect_error', (error) => {
  console.error('❌ Ошибка подключения:', error.message);
  process.exit(1);
});

socket.on('error', (error) => {
  console.error('❌ Ошибка сокета:', error);
});

// Таймаут для завершения
setTimeout(() => {
  console.log('⏰ Таймаут теста');
  socket.disconnect();
  process.exit(1);
}, 10000);
