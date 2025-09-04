#!/usr/bin/env node

/**
 * Простой тест для проверки создания чатов
 */

const io = require('socket.io-client');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

console.log('🧪 Тестирование создания чатов...');
console.log(`📡 Подключение к серверу: ${SERVER_URL}`);

// Создаем клиент для тестирования
const client = io(SERVER_URL);

let testResults = {
  connection: false,
  chatCreation: false,
  chatReceived: false
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

// Тест 1: Подключение к серверу
client.on('connect', () => {
  console.log('✅ Клиент подключен к серверу');
  testResults.connection = true;
  
  // Подключаемся к комнате уведомлений
  client.emit('joinNotifications', { userId: testUser1.id });
  client.emit('joinRoom', 'all_users');
  
  // Начинаем тестирование
  setTimeout(() => {
    testChatCreation();
  }, 1000);
});

// Тест 2: Создание чата
function testChatCreation() {
  console.log('🧪 Тест: Создание чата...');
  
  const newChat = {
    id: `test_chat_${Date.now()}`,
    participants: [testUser1.id, testUser2.id],
    participantNames: [testUser1.name, testUser2.name],
    messages: []
  };
  
  client.emit('createChat', newChat);
  testChatId = newChat.id;
  testResults.chatCreation = true;
}

// Обработчик создания чата
client.on('chatCreated', (chat) => {
  console.log('✅ Получено событие chatCreated:', chat.id);
  testResults.chatReceived = true;
  
  // Проверяем результаты
  setTimeout(() => {
    checkTestResults();
  }, 1000);
});

// Проверка результатов тестирования
function checkTestResults() {
  console.log('\n📊 Результаты тестирования:');
  console.log('================================');
  console.log(`Подключение к серверу: ${testResults.connection ? '✅' : '❌'}`);
  console.log(`Создание чата: ${testResults.chatCreation ? '✅' : '❌'}`);
  console.log(`Получение события chatCreated: ${testResults.chatReceived ? '✅' : '❌'}`);
  
  const allTestsPassed = Object.values(testResults).every(result => result === true);
  
  if (allTestsPassed) {
    console.log('\n🎉 Все тесты пройдены успешно!');
    console.log('✅ Создание чатов работает корректно');
  } else {
    console.log('\n❌ Некоторые тесты не пройдены');
    console.log('🔧 Требуется дополнительная настройка');
  }
  
  // Закрываем соединение
  client.disconnect();
  
  process.exit(allTestsPassed ? 0 : 1);
}

// Обработка ошибок
client.on('connect_error', (error) => {
  console.error('❌ Ошибка подключения:', error.message);
  process.exit(1);
});

// Таймаут для тестирования
setTimeout(() => {
  console.log('\n⏰ Таймаут тестирования');
  checkTestResults();
}, 10000);
