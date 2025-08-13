import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_CONFIG } from '../../config';

const ServerStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL, SOCKET_CONFIG);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setIsConnected(false);
      setError('Ошибка подключения к серверу');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const testVideoConnection = () => {
    if (socket) {
      socket.emit('video-join', {
        roomId: 'test-room',
        userName: 'Test User',
        userRole: 'test'
      });
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Статус сервера</h3>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">
            {isConnected ? 'Подключено к серверу' : 'Не подключено к серверу'}
          </span>
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={testVideoConnection}
          disabled={!isConnected}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Тест видео подключения
        </button>
      </div>
    </div>
  );
};

export default ServerStatus; 