// Конфигурация для подключения к серверу
const getServerUrl = () => {
  // В продакшене используем тот же домен, что и фронтенд
  if (import.meta.env.PROD) {
    // На Render используем тот же домен, но с WebSocket протоколом
    const hostname = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${hostname}`;
  }
  
  // В разработке используем локальный сервер
  return 'http://localhost:3000';
};

export const SERVER_URL = getServerUrl(); 