# Руководство по синхронизации аватаров между устройствами

## 🎯 Цель
Обеспечить автоматическую синхронизацию фотографий профиля репетитора между всеми устройствами в реальном времени.

## ✅ Что было реализовано

### 1. **Автоматическое сохранение при загрузке аватара**
- При выборе фотографии в профиле репетитора, она автоматически сохраняется и синхронизируется
- Больше не нужно нажимать кнопку "Сохранить" после загрузки фото

### 2. **WebSocket синхронизация в реальном времени**
- Добавлены обработчики событий `updateTeacherProfile` и `updateStudentProfile` в production-server.cjs
- Все подключенные устройства получают обновления профилей мгновенно

### 3. **Улучшенная обработка данных**
- Добавлено состояние `teacherProfiles` в DataContext
- Улучшена обработка событий `profileUpdated`, `teacherProfiles`, `studentProfiles`
- Автоматическое сохранение в localStorage для офлайн работы

### 4. **Синхронизация между вкладками**
- Обновления профилей синхронизируются между всеми открытыми вкладками браузера
- Используется localStorage и кастомные события

## 🔧 Технические изменения

### Backend (production-server.cjs)
```javascript
// Добавлены обработчики WebSocket событий
socket.on('updateTeacherProfile', (data) => {
  teacherProfiles[data.teacherId] = data.profile;
  saveServerData();
  io.emit('profileUpdated', { type: 'teacher', userId: data.teacherId, profile: data.profile });
  io.emit('teacherProfileUpdated', { teacherId: data.teacherId, profile: data.profile });
  io.emit('userRegistered', userData);
  io.emit('dataUpdated', { type: 'teacherProfileUpdated', ... });
});
```

### Frontend (ProfileForm.tsx)
```typescript
const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const avatarUrl = ev.target?.result as string;
      
      if (user.role === 'teacher') {
        const updatedProfile = { ...teacherProfile, avatar: avatarUrl };
        setTeacherProfile(updatedProfile);
        // Автоматически сохраняем и синхронизируем
        updateProfile(updatedProfile);
        updateTeacherProfile(user.id, { ...updatedProfile, name: user.name, email: user.email });
      }
    };
    reader.readAsDataURL(file);
  }
};
```

### DataContext.tsx
```typescript
// Добавлено состояние teacherProfiles
const [teacherProfiles, setTeacherProfiles] = useState<Record<string, TeacherProfile>>(() => {
  const saved = loadFromStorage('tutoring_teacherProfiles', {});
  return saved;
});

// Улучшена обработка событий
newSocket.on('profileUpdated', (data) => {
  // Обновляем профили в соответствующих состояниях
  if (role === 'teacher') {
    setTeacherProfiles(prev => ({ ...prev, [userId]: profile as TeacherProfile }));
  }
});
```

## 🧪 Как протестировать

### Тест 1: Синхронизация между устройствами
1. Откройте приложение на двух разных устройствах/браузерах
2. Войдите как репетитор на первом устройстве
3. Загрузите новую фотографию в профиль
4. Проверьте, что фотография появилась на втором устройстве автоматически

### Тест 2: Синхронизация между вкладками
1. Откройте приложение в двух вкладках браузера
2. Войдите как репетитор в обеих вкладках
3. Загрузите новую фотографию в одной вкладке
4. Проверьте, что фотография появилась во второй вкладке

### Тест 3: Отображение у ученика
1. Откройте приложение как ученик
2. Найдите репетитора, который загрузил новую фотографию
3. Проверьте, что новая фотография отображается в профиле репетитора

## 🚀 Запуск сервера

```bash
cd backend
node production-server.cjs
```

Сервер запустится на порту 10000 (или переменной окружения PORT).

## 📝 Логи для отладки

В консоли браузера вы увидите логи:
- `Profile updated via WebSocket: { userId, role, profile }`
- `Received dataUpdated event: teacherProfileUpdated`

В консоли сервера вы увидите:
- `Profile updated for teacher {userId}: {profileData}`

## 🔄 Процесс синхронизации

1. **Загрузка фото** → `handleAvatarChange` в ProfileForm
2. **Локальное обновление** → `updateProfile` в AuthContext
3. **Отправка на сервер** → `updateTeacherProfile` в DataContext
4. **Сохранение на сервере** → WebSocket событие `updateTeacherProfile`
5. **Рассылка всем клиентам** → `profileUpdated`, `teacherProfileUpdated`, `dataUpdated`
6. **Обновление на всех устройствах** → Обработчики в DataContext

## 🐛 Возможные проблемы и решения

### Проблема: Фото не синхронизируется
**Решение**: Проверьте подключение к серверу и логи в консоли

### Проблема: Фото не отображается у ученика
**Решение**: Убедитесь, что ученик загрузил актуальные данные с сервера

### Проблема: Дублирование событий
**Решение**: События обрабатываются с проверкой на дубликаты

## 📊 Мониторинг

Для мониторинга синхронизации используйте:
- Консоль браузера (F12)
- Логи сервера
- Network tab для проверки WebSocket соединений
