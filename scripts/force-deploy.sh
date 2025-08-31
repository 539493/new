#!/bin/bash

echo "🚀 Принудительный деплой на Render..."

# Добавляем все изменения
git add -A

# Создаем коммит с временной меткой
git commit -m "FORCE DEPLOY: $(date '+%Y-%m-%d %H:%M:%S') - Принудительное обновление"

# Отправляем на GitHub
git push origin main

echo "✅ Изменения отправлены на GitHub"
echo "🔄 Render должен начать деплой автоматически"
echo "📊 Проверьте статус на: https://dashboard.render.com"
echo "🌐 Приложение будет доступно на: https://tutoring-platform-am88.onrender.com"
