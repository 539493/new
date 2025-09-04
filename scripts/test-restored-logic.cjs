#!/usr/bin/env node

/**
 * Тест восстановленной логики чатов
 */

const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3001';

console.log('🧪 Тестирование восстановленной логики чатов...');

// Создаем два клиента - ученик и репетитор
const studentSocket = io(SERVER_URL);
const teacherSocket = io(SERVER_URL);

let studentConnected = false;
let teacherConnected = false;
let chatCreated = false;
let messageReceived = false;

// Тестовые данные
const studentId = 'test_student_restored';
const teacherId = 'test_teacher_restored';
const studentName = 'Тестовый Ученик (Восстановлено)';
const teacherName = 'Тестовый Репетитор (Восстановлено)';

// Обработчики для ученика
studentSocket.on('connect', () => {
  console.log('✅ Ученик подключен');
  studentConnected = true;
  
  if (teacherConnected) {
    testChatFlow();
  }
});

studentSocket.on('chatCreated', (chat) => {
  console.log('✅ Ученик получил событие chatCreated:', chat.id);
  chatCreated = true;
  
  // Отправляем сообщение
  const message = {
    id: `msg_${Date.now()}`,
    senderId: studentId,
    senderName: studentName,
    receiverId: teacherId,
    receiverName: teacherName,
    content: 'Привет! Это тест восстановленной логики.',
    timestamp: new Date().toISOString(),
    isRead: false
  };
  
  console.log('📤 Ученик отправляет сообщение...');
  studentSocket.emit('sendMessage', { chatId: chat.id, message });
});

studentSocket.on('receiveMessage', (data) => {
  console.log('✅ Ученик получил сообщение:', data.message.content);
});

// Обработчики для репетитора
teacherSocket.on('connect', () => {
  console.log('✅ Репетитор подключен');
  teacherConnected = true;
  
  if (studentConnected) {
    testChatFlow();
  }
});

teacherSocket.on('chatCreated', (chat) => {
  console.log('✅ Репетитор получил событие chatCreated:', chat.id);
  chatCreated = true;
});

teacherSocket.on('receiveMessage', (data) => {
  console.log('✅ Репетитор получил сообщение:', data.message.content);
  messageReceived = true;
  
  // Тест завершен успешно
  console.log('\n🎉 ТЕСТ ПРОЙДЕН УСПЕШНО!');
  console.log('✅ Создание чата работает');
  console.log('✅ Отправка сообщений работает');
  console.log('✅ Получение сообщений работает');
  
  // Закрываем соединения
  studentSocket.disconnect();
  teacherSocket.disconnect();
  process.exit(0);
});

function testChatFlow() {
  console.log('\n🚀 Начинаем тест...');
  
  // Создаем чат
  const newChat = {
    id: `chat_${Date.now()}_restored`,
    participants: [studentId, teacherId],
    participantNames: [studentName, teacherName],
    messages: []
  };
  
  console.log('📤 Создаем чат...');
  studentSocket.emit('createChat', newChat);
}

// Таймаут для теста
setTimeout(() => {
  if (!chatCreated) {
    console.log('❌ ТЕСТ НЕ ПРОЙДЕН: Чат не создался');
  } else if (!messageReceived) {
    console.log('❌ ТЕСТ НЕ ПРОЙДЕН: Сообщение не доставлено');
  }
  
  studentSocket.disconnect();
  teacherSocket.disconnect();
  process.exit(1);
}, 10000);

console.log('⏳ Ожидаем подключения клиентов...');
