import React, { useState } from 'react';
import { Copy, Check, Share2, Video } from 'lucide-react';

interface VideoChatLinkProps {
  lessonId: string;
  userName: string;
  role: 'student' | 'teacher';
  className?: string;
}

const VideoChatLink: React.FC<VideoChatLinkProps> = ({ lessonId, userName, role, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const generateLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/video-chat?lesson=${lessonId}&user=${encodeURIComponent(userName)}&role=${role}`;
  };

  const copyLink = () => {
    const link = generateLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openVideoChat = () => {
    const link = generateLink();
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const shareLink = () => {
    setShowModal(true);
  };

  return (
    <>
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={openVideoChat}
          className="flex items-center space-x-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        >
          <Video className="h-4 w-4" />
          <span className="text-sm">Видеозвонок</span>
        </button>
        
        <button
          onClick={copyLink}
          className="flex items-center space-x-1 px-2 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Копировать ссылку"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>

        <button
          onClick={shareLink}
          className="flex items-center space-x-1 px-2 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          title="Поделиться ссылкой"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {/* Модальное окно для копирования ссылки */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Ссылка на видеозвонок</h3>
            <p className="text-gray-600 mb-4">
              Отправьте эту ссылку {role === 'teacher' ? 'ученику' : 'преподавателю'} для подключения к видеозвонку:
            </p>
            <div className="bg-gray-100 p-3 rounded mb-4">
              <p className="text-sm break-all font-mono">
                {generateLink()}
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
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoChatLink; 