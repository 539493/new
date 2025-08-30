import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Search, 
  User, 
  MoreHorizontal, 
  Trash2, 
  Archive, 
  Eye, 
  Phone, 
  Video, 
  Paperclip,
  Smile,
  Mic,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  Star,
  Settings,
  Plus
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import TeacherProfileModal from '../Student/TeacherProfileModal';
import StudentProfileModal from '../Student/StudentProfileModal';

const ChatList: React.FC = () => {
  const { 
    chats, 
    sendMessage, 
    allUsers, 
    setAllUsers, 
    teacherProfiles, 
    studentProfiles, 
    lessons,
    deleteChat,
    markChatAsRead,
    clearChatMessages,
    archiveChat,
    getOrCreateChat
  } = useData();
  const { user } = useAuth();
  
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [profilePosts, setProfilePosts] = useState<any[]>([]);
  const [showChatMenu, setShowChatMenu] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { socketRef } = useData();

  // Автоматическая прокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChatId, chats]);

  // Получение профиля пользователя
  const getUserProfileById = (userId: string): any => {
    let user = allUsers.find((u: any) => u.id === userId);
    if (!user) {
      const teacher = teacherProfiles ? teacherProfiles[userId] : null;
      if (teacher) {
        user = { 
          id: userId, 
          role: 'teacher', 
          profile: teacher, 
          avatar: (teacher.avatar as string) || '', 
          name: (teacher.name as string) || '', 
          email: (teacher.email as string) || '', 
          nickname: '' 
        };
      }
      const student = studentProfiles ? studentProfiles[userId] : null;
      if (!user && student) {
        user = { 
          id: userId, 
          role: 'student', 
          profile: student, 
          avatar: (student.avatar as string) || '', 
          name: (student.name as string) || '', 
          email: (student.email as string) || '', 
          nickname: '' 
        };
      }
      if (user) {
        const updatedUsers = [...allUsers, user];
        setAllUsers(updatedUsers);
        localStorage.setItem('tutoring_users', JSON.stringify(updatedUsers));
      }
    }
    return user || null;
  };

  // Фильтрация чатов
  const userChats = chats.filter(chat => chat.participants.includes(user?.id || ''));
  const filteredChats = userChats.filter(chat => {
    if (chat.archived) return false;
    
    const otherParticipantName = chat.participantNames.find(name => 
      name !== user?.name
    );
    return otherParticipantName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedChat = selectedChatId 
    ? chats.find(chat => chat.id === selectedChatId)
    : null;

  // Отправка сообщения
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChatId || !user) return;

    sendMessage(selectedChatId, user.id, user.name, newMessage.trim());
    setNewMessage('');
    setIsTyping(false);
  };

  // Обработка нажатия Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Получение имени собеседника
  const getOtherParticipantName = (chat: any): string => {
    return chat.participantNames.find((name: string) => name !== user?.name) || 'Неизвестный пользователь';
  };

  const getOtherParticipantId = (chat: any) => {
    return chat.participants.find((id: string) => id !== user?.id) || '';
  };

  // Форматирование времени
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isToday(date)) {
        return format(date, 'HH:mm', { locale: ru });
      } else if (isYesterday(date)) {
        return 'Вчера';
      } else if (isThisWeek(date)) {
        return format(date, 'EEEE', { locale: ru });
      } else {
        return format(date, 'dd.MM.yyyy', { locale: ru });
      }
    } catch {
      return '';
    }
  };

  const formatLastMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isToday(date)) {
        return format(date, 'HH:mm', { locale: ru });
      } else if (isYesterday(date)) {
        return 'Вчера';
      } else {
        return format(date, 'dd.MM', { locale: ru });
      }
    } catch {
      return '';
    }
  };

  // Действия с чатами
  const handleDeleteChat = (chatId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.')) {
      deleteChat(chatId);
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
      setShowChatMenu(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleMarkAsRead = (chatId: string) => {
    markChatAsRead(chatId);
    setShowChatMenu(null);
  };

  const handleClearMessages = (chatId: string) => {
    if (confirm('Вы уверены, что хотите очистить все сообщения в этом чате?')) {
      clearChatMessages(chatId);
      setShowChatMenu(null);
    }
  };

  const handleArchiveChat = (chatId: string) => {
    archiveChat(chatId);
    setShowChatMenu(null);
  };

  // Обработка вложений
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Здесь можно добавить логику загрузки файлов
      console.log('Files to upload:', files);
    }
    setShowAttachmentMenu(false);
  };

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showChatMenu && !(event.target as Element).closest('.chat-menu')) {
        setShowChatMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChatMenu]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Мои чаты</h1>
            <p className="text-gray-600 text-sm">Общайтесь с преподавателями и учениками</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск чатов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                const otherId = getOtherParticipantId(chat);
                const profile = getUserProfileById(otherId);
                const isSelected = selectedChatId === chat.id;
                const hasUnreadMessages = chat.messages?.some((msg: any) => 
                  msg.senderId !== user?.id && !msg.isRead
                );

                return (
                  <div
                    key={chat.id}
                    className={`relative p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedChatId(chat.id)}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="relative">
                        {profile?.avatar ? (
                          <img 
                            src={profile.avatar} 
                            alt="avatar" 
                            className="h-12 w-12 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {getOtherParticipantName(chat).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {hasUnreadMessages && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {chat.messages?.filter((msg: any) => 
                                msg.senderId !== user?.id && !msg.isRead
                              ).length || 0}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {getOtherParticipantName(chat)}
                          </h3>
                          {chat.lastMessage && (
                            <span className="text-xs text-gray-400">
                              {formatLastMessageTime(chat.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        {chat.lastMessage ? (
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {chat.lastMessage.content}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic mt-1">
                            Нет сообщений
                          </p>
                        )}
                      </div>

                      {/* Menu Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowChatMenu(showChatMenu === chat.id ? null : chat.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Context Menu */}
                    {showChatMenu === chat.id && (
                      <div className="absolute right-2 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[180px]">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setProfileUserId(otherId);
                            setShowProfileModal(true);
                            setShowChatMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <User className="w-4 h-4" />
                          <span>Профиль</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMarkAsRead(chat.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Отметить как прочитанное</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleArchiveChat(chat.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Archive className="w-4 h-4" />
                          <span>Архивировать</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleClearMessages(chat.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Очистить сообщения</span>
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteChat(chat.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Удалить чат</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Нет чатов</p>
                <p className="text-sm text-center">Начните общение с преподавателями или учениками</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const otherId = getOtherParticipantId(selectedChat);
                    const profile = getUserProfileById(otherId);
                    return profile?.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt="avatar" 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {getOtherParticipantName(selectedChat).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getOtherParticipantName(selectedChat)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {(() => {
                        const otherId = getOtherParticipantId(selectedChat);
                        const profile = getUserProfileById(otherId);
                        return profile?.role === 'teacher' ? 'Преподаватель' : 'Ученик';
                      })()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      const otherId = getOtherParticipantId(selectedChat);
                      setProfileUserId(otherId);
                      setShowProfileModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {selectedChat.messages && selectedChat.messages.length > 0 ? (
                  selectedChat.messages.map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.senderId === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 shadow-sm'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-end mt-1 space-x-1 ${
                          message.senderId === user?.id ? 'text-blue-100' : 'text-gray-400'
                        }`}>
                          <span className="text-xs">
                            {formatMessageTime(message.timestamp)}
                          </span>
                          {message.senderId === user?.id && (
                            <CheckCheck className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Начните общение</p>
                    <p className="text-sm text-center">Отправьте первое сообщение</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        setIsTyping(e.target.value.length > 0);
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Введите сообщение..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={1}
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                {/* Attachment Menu */}
                {showAttachmentMenu && (
                  <div className="mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm">Файл</span>
                      </button>
                      <button className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <Mic className="w-4 h-4" />
                        <span className="text-sm">Голосовое</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <MessageCircle className="w-24 h-24 mb-6 text-gray-300" />
              <h2 className="text-2xl font-medium mb-2">Выберите чат</h2>
              <p className="text-center">Выберите чат из списка слева, чтобы начать общение</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && profileUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Профиль пользователя</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              {/* Здесь будет содержимое профиля */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;