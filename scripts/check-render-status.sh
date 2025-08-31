#!/bin/bash

echo "🔍 Проверка статуса деплоя на Render..."
echo ""
echo "📊 GitHub статус:"
git status
echo ""
echo "📝 Последние коммиты:"
git log --oneline -5
echo ""
echo "🌐 Render Dashboard: https://dashboard.render.com"
echo "🔗 Приложение: https://tutoring-platform-am88.onrender.com"
echo ""
echo "📋 Инструкции для проверки:"
echo "1. Откройте https://dashboard.render.com"
echo "2. Найдите сервис 'tutoring-platform-am88'"
echo "3. Проверьте статус деплоя"
echo "4. Если деплой не запустился, нажмите 'Manual Deploy'"
echo ""
echo "🔄 Если нужно принудительно запустить деплой:"
echo "   npm run deploy:force"
