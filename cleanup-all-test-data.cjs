// Полная очистка тестовых данных с Render сервера
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

// Получить все данные
const getAllData = async () => {
  try {
    console.log('📊 Получаем все данные с сервера...\n');
    
    const [users, timeSlots, teacherProfiles] = await Promise.all([
      makeRequest('/api/users'),
      makeRequest('/api/time-slots'),
      makeRequest('/api/teacher-profiles')
    ]);
    
    return {
      users: users.status === 200 ? users.data : [],
      timeSlots: timeSlots.status === 200 ? timeSlots.data : [],
      teacherProfiles: teacherProfiles.status === 200 ? teacherProfiles.data : []
    };
  } catch (error) {
    console.log(`❌ Ошибка получения данных: ${error.message}`);
    return { users: [], timeSlots: [], teacherProfiles: [] };
  }
};

// Определить тестовые данные
const isTestData = (item, type) => {
  const testPatterns = [
    /test/i,
    /demo/i,
    /example/i,
    /sample/i,
    /temp/i,
    /temporary/i,
    /123/i,
    /admin/i,
    /root/i
  ];
  
  let textToCheck = '';
  
  switch (type) {
    case 'user':
      textToCheck = `${item.name || ''} ${item.email || ''} ${item.username || ''}`;
      break;
    case 'profile':
      textToCheck = `${item.name || ''} ${item.bio || ''} ${item.subjects || ''}`;
      break;
    case 'slot':
      textToCheck = `${item.teacherId || ''} ${item.subject || ''}`;
      break;
  }
  
  return testPatterns.some(pattern => pattern.test(textToCheck));
};

// Удалить элемент
const deleteItem = async (path, id, type) => {
  try {
    const response = await makeRequest(`${path}/${id}`, 'DELETE');
    
    if (response.status === 200) {
      console.log(`✅ ${type} ${id} удален`);
      return true;
    } else {
      console.log(`❌ Ошибка удаления ${type} ${id}: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Ошибка удаления ${type} ${id}: ${error.message}`);
    return false;
  }
};

// Основная функция очистки
const cleanupAllTestData = async () => {
  console.log('🧹 Полная очистка тестовых данных...\n');
  
  try {
    // Получаем все данные
    const data = await getAllData();
    
    console.log('📊 Статистика данных:');
    console.log(`👥 Пользователи: ${data.users.length}`);
    console.log(`⏰ Слоты времени: ${data.timeSlots.length}`);
    console.log(`👨‍🏫 Профили учителей: ${data.teacherProfiles.length}\n`);
    
    // Анализируем пользователей
    console.log('👥 Анализ пользователей:');
    data.users.forEach((user, index) => {
      const isTest = isTestData(user, 'user');
      console.log(`${index + 1}. ID: ${user.id}, Имя: ${user.name || 'N/A'}, Email: ${user.email || 'N/A'}, Роль: ${user.role || 'N/A'} ${isTest ? '🧪 ТЕСТ' : '✅'}`);
    });
    
    // Анализируем профили учителей
    console.log('\n👨‍🏫 Анализ профилей учителей:');
    data.teacherProfiles.forEach((profile, index) => {
      const isTest = isTestData(profile, 'profile');
      console.log(`${index + 1}. ID: ${profile.id}, Имя: ${profile.name || 'N/A'}, Предметы: ${profile.subjects || 'N/A'} ${isTest ? '🧪 ТЕСТ' : '✅'}`);
    });
    
    // Анализируем слоты времени
    console.log('\n⏰ Анализ слотов времени:');
    data.timeSlots.forEach((slot, index) => {
      const isTest = isTestData(slot, 'slot');
      console.log(`${index + 1}. ID: ${slot.id}, Учитель: ${slot.teacherId}, Предмет: ${slot.subject || 'N/A'}, Время: ${slot.startTime || 'N/A'} ${isTest ? '🧪 ТЕСТ' : '✅'}`);
    });
    
    // Находим тестовые данные
    const testUsers = data.users.filter(user => isTestData(user, 'user'));
    const testProfiles = data.teacherProfiles.filter(profile => isTestData(profile, 'profile'));
    const testSlots = data.timeSlots.filter(slot => isTestData(slot, 'slot'));
    
    console.log(`\n🔍 Найдено тестовых данных:`);
    console.log(`👥 Пользователи: ${testUsers.length}`);
    console.log(`👨‍🏫 Профили: ${testProfiles.length}`);
    console.log(`⏰ Слоты: ${testSlots.length}`);
    
    if (testUsers.length === 0 && testProfiles.length === 0 && testSlots.length === 0) {
      console.log('\n✅ Тестовые данные не найдены!');
      return;
    }
    
    // Удаляем тестовые данные
    console.log('\n🗑️  Удаляем тестовые данные...');
    
    let deletedCount = 0;
    
    // Удаляем тестовые слоты
    for (const slot of testSlots) {
      const success = await deleteItem('/api/time-slots', slot.id, 'Слот');
      if (success) deletedCount++;
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Удаляем тестовые профили
    for (const profile of testProfiles) {
      const success = await deleteItem('/api/teacher-profiles', profile.id, 'Профиль');
      if (success) deletedCount++;
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Удаляем тестовых пользователей
    for (const user of testUsers) {
      const success = await deleteItem('/api/users', user.id, 'Пользователь');
      if (success) deletedCount++;
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`\n✅ Удалено тестовых элементов: ${deletedCount}`);
    
    // Показываем финальную статистику
    const finalData = await getAllData();
    console.log('\n📊 Финальная статистика:');
    console.log(`👥 Пользователи: ${finalData.users.length}`);
    console.log(`⏰ Слоты времени: ${finalData.timeSlots.length}`);
    console.log(`👨‍🏫 Профили учителей: ${finalData.teacherProfiles.length}`);
    
  } catch (error) {
    console.log(`❌ Критическая ошибка: ${error.message}`);
  }
};

// Запуск
cleanupAllTestData();
