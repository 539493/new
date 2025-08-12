import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp, Smile, User } from 'lucide-react';
import { Post, Comment } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface PostCardProps {
  post: Post;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onEdit, onDelete }) => {
  const { addReaction, addComment, bookmarkPost } = useData();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleReaction = (reactionType: string) => {
    if (!user) return;
    addReaction(post.id, reactionType);
  };

  const handleComment = async () => {
    if (!newComment.trim() || !user) return;
    
    setSubmitting(true);
    try {
      await addComment(post.id, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookmark = () => {
    if (!user) return;
    bookmarkPost(post.id);
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'like': return <ThumbsUp className="h-4 w-4" />;
      case 'love': return <Heart className="h-4 w-4" />;
      case 'smile': return <Smile className="h-4 w-4" />;
      default: return <ThumbsUp className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Только что';
    if (diffInHours < 24) return `${diffInHours} ч назад`;
    if (diffInHours < 48) return 'Вчера';
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border border-gray-100 overflow-hidden animate-fade-in-up">
      {/* Заголовок поста */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {post.userAvatar ? (
              <img 
                src={post.userAvatar} 
                alt={post.userName} 
                className="w-12 h-12 rounded-2xl object-cover shadow-md"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                <User className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                {post.userName}
              </h3>
              <p className="text-sm text-gray-500">{formatDate(post.date)}</p>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 hover:bg-gray-100 rounded-2xl transition-colors duration-200"
            >
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-10 animate-scale-in">
                {onEdit && (
                  <button
                    onClick={() => onEdit(post.id)}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Редактировать
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(post.id)}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    Удалить
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Содержимое поста */}
      <div className="p-6">
        <p className="text-gray-800 text-lg leading-relaxed mb-4">{post.text}</p>
        
        {/* Медиа контент */}
        {post.media && post.media.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {post.media.map((media, index) => (
              <div key={index} className="relative group overflow-hidden rounded-2xl">
                <img 
                  src={media} 
                  alt={`Media ${index + 1}`}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Реакции */}
      {post.reactions && post.reactions.length > 0 && (
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {post.reactions.map((reaction, index) => (
              <button
                key={index}
                onClick={() => handleReaction(reaction.type)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  reaction.userReacted
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getReactionIcon(reaction.type)}
                <span>{reaction.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Действия */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => handleReaction('like')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-2xl transition-all duration-200 hover:scale-105 ${
                post.reactions?.some(r => r.type === 'like' && r.userReacted)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <ThumbsUp className="h-5 w-5" />
              <span className="text-sm font-medium">Нравится</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-4 py-2 rounded-2xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:scale-105"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                Комментарии ({post.comments?.length || 0})
              </span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 rounded-2xl text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200 hover:scale-105">
              <Share2 className="h-5 w-5" />
              <span className="text-sm font-medium">Поделиться</span>
            </button>
          </div>
          
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-2xl transition-all duration-200 hover:scale-110 ${
              post.isBookmarked
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Bookmark className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Комментарии */}
      {showComments && (
        <div className="border-t border-gray-100 bg-gray-50/50">
          <div className="p-6">
            {/* Добавление комментария */}
            <div className="flex items-center space-x-3 mb-4">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Написать комментарий..."
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                />
              </div>
              <button
                onClick={handleComment}
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                {isSubmitting ? '...' : 'Отправить'}
              </button>
            </div>

            {/* Список комментариев */}
            <div className="space-y-3">
              {post.comments?.map((comment: Comment) => (
                <div key={comment.id} className="flex items-start space-x-3 p-3 bg-white rounded-2xl shadow-sm">
                  {comment.userAvatar ? (
                    <img 
                      src={comment.userAvatar} 
                      alt={comment.userName} 
                      className="w-8 h-8 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{comment.userName}</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.date)}</span>
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard; 