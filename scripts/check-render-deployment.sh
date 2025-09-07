#!/bin/bash

# Скрипт для проверки статуса развертывания на Render
echo "🔍 Проверка статуса развертывания NAUCHI на Render..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🔍 ПРОВЕРКА РАЗВЕРТЫВАНИЯ RENDER${NC}"
echo -e "${BLUE}================================${NC}"

# URL сервиса (замените на ваш реальный URL после развертывания)
SERVICE_URL="https://nauchi.onrender.com"

echo -e "${YELLOW}1. Проверка доступности сервиса...${NC}"
echo -e "${BLUE}🌐 URL: ${SERVICE_URL}${NC}"

# Проверяем доступность сервиса
if curl -s --max-time 10 "${SERVICE_URL}" > /dev/null; then
    echo -e "${GREEN}✅ Сервис доступен${NC}"
else
    echo -e "${RED}❌ Сервис недоступен${NC}"
    echo -e "${YELLOW}   Возможные причины:${NC}"
    echo -e "${YELLOW}   • Сервис еще развертывается${NC}"
    echo -e "${YELLOW}   • Ошибка в конфигурации${NC}"
    echo -e "${YELLOW}   • Проблемы с Render${NC}"
    echo ""
    echo -e "${BLUE}🔍 Проверьте логи в Render Dashboard:${NC}"
    echo -e "${YELLOW}   https://dashboard.render.com${NC}"
    exit 1
fi

echo -e "${YELLOW}2. Проверка API endpoints...${NC}"

# Проверяем /api/status
echo -e "${BLUE}🔍 Тестирование /api/status...${NC}"
STATUS_RESPONSE=$(curl -s --max-time 10 "${SERVICE_URL}/api/status")
if [ $? -eq 0 ] && echo "$STATUS_RESPONSE" | grep -q "running"; then
    echo -e "${GREEN}✅ API /api/status работает${NC}"
    echo -e "${BLUE}   Ответ: $STATUS_RESPONSE${NC}"
else
    echo -e "${RED}❌ API /api/status не отвечает${NC}"
fi

# Проверяем /api/health
echo -e "${BLUE}🔍 Тестирование /api/health...${NC}"
HEALTH_RESPONSE=$(curl -s --max-time 10 "${SERVICE_URL}/api/health")
if [ $? -eq 0 ] && echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✅ API /api/health работает${NC}"
    echo -e "${BLUE}   Ответ: $HEALTH_RESPONSE${NC}"
else
    echo -e "${RED}❌ API /api/health не отвечает${NC}"
fi

# Проверяем /api/socket-test
echo -e "${BLUE}🔍 Тестирование /api/socket-test...${NC}"
SOCKET_RESPONSE=$(curl -s --max-time 10 "${SERVICE_URL}/api/socket-test")
if [ $? -eq 0 ] && echo "$SOCKET_RESPONSE" | grep -q "socket_available"; then
    echo -e "${GREEN}✅ API /api/socket-test работает${NC}"
    echo -e "${BLUE}   Ответ: $SOCKET_RESPONSE${NC}"
else
    echo -e "${RED}❌ API /api/socket-test не отвечает${NC}"
fi

echo -e "${YELLOW}3. Проверка главной страницы...${NC}"
MAIN_RESPONSE=$(curl -s --max-time 10 "${SERVICE_URL}/" | head -5)
if [ $? -eq 0 ] && echo "$MAIN_RESPONSE" | grep -q "html\|json"; then
    echo -e "${GREEN}✅ Главная страница загружается${NC}"
else
    echo -e "${RED}❌ Главная страница не загружается${NC}"
fi

echo -e "${YELLOW}4. Проверка статических файлов...${NC}"
# Проверяем, что статические файлы доступны
if curl -s --max-time 10 "${SERVICE_URL}/assets/" > /dev/null; then
    echo -e "${GREEN}✅ Статические файлы доступны${NC}"
else
    echo -e "${YELLOW}⚠️ Статические файлы могут быть недоступны${NC}"
fi

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}📊 РЕЗУЛЬТАТ ПРОВЕРКИ${NC}"
echo -e "${BLUE}================================${NC}"

echo -e "${GREEN}🎉 ПРОВЕРКА ЗАВЕРШЕНА!${NC}"
echo ""
echo -e "${BLUE}🌐 Ваш сервис NAUCHI:${NC}"
echo -e "${YELLOW}   URL: ${SERVICE_URL}${NC}"
echo ""
echo -e "${BLUE}🔍 API endpoints:${NC}"
echo -e "${YELLOW}   • Статус: ${SERVICE_URL}/api/status${NC}"
echo -e "${YELLOW}   • Health: ${SERVICE_URL}/api/health${NC}"
echo -e "${YELLOW}   • Socket.IO: ${SERVICE_URL}/api/socket-test${NC}"
echo ""
echo -e "${BLUE}📊 Мониторинг:${NC}"
echo -e "${YELLOW}   • Render Dashboard: https://dashboard.render.com${NC}"
echo -e "${YELLOW}   • Логи: Render Dashboard → ваш сервис → Logs${NC}"
echo ""
echo -e "${BLUE}🔄 Обновления:${NC}"
echo -e "${YELLOW}   • При каждом push в main ветку сервис автоматически обновляется${NC}"
echo -e "${YELLOW}   • Время обновления: 5-10 минут${NC}"

# Проверяем, есть ли проблемы
if echo "$STATUS_RESPONSE" | grep -q "running" && echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo ""
    echo -e "${GREEN}✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ! Сервис работает корректно.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОЙДЕНЫ${NC}"
    echo -e "${YELLOW}   Проверьте логи в Render Dashboard для диагностики${NC}"
    exit 1
fi
