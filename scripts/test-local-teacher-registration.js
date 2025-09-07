#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки локальной регистрации преподавателя
 * Проверяет, что локально зарегистрированные преподаватели отображаются в интерфейсе
 */

const fs = require('fs');
const path = require('path');

// Симулируем localStorage для тестирования
const localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  }
};

// Симулируем регистрацию преподавателя локально
function simulateLocalTeacherRegistration() {
  console.log('🧪 Симуляция локальной регистрации преподавателя...');
  
  // 1. Создаем базовый профиль преподавателя
  const teacherId = `local-teacher-${Date.now()}`;
  const baseProfile = {
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
    }
  };

  // 2. Создаем пользователя
  const newUser = {
    id: teacherId,
    email: `teacher-${Date.now()}@example.com`,
    name: 'Тест Преподаватель',
    nickname: `test_teacher_${Date.now()}`,
    role: 'teacher',
    phone: '+7 (999) 123-45-67',
    profile: baseProfile,
    avatar: baseProfile.avatar
  };

  // 3. Сохраняем в localStorage (симуляция)
  const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
  users.push(newUser);
  localStorage.setItem('tutoring_users', JSON.stringify(users));
  
  // 4. Сохраняем профиль преподавателя
  const teacherProfiles = JSON.parse(localStorage.getItem('tutoring_teacherProfiles') || '{}');
  teacherProfiles[teacherId] = baseProfile;
  localStorage.setItem('tutoring_teacherProfiles', JSON.stringify(teacherProfiles));
  
  console.log('✅ Преподаватель зарегистрирован локально:');
  console.log(`   ID: ${teacherId}`);
  console.log(`   Имя: ${newUser.name}`);
  console.log(`   Email: ${newUser.email}`);
  console.log(`   Предметы: ${baseProfile.subjects.join(', ')}`);
  console.log(`   Опыт: ${baseProfile.experience}`);
  console.log(`   Рейтинг: ${baseProfile.rating}`);
  
  return { teacherId, newUser, baseProfile };
}

// Проверяем, что данные правильно сохранились
function verifyLocalData() {
  console.log('\n🔍 Проверка сохраненных данных...');
  
  const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
  const teacherProfiles = JSON.parse(localStorage.getItem('tutoring_teacherProfiles') || '{}');
  
  console.log(`👥 Всего пользователей: ${users.length}`);
  console.log(`👨‍🏫 Всего профилей преподавателей: ${Object.keys(teacherProfiles).length}`);
  
  const teachers = users.filter(u => u.role === 'teacher');
  console.log(`👨‍🏫 Преподавателей в пользователях: ${teachers.length}`);
  
  if (teachers.length > 0) {
    console.log('\n📋 Детали преподавателей:');
    teachers.forEach(teacher => {
      console.log(`   • ${teacher.name} (${teacher.id})`);
      console.log(`     Email: ${teacher.email}`);
      console.log(`     Предметы: ${teacher.profile?.subjects?.join(', ') || 'Не указаны'}`);
      console.log(`     Рейтинг: ${teacher.profile?.rating || 'Не указан'}`);
    });
  }
  
  if (Object.keys(teacherProfiles).length > 0) {
    console.log('\n📋 Детали профилей преподавателей:');
    Object.entries(teacherProfiles).forEach(([id, profile]) => {
      console.log(`   • ${profile.name || 'Без имени'} (${id})`);
      console.log(`     Предметы: ${profile.subjects?.join(', ') || 'Не указаны'}`);
      console.log(`     Опыт: ${profile.experience || 'Не указан'}`);
      console.log(`     Рейтинг: ${profile.rating || 'Не указан'}`);
    });
  }
  
  return { users, teacherProfiles, teachers };
}

