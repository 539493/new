##  Исправление синхронизации профилей студентов

### Проблема:
Данные профиля ученика не отображаются у репетитора, потому что функция `updateStudentProfile` в DataContext не сохраняет данные в localStorage.

### Решение:
Нужно исправить функцию `updateStudentProfile` в файле `src/contexts/DataContext.tsx` (строка 1899):

```typescript
const updateStudentProfile = (studentId: string, profile: StudentProfile) => {
  console.log(' Updating student profile:', studentId, profile);
  
  // Обновляем состояние и сохраняем в localStorage
  setStudentProfiles(prev => {
    const updated = { ...prev, [studentId]: profile };
    saveToStorage('tutoring_studentProfiles', updated);
    console.log(' Student profile saved to localStorage:', updated);
    return updated;
  });
  
  // Отправляем на сервер через WebSocket
  if (socketRef.current) {
    socketRef.current.emit('updateStudentProfile', { studentId, profile });
    console.log(' Student profile sent to server via WebSocket');
  } else {
    console.warn(' WebSocket not connected, profile not sent to server');
  }
};
```

### Что изменилось:
1. Добавлено сохранение в localStorage через `saveToStorage()`
2. Добавлено логирование для отладки
3. Улучшена обработка WebSocket соединения

Это исправит проблему с синхронизацией данных между учеником и репетитором.
