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

// Настройки WebRTC
export const WEBRTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 10
};

// Настройки медиа
export const MEDIA_CONFIG = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user'
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};

// Настройки Socket.IO
export const SOCKET_CONFIG = {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true
};

// Окружение
export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isLocalhost: window.location.hostname === 'localhost'
}; 