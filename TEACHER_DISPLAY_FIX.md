# Исправление отображения преподавателей в разделе "Главная"

## Проблема
После регистрации преподавателя он не отображался в разделе "Главная" для учеников.

## Причина
Проблема была в том, что при регистрации преподавателя в `AuthContext` данные сохранялись в `localStorage`, но компонент `StudentHome` не обновлялся автоматически, так как:

1. Событие `storage` срабатывает только между разными вкладками браузера
2. В рамках одной вкладки компонент `DataContext` не получал уведомления об изменении пользователей
3. Список преподавателей в `StudentHome` формировался из нескольких источников, которые не синхронизировались

## Решение

### 1. Обновление AuthContext
Добавлена генерация кастомных событий в функции `saveUsersToStorage`:

```typescript
const saveUsersToStorage = (users: User[]) => {
  try {
    localStorage.setItem('tutoring_users', JSON.stringify(users));
    
    // Генерируем событие storage для обновления DataContext
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'tutoring_users',
      newValue: JSON.stringify(users),
      oldValue: localStorage.getItem('tutoring_users'),
      storageArea: localStorage
    }));
    
    // Также генерируем кастомное событие для обновления в рамках одной вкладки
    window.dispatchEvent(new CustomEvent('customStorage', {
      detail: {
        key: 'tutoring_users',
        newValue: JSON.stringify(users),
        oldValue: localStorage.getItem('tutoring_users')
      }
    }));
  } catch (e) {
    console.error('Error saving users to localStorage:', e);
  }
};
```

### 2. Обновление DataContext
Добавлен слушатель кастомных событий для обновления `allUsers`:

```typescript
// Слушатель изменений localStorage для синхронизации между вкладками
useEffect(() => {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'tutoring_users') {
      try {
        const newUsers = JSON.parse(e.newValue || '[]');
        console.log('Storage event: updating allUsers with', newUsers.length, 'users');
        setAllUsers(newUsers);
      } catch (error) {
        console.error('Error parsing users from storage event:', error);
        setAllUsers([]);
      }
    }
  };
  
  // Также слушаем кастомные события для обновления в рамках одной вкладки
  const handleCustomStorage = (e: CustomEvent) => {
    if (e.detail?.key === 'tutoring_users') {
      try {
        const newUsers = JSON.parse(e.detail.newValue || '[]');
        console.log('Custom storage event: updating allUsers with', newUsers.length, 'users');
        setAllUsers(newUsers);
      } catch (error) {
        console.error('Error parsing users from custom storage event:', error);
        setAllUsers([]);
      }
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener('customStorage', handleCustomStorage as EventListener);
  
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('customStorage', handleCustomStorage as EventListener);
  };
}, []);
```

### 3. Обновление StudentHome
Добавлен слушатель событий для обновления списка преподавателей:

```typescript
// Обновление списка преподавателей при изменении пользователей
React.useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'tutoring_users') {
      console.log('Users changed in localStorage, updating teachers list');
      window.location.reload();
    }
  };

  const handleCustomStorageChange = (e: CustomEvent) => {
    if (e.detail?.key === 'tutoring_users') {
      console.log('Custom storage event: users changed, updating teachers list');
      // Используем функцию refreshUsers из контекста для обновления списка пользователей
      refreshUsers();
      // Также обновляем серверных преподавателей
      setServerTeachers([]);
      fetch(`${SERVER_URL}/api/teachers`)
        .then(res => res.json())
        .then(data => setServerTeachers(Array.isArray(data) ? data : []))
        .catch(() => setServerTeachers([]));
    }
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('customStorage', handleCustomStorageChange as EventListener);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('customStorage', handleCustomStorageChange as EventListener);
  };
}, []);
```

### 4. Добавлена функция refreshUsers
В `DataContext` добавлена функция для принудительного обновления списка пользователей:

```typescript
const refreshUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
    console.log('Refreshing users list:', users.length, 'users');
    setAllUsers(users);
  } catch (error) {
    console.error('Error refreshing users:', error);
    setAllUsers([]);
  }
};
```

## Результат
Теперь при регистрации преподавателя:
1. Данные сохраняются в `localStorage`
2. Генерируются события для обновления `DataContext`
3. Компонент `StudentHome` автоматически обновляется
4. Преподаватель появляется в списке на главной странице

## Тестирование
Для тестирования можно использовать файл `test-teacher-registration.html`, который позволяет:
- Проверить содержимое `localStorage`
- Симулировать регистрацию преподавателя
- Проверить API `/api/teachers`
- Тестировать события `storage`

## Файлы, которые были изменены:
- `src/contexts/AuthContext.tsx` - добавлена генерация кастомных событий
- `src/contexts/DataContext.tsx` - добавлены слушатели событий и функция refreshUsers
- `src/components/Student/StudentHome.tsx` - добавлены слушатели событий для обновления списка преподавателей
