#!/usr/bin/env node

const http = require('http');
const https = require('https');

// Функция для проверки HTTP/HTTPS запросов
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Тестирование endpoints
async function testEndpoints(baseUrl) {
  console.log(`🧪 Тестирование ${baseUrl}...`);
  
  const tests = [
    { name: 'Health Check', url: `${baseUrl}/api/health` },
    { name: 'Users API', url: `${baseUrl}/api/users` },
    { name: 'Teachers API', url: `${baseUrl}/api/teachers` },
    { name: 'Lessons API', url: `${baseUrl}/api/lessons` },
    { name: 'Sync API', url: `${baseUrl}/api/sync` }
  ];
  
  for (const test of tests) {
    try {
      console.log(`  📡 ${test.name}...`);
      const result = await makeRequest(test.url);
      
      if (result.status === 200) {
        console.log(`    ✅ ${test.name}: OK (${result.status})`);
        if (test.name === 'Health Check' && result.data.status) {
          console.log(`    📊 Connected clients: ${result.data.connectedClients}`);
          console.log(`    📅 Time slots: ${result.data.timeSlots}`);
          console.log(`    📚 Lessons: ${result.data.lessons}`);
        }
      } else {
        console.log(`    ❌ ${test.name}: Failed (${result.status})`);
      }
    } catch (error) {
      console.log(`    ❌ ${test.name}: Error - ${error.message}`);
    }
  }
}

// Основная функция
async function main() {
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:5000';
  
  console.log('🚀 Тестирование развертывания платформы репетиторства');
  console.log('=' .repeat(60));
  
  await testEndpoints(baseUrl);
  
  console.log('=' .repeat(60));
  console.log('✅ Тестирование завершено');
  console.log('');
  console.log('📋 Инструкции для проверки:');
  console.log('1. Откройте приложение в браузере');
  console.log('2. Зарегистрируйтесь как преподаватель');
  console.log('3. Зарегистрируйтесь как ученик на другом устройстве');
  console.log('4. Проверьте, что пользователи видят друг друга');
  console.log('5. Создайте слот времени и забронируйте его');
  console.log('6. Проверьте чат между пользователями');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testEndpoints, makeRequest };
