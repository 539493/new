#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка готовности к деплою на Render...\n');

const checks = [
  {
    name: 'package.json',
    path: 'package.json',
    required: true,
    check: (content) => {
      const pkg = JSON.parse(content);
      return pkg.scripts.start && pkg.scripts.build;
    }
  },
  {
    name: 'render.yaml',
    path: 'render.yaml',
    required: true,
    check: () => true
  },
  {
    name: 'production-server-simple.cjs',
    path: 'backend/production-server-simple.cjs',
    required: true,
    check: () => true
  },
  {
    name: 'config.ts',
    path: 'src/config.ts',
    required: true,
    check: (content) => {
      return content.includes('WEBSOCKET_URL') && content.includes('SERVER_URL');
    }
  },
  {
    name: 'vite.config.ts',
    path: 'vite.config.ts',
    required: true,
    check: () => true
  },
  {
    name: 'tailwind.config.js',
    path: 'tailwind.config.js',
    required: true,
    check: () => true
  }
];

let allPassed = true;

checks.forEach(check => {
  const filePath = path.join(process.cwd(), check.path);
  
  if (!fs.existsSync(filePath)) {
    if (check.required) {
      console.log(`❌ ${check.name} - НЕ НАЙДЕН (обязательный файл)`);
      allPassed = false;
    } else {
      console.log(`⚠️  ${check.name} - НЕ НАЙДЕН (опциональный файл)`);
    }
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (check.check(content)) {
      console.log(`✅ ${check.name} - OK`);
    } else {
      console.log(`❌ ${check.name} - НЕ ПРОШЕЛ ПРОВЕРКУ`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${check.name} - ОШИБКА ЧТЕНИЯ: ${error.message}`);
    allPassed = false;
  }
});

console.log('\n📋 Дополнительные проверки:');

// Проверка зависимостей
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['express', 'socket.io', 'cors', 'react', 'vite'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length === 0) {
    console.log('✅ Зависимости - OK');
  } else {
    console.log(`❌ Отсутствуют зависимости: ${missingDeps.join(', ')}`);
    allPassed = false;
  }
} catch (error) {
  console.log('❌ Ошибка проверки зависимостей');
  allPassed = false;
}

// Проверка скриптов
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['start', 'build'];
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
  
  if (missingScripts.length === 0) {
    console.log('✅ Скрипты package.json - OK');
  } else {
    console.log(`❌ Отсутствуют скрипты: ${missingScripts.join(', ')}`);
    allPassed = false;
  }
} catch (error) {
  console.log('❌ Ошибка проверки скриптов');
  allPassed = false;
}

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 ПРОЕКТ ГОТОВ К ДЕПЛОЮ НА RENDER!');
  console.log('\n📝 Следующие шаги:');
  console.log('1. git add .');
  console.log('2. git commit -m "Ready for Render deployment"');
  console.log('3. git push origin main');
  console.log('4. Создайте Web Service на render.com');
  console.log('5. Подключите ваш GitHub репозиторий');
  console.log('6. Настройте Build Command: npm install && npm run build');
  console.log('7. Настройте Start Command: npm start');
} else {
  console.log('❌ ПРОЕКТ НЕ ГОТОВ К ДЕПЛОЮ');
  console.log('Исправьте указанные выше ошибки перед деплоем.');
}

console.log('\n📖 Подробные инструкции: RENDER_DEPLOY.md'); 