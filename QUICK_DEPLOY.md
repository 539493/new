# Быстрый деплой на Render

## 🚀 Быстрые шаги

### 1. Создайте репозиторий на GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tutoring-platform.git
git push -u origin main
```

### 2. Создайте проект на Render
1. Перейдите на https://render.com
2. Нажмите "New +" → "Web Service"
3. Подключите GitHub и выберите репозиторий

### 3. Настройте сервис
- **Name**: `tutoring-platform`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node backend/production-server.cjs`
- **Health Check Path**: `/api/health`

### 4. Переменные окружения
- `NODE_ENV`: `production`

### 5. Нажмите "Create Web Service"

## ✅ Real-time функции готовы

- Мгновенное отображение слотов
- Real-time бронирование уроков
- Чат с преподавателями
- Уведомления о новых уроках
- Синхронизация профилей
- WebRTC поддержка

## 🔗 После деплоя

Ваше приложение будет доступно по адресу:
`https://your-app-name.onrender.com`

## 📋 Проверка работы

1. Откройте основную страницу
2. Проверьте health check: `/api/health`
3. Протестируйте real-time функции

## 🆘 Если что-то не работает

1. Проверьте логи в Render Dashboard
2. Убедитесь, что все файлы в репозитории
3. Проверьте, что build проходит локально 