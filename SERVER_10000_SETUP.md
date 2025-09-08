# 🚀 Настройка сервера на порту 10000

## 📋 Что было изменено

### 1. Конфигурация фронтенда (`src/config.ts`)
```typescript
// URL сервера
export const SERVER_URL = isProd 
  ? 'https://nauchi.onrender.com' 
  : 'http://localhost:10000';  // ← Изменено с 3001 на 10000

// URL WebSocket
export const WEBSOCKET_URL = isProd 
  ? 'https://nauchi.onrender.com' 
  : 'http://localhost:10000';  // ← Изменено с 3001 на 10000
```

### 2. Скрипт запуска (`backend/package.json`)
```json
{
  "scripts": {
    "start": "node server.cjs",
    "dev": "node server.cjs",
    "prod": "node production-server.cjs",  // ← Добавлен новый скрипт
    "build": "cd .. && npm run build"
  }
}
```

### 3. Автоматический скрипт запуска
Создан скрипт `scripts/start-server-10000.sh` для удобного запуска сервера.

## 🚀 Как запустить сервер на порту 10000

### Вариант 1: Автоматический скрипт (рекомендуется)
```bash
./scripts/start-server-10000.sh
```

### Вариант 2: Ручной запуск
```bash
cd backend
npm run prod
```

### Вариант 3: Прямой запуск
```bash
cd backend
node production-server.cjs
```

## 🔍 Проверка работы

После запуска сервера проверьте:

- **Основной URL**: http://localhost:10000
- **Health check**: http://localhost:10000/api/health
- **Статус API**: http://localhost:10000/api/status
- **Пользователи**: http://localhost:10000/api/users

## 📊 Что сохраняется на сервере

При регистрации пользователей на порту 10000 сохраняются:

- ✅ **Профили преподавателей** (`teacherProfiles`)
- ✅ **Профили студентов** (`studentProfiles`)
- ✅ **Слоты времени** (`timeSlots`)
- ✅ **Уроки** (`lessons`)
- ✅ **Чаты** (`chats`)
- ✅ **Посты** (`posts`)
- ✅ **Уведомления** (`notifications`)

Все данные сохраняются в файл `backend/server_data.json`.

## 🔧 Настройки сервера

- **Порт**: 10000 (по умолчанию)
- **Файл данных**: `backend/server_data.json`
- **CORS**: Настроен для localhost:10000
- **Socket.IO**: Поддерживает WebSocket и polling

## 🆘 Устранение проблем

### Проблема: Порт 10000 занят
```bash
# Найти процесс, использующий порт 10000
lsof -i :10000

# Завершить процесс
kill -9 <PID>
```

### Проблема: Ошибки CORS
Убедитесь, что в `backend/production-server.cjs` есть:
```javascript
const allowedOrigins = [
  "http://localhost:10000",  // ← Должен быть в списке
  // ... другие домены
];
```

### Проблема: Данные не сохраняются
Проверьте права доступа к файлу `backend/server_data.json`:
```bash
ls -la backend/server_data.json
```

## 🎯 Результат

После выполнения всех шагов:
- ✅ Фронтенд подключается к серверу на порту 10000
- ✅ Регистрация пользователей сохраняется на сервере
- ✅ Все данные синхронизируются между клиентами
- ✅ Socket.IO работает корректно

---

**🎉 Готово! Сервер настроен для работы на порту 10000!**
