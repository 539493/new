// Конфигурация для подключения к серверу
const getServerUrl = () => {
  // В продакшене используем тот же домен, что и фронтенд
  if (import.meta.env.PROD) {
    // На Render используем тот же домен
    const hostname = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    return `${protocol}//${hostname}`;
  }
  
  // В разработке используем локальный сервер
  return 'http://localhost:3000';
};

const getWebSocketUrl = () => {
  // В продакшене используем тот же домен, что и фронтенд
  if (import.meta.env.PROD) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${hostname}`;
  }
  
  // В разработке используем локальный сервер
  return 'http://localhost:3000';
};

export const SERVER_URL = getServerUrl();
export const WEBSOCKET_URL = getWebSocketUrl(); 