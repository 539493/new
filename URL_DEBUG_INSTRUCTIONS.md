# Диагностика проблемы с URL

## Проблема
```
Error loading chats from server: SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
```

Это означает, что фронтенд получает HTML вместо JSON, что указывает на неправильный URL.

## Диагностика

### Шаг 1: Откройте консоль браузера
1. Откройте http://localhost:3000
2. Нажмите F12
3. Перейдите на вкладку Console

### Шаг 2: Найдите логи
Ищите следующие логи:
```
Loading chats from server...
SERVER_URL: http://localhost:3001  👈 Должно быть localhost:3001
Fetching from URL: http://localhost:3001/api/sync  👈 Должно быть localhost:3001
```

### Шаг 3: Проверьте WebSocket
Ищите логи:
```
Server is available, initializing Socket.IO connection...
SERVER_URL for WebSocket: http://localhost:3001  👈 Должно быть localhost:3001
```

## Возможные проблемы

### Если SERVER_URL показывает localhost:3000:
- ❌ **Фронтенд запущен в production режиме**
- Решение: Перезапустите фронтенд командой `npm run dev`

### Если SERVER_URL показывает production URL:
- ❌ **Переменные окружения неправильные**
- Решение: Проверьте .env файл или перезапустите

### Если URL правильный, но ошибка остается:
- ❌ **Сервер не запущен на порту 3001**
- Решение: Запустите сервер `cd backend && node server.cjs`

## Быстрое решение

1. **Остановите все процессы:**
   ```bash
   # Остановите фронтенд (Ctrl+C)
   # Остановите сервер (Ctrl+C)
   ```

2. **Запустите сервер:**
   ```bash
   cd backend
   node server.cjs
   ```

3. **В новом терминале запустите фронтенд:**
   ```bash
   npm run dev
   ```

4. **Проверьте URL в консоли браузера**

## Проверка сервера

Убедитесь, что сервер работает:
```bash
curl http://localhost:3001/api/health
```

Должен вернуть JSON:
```json
{"message":"Tutoring Platform WebSocket Server","status":"running",...}
```

Если возвращает HTML - сервер не запущен или запущен на другом порту.

## Проверка фронтенда

Убедитесь, что фронтенд запущен в dev режиме:
```bash
npm run dev
```

Должен показать:
```
Local:   http://localhost:3000/
Network: use --host to expose
```

## Ожидаемые логи в консоли

После исправления в консоли должно появиться:
```
Loading chats from server...
SERVER_URL: http://localhost:3001
Fetching from URL: http://localhost:3001/api/sync
Response status: 200
Server sync data received: {chatsCount: 0, chats: []}
Chats loaded from server and saved to localStorage
```

## Если ничего не помогает

1. **Очистите кэш браузера:**
   - Ctrl+Shift+R (жесткая перезагрузка)
   - Или откройте в режиме инкогнито

2. **Проверьте, что нет других процессов на портах:**
   ```bash
   lsof -i :3000
   lsof -i :3001
   ```

3. **Перезапустите все:**
   ```bash
   # Убейте все процессы Node.js
   pkill -f node
   
   # Запустите заново
   cd backend && node server.cjs &
   npm run dev
   ```
