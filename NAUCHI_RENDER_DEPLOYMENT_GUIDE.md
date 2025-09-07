# 🚀 Полная инструкция по развертыванию NAUCHI на Render

## 📋 Обзор проекта

**NAUCHI** - это платформа для онлайн-обучения с функциями:
- 👨‍🏫 Регистрация преподавателей и студентов
- 📅 Управление расписанием и слотами
- 💬 Система чатов и уведомлений
- 📚 Управление уроками
- 🔄 Синхронизация данных в реальном времени

## 🛠 Технический стек

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Socket.IO
- **Deployment**: Render.com
- **Data Storage**: JSON файлы (server_data.json)

## 📁 Структура проекта

```
проект/
├── src/                    # Frontend код
├── backend/               # Backend сервер
│   ├── production-server.cjs  # Основной сервер
│   └── server_data.json       # Данные приложения
├── package.json           # Зависимости и скрипты
├── render.yaml           # Конфигурация Render
└── scripts/              # Скрипты автоматизации
```

## 🎯 Пошаговая инструкция развертывания

### Шаг 1: Подготовка репозитория

1. **Убедитесь, что ваш код находится в Git репозитории:**
   ```bash
   git status
   git add .
   git commit -m "Подготовка к развертыванию NAUCHI"
   git push origin main
   ```

2. **Проверьте, что репозиторий публичный** (или у Render есть доступ к приватному)

### Шаг 2: Создание нового сервиса на Render

#### Вариант A: Автоматическое создание через render.yaml

1. **Перейдите на [Render Dashboard](https://dashboard.render.com)**
2. **Нажмите "New +" → "Web Service"**
3. **Подключите ваш GitHub репозиторий**
4. **Render автоматически обнаружит `render.yaml` и создаст сервис**

#### Вариант B: Ручное создание

1. **Перейдите на [Render Dashboard](https://dashboard.render.com)**
2. **Нажмите "New +" → "Web Service"**
3. **Подключите ваш GitHub репозиторий**
4. **Настройте параметры:**
   - **Name**: `nauchi` (или любое другое имя)
   - **Environment**: `Node`
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `20.x`

### Шаг 3: Настройка переменных окружения

В настройках сервиса добавьте переменные:

```env
NODE_ENV=production
PORT=10000
```

### Шаг 4: Настройка домена (опционально)

1. **В настройках сервиса перейдите в "Custom Domains"**
2. **Добавьте ваш домен** (например, `nauchi.com`)
3. **Настройте DNS записи** согласно инструкциям Render

### Шаг 5: Проверка развертывания

1. **Дождитесь завершения сборки** (обычно 5-10 минут)
2. **Проверьте логи** в разделе "Logs"
3. **Откройте URL сервиса** (например, `https://nauchi.onrender.com`)

## 🔧 Конфигурационные файлы

### render.yaml
```yaml
services:
  - type: web
    name: nauchi
    env: node
    buildCommand: npm install --legacy-peer-deps && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    healthCheckPath: /api/health
```

### package.json (ключевые скрипты)
```json
{
  "scripts": {
    "build": "npm install --legacy-peer-deps --include=dev && vite build",
    "start": "cd backend && node production-server.cjs",
    "render:build": "npm install --legacy-peer-deps && npm run build",
    "render:start": "cd backend && node production-server.cjs"
  }
}
```

## 🚀 Автоматизация развертывания

### Использование готового скрипта

```bash
# Запустите скрипт создания нового сервиса
./scripts/create-new-render-service.sh
```

Этот скрипт:
- ✅ Проверяет настройки Git
- ✅ Генерирует уникальное имя сервиса
- ✅ Обновляет конфигурацию
- ✅ Коммитит и пушит изменения
- ✅ Предоставляет инструкции для завершения

### Ручное развертывание

```bash
# 1. Обновите конфигурацию
git add .
git commit -m "Обновление для развертывания NAUCHI"
git push origin main

# 2. Создайте сервис на Render (через веб-интерфейс)
# 3. Дождитесь автоматического развертывания
```

## 🔍 Проверка работоспособности

### API Endpoints для проверки:

1. **Статус сервера**: `GET /api/status`
2. **Health check**: `GET /api/health`
3. **Socket.IO тест**: `GET /api/socket-test`
4. **Синхронизация данных**: `GET /api/sync`

### Ожидаемые ответы:

```json
// GET /api/status
{
  "message": "Nauchi API Server",
  "status": "running",
  "connectedClients": 0,
  "timeSlots": 0,
  "lessons": 0,
  "teachers": 0,
  "students": 0
}

// GET /api/health
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "version": "1.0.0",
  "socketConnections": 0
}
```

## 🛠 Устранение неполадок

### Частые проблемы:

1. **Ошибка 502 Bad Gateway**
   - Проверьте логи сервера
   - Убедитесь, что порт настроен правильно (10000)
   - Проверьте health check endpoint

2. **Ошибки сборки**
   - Проверьте версию Node.js (должна быть 20.x)
   - Убедитесь, что все зависимости установлены
   - Проверьте логи сборки

3. **Socket.IO не работает**
   - Проверьте CORS настройки
   - Убедитесь, что WebSocket поддерживается
   - Проверьте endpoint `/api/socket-test`

### Команды для диагностики:

```bash
# Проверка статуса развертывания
npm run deploy:check

# Тест сервера
npm run test:server

# Тест Socket.IO
npm run test:socket
```

## 📊 Мониторинг и логи

### Просмотр логов:
1. **В Render Dashboard** → ваш сервис → "Logs"
2. **Фильтрация по типу**: Build, Deploy, Runtime
3. **Поиск по ключевым словам**: error, warning, success

### Ключевые метрики:
- ✅ Время отклика API
- ✅ Количество подключений Socket.IO
- ✅ Использование памяти
- ✅ Статус health check

## 🔄 Обновления и переразвертывание

### Автоматические обновления:
- При каждом push в main ветку
- Render автоматически пересобирает и развертывает

### Ручные обновления:
```bash
# 1. Внесите изменения в код
# 2. Коммит и push
git add .
git commit -m "Обновление функциональности"
git push origin main

# 3. Render автоматически начнет пересборку
```

## 🎉 Завершение

После успешного развертывания ваш сервис NAUCHI будет доступен по адресу:
`https://[имя-сервиса].onrender.com`

### Следующие шаги:
1. ✅ Протестируйте все функции
2. ✅ Настройте мониторинг
3. ✅ Добавьте пользователей
4. ✅ Настройте резервное копирование данных

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в Render Dashboard
2. Используйте скрипты диагностики из папки `scripts/`
3. Обратитесь к документации Render: https://render.com/docs

---

**🎯 Готово! Ваш сервис NAUCHI успешно развернут на Render!**
