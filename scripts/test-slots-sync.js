#!/usr/bin/env node

/**
 * Скрипт для тестирования синхронизации слотов между устройствами
 * Запуск: node scripts/test-slots-sync.js
 */

const io = require('socket.io-client');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:10000';

console.log('🧪 Тестирование синхронизации слотов...');
console.log(`📡 Подключение к серверу: ${SERVER_URL}`);

// Создаем два клиента для симуляции разных устройств
const client1 = io(SERVER_URL);
const client2 = io(SERVER_URL);

let testResults = {
  connection: false,
  slotsLoaded: false,
  slotCreated: false,
  slotBooked: false,
  slotCancelled: false,
  slotDeleted: false
};

// Тест 1: Подключение к серверу
client1.on('connect', () => {
  console.log('✅ Клиент 1 подключен к серверу');
  client2.on('connect', () => {
    console.log('✅ Клиент 2 подключен к серверу');
    testResults.connection = true;
    
    // Запрашиваем все слоты
    client1.emit('requestAllSlots');
  });
});

// Тест 2: Загрузка слотов
client1.on('allSlots', (slots) => {
  console.log('📥 Клиент 1 получил слоты:', slots.length);
  testResults.slotsLoaded = true;
  
  if (slots.length > 0) {
    console.log('✅ Слоты загружены успешно');
    
    // Тест 3: Создание нового слота
    console.log('📤 Создание тестового слота...');
    
    const testSlot = {
      id: `test_slot_${Date.now()}`,
      teacherId: 'teacher_1',
      teacherName: 'Анна Петрова',
      teacherAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      date: '2025-01-20',
      startTime: '15:00',
      endTime: '16:00',
      duration: 60,
      subject: 'Математика',
      lessonType: 'regular',
      format: 'online',
      price: 1500,
      isBooked: false,
      experience: 'experienced',
      goals: ['ЕГЭ', 'ОГЭ'],
      grades: ['9', '10', '11'],
      rating: 4.8
    };
    
    client1.emit('createSlot', testSlot);
  }
});

// Тест 4: Проверка создания слота
client2.on('slotCreated', (newSlot) => {
  console.log('📥 Клиент 2 получил новый слот:', newSlot.id);
  testResults.slotCreated = true;
  
  if (newSlot.id.includes('test_slot_')) {
    console.log('✅ Создание слота работает!');
    
    // Тест 5: Бронирование слота
    console.log('📤 Бронирование тестового слота...');
    
    const testLesson = {
      id: `test_lesson_${Date.now()}`,
      studentId: 'student_1',
      teacherId: newSlot.teacherId,
      studentName: 'Алексей Иванов',
      teacherName: newSlot.teacherName,
      subject: newSlot.subject,
      date: newSlot.date,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      duration: newSlot.duration,
      format: newSlot.format,
      status: 'scheduled',
      price: newSlot.price,
      lessonType: newSlot.lessonType
    };
    
    client1.emit('bookSlot', {
      slotId: newSlot.id,
      lesson: testLesson,
      bookedStudentId: 'student_1'
    });
  }
});

// Тест 6: Проверка бронирования слота
client2.on('slotBooked', (data) => {
  console.log('📥 Клиент 2 получил бронирование слота:', data.slotId);
  testResults.slotBooked = true;
  
  if (data.slotId.includes('test_slot_')) {
    console.log('✅ Бронирование слота работает!');
    
    // Тест 7: Отмена бронирования
    console.log('📤 Отмена бронирования тестового слота...');
    
    client1.emit('cancelSlot', {
      slotId: data.slotId,
      lessonId: data.lesson.id
    });
  }
});

// Тест 8: Проверка отмены бронирования
client2.on('slotCancelled', (data) => {
  console.log('📥 Клиент 2 получил отмену бронирования:', data.slotId);
  testResults.slotCancelled = true;
  
  if (data.slotId.includes('test_slot_')) {
    console.log('✅ Отмена бронирования работает!');
    
    // Тест 9: Удаление слота
    console.log('📤 Удаление тестового слота...');
    
    client1.emit('deleteSlot', {
      slotId: data.slotId
    });
  }
});

// Тест 10: Проверка удаления слота
client2.on('slotDeleted', (data) => {
  console.log('📥 Клиент 2 получил удаление слота:', data.slotId);
  testResults.slotDeleted = true;
  
  if (data.slotId.includes('test_slot_')) {
    console.log('✅ Удаление слота работает!');
  }
});

// Проверка dataUpdated событий
client2.on('dataUpdated', (data) => {
  console.log('📥 Клиент 2 получил dataUpdated:', data.type);
  
  switch (data.type) {
    case 'slotCreated':
      console.log('✅ dataUpdated: slotCreated работает');
      break;
    case 'slotBooked':
      console.log('✅ dataUpdated: slotBooked работает');
      break;
    case 'slotCancelled':
      console.log('✅ dataUpdated: slotCancelled работает');
      break;
    case 'slotDeleted':
      console.log('✅ dataUpdated: slotDeleted работает');
      break;
  }
});

// Завершение тестов через 8 секунд
setTimeout(() => {
  console.log('\n📊 Результаты тестирования синхронизации слотов:');
  console.log(`🔗 Подключение к серверу: ${testResults.connection ? '✅' : '❌'}`);
  console.log(`📅 Загрузка слотов: ${testResults.slotsLoaded ? '✅' : '❌'}`);
  console.log(`➕ Создание слота: ${testResults.slotCreated ? '✅' : '❌'}`);
  console.log(`📖 Бронирование слота: ${testResults.slotBooked ? '✅' : '❌'}`);
  console.log(`❌ Отмена бронирования: ${testResults.slotCancelled ? '✅' : '❌'}`);
  console.log(`🗑️ Удаление слота: ${testResults.slotDeleted ? '✅' : '❌'}`);
  
  const allTestsPassed = Object.values(testResults).every(result => result);
  
  if (allTestsPassed) {
    console.log('\n🎉 Все тесты пройдены! Синхронизация слотов работает корректно.');
  } else {
    console.log('\n⚠️ Некоторые тесты не пройдены. Проверьте настройки сервера.');
  }
  
  // Отключаем клиентов
  client1.disconnect();
  client2.disconnect();
  process.exit(0);
}, 8000);

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
