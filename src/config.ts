// Конфигурация для разных окружений
const isProd = import.meta.env.PROD;

// URL сервера
export const SERVER_URL = isProd 
  ? 'https://tutoring-platform-am88.onrender.com' 
  : 'http://localhost:3001';

// URL WebSocket
export const WEBSOCKET_URL = isProd 
  ? 'https://tutoring-platform-am88.onrender.com' 
  : 'http://localhost:3001';

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