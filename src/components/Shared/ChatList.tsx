import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, MoreHorizontal, Trash2, Archive, Eye, X, Search, Filter, User, Clock, Check, CheckCheck } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Chat } from '../../types';

const ChatList: React.FC = () => {
  const { chats, sendMessage, markChatAsRead, deleteChat, archiveChat, clearChatMessages } = useData();
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'archived'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автоматическая прокрутка к последнему сообщению
  useEffect(() => {
    if (selectedChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat]);

  // Отметка чата как прочитанного при выборе
  useEffect(() => {
    if (selectedChat && user) {
      const unreadMessages = selectedChat.messages.filter(msg => 
        !msg.isRead && msg.senderId !== user.id
      );
      if (unreadMessages.length > 0) {
        markChatAsRead(selectedChat.id);
      }
    }
  }, [selectedChat, user, markChatAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;
    
    setIsSubmitting(true);
    try {
      await sendMessage(selectedChat.id, user.id, user.name, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.participantNames.some(name => 
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filterStatus === 'unread') {
      return matchesSearch && chat.messages.some(msg => !msg.isRead && msg.senderId !== user?.id);
    } else if (filterStatus === 'archived') {
      return matchesSearch && chat.archived;
    }
    
    return matchesSearch && !chat.archived;
  });

  const getUnreadCount = (chat: Chat) => {
    if (!user) return 0;
    return chat.messages.filter(msg => !msg.isRead && msg.senderId !== user.id).length;
  };

  const getLastMessage = (chat: Chat) => {
    if (chat.messages.length === 0) return 'Нет сообщений';
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.content.length > 50 
      ? lastMsg.content.substring(0, 50) + '...' 
      : lastMsg.content;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Только что';
    if (diffInHours < 24) return `${diffInHours}ч назад`;
    if (diffInHours < 48) return 'Вчера';
    return date.toLocaleDateString('ru-RU');
  };

  if (!user) return null;

  return (
    <div className="h-full bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
      <div className="flex h-full">
        {/* Список чатов */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50/50">
          {/* Заголовок и поиск */}
          <div className="p-6 border-b border-gray-200 bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Чаты</h2>
            
            {/* Поиск */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск чатов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Фильтры */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
              >
                <Filter className="h-4 w-4" />
                <span>Фильтры</span>
              </button>
              
              {showFilters && (
                <div className="flex space-x-2">
                  {(['all', 'unread', 'archived'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 ${
                        filterStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {status === 'all' ? 'Все' : status === 'unread' ? 'Непрочитанные' : 'Архив'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Список чатов */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Чаты не найдены</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const unreadCount = getUnreadCount(chat);
                const isSelected = selectedChat?.id === chat.id;
                
                return (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-white/80 ${
                      isSelected ? 'bg-white shadow-sm' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {chat.participantNames.find(name => name !== user.name) || 'Пользователь'}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {chat.messages.length > 0 && formatTime(chat.messages[chat.messages.length - 1].timestamp)}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${
                          unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}>
                          {getLastMessage(chat)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Область чата */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Заголовок чата */}
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedChat.participantNames.find(name => name !== user.name) || 'Пользователь'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedChat.messages.length} сообщений
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => markChatAsRead(selectedChat.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      title="Отметить как прочитанное"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => archiveChat(selectedChat.id)}
                      className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200"
                      title="Архивировать"
                    >
                      <Archive className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => clearChatMessages(selectedChat.id)}
                      className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200"
                      title="Очистить историю"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 lg:hidden"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                {selectedChat.messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>Начните разговор!</p>
                  </div>
                ) : (
                  selectedChat.messages.map((message) => {
                    const isOwnMessage = message.senderId === user.id;
                    const isLastMessage = selectedChat.messages.indexOf(message) === selectedChat.messages.length - 1;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${
                          isOwnMessage ? 'order-2' : 'order-1'
                        }`}>
                          <div className={`p-4 rounded-2xl shadow-sm ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                {message.senderName}
                              </span>
                              <span className={`text-xs ${
                                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            
                            {isOwnMessage && (
                              <div className="flex justify-end mt-2">
                                {message.isRead ? (
                                  <CheckCheck className="h-4 w-4 text-blue-200" />
                                ) : (
                                  <Check className="h-4 w-4 text-blue-200" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Поле ввода */}
              <div className="p-6 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Введите сообщение..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                      rows={1}
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={isSubmitting || !newMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="h-24 w-24 mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">Выберите чат</h3>
                <p>Начните общение с преподавателем или учеником</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;