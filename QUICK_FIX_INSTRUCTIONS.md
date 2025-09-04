# Быстрое решение проблемы с URL

## Проблема
```
Error loading chats from server: SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
```

## Причина
Фронтенд получает HTML вместо JSON, что означает неправильный URL.

## Быстрое решение

### Шаг 1: Очистите кэш браузера
1. Откройте http://localhost:3000
2. Нажмите **Ctrl+Shift+R** (жесткая перезагрузка)
3. Или откройте в **режиме инкогнито**

### Шаг 2: Проверьте консоль браузера
1. Нажмите **F12**
2. Перейдите на вкладку **Console**
3. Ищите логи:
   ```
   Loading chats from server...
   SERVER_URL: http://localhost:3001  👈 Должно быть localhost:3001
   ```

### Шаг 3: Если URL неправильный
1. **Остановите фронтенд** (Ctrl+C)
2. **Перезапустите фронтенд:**
   ```bash
   npm run dev
   ```
3. **Обновите страницу** (F5)

### Шаг 4: Если проблема остается
1. **Очистите localStorage:**
   ```javascript
   // В консоли браузера выполните:
   localStorage.clear();
   location.reload();
   ```

2. **Проверьте переменные окружения:**
   ```bash
   echo $NODE_ENV
   # Должно быть пусто или development
   ```

3. **Перезапустите все:**
   ```bash
   # Остановите все процессы (Ctrl+C)
   # Запустите сервер
   cd backend && node server.cjs &
   # Запустите фронтенд
   npm run dev
   ```

## Проверка

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

1. **Убейте все процессы Node.js:**
   ```bash
   pkill -f node
   ```

2. **Запустите заново:**
   ```bash
   # Терминал 1 - сервер
   cd backend
   node server.cjs
   
   # Терминал 2 - фронтенд
   npm run dev
   ```

3. **Откройте в новом окне браузера:**
   - http://localhost:3000
   - Откройте консоль (F12)
   - Проверьте логи

## Ожидаемый результат

После исправления:
- ✅ Фронтенд подключается к localhost:3001
- ✅ WebSocket соединение работает
- ✅ Чаты загружаются с сервера
- ✅ Создание чатов работает
- ✅ Сообщения доставляются
