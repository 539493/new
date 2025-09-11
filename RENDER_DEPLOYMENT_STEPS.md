# 🚀 Пошаговая инструкция развертывания NAUCHI на Render

## ✅ Подготовка завершена

Код успешно отправлен на GitHub: https://github.com/539493/new.git

## 🎯 Создание сервиса на Render

### Шаг 1: Откройте Render Dashboard
1. Перейдите на https://dashboard.render.com
2. Войдите в свой аккаунт (или создайте новый)

### Шаг 2: Создайте новый веб-сервис
1. Нажмите **"New +"** в верхнем правом углу
2. Выберите **"Web Service"**

### Шаг 3: Подключите репозиторий
1. Нажмите **"Connect account"** рядом с GitHub
2. Разрешите доступ к вашему репозиторию
3. Выберите репозиторий: **539493/new**

### Шаг 4: Настройте сервис
Render автоматически обнаружит `render.yaml` и применит настройки:

**Автоматические настройки:**
- **Name**: `nauchi`
- **Environment**: `Node`
- **Build Command**: `npm install --legacy-peer-deps && npm run build`
- **Start Command**: `npm start`
- **Port**: `10000`

**Environment Variables:**
```
NODE_ENV=production
PORT=10000
```

### Шаг 5: Создайте сервис
1. Нажмите **"Create Web Service"**
2. Render начнет автоматическую сборку и развертывание

## ⏱️ Время развертывания

- **Сборка**: 5-10 минут
- **Развертывание**: 2-3 минуты
- **Общее время**: 7-13 минут

## 🔍 Проверка развертывания

### После завершения сборки:

1. **Откройте URL сервиса**: `https://nauchi.onrender.com`

2. **Проверьте API endpoints:**
   - Статус: https://nauchi.onrender.com/api/status
   - Health: https://nauchi.onrender.com/api/health
   - Socket.IO: https://nauchi.onrender.com/api/socket-test

3. **Ожидаемые ответы:**
   ```json
   // GET /api/status
   {
     "message": "Nauchi API Server",
     "status": "running",
     "connectedClients": 0,
     "timeSlots": 0,
     "lessons": 0,
     "teachers": 7,
     "students": 0
   }
   ```

## 🛠 Мониторинг

### Просмотр логов:
1. В Render Dashboard → ваш сервис → **"Logs"**
2. Фильтруйте по типу: Build, Deploy, Runtime

### Ключевые метрики:
- ✅ Время отклика API
- ✅ Количество подключений Socket.IO
- ✅ Использование памяти
- ✅ Статус health check

## 🔧 Устранение неполадок

### Если сборка не удалась:
1. Проверьте логи сборки в Render Dashboard
2. Убедитесь, что Node.js версия 20.x
3. Проверьте, что все зависимости установлены

### Если сервис не запускается:
1. Проверьте логи развертывания
2. Убедитесь, что порт 10000 настроен правильно
3. Проверьте health check endpoint

### Если Socket.IO не работает:
1. Проверьте CORS настройки
2. Убедитесь, что WebSocket поддерживается
3. Проверьте endpoint `/api/socket-test`

## 🎉 Готово!

После успешного развертывания:
- ✅ Сервис доступен по адресу: `https://nauchi.onrender.com`
- ✅ API работает корректно
- ✅ Socket.IO подключения функционируют
- ✅ Автоматические обновления при push в main

## 🔄 Обновления

При каждом push в main ветку Render автоматически:
1. Пересобирает приложение
2. Развертывает новую версию
3. Проверяет работоспособность

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в Render Dashboard
2. Используйте скрипты диагностики из папки `scripts/`
3. Обратитесь к документации Render: https://render.com/docs

---

**🎯 Следуйте этим шагам для создания сервиса NAUCHI на Render!**

