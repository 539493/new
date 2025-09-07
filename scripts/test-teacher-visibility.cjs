#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки видимости преподавателей
 * Проверяет, что все зарегистрированные преподаватели отображаются независимо от их онлайн статуса
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

async function testTeacherVisibility() {
  console.log('🧪 Тестирование видимости преподавателей...');
  console.log(`🌐 Сервер: ${SERVER_URL}`);

  try {
    // 1. Проверяем доступность сервера
    console.log('\n1️⃣ Проверка доступности сервера...');
    const healthResponse = await fetch(`${SERVER_URL}/api/health`);
    if (!healthResponse.ok) {
      throw new Error(`Сервер недоступен: ${healthResponse.status}`);
    }
    const healthData = await healthResponse.json();
    console.log('✅ Сервер доступен:', healthData.status);

    // 2. Получаем всех преподавателей через /api/teachers
    console.log('\n2️⃣ Получение преподавателей через /api/teachers...');
    const teachersResponse = await fetch(`${SERVER_URL}/api/teachers`);
    if (!teachersResponse.ok) {
      throw new Error(`Ошибка получения преподавателей: ${teachersResponse.status}`);
    }
    const teachers = await teachersResponse.json();
    console.log(`📊 Преподаватели через /api/teachers: ${teachers.length}`);
    
    if (teachers.length > 0) {
      console.log('👨‍🏫 Список преподавателей:');
      teachers.forEach((teacher, index) => {
        console.log(`   ${index + 1}. ${teacher.name} (ID: ${teacher.id})`);
        console.log(`      - Аватар: ${teacher.avatar ? '✅' : '❌'}`);
        console.log(`      - Предметы: ${teacher.profile?.subjects?.join(', ') || 'Не указаны'}`);
        console.log(`      - Рейтинг: ${teacher.profile?.rating || 'Не указан'}`);
      });
    } else {
      console.log('⚠️ Преподаватели не найдены через /api/teachers');
    }

    // 3. Получаем всех пользователей через /api/users
    console.log('\n3️⃣ Получение пользователей через /api/users...');
    const usersResponse = await fetch(`${SERVER_URL}/api/users`);
    if (!usersResponse.ok) {
      throw new Error(`Ошибка получения пользователей: ${usersResponse.status}`);
    }
    const users = await usersResponse.json();
    const teacherUsers = users.filter(u => u.role === 'teacher');
    console.log(`📊 Всего пользователей: ${users.length}`);
    console.log(`👨‍🏫 Преподавателей в /api/users: ${teacherUsers.length}`);
    
    if (teacherUsers.length > 0) {
      console.log('👨‍🏫 Преподаватели из /api/users:');
      teacherUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (ID: ${user.id})`);
        console.log(`      - Email: ${user.email}`);
        console.log(`      - Телефон: ${user.phone}`);
        console.log(`      - Предметы: ${user.profile?.subjects?.join(', ') || 'Не указаны'}`);
      });
    }

    // 4. Получаем данные синхронизации
    console.log('\n4️⃣ Получение данных синхронизации...');
    const syncResponse = await fetch(`${SERVER_URL}/api/sync`);
    if (!syncResponse.ok) {
      throw new Error(`Ошибка синхронизации: ${syncResponse.status}`);
    }
    const syncData = await syncResponse.json();
    
    const teacherProfilesCount = Object.keys(syncData.teacherProfiles || {}).length;
    const studentProfilesCount = Object.keys(syncData.studentProfiles || {}).length;
    
    console.log(`📊 Данные синхронизации:`);
    console.log(`   👨‍🏫 Профили преподавателей: ${teacherProfilesCount}`);
    console.log(`   👨‍🎓 Профили студентов: ${studentProfilesCount}`);
    console.log(`   📅 Слотов: ${syncData.timeSlots?.length || 0}`);
    console.log(`   📚 Уроков: ${syncData.lessons?.length || 0}`);

    // 5. Проверяем консистентность данных
    console.log('\n5️⃣ Проверка консистентности данных...');
    
    const teachersFromAPI = teachers.map(t => t.id);
    const teachersFromUsers = teacherUsers.map(u => u.id);
    const teachersFromSync = Object.keys(syncData.teacherProfiles || {});
    
    console.log(`📊 Сравнение источников:`);
    console.log(`   /api/teachers: ${teachersFromAPI.length} преподавателей`);
    console.log(`   /api/users: ${teachersFromUsers.length} преподавателей`);
    console.log(`   /api/sync: ${teachersFromSync.length} преподавателей`);
    
    // Проверяем, есть ли преподаватели, которые есть в одном источнике, но нет в другом
    const onlyInAPI = teachersFromAPI.filter(id => !teachersFromUsers.includes(id));
    const onlyInUsers = teachersFromUsers.filter(id => !teachersFromAPI.includes(id));
    const onlyInSync = teachersFromSync.filter(id => !teachersFromAPI.includes(id) && !teachersFromUsers.includes(id));
    
    if (onlyInAPI.length > 0) {
      console.log(`⚠️ Преподаватели только в /api/teachers: ${onlyInAPI.join(', ')}`);
    }
    if (onlyInUsers.length > 0) {
      console.log(`⚠️ Преподаватели только в /api/users: ${onlyInUsers.join(', ')}`);
    }
    if (onlyInSync.length > 0) {
      console.log(`⚠️ Преподаватели только в /api/sync: ${onlyInSync.join(', ')}`);
    }
    
    if (onlyInAPI.length === 0 && onlyInUsers.length === 0 && onlyInSync.length === 0) {
      console.log('✅ Все источники данных консистентны');
    }

    // 6. Проверяем, есть ли преподаватели со слотами
    console.log('\n6️⃣ Проверка преподавателей со слотами...');
    const teachersWithSlots = new Set();
    if (syncData.timeSlots) {
      syncData.timeSlots.forEach(slot => {
        if (slot.teacherId) {
          teachersWithSlots.add(slot.teacherId);
        }
      });
    }
    console.log(`📅 Преподавателей со слотами: ${teachersWithSlots.size}`);
    
    if (teachersWithSlots.size > 0) {
      console.log('👨‍🏫 Преподаватели со слотами:');
      Array.from(teachersWithSlots).forEach(teacherId => {
        const teacher = teachers.find(t => t.id === teacherId) || teacherUsers.find(u => u.id === teacherId);
        const teacherName = teacher ? teacher.name : `ID: ${teacherId}`;
        console.log(`   - ${teacherName} (${teacherId})`);
      });
    }

    // 7. Итоговый отчет
    console.log('\n🎉 Тест завершен!');
    console.log('\n📋 Результаты:');
    console.log(`   • Преподаватели в /api/teachers: ${teachers.length}`);
    console.log(`   • Преподаватели в /api/users: ${teacherUsers.length}`);
    console.log(`   • Профили преподавателей в /api/sync: ${teacherProfilesCount}`);
    console.log(`   • Преподавателей со слотами: ${teachersWithSlots.size}`);
    console.log(`   • Консистентность данных: ${onlyInAPI.length === 0 && onlyInUsers.length === 0 && onlyInSync.length === 0 ? '✅' : '⚠️'}`);
    
    if (teachers.length === 0 && teacherUsers.length === 0 && teacherProfilesCount === 0) {
      console.log('\n❌ ПРОБЛЕМА: Преподаватели не найдены ни в одном источнике!');
      console.log('   Возможные причины:');
      console.log('   - Преподаватели не зарегистрированы');
      console.log('   - Проблемы с сохранением данных на сервере');
      console.log('   - Ошибки в API endpoints');
    } else if (teachers.length > 0) {
      console.log('\n✅ Преподаватели найдены и должны отображаться в интерфейсе');
    }

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    process.exit(1);
  }
}

// Запускаем тест
testTeacherVisibility();
