// Конфигурация для подключения к серверу
const getServerUrl = () => {
  // В продакшене используем тот же домен, что и фронтенд
  if (import.meta.env.PROD) {
    // На Render используем тот же домен
    const hostname = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    return `${protocol}//${hostname}`;
  }
  
  // В разработке используем локальный сервер на порту 3001
  return 'http://localhost:3001';
};

const getWebSocketUrl = () => {
  // В продакшене используем тот же домен, что и фронтенд
  if (import.meta.env.PROD) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${hostname}`;
  }
  
  // В разработке используем локальный сервер на порту 3001
  return 'http://localhost:3001';
};

export const SERVER_URL = getServerUrl();
export const WEBSOCKET_URL = getWebSocketUrl();

// URL внешнего сервиса видео чата
export const EXTERNAL_VIDEO_CHAT_URL = 'https://video-chat-web-lp8d.onrender.com';

// Окружение
export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isLocalhost: window.location.hostname === 'localhost'
}; 