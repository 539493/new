#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка конфигурации для Render...\n');

// Проверяем package.json
console.log('1️⃣ Проверка package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = ['render:build', 'render:start'];
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
  
  if (missingScripts.length === 0) {
    console.log('✅ Все необходимые скрипты найдены');
    console.log(`   - render:build: ${packageJson.scripts['render:build']}`);
    console.log(`   - render:start: ${packageJson.scripts['render:start']}`);
  } else {
    console.log('❌ Отсутствуют скрипты:', missingScripts.join(', '));
  }
} catch (error) {
  console.log('❌ Ошибка чтения package.json:', error.message);
}

// Проверяем render.yaml
console.log('\n2️⃣ Проверка render.yaml...');
try {
  const renderYaml = fs.readFileSync('render.yaml', 'utf8');
  
  const requiredConfigs = [
    'buildCommand: npm run render:build',
    'startCommand: npm run render:start',
    'healthCheckPath: /api/health',
    'PORT: 10000'
  ];
  
  const missingConfigs = requiredConfigs.filter(config => !renderYaml.includes(config));
  
  if (missingConfigs.length === 0) {
    console.log('✅ render.yaml настроен правильно');
  } else {
    console.log('❌ Отсутствуют настройки:', missingConfigs.join(', '));
  }
} catch (error) {
  console.log('❌ Ошибка чтения render.yaml:', error.message);
}

// Проверяем production сервер
console.log('\n3️⃣ Проверка production сервера...');
try {
  const productionServer = fs.readFileSync('backend/production-server.cjs', 'utf8');
  
  const requiredFeatures = [
    'process.env.PORT || 10000',
    '/api/health',
    'express.static',
    'Socket.IO'
  ];
  
  const missingFeatures = requiredFeatures.filter(feature => !productionServer.includes(feature));
  
  if (missingFeatures.length === 0) {
    console.log('✅ Production сервер настроен правильно');
  } else {
    console.log('❌ Отсутствуют функции:', missingFeatures.join(', '));
  }
} catch (error) {
  console.log('❌ Ошибка чтения production-server.cjs:', error.message);
}

// Проверяем структуру проекта
console.log('\n4️⃣ Проверка структуры проекта...');
const requiredFiles = [
  'package.json',
  'render.yaml',
  'backend/production-server.cjs',
  'src/main.tsx',
  'vite.config.ts'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length === 0) {
  console.log('✅ Все необходимые файлы найдены');
} else {
  console.log('❌ Отсутствуют файлы:', missingFiles.join(', '));
}

// Проверяем зависимости
console.log('\n5️⃣ Проверка зависимостей...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['express', 'socket.io', 'cors', 'react', 'vite'];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
  );
  
  if (missingDeps.length === 0) {
    console.log('✅ Все необходимые зависимости установлены');
  } else {
    console.log('❌ Отсутствуют зависимости:', missingDeps.join(', '));
  }
} catch (error) {
  console.log('❌ Ошибка проверки зависимостей:', error.message);
}

console.log('\n🎉 Проверка завершена!');
console.log('\n📋 Следующие шаги:');
console.log('1. git add .');
console.log('2. git commit -m "Configure for Render deployment"');
console.log('3. git push origin main');
console.log('4. Создать новый Web Service на render.com');
console.log('5. Подключить репозиторий и настроить деплой');

