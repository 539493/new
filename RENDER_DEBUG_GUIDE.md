# 🔧 Диагностика проблем с Render

## 🚨 Проблема: Видео чат не подключается

### ✅ Что мы исправили:

1. **Обновили static-server.cjs** - добавили правильную обработку WebSocket
2. **Создали WebSocketTest компонент** - для диагностики подключения
3. **Исправили App.tsx** - убрали ошибки линтера

### 🧪 Как протестировать:

#### 1. **Проверьте WebSocket подключение**
Откройте: `https://tutoring-platform-0gvk.onrender.com/websocket-test`

Этот компонент покажет:
- ✅ Статус подключения к WebSocket
- ❌ Ошибки подключения
- 📊 Логи подключения

#### 2. **Проверьте API сервера**
```bash
curl https://tutoring-platform-0gvk.onrender.com/api/health
```

Ожидаемый ответ:
```json
{
  "message": "Tutoring Platform WebSocket Server",
  "status": "running",
  "connectedClients": 0,
  "timeSlots": 0,
  "lessons": 0,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "production"
}
```

#### 3. **Проверьте видео чат**
Откройте: `https://tutoring-platform-0gvk.onrender.com/video-test`

### 🔍 Возможные проблемы:

#### 1. **WebSocket не подключается**
**Причины:**
- CORS блокирует подключение
- Неправильный URL сервера
- Render не поддерживает WebSocket

**Решение:**
- Проверьте логи в браузере (F12 → Console)
- Убедитесь, что используется HTTPS
- Проверьте CORS настройки

#### 2. **Видео не работает**
**Причины:**
- Камера не разрешена
- WebRTC не поддерживается
- STUN серверы недоступны

**Решение:**
- Разрешите доступ к камере
- Проверьте поддержку WebRTC
- Попробуйте другой браузер

#### 3. **Сервер не отвечает**
**Причины:**
- Render сервис не запущен
- Неправильная конфигурация
- Ошибки в коде

**Решение:**
- Проверьте логи Render
- Убедитесь, что build прошел успешно
- Проверьте переменные окружения

### 📊 Логи для проверки:

#### В браузере (F12 → Console):
```
✅ WebSocket connected successfully!
❌ WebSocket connection error: [error message]
🔌 WebSocket disconnected
```

#### В Render Dashboard:
1. Зайдите в ваш сервис на Render
2. Перейдите на вкладку "Logs"
3. Ищите ошибки подключения

### 🛠️ Команды для диагностики:

#### Локальное тестирование:
```bash
# Сборка
npm run build

# Запуск статического сервера
cd backend && node static-server.cjs

# Проверка
curl http://localhost:10000/api/health
```

#### Проверка Render:
```bash
# Проверка API
curl https://tutoring-platform-0gvk.onrender.com/api/health

# Проверка главной страницы
curl https://tutoring-platform-0gvk.onrender.com/
```

### 🎯 Следующие шаги:

1. **Откройте WebSocket тест**: `/websocket-test`
2. **Проверьте логи** в браузере и Render
3. **Протестируйте видео чат**: `/video-test`
4. **Сообщите результаты** для дальнейшей диагностики

### 📞 Если проблема остается:

1. Скопируйте логи из браузера
2. Проверьте логи Render Dashboard
3. Попробуйте другой браузер
4. Проверьте настройки камеры

## 🎉 Ожидаемый результат:

После исправлений должно работать:
- ✅ WebSocket подключение
- ✅ Видео чат
- ✅ Аудио и видео
- ✅ Соединение между участниками 