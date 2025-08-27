import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Bell, TrendingUp, Bookmark, Hash } from 'lucide-react';
import PostEditor from './PostEditor';
import PostCard from './PostCard';
import PostSearch from './PostSearch';
import NotificationSystem from './NotificationSystem';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  media?: string[];
  type: 'text' | 'image' | 'video';
  date: string;
  reactions: Array<{
    type: 'like' | 'love' | 'smile' | 'thumbsup';
    count: number;
    userReacted: boolean;
  }>;
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    text: string;
    date: string;
  }>;
  isBookmarked: boolean;
}

interface PostsFeedProps {
  posts: Post[];
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  onCreatePost: (post: { text: string; media: File[]; type: 'text' | 'image' | 'video' }) => void;
  onReaction: (postId: string, reactionType: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onEdit?: (postId: string, newText: string) => void;
  onDelete?: (postId: string) => void;
  showCreateButton?: boolean;
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showTrending?: boolean;
  showBookmarks?: boolean;
}

const PostsFeed: React.FC<PostsFeedProps> = ({
  posts,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onCreatePost,
  onReaction,
  onComment,
  onShare,
  onBookmark,
  onEdit,
  onDelete,
  showCreateButton = true,
  title = "Записи",
  showSearch: showSearchProp = true,
  showNotifications = true,
  showTrending = true,
  showBookmarks = true
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'my' | 'others' | 'trending' | 'bookmarks'>('all');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);
  const [searchResults, setSearchResults] = useState<Post[]>([]);

  useEffect(() => {
    let filtered = posts;
    
    if (filterType === 'my') {
      filtered = posts.filter(post => post.userId === currentUserId);
    } else if (filterType === 'others') {
      filtered = posts.filter(post => post.userId !== currentUserId);
    } else if (filterType === 'trending') {
      // Сортируем по популярности (лайки + комментарии)
      filtered = [...posts].sort((a, b) => {
        const aScore = (a.likes || 0) + a.comments.length;
        const bScore = (b.likes || 0) + b.comments.length;
        return bScore - aScore;
      }).slice(0, 20); // Топ 20
    } else if (filterType === 'bookmarks') {
      filtered = posts.filter(post => post.bookmarks?.includes(currentUserId));
    }
    
    setFilteredPosts(filtered);
  }, [posts, filterType, currentUserId]);

  const handleCreatePost = (postData: { text: string; media: File[]; type: 'text' | 'image' | 'video' }) => {
    console.log('PostsFeed: handleCreatePost called with:', postData);
    onCreatePost(postData);
    setShowEditor(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        
        <div className="flex items-center space-x-2">
          {/* Уведомления */}
          {showNotifications && (
            <NotificationSystem className="mr-2" />
          )}

          {/* Поиск */}
          {showSearchProp && (
            <button
              onClick={() => setShowSearchPanel(!showSearchPanel)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              title="Поиск"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Фильтр */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все записи</option>
              <option value="my">Мои записи</option>
              <option value="others">Записи других</option>
              {showTrending && <option value="trending">Популярные</option>}
              {showBookmarks && <option value="bookmarks">Закладки</option>}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          {/* Кнопка создания */}
          {showCreateButton && (
            <button
              onClick={() => setShowEditor(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Создать запись</span>
            </button>
          )}
        </div>
      </div>

      {/* Поиск */}
      {showSearchPanel && (
        <div className="mb-6">
          <PostSearch
            onSearchResults={setSearchResults}
            onClose={() => setShowSearchPanel(false)}
          />
        </div>
      )}

      {/* Редактор создания записи */}
      {showEditor && (
        <div className="mb-6">
          <PostEditor
            onSubmit={handleCreatePost}
            onCancel={() => setShowEditor(false)}
            userName={currentUserName}
            userAvatar={currentUserAvatar}
          />
        </div>
      )}

      {/* Лента записей */}
      <div className="space-y-4">
        {/* Результаты поиска */}
        {searchResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Результаты поиска ({searchResults.length})</h3>
            <div className="space-y-4">
              {searchResults.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  onReaction={onReaction}
                  onComment={onComment}
                  onShare={onShare}
                  onBookmark={onBookmark}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* Обычные записи */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              {filterType === 'all' && 'Пока нет записей'}
              {filterType === 'my' && 'У вас пока нет записей'}
              {filterType === 'others' && 'Пока нет записей от других'}
              {filterType === 'trending' && 'Пока нет популярных записей'}
              {filterType === 'bookmarks' && 'У вас пока нет закладок'}
            </div>
            <p className="text-gray-500">
              {filterType === 'my' && showCreateButton && 'Создайте первую запись!'}
              {filterType === 'others' && 'Записи от других пользователей появятся здесь'}
              {filterType === 'trending' && 'Популярные записи появятся здесь'}
              {filterType === 'bookmarks' && 'Добавляйте записи в закладки!'}
            </p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onReaction={onReaction}
              onComment={onComment}
              onShare={onShare}
              onBookmark={onBookmark}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PostsFeed; 