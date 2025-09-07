# 🎓 NAUCHI - Платформа онлайн-обучения

## 🚀 Развертывание на Render

### ⚡ Быстрый старт

```bash
# 1. Проверка готовности
./scripts/check-nauchi-ready.sh

# 2. Развертывание
./scripts/deploy-nauchi.sh

# 3. Создание сервиса на Render (через веб-интерфейс)
```

### 📋 Подробные инструкции

- **Полная инструкция**: [NAUCHI_RENDER_DEPLOYMENT_GUIDE.md](./NAUCHI_RENDER_DEPLOYMENT_GUIDE.md)
- **Быстрый старт**: [QUICK_NAUCHI_DEPLOY.md](./QUICK_NAUCHI_DEPLOY.md)

## 🛠 Технический стек

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Socket.IO
- **Deployment**: Render.com
- **Data Storage**: JSON файлы

## 🎯 Функциональность

- 👨‍🏫 **Регистрация преподавателей и студентов**
- 📅 **Управление расписанием и слотами**
- 💬 **Система чатов и уведомлений**
- 📚 **Управление уроками**
- 🔄 **Синхронизация данных в реальном времени**

## 📁 Структура проекта

```
проект/
├── src/                           # Frontend код
│   ├── components/               # React компоненты
│   ├── contexts/                 # React контексты
│   └── types/                    # TypeScript типы
├── backend/                      # Backend сервер
│   ├── production-server.cjs     # Основной сервер
│   └── server_data.json         # Данные приложения
├── scripts/                      # Скрипты автоматизации
│   ├── deploy-nauchi.sh         # Развертывание
│   └── check-nauchi-ready.sh    # Проверка готовности
├── package.json                  # Зависимости и скрипты
├── render.yaml                   # Конфигурация Render
└── README_NAUCHI_DEPLOYMENT.md  # Этот файл
```

## 🔧 Конфигурация

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

## 🌐 После развертывания

Ваш сервис будет доступен по адресу:
**https://nauchi.onrender.com**

### API Endpoints

- **Статус**: `GET /api/status`
- **Health check**: `GET /api/health`
- **Socket.IO тест**: `GET /api/socket-test`
- **Синхронизация**: `GET /api/sync`

## 🔍 Мониторинг

- **Логи**: Render Dashboard → ваш сервис → "Logs"
- **Метрики**: Время отклика, подключения Socket.IO, использование памяти
- **Health check**: Автоматическая проверка каждые 30 секунд

## 🛠 Устранение неполадок

### Частые проблемы:

1. **Ошибка 502 Bad Gateway**
   - Проверьте логи сервера
   - Убедитесь, что порт настроен правильно (10000)

2. **Ошибки сборки**
   - Проверьте версию Node.js (должна быть 20.x)
   - Убедитесь, что все зависимости установлены

3. **Socket.IO не работает**
   - Проверьте CORS настройки
   - Убедитесь, что WebSocket поддерживается

### Команды для диагностики:

```bash
# Проверка статуса развертывания
npm run deploy:check

# Тест сервера
npm run test:server

# Тест Socket.IO
npm run test:socket
```

## 🔄 Обновления

При каждом push в main ветку Render автоматически:
1. Пересобирает приложение
2. Развертывает новую версию
3. Проверяет работоспособность

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в Render Dashboard
2. Используйте скрипты диагностики
3. Обратитесь к документации Render: https://render.com/docs

---

**🎉 Готово! Ваш NAUCHI успешно развернут на Render!**
