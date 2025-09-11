# Деплой на Render

## Настройка проекта для Render

Проект уже настроен для работы на Render. Вот что было сделано:

### 1. Конфигурация package.json
- Добавлены скрипты `render:build` и `render:start`
- Настроены зависимости для production

### 2. Конфигурация render.yaml
- Настроен buildCommand: `npm run render:build`
- Настроен startCommand: `npm run render:start`
- Установлен health check endpoint: `/api/health`
- Настроен порт: 10000

### 3. Production сервер
- `backend/production-server.cjs` настроен для работы на Render
- Поддерживает статические файлы из папки `dist`
- Настроен CORS для доменов Render
- Health check endpoint работает

## Как задеплоить на Render

### Шаг 1: Подготовка репозитория
```bash
# Убедитесь, что все изменения закоммичены
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

### Шаг 2: Создание сервиса на Render
1. Зайдите на [render.com](https://render.com)
2. Нажмите "New +" → "Web Service"
3. Подключите ваш GitHub репозиторий
4. Выберите ветку `main`

### Шаг 3: Настройка сервиса
- **Name**: `nauchi-tutoring-platform`
- **Environment**: `Node`
- **Build Command**: `npm run render:build`
- **Start Command**: `npm run render:start`
- **Plan**: `Free`

### Шаг 4: Переменные окружения
Render автоматически установит:
- `NODE_ENV=production`
- `PORT=10000`

### Шаг 5: Деплой
Нажмите "Create Web Service" и дождитесь завершения деплоя.

## Проверка работы

После деплоя проверьте:
1. **Health check**: `https://your-app.onrender.com/api/health`
2. **API status**: `https://your-app.onrender.com/api/status`
3. **Frontend**: `https://your-app.onrender.com/`

## Особенности

- Проект использует порт 10000 (настроен в render.yaml)
- Статические файлы фронтенда обслуживаются из папки `dist`
- Socket.IO настроен для работы с CORS
- Данные сохраняются в `server_data.json` (временное хранилище)

## Локальная разработка

Для локальной разработки:
```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для production
npm run build

# Запуск production сервера локально
npm start
```

## Troubleshooting

### Если деплой не работает:
1. Проверьте логи в Render Dashboard
2. Убедитесь, что buildCommand выполняется успешно
3. Проверьте, что startCommand запускает сервер
4. Убедитесь, что порт 10000 доступен

### Если фронтенд не загружается:
1. Проверьте, что папка `dist` создается при сборке
2. Убедитесь, что статические файлы обслуживаются правильно
3. Проверьте CORS настройки

### Если API не работает:
1. Проверьте health check endpoint
2. Убедитесь, что все API маршруты настроены
3. Проверьте логи сервера

