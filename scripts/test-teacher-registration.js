#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки регистрации репетиторов
 * Проверяет, что репетиторы регистрируются на сервере и видны ученикам
 */

const fetch = require('node-fetch');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

async function testTeacherRegistration() {
  console.log('🧪 Тестирование регистрации репетиторов...');
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

    // 2. Получаем текущий список преподавателей
    console.log('\n2️⃣ Получение текущего списка преподавателей...');
    const teachersResponse = await fetch(`${SERVER_URL}/api/teachers`);
    if (!teachersResponse.ok) {
      throw new Error(`Ошибка получения преподавателей: ${teachersResponse.status}`);
    }
    const currentTeachers = await teachersResponse.json();
    console.log(`📊 Текущее количество преподавателей: ${currentTeachers.length}`);

    // 3. Регистрируем нового репетитора
    console.log('\n3️⃣ Регистрация нового репетитора...');
    const testTeacher = {
      email: `test-teacher-${Date.now()}@example.com`,
      password: 'test123',
      name: 'Тестовый Репетитор',
      nickname: `test-teacher-${Date.now()}`,
      role: 'teacher',
      phone: '+7 (999) 123-45-67'
    };

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

    const newTeacher = await registerResponse.json();
    console.log('✅ Репетитор зарегистрирован:', {
      id: newTeacher.id,
      name: newTeacher.name,
      email: newTeacher.email,
      role: newTeacher.role
    });

    // 4. Проверяем, что репетитор появился в списке
    console.log('\n4️⃣ Проверка появления репетитора в списке...');
    const updatedTeachersResponse = await fetch(`${SERVER_URL}/api/teachers`);
    if (!updatedTeachersResponse.ok) {
      throw new Error(`Ошибка получения обновленного списка: ${updatedTeachersResponse.status}`);
    }
    const updatedTeachers = await updatedTeachersResponse.json();
    console.log(`📊 Обновленное количество преподавателей: ${updatedTeachers.length}`);

    const foundTeacher = updatedTeachers.find(t => t.id === newTeacher.id);
    if (foundTeacher) {
      console.log('✅ Репетитор найден в списке преподавателей');
    } else {
      console.log('❌ Репетитор НЕ найден в списке преподавателей');
    }

    // 5. Проверяем синхронизацию данных
    console.log('\n5️⃣ Проверка синхронизации данных...');
    const syncResponse = await fetch(`${SERVER_URL}/api/sync`);
    if (!syncResponse.ok) {
      throw new Error(`Ошибка синхронизации: ${syncResponse.status}`);
    }
    const syncData = await syncResponse.json();
    
    const teacherInSync = syncData.teacherProfiles && syncData.teacherProfiles[newTeacher.id];
    if (teacherInSync) {
      console.log('✅ Репетитор найден в данных синхронизации');
    } else {
      console.log('❌ Репетитор НЕ найден в данных синхронизации');
    }

    // 6. Проверяем список всех пользователей
    console.log('\n6️⃣ Проверка списка всех пользователей...');
    const usersResponse = await fetch(`${SERVER_URL}/api/users`);
    if (!usersResponse.ok) {
      throw new Error(`Ошибка получения пользователей: ${usersResponse.status}`);
    }
    const allUsers = await usersResponse.json();
    
    const teacherUsers = allUsers.filter(u => u.role === 'teacher');
    const foundUser = allUsers.find(u => u.id === newTeacher.id);
    
    console.log(`📊 Всего пользователей: ${allUsers.length}`);
    console.log(`👨‍🏫 Преподавателей: ${teacherUsers.length}`);
    
    if (foundUser) {
      console.log('✅ Репетитор найден в списке всех пользователей');
    } else {
      console.log('❌ Репетитор НЕ найден в списке всех пользователей');
    }

    console.log('\n🎉 Тест завершен успешно!');
    console.log('\n📋 Результаты:');
    console.log(`   • Репетитор зарегистрирован: ✅`);
    console.log(`   • Появился в /api/teachers: ${foundTeacher ? '✅' : '❌'}`);
    console.log(`   • Найден в данных синхронизации: ${teacherInSync ? '✅' : '❌'}`);
    console.log(`   • Найден в списке пользователей: ${foundUser ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    process.exit(1);
  }
}

// Запускаем тест
testTeacherRegistration();
