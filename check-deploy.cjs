#!/usr/bin/env node

const https = require('https');

// URL вашего приложения на Render (замените на ваш)
const APP_URL = 'https://tutoring-platform.onrender.com';

function checkDeployStatus() {
  console.log('🔍 Проверка статуса деплоя на Render...');
  console.log(`📡 URL: ${APP_URL}`);
  
  const options = {
    hostname: 'tutoring-platform.onrender.com',
    port: 443,
    path: '/api/health',
    method: 'GET',
    timeout: 10000
  };

  const req = https.request(options, (res) => {
    console.log(`✅ Статус ответа: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📊 Ответ сервера:');
        console.log(JSON.stringify(response, null, 2));
        
        if (res.statusCode === 200) {
          console.log('🎉 Деплой успешен! Приложение работает.');
        } else {
          console.log('⚠️  Приложение отвечает, но есть проблемы.');
        }
      } catch (e) {
        console.log('📄 Ответ сервера (не JSON):', data);
      }
    });
  });

  req.on('error', (e) => {
    console.log('❌ Ошибка подключения:', e.message);
    console.log('💡 Возможные причины:');
    console.log('   - Приложение еще деплоится');
    console.log('   - Проблемы с сетью');
    console.log('   - Неправильный URL');
  });

  req.on('timeout', () => {
    console.log('⏰ Таймаут подключения');
    req.destroy();
  });

  req.end();
}

// Проверяем статус
checkDeployStatus();

// Проверяем каждые 30 секунд
setInterval(checkDeployStatus, 30000); 