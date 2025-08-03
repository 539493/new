// Конфигурация для подключения к серверу
const getServerUrl = () => {
  // В продакшене используем тот же домен, что и фронтенд
  if (import.meta.env.PROD) {
    // На Render используем тот же домен
    const hostname = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    return `${protocol}//${hostname}`;
  }
  
  // В разработке используем локальный сервер, но доступный из других сетей
  // Получаем IP адрес компьютера для доступа из других устройств
  const localIP = window.location.hostname === 'localhost' ? '192.168.0.103' : window.location.hostname;
  return `http://${localIP}:3001`;
};

const getWebSocketUrl = () => {
  // В продакшене используем тот же домен, что и фронтенд
  if (import.meta.env.PROD) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${hostname}`;
  }
  
  // В разработке используем локальный сервер, но доступный из других сетей
  const localIP = window.location.hostname === 'localhost' ? '192.168.0.103' : window.location.hostname;
  return `http://${localIP}:3001`;
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