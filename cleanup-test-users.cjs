// Скрипт для удаления тестовых пользователей с Render сервера
const https = require('https');

const RENDER_URL = 'https://nauchi.onrender.com';

// Функция для выполнения HTTP запросов
const makeRequest = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'nauchi.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Cleanup-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

// Получить список всех пользователей
const getAllUsers = async () => {
  try {
    console.log('📋 Получаем список всех пользователей...');
    const response = await makeRequest('/api/users');
    
    if (response.status === 200) {
      console.log(`✅ Найдено пользователей: ${response.data.length}`);
      return response.data;
    } else {
      console.log(`❌ Ошибка получения пользователей: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
    return [];
  }
};

// Удалить пользователя
const deleteUser = async (userId) => {
  try {
    console.log(`🗑️  Удаляем пользователя ${userId}...`);
    const response = await makeRequest(`/api/users/${userId}`, 'DELETE');
    
    if (response.status === 200) {
      console.log(`✅ Пользователь ${userId} удален`);
      return true;
    } else {
      console.log(`❌ Ошибка удаления пользователя ${userId}: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Ошибка удаления пользователя ${userId}: ${error.message}`);
    return false;
  }
};

// Определить тестовых пользователей
const isTestUser = (user) => {
  const testPatterns = [
    /test/i,
    /demo/i,
    /example/i,
    /sample/i,
    /temp/i,
    /temporary/i,
    /123/i,
    /admin/i,
    /root/i,
    /user/i,
    /student/i,
    /teacher/i
  ];
  
  const name = user.name || user.username || user.email || '';
  const email = user.email || '';
  
  return testPatterns.some(pattern => 
    pattern.test(name) || pattern.test(email)
  );
};

// Основная функция
const cleanupTestUsers = async () => {
  console.log('🧹 Начинаем очистку тестовых пользователей...\n');
  
  try {
    // Получаем всех пользователей
    const users = await getAllUsers();
    
    if (users.length === 0) {
      console.log('📭 Пользователи не найдены');
      return;
    }
    
    console.log('\n👥 Список всех пользователей:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Имя: ${user.name || 'N/A'}, Email: ${user.email || 'N/A'}, Роль: ${user.role || 'N/A'}`);
    });
    
    // Находим тестовых пользователей
    const testUsers = users.filter(isTestUser);
    
    console.log(`\n🔍 Найдено тестовых пользователей: ${testUsers.length}`);
    
    if (testUsers.length === 0) {
      console.log('✅ Тестовые пользователи не найдены');
      return;
    }
    
    console.log('\n🗑️  Тестовые пользователи для удаления:');
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Имя: ${user.name || 'N/A'}, Email: ${user.email || 'N/A'}`);
    });
    
    // Удаляем тестовых пользователей
    console.log('\n🚮 Удаляем тестовых пользователей...');
    let deletedCount = 0;
    
    for (const user of testUsers) {
      const success = await deleteUser(user.id);
      if (success) {
        deletedCount++;
      }
      // Небольшая пауза между запросами
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ Удалено тестовых пользователей: ${deletedCount} из ${testUsers.length}`);
    
    // Показываем оставшихся пользователей
    const remainingUsers = await getAllUsers();
    console.log(`\n👥 Оставшихся пользователей: ${remainingUsers.length}`);
    
  } catch (error) {
    console.log(`❌ Критическая ошибка: ${error.message}`);
  }
};

// Запуск
cleanupTestUsers();
