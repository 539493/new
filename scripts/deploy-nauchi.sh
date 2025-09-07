#!/bin/bash

# Скрипт для развертывания NAUCHI на Render
echo "🚀 Развертывание NAUCHI на Render..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Функция для вывода заголовков
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Функция для проверки успешности команды
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        exit 1
    fi
}

print_header "🚀 NAUCHI DEPLOYMENT TO RENDER"

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ] || [ ! -f "render.yaml" ]; then
    echo -e "${RED}❌ Не найдены необходимые файлы. Убедитесь, что вы в корневой директории проекта.${NC}"
    exit 1
fi

# Проверяем настройки Git
echo -e "${BLUE}🔍 Проверка настроек Git...${NC}"
if ! git config --get user.name > /dev/null 2>&1; then
    echo -e "${RED}❌ Git не настроен. Настройте git перед развертыванием:${NC}"
    echo "git config --global user.name 'Ваше имя'"
    echo "git config --global user.email 'ваш@email.com'"
    exit 1
fi

# Показываем текущие настройки Git
echo -e "${GREEN}👤 Git пользователь: $(git config --get user.name)${NC}"
echo -e "${GREEN}📧 Git email: $(git config --get user.email)${NC}"

# Проверяем статус репозитория
echo -e "${BLUE}📊 Проверка статуса репозитория...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${GREEN}🌿 Текущая ветка: ${CURRENT_BRANCH}${NC}"

# Проверяем, есть ли несохраненные изменения
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}📝 Обнаружены несохраненные изменения. Коммитим их...${NC}"
    git add .
    git commit -m "Подготовка к развертыванию NAUCHI на Render"
    check_success "Изменения закоммичены"
else
    echo -e "${GREEN}✅ Рабочая директория чистая${NC}"
fi

# Обновляем render.yaml для NAUCHI
echo -e "${BLUE}📝 Обновление конфигурации Render...${NC}"
if [ -f "render.yaml" ]; then
    # Создаем резервную копию
    cp render.yaml render.yaml.backup
    
    # Обновляем имя сервиса на NAUCHI
    sed -i.tmp 's/name: tutoring-platform-new/name: nauchi/' render.yaml
    rm render.yaml.tmp 2>/dev/null || true
    
    echo -e "${GREEN}✅ Конфигурация обновлена для NAUCHI${NC}"
else
    echo -e "${RED}❌ Файл render.yaml не найден${NC}"
    exit 1
fi

# Проверяем package.json
echo -e "${BLUE}📦 Проверка package.json...${NC}"
if grep -q "nauchi\|tutoring-platform" package.json; then
    echo -e "${GREEN}✅ package.json настроен${NC}"
else
    echo -e "${YELLOW}⚠️  Рекомендуется обновить название в package.json${NC}"
fi

# Коммитим изменения конфигурации
echo -e "${BLUE}📝 Коммитим изменения конфигурации...${NC}"
git add render.yaml
git commit -m "Обновление конфигурации для NAUCHI"
check_success "Конфигурация закоммичена"

# Проверяем подключение к удаленному репозиторию
echo -e "${BLUE}🔗 Проверка подключения к удаленному репозиторию...${NC}"
if git remote get-url origin > /dev/null 2>&1; then
    REMOTE_URL=$(git remote get-url origin)
    echo -e "${GREEN}🌐 Удаленный репозиторий: ${REMOTE_URL}${NC}"
else
    echo -e "${RED}❌ Удаленный репозиторий не настроен${NC}"
    echo "Настройте удаленный репозиторий:"
    echo "git remote add origin https://github.com/username/repository.git"
    exit 1
fi

# Пушим изменения
echo -e "${BLUE}📤 Отправляем изменения в репозиторий...${NC}"
git push origin ${CURRENT_BRANCH}
check_success "Изменения отправлены в репозиторий"

print_header "🎉 РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО"

echo -e "${GREEN}✅ Код успешно отправлен в репозиторий!${NC}"
echo ""
echo -e "${BLUE}📋 Следующие шаги для создания сервиса на Render:${NC}"
echo ""
echo -e "${YELLOW}1. Откройте https://dashboard.render.com${NC}"
echo -e "${YELLOW}2. Нажмите 'New +' → 'Web Service'${NC}"
echo -e "${YELLOW}3. Подключите ваш GitHub репозиторий${NC}"
echo -e "${YELLOW}4. Render автоматически обнаружит render.yaml${NC}"
echo -e "${YELLOW}5. Имя сервиса будет: nauchi${NC}"
echo ""
echo -e "${BLUE}🔧 Настройки сервиса:${NC}"
echo -e "${GREEN}   • Имя: nauchi${NC}"
echo -e "${GREEN}   • Environment: Node${NC}"
echo -e "${GREEN}   • Build Command: npm install --legacy-peer-deps && npm run build${NC}"
echo -e "${GREEN}   • Start Command: npm start${NC}"
echo -e "${GREEN}   • Port: 10000${NC}"
echo ""
echo -e "${BLUE}🌐 После создания сервис будет доступен по адресу:${NC}"
echo -e "${GREEN}   https://nauchi.onrender.com${NC}"
echo ""
echo -e "${BLUE}🔍 Для проверки работоспособности:${NC}"
echo -e "${GREEN}   • Статус: https://nauchi.onrender.com/api/status${NC}"
echo -e "${GREEN}   • Health: https://nauchi.onrender.com/api/health${NC}"
echo -e "${GREEN}   • Socket.IO: https://nauchi.onrender.com/api/socket-test${NC}"
echo ""
echo -e "${YELLOW}⚠️  Важно:${NC}"
echo -e "${YELLOW}   • Убедитесь, что репозиторий публичный или у Render есть доступ${NC}"
echo -e "${YELLOW}   • Первое развертывание может занять 5-10 минут${NC}"
echo -e "${YELLOW}   • Проверьте логи в Render Dashboard при возникновении проблем${NC}"
echo ""
echo -e "${PURPLE}🎯 Готово! Следуйте инструкциям выше для завершения развертывания.${NC}"

# Восстанавливаем резервную копию render.yaml
if [ -f "render.yaml.backup" ]; then
    mv render.yaml.backup render.yaml
    echo -e "${BLUE}🔄 Восстановлена резервная копия render.yaml${NC}"
fi
