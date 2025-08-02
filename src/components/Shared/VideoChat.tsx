import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Users } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { SERVER_URL, WEBRTC_CONFIG, MEDIA_CONFIG, SOCKET_CONFIG } from '../../config';

interface VideoChatProps {
  roomId: string;
  onClose: () => void;
  userName: string;
}

const VideoChat: React.FC<VideoChatProps> = ({ roomId, onClose, userName }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Инициализация...');

  useEffect(() => {
    initializeVideoChat();
    return () => {
      cleanup();
    };
  }, [roomId]);

  const initializeVideoChat = async () => {
    try {
      setError(null);
      setIsLoading(true);
      setConnectionStatus('Получение доступа к камере...');

      // Получаем доступ к камере и микрофону
      const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONFIG);
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play().catch(console.error);
      }

      setConnectionStatus('Подключение к серверу...');
      console.log('Connecting to server:', SERVER_URL);

      // Создаем Socket.IO соединение
      socketRef.current = io(SERVER_URL, SOCKET_CONFIG);
      
      socketRef.current.on('connect', () => {
        console.log('Socket.IO connected successfully');
        setConnectionStatus('Подключено к серверу');
        socketRef.current?.emit('video-join', {
          roomId,
          userName,
          userRole: 'participant'
        });
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        setError(`Ошибка подключения к серверу: ${error.message}`);
        setConnectionStatus('Ошибка подключения');
      });

      socketRef.current.on('video-connected', (data) => {
        console.log('Connected to video room:', data.roomId);
        setIsConnected(true);
        setIsLoading(false);
        setConnectionStatus('Подключено к видео комнате');
      });

      socketRef.current.on('video-user-joined', (data) => {
        console.log('User joined:', data.userName);
        setParticipants(prev => [...prev, data.userName]);
        // Создаем offer только если мы первый в комнате
        if (peerConnectionRef.current && participants.length === 0) {
          createOffer();
        }
      });

      socketRef.current.on('video-user-left', (data) => {
        console.log('User left:', data.userName);
        setParticipants(prev => prev.filter(name => name !== data.userName));
      });

      socketRef.current.on('video-offer', async (data) => {
        console.log('Received offer');
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            socketRef.current?.emit('video-answer', {
              roomId,
              answer
            });
          } catch (error) {
            console.error('Error handling offer:', error);
          }
        }
      });

      socketRef.current.on('video-answer', async (data) => {
        console.log('Received answer');
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          } catch (error) {
            console.error('Error handling answer:', error);
          }
        }
      });

      socketRef.current.on('video-ice-candidate', async (data) => {
        console.log('Received ICE candidate');
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }
      });

      setConnectionStatus('Создание WebRTC соединения...');

      // Создаем RTCPeerConnection с улучшенной конфигурацией
      peerConnectionRef.current = new RTCPeerConnection(WEBRTC_CONFIG);
      
      // Добавляем локальный поток
      stream.getTracks().forEach(track => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, stream);
        }
      });

      // Обрабатываем входящие потоки
      peerConnectionRef.current.ontrack = (event) => {
        console.log('Received remote stream');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.play().catch(console.error);
        }
      };

      // Обрабатываем ICE кандидаты
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit('video-ice-candidate', {
            roomId,
            candidate: event.candidate
          });
        }
      };

      // Обрабатываем изменения состояния соединения
      peerConnectionRef.current.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnectionRef.current?.connectionState);
        setConnectionStatus(`WebRTC: ${peerConnectionRef.current?.connectionState}`);
      };

      peerConnectionRef.current.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnectionRef.current?.iceConnectionState);
      };

    } catch (error) {
      console.error('Error initializing video chat:', error);
      setError('Не удалось получить доступ к камере и микрофону. Убедитесь, что вы разрешили доступ к камере и микрофону.');
      setIsLoading(false);
      setConnectionStatus('Ошибка инициализации');
    }
  };

  const createOffer = async () => {
    if (peerConnectionRef.current) {
      try {
        const offer = await peerConnectionRef.current.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await peerConnectionRef.current.setLocalDescription(offer);
        socketRef.current?.emit('video-offer', {
          roomId,
          offer
        });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socketRef.current) {
      socketRef.current.emit('video-leave', { roomId, userName });
      socketRef.current.disconnect();
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const handleEndCall = () => {
    cleanup();
    onClose();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 text-center max-w-md mx-4">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Ошибка подключения</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold mb-2">Подключение к видеозвонку...</p>
          <p className="text-sm text-gray-600">{connectionStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Видеозвонок</h2>
            <p className="text-sm text-gray-300">Комната: {roomId}</p>
            <p className="text-sm text-gray-300">Участники: {participants.length + 1}</p>
            <p className="text-sm text-gray-300">Статус: {connectionStatus}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{isConnected ? 'Подключено' : 'Подключение...'}</span>
          </div>
        </div>

        {/* Видео контейнер */}
        <div className="relative bg-gray-900 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-96">
            {/* Удаленное видео */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!remoteVideoRef.current?.srcObject && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Ожидание подключения участника...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Локальное видео */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                Вы
              </div>
            </div>
          </div>
        </div>

        {/* Панель управления */}
        <div className="bg-gray-100 p-4 flex items-center justify-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'} hover:opacity-80 transition-colors`}
            title={isMuted ? 'Включить микрофон' : 'Выключить микрофон'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'} hover:opacity-80 transition-colors`}
            title={isVideoOff ? 'Включить камеру' : 'Выключить камеру'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={handleEndCall}
            className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            title="Завершить звонок"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoChat; 