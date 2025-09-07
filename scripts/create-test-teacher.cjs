#!/usr/bin/env node

/**
 * Скрипт для создания тестового преподавателя
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

async function createTestTeacher() {
  console.log('👨‍🏫 Создание тестового преподавателя...');
  console.log(`🌐 Сервер: ${SERVER_URL}`);

  const timestamp = Date.now();
  const testTeacher = {
    email: `test.teacher.${timestamp}@example.com`,
    password: 'password123',
    name: `Тест Преподаватель ${timestamp}`,
    nickname: `test_teacher_${timestamp}`,
    role: 'teacher',
    phone: `+7900${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`
  };

  console.log('📝 Данные тестового преподавателя:');
  console.log(`   Имя: ${testTeacher.name}`);
  console.log(`   Email: ${testTeacher.email}`);
  console.log(`   Роль: ${testTeacher.role}`);
  console.log(`   Телефон: ${testTeacher.phone}`);

  try {
    // Регистрируем преподавателя
    console.log('\n1️⃣ Регистрация преподавателя...');
    const registerResponse = await fetch(`${SERVER_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTeacher)
    });

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json();
      throw new Error(`Ошибка регистрации: ${errorData.error}`);
    }

    const registerResult = await registerResponse.json();
    console.log('✅ Преподаватель зарегистрирован:', registerResult);

    // Проверяем, что преподаватель появился в /api/teachers
    console.log('\n2️⃣ Проверка появления в /api/teachers...');
    const teachersResponse = await fetch(`${SERVER_URL}/api/teachers`);
    if (!teachersResponse.ok) {
      throw new Error(`Ошибка получения преподавателей: ${teachersResponse.status}`);
    }
    const teachers = await teachersResponse.json();
    console.log(`📊 Преподавателей в /api/teachers: ${teachers.length}`);
    
    const foundTeacher = teachers.find(t => t.id === registerResult.id);
    if (foundTeacher) {
      console.log('✅ Преподаватель найден в /api/teachers');
    } else {
      console.log('❌ Преподаватель НЕ найден в /api/teachers');
    }

    // Проверяем, что преподаватель появился в /api/users
    console.log('\n3️⃣ Проверка появления в /api/users...');
    const usersResponse = await fetch(`${SERVER_URL}/api/users`);
    if (!usersResponse.ok) {
      throw new Error(`Ошибка получения пользователей: ${usersResponse.status}`);
    }
    const users = await usersResponse.json();
    const teacherUsers = users.filter(u => u.role === 'teacher');
    console.log(`📊 Преподавателей в /api/users: ${teacherUsers.length}`);
    
    const foundUser = teacherUsers.find(u => u.id === registerResult.id);
    if (foundUser) {
      console.log('✅ Преподаватель найден в /api/users');
    } else {
      console.log('❌ Преподаватель НЕ найден в /api/users');
    }

    // Проверяем данные синхронизации
    console.log('\n4️⃣ Проверка данных синхронизации...');
    const syncResponse = await fetch(`${SERVER_URL}/api/sync`);
    if (!syncResponse.ok) {
      throw new Error(`Ошибка синхронизации: ${syncResponse.status}`);
    }
    const syncData = await syncResponse.json();
    
    const teacherProfilesCount = Object.keys(syncData.teacherProfiles || {}).length;
    console.log(`📊 Профилей преподавателей в /api/sync: ${teacherProfilesCount}`);
    
    const foundProfile = syncData.teacherProfiles && syncData.teacherProfiles[registerResult.id];
    if (foundProfile) {
      console.log('✅ Профиль преподавателя найден в /api/sync');
    } else {
      console.log('❌ Профиль преподавателя НЕ найден в /api/sync');
    }

    console.log('\n🎉 Тест завершен!');
    console.log('\n📋 Результаты:');
    console.log(`   • Регистрация: ✅`);
    console.log(`   • В /api/teachers: ${foundTeacher ? '✅' : '❌'}`);
    console.log(`   • В /api/users: ${foundUser ? '✅' : '❌'}`);
    console.log(`   • В /api/sync: ${foundProfile ? '✅' : '❌'}`);

    if (foundTeacher && foundUser && foundProfile) {
      console.log('\n✅ Преподаватель успешно создан и должен отображаться в интерфейсе!');
    } else {
      console.log('\n⚠️ Есть проблемы с сохранением данных преподавателя');
    }

  } catch (error) {
    console.error('❌ Ошибка создания преподавателя:', error.message);
    process.exit(1);
  }
}

// Запускаем создание преподавателя
createTestTeacher();
