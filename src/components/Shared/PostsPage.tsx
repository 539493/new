import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import PostsFeed from './PostsFeed';

const PostsPage: React.FC = () => {
  const { posts, createPost, addReaction, addComment, sharePost, bookmarkPost, editPost, deletePost } = useData();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Требуется авторизация</h2>
          <p className="text-gray-600">Войдите в систему, чтобы просматривать записи</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <PostsFeed
          posts={posts}
          currentUserId={user.id}
          currentUserName={user.name}
          currentUserAvatar={user.avatar}
          onCreatePost={createPost}
          onReaction={addReaction}
          onComment={addComment}
          onShare={sharePost}
          onBookmark={bookmarkPost}
          onEdit={editPost}
          onDelete={deletePost}
          title="Лента записей"
          showSearch={true}
          showNotifications={true}
          showTrending={true}
          showBookmarks={true}
        />
      </div>
    </div>
  );
};

export default PostsPage; 