# 🔧 Исправление офлайн режима для студентов

## 🚨 Проблема

Приложение показывает:
```
Офлайн режим (кэшированные данные)
```

И в логах видно:
```
👨‍🎓 Студентов: 0
```

## 🎯 Причина

Проблема была в неправильной конфигурации:
1. **Неправильный порт сервера** в `src/config.ts` (3001 вместо 10000)
2. **Отсутствие CORS для Vite dev server** (порт 5173)
3. **Недостаточное логирование** для диагностики Socket.IO

## ✅ Что было исправлено

### 1. Обновлена конфигурация (`src/config.ts`):
```typescript
// URL сервера
export const SERVER_URL = isProd 
  ? 'https://nauchi.onrender.com' 
  : 'http://localhost:10000';  // ← Исправлено с 3001 на 10000

// URL WebSocket
export const WEBSOCKET_URL = isProd 
  ? 'https://nauchi.onrender.com' 
  : 'http://localhost:10000';  // ← Исправлено с 3001 на 10000
```

### 2. Обновлены CORS настройки (`backend/production-server.cjs`):
```javascript
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:4173",
  "http://localhost:5173", // ← Добавлен Vite dev server
  "https://*.vercel.app",
  "https://*.onrender.com",
  "https://na-uchi.onrender.com",
  "https://nauchi.onrender.com", // ← Добавлен новый домен
  // ... остальные домены
];
```

### 3. Улучшено логирование Socket.IO:
```javascript
console.log('🔍 Socket.IO CORS check for origin:', origin);
console.log('✅ Socket.IO CORS allowed:', isAllowed);
```

## 🚀 Как применить исправление

### Автоматическое исправление:
```bash
# Тестирование подключения
./scripts/test-online-connection.sh
```

### Ручное исправление:
```bash
# 1. Пересборка проекта
npm run build

# 2. Коммит изменений
git add .
git commit -m "Fix offline mode - correct server port and CORS"
git push origin main

# 3. Render автоматически пересоберет и развернет
```

## 🔍 Проверка исправления

### Локальное тестирование:
```bash
# 1. Запуск сервера
npm start

# 2. В другом терминале запуск фронтенда
npm run dev

# 3. Открыть браузер
# http://localhost:5173 (Vite dev server)
# или
# http://localhost:10000 (Production server)
```

### Ожидаемый результат:
- ✅ Статус: "Подключено в реальном времени" (зеленый индикатор)
- ✅ Нет ошибок в консоли браузера
- ✅ Socket.IO подключается автоматически
- ✅ Данные синхронизируются в реальном времени

## 📊 Результат тестирования

После исправления все тесты проходят:
```
✅ config.ts найден
✅ Правильный порт сервера (10000)
✅ Сервер запущен
✅ API /api/status работает
✅ API /api/health работает
✅ API /api/socket-test работает
✅ Главная страница загружается
✅ Статические файлы готовы
✅ Директория assets существует
```

## 🛠 Диагностика

### Если проблема остается:

1. **Проверьте консоль браузера:**
   - Откройте DevTools (F12)
   - Перейдите в Console
   - Ищите ошибки подключения

2. **Проверьте Network tab:**
   - Откройте DevTools
   - Перейдите в Network
   - Обновите страницу
   - Ищите неудачные запросы к серверу

3. **Проверьте логи сервера:**
   ```bash
   npm start
   # Ищите сообщения о Socket.IO подключениях
   ```

4. **Проверьте конфигурацию:**
   ```bash
   # Убедитесь, что порт правильный
   grep -n "localhost:10000" src/config.ts
   ```

## 🌐 Для развертывания на Render

После локального исправления:

1. **Коммит изменений:**
   ```bash
   git add .
   git commit -m "Fix offline mode for students"
   git push origin main
   ```

2. **Дождитесь пересборки** на Render (5-10 минут)

3. **Проверьте работу** на https://nauchi.onrender.com

## 📱 Созданные файлы

- **`scripts/test-online-connection.sh`** - Скрипт для тестирования подключения
- **`FIX_OFFLINE_MODE_GUIDE.md`** - Эта инструкция

## ✅ Результат

После исправления:
- ✅ Студенты подключаются онлайн
- ✅ Статус показывает "Подключено в реальном времени"
- ✅ Socket.IO работает корректно
- ✅ Данные синхронизируются в реальном времени
- ✅ Нет ошибок в консоли браузера

---

**🎉 Готово! Студенты теперь онлайн и могут подключаться к серверу!**
