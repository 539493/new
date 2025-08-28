# Синхронизация пользователей между устройствами

## Проблема
Зарегистрированные преподаватели отображались только на том устройстве, где происходила регистрация, и не синхронизировались между разными устройствами.

## Причина
Регистрация происходила только локально в `localStorage` браузера, без отправки данных на сервер. Поэтому данные не были доступны на других устройствах.

## Решение

### 1. Серверная часть (backend/server.cjs)

#### Добавлены новые API endpoints:

**GET /api/users** - получение всех пользователей
```javascript
app.get('/api/users', (req, res) => {
  // Возвращает всех пользователей из teacherProfiles и studentProfiles
});
```

**POST /api/register** - регистрация нового пользователя
```javascript
app.post('/api/register', (req, res) => {
  // Регистрирует пользователя на сервере
  // Сохраняет в teacherProfiles или studentProfiles
  // Отправляет событие userRegistered всем клиентам
});
```

**GET /api/users/:id** - получение пользователя по ID
```javascript
app.get('/api/users/:id', (req, res) => {
  // Возвращает пользователя по ID
});
```

#### Добавлен middleware для парсинга JSON:
```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

### 2. Клиентская часть

#### AuthContext (src/contexts/AuthContext.tsx)
Обновлена функция `register`:
- Сначала пытается зарегистрировать на сервере
- При успехе сохраняет данные локально
- При ошибке использует локальную регистрацию как fallback

```typescript
const register = async (email, password, name, nickname, role, phone) => {
  try {
    // Регистрация на сервере
    const response = await fetch(`${SERVER_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, nickname, role, phone })
    });
    
    if (response.ok) {
      const serverUser = await response.json();
      // Сохраняем локально
      saveUsersToStorage([...users, serverUser]);
      return true;
    }
  } catch (error) {
    // Fallback к локальной регистрации
    console.log('Server unavailable, using local registration');
  }
};
```

#### DataContext (src/contexts/DataContext.tsx)
Добавлены функции:
- `loadUsersFromServer()` - загрузка пользователей с сервера
- Обработчик события `userRegistered` для обновления списка при регистрации

```typescript
// Загрузка пользователей с сервера
const loadUsersFromServer = async () => {
  const response = await fetch(`${SERVER_URL}/api/users`);
  const serverUsers = await response.json();
  // Объединяем с локальными данными
  setAllUsers([...localUsers, ...serverUsers]);
};

// Обработчик регистрации нового пользователя
newSocket.on('userRegistered', (newUser) => {
  // Добавляем нового пользователя в список
  setAllUsers([...allUsers, newUser]);
});
```

#### StudentHome (src/components/Student/StudentHome.tsx)
Обновлена загрузка преподавателей:
- Загружает данные через API `/api/teachers`
- Загружает всех пользователей через API `/api/users`
- Обновляет список при подключении к серверу

### 3. Синхронизация в реальном времени

#### WebSocket события:
- `userRegistered` - отправляется при регистрации нового пользователя
- `profileUpdated` - отправляется при обновлении профиля

#### Автоматическая синхронизация:
1. При подключении к WebSocket загружаются все пользователи с сервера
2. При регистрации нового пользователя данные отправляются на сервер
3. Сервер уведомляет всех подключенных клиентов через WebSocket
4. Клиенты обновляют свои локальные списки пользователей

## Результат

Теперь при регистрации преподавателя:
1. ✅ Данные сохраняются на сервере
2. ✅ Все подключенные устройства получают уведомление
3. ✅ Преподаватель появляется в списке на всех устройствах
4. ✅ Синхронизация работает в реальном времени

## Тестирование

Для тестирования:
1. Откройте приложение на двух разных устройствах
2. Зарегистрируйте преподавателя на одном устройстве
3. Проверьте, что преподаватель появился в списке на втором устройстве

## Файлы, которые были изменены:
- `backend/server.cjs` - добавлены API endpoints и middleware
- `src/contexts/AuthContext.tsx` - обновлена функция регистрации
- `src/contexts/DataContext.tsx` - добавлена синхронизация с сервером
- `src/components/Student/StudentHome.tsx` - обновлена загрузка данных

## Коммит
Изменения загружены на GitHub в коммите `8fbae007` 