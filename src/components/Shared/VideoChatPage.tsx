import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Users, MessageCircle, Share2, Copy, Check } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const VideoChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lesson') || '';
  const roomId = searchParams.get('room') || lessonId;
  const userName = searchParams.get('user') || 'User';
  const userRole = searchParams.get('role') || 'student';

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
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }
    
    initializeVideoChat();
    return () => {
      cleanup();
    };
  }, [roomId]);

  const initializeVideoChat = async () => {
    try {
      // Получаем доступ к камере и микрофону
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Создаем Socket.IO соединение
      const socketUrl = window.location.origin;
      socketRef.current = io(socketUrl);
      
      socketRef.current.on('connect', () => {
        console.log('Socket.IO connected');
        socketRef.current?.emit('video-join', {
          roomId,
          userName,
          userRole
        });
      });

      socketRef.current.on('video-connected', (data) => {
        console.log('Connected to video room:', data.roomId);
        setIsConnected(true);
      });

      socketRef.current.on('video-user-joined', (data) => {
        console.log('User joined:', data.userName);
        setParticipants(prev => [...prev, data.userName]);
        if (peerConnectionRef.current) {
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
          await peerConnectionRef.current.setRemoteDescription(data.offer);
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socketRef.current?.emit('video-answer', {
            roomId,
            answer
          });
        }
      });

      socketRef.current.on('video-answer', async (data) => {
        console.log('Received answer');
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(data.answer);
        }
      });

      socketRef.current.on('video-ice-candidate', async (data) => {
        console.log('Received ICE candidate');
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(data.candidate);
        }
      });

      // Создаем RTCPeerConnection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      peerConnectionRef.current = new RTCPeerConnection(configuration);
      
      // Добавляем локальный поток
      stream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, stream);
      });

      // Обрабатываем входящие потоки
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
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

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing video chat:', error);
      alert('Не удалось получить доступ к камере и микрофону');
    }
  };

  const createOffer = async () => {
    if (peerConnectionRef.current) {
      try {
        const offer = await peerConnectionRef.current.createOffer();
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
    navigate('/');
  };

  const copyLink = () => {
    const link = `${window.location.origin}/video-chat?lesson=${lessonId}&user=${encodeURIComponent(userName)}&role=${userRole}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    setShowShareModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Подключение к видеозвонку...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Заголовок */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">videoChatApp</h1>
          <p className="text-gray-300 text-sm">Урок: {lessonId} • {userRole === 'teacher' ? 'Преподаватель' : 'Ученик'}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-white text-sm">{isConnected ? 'Подключено' : 'Подключение...'}</span>
          </div>
          <button
            onClick={copyLink}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="text-sm">{copied ? 'Скопировано!' : 'Копировать ссылку'}</span>
          </button>
        </div>
      </div>

      {/* Основная область видео */}
      <div className="flex-1 relative bg-gray-900">
        {/* Удаленное видео (основное) */}
        <div className="absolute inset-0">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {!remoteVideoRef.current?.srcObject && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Ожидание подключения участника...</p>
                <p className="text-sm text-gray-400 mt-2">Поделитесь ссылкой с другим участником</p>
              </div>
            </div>
          )}
        </div>

        {/* Локальное видео (в правом верхнем углу) */}
        <div className="absolute top-4 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            Вы ({userName})
          </div>
        </div>

        {/* Информация о подключении */}
        {participants.length > 0 && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
            <p className="text-sm">Участники: {participants.join(', ')}</p>
          </div>
        )}
      </div>

      {/* Панель управления */}
      <div className="bg-gray-800 p-4 flex items-center justify-center space-x-4">
        <button
          onClick={shareLink}
          className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          title="Поделиться ссылкой"
        >
          <Share2 className="w-5 h-5" />
        </button>

        <button
          onClick={() => {}}
          className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          title="Участники"
        >
          <Users className="w-5 h-5" />
        </button>

        <button
          onClick={() => {}}
          className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          title="Чат"
        >
          <MessageCircle className="w-5 h-5" />
        </button>

        <button
          onClick={toggleMute}
          className={`p-3 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'} hover:opacity-80 transition-colors`}
          title={isMuted ? 'Включить микрофон' : 'Выключить микрофон'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'} hover:opacity-80 transition-colors`}
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

      {/* Модальное окно для копирования ссылки */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-white text-lg font-bold mb-4">Поделиться ссылкой</h3>
            <p className="text-gray-300 mb-4">Отправьте эту ссылку другому участнику урока:</p>
            <div className="bg-gray-700 p-3 rounded mb-4">
              <p className="text-white text-sm break-all">
                {`${window.location.origin}/video-chat?lesson=${lessonId}&user=${encodeURIComponent(userName)}&role=${userRole}`}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={copyLink}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                {copied ? 'Скопировано!' : 'Копировать'}
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChatPage; 