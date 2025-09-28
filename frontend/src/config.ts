// Конфигурация для локального и продакшн сервера
const getServerUrl = () => {
  const baseUrl = import.meta.env.DEV 
    ? 'http://localhost:5000' 
    : import.meta.env.VITE_SERVER_URL || 'https://nauchi09.onrender.com';
  
  // Убираем trailing slash если есть
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

export const SERVER_URL = getServerUrl();

// URL WebSocket - локальный в разработке, продакшн на Render
export const WEBSOCKET_URL = getServerUrl();

// URL внешнего видео чата
export const EXTERNAL_VIDEO_CHAT_URL = getServerUrl();

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
