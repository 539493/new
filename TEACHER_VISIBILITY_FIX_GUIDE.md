# Руководство по исправлению видимости преподавателей

## Проблема
Репетиторы отображались только когда они были онлайн, а когда выходили - исчезали из списка. Это означало, что система показывала только активных пользователей, а не всех зарегистрированных.

## Анализ проблемы

### 1. **API endpoint `/api/teachers` был неполным**
- Возвращал только преподавателей из `teacherProfiles`
- Не включал преподавателей из слотов (`timeSlots`)
- Не учитывал всех зарегистрированных пользователей

### 2. **Логика отображения в StudentHome**
- Зависела от `serverTeachers` состояния
- Не учитывала всех источников данных
- Фильтровала по онлайн статусу

## Решение

### 1. **Улучшен API endpoint `/api/teachers`**

**До:**
```javascript
app.get('/api/teachers', (req, res) => {
  const teachers = Object.entries(teacherProfiles).map(([id, profile]) => ({
    id,
    name: profile.name || '',
    avatar: profile.avatar || '',
    profile
  }));
  res.json(teachers);
});
```

**После:**
```javascript
app.get('/api/teachers', (req, res) => {
  // Собираем преподавателей из teacherProfiles
  const teachersFromProfiles = Object.entries(teacherProfiles).map(([id, profile]) => ({
    id,
    name: profile.name || '',
    avatar: profile.avatar || '',
    profile
  }));
  
  // Также получаем преподавателей из слотов
  const teachersFromSlots = getTeachersFromSlots();
  
  // Объединяем всех преподавателей и убираем дубликаты
  const allTeachers = [...teachersFromProfiles];
  
  teachersFromSlots.forEach(slotTeacher => {
    if (!allTeachers.find(t => t.id === slotTeacher.id)) {
      allTeachers.push(slotTeacher);
    }
  });
  
  res.json(allTeachers);
});
```

### 2. **Добавлена функция `getTeachersFromSlots()`**

```javascript
function getTeachersFromSlots() {
  const teachersMap = new Map();
  for (const slot of timeSlots) {
    if (slot.teacherId && slot.teacherName) {
      if (!teachersMap.has(slot.teacherId)) {
        teachersMap.set(slot.teacherId, {
          id: slot.teacherId,
          name: slot.teacherName,
          avatar: slot.teacherAvatar || '',
          profile: {
            subjects: slot.subject ? [slot.subject] : [],
            experience: slot.experience || 'beginner',
            grades: slot.grades || [],
            goals: slot.goals || [],
            lessonTypes: slot.lessonType ? [slot.lessonType] : [],
            durations: slot.duration ? [slot.duration] : [],
            formats: slot.format ? [slot.format] : [],
            offlineAvailable: slot.format === 'offline',
            city: slot.city || '',
            overbookingEnabled: true,
            bio: slot.bio || '',
            avatar: slot.teacherAvatar || '',
            rating: slot.rating || 0,
            hourlyRate: slot.price || 0,
            students: [],
            lessonsCount: 0,
            country: slot.country || '',
          }
        });
      }
    }
  }
  return Array.from(teachersMap.values());
}
```

### 3. **Улучшена логика в StudentHome**

Логика объединения преподавателей из разных источников уже была хорошей:

