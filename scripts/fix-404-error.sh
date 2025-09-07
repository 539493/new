#!/bin/bash

# Скрипт для исправления ошибки 404 при загрузке статических файлов
echo "🔧 Исправление ошибки 404 для статических файлов..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🔧 ИСПРАВЛЕНИЕ ОШИБКИ 404${NC}"
echo -e "${BLUE}================================${NC}"

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Не найдены необходимые файлы. Убедитесь, что вы в корневой директории проекта.${NC}"
    exit 1
fi

echo -e "${YELLOW}1. Очистка предыдущей сборки...${NC}"
if [ -d "dist" ]; then
    rm -rf dist
    echo -e "${GREEN}✅ Директория dist очищена${NC}"
else
    echo -e "${BLUE}ℹ️ Директория dist не найдена${NC}"
fi

echo -e "${YELLOW}2. Очистка node_modules...${NC}"
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo -e "${GREEN}✅ node_modules очищен${NC}"
else
    echo -e "${BLUE}ℹ️ node_modules не найден${NC}"
fi

echo -e "${YELLOW}3. Установка зависимостей...${NC}"
npm install --legacy-peer-deps
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Зависимости установлены${NC}"
else
    echo -e "${RED}❌ Ошибка установки зависимостей${NC}"
    exit 1
fi

echo -e "${YELLOW}4. Сборка проекта...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Проект собран успешно${NC}"
else
    echo -e "${RED}❌ Ошибка сборки проекта${NC}"
    exit 1
fi

echo -e "${YELLOW}5. Проверка структуры dist...${NC}"
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Директория dist создана${NC}"
    echo -e "${BLUE}📂 Содержимое dist:${NC}"
    ls -la dist/
    
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✅ index.html найден${NC}"
    else
        echo -e "${RED}❌ index.html не найден${NC}"
    fi
    
    if [ -d "dist/assets" ]; then
        echo -e "${GREEN}✅ Директория assets создана${NC}"
        echo -e "${BLUE}📂 Содержимое assets:${NC}"
        ls -la dist/assets/
    else
        echo -e "${YELLOW}⚠️ Директория assets не найдена${NC}"
    fi
else
    echo -e "${RED}❌ Директория dist не создана${NC}"
    exit 1
fi

echo -e "${YELLOW}6. Тестирование локального сервера...${NC}"
echo -e "${BLUE}🚀 Запуск сервера для тестирования...${NC}"
echo -e "${YELLOW}   (Нажмите Ctrl+C для остановки)${NC}"

# Запускаем сервер в фоне для тестирования
npm start &
SERVER_PID=$!

# Ждем 5 секунд для запуска сервера
sleep 5

# Проверяем, что сервер запустился
if ps -p $SERVER_PID > /dev/null; then
    echo -e "${GREEN}✅ Сервер запущен (PID: $SERVER_PID)${NC}"
    
    # Тестируем основные endpoints
    echo -e "${BLUE}🔍 Тестирование endpoints...${NC}"
    
    # Проверяем статус API
    if curl -s http://localhost:10000/api/status > /dev/null; then
        echo -e "${GREEN}✅ API /api/status работает${NC}"
    else
        echo -e "${RED}❌ API /api/status не отвечает${NC}"
    fi
    
    # Проверяем health check
    if curl -s http://localhost:10000/api/health > /dev/null; then
        echo -e "${GREEN}✅ API /api/health работает${NC}"
    else
        echo -e "${RED}❌ API /api/health не отвечает${NC}"
    fi
    
    # Проверяем главную страницу
    if curl -s http://localhost:10000/ | grep -q "html"; then
        echo -e "${GREEN}✅ Главная страница загружается${NC}"
    else
        echo -e "${RED}❌ Главная страница не загружается${NC}"
    fi
    
    # Останавливаем сервер
    kill $SERVER_PID
    echo -e "${BLUE}🛑 Сервер остановлен${NC}"
else
    echo -e "${RED}❌ Сервер не запустился${NC}"
fi

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}📊 РЕЗУЛЬТАТ${NC}"
echo -e "${BLUE}================================${NC}"

if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo -e "${GREEN}🎉 ИСПРАВЛЕНИЕ ЗАВЕРШЕНО УСПЕШНО!${NC}"
    echo -e "${GREEN}✅ Статические файлы готовы к развертыванию${NC}"
    echo ""
    echo -e "${BLUE}🚀 Следующие шаги:${NC}"
    echo -e "${YELLOW}1. Коммит изменений:${NC}"
    echo -e "   git add ."
    echo -e "   git commit -m 'Fix 404 error for static files'"
    echo -e "   git push origin main"
    echo ""
    echo -e "${YELLOW}2. Переразвертывание на Render произойдет автоматически${NC}"
    echo ""
    echo -e "${YELLOW}3. Проверьте логи в Render Dashboard после развертывания${NC}"
else
    echo -e "${RED}❌ ИСПРАВЛЕНИЕ НЕ ЗАВЕРШЕНО${NC}"
    echo -e "${RED}⚠️ Проверьте ошибки выше и повторите попытку${NC}"
fi
