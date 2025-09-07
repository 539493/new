#!/bin/bash

# Скрипт для тестирования онлайн подключения
echo "🔍 Тестирование онлайн подключения..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🔍 ТЕСТИРОВАНИЕ ПОДКЛЮЧЕНИЯ${NC}"
echo -e "${BLUE}================================${NC}"

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Не найдены необходимые файлы. Убедитесь, что вы в корневой директории проекта.${NC}"
    exit 1
fi

echo -e "${YELLOW}1. Проверка конфигурации...${NC}"
if [ -f "src/config.ts" ]; then
    echo -e "${GREEN}✅ config.ts найден${NC}"
    
    # Проверяем URL сервера
    if grep -q "localhost:10000" src/config.ts; then
        echo -e "${GREEN}✅ Правильный порт сервера (10000)${NC}"
    else
        echo -e "${RED}❌ Неправильный порт сервера в config.ts${NC}"
        echo -e "${YELLOW}   Ожидается: localhost:10000${NC}"
    fi
else
    echo -e "${RED}❌ config.ts не найден${NC}"
    exit 1
fi

echo -e "${YELLOW}2. Запуск сервера...${NC}"
echo -e "${BLUE}🚀 Запуск backend сервера...${NC}"

# Запускаем сервер в фоне
npm start &
SERVER_PID=$!

# Ждем 5 секунд для запуска сервера
sleep 5

# Проверяем, что сервер запустился
if ps -p $SERVER_PID > /dev/null; then
    echo -e "${GREEN}✅ Сервер запущен (PID: $SERVER_PID)${NC}"
else
    echo -e "${RED}❌ Сервер не запустился${NC}"
    exit 1
fi

echo -e "${YELLOW}3. Тестирование API endpoints...${NC}"

# Тестируем основные endpoints
echo -e "${BLUE}🔍 Тестирование /api/status...${NC}"
STATUS_RESPONSE=$(curl -s http://localhost:10000/api/status)
if [ $? -eq 0 ] && echo "$STATUS_RESPONSE" | grep -q "running"; then
    echo -e "${GREEN}✅ API /api/status работает${NC}"
    echo -e "${BLUE}   Ответ: $STATUS_RESPONSE${NC}"
else
    echo -e "${RED}❌ API /api/status не отвечает${NC}"
fi

echo -e "${BLUE}🔍 Тестирование /api/health...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:10000/api/health)
if [ $? -eq 0 ] && echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✅ API /api/health работает${NC}"
    echo -e "${BLUE}   Ответ: $HEALTH_RESPONSE${NC}"
else
    echo -e "${RED}❌ API /api/health не отвечает${NC}"
fi

echo -e "${BLUE}🔍 Тестирование /api/socket-test...${NC}"
SOCKET_RESPONSE=$(curl -s http://localhost:10000/api/socket-test)
if [ $? -eq 0 ] && echo "$SOCKET_RESPONSE" | grep -q "socket_available"; then
    echo -e "${GREEN}✅ API /api/socket-test работает${NC}"
    echo -e "${BLUE}   Ответ: $SOCKET_RESPONSE${NC}"
else
    echo -e "${RED}❌ API /api/socket-test не отвечает${NC}"
fi

echo -e "${YELLOW}4. Тестирование главной страницы...${NC}"
MAIN_RESPONSE=$(curl -s http://localhost:10000/ | head -5)
if [ $? -eq 0 ] && echo "$MAIN_RESPONSE" | grep -q "html\|json"; then
    echo -e "${GREEN}✅ Главная страница загружается${NC}"
else
    echo -e "${RED}❌ Главная страница не загружается${NC}"
fi

echo -e "${YELLOW}5. Проверка статических файлов...${NC}"
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✅ Статические файлы готовы${NC}"
    
    # Проверяем assets
    if [ -d "dist/assets" ]; then
        echo -e "${GREEN}✅ Директория assets существует${NC}"
        echo -e "${BLUE}📂 Файлы в assets:${NC}"
        ls -la dist/assets/ | head -5
    else
        echo -e "${YELLOW}⚠️ Директория assets не найдена${NC}"
    fi
else
    echo -e "${RED}❌ Статические файлы не готовы${NC}"
    echo -e "${YELLOW}   Запустите: npm run build${NC}"
fi

echo -e "${YELLOW}6. Тестирование Socket.IO подключения...${NC}"
echo -e "${BLUE}🔌 Проверка Socket.IO...${NC}"

# Создаем простой тест Socket.IO
cat > /tmp/socket_test.js << 'EOF'
const { io } = require('socket.io-client');

const socket = io('http://localhost:10000', {
  transports: ['websocket', 'polling'],
  timeout: 5000
});

socket.on('connect', () => {
  console.log('✅ Socket.IO подключен успешно');
  console.log('🔌 Socket ID:', socket.id);
  socket.disconnect();
  process.exit(0);
});

socket.on('connect_error', (error) => {
  console.log('❌ Ошибка подключения Socket.IO:', error.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('⏰ Таймаут подключения Socket.IO');
  socket.disconnect();
  process.exit(1);
}, 10000);
EOF

# Запускаем тест Socket.IO
if node /tmp/socket_test.js; then
    echo -e "${GREEN}✅ Socket.IO подключение работает${NC}"
else
    echo -e "${RED}❌ Socket.IO подключение не работает${NC}"
fi

# Очищаем временный файл
rm -f /tmp/socket_test.js

echo -e "${YELLOW}7. Остановка сервера...${NC}"
kill $SERVER_PID
echo -e "${GREEN}✅ Сервер остановлен${NC}"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}📊 РЕЗУЛЬТАТ ТЕСТИРОВАНИЯ${NC}"
echo -e "${BLUE}================================${NC}"

echo -e "${GREEN}🎉 ТЕСТИРОВАНИЕ ЗАВЕРШЕНО!${NC}"
echo ""
echo -e "${BLUE}🚀 Для запуска в режиме разработки:${NC}"
echo -e "${YELLOW}1. Запустите сервер:${NC}"
echo -e "   npm start"
echo ""
echo -e "${YELLOW}2. В другом терминале запустите фронтенд:${NC}"
echo -e "   npm run dev"
echo ""
echo -e "${YELLOW}3. Откройте браузер:${NC}"
echo -e "   http://localhost:5173 (Vite dev server)"
echo -e "   или"
echo -e "   http://localhost:10000 (Production server)"
echo ""
echo -e "${BLUE}🔍 Проверьте в браузере:${NC}"
echo -e "${YELLOW}   • Статус подключения должен быть 'Подключено в реальном времени'${NC}"
echo -e "${YELLOW}   • Не должно быть ошибок в консоли браузера${NC}"
echo -e "${YELLOW}   • Socket.IO должен подключаться автоматически${NC}"
