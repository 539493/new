#!/bin/bash

# Скрипт для проверки готовности NAUCHI к развертыванию
echo "🔍 Проверка готовности NAUCHI к развертыванию..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Счетчики
CHECKS_PASSED=0
CHECKS_TOTAL=0

# Функция для проверки
check_item() {
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🔍 ПРОВЕРКА ГОТОВНОСТИ NAUCHI${NC}"
echo -e "${BLUE}================================${NC}"

# Проверка 1: Наличие основных файлов
echo -e "\n${YELLOW}📁 Проверка файлов проекта:${NC}"
[ -f "package.json" ] && check_item 0 "package.json найден" || check_item 1 "package.json не найден"
[ -f "render.yaml" ] && check_item 0 "render.yaml найден" || check_item 1 "render.yaml не найден"
[ -f "backend/production-server.cjs" ] && check_item 0 "production-server.cjs найден" || check_item 1 "production-server.cjs не найден"
[ -f "src/App.tsx" ] && check_item 0 "App.tsx найден" || check_item 1 "App.tsx не найден"

# Проверка 2: Настройки Git
echo -e "\n${YELLOW}🔧 Проверка настроек Git:${NC}"
git config --get user.name > /dev/null 2>&1 && check_item 0 "Git пользователь настроен" || check_item 1 "Git пользователь не настроен"
git config --get user.email > /dev/null 2>&1 && check_item 0 "Git email настроен" || check_item 1 "Git email не настроен"
git remote get-url origin > /dev/null 2>&1 && check_item 0 "Удаленный репозиторий настроен" || check_item 1 "Удаленный репозиторий не настроен"

# Проверка 3: Статус репозитория
echo -e "\n${YELLOW}📊 Проверка статуса репозитория:${NC}"
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}🌿 Текущая ветка: ${CURRENT_BRANCH}${NC}"
[ "$CURRENT_BRANCH" = "main" ] && check_item 0 "Находимся на ветке main" || check_item 1 "НЕ на ветке main (текущая: $CURRENT_BRANCH)"

# Проверка 4: Зависимости
echo -e "\n${YELLOW}📦 Проверка зависимостей:${NC}"
[ -f "package-lock.json" ] && check_item 0 "package-lock.json найден" || check_item 1 "package-lock.json не найден"
[ -d "node_modules" ] && check_item 0 "node_modules установлен" || check_item 1 "node_modules не установлен"

# Проверка 5: Конфигурация Render
echo -e "\n${YELLOW}⚙️ Проверка конфигурации Render:${NC}"
if [ -f "render.yaml" ]; then
    grep -q "name: nauchi\|name: tutoring-platform" render.yaml && check_item 0 "Имя сервиса настроено" || check_item 1 "Имя сервиса не настроено"
    grep -q "buildCommand:" render.yaml && check_item 0 "Build command настроен" || check_item 1 "Build command не настроен"
    grep -q "startCommand:" render.yaml && check_item 0 "Start command настроен" || check_item 1 "Start command не настроен"
    grep -q "healthCheckPath:" render.yaml && check_item 0 "Health check настроен" || check_item 1 "Health check не настроен"
else
    check_item 1 "render.yaml не найден"
fi

# Проверка 6: Скрипты в package.json
echo -e "\n${YELLOW}🚀 Проверка скриптов:${NC}"
if [ -f "package.json" ]; then
    grep -q '"build":' package.json && check_item 0 "Скрипт build найден" || check_item 1 "Скрипт build не найден"
    grep -q '"start":' package.json && check_item 0 "Скрипт start найден" || check_item 1 "Скрипт start не найден"
else
    check_item 1 "package.json не найден"
fi

# Проверка 7: Backend сервер
echo -e "\n${YELLOW}🖥️ Проверка backend сервера:${NC}"
if [ -f "backend/production-server.cjs" ]; then
    grep -q "express" backend/production-server.cjs && check_item 0 "Express найден в сервере" || check_item 1 "Express не найден в сервере"
    grep -q "socket.io" backend/production-server.cjs && check_item 0 "Socket.IO найден в сервере" || check_item 1 "Socket.IO не найден в сервере"
    grep -q "PORT.*process.env.PORT" backend/production-server.cjs && check_item 0 "Порт настроен из переменной окружения" || check_item 1 "Порт не настроен из переменной окружения"
else
    check_item 1 "production-server.cjs не найден"
fi

# Итоговый результат
echo -e "\n${BLUE}================================${NC}"
echo -e "${BLUE}📊 РЕЗУЛЬТАТ ПРОВЕРКИ${NC}"
echo -e "${BLUE}================================${NC}"

if [ $CHECKS_PASSED -eq $CHECKS_TOTAL ]; then
    echo -e "${GREEN}🎉 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ! (${CHECKS_PASSED}/${CHECKS_TOTAL})${NC}"
    echo -e "${GREEN}✅ NAUCHI готов к развертыванию на Render!${NC}"
    echo ""
    echo -e "${BLUE}🚀 Для развертывания выполните:${NC}"
    echo -e "${YELLOW}   ./scripts/deploy-nauchi.sh${NC}"
    exit 0
else
    echo -e "${RED}❌ НЕКОТОРЫЕ ПРОВЕРКИ НЕ ПРОЙДЕНЫ (${CHECKS_PASSED}/${CHECKS_TOTAL})${NC}"
    echo -e "${RED}⚠️  Исправьте ошибки перед развертыванием${NC}"
    echo ""
    echo -e "${BLUE}🔧 Рекомендации:${NC}"
    
    if ! git config --get user.name > /dev/null 2>&1; then
        echo -e "${YELLOW}   • Настройте Git: git config --global user.name 'Ваше имя'${NC}"
    fi
    
    if ! git config --get user.email > /dev/null 2>&1; then
        echo -e "${YELLOW}   • Настройте Git email: git config --global user.email 'ваш@email.com'${NC}"
    fi
    
    if ! git remote get-url origin > /dev/null 2>&1; then
        echo -e "${YELLOW}   • Настройте удаленный репозиторий: git remote add origin <URL>${NC}"
    fi
    
    if [ "$CURRENT_BRANCH" != "main" ]; then
        echo -e "${YELLOW}   • Переключитесь на main: git checkout main${NC}"
    fi
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}   • Установите зависимости: npm install${NC}"
    fi
    
    exit 1
fi
