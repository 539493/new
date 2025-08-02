import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_CONFIG } from '../../config';

const WebSocketTest: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('Attempting to connect to WebSocket...');
    addLog(`Server URL: ${SERVER_URL}`);
    
    const newSocket = io(SERVER_URL, SOCKET_CONFIG);

    newSocket.on('connect', () => {
      addLog('✅ WebSocket connected successfully!');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('connect_error', (err) => {
      addLog(`❌ WebSocket connection error: ${err.message}`);
      setError(err.message);
      setIsConnected(false);
    });

    newSocket.on('disconnect', () => {
      addLog('🔌 WebSocket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const testVideoConnection = () => {
    if (socket) {
      addLog('Testing video connection...');
      socket.emit('video-join', {
        roomId: 'test-room',
        userName: 'Test User',
        userRole: 'test'
      });
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">WebSocket Connection Test</h2>
      
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Server URL: {SERVER_URL}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-4 space-x-2">
        <button
          onClick={testVideoConnection}
          disabled={!isConnected}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Test Video Connection
        </button>
        
        <button
          onClick={clearLogs}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Clear Logs
        </button>
      </div>

      <div className="border rounded p-3 bg-gray-50">
        <h3 className="font-medium mb-2">Connection Logs:</h3>
        <div className="text-sm font-mono max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WebSocketTest; 