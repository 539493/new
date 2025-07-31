import React, { useState, useRef } from 'react';
import { X, Image, Video, Smile, Send } from 'lucide-react';

interface PostEditorProps {
  onSubmit: (post: {
    text: string;
    media: File[];
    type: 'text' | 'image' | 'video';
  }) => void;
  onCancel: () => void;
  initialText?: string;
  isEditing?: boolean;
}

const PostEditor: React.FC<PostEditorProps> = ({ 
  onSubmit, 
  onCancel, 
  initialText = '', 
  isEditing = false 
}) => {
  const [text, setText] = useState(initialText);
  const [media, setMedia] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newMedia = [...media, ...files];
    setMedia(newMedia);
    
    // Создаем URL для предпросмотра
    const newUrls = files.map(file => URL.createObjectURL(file));
    setMediaUrls([...mediaUrls, ...newUrls]);
  };

  const removeMedia = (index: number) => {
    const newMedia = media.filter((_, i) => i !== index);
    const newUrls = mediaUrls.filter((_, i) => i !== index);
    setMedia(newMedia);
    setMediaUrls(newUrls);
  };

  const handleSubmit = () => {
    if (!text.trim() && media.length === 0) return;
    
    const postType = media.length > 0 ? 
      (media.some(file => file.type.startsWith('video/')) ? 'video' : 'image') : 
      'text';
    
    onSubmit({
      text: text.trim(),
      media,
      type: postType
    });
    
    // Очищаем URL объекты
    mediaUrls.forEach(url => URL.revokeObjectURL(url));
  };

  const isSubmitDisabled = !text.trim() && media.length === 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">U</span>
        </div>
        
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isEditing ? "Редактировать запись..." : "Что нового?"}
            className="w-full border-none resize-none focus:ring-0 text-gray-900 placeholder-gray-500"
            rows={3}
          />
          
          {/* Предпросмотр медиафайлов */}
          {mediaUrls.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative group">
                  {media[index]?.type.startsWith('video/') ? (
                    <video 
                      src={url} 
                      className="w-full h-24 object-cover rounded-lg"
                      controls
                    />
                  ) : (
                    <img 
                      src={url} 
                      alt="Preview" 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  )}
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Панель инструментов */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                title="Добавить фото или видео"
              >
                <Image className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-blue-500 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isSubmitDisabled
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isEditing ? 'Сохранить' : 'Опубликовать'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleMediaUpload}
        className="hidden"
      />
    </div>
  );
};

export default PostEditor; 