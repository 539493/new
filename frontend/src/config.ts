// Конфигурация для локального и продакшн сервера
export const SERVER_URL = import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : import.meta.env.VITE_SERVER_URL || 'https://your-app-name.onrender.com';

// URL WebSocket - локальный в разработке, продакшн на Render
export const WEBSOCKET_URL = import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : import.meta.env.VITE_SERVER_URL || 'https://your-app-name.onrender.com';

// URL внешнего видео чата
export const EXTERNAL_VIDEO_CHAT_URL = import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : import.meta.env.VITE_SERVER_URL || 'https://your-app-name.onrender.com';

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
