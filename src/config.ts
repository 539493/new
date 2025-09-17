// ������������ ��� ������ ������ � Render ��������
// ������ ���������� Render ������ ��� ������ ���� ������

// URL ������� - ������ Render
export const SERVER_URL = 'https://nauchi.onrender.com';

// URL WebSocket - ������ Render
export const WEBSOCKET_URL = 'https://nauchi.onrender.com';

// URL �������� ������� ����� ����
export const EXTERNAL_VIDEO_CHAT_URL = 'https://video-chat-web-lp8d.onrender.com';

// ��������� Socket.IO ��� ���� � �����������
export const SOCKET_CONFIG = {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true,
  upgrade: true,
  rememberUpgrade: true
};

// ���������
export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
};
