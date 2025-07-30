# Деплой на Render

## Настройка проекта для Render

Проект уже настроен для работы на Render. Основные изменения:

### 1. Конфигурация URL
- `src/config.ts` - настроены правильные URL для продакшена
- Автоматическое определение протокола (HTTP/HTTPS)
- WebSocket URL для продакшена

### 2. Сервер
- `backend/production-server-simple.cjs` - продакшен сервер
- Поддержка статических файлов из `dist/`
- API endpoints для здоровья сервера
- WebSocket сервер для real-time обновлений

### 3. Конфигурация Render
- `render.yaml` - конфигурация для Render
- Порт: 10000
- Health check: `/api/health`
- Автоматический деплой

## Шаги для деплоя

### 1. Подготовка
```bash
# Убедитесь, что все изменения закоммичены
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

### 2. Создание сервиса на Render

1. Зайдите на [render.com](https://render.com)
2. Создайте новый Web Service
3. Подключите ваш GitHub репозиторий
4. Настройте следующие параметры:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**
- `NODE_ENV`: `production`
- `PORT`: `10000`

### 3. Автоматический деплой

После настройки Render будет автоматически:
- Собирать проект при каждом push в main
- Запускать сервер на порту 10000
- Проверять здоровье через `/api/health`

## Проверка работы

После деплоя проверьте:

1. **Health Check**: `https://your-app.onrender.com/api/health`
2. **API Teachers**: `https://your-app.onrender.com/api/teachers`
3. **Главная страница**: `https://your-app.onrender.com`

## Возможные проблемы

### 1. WebSocket подключение
- Убедитесь, что в продакшене используется WSS (WebSocket Secure)
- Проверьте консоль браузера на ошибки подключения

### 2. Статические файлы
- Проверьте, что `dist/` папка создается при сборке
- Убедитесь, что сервер правильно раздает статические файлы

### 3. CORS
- Сервер настроен для работы с CORS
- В продакшене все запросы идут на тот же домен

## Мониторинг

- **Logs**: Доступны в панели Render
- **Health Check**: Автоматическая проверка каждые 30 секунд
- **Metrics**: CPU, Memory, Network в панели Render

## Обновления

Для обновления приложения просто сделайте push в main ветку:
```bash
git push origin main
```

Render автоматически пересоберет и перезапустит приложение. 