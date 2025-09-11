// Проверка репетиторов в системе
const https = require('https');

const makeRequest = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'nauchi.onrender.com',
      port: 443,
      path: path,
      method: 'GET',
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

const checkTeachers = async () => {
  console.log('🔍 Проверяем репетиторов в системе...\n');
  
  try {
    // Проверяем всех пользователей
    const usersResponse = await makeRequest('/api/users');
    
    if (usersResponse.status === 200) {
      const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      console.log(`👥 Всего пользователей: ${users.length}`);
      
      // Ищем репетиторов
      const teachers = users.filter(user => user.role === 'teacher');
      console.log(`👨‍🏫 Репетиторов: ${teachers.length}`);
      
      if (teachers.length > 0) {
        console.log('\n📋 Список репетиторов:');
        teachers.forEach((teacher, index) => {
          console.log(`${index + 1}. ${teacher.name || 'N/A'} (${teacher.email || 'N/A'}) - ID: ${teacher.id}`);
        });
      } else {
        console.log('\n❌ Репетиторы не найдены!');
        console.log('💡 Нужно зарегистрировать репетиторов для отображения в системе');
      }
      
      // Показываем всех пользователей
      console.log('\n👥 Все пользователи:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'N/A'} (${user.email || 'N/A'}) - Роль: ${user.role || 'N/A'}`);
      });
    }
    
    // Проверяем слоты времени
    const slotsResponse = await makeRequest('/api/time-slots');
    if (slotsResponse.status === 200) {
      const slots = Array.isArray(slotsResponse.data) ? slotsResponse.data : [];
      console.log(`\n⏰ Слотов времени: ${slots.length}`);
    }
    
    // Проверяем профили учителей
    const profilesResponse = await makeRequest('/api/teacher-profiles');
    if (profilesResponse.status === 200) {
      const profiles = Array.isArray(profilesResponse.data) ? profilesResponse.data : [];
      console.log(`👨‍🏫 Профилей учителей: ${profiles.length}`);
    }
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  }
};

checkTeachers();
