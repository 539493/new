import React, { useState } from 'react';
import { MessageCircle, Send, Search, User, BookOpen, MoreHorizontal, Trash2, Archive, Eye, MessageSquare } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

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
  // Вместо useState для profileUser:
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [profilePosts, setProfilePosts] = useState<any[]>([]);
  const { socketRef } = useData();
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showChatMenu, setShowChatMenu] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Новый способ получения профиля по id — из allUsers, если нет — ищем в teacherProfiles/studentProfiles и добавляем
  const getUserProfileById = (userId: string) => {
    // Логирование для отладки
    console.log('[ChatList] getUserProfileById:', userId);
    // @ts-ignore
    console.log('allUsers:', allUsers);
    // @ts-ignore
    console.log('teacherProfiles:', teacherProfiles);
    // @ts-ignore
    console.log('studentProfiles:', studentProfiles);
    let user = allUsers.find((u: any) => u.id === userId);
    if (!user) {
      // @ts-ignore
      const teacher = teacherProfiles ? teacherProfiles[userId] : null;
      if (teacher) {
        user = { id: userId, role: 'teacher', profile: teacher, avatar: teacher.avatar, name: teacher.name || '', email: teacher.email || '', nickname: '' };
      }
      // @ts-ignore
      const student = studentProfiles ? studentProfiles[userId] : null;
      if (!user && student) {
        user = { id: userId, role: 'student', profile: student, avatar: student.avatar, name: student.name || '', email: student.email || '', nickname: '' };
      }
      if (user) {
        // @ts-ignore
        const updatedUsers = [...allUsers, user];
        // @ts-ignore
        setAllUsers(updatedUsers);
        localStorage.setItem('tutoring_users', JSON.stringify(updatedUsers));
        setForceUpdate(f => f + 1); // Принудительный ререндер
        console.log('[ChatList] User added to allUsers:', user);
      }
    }
    return user || null;
  };

  // Автоматическая подгрузка постов
  React.useEffect(() => {
    if (!profileUserId) return;
    function updatePosts() {
      const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
      const u = users.find((u: any) => u.id === profileUserId);
      setProfilePosts(u?.posts || []);
    }
    updatePosts();
    window.addEventListener('storage', updatePosts);
    return () => window.removeEventListener('storage', updatePosts);
  }, [profileUserId]);

  // Добавляю логирование входящих заявок и сообщений
  React.useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current.on('newOverbookingRequest', (request: any) => {
      console.log('[CHAT][SOCKET] newOverbookingRequest received:', request);
    });
    socketRef.current.on('overbookingRequests', (requests: any[]) => {
      console.log('[CHAT][SOCKET] overbookingRequests received:', requests);
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.off('newOverbookingRequest');
        socketRef.current.off('overbookingRequests');
      }
    };
  }, [socketRef]);

  const userChats = chats.filter(chat => chat.participants.includes(user?.id || ''));
  
  const filteredChats = userChats.filter(chat => {
    // Исключаем архивированные чаты
    if (chat.archived) return false;
    
    const otherParticipantName = chat.participantNames.find(name => 
      name !== user?.name
    );
    return otherParticipantName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedChat = selectedChatId 
    ? chats.find(chat => chat.id === selectedChatId)
    : null;

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChatId || !user) return;

    sendMessage(selectedChatId, user.id, user.name, newMessage.trim());
    setNewMessage('');
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getOtherParticipantName = (chat: any): string => {
    return chat.participantNames.find((name: string) => {
      const n: string = name;
      return n !== user?.name;
    }) || 'Неизвестный пользователь';
  };

  const getOtherParticipantId = (chat: any) => {
    return chat.participants.find((id: string) => id !== user?.id) || '';
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'HH:mm', { locale: ru });
    } catch {
      return '';
    }
  };

  const handleDeleteChat = (chatId: string) => {
    console.log('DEBUG: handleDeleteChat called with chatId:', chatId);
    if (confirm('Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.')) {
      console.log('DEBUG: User confirmed delete, calling deleteChat');
      deleteChat(chatId);
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
      setShowChatMenu(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleMarkAsRead = (chatId: string) => {
    console.log('DEBUG: handleMarkAsRead called with chatId:', chatId);
    markChatAsRead(chatId);
    setShowChatMenu(null);
  };

  const handleClearMessages = (chatId: string) => {
    console.log('DEBUG: handleClearMessages called with chatId:', chatId);
    if (confirm('Вы уверены, что хотите очистить все сообщения в этом чате?')) {
      console.log('DEBUG: User confirmed clear, calling clearChatMessages');
      clearChatMessages(chatId);
      setShowChatMenu(null);
    }
  };

  const handleArchiveChat = (chatId: string) => {
    console.log('DEBUG: handleArchiveChat called with chatId:', chatId);
    archiveChat(chatId);
    setShowChatMenu(null);
  };

  // Закрытие меню при клике вне его
  React.useEffect(() => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои чаты</h1>
        <p className="text-gray-600">Общайтесь с преподавателями и учениками</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="flex h-full">
          {/* Chat List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск чатов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`relative w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                      selectedChatId === chat.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <button
                      onClick={() => setSelectedChatId(chat.id)}
                      className="w-full"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 cursor-pointer" onClick={(e) => {
                          e.stopPropagation();
                          const otherId = getOtherParticipantId(chat);
                          setProfileUserId(otherId);
                          setShowProfileModal(true);
                        }}>
                          {(() => {
                            const otherId = getOtherParticipantId(chat);
                            const profile = getUserProfileById(otherId);
                            if (profile?.avatar) {
                              return <img src={profile.avatar} alt="avatar" className="h-10 w-10 rounded-full object-cover" />;
                            }
                            return (
                              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {getOtherParticipantName(chat).charAt(0).toUpperCase()}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getOtherParticipantName(chat)}
                          </p>
                          {chat.lastMessage && (
                            <p className="text-sm text-gray-500 truncate">
                              {chat.lastMessage.content}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {chat.lastMessage && (
                            <div className="text-xs text-gray-400">
                              {formatMessageTime(chat.lastMessage.timestamp)}
                            </div>
                          )}
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
                      </div>
                    </button>
                    
                    {/* Контекстное меню чата */}
                    {showChatMenu === chat.id && (
                      <div className="absolute right-2 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('DEBUG: Mark as read button clicked for chat:', chat.id);
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
                            console.log('DEBUG: Clear messages button clicked for chat:', chat.id);
                            handleClearMessages(chat.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Очистить сообщения</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('DEBUG: Archive chat button clicked for chat:', chat.id);
                            handleArchiveChat(chat.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Archive className="w-4 h-4" />
                          <span>Архивировать</span>
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('DEBUG: Delete chat button clicked for chat:', chat.id);
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
                ))
              ) : (
                <div className="p-8 text-center">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Нет чатов</h3>
                  <p className="text-gray-600">
                    Чаты появятся после бронирования уроков
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center cursor-pointer overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500" onClick={() => {
                      const otherId = getOtherParticipantId(selectedChat);
                      setProfileUserId(otherId);
                      setShowProfileModal(true);
                    }}>
                      {(() => {
                        const otherId = getOtherParticipantId(selectedChat);
                        const profile = getUserProfileById(otherId);
                        if (profile?.avatar) {
                          return <img src={profile.avatar} alt="avatar" className="h-10 w-10 rounded-full object-cover" />;
                        }
                        return (
                          <span className="text-white text-sm font-medium">
                            {getOtherParticipantName(selectedChat).charAt(0).toUpperCase()}
                          </span>
                        );
                      })()}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {getOtherParticipantName(selectedChat)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {user?.role === 'student' ? 'Преподаватель' : 'Ученик'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedChat.messages.length > 0 ? (
                    selectedChat.messages.map((message: any) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === user?.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-600">Начните общение</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Введите сообщение..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Выберите чат</h3>
                  <p className="text-gray-600">
                    Выберите чат из списка, чтобы начать общение
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Модальное окно с полной страницей пользователя (преподавателя или ученика): */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={() => setShowProfileModal(false)} title="Закрыть">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {(() => {
              const profileUser = profileUserId ? getUserProfileById(profileUserId) : null;
              const profile = profileUser?.profile || {};
              // Карта: ключ -> { label, icon }
              const fieldMap: { key: string; label: string; icon: React.ReactNode }[] = [
                { key: 'bio', label: 'О себе', icon: <User className="inline-block w-5 h-5 mr-2 text-blue-500" /> },
                { key: 'country', label: 'Страна', icon: <span className="inline-block w-5 h-5 mr-2">🌍</span> },
                { key: 'city', label: 'Город', icon: <span className="inline-block w-5 h-5 mr-2">🏙️</span> },
                { key: 'experience', label: 'Опыт', icon: <span className="inline-block w-5 h-5 mr-2">🎓</span> },
                { key: 'rating', label: 'Рейтинг', icon: <span className="inline-block w-5 h-5 mr-2">⭐</span> },
                { key: 'hourlyRate', label: 'Цена за час', icon: <span className="inline-block w-5 h-5 mr-2">💸</span> },
                { key: 'subjects', label: 'Предметы', icon: <span className="inline-block w-5 h-5 mr-2">📚</span> },
                { key: 'grades', label: 'Классы', icon: <span className="inline-block w-5 h-5 mr-2">🏫</span> },
                { key: 'format', label: 'Формат', icon: <span className="inline-block w-5 h-5 mr-2">💻</span> },
                { key: 'duration', label: 'Длительность', icon: <span className="inline-block w-5 h-5 mr-2">⏱️</span> },
                { key: 'comment', label: 'Комментарий', icon: <span className="inline-block w-5 h-5 mr-2">💬</span> },
                { key: 'status', label: 'Статус', icon: <span className="inline-block w-5 h-5 mr-2">📋</span> },
              ];
              // Статистика для ученика
              let studentLessonsCount = 0;
              let uniqueTeachersCount = 0;
              if (profileUser && profileUser.role === 'student' && Array.isArray(lessons)) {
                const studentLessons = lessons.filter((l: any) => l.studentId === profileUser.id);
                studentLessonsCount = studentLessons.length;
                uniqueTeachersCount = Array.from(new Set(studentLessons.map((l: any) => l.teacherId))).length;
              }
              return (
                <>
                  {profileUser && (
            <div className="flex flex-col items-center mb-6">
              {profileUser.avatar ? (
                <img src={profileUser.avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover mb-2" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center mb-2">
                  <User className="h-12 w-12 text-white" />
                </div>
              )}
                      <h2 className="text-2xl font-bold text-gray-900">{profileUser.name || '—'}</h2>
                      <div className="text-gray-500">{profileUser.email || '—'}</div>
                      {/* Статистика для ученика */}
                      {profileUser.role === 'student' && (
                        <div className="flex gap-4 mt-4">
                          <div className="text-center">
                            <div className="text-base font-bold text-gray-900 flex items-center justify-center gap-1">
                              <BookOpen className="w-5 h-5 text-blue-500 mr-1" />
                              {studentLessonsCount}
                            </div>
                            <div className="text-xs text-gray-500">Пройдено уроков</div>
                          </div>
                          <div className="text-center">
                            <div className="text-base font-bold text-gray-900 flex items-center justify-center gap-1">
                              <User className="w-5 h-5 text-green-500 mr-1" />
                              {uniqueTeachersCount}
                            </div>
                            <div className="text-xs text-gray-500">Учителей</div>
                          </div>
                        </div>
                      )}
            </div>
                  )}
                  {/* Карточки профиля */}
                  <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fieldMap.map(({ key, label, icon }) => {
                      const value = profile[key];
                      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) return null;
              return (
                        <div key={key} className="flex items-start bg-gray-50 rounded-lg p-4 shadow-sm">
                          <div className="mt-1">{icon}</div>
                          <div>
                            <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
                            {Array.isArray(value) ? (
                              <div className="flex flex-wrap gap-1">
                                {value.map((v: string, i: number) => (
                                  <span key={i} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs mr-1 mb-1">{v}</span>
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-900 text-sm break-all">{String(value)}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
                </>
              );
            })()}
            {(() => {
              const profileUser = profileUserId ? getUserProfileById(profileUserId) : null;
              return (
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">Записи пользователя</h3>
              {profilePosts.length === 0 ? (
                <div className="text-gray-400 text-sm">Пока нет записей</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {profilePosts.map(post => (
                    <div key={post.id} className="bg-gray-50 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                            {profileUser?.avatar ? (
                          <img src={profileUser.avatar} alt="avatar" className="h-7 w-7 rounded-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-gray-400" />
                        )}
                            <span className="font-medium text-gray-900 text-sm">{profileUser?.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{post.date}</span>
                      </div>
                      <div className="text-gray-800 text-sm whitespace-pre-line">{post.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;