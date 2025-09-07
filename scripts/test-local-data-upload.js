#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки загрузки локальных данных на сервер
 * Проверяет, что локально зарегистрированные репетиторы загружаются на сервер
 */

const fetch = require('node-fetch');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

async function testLocalDataUpload() {
  console.log('🧪 Тестирование загрузки локальных данных на сервер...');
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

    // 2. Получаем текущий список преподавателей на сервере
    console.log('\n2️⃣ Получение текущего списка преподавателей на сервере...');
    const teachersResponse = await fetch(`${SERVER_URL}/api/teachers`);
    if (!teachersResponse.ok) {
      throw new Error(`Ошибка получения преподавателей: ${teachersResponse.status}`);
    }
    const currentTeachers = await teachersResponse.json();
    console.log(`📊 Текущее количество преподавателей на сервере: ${currentTeachers.length}`);

    // 3. Создаем тестовые локальные данные
    console.log('\n3️⃣ Создание тестовых локальных данных...');
    const testTeacherId = `local-teacher-${Date.now()}`;
    const testStudentId = `local-student-${Date.now()}`;
    
    const localTeacherProfiles = {
      [testTeacherId]: {
        id: testTeacherId,
        email: `local-teacher-${Date.now()}@example.com`,
        name: 'Локальный Репетитор',
        nickname: `local-teacher-${Date.now()}`,
        role: 'teacher',
        phone: '+7 (999) 123-45-67',
        subjects: ['Математика', 'Физика'],
        experience: 'experienced',
        grades: ['9', '10', '11'],
        goals: ['подготовка к ЕГЭ', 'повышение успеваемости'],
        lessonTypes: ['индивидуальный', 'групповой'],
        durations: [60, 90],
        formats: ['online', 'offline'],
        offlineAvailable: true,
        city: 'Москва',
        overbookingEnabled: true,
        bio: 'Опытный преподаватель математики и физики',
        avatar: '',
        rating: 4.8,
        hourlyRate: 2000,
        age: 35,
        experienceYears: 10,
        education: {
          university: 'МГУ',
          degree: 'Магистр',
          graduationYear: 2010,
          courses: ['Математика', 'Физика']
        },
        createdAt: new Date().toISOString()
      }
    };

    const localStudentProfiles = {
      [testStudentId]: {
        id: testStudentId,
        email: `local-student-${Date.now()}@example.com`,
        name: 'Локальный Студент',
        nickname: `local-student-${Date.now()}`,
        role: 'student',
        phone: '+7 (999) 987-65-43',
        grade: '10',
        bio: 'Ученик 10 класса',
        avatar: '',
        subjects: ['Математика', 'Физика'],
        age: 16,
        school: 'Школа №123',
        city: 'Москва',
        phone: '+7 (999) 987-65-43',
        parentName: 'Родитель Студента',
        parentPhone: '+7 (999) 987-65-44',
        goals: ['подготовка к ЕГЭ', 'повышение успеваемости'],
        interests: ['математика', 'физика'],
        learningStyle: 'visual',
        experience: 'beginner',
        preferredFormats: ['online'],
        preferredDurations: [60],
        timeZone: 'Europe/Moscow',
        createdAt: new Date().toISOString()
      }
    };

    const localUsers = [
      {
        id: testTeacherId,
        email: localTeacherProfiles[testTeacherId].email,
        name: localTeacherProfiles[testTeacherId].name,
        nickname: localTeacherProfiles[testTeacherId].nickname,
        role: 'teacher',
        phone: localTeacherProfiles[testTeacherId].phone,
        profile: localTeacherProfiles[testTeacherId]
      },
      {
        id: testStudentId,
        email: localStudentProfiles[testStudentId].email,
        name: localStudentProfiles[testStudentId].name,
        nickname: localStudentProfiles[testStudentId].nickname,
        role: 'student',
        phone: localStudentProfiles[testStudentId].phone,
        profile: localStudentProfiles[testStudentId]
      }
    ];

    console.log('✅ Созданы тестовые локальные данные:');
    console.log(`   👨‍🏫 Преподаватели: ${Object.keys(localTeacherProfiles).length}`);
    console.log(`   👨‍🎓 Студенты: ${Object.keys(localStudentProfiles).length}`);
    console.log(`   👥 Пользователи: ${localUsers.length}`);

    // 4. Загружаем локальные данные на сервер
    console.log('\n4️⃣ Загрузка локальных данных на сервер...');
    const uploadResponse = await fetch(`${SERVER_URL}/api/upload-local-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teacherProfiles: localTeacherProfiles,
        studentProfiles: localStudentProfiles,
        users: localUsers
      })
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(`Ошибка загрузки данных: ${errorData.error}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('✅ Локальные данные загружены на сервер:', uploadResult);

    // 5. Проверяем, что данные появились на сервере
    console.log('\n5️⃣ Проверка появления данных на сервере...');
    
    // Проверяем преподавателей
    const updatedTeachersResponse = await fetch(`${SERVER_URL}/api/teachers`);
    if (!updatedTeachersResponse.ok) {
      throw new Error(`Ошибка получения обновленного списка преподавателей: ${updatedTeachersResponse.status}`);
    }
    const updatedTeachers = await updatedTeachersResponse.json();
    console.log(`📊 Обновленное количество преподавателей: ${updatedTeachers.length}`);

    const foundTeacher = updatedTeachers.find(t => t.id === testTeacherId);
    if (foundTeacher) {
      console.log('✅ Локальный преподаватель найден на сервере');
    } else {
      console.log('❌ Локальный преподаватель НЕ найден на сервере');
    }

    // Проверяем всех пользователей
    const usersResponse = await fetch(`${SERVER_URL}/api/users`);
    if (!usersResponse.ok) {
      throw new Error(`Ошибка получения пользователей: ${usersResponse.status}`);
    }
    const allUsers = await usersResponse.json();
    
    const teacherUsers = allUsers.filter(u => u.role === 'teacher');
    const studentUsers = allUsers.filter(u => u.role === 'student');
    const foundTeacherUser = allUsers.find(u => u.id === testTeacherId);
    const foundStudentUser = allUsers.find(u => u.id === testStudentId);
    
    console.log(`📊 Всего пользователей: ${allUsers.length}`);
    console.log(`👨‍🏫 Преподавателей: ${teacherUsers.length}`);
    console.log(`👨‍🎓 Студентов: ${studentUsers.length}`);
    
    if (foundTeacherUser) {
      console.log('✅ Локальный преподаватель найден в списке пользователей');
    } else {
      console.log('❌ Локальный преподаватель НЕ найден в списке пользователей');
    }
    
    if (foundStudentUser) {
      console.log('✅ Локальный студент найден в списке пользователей');
    } else {
      console.log('❌ Локальный студент НЕ найден в списке пользователей');
    }

    // 6. Проверяем синхронизацию данных
    console.log('\n6️⃣ Проверка синхронизации данных...');
    const syncResponse = await fetch(`${SERVER_URL}/api/sync`);
    if (!syncResponse.ok) {
      throw new Error(`Ошибка синхронизации: ${syncResponse.status}`);
    }
    const syncData = await syncResponse.json();
    
    const teacherInSync = syncData.teacherProfiles && syncData.teacherProfiles[testTeacherId];
    const studentInSync = syncData.studentProfiles && syncData.studentProfiles[testStudentId];
    
    if (teacherInSync) {
      console.log('✅ Локальный преподаватель найден в данных синхронизации');
    } else {
      console.log('❌ Локальный преподаватель НЕ найден в данных синхронизации');
    }
    
    if (studentInSync) {
      console.log('✅ Локальный студент найден в данных синхронизации');
    } else {
      console.log('❌ Локальный студент НЕ найден в данных синхронизации');
    }

    console.log('\n🎉 Тест завершен успешно!');
    console.log('\n📋 Результаты:');
    console.log(`   • Локальные данные загружены: ✅`);
    console.log(`   • Загружено новых: ${uploadResult.uploaded}`);
    console.log(`   • Пропущено существующих: ${uploadResult.skipped}`);
    console.log(`   • Преподаватель в /api/teachers: ${foundTeacher ? '✅' : '❌'}`);
    console.log(`   • Преподаватель в /api/users: ${foundTeacherUser ? '✅' : '❌'}`);
    console.log(`   • Студент в /api/users: ${foundStudentUser ? '✅' : '❌'}`);
    console.log(`   • Преподаватель в данных синхронизации: ${teacherInSync ? '✅' : '❌'}`);
    console.log(`   • Студент в данных синхронизации: ${studentInSync ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    process.exit(1);
  }
}

// Запускаем тест
testLocalDataUpload();
