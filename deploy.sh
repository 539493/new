#!/bin/bash

echo "🚀 Начинаем развертывание CRM API Server..."

# Проверяем, что мы в правильной директории
if [ ! -f "server.cjs" ]; then
    echo "❌ Ошибка: server.cjs не найден. Убедитесь, что вы в папке crm-api-server"
    exit 1
fi

# Проверяем git статус
echo "📋 Проверяем git статус..."
git status

# Добавляем все изменения
echo "📦 Добавляем изменения..."
git add .

# Коммитим изменения
echo "💾 Коммитим изменения..."
git commit -m "Update CRM API Server"

# Отправляем на GitHub
echo "📤 Отправляем на GitHub..."
git push origin main

echo "✅ Код отправлен на GitHub!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Откройте https://render.com/dashboard"
echo "2. Создайте новый Web Service"
echo "3. Подключите репозиторий crm-api-server"
echo "4. Настройте развертывание"
echo "5. Обновите CRM_API_URL в основном проекте"
echo ""
echo "🎉 Готово к развертыванию!" 