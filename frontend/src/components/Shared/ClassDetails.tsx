import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  User,
  ClipboardList,
  FileText,
  Target,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Save,
  Upload,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SERVER_URL } from '../../config';

interface ClassDetailsProps {
  classData: any;
  onClose: () => void;
  userRole: 'teacher' | 'student';
}

interface ClassContent {
  board: any[];
  materials: any[];
  homework: any[];
  studyPlan: any[];
}

type ActiveTab = 'board' | 'materials' | 'homework' | 'studyPlan';

const ClassDetails: React.FC<ClassDetailsProps> = ({ classData, onClose, userRole }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('board');
  const [content, setContent] = useState<ClassContent>({
    board: [],
    materials: [],
    homework: [],
    studyPlan: []
  });
  const [loading, setLoading] = useState(false);

  // Загрузка контента класса
  useEffect(() => {
    if (classData) {
      loadClassContent();
    }
  }, [classData]);

  const loadClassContent = async () => {
    setLoading(true);
    try {
      // Здесь будут API вызовы для загрузки контента
      // Пока используем заглушки
      setContent({
        board: [],
        materials: [],
        homework: [],
        studyPlan: []
      });
    } catch (error) {
      console.error('Error loading class content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActiveButtonClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500 text-white shadow-md';
      case 'green': return 'bg-green-500 text-white shadow-md';
      case 'orange': return 'bg-orange-500 text-white shadow-md';
      case 'purple': return 'bg-purple-500 text-white shadow-md';
      default: return 'bg-blue-500 text-white shadow-md';
    }
  };

  const getInactiveIconBgClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100';
      case 'green': return 'bg-green-100';
      case 'orange': return 'bg-orange-100';
      case 'purple': return 'bg-purple-100';
      default: return 'bg-blue-100';
    }
  };

  const getInactiveIconClass = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'orange': return 'text-orange-600';
      case 'purple': return 'text-purple-600';
      default: return 'text-blue-600';
    }
  };

  const tabConfig = [
    {
      id: 'board' as ActiveTab,
      label: 'Доска занятий',
      icon: MessageSquare,
      color: 'blue',
      description: 'Объявления и обсуждения'
    },
    {
      id: 'materials' as ActiveTab,
      label: 'Материалы',
      icon: FileText,
      color: 'green',
      description: 'Учебные материалы и файлы'
    },
    {
      id: 'homework' as ActiveTab,
      label: 'Домашнее задание',
      icon: ClipboardList,
      color: 'orange',
      description: 'Задания и их проверка'
    },
    {
      id: 'studyPlan' as ActiveTab,
      label: 'План обучения',
      icon: Target,
      color: 'purple',
      description: 'Программа и прогресс'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'board':
        return <ClassBoard classId={classData.id} userRole={userRole} content={content.board} />;
      case 'materials':
        return <ClassMaterials classId={classData.id} userRole={userRole} content={content.materials} />;
      case 'homework':
        return <ClassHomework classId={classData.id} userRole={userRole} content={content.homework} />;
      case 'studyPlan':
        return <ClassStudyPlan classId={classData.id} userRole={userRole} content={content.studyPlan} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="w-full h-screen flex overflow-hidden">
        
        {/* Заголовок класса */}
        <div className="w-full flex flex-col">
          <div 
            className="p-6 text-white relative overflow-hidden"
            style={{ backgroundColor: classData.color }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-2xl font-bold">{classData.name}</h1>
                  <div className="flex items-center space-x-1 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">{classData.students?.length || 0}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-white text-opacity-90">
                  {classData.subject && (
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-sm">{classData.subject}</span>
                    </div>
                  )}
                  {classData.grade && (
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span className="text-sm">{classData.grade}</span>
                    </div>
                  )}
                  {classData.teacherName && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{classData.teacherName}</span>
                    </div>
                  )}
                </div>
                {classData.description && (
                  <p className="mt-2 text-white text-opacity-80 text-sm">{classData.description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Назад</span>
              </button>
            </div>
          </div>

          {/* Основной контент */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* Боковая панель с вкладками */}
            <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Функции класса</h3>
                <div className="space-y-2">
                  {tabConfig.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-200 ${
                          isActive
                            ? getActiveButtonClass(tab.color)
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          isActive 
                            ? 'bg-white bg-opacity-20' 
                            : getInactiveIconBgClass(tab.color)
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            isActive 
                              ? 'text-white' 
                              : getInactiveIconClass(tab.color)
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{tab.label}</div>
                          <div className={`text-xs ${
                            isActive ? 'text-white text-opacity-80' : 'text-gray-500'
                          }`}>
                            {tab.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Основная область контента */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка контента...</p>
                  </div>
                </div>
              ) : (
                renderTabContent()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент доски занятий
const ClassBoard: React.FC<{ classId: string; userRole: 'teacher' | 'student'; content: any[] }> = ({ 
  classId, userRole, content 
}) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Доска занятий</h2>
          <p className="text-sm text-gray-600">Объявления и обсуждения класса</p>
        </div>
        {userRole === 'teacher' && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Новое объявление</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Пока нет объявлений</h3>
            <p className="text-sm text-gray-600">
              {userRole === 'teacher' 
                ? 'Создайте первое объявление для класса'
                : 'Объявления от преподавателя появятся здесь'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4">
                {/* Контент постов */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно создания объявления */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Новое объявление</h3>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Напишите объявление..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  // Логика создания поста
                  setIsCreating(false);
                  setNewPost('');
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Опубликовать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент материалов
const ClassMaterials: React.FC<{ classId: string; userRole: 'teacher' | 'student'; content: any[] }> = ({ 
  classId, userRole, content 
}) => {
  const [materials, setMaterials] = useState<any[]>([]);

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Материалы</h2>
          <p className="text-sm text-gray-600">Учебные материалы и файлы</p>
        </div>
        {userRole === 'teacher' && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            <Upload className="h-4 w-4" />
            <span>Загрузить материал</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Пока нет материалов</h3>
          <p className="text-sm text-gray-600">
            {userRole === 'teacher' 
              ? 'Загрузите первый материал для класса'
              : 'Материалы от преподавателя появятся здесь'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

// Компонент домашних заданий
const ClassHomework: React.FC<{ classId: string; userRole: 'teacher' | 'student'; content: any[] }> = ({ 
  classId, userRole, content 
}) => {
  const [homework, setHomework] = useState<any[]>([]);

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Домашнее задание</h2>
          <p className="text-sm text-gray-600">Задания и их проверка</p>
        </div>
        {userRole === 'teacher' && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Новое задание</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Пока нет заданий</h3>
          <p className="text-sm text-gray-600">
            {userRole === 'teacher' 
              ? 'Создайте первое задание для класса'
              : 'Домашние задания появятся здесь'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

// Компонент плана обучения
const ClassStudyPlan: React.FC<{ classId: string; userRole: 'teacher' | 'student'; content: any[] }> = ({ 
  classId, userRole, content 
}) => {
  const [studyPlan, setStudyPlan] = useState<any[]>([]);

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">План обучения</h2>
          <p className="text-sm text-gray-600">Программа и прогресс обучения</p>
        </div>
        {userRole === 'teacher' && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Добавить тему</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">План обучения пуст</h3>
          <p className="text-sm text-gray-600">
            {userRole === 'teacher' 
              ? 'Создайте план обучения для класса'
              : 'План обучения будет доступен после создания преподавателем'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;
