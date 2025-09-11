// Конфигурация для работы только с Render сервером
// Всегда используем Render сервер для единой базы данных

// URL сервера - всегда Render
export const SERVER_URL = 'https://nauchi.onrender.com';

// URL WebSocket - всегда Render
export const WEBSOCKET_URL = 'https://nauchi.onrender.com';

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
  isLocalhost: window.location.hostname === 'localhost',
  isRender: window.location.hostname.includes('onrender.com')
}; 