// Конфигурация для локального сервера в режиме разработки
// В продакшене используется Render сервер

// URL сервера - локальный в разработке, Render в продакшене
export const SERVER_URL = import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : 'https://na-uchi.onrender.com'; // URL вашего бэкенда на Render

// URL WebSocket - локальный в разработке, Render в продакшене
export const WEBSOCKET_URL = import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : 'https://na-uchi.onrender.com'; // URL вашего бэкенда на Render

// URL внешнего видео чата
export const EXTERNAL_VIDEO_CHAT_URL = 'https://video-chat-web-lp8d.onrender.com';

// Настройки Socket.IO для работы с сервером
export const SOCKET_CONFIG = {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true,
  upgrade: true,
  rememberUpgrade: true
};

// Переменные
export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
