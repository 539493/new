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
  Plus,
  X
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
    sendMessageToUser,
    allUsers, 
    setAllUsers, 
    teacherProfiles, 
    studentProfiles, 
    lessons,
    deleteChat,
    markChatAsRead,
    clearChatMessages,
    archiveChat,
    unarchiveChat,
    getOrCreateChat,
    loadChatsFromServer
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
  const [showArchivedChats, setShowArchivedChats] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatMessage, setNewChatMessage] = useState('');
  
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

  // Загружаем чаты при монтировании компонента
  useEffect(() => {
    if (user) {
      console.log('ChatList: Loading chats for user:', user.id);
      loadChatsFromServer();
    }
  }, [user, loadChatsFromServer]);

  // Автоматически выбираем чат, если он был только что создан
  useEffect(() => {
    if (chats.length > 0 && !selectedChatId) {
      // Если есть чаты, но ни один не выбран, выбираем первый
      const firstChat = chats.find(chat => 
        chat.participants.includes(user?.id || '') && !chat.archived
      );
      if (firstChat) {
        setSelectedChatId(firstChat.id);
      }
    }
  }, [chats, selectedChatId, user]);

  // Автоматически отмечаем сообщения как прочитанные при открытии чата
  useEffect(() => {
    if (selectedChatId && user) {
      const chat = chats.find(c => c.id === selectedChatId);
      if (chat) {
        const hasUnreadMessages = chat.messages?.some((msg: any) => 
          msg.senderId !== user.id && !msg.isRead
        );
        if (hasUnreadMessages) {
          markChatAsRead(selectedChatId);
        }
      }
    }
  }, [selectedChatId, chats, user, markChatAsRead]);

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
  
  console.log('🔍 ChatList DEBUG INFO:');
  console.log('- Current user:', { id: user?.id, name: user?.name, role: user?.role });
  console.log('- All chats count:', chats.length);
  console.log('- User chats count:', userChats.length);
  
  // Показываем детальную информацию о каждом чате
  if (chats.length > 0) {
    console.log('- All chats details:');
    chats.forEach((chat, index) => {
      console.log(`  Chat ${index + 1}:`, {
        id: chat.id,
        participants: chat.participants,
        participantNames: chat.participantNames,
        includesUser: chat.participants.includes(user?.id || ''),
        messagesCount: chat.messages?.length || 0
      });
    });
  }
  
  const filteredChats = userChats.filter(chat => {
    // Показываем архивированные чаты только если включен соответствующий флаг
    if (chat.archived && !showArchivedChats) return false;
    if (!chat.archived && showArchivedChats) return false;
    
    const otherParticipantName = chat.participantNames.find(name => 
      name !== user?.name
    );
    return otherParticipantName?.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  console.log('- Filtered chats count:', filteredChats.length);
  console.log('🔍 END DEBUG INFO');

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

  // Отправка сообщения новому пользователю
  const handleSendMessageToUser = (receiverId: string, receiverName: string) => {
    if (!newChatMessage.trim() || !user) return;

    console.log('🔍 ChatList handleSendMessageToUser DEBUG:');
    console.log('- Sender:', { id: user.id, name: user.name });
    console.log('- Receiver:', { id: receiverId, name: receiverName });
    console.log('- Message:', newChatMessage.trim());

    // Отправляем сообщение пользователю (автоматически создается чат)
    const chatId = sendMessageToUser(
      user.id,
      user.name,
      receiverId,
      receiverName,
      newChatMessage.trim()
    );

    console.log('- Chat created/opened with ID:', chatId);

    // Выбираем созданный чат
    setSelectedChatId(chatId);
    
    // Очищаем форму и закрываем модальное окно
    setNewChatMessage('');
    setShowNewChatModal(false);
    
    console.log('🔍 END ChatList handleSendMessageToUser DEBUG');
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
    console.log('handleDeleteChat called with chatId:', chatId);
    console.log('Current chats in component:', chats.length);
    
    const chat = chats.find(c => c.id === chatId);
    const otherParticipantName = chat ? getOtherParticipantName(chat) : 'пользователем';
    
    if (confirm(`Вы уверены, что хотите удалить чат с ${otherParticipantName}? Это действие нельзя отменить.`)) {
      try {
        console.log('User confirmed deletion. Deleting chat:', chatId);
        deleteChat(chatId);
        
        // Принудительно снимаем выделение с удаляемого чата
        if (selectedChatId === chatId) {
          console.log('Removing selection from deleted chat');
          setSelectedChatId(null);
        }
        
        // Закрываем меню
        setShowChatMenu(null);
        setShowDeleteConfirm(null);
        
        // Принудительно обновляем состояние через небольшую задержку
        setTimeout(() => {
          console.log('Forcing state update after chat deletion');
          // Это заставит компонент перерендериться
          setShowChatMenu(null);
        }, 100);
        
        console.log('Chat deletion process completed');
      } catch (error) {
        console.error('Error deleting chat:', error);
        alert('Ошибка при удалении чата. Попробуйте еще раз.');
      }
    } else {
      console.log('User cancelled chat deletion');
    }
  };

  const handleMarkAsRead = (chatId: string) => {
    console.log('handleMarkAsRead called with chatId:', chatId);
    try {
      markChatAsRead(chatId);
      setShowChatMenu(null);
      console.log('Chat marked as read successfully');
    } catch (error) {
      console.error('Error marking chat as read:', error);
      alert('Ошибка при отметке чата как прочитанного.');
    }
  };

  const handleClearMessages = (chatId: string) => {
    console.log('handleClearMessages called with chatId:', chatId);
    const chat = chats.find(c => c.id === chatId);
    const messageCount = chat?.messages?.length || 0;
    
    if (messageCount === 0) {
      alert('В этом чате нет сообщений для очистки.');
      setShowChatMenu(null);
      return;
    }
    
    if (confirm(`Вы уверены, что хотите очистить все ${messageCount} сообщений в этом чате? Это действие нельзя отменить.`)) {
      try {
        console.log('Clearing messages for chat:', chatId);
        clearChatMessages(chatId);
        setShowChatMenu(null);
        console.log('Messages cleared successfully');
      } catch (error) {
        console.error('Error clearing messages:', error);
        alert('Ошибка при очистке сообщений.');
      }
    }
  };

  const handleArchiveChat = (chatId: string) => {
    console.log('handleArchiveChat called with chatId:', chatId);
    try {
      archiveChat(chatId);
      setShowChatMenu(null);
      // Если архивируем выбранный чат, снимаем выделение
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
      console.log('Chat archived successfully');
    } catch (error) {
      console.error('Error archiving chat:', error);
      alert('Ошибка при архивировании чата.');
    }
  };

  const handleUnarchiveChat = (chatId: string) => {
    console.log('handleUnarchiveChat called with chatId:', chatId);
    try {
      unarchiveChat(chatId);
      setShowChatMenu(null);
      console.log('Chat unarchived successfully');
    } catch (error) {
      console.error('Error unarchiving chat:', error);
      alert('Ошибка при восстановлении чата.');
    }
  };

  const handleCreateNewChat = () => {
    // Здесь можно добавить логику для создания нового чата
    // Например, открыть модальное окно для выбора пользователя
    alert('Функция создания нового чата будет добавлена в следующем обновлении.');
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

  const handleShowProfile = (chatId: string) => {
    console.log('handleShowProfile called with chatId:', chatId);
    try {
      const chat = chats.find(c => c.id === chatId);
      console.log('Found chat:', chat);
      if (chat) {
        const otherId = getOtherParticipantId(chat);
        console.log('Other participant ID:', otherId);
        if (otherId) {
          setProfileUserId(otherId);
          setShowProfileModal(true);
          console.log('Profile modal opened for user:', otherId);
        } else {
          alert('Не удалось определить пользователя для показа профиля.');
        }
      } else {
        alert('Чат не найден.');
      }
      setShowChatMenu(null);
    } catch (error) {
      console.error('Error showing profile:', error);
      alert('Ошибка при открытии профиля пользователя.');
      setShowChatMenu(null);
    }
  };

  const handleMarkAllAsRead = () => {
    const unreadChats = chats.filter(chat => 
      chat.participants.includes(user?.id || '') && 
      !chat.archived &&
      chat.messages?.some((msg: any) => 
        msg.senderId !== user?.id && !msg.isRead
      )
    );
    
    unreadChats.forEach(chat => {
      markChatAsRead(chat.id);
    });
  };

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const isMenuButton = target.closest('button[onClick*="setShowChatMenu"]');
      const isMenuContent = target.closest('.chat-menu');
      
      if (showChatMenu && !isMenuButton && !isMenuContent) {
        console.log('Click outside menu detected, closing menu');
        setShowChatMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChatMenu]);

  // Подсчет непрочитанных сообщений
  const getUnreadCount = () => {
    return chats.filter(chat => 
      chat.participants.includes(user?.id || '') && 
      !chat.archived &&
      chat.messages?.some((msg: any) => 
        msg.senderId !== user?.id && !msg.isRead
      )
    ).length;
  };

  const unreadCount = getUnreadCount();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">МОИ ЧАТЫ</h1>
            <p className="text-gray-600 text-sm">
              {unreadCount > 0 
                ? `${unreadCount} непрочитанных сообщений` 
                : 'Общайтесь с преподавателями и учениками'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                Отметить все как прочитанные
              </button>
            )}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowArchivedChats(!showArchivedChats)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                showArchivedChats 
                  ? 'bg-gray-200 text-gray-700' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {showArchivedChats ? 'Активные' : 'Архив'}
            </button>
            <button 
              onClick={handleCreateNewChat}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Создать новый чат"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Chat List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Search and New Chat */}
          <div className="p-4 border-b border-gray-200 space-y-3 flex-shrink-0">
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
            <button
              onClick={() => setShowNewChatModal(true)}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Новый чат</span>
            </button>
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
                    className={`relative p-4 hover:bg-gray-50 cursor-pointer transition-colors chat-menu ${
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
                            {chat.archived && (
                              <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                Архив
                              </span>
                            )}
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
                          console.log('Menu button clicked for chat:', chat.id);
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
                      <div className="absolute right-2 top-12 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 min-w-[180px]">
                        <button
                          onClick={(e) => {
                            console.log('Profile button clicked for chat:', chat.id);
                            e.preventDefault();
                            e.stopPropagation();
                            handleShowProfile(chat.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>Профиль</span>
                        </button>
                        <button
                          onClick={(e) => {
                            console.log('Mark as read button clicked for chat:', chat.id);
                            e.preventDefault();
                            e.stopPropagation();
                            handleMarkAsRead(chat.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Отметить как прочитанное</span>
                        </button>
                        <button
                          onClick={(e) => {
                            console.log('Archive button clicked for chat:', chat.id);
                            e.preventDefault();
                            e.stopPropagation();
                            handleArchiveChat(chat.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                        >
                          <Archive className="w-4 h-4" />
                          <span>Архивировать</span>
                        </button>
                        {chat.archived && (
                          <button
                            onClick={(e) => {
                              console.log('Unarchive button clicked for chat:', chat.id);
                              e.preventDefault();
                              e.stopPropagation();
                              handleUnarchiveChat(chat.id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                            <span>Восстановить</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            console.log('Clear messages button clicked for chat:', chat.id);
                            e.preventDefault();
                            e.stopPropagation();
                            handleClearMessages(chat.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Очистить сообщения</span>
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={(e) => {
                            console.log('Delete chat button clicked for chat:', chat.id);
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteChat(chat.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
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
        <div className="flex-1 flex flex-col bg-white min-h-0">
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
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
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
              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
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
              
              {(() => {
                const profile = getUserProfileById(profileUserId);
                if (!profile) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Профиль пользователя не найден</p>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-6">
                    {/* Avatar and basic info */}
                    <div className="flex items-center space-x-4">
                      {profile.avatar ? (
                        <img 
                          src={profile.avatar} 
                          alt="avatar" 
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-lg">
                            {profile.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">{profile.name || 'Неизвестный пользователь'}</h3>
                        <p className="text-gray-500">{profile.role === 'teacher' ? 'Преподаватель' : 'Ученик'}</p>
                        {profile.email && (
                          <p className="text-sm text-gray-400">{profile.email}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Profile details */}
                    {profile.profile && (
                      <div className="space-y-4">
                        {profile.profile.bio && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">О себе</h4>
                            <p className="text-gray-600">{profile.profile.bio}</p>
                          </div>
                        )}
                        
                        {profile.profile.subjects && profile.profile.subjects.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Предметы</h4>
                            <div className="flex flex-wrap gap-2">
                              {profile.profile.subjects.map((subject: string, index: number) => (
                                <span 
                                  key={index}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {profile.profile.experience && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Опыт</h4>
                            <p className="text-gray-600">
                              {profile.profile.experience === 'beginner' && 'Начинающий'}
                              {profile.profile.experience === 'experienced' && 'Опытный'}
                              {profile.profile.experience === 'professional' && 'Профессионал'}
                            </p>
                          </div>
                        )}
                        
                        {profile.profile.city && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Город</h4>
                            <p className="text-gray-600">{profile.profile.city}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="flex space-x-3 pt-4 border-t">
                      <button
                        onClick={() => {
                          setShowProfileModal(false);
                          // Здесь можно добавить логику для начала звонка
                        }}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Позвонить</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileModal(false);
                          // Здесь можно добавить логику для видео звонка
                        }}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Video className="w-4 h-4" />
                        <span>Видео</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Новый чат</h2>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Message Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сообщение
                </label>
                <textarea
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Введите ваше сообщение..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* User List */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Выберите получателя
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
                  {allUsers
                    .filter(u => u.id !== user?.id)
                    .map((userItem) => (
                      <button
                        key={userItem.id}
                        onClick={() => handleSendMessageToUser(userItem.id, userItem.name)}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {userItem.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{userItem.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{userItem.role === 'teacher' ? 'Преподаватель' : 'Ученик'}</div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;