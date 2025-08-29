#!/bin/bash

# Скрипт для проверки статуса деплоя на Render

echo "🚀 Проверка статуса деплоя на Render"
echo "=================================="

# Проверяем доступность приложения
echo "📡 Проверяем доступность https://na-uchi.onrender.com..."

if curl -s -f https://na-uchi.onrender.com > /dev/null; then
    echo "✅ Приложение доступно!"
    
    # Получаем информацию о последнем коммите
    echo "📦 Информация о последнем коммите:"
    echo "   Branch: $(git branch --show-current)"
    echo "   Commit: $(git rev-parse --short HEAD)"
    echo "   Message: $(git log -1 --pretty=%B)"
    echo "   Date: $(git log -1 --pretty=%cd)"
    
    # Проверяем статус GitHub Actions
    echo ""
    echo "🔗 GitHub Actions:"
    echo "   https://github.com/539493/new/actions"
    
    echo ""
    echo "🌐 Приложение:"
    echo "   https://na-uchi.onrender.com"
    
else
    echo "❌ Приложение недоступно!"
    echo "🔍 Проверьте логи в Render Dashboard:"
    echo "   https://dashboard.render.com"
fi

echo ""
echo "📊 Полезные ссылки:"
echo "   Render Dashboard: https://dashboard.render.com"
echo "   GitHub Repo: https://github.com/539493/new"
echo "   GitHub Actions: https://github.com/539493/new/actions"
