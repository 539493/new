// Скрипт для очистки всех тестовых данных
console.log('🧹 Очистка тестовых данных...');

// Очищаем localStorage
const keysToRemove = [
  'tutoring_users',
  'tutoring_timeSlots', 
  'tutoring_lessons',
  'tutoring_chats',
  'tutoring_posts',
  'tutoring_studentProfiles',
  'tutoring_teacherProfiles',
  'allUsers'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Удален: ${key}`);
  } else {
    console.log(`ℹ️ Не найден: ${key}`);
  }
});

// Очищаем все ключи, которые могут содержать тестовые данные
const allKeys = Object.keys(localStorage);
const testKeys = allKeys.filter(key => 
  key.includes('teacher_') || 
  key.includes('student_') || 
  key.includes('user_') ||
  key.includes('tutoring_')
);

testKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`🗑️ Удален тестовый ключ: ${key}`);
});

console.log('✅ Очистка завершена!');
console.log('📊 Статистика:');
console.log(`- Удалено ключей: ${testKeys.length}`);
console.log(`- Осталось ключей: ${Object.keys(localStorage).length}`);

// Показываем оставшиеся ключи
const remainingKeys = Object.keys(localStorage);
if (remainingKeys.length > 0) {
  console.log('🔍 Оставшиеся ключи:');
  remainingKeys.forEach(key => console.log(`  - ${key}`));
} else {
  console.log('✨ localStorage полностью очищен!');
}
