#!/usr/bin/env node

/**
 * Тест для проверки URL конфигурации
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Тестирование URL конфигурации...');

// Читаем конфигурацию
const configPath = path.join(__dirname, '..', 'src', 'config.ts');
const configContent = fs.readFileSync(configPath, 'utf8');

console.log('📄 Содержимое config.ts:');
console.log('================================');
console.log(configContent);
console.log('================================');

// Проверяем, что используется правильный URL
if (configContent.includes('http://localhost:3001')) {
  console.log('✅ Конфигурация правильная - используется localhost:3001');
} else {
  console.log('❌ Конфигурация неправильная - не найден localhost:3001');
}

// Проверяем production URL
if (configContent.includes('https://tutoring-platform-1756666331-zjfl.onrender.com')) {
  console.log('✅ Production URL найден');
} else {
  console.log('❌ Production URL не найден');
}

console.log('\n💡 Если фронтенд получает HTML вместо JSON:');
console.log('1. Убедитесь, что фронтенд запущен командой: npm run dev');
console.log('2. Проверьте, что нет переменной NODE_ENV=production');
console.log('3. Очистите кэш браузера (Ctrl+Shift+R)');
console.log('4. Проверьте логи в консоли браузера');
