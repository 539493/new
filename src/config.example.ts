// Пример конфигурации для локальной разработки
export const SERVER_URL = 'http://localhost:3001';
export const WEBSOCKET_URL = 'http://localhost:3001';

// Конфигурация для WebSocket соединения
export const SOCKET_CONFIG = {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  maxReconnectionAttempts: 10,
  autoConnect: true,
};

// Конфигурация для продакшена (замените на ваши домены)
// export const SERVER_URL = 'https://your-domain.com';
// export const WEBSOCKET_URL = 'https://your-domain.com';
