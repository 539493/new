#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Очистка всех пользователей из проекта...\n');

// Функция для очистки файла данных сервера
function clearServerData() {
  const serverDataFile = path.join(__dirname, 'backend', 'server_data.json');
  
  try {
    if (fs.existsSync(serverDataFile)) {
      const emptyData = {
        teacherProfiles: {},
        studentProfiles: {},
        overbookingRequests: [],
        timeSlots: [],
        lessons: [],
        chats: [],
        posts: [],
        notifications: []
      };
      
      fs.writeFileSync(serverDataFile, JSON.stringify(emptyData, null, 2));
      console.log('✅ Очищен файл server_data.json');
    } else {
      console.log('ℹ️  Файл server_data.json не найден');
    }
  } catch (error) {
    console.error('❌ Ошибка при очистке server_data.json:', error.message);
  }
}

// Функция для очистки локальных данных (если запускается в браузере)
function clearLocalStorage() {
  console.log('📱 Для очистки локальных данных в браузере:');
  console.log('   1. Откройте DevTools (F12)');
  console.log('   2. Перейдите в Application/Storage → Local Storage');
  console.log('   3. Удалите все ключи, начинающиеся с "tutoring_"');
  console.log('   4. Или выполните в консоли:');
  console.log('      Object.keys(localStorage).forEach(key => {');
  console.log('        if (key.startsWith("tutoring_")) {');
  console.log('          localStorage.removeItem(key);');
  console.log('        }');
  console.log('      });');
}

// Функция для очистки всех файлов данных
function clearAllDataFiles() {
  const dataFiles = [
    'backend/server_data.json',
    'backend/uploads/avatars',
    'uploads/avatars'
  ];
  
  dataFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    try {
      if (fs.existsSync(fullPath)) {
        if (fs.statSync(fullPath).isDirectory()) {
          // Удаляем все файлы в директории
          const files = fs.readdirSync(fullPath);
          files.forEach(file => {
            const fileFullPath = path.join(fullPath, file);
            fs.unlinkSync(fileFullPath);
            console.log(`🗑️  Удален файл: ${file}`);
          });
          console.log(`✅ Очищена директория: ${filePath}`);
        } else {
          // Удаляем файл
          fs.unlinkSync(fullPath);
          console.log(`🗑️  Удален файл: ${filePath}`);
        }
      } else {
        console.log(`ℹ️  Файл/директория не найдена: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Ошибка при удалении ${filePath}:`, error.message);
    }
  });
}

// Функция для создания пустого файла данных
function createEmptyServerData() {
  const serverDataFile = path.join(__dirname, 'backend', 'server_data.json');
  const emptyData = {
    teacherProfiles: {},
    studentProfiles: {},
    overbookingRequests: [],
    timeSlots: [],
    lessons: [],
    chats: [],
    posts: [],
    notifications: []
  };
  
  try {
    // Создаем директорию backend если её нет
    const backendDir = path.dirname(serverDataFile);
    if (!fs.existsSync(backendDir)) {
      fs.mkdirSync(backendDir, { recursive: true });
    }
    
    fs.writeFileSync(serverDataFile, JSON.stringify(emptyData, null, 2));
    console.log('✅ Создан пустой файл server_data.json');
  } catch (error) {
    console.error('❌ Ошибка при создании server_data.json:', error.message);
  }
}

// Основная функция
function main() {
  console.log('🚀 Начинаем очистку всех пользователей...\n');
  
  // 1. Очищаем данные сервера
  console.log('1️⃣ Очистка данных сервера...');
  clearServerData();
  
  // 2. Очищаем все файлы данных
  console.log('\n2️⃣ Очистка всех файлов данных...');
  clearAllDataFiles();
  
  // 3. Создаем пустой файл данных
  console.log('\n3️⃣ Создание пустого файла данных...');
  createEmptyServerData();
  
  // 4. Инструкции по очистке локальных данных
  console.log('\n4️⃣ Очистка локальных данных в браузере...');
  clearLocalStorage();
  
  console.log('\n🎉 Очистка завершена!');
  console.log('\n📋 Что было сделано:');
  console.log('   ✅ Очищены данные сервера (server_data.json)');
  console.log('   ✅ Удалены все файлы аватаров');
  console.log('   ✅ Создан пустой файл данных');
  console.log('   📱 Инструкции по очистке локальных данных предоставлены');
  
  console.log('\n🔄 Для полной очистки также:');
  console.log('   1. Перезапустите сервер');
  console.log('   2. Очистите кэш браузера');
  console.log('   3. Выполните инструкции по очистке localStorage');
  
  console.log('\n✨ Проект готов к работе с чистыми данными!');
}

// Запускаем скрипт
main();
