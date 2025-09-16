# NAUCHI - Платформа онлайн-обучения

## 🚀 Живой сервис

**Сервис доступен по адресу: https://na-uchi.onrender.com**

## 📋 Описание

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
└── public/               # Статические файлы
```

## 🚀 Локальная разработка

### Установка зависимостей
```bash
npm install --legacy-peer-deps
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Сборка для продакшена
```bash
npm run build
```

### Запуск продакшен сервера
```bash
npm start
```

## 🔧 API Endpoints

- **Статус сервера**: `GET /api/status`
- **Health check**: `GET /api/health`
- **Socket.IO тест**: `GET /api/socket-test`
- **Синхронизация данных**: `GET /api/sync`

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в Render Dashboard
2. Обратитесь к документации Render: https://render.com/docs

---

**🎯 Сервис NAUCHI работает на https://na-uchi.onrender.com**