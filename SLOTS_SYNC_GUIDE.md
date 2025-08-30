# Руководство по синхронизации слотов между устройствами

## 🎯 Цель
Обеспечить автоматическую синхронизацию слотов (временных окон для уроков) между всеми устройствами в реальном времени.

## ✅ Что было реализовано

### 1. **WebSocket синхронизация слотов в реальном времени**
- Все операции со слотами синхронизируются мгновенно
- Создание, бронирование, отмена и удаление слотов
- Автоматическое обновление на всех подключенных устройствах

### 2. **Полная поддержка операций со слотами**
- ✅ Создание новых слотов (`createSlot`)
- ✅ Бронирование слотов (`bookSlot`)
- ✅ Отмена бронирования (`cancelSlot`)
- ✅ Удаление слотов (`deleteSlot`)
- ✅ Завершение уроков (`lessonCompleted`)

### 3. **Улучшенная обработка данных**
- Добавлены обработчики всех событий слотов в production-server.cjs
- Улучшена обработка событий в DataContext
- Автоматическое сохранение в localStorage для офлайн работы

### 4. **Тестовые данные**
- Добавлены тестовые слоты с реальными данными
- Различные предметы, форматы и времена
- Готовые для демонстрации

## 🔧 Технические изменения

### Backend (production-server.cjs)
```javascript
// Добавлены обработчики WebSocket событий для слотов
socket.on('createSlot', (newSlot) => {
  timeSlots.push(newSlot);
  saveServerData();
  io.emit('slotCreated', newSlot);
  io.emit('dataUpdated', { type: 'slotCreated', ... });
});

socket.on('bookSlot', (data) => {
  // Обновляем статус слота и добавляем урок
  io.emit('slotBooked', data);
  io.emit('dataUpdated', { type: 'slotBooked', ... });
});

socket.on('cancelSlot', (data) => {
  // Отменяем бронирование и удаляем урок
  io.emit('slotCancelled', data);
  io.emit('dataUpdated', { type: 'slotCancelled', ... });
});

socket.on('deleteSlot', (data) => {
  // Удаляем слот
  io.emit('slotDeleted', data);
  io.emit('dataUpdated', { type: 'slotDeleted', ... });
});
```

### Frontend (DataContext.tsx)
```typescript
// Улучшена обработка событий слотов
newSocket.on('slotCreated', (newSlot: TimeSlot) => {
  console.log('Slot created via WebSocket:', newSlot);
  setTimeSlots(prev => {
    const exists = prev.find(slot => slot.id === newSlot.id);
    if (!exists) {
      const updated = [...prev, newSlot];
      saveToStorage('tutoring_timeSlots', updated);
      return updated;
    } else {
      // Обновляем существующий слот
      const updated = prev.map(slot => slot.id === newSlot.id ? newSlot : slot);
      saveToStorage('tutoring_timeSlots', updated);
      return updated;
    }
  });
});

newSocket.on('allSlots', (allSlots: TimeSlot[]) => {
  console.log('Received all slots from server:', allSlots.length);
  setTimeSlots(allSlots);
  saveToStorage('tutoring_timeSlots', allSlots);
});
```

### Тестовые данные (create-test-data.cjs)
```javascript
const testTimeSlots = [
  {
    id: 'slot_1',
    teacherId: 'teacher_1',
    teacherName: 'Анна Петрова',
    date: '2025-01-15',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    subject: 'Математика',
    lessonType: 'regular',
    format: 'online',
    price: 1500,
    isBooked: false,
    // ... другие поля
  }
  // ... другие слоты
];
```

## 🧪 Как протестировать

### Тест 1: Синхронизация создания слотов
1. Откройте приложение на двух разных устройствах/браузерах
2. Войдите как репетитор на первом устройстве
3. Создайте новый слот времени
4. Проверьте, что слот появился на втором устройстве автоматически

### Тест 2: Синхронизация бронирования
1. Откройте приложение как ученик на втором устройстве
2. Забронируйте слот, созданный репетитором
3. Проверьте, что статус слота изменился на "забронирован" на всех устройствах

### Тест 3: Синхронизация отмены
1. Отмените бронирование слота
2. Проверьте, что слот снова стал доступным на всех устройствах

### Тест 4: Синхронизация удаления
1. Удалите слот как репетитор
2. Проверьте, что слот исчез со всех устройств

## 🚀 Запуск сервера

```bash
cd backend
node production-server.cjs
```

Сервер запустится на порту 10000 (или переменной окружения PORT).

## 📝 Логи для отладки

В консоли браузера вы увидите логи:
- `Slot created via WebSocket: {slotData}`
- `Slot booked via WebSocket: {data}`
- `Slot cancelled via WebSocket: {data}`
- `Slot deleted via WebSocket: {data}`
- `Received all slots from server: {count}`

В консоли сервера вы увидите:
- `Creating new slot: {slotData}`
- `Booking slot: {data}`
- `Cancelling slot: {data}`
- `Deleting slot: {slotId}`

## 🔄 Процесс синхронизации

1. **Создание слота** → `createSlot` в TeacherSlots/TeacherCalendar
2. **Отправка на сервер** → WebSocket событие `createSlot`
3. **Сохранение на сервере** → Добавление в `timeSlots` и сохранение в файл
4. **Рассылка всем клиентам** → `slotCreated` и `dataUpdated`
5. **Обновление на всех устройствах** → Обработчики в DataContext

## 🐛 Возможные проблемы и решения

### Проблема: Слоты не синхронизируются
**Решение**: Проверьте подключение к серверу и логи в консоли

### Проблема: Слоты не отображаются у учеников
**Решение**: Убедитесь, что ученик загрузил актуальные данные с сервера

### Проблема: Дублирование слотов
**Решение**: Слоты обрабатываются с проверкой на дубликаты по ID

### Проблема: Слоты не сохраняются
**Решение**: Проверьте права доступа к файлу server_data.json

## 📊 Мониторинг

Для мониторинга синхронизации используйте:
- Консоль браузера (F12)
- Логи сервера
- Network tab для проверки WebSocket соединений
- Скрипт тестирования: `node scripts/test-slots-sync.js`

## 🎯 Результат

Теперь все операции со слотами синхронизируются в реальном времени:
- ✅ Создание слотов репетитором
- ✅ Бронирование слотов учениками
- ✅ Отмена бронирования
- ✅ Удаление слотов
- ✅ Завершение уроков
- ✅ Отображение на всех устройствах мгновенно
