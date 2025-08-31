# Инструкции для ручного деплоя на Render

## Проблема
Автоматический деплой на Render не запустился после пуша в GitHub.

## Решение: Ручной деплой

### Шаг 1: Откройте Render Dashboard
1. Перейдите на https://dashboard.render.com
2. Войдите в свой аккаунт

### Шаг 2: Найдите ваш сервис
1. В списке сервисов найдите `tutoring-platform-am88`
2. Нажмите на него для открытия деталей

### Шаг 3: Запустите ручной деплой
1. В разделе "Deploy" найдите кнопку **"Manual Deploy"**
2. Нажмите на неё
3. Выберите ветку `main`
4. Нажмите **"Deploy latest commit"**

### Шаг 4: Следите за процессом
1. Render начнет сборку проекта
2. В логах вы увидите процесс:
   ```
   Installing dependencies...
   Building project...
   Starting server...
   ```

### Шаг 5: Проверьте результат
1. После успешного деплоя статус изменится на "Live"
2. Приложение будет доступно по адресу: https://tutoring-platform-am88.onrender.com

## Альтернативные решения

### Если сервис не найден:
1. Создайте новый Web Service
2. Подключите GitHub репозиторий: https://github.com/539493/new
3. Настройте:
   - **Name**: tutoring-platform-am88
   - **Environment**: Node
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Start Command**: `npm start`
   - **Port**: 10000

### Если деплой падает с ошибкой:
1. Проверьте логи в Render Dashboard
2. Убедитесь, что все зависимости установлены
3. Проверьте, что порт 10000 доступен

## Проверка функциональности

После успешного деплоя проверьте:

### 1. Основные функции:
- ✅ Создание чатов
- ✅ Отправка сообщений
- ✅ Удаление чатов
- ✅ Контекстное меню

### 2. Отладка:
- Откройте консоль браузера (F12)
- Проверьте, что нет ошибок
- Убедитесь, что WebSocket подключение работает

### 3. API endpoints:
- https://tutoring-platform-am88.onrender.com/api/health
- https://tutoring-platform-am88.onrender.com/api/sync

## Контакты для поддержки

- **GitHub**: https://github.com/539493/new
- **Render Dashboard**: https://dashboard.render.com
- **Приложение**: https://tutoring-platform-am88.onrender.com

## Последние коммиты

```
0282dc78 FORCE DEPLOY: 2025-08-31 21:41:13 - Принудительное обновление
53976e04 FORCE DEPLOY: 2025-08-31 21:40:05 - Принудительное обновление
864fcd35 FINAL: Добавлен финальный отчет о загрузке проекта на GitHub
```

Все изменения загружены на GitHub и готовы для деплоя!
