#!/bin/bash

# Скрипт для создания нового сервиса на Render
echo "🚀 Создание нового сервиса на Render..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Проверяем, что git настроен
if ! git config --get user.name > /dev/null 2>&1; then
    echo -e "${RED}❌ Git не настроен. Настройте git перед развертыванием:${NC}"
    echo "git config --global user.name 'Ваше имя'"
    echo "git config --global user.email 'ваш@email.com'"
    exit 1
fi

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ] || [ ! -f "render.yaml" ]; then
    echo -e "${RED}❌ Не найдены необходимые файлы. Убедитесь, что вы в корневой директории проекта.${NC}"
    exit 1
fi

# Генерируем уникальное имя для сервиса
TIMESTAMP=$(date +%s)
SERVICE_NAME="tutoring-platform-${TIMESTAMP}"

echo -e "${BLUE}📝 Генерируем уникальное имя сервиса: ${SERVICE_NAME}${NC}"

# Обновляем render.yaml с новым именем
sed -i.bak "s/name: tutoring-platform-new/name: ${SERVICE_NAME}/" render.yaml

# Проверяем статус git
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}📝 Обнаружены несохраненные изменения. Коммитим их...${NC}"
    git add .
    git commit -m "Подготовка к развертыванию нового сервиса ${SERVICE_NAME}"
fi

# Проверяем, что мы на ветке main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Текущая ветка: ${CURRENT_BRANCH}. Переключаемся на main...${NC}"
    git checkout main
fi

# Коммитим изменения конфигурации
echo -e "${BLUE}📝 Коммитим изменения конфигурации...${NC}"
git add render.yaml
git commit -m "Обновление конфигурации для нового сервиса ${SERVICE_NAME}"

# Пушим изменения
echo -e "${BLUE}📤 Отправляем изменения в репозиторий...${NC}"
git push origin main

echo -e "${GREEN}✅ Изменения отправлены в репозиторий!${NC}"
echo ""
echo -e "${BLUE}📋 Следующие шаги:${NC}"
echo "1. Перейдите на https://dashboard.render.com"
echo "2. Нажмите 'New +' и выберите 'Web Service'"
echo "3. Подключите ваш GitHub репозиторий"
echo "4. Render автоматически обнаружит render.yaml и создаст сервис"
echo "5. Имя сервиса будет: ${SERVICE_NAME}"
echo ""
echo -e "${YELLOW}⚠️  Важно: Убедитесь, что ваш репозиторий публичный или у Render есть доступ к приватному репозиторию${NC}"
echo ""
echo -e "${GREEN}🎉 Готово! Новый сервис будет создан автоматически после подключения репозитория.${NC}"

# Восстанавливаем оригинальный render.yaml
mv render.yaml.bak render.yaml 2>/dev/null || true
