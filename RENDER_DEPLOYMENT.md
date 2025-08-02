# 🚀 Деплой на Render с видео чатом

## ✅ Что настроено для Render:

### 1. **Статический сервер с WebSocket поддержкой**
- `backend/static-server.cjs` - сервер, который раздает статические файлы и обрабатывает WebSocket
- Поддержка видео чата через WebRTC
- CORS настроен для всех доменов Render

### 2. **Конфигурация для продакшена**
- `src/config.ts` - автоматическое определение URL сервера
- В продакшене используется тот же домен для клиента и сервера
- В разработке используется localhost:3001

### 3. **render.yaml**
- Настроен для использования статического сервера
- Health check на `/api/health`
- Порт 10000

## 🚀 Как деплоить:

### 1. Подготовка кода
```bash
# Убедитесь, что все изменения закоммичены
git add .
git commit -m "Add video chat support for Render"
git push
```

### 2. Настройка на Render
1. Зайдите на [render.com](https://render.com)
2. Создайте новый Web Service
3. Подключите ваш GitHub репозиторий
4. Настройте следующие параметры:
   - **Name**: tutoring-platform
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `cd backend && node static-server.cjs`
   - **Plan**: Starter (или выше)

### 3. Переменные окружения
Добавьте следующие переменные окружения в Render:
```
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
```

## 🔧 Что происходит при деплое:

### Build процесс:
1. `npm install` - устанавливает зависимости
2. `npm run build` - собирает React приложение в папку `dist`

### Runtime:
1. `cd backend && node static-server.cjs` - запускает статический сервер
2. Сервер раздает файлы из папки `dist`
3. Обрабатывает WebSocket соединения для видео чата
4. Все маршруты возвращают `index.html` для SPA

## 📊 Проверка работы:

### 1. Health Check
```bash
curl https://your-app.onrender.com/api/health
```
Ожидаемый ответ:
```json
{
  "message": "Tutoring Platform Server",
  "status": "running",
  "connectedClients": 0,
  "time": "2024-01-01T12:00:00.000Z"
}
```

### 2. Тестирование видео чата
1. Откройте: `https://your-app.onrender.com/video-test`
2. Проверьте статус сервера (должен быть зеленый)
3. Начните видео чат
4. Откройте в другом браузере/устройстве
5. Используйте тот же ID комнаты

## 🐛 Возможные проблемы:

### 1. "Build failed"
**Решение:**
- Проверьте, что все зависимости указаны в `package.json`
- Убедитесь, что `npm run build` работает локально

### 2. "WebSocket connection failed"
**Решение:**
- Проверьте, что CORS настроен правильно
- Убедитесь, что используется HTTPS в продакшене

### 3. "Video not working"
**Решение:**
- Проверьте консоль браузера на ошибки
- Убедитесь, что камера разрешена в браузере
- Проверьте, что STUN серверы доступны

## 🔍 Логи и отладка:

### Просмотр логов на Render:
1. Зайдите в ваш сервис на Render
2. Перейдите на вкладку "Logs"
3. Проверьте логи на ошибки

### Локальное тестирование:
```bash
# Сборка
npm run build

# Запуск статического сервера
cd backend && node static-server.cjs

# Проверка
curl http://localhost:10000/api/health
```

## 📝 Структура файлов для деплоя:

```
project/
├── src/                    # React код
├── backend/
│   ├── static-server.cjs   # Статический сервер для Render
│   └── server.cjs         # Полный сервер для разработки
├── dist/                   # Собранные файлы (создается при build)
├── render.yaml             # Конфигурация Render
├── package.json            # Зависимости
└── vite.config.ts         # Конфигурация Vite
```

## 🎉 Результат:

После успешного деплоя у вас будет:
- ✅ Работающее приложение на Render
- ✅ Видео чат с WebRTC
- ✅ WebSocket соединения
- ✅ Статические файлы раздаются правильно
- ✅ SPA маршрутизация работает

URL вашего приложения будет: `https://your-app-name.onrender.com` 