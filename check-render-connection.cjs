// Проверка подключения к Render серверу
const https = require('https');

const checkRenderServer = () => {
  console.log('🔍 Проверяем подключение к Render серверу...\n');
  
  const options = {
    hostname: 'nauchi.onrender.com',
    port: 443,
    path: '/api/health',
    method: 'GET',
    timeout: 10000
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Render сервер доступен!');
      console.log(`📊 Статус: ${res.statusCode}`);
      console.log(`📡 Ответ: ${data.substring(0, 200)}...`);
      console.log('\n🎉 Сервер готов к работе!');
      console.log('🌐 URL: https://nauchi.onrender.com');
    });
  });

  req.on('error', (err) => {
    console.log('❌ Ошибка подключения к Render серверу:');
    console.log(`   ${err.message}`);
    console.log('\n💡 Возможные причины:');
    console.log('   - Сервер еще запускается (подождите 1-2 минуты)');
    console.log('   - Проблемы с интернет-соединением');
    console.log('   - Сервер временно недоступен');
  });

  req.on('timeout', () => {
    console.log('⏰ Таймаут подключения к серверу');
    req.destroy();
  });

  req.end();
};

checkRenderServer();
