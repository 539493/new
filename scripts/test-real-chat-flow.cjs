#!/usr/bin/env node

/**
 * Тест для проверки реального потока создания чатов между учеником и репетитором
 */

const io = require('socket.io-client');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

console.log('🧪 Тестирование реального потока чатов...');
console.log(`📡 Подключение к серверу: ${SERVER_URL}`);

// Создаем два клиента - ученик и репетитор
const studentClient = io(SERVER_URL);
const teacherClient = io(SERVER_URL);

let testResults = {
  studentConnection: false,
  teacherConnection: false,
  chatCreation: false,
  teacherReceived: false,
  messageSending: false
};

// Реальные данные как в системе
const student = {
  id: 'student_123',
  name: 'Иван Ученик',
  role: 'student'
};

const teacher = {
  id: 'teacher_456', 
  name: 'Мария Преподаватель',
  role: 'teacher'
};

let testChatId = null;

// Подключение ученика
studentClient.on('connect', () => {
  console.log('✅ Ученик подключен к серверу');
  testResults.studentConnection = true;
  
  // Подключаемся к комнатам
  studentClient.emit('joinNotifications', { userId: student.id });
  studentClient.emit('joinRoom', 'all_users');
  
  console.log(`📝 Ученик ${student.name} (${student.id}) подключился`);
});

// Подключение репетитора
teacherClient.on('connect', () => {
  console.log('✅ Репетитор подключен к серверу');
  testResults.teacherConnection = true;
  
  // Подключаемся к комнатам
  teacherClient.emit('joinNotifications', { userId: teacher.id });
  teacherClient.emit('joinRoom', 'all_users');
  
  console.log(`👨‍🏫 Репетитор ${teacher.name} (${teacher.id}) подключился`);
  
  // Начинаем тест после подключения обеих сторон
  setTimeout(() => {
    testChatCreation();
  }, 1000);
});

// Тест создания чата учеником
function testChatCreation() {
  console.log('\n🧪 Тест: Ученик создает чат с репетитором...');
  
  const newChat = {
    id: `chat_${Date.now()}`,
    participants: [student.id, teacher.id],
    participantNames: [student.name, teacher.name],
    messages: []
  };
  
  testChatId = newChat.id;
  
  console.log(`📤 Ученик создает чат: ${newChat.id}`);
  console.log(`👥 Участники: ${newChat.participants.join(', ')}`);
  
  studentClient.emit('createChat', newChat);
  testResults.chatCreation = true;
}

// Репетитор получает событие создания чата
teacherClient.on('chatCreated', (chat) => {
  console.log(`\n✅ Репетитор получил событие chatCreated: ${chat.id}`);
  console.log(`👥 Участники чата: ${chat.participants.join(', ')}`);
  console.log(`📝 Имена участников: ${chat.participantNames.join(', ')}`);
  
  // Проверяем, включен ли репетитор в участники
  if (chat.participants.includes(teacher.id)) {
    console.log(`✅ Репетитор ${teacher.id} найден в участниках чата`);
    testResults.teacherReceived = true;
  } else {
    console.log(`❌ Репетитор ${teacher.id} НЕ найден в участниках чата`);
  }
  
  // Переходим к тесту сообщений
  setTimeout(() => {
    testMessageSending();
  }, 1000);
});

// Ученик также получает подтверждение
studentClient.on('chatCreated', (chat) => {
  console.log(`📝 Ученик получил подтверждение создания чата: ${chat.id}`);
});

// Тест отправки сообщения
function testMessageSending() {
  console.log('\n🧪 Тест: Ученик отправляет сообщение...');
  
  const message = {
    id: `msg_${Date.now()}`,
    senderId: student.id,
    senderName: student.name,
    receiverId: teacher.id,
    receiverName: teacher.name,
    content: 'Привет! Можете помочь мне с математикой?',
    timestamp: new Date().toISOString(),
    isRead: false
  };
  
  console.log(`📤 Отправка сообщения от ${student.name} к ${teacher.name}`);
  studentClient.emit('sendMessage', { chatId: testChatId, message });
  testResults.messageSending = true;
}

// Репетитор получает сообщение
teacherClient.on('receiveMessage', (data) => {
  console.log(`\n✅ Репетитор получил сообщение в чате ${data.chatId}`);
  console.log(`💬 Сообщение: "${data.message.content}"`);
  console.log(`👤 От: ${data.message.senderName} (${data.message.senderId})`);
  
  // Завершаем тест
  setTimeout(() => {
    checkTestResults();
  }, 1000);
});

// Проверка результатов тестирования
function checkTestResults() {
  console.log('\n📊 Результаты тестирования:');
  console.log('================================');
  console.log(`Подключение ученика: ${testResults.studentConnection ? '✅' : '❌'}`);
  console.log(`Подключение репетитора: ${testResults.teacherConnection ? '✅' : '❌'}`);
  console.log(`Создание чата: ${testResults.chatCreation ? '✅' : '❌'}`);
  console.log(`Получение чата репетитором: ${testResults.teacherReceived ? '✅' : '❌'}`);
  console.log(`Отправка сообщения: ${testResults.messageSending ? '✅' : '❌'}`);
  
  const allTestsPassed = Object.values(testResults).every(result => result === true);
  
  if (allTestsPassed) {
    console.log('\n🎉 Все тесты пройдены успешно!');
    console.log('✅ Система чатов работает корректно');
    console.log('\n💡 Если чаты не отображаются в браузере, проблема в фильтрации по user.id');
  } else {
    console.log('\n❌ Некоторые тесты не пройдены');
    console.log('🔧 Проверьте WebSocket соединение и обработчики событий');
  }
  
  console.log('\n📋 Рекомендации:');
  console.log('1. Откройте консоль браузера и проверьте логи');
  console.log('2. Убедитесь, что user.id в AuthContext совпадает с ID в чатах');
  console.log('3. Проверьте фильтрацию чатов в ChatList.tsx');
  
  // Закрываем соединения
  studentClient.disconnect();
  teacherClient.disconnect();
  
  process.exit(allTestsPassed ? 0 : 1);
}

// Обработка ошибок
studentClient.on('connect_error', (error) => {
  console.error('❌ Ошибка подключения ученика:', error.message);
  process.exit(1);
});

teacherClient.on('connect_error', (error) => {
  console.error('❌ Ошибка подключения репетитора:', error.message);
  process.exit(1);
});

// Таймаут для тестирования
setTimeout(() => {
  console.log('\n⏰ Таймаут тестирования');
  checkTestResults();
}, 15000);
