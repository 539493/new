import React from 'react';

export default function StudentHome(): JSX.Element {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать, ученик!</h1>
        <p className="text-gray-600 mt-2">Здесь вы можете просматривать доступные слоты, свои уроки и управлять профилем.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Ближайший урок</h2>
          <p className="text-gray-600 text-sm">Пока нет запланированных уроков</p>
        </div>
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Рекомендации</h2>
          <p className="text-gray-600 text-sm">Выберите предметы в профиле, чтобы получить рекомендации преподавателей</p>
        </div>
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Быстрые действия</h2>
          <ul className="text-sm text-[#0D3C69] space-y-1 list-disc list-inside">
            <li>Найти преподавателя</li>
            <li>Посмотреть календарь</li>
            <li>Заполнить профиль</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


