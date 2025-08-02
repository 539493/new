import React, { useState } from 'react';
import VideoChat from './VideoChat';

const SimpleVideoTest: React.FC = () => {
  const [showVideoChat, setShowVideoChat] = useState(false);
  const [roomId, setRoomId] = useState('test-room-' + Math.random().toString(36).substr(2, 9));
  const [userName, setUserName] = useState('Test User');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Простой тест видео чата</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID комнаты:
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите ID комнаты"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ваше имя:
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите ваше имя"
              />
            </div>
            
            <button
              onClick={() => setShowVideoChat(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Начать видео чат
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-800 mb-2">Инструкции:</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Введите ID комнаты (или оставьте случайный)</li>
              <li>2. Введите ваше имя</li>
              <li>3. Нажмите "Начать видео чат"</li>
              <li>4. Разрешите доступ к камере и микрофону</li>
              <li>5. Откройте ту же ссылку в другом браузере/вкладке</li>
              <li>6. Используйте тот же ID комнаты для подключения</li>
            </ol>
          </div>
        </div>
      </div>
      
      {showVideoChat && (
        <VideoChat
          roomId={roomId}
          userName={userName}
          onClose={() => setShowVideoChat(false)}
        />
      )}
    </div>
  );
};

export default SimpleVideoTest; 