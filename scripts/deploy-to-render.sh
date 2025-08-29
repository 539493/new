#!/bin/bash

# 🚀 Скрипт для развертывания на Render
# Использование: ./scripts/deploy-to-render.sh

set -e

echo "🚀 Начинаем развертывание на Render..."

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден. Убедитесь, что вы в корневой папке проекта."
    exit 1
fi

# Проверяем наличие необходимых файлов
echo "📋 Проверяем наличие необходимых файлов..."

required_files=(
    "render.yaml"
    "package.json"
    "backend/production-server.cjs"
    "src/config.ts"
    "vite.config.ts"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Ошибка: файл $file не найден"
        exit 1
    fi
    echo "✅ $file найден"
done

# Проверяем, что все изменения закоммичены
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Внимание: есть незакоммиченные изменения"
    echo "📝 Текущий статус:"
    git status --short
    
    read -p "Хотите закоммитить изменения? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📝 Коммитим изменения..."
        git add .
        git commit -m "Auto-deploy: $(date)"
    else
        echo "❌ Отмена развертывания"
        exit 1
    fi
fi

# Проверяем, что мы на ветке main
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  Внимание: вы не на ветке main (текущая ветка: $current_branch)"
    read -p "Хотите переключиться на main? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
    else
        echo "❌ Отмена развертывания"
        exit 1
    fi
fi

# Отправляем изменения на GitHub
echo "📤 Отправляем изменения на GitHub..."
git push origin main

echo "✅ Изменения отправлены на GitHub"
echo "🔄 Render автоматически начнет развертывание..."

# Проверяем статус развертывания
echo "⏳ Ожидаем начала развертывания..."
sleep 10

echo "📊 Для проверки статуса развертывания:"
echo "1. Перейдите в Render Dashboard: https://dashboard.render.com"
echo "2. Найдите ваш сервис 'tutoring-platform'"
echo "3. Проверьте логи в разделе 'Logs'"
echo "4. Дождитесь статуса 'Live'"

echo ""
echo "🔗 После развертывания ваш проект будет доступен по URL:"
echo "https://tutoring-platform-xxxxx.onrender.com"
echo ""
echo "🎉 Развертывание завершено!"
