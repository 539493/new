// Тест подключения к серверу
const https = require('https');
const http = require('http');

const testConnection = async (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 200) // Первые 200 символов
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

const testServers = async () => {
  console.log('🔍 Тестирование подключения к серверам...\n');
  
  const servers = [
    { name: 'Render Production', url: 'https://nauchi.onrender.com/api/health' },
    { name: 'Render Root', url: 'https://nauchi.onrender.com/' },
    { name: 'Local Production Server', url: 'http://localhost:10000/api/health' },
    { name: 'Local Dev Server', url: 'http://localhost:3001/api/health' }
  ];
  
  for (const server of servers) {
    try {
      console.log(`📡 Тестируем ${server.name}...`);
      const result = await testConnection(server.url);
      console.log(`✅ ${server.name}: ${result.status} - ${result.data.substring(0, 100)}...`);
    } catch (error) {
      console.log(`❌ ${server.name}: ${error.message}`);
    }
    console.log('');
  }
};

testServers().catch(console.error);
