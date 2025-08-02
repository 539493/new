import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Users } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

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

  useEffect(() => {
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
          userName
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
    onClose();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Подключение к видеозвонку...</p>
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