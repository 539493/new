#!/bin/bash

# Скрипт для развертывания обновленного сервера на Render
# Восстанавливает данные преподавателей после обновления

echo "🚀 Развертывание обновленного сервера на Render..."

# Проверяем, что мы в правильной директории
if [ ! -f "production-server.cjs" ]; then
    echo "❌ Файл production-server.cjs не найден. Запустите скрипт из директории backend/"
    exit 1
fi

# Восстанавливаем данные преподавателей
echo "🔄 Восстанавливаем данные преподавателей..."
node restore-teachers.js

# Добавляем тестовые слоты
echo "📅 Добавляем тестовые слоты..."
node add-slots.js

# Проверяем, что данные восстановлены
echo "📊 Проверяем восстановленные данные:"
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('server_data.json', 'utf8'));
console.log('👨‍🏫 Преподавателей:', Object.keys(data.teacherProfiles).length);
console.log('📅 Слотов:', data.timeSlots.length);
console.log('👨‍🎓 Студентов:', Object.keys(data.studentProfiles).length);
"

echo "✅ Данные восстановлены успешно!"
echo "🌐 Теперь можно развертывать на Render с обновленными данными"
echo ""
echo "📝 Инструкции для развертывания:"
echo "1. Зафиксируйте изменения: git add . && git commit -m 'Fix teacher data persistence'"
echo "2. Отправьте на GitHub: git push origin main"
echo "3. Render автоматически развернет обновления"
echo ""
echo "🔧 Изменения в production-server.cjs:"
echo "- Убран дебаунсинг для сохранения данных (немедленное сохранение)"
echo "- Улучшена инициализация данных при запуске"
echo "- Добавлены тестовые данные преподавателя"
