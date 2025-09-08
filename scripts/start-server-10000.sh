#!/bin/bash

# 🚀 Скрипт для запуска сервера на порту 10000
# Этот скрипт запускает production-server.cjs на порту 10000

echo "🚀 Запуск сервера на порту 10000..."

# Переходим в директорию backend
cd "$(dirname "$0")/../backend"

# Проверяем, что production-server.cjs существует
if [ ! -f "production-server.cjs" ]; then
    echo "❌ Файл production-server.cjs не найден!"
    exit 1
fi

# Проверяем, что package.json существует
if [ ! -f "package.json" ]; then
    echo "❌ Файл package.json не найден!"
    exit 1
fi

# Устанавливаем зависимости, если node_modules не существует
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
fi

echo "🔧 Запуск production сервера на порту 10000..."
echo "📡 Сервер будет доступен по адресу: http://localhost:10000"
echo "🔍 Health check: http://localhost:10000/api/health"
echo "📊 Статус: http://localhost:10000/api/status"
echo ""
echo "Для остановки сервера нажмите Ctrl+C"
echo ""

# Запускаем production сервер
npm run prod