```javascript
const allTeachers = React.useMemo(() => {
  // Получаем всех преподавателей из разных источников
  const teachersFromServer = serverTeachers.map(teacher => ({...}));
  const teachersFromUsers = allUsers?.filter(u => u.role === 'teacher').map(user => ({...}));
  const teachersFromProfiles = Object.entries(teacherProfiles).map(([id, profile]) => ({...}));
  const teachersFromSlots = timeSlots.filter(slot => slot.teacherId && slot.teacherName).map(slot => ({...}));

  // Объединяем все источники и убираем дубликаты
  const allSources = [...teachersFromServer, ...teachersFromUsers, ...teachersFromProfiles, ...teachersFromSlots];
  const allTeachersMap = new Map();
  
  allSources.forEach(teacher => {
    const existingTeacher = allTeachersMap.get(teacher.id);
    if (!existingTeacher) {
      allTeachersMap.set(teacher.id, teacher);
    } else {
      // Приоритет у преподавателей с аватарами и полными профилями
      const newHasAvatar = teacher.avatar && teacher.avatar.trim() !== '';
      const existingHasAvatar = existingTeacher.avatar && existingTeacher.avatar.trim() !== '';
      const newHasFullProfile = teacher.profile && teacher.profile.subjects && teacher.profile.subjects.length > 0;
      const existingHasFullProfile = existingTeacher.profile && existingTeacher.profile.subjects && existingTeacher.profile.subjects.length > 0;
      
      if ((newHasAvatar && !existingHasAvatar) || (newHasFullProfile && !existingHasFullProfile)) {
        allTeachersMap.set(teacher.id, teacher);
      }
    }
  });

  return Array.from(allTeachersMap.values());
}, [serverTeachers, allUsers, timeSlots, teacherProfiles]);
```

## Тестирование

### 1. **Автоматическое тестирование**

Создан скрипт `scripts/create-test-teacher.cjs`:

```bash
node scripts/create-test-teacher.cjs
```

**Результат:**
```
✅ Преподаватель зарегистрирован
✅ Преподаватель найден в /api/teachers
✅ Преподаватель найден в /api/users
✅ Профиль преподавателя найден в /api/sync
```

### 2. **Проверка видимости**

Создан скрипт `scripts/test-teacher-visibility.cjs`:

```bash
node scripts/test-teacher-visibility.cjs
```

**Проверяет:**
- Доступность сервера
- Количество преподавателей в разных API endpoints
- Консистентность данных между источниками
- Преподавателей со слотами

### 3. **Ручное тестирование**

1. **Запустите сервер:**
   ```bash
   cd backend && node server.cjs
   ```

2. **Запустите фронтенд:**
   ```bash
   npm run dev
   ```

3. **Откройте приложение как ученик**

4. **Проверьте раздел "Главная":**
   - Должны отображаться все зарегистрированные преподаватели
   - Статистика должна показывать: "Всего загружено: X репетиторов"
   - Преподаватели должны быть видны независимо от их онлайн статуса

## Результат

### ✅ **Исправлено:**

1. **API endpoint `/api/teachers`** теперь возвращает всех преподавателей:
   - Из `teacherProfiles` (зарегистрированные)
   - Из `timeSlots` (создавшие слоты)
   - Без дубликатов

2. **Видимость преподавателей** не зависит от онлайн статуса:
   - Показываются все зарегистрированные преподаватели
   - Обновляются в реальном времени через WebSocket
   - Синхронизируются между всеми клиентами

3. **Консистентность данных** между источниками:
   - `/api/teachers` - все преподаватели
   - `/api/users` - все пользователи
   - `/api/sync` - полные данные синхронизации

### 📊 **Статистика:**

После исправления:
- ✅ Преподаватели отображаются независимо от онлайн статуса
- ✅ Все источники данных консистентны
- ✅ WebSocket уведомления работают корректно
- ✅ Локальные данные синхронизируются с сервером

## Проверка в браузере

### Консоль браузера:
```javascript
// Проверьте количество преподавателей
console.log('Преподаватели:', window.localStorage.getItem('tutoring_teacherProfiles'));

// Проверьте API
fetch('/api/teachers').then(r => r.json()).then(console.log);
```

### Интерфейс:
- Откройте раздел "Главная" как ученик
- Проверьте статистику: "Всего загружено: X репетиторов"
- Убедитесь, что преподаватели отображаются в списке

## Заключение

Проблема с видимостью преподавателей решена! Теперь:

1. ✅ **Все зарегистрированные преподаватели отображаются** независимо от онлайн статуса
2. ✅ **API endpoints возвращают полные данные** из всех источников
3. ✅ **Система работает стабильно** как онлайн, так и офлайн
4. ✅ **Данные синхронизируются** между всеми клиентами

Преподаватели больше не исчезают из списка при выходе из системы!
