// Простой скрипт для очистки тестовых данных
const https = require('https');

const makeRequest = (path, method = 'GET') => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'nauchi.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

const cleanupData = async () => {
  console.log('🧹 Очистка данных на сервере...\n');
  
  try {
    // Получаем пользователей
    console.log('📋 Получаем пользователей...');
    const usersResponse = await makeRequest('/api/users');
    
    if (usersResponse.status === 200) {
      const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      console.log(`👥 Найдено пользователей: ${users.length}`);
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'N/A'} (${user.email || 'N/A'}) - ${user.role || 'N/A'}`);
      });
    }
    
    // Получаем слоты времени
    console.log('\n⏰ Получаем слоты времени...');
    const slotsResponse = await makeRequest('/api/time-slots');
    
    if (slotsResponse.status === 200) {
      const slots = Array.isArray(slotsResponse.data) ? slotsResponse.data : [];
      console.log(`⏰ Найдено слотов: ${slots.length}`);
      
      // Показываем первые 10 слотов
      slots.slice(0, 10).forEach((slot, index) => {
        console.log(`${index + 1}. Учитель: ${slot.teacherId}, Время: ${slot.startTime || 'N/A'}, Забронирован: ${slot.isBooked ? 'Да' : 'Нет'}`);
      });
      
      if (slots.length > 10) {
        console.log(`... и еще ${slots.length - 10} слотов`);
      }
    }
    
    // Получаем профили учителей
    console.log('\n👨‍🏫 Получаем профили учителей...');
    const profilesResponse = await makeRequest('/api/teacher-profiles');
    
    if (profilesResponse.status === 200) {
      const profiles = Array.isArray(profilesResponse.data) ? profilesResponse.data : [];
      console.log(`👨‍🏫 Найдено профилей: ${profiles.length}`);
      
      // Показываем первые 10 профилей
      profiles.slice(0, 10).forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.name || 'N/A'} - ${profile.subjects || 'N/A'}`);
      });
      
      if (profiles.length > 10) {
        console.log(`... и еще ${profiles.length - 10} профилей`);
      }
    }
    
    console.log('\n✅ Анализ завершен!');
    console.log('\n💡 Для удаления конкретных данных используйте API:');
    console.log('   DELETE /api/users/{id}');
    console.log('   DELETE /api/time-slots/{id}');
    console.log('   DELETE /api/teacher-profiles/{id}');
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  }
};

cleanupData();
