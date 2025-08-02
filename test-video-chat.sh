#!/bin/bash

echo "🎥 Тестирование видео чата"
echo "=========================="

# Проверяем, что сервер запущен
echo "1. Проверяем сервер..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Сервер работает на порту 3001"
else
    echo "❌ Сервер не отвечает на порту 3001"
    echo "Запустите сервер: cd backend && node server.cjs"
    exit 1
fi

# Проверяем, что клиент запущен
echo "2. Проверяем клиент..."
if curl -s http://localhost:3002 > /dev/null; then
    echo "✅ Клиент работает на порту 3002"
else
    echo "❌ Клиент не отвечает на порту 3002"
    echo "Запустите клиент: npm run dev"
    exit 1
fi

echo ""
echo "🎯 Все готово для тестирования!"
echo ""
echo "Откройте в браузере:"
echo "  📱 Тестовая страница: http://localhost:3002/video-test"
echo "  🎥 Прямая ссылка: http://localhost:3002/video-chat?lesson=test&user=User&role=student"
echo "  📄 HTML тест: file://$(pwd)/test-webrtc.html"
echo ""
echo "Для тестирования с двумя участниками:"
echo "1. Откройте одну из ссылок выше"
echo "2. Разрешите доступ к камере и микрофону"
echo "3. Откройте ту же ссылку в другом браузере/вкладке"
echo "4. Используйте тот же ID комнаты"
echo ""
echo "🔧 Для отладки откройте консоль браузера (F12)" 