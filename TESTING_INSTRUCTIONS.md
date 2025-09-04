# Инструкция для тестирования проблемы с чатами

## Подготовка

1. **Убедитесь, что сервер запущен:**
   ```bash
   cd backend
   node server.cjs
   ```
   Сервер должен быть доступен на http://localhost:3001

2. **Запустите фронтенд:**
   ```bash
   npm run dev
   ```
   Фронтенд должен быть доступен на http://localhost:3000

## Тестирование

### Шаг 1: Откройте два браузера/вкладки
- **Вкладка 1**: Войдите как ученик
- **Вкладка 2**: Войдите как репетитор

### Шаг 2: Откройте консоль разработчика
- Нажмите **F12** в обеих вкладках
- Перейдите на вкладку **Console**

### Шаг 3: Отправьте сообщение от ученика
1. В первой вкладке (ученик):
   - Найдите репетитора
   - Нажмите "Написать сообщение"
   - Посмотрите на логи в консоли

2. Во второй вкладке (репетитор):
   - Перейдите в раздел "Чаты"
   - Посмотрите на логи в консоли

## Что искать в логах

### В консоли ученика должно появиться:
```
🔍 StudentHome handleMessage DEBUG:
- Student user: {id: "...", name: "...", role: "student"}
- Target teacher ID: "..."
- Found teacher: {...}
- Creating chat between: {...}
- Created/found chat ID: "..."
🔍 END StudentHome DEBUG

getOrCreateChat called: {...}
Creating new chat: {...}
New chat saved to localStorage
Sending new chat to server
```

### В консоли репетитора должно появиться:
```
chatCreated event received: {...}
Adding new chat to state: "..."

🔍 ChatList DEBUG INFO:
- Current user: {id: "...", name: "...", role: "teacher"}
- All chats count: 1
- User chats count: 1  👈 ВАЖНО: должно быть больше 0
- All chats details:
  Chat 1: {
    id: "...",
    participants: ["student_id", "teacher_id"],
    participantNames: ["Student Name", "Teacher Name"],
    includesUser: true  👈 ВАЖНО: должно быть true
  }
- Filtered chats count: 1  👈 ВАЖНО: должно быть больше 0
🔍 END DEBUG INFO
```

## Диагностика проблем

### Если у репетитора НЕТ логов "chatCreated event received":
- ❌ **Проблема с WebSocket соединением**
- Проверьте, что сервер запущен
- Проверьте, что нет ошибок в консоли

### Если есть "chatCreated event received", но "User chats count: 0":
- ❌ **Проблема с ID пользователей**
- user.id в AuthContext не совпадает с ID в чате
- Сравните ID в логах "Current user" и "participants"

### Если "User chats count > 0", но "Filtered chats count: 0":
- ❌ **Проблема с фильтрацией**
- Имена пользователей не совпадают
- Проблема с поиском

### Если все логи правильные, но чата нет в интерфейсе:
- ❌ **Проблема с отображением UI**
- Возможно, нужно очистить localStorage:
  ```javascript
  localStorage.clear();
  location.reload();
  ```

## Быстрая диагностика

В консоли браузера выполните:
```javascript
// Проверить текущего пользователя
console.log('Current user:', JSON.stringify(window.localStorage.getItem('tutoring_user')));

// Проверить чаты
console.log('Chats:', JSON.stringify(window.localStorage.getItem('tutoring_chats')));

// Очистить localStorage (если нужно)
// localStorage.clear(); location.reload();
```

## Что делать, если ничего не работает

1. **Очистите localStorage:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. **Перезапустите сервер:**
   ```bash
   # Остановите сервер (Ctrl+C)
   # Запустите заново
   cd backend && node server.cjs
   ```

3. **Проверьте сеть:**
   - Откройте вкладку Network в DevTools
   - Убедитесь, что WebSocket соединение установлено
   - Ищите ошибки подключения

## Ожидаемый результат

После отправки сообщения от ученика к репетитору:
1. ✅ Чат должен появиться у ученика немедленно
2. ✅ Чат должен появиться у репетитора в течение 1-2 секунд
3. ✅ Сообщение должно быть видно в обеих сторонах
4. ✅ Уведомление должно появиться у репетитора
