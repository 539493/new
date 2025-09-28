# Развертывание на Render

## Подготовка к развертыванию

1. **Настройка переменных окружения на Render:**
   - `NODE_ENV=production`
   - `PORT=10000` (Render автоматически устанавливает этот порт)
   - `VITE_SERVER_URL=https://your-app-name.onrender.com` (замените на ваш URL)

2. **Структура проекта:**
   - Backend: `backend/server.cjs`
   - Frontend: `frontend/` (собирается в `frontend/dist/`)
   - Статические файлы обслуживаются из `frontend/dist/`

## Команды для развертывания

### Локальная разработка:
```bash
npm run install:all  # Установка всех зависимостей
npm run dev         # Запуск в режиме разработки
```

### Продакшн сборка:
```bash
npm run build       # Сборка frontend
npm start          # Запуск backend сервера
```

## Настройка Render

1. Подключите репозиторий к Render
2. Выберите тип сервиса: Web Service
3. Настройки:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
   - **Node Version:** 18+

## Важные моменты

- Все данные сохраняются в `backend/server_data.json`
- WebSocket соединения работают через Render
- CORS настроен для доменов Render
- Статические файлы фронтенда обслуживаются через Express

## Проверка работоспособности

После развертывания проверьте:
1. `/api/health` - статус сервера
2. `/api/users` - список пользователей
3. WebSocket соединения работают
4. Регистрация пользователей работает
5. Синхронизация данных между устройствами
