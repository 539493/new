import React, { useState, useRef } from 'react';
import { Upload, X, User, Camera } from 'lucide-react';
import { SERVER_URL } from '../../config';

interface AvatarUploadProps {
  userId: string;
  currentAvatar?: string;
  onAvatarUploaded: (avatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  userId,
  currentAvatar,
  onAvatarUploaded,
  size = 'md',
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    // Проверяем размер файла (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    setError(null);

    // Создаем предварительный просмотр
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('avatar', fileInputRef.current.files[0]);
    formData.append('userId', userId);

    try {
      const response = await fetch(`${SERVER_URL}/api/uploadAvatar`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки');
      }

      const data = await response.json();
      
      // Формируем полный URL для аватара
      const avatarUrl = `${SERVER_URL}/uploads/avatars/${data.avatarUrl}`;
      
      onAvatarUploaded(avatarUrl);
      setPreviewUrl(null);
      
      // Очищаем input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файла');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAvatarUrl = () => {
    if (previewUrl) return previewUrl;
    if (currentAvatar) {
      // Если это полный URL, используем как есть
      if (currentAvatar.startsWith('http')) {
        return currentAvatar;
      }
      // Если это относительный путь, добавляем базовый URL
      return `${SERVER_URL}/uploads/avatars/${currentAvatar}`;
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div className={`relative ${className}`}>
      {/* Аватар */}
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg relative`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className={`${sizeClasses[size]} object-cover rounded-full`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
        ) : null}
        
        {/* Fallback иконка */}
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center ${avatarUrl ? 'hidden' : ''}`}>
          <User className={`${iconSizes[size]} text-white`} />
        </div>

        {/* Индикатор загрузки */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Кнопка загрузки */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
      >
        <Camera className="w-4 h-4" />
      </button>

      {/* Скрытый input для выбора файла */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Предварительный просмотр с кнопками */}
      {previewUrl && (
        <div className="absolute inset-0 bg-black bg-opacity-75 rounded-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-xs mb-2">Предварительный просмотр</div>
            <div className="flex space-x-2">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
              >
                {isUploading ? 'Загрузка...' : 'Сохранить'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isUploading}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <div className="absolute -bottom-8 left-0 right-0 bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-xs">
          {error}
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
