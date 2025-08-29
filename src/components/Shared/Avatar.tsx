import React from 'react';
import { User } from 'lucide-react';
import { SERVER_URL } from '../../config';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  className = '',
  showOnlineStatus = false,
  isOnline = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const getAvatarUrl = () => {
    if (!src) return null;
    
    // Если это полный URL, используем как есть
    if (src.startsWith('http')) {
      return src;
    }
    
    // Если это относительный путь, добавляем базовый URL
    if (src.startsWith('/uploads/')) {
      return `${SERVER_URL}${src}`;
    }
    
    // Если это просто имя файла, добавляем путь к аватарам
    return `${SERVER_URL}/uploads/avatars/${src}`;
  };

  const avatarUrl = getAvatarUrl();
  const hasValidAvatar = avatarUrl && avatarUrl.trim() !== '' && avatarUrl !== 'undefined' && avatarUrl !== 'null';

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg relative`}>
        {hasValidAvatar ? (
          <img
            src={avatarUrl}
            alt={alt}
            className={`${sizeClasses[size]} object-cover rounded-full`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.classList.remove('hidden');
            }}
            onLoad={(e) => {
              const target = e.target as HTMLImageElement;
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.classList.add('hidden');
            }}
          />
        ) : null}
        
        {/* Fallback иконка */}
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center ${hasValidAvatar ? 'hidden' : ''}`}>
          <User className={`${iconSizes[size]} text-white`} />
        </div>
      </div>

      {/* Индикатор онлайн статуса */}
      {showOnlineStatus && (
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}></div>
      )}
    </div>
  );
};

export default Avatar;
