#!/usr/bin/env node

/**
 * Скрипт для тестирования синхронизации аватаров между устройствами
 * Запуск: node scripts/test-avatar-sync.js
 */

const io = require('socket.io-client');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:10000';

console.log('🧪 Тестирование синхронизации аватаров...');
console.log(`📡 Подключение к серверу: ${SERVER_URL}`);

// Создаем два клиента для симуляции разных устройств
const client1 = io(SERVER_URL);
const client2 = io(SERVER_URL);

let testResults = {
  connection: false,
  profileUpdate: false,
  sync: false
};

// Тест 1: Подключение к серверу
client1.on('connect', () => {
  console.log('✅ Клиент 1 подключен к серверу');
  client2.on('connect', () => {
    console.log('✅ Клиент 2 подключен к серверу');
    testResults.connection = true;
    
    // Тест 2: Отправка обновления профиля
    console.log('📤 Отправка тестового обновления профиля...');
    
    const testProfile = {
      teacherId: 'test_teacher_123',
      profile: {
        name: 'Тестовый Репетитор',
        email: 'test@example.com',
        avatar: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        subjects: ['Математика'],
        experience: 'experienced',
        bio: 'Тестовый профиль для проверки синхронизации'
      }
    };
    
    client1.emit('updateTeacherProfile', testProfile);
  });
});

// Тест 3: Проверка получения обновления
client2.on('profileUpdated', (data) => {
  console.log('📥 Клиент 2 получил обновление профиля:', data);
  testResults.profileUpdate = true;
  
  if (data.type === 'teacher' && data.userId === 'test_teacher_123') {
    console.log('✅ Синхронизация профиля работает!');
    testResults.sync = true;
  }
});

client2.on('teacherProfileUpdated', (data) => {
  console.log('📥 Клиент 2 получил teacherProfileUpdated:', data);
  testResults.profileUpdate = true;
  
  if (data.teacherId === 'test_teacher_123') {
    console.log('✅ Событие teacherProfileUpdated работает!');
    testResults.sync = true;
  }
});

client2.on('dataUpdated', (data) => {
  console.log('📥 Клиент 2 получил dataUpdated:', data.type);
  testResults.profileUpdate = true;
  
  if (data.type === 'teacherProfileUpdated') {
    console.log('✅ Событие dataUpdated работает!');
    testResults.sync = true;
  }
});

// Завершение тестов через 5 секунд
setTimeout(() => {
  console.log('\n📊 Результаты тестирования:');
  console.log(`🔗 Подключение к серверу: ${testResults.connection ? '✅' : '❌'}`);
  console.log(`📤 Отправка обновления: ${testResults.profileUpdate ? '✅' : '❌'}`);
  console.log(`🔄 Синхронизация: ${testResults.sync ? '✅' : '❌'}`);
  
  if (testResults.connection && testResults.profileUpdate && testResults.sync) {
    console.log('\n🎉 Все тесты пройдены! Синхронизация аватаров работает корректно.');
  } else {
    console.log('\n⚠️ Некоторые тесты не пройдены. Проверьте настройки сервера.');
  }
  
  // Отключаем клиентов
  client1.disconnect();
  client2.disconnect();
  process.exit(0);
}, 5000);

// Обработка ошибок
client1.on('connect_error', (error) => {
  console.error('❌ Ошибка подключения клиента 1:', error.message);
});

client2.on('connect_error', (error) => {
  console.error('❌ Ошибка подключения клиента 2:', error.message);
});

client1.on('error', (error) => {
  console.error('❌ Ошибка клиента 1:', error);
});

client2.on('error', (error) => {
  console.error('❌ Ошибка клиента 2:', error);
});