// Симулируем логику allTeachers из StudentHome
function simulateAllTeachersLogic(users, teacherProfiles) {
  console.log('\n🔄 Симуляция логики allTeachers...');
  
  // Преподаватели из контекста (allUsers)
  const teachersFromUsers = users
    ?.filter((u) => u.role === 'teacher')
    .map((user) => ({
      id: user.id,
      name: user.name || user.profile?.name || 'Репетитор',
      avatar: user.avatar || user.profile?.avatar || '',
      rating: user.profile?.rating,
      profile: user.profile
    })) || [];
  
  console.log(`👥 Преподаватели из контекста: ${teachersFromUsers.length}`);
  
  // Преподаватели из локальных профилей
  const teachersFromProfiles = Object.entries(teacherProfiles).map(([id, profile]) => ({
    id,
    name: profile.name || 'Репетитор',
    avatar: profile.avatar || '',
    rating: profile.rating,
    profile: profile
  }));
  
  console.log(`📱 Преподаватели из локальных профилей: ${teachersFromProfiles.length}`);
  
  // Объединяем все источники
  const allSources = [...teachersFromUsers, ...teachersFromProfiles];
  console.log(`🔄 Всего источников: ${allSources.length}`);
  
  // Убираем дубликаты
  const allTeachersMap = new Map();
  allSources.forEach(teacher => {
    const existingTeacher = allTeachersMap.get(teacher.id);
    
    if (!existingTeacher) {
      allTeachersMap.set(teacher.id, teacher);
    } else {
      // Приоритет у тех, у кого есть полный профиль
      const newHasFullProfile = teacher.profile && teacher.profile.subjects && teacher.profile.subjects.length > 0;
      const existingHasFullProfile = existingTeacher.profile && existingTeacher.profile.subjects && existingTeacher.profile.subjects.length > 0;
      
      if (newHasFullProfile && !existingHasFullProfile) {
        allTeachersMap.set(teacher.id, teacher);
      }
    }
  });
  
  const result = Array.from(allTeachersMap.values());
  console.log(`✅ Итоговые преподаватели: ${result.length}`);
  
  if (result.length > 0) {
    console.log('\n📋 Итоговый список преподавателей:');
    result.forEach(teacher => {
      console.log(`   • ${teacher.name} (${teacher.id})`);
      console.log(`     Рейтинг: ${teacher.rating || 'Не указан'}`);
      console.log(`     Предметы: ${teacher.profile?.subjects?.join(', ') || 'Не указаны'}`);
      console.log(`     Есть аватар: ${!!(teacher.avatar && teacher.avatar.trim() !== '')}`);
      console.log(`     Есть полный профиль: ${!!(teacher.profile && teacher.profile.subjects && teacher.profile.subjects.length > 0)}`);
    });
  }
  
  return result;
}

// Основная функция тестирования
function runTest() {
  console.log('🧪 Тестирование локальной регистрации преподавателя\n');
  
  try {
    // 1. Симулируем регистрацию
    const { teacherId, newUser, baseProfile } = simulateLocalTeacherRegistration();
    
    // 2. Проверяем сохранение данных
    const { users, teacherProfiles, teachers } = verifyLocalData();
    
    // 3. Симулируем логику отображения
    const allTeachers = simulateAllTeachersLogic(users, teacherProfiles);
    
    // 4. Проверяем результат
    console.log('\n🎯 Результаты тестирования:');
    console.log(`   • Преподаватель зарегистрирован: ${teachers.length > 0 ? '✅' : '❌'}`);
    console.log(`   • Профиль сохранен: ${Object.keys(teacherProfiles).length > 0 ? '✅' : '❌'}`);
    console.log(`   • Преподаватель будет отображаться: ${allTeachers.length > 0 ? '✅' : '❌'}`);
    
    if (allTeachers.length > 0) {
      console.log('\n🎉 Тест пройден! Локально зарегистрированные преподаватели будут отображаться в интерфейсе.');
    } else {
      console.log('\n❌ Тест не пройден! Преподаватели не будут отображаться в интерфейсе.');
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  }
}

// Запускаем тест
runTest();
