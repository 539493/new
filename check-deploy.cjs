#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка готовности к деплою на Render...\n');

// Проверка необходимых файлов
const requiredFiles = [
  'package.json',
  'render.yaml',
  'backend/production-server-simple.cjs',
  'dist/index.html',
  'dist/assets/'
];

let allFilesExist = true;

console.log('📁 Проверка файлов:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Проверка package.json
console.log('\n📦 Проверка package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const hasStartScript = packageJson.scripts && packageJson.scripts.start;
  console.log(`  ${hasStartScript ? '✅' : '❌'} start script`);
  
  const hasBuildScript = packageJson.scripts && packageJson.scripts.build;
  console.log(`  ${hasBuildScript ? '✅' : '❌'} build script`);
  
  const hasDependencies = packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0;
  console.log(`  ${hasDependencies ? '✅' : '❌'} dependencies`);
  
  const hasEngines = packageJson.engines && packageJson.engines.node;
  console.log(`  ${hasEngines ? '✅' : '❌'} engines.node`);
  
} catch (error) {
  console.log('  ❌ Ошибка чтения package.json');
  allFilesExist = false;
}

// Проверка render.yaml
console.log('\n⚙️  Проверка render.yaml:');
try {
  const renderYaml = fs.readFileSync('render.yaml', 'utf8');
  
  const hasWebService = renderYaml.includes('type: web');
  console.log(`  ${hasWebService ? '✅' : '❌'} web service type`);
  
  const hasBuildCommand = renderYaml.includes('buildCommand');
  console.log(`  ${hasBuildCommand ? '✅' : '❌'} build command`);
  
  const hasStartCommand = renderYaml.includes('startCommand');
  console.log(`  ${hasStartCommand ? '✅' : '❌'} start command`);
  
  const hasHealthCheck = renderYaml.includes('healthCheckPath');
  console.log(`  ${hasHealthCheck ? '✅' : '❌'} health check path`);
  
} catch (error) {
  console.log('  ❌ Ошибка чтения render.yaml');
  allFilesExist = false;
}

// Проверка dist папки
console.log('\n📂 Проверка dist папки:');
try {
  const distFiles = fs.readdirSync('dist');
  const hasIndexHtml = distFiles.includes('index.html');
  console.log(`  ${hasIndexHtml ? '✅' : '❌'} index.html`);
  
  const assetsDir = fs.readdirSync('dist/assets');
  const hasJsFiles = assetsDir.some(file => file.endsWith('.js'));
  console.log(`  ${hasJsFiles ? '✅' : '❌'} JavaScript files`);
  
  const hasCssFiles = assetsDir.some(file => file.endsWith('.css'));
  console.log(`  ${hasCssFiles ? '✅' : '❌'} CSS files`);
  
} catch (error) {
  console.log('  ❌ Ошибка чтения dist папки');
  allFilesExist = false;
}

// Проверка сервера
console.log('\n🖥️  Проверка сервера:');
try {
  const serverFile = fs.readFileSync('backend/production-server-simple.cjs', 'utf8');
  
  const hasExpress = serverFile.includes('express');
  console.log(`  ${hasExpress ? '✅' : '❌'} Express.js`);
  
  const hasSocketIO = serverFile.includes('socket.io');
  console.log(`  ${hasSocketIO ? '✅' : '❌'} Socket.IO`);
  
  const hasHealthEndpoint = serverFile.includes('/api/health');
  console.log(`  ${hasHealthEndpoint ? '✅' : '❌'} Health endpoint`);
  
  const hasStaticFiles = serverFile.includes('express.static');
  console.log(`  ${hasStaticFiles ? '✅' : '❌'} Static files serving`);
  
  const hasPortConfig = serverFile.includes('process.env.PORT');
  console.log(`  ${hasPortConfig ? '✅' : '❌'} PORT environment variable`);
  
} catch (error) {
  console.log('  ❌ Ошибка чтения сервера');
  allFilesExist = false;
}

// Итоговая оценка
console.log('\n📊 Итоговая оценка:');

if (allFilesExist) {
  console.log('🎉 ПРОЕКТ ГОТОВ К ДЕПЛОЮ НА RENDER!');
  console.log('\n📋 Следующие шаги:');
  console.log('1. Закоммитьте изменения: git add . && git commit -m "Ready for deployment"');
  console.log('2. Отправьте в репозиторий: git push origin main');
  console.log('3. Создайте сервис на Render.com');
  console.log('4. Подключите GitHub репозиторий');
  console.log('5. Настройте переменные окружения');
  console.log('6. Дождитесь автоматического деплоя');
} else {
  console.log('❌ ПРОЕКТ НЕ ГОТОВ К ДЕПЛОЮ');
  console.log('\n🔧 Необходимо исправить ошибки выше');
}

console.log('\n📖 Подробные инструкции: QUICK_DEPLOY.md');
console.log('📋 Полный отчет: DEPLOYMENT_READY.md'); 