#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки работы системы чатов
 * Проверяет отправку и получение сообщений
 */

const io = require('socket.io-client');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

console.log('🧪 Тестирование системы чатов...');
console.log(`📡 Подключение к серверу: ${SERVER_URL}`);

// Создаем два клиента для тестирования
const client1 = io(SERVER_URL);
const client2 = io(SERVER_URL);

let testResults = {
  connection: false,
  chatCreation: false,
  messageSending: false,
  messageReceiving: false,
  notifications: false
};

// Тестовые данные
const testUser1 = {
  id: 'test_user_1',
  name: 'Тестовый Ученик',
  role: 'student'
};

const testUser2 = {
  id: 'test_user_2', 
  name: 'Тестовый Преподаватель',
  role: 'teacher'
};

let testChatId = null;
let testMessageId = null;

// Тест 1: Подключение к серверу
client1.on('connect', () => {
  console.log('✅ Клиент 1 подключен к серверу');
  testResults.connection = true;
  
  // Подключаемся к комнате уведомлений
  client1.emit('joinNotifications', { userId: testUser1.id });
});

client2.on('connect', () => {
  console.log('✅ Клиент 2 подключен к серверу');
  
  // Подключаемся к комнате уведомлений
  client2.emit('joinNotifications', { userId: testUser2.id });
  
  // Начинаем тестирование после подключения обоих клиентов
  setTimeout(() => {
    testChatCreation();
  }, 1000);
});

// Тест 2: Создание чата
function testChatCreation() {
  console.log('🧪 Тест 2: Создание чата...');
  
  const newChat = {
    id: `test_chat_${Date.now()}`,
    participants: [testUser1.id, testUser2.id],
    participantNames: [testUser1.name, testUser2.name],
    messages: []
  };
  
  client1.emit('createChat', newChat);
  testChatId = newChat.id;
}

// Обработчик создания чата
client1.on('chatCreated', (chat) => {
  console.log('✅ Чат создан:', chat.id);
  testResults.chatCreation = true;
  
  // Переходим к тесту отправки сообщения
  setTimeout(() => {
    testMessageSending();
  }, 1000);
});

client2.on('chatCreated', (chat) => {
  console.log('✅ Клиент 2 получил уведомление о создании чата:', chat.id);
});

// Тест 3: Отправка сообщения
function testMessageSending() {
  console.log('🧪 Тест 3: Отправка сообщения...');
  
  const testMessage = {
    id: `test_msg_${Date.now()}`,
    senderId: testUser1.id,
    senderName: testUser1.name,
    receiverId: testUser2.id,
    receiverName: testUser2.name,
    content: 'Привет! Это тестовое сообщение.',
    timestamp: new Date().toISOString(),
    isRead: false
  };
  
  client1.emit('sendMessage', { 
    chatId: testChatId, 
    message: testMessage 
  });
  
  testMessageId = testMessage.id;
}

// Обработчик получения сообщения
client1.on('receiveMessage', (data) => {
  console.log('✅ Клиент 1 получил сообщение:', data.message.content);
  testResults.messageSending = true;
});

client2.on('receiveMessage', (data) => {
  console.log('✅ Клиент 2 получил сообщение:', data.message.content);
  testResults.messageReceiving = true;
  
  // Переходим к тесту уведомлений
  setTimeout(() => {
    testNotifications();
  }, 1000);
});

// Тест 4: Уведомления
function testNotifications() {
  console.log('🧪 Тест 4: Проверка уведомлений...');
  
  // Уведомления должны были быть отправлены автоматически при отправке сообщения
  // Ждем немного и проверяем результат
  setTimeout(() => {
    checkTestResults();
  }, 2000);
}

// Обработчик уведомлений
client2.on('newNotification', (notification) => {
  console.log('✅ Клиент 2 получил уведомление:', notification.title);
  testResults.notifications = true;
});

// Проверка результатов тестирования
function checkTestResults() {
  console.log('\n📊 Результаты тестирования:');
  console.log('================================');
  console.log(`Подключение к серверу: ${testResults.connection ? '✅' : '❌'}`);
  console.log(`Создание чата: ${testResults.chatCreation ? '✅' : '❌'}`);
  console.log(`Отправка сообщения: ${testResults.messageSending ? '✅' : '❌'}`);
  console.log(`Получение сообщения: ${testResults.messageReceiving ? '✅' : '❌'}`);
  console.log(`Уведомления: ${testResults.notifications ? '✅' : '❌'}`);
  
  const allTestsPassed = Object.values(testResults).every(result => result === true);
  
  if (allTestsPassed) {
    console.log('\n🎉 Все тесты пройдены успешно!');
    console.log('✅ Система чатов работает корректно');
  } else {
    console.log('\n❌ Некоторые тесты не пройдены');
    console.log('🔧 Требуется дополнительная настройка');
  }
  
  // Закрываем соединения
  client1.disconnect();
  client2.disconnect();
  
  process.exit(allTestsPassed ? 0 : 1);
}

// Обработка ошибок
client1.on('connect_error', (error) => {
  console.error('❌ Ошибка подключения клиента 1:', error.message);
  process.exit(1);
});

client2.on('connect_error', (error) => {
  console.error('❌ Ошибка подключения клиента 2:', error.message);
  process.exit(1);
});

// Таймаут для тестирования
setTimeout(() => {
  console.log('\n⏰ Таймаут тестирования');
  checkTestResults();
}, 30000);
