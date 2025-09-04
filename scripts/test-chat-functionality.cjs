const { io } = require('socket.io-client');

// Конфигурация
const SERVER_URL = 'http://localhost:3001';

// Тестовые данные
const testStudent = {
  id: 'test_student_chat_' + Date.now(),
  name: 'Тестовый Ученик',
  role: 'student'
};

const testTeacher = {
  id: 'test_teacher_chat_' + Date.now(),
  name: 'Тестовый Преподаватель',
  role: 'teacher'
};

let studentSocket = null;
let teacherSocket = null;
let chatCreated = false;
let messageReceived = false;

console.log('🧪 Тестирование функциональности чатов...');
console.log('📋 Тестовые данные:');
console.log('- Ученик:', testStudent);
console.log('- Преподаватель:', testTeacher);

// Функция для подключения ученика
function connectStudent() {
  return new Promise((resolve, reject) => {
    console.log('🔌 Подключаем ученика...');
    
    studentSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000
    });

    studentSocket.on('connect', () => {
      console.log('✅ Ученик подключен:', studentSocket.id);
      resolve();
    });

    studentSocket.on('connect_error', (error) => {
      console.error('❌ Ошибка подключения ученика:', error);
      reject(error);
    });

    studentSocket.on('disconnect', () => {
      console.log('🔌 Ученик отключен');
    });
  });
}

// Функция для подключения преподавателя
function connectTeacher() {
  return new Promise((resolve, reject) => {
    console.log('🔌 Подключаем преподавателя...');
    
    teacherSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000
    });

    teacherSocket.on('connect', () => {
      console.log('✅ Преподаватель подключен:', teacherSocket.id);
      resolve();
    });

    teacherSocket.on('connect_error', (error) => {
      console.error('❌ Ошибка подключения преподавателя:', error);
      reject(error);
    });

    teacherSocket.on('disconnect', () => {
      console.log('🔌 Преподаватель отключен');
    });
  });
}

// Функция для создания чата
function createChat() {
  return new Promise((resolve, reject) => {
    console.log('💬 Создаем чат...');
    
    const newChat = {
      id: `test_chat_${Date.now()}`,
      participants: [testStudent.id, testTeacher.id],
      participantNames: [testStudent.name, testTeacher.name],
      messages: []
    };

    // Отправляем создание чата от ученика
    studentSocket.emit('createChat', newChat);
    
    // Слушаем подтверждение создания чата
    studentSocket.on('chatCreated', (chat) => {
      console.log('✅ Чат создан:', chat.id);
      chatCreated = true;
      resolve(chat);
    });

    teacherSocket.on('chatCreated', (chat) => {
      console.log('✅ Преподаватель получил уведомление о чате:', chat.id);
    });

    // Таймаут для создания чата
    setTimeout(() => {
      if (!chatCreated) {
        reject(new Error('Таймаут создания чата'));
      }
    }, 5000);
  });
}

// Функция для отправки сообщения
function sendMessage(chat) {
  return new Promise((resolve, reject) => {
    console.log('📤 Отправляем сообщение...');
    
    const message = {
      id: `test_msg_${Date.now()}`,
      senderId: testStudent.id,
      senderName: testStudent.name,
      receiverId: testTeacher.id,
      receiverName: testTeacher.name,
      content: 'Привет! Это тестовое сообщение.',
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // Отправляем сообщение
    studentSocket.emit('sendMessage', { chatId: chat.id, message });
    
    // Слушаем получение сообщения
    teacherSocket.on('receiveMessage', (data) => {
      console.log('✅ Преподаватель получил сообщение:', data.message.content);
      messageReceived = true;
      resolve(data);
    });

    studentSocket.on('receiveMessage', (data) => {
      console.log('✅ Ученик получил подтверждение сообщения:', data.message.content);
    });

    // Таймаут для отправки сообщения
    setTimeout(() => {
      if (!messageReceived) {
        reject(new Error('Таймаут отправки сообщения'));
      }
    }, 5000);
  });
}

// Основная функция тестирования
async function runTest() {
  try {
    console.log('🚀 Начинаем тестирование...');
    
    // Подключаем пользователей
    await connectStudent();
    await connectTeacher();
    
    // Создаем чат
    const chat = await createChat();
    
    // Отправляем сообщение
    await sendMessage(chat);
    
    console.log('🎉 ТЕСТ ПРОЙДЕН УСПЕШНО!');
    console.log('✅ Чат создан и работает');
    console.log('✅ Сообщения доставляются');
    
  } catch (error) {
    console.error('❌ ТЕСТ НЕ ПРОЙДЕН:', error.message);
  } finally {
    // Закрываем соединения
    if (studentSocket) {
      studentSocket.disconnect();
    }
    if (teacherSocket) {
      teacherSocket.disconnect();
    }
    
    console.log('🏁 Тестирование завершено');
    process.exit(0);
  }
}

// Запускаем тест
runTest();
