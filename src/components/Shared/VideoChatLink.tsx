import React from 'react';
import { Video, ExternalLink } from 'lucide-react';
import { EXTERNAL_VIDEO_CHAT_URL } from '../../config';

interface VideoChatLinkProps {
  lessonId: string;
  userName: string;
  role: 'student' | 'teacher';
  className?: string;
}

const VideoChatLink: React.FC<VideoChatLinkProps> = ({ lessonId, userName, role, className = '' }) => {
  const openVideoChat = () => {
    const params = new URLSearchParams({
      lesson: lessonId,
      user: userName,
      role: role
    });
    const link = `${EXTERNAL_VIDEO_CHAT_URL}/?${params.toString()}`;
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={className}>
      <button
        onClick={openVideoChat}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Video className="h-4 w-4" />
        <span className="text-sm font-medium">Подключиться к уроку</span>
        <ExternalLink className="h-3 w-3" />
      </button>
    </div>
  );
};

export default VideoChatLink; 