// Конфигурация для подключения к серверу
const getServerUrl = () => {
  // Используем переменные окружения если они есть
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }
  
  // В продакшене используем внешний сервер
  if (import.meta.env.PROD) {
    // На Render используем существующий сервер
    return 'https://tutoring-platform-am88.onrender.com';
  }
  
  // В разработке используем локальный сервер
  return 'http://localhost:3001';
};

const getWebSocketUrl = () => {
  // Используем переменные окружения если они есть
  if (import.meta.env.VITE_WEBSOCKET_URL) {
    return import.meta.env.VITE_WEBSOCKET_URL;
  }
  
  // В продакшене используем внешний сервер
  if (import.meta.env.PROD) {
    // На Render используем существующий сервер для WebSocket
    return 'https://tutoring-platform-am88.onrender.com';
  }
  
  // В разработке используем локальный сервер
  return 'http://localhost:3001';
};

export const SERVER_URL = getServerUrl();
export const WEBSOCKET_URL = getWebSocketUrl();

// URL внешнего сервиса видео чата
export const EXTERNAL_VIDEO_CHAT_URL = 'https://video-chat-web-lp8d.onrender.com';

// Настройки Socket.IO для чата и уведомлений
export const SOCKET_CONFIG = {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true,
  upgrade: true,
  rememberUpgrade: true
};

// Окружение
export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isLocalhost: window.location.hostname === 'localhost'
}; 