# NAUCHI - Платформа онлайн-обучения

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
- **Data Storage**: JSON файлы (server_data.json)

## 📁 Структура проекта

```
проект/
├── frontend/               # Frontend приложение
│   ├── src/               # Исходный код React
│   ├── package.json       # Зависимости фронтенда
│   └── dist/              # Собранные файлы
├── backend/               # Backend сервер
│   ├── server.cjs         # Основной сервер
│   ├── server_data.json   # Данные приложения
│   └── package.json       # Зависимости бэкенда
└── package.json           # Корневой package.json
```

## 🚀 Локальная разработка

### Установка зависимостей

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd frontend
npm install
```

### Запуск в режиме разработки

#### Backend:
```bash
cd backend
npm start
```

#### Frontend:
```bash
cd frontend
npm run dev
```

### Сборка для продакшена

#### Frontend:
```bash
cd frontend
npm run build
```

## 🔧 API Endpoints

- **Статус сервера**: `GET /api/status`
- **Health check**: `GET /api/health`
- **Socket.IO тест**: `GET /api/socket-test`
- **Синхронизация данных**: `GET /api/sync`

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь, что все зависимости установлены
3. Проверьте конфигурацию в `frontend/src/config.ts`