# 🚀 Быстрый деплой на Render

## ✅ Проект готов к деплою!

Все необходимые файлы настроены:
- ✅ Конфигурация URL для продакшена
- ✅ WebSocket сервер
- ✅ Статические файлы
- ✅ Health check endpoint
- ✅ render.yaml

## 🎯 Быстрые шаги

### 1. Подготовка
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Создание сервиса на Render

1. Зайдите на [render.com](https://render.com)
2. Нажмите "New +" → "Web Service"
3. Подключите ваш GitHub репозиторий
4. Настройте:

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

Render автоматически:
- Соберет проект при push в main
- Запустит сервер на порту 10000
- Проверит здоровье через `/api/health`

## 🔍 Проверка работы

После деплоя проверьте:

1. **Главная страница**: `https://your-app.onrender.com`
2. **Health Check**: `https://your-app.onrender.com/api/health`
3. **API Teachers**: `https://your-app.onrender.com/api/teachers`

## 🛠️ Возможные проблемы

### WebSocket не подключается
- Проверьте консоль браузера
- Убедитесь, что используется WSS в продакшене

### Статические файлы не загружаются
- Проверьте, что `dist/` папка создается при сборке
- Убедитесь, что сервер правильно раздает файлы

### CORS ошибки
- Сервер настроен для работы с CORS
- В продакшене все запросы идут на тот же домен

## 📊 Мониторинг

- **Logs**: Доступны в панели Render
- **Health Check**: Автоматическая проверка каждые 30 секунд
- **Metrics**: CPU, Memory, Network в панели Render

## 🔄 Обновления

Для обновления приложения:
```bash
git push origin main
```

Render автоматически пересоберет и перезапустит приложение.

---

**📖 Подробные инструкции**: `RENDER_DEPLOY.md`
**🔍 Проверка готовности**: `node check-deploy.cjs` 