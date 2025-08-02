import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal, 
  ThumbsUp, 
  Smile, 
  Bookmark,
  Play,
  Send
} from 'lucide-react';
import PostEditor from './PostEditor';

interface Reaction {
  type: 'like' | 'love' | 'smile' | 'thumbsup';
  count: number;
  userReacted: boolean;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  date: string;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  media?: string[];
  type: 'text' | 'image' | 'video';
  date: string;
  reactions: Reaction[];
  comments: Comment[];
  isBookmarked: boolean;
}

interface PostCardProps {
  post: Post;
  onReaction: (postId: string, reactionType: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onEdit?: (postId: string, newText: string) => void;
  onDelete?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onReaction,
  onComment,
  onShare,
  onBookmark,
  onEdit,
  onDelete
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const handleReaction = (type: string) => {
    onReaction(post.id, type);
    setShowReactions(false);
  };

  const handleComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment.trim());
      setNewComment('');
    }
  };

  const handleEdit = (newText: string) => {
    if (onEdit) {
      onEdit(post.id, newText);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'только что';
    if (diffInHours < 24) return `${diffInHours}ч назад`;
    if (diffInHours < 48) return 'вчера';
    return date.toLocaleDateString('ru-RU');
  };

  const totalReactions = post.reactions.reduce((sum, reaction) => sum + reaction.count, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-4">
      {/* Заголовок поста */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
              {post.userAvatar ? (
                <img src={post.userAvatar} alt={post.userName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white text-sm font-medium">
                  {post.userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">{post.userName}</div>
              <div className="text-sm text-gray-500">{formatDate(post.date)}</div>
            </div>
          </div>
          
          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {/* Выпадающее меню */}
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
              {onEdit && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Редактировать
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                >
                  Удалить
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Редактирование поста */}
      {isEditing && onEdit && (
        <div className="px-4 pb-4">
          <PostEditor
            onSubmit={({ text }) => handleEdit(text)}
            onCancel={() => setIsEditing(false)}
            initialText={post.text}
            isEditing={true}
          />
        </div>
      )}

      {/* Контент поста */}
      {!isEditing && (
        <>
          {post.text && (
            <div className="px-4 pb-3">
              <p className="text-gray-900 whitespace-pre-line">{post.text}</p>
            </div>
          )}

          {/* Медиафайлы */}
          {post.media && post.media.length > 0 && (
            <div className="px-4 pb-3">
              {post.type === 'video' ? (
                <div className="relative">
                  <video 
                    src={post.media[0]} 
                    className="w-full rounded-lg"
                    controls
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-80" />
                  </div>
                </div>
              ) : (
                <div className={`grid gap-2 ${
                  post.media.length === 1 ? 'grid-cols-1' : 
                  post.media.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                }`}>
                  {post.media.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <img 
                        src={url} 
                        alt="Post media" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Статистика реакций и комментариев */}
          {(totalReactions > 0 || post.comments.length > 0) && (
            <div className="px-4 py-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  {totalReactions > 0 && (
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                      <span>{totalReactions}</span>
                    </div>
                  )}
                  {post.comments.length > 0 && (
                    <span>{post.comments.length} комментариев</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="px-4 py-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Кнопка реакций */}
                <div className="relative">
                  <button
                    onClick={() => setShowReactions(!showReactions)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                      post.reactions.some(r => r.userReacted) 
                        ? 'text-red-500 bg-red-50' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.reactions.some(r => r.userReacted) ? 'fill-current' : ''}`} />
                    <span className="text-sm">Нравится</span>
                  </button>
                  
                  {/* Панель реакций */}
                  {showReactions && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex space-x-2">
                      <button
                        onClick={() => handleReaction('like')}
                        className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                        title="Нравится"
                      >
                        <ThumbsUp className="w-6 h-6 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleReaction('love')}
                        className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                        title="Любовь"
                      >
                        <Heart className="w-6 h-6 text-red-500" />
                      </button>
                      <button
                        onClick={() => handleReaction('smile')}
                        className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                        title="Улыбка"
                      >
                        <Smile className="w-6 h-6 text-yellow-500" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-1 px-3 py-1 rounded-full text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">Комментировать</span>
                </button>

                <button
                  onClick={() => onShare(post.id)}
                  className="flex items-center space-x-1 px-3 py-1 rounded-full text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <Share className="w-5 h-5" />
                  <span className="text-sm">Поделиться</span>
                </button>
              </div>

              <button
                onClick={() => onBookmark(post.id)}
                className={`p-2 rounded-full transition-colors ${
                  post.isBookmarked 
                    ? 'text-blue-500 bg-blue-50' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Секция комментариев */}
          {showComments && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              {/* Список комментариев */}
              <div className="space-y-3 mb-3">
                {post.comments.map(comment => (
                  <div key={comment.id} className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                      {comment.userAvatar ? (
                        <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white text-xs font-medium">
                          {comment.userName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-lg p-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">{comment.userName}</span>
                          <span className="text-xs text-gray-500">{formatDate(comment.date)}</span>
                        </div>
                        <p className="text-sm text-gray-800">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Добавление комментария */}
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">U</span>
                </div>
                <div className="flex-1 flex items-center space-x-2 bg-white rounded-full px-3 py-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Написать комментарий..."
                    className="flex-1 border-none outline-none text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                  />
                  <button
                    onClick={handleComment}
                    disabled={!newComment.trim()}
                    className={`p-1 rounded-full transition-colors ${
                      newComment.trim() 
                        ? 'text-blue-500 hover:bg-blue-50' 
                        : 'text-gray-400'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostCard; 