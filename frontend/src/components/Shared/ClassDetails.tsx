import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ArrowLeft,
  MousePointer,
  Hand,
  Type,
  Square,
  ArrowRight,
  Pen,
  Eraser,
  Image,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Settings,
  Phone,
  ChevronUp
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
  const [activeTab, setActiveTab] = useState<ActiveTab | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<ActiveTab | null>(null);
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

  const handleTabClick = (tabId: ActiveTab) => {
    if (activeTab === tabId) {
      // Если кликнули на активную вкладку - закрываем её
      setActiveTab(null);
      setIsSidebarCollapsed(false);
    } else {
      // Иначе открываем новую вкладку
      setActiveTab(tabId);
      // Панель остается развернутой при выборе
      setIsSidebarCollapsed(false);
    }
  };

  const handleTabSelect = (tabId: ActiveTab) => {
    // Функция для выбора функции (сворачивает панель)
    setActiveTab(tabId);
    setIsSidebarCollapsed(true);
  };

  const handleTabHover = (tabId: ActiveTab | null) => {
    setHoveredTab(tabId);
  };

  const renderTabContent = () => {
    if (!activeTab) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Выберите функцию класса</h3>
            <p className="text-sm text-gray-600">
              Нажмите на одну из функций слева, чтобы открыть её
            </p>
          </div>
        </div>
      );
    }

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
            <div className={`${isSidebarCollapsed ? 'w-16' : 'w-80'} border-r border-gray-200 bg-gray-50 flex flex-col transition-all duration-300`}>
              <div className="p-4">
                {!isSidebarCollapsed && (
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Функции класса</h3>
                )}
                <div className="space-y-2">
                  {tabConfig.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const isHovered = hoveredTab === tab.id;
                    const shouldShowText = !isSidebarCollapsed || isHovered;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        onMouseEnter={() => handleTabHover(tab.id)}
                        onMouseLeave={() => handleTabHover(null)}
                        className={`w-full flex items-center ${shouldShowText ? 'space-x-3' : 'justify-center'} p-3 rounded-xl text-left transition-all duration-200 ${
                          isActive
                            ? getActiveButtonClass(tab.color)
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                        title={isSidebarCollapsed ? tab.label : undefined}
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
                        {shouldShowText && (
                          <div className="flex-1">
                            <div className="font-medium text-sm">{tab.label}</div>
                            <div className={`text-xs ${
                              isActive ? 'text-white text-opacity-80' : 'text-gray-500'
                            }`}>
                              {tab.description}
                            </div>
                            {isActive && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTabSelect(tab.id);
                                }}
                                className="mt-2 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-xs font-medium transition-colors"
                              >
                                Открыть
                              </button>
                            )}
                          </div>
                        )}
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(2);
  const [brushColor, setBrushColor] = useState('#000000');
  const [zoom, setZoom] = useState(100);
  const [showStudentConnection, setShowStudentConnection] = useState(false);

  // Инициализация canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Устанавливаем размеры canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Настройки по умолчанию
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;

    // Рисуем сетку
    drawGrid(ctx, canvas.width, canvas.height);
  }, []);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'hand') return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentTool === 'hand') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentTool === 'pen') {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
  };

  const tools = [
    { id: 'pointer', icon: MousePointer, label: 'Указатель' },
    { id: 'hand', icon: Hand, label: 'Рука' },
    { id: 'text', icon: Type, label: 'Текст' },
    { id: 'square', icon: Square, label: 'Прямоугольник' },
    { id: 'arrow', icon: ArrowRight, label: 'Стрелка' },
    { id: 'pen', icon: Pen, label: 'Кисть' },
    { id: 'eraser', icon: Eraser, label: 'Ластик' },
    { id: 'image', icon: Image, label: 'Изображение' }
  ];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Верхняя панель */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          {/* Навигация */}
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-200 rounded-lg">
              <div className="w-4 h-4 flex flex-col space-y-1">
                <div className="w-full h-0.5 bg-gray-600"></div>
                <div className="w-full h-0.5 bg-gray-600"></div>
                <div className="w-full h-0.5 bg-gray-600"></div>
              </div>
            </button>
            <button className="p-2 hover:bg-gray-200 rounded-lg">
              <RotateCcw className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-200 rounded-lg">
              <RotateCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Масштаб */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setZoom(Math.max(25, zoom - 25))}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
              {zoom}%
            </span>
            <button 
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Настройки */}
          <button className="p-2 hover:bg-gray-200 rounded-lg relative">
            <Settings className="w-4 h-4 text-gray-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">2</span>
            </div>
          </button>

          {/* Участники */}
          <button className="p-2 hover:bg-gray-200 rounded-lg relative">
            <Users className="w-4 h-4 text-gray-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">🔥</span>
            </div>
          </button>

          {/* Профиль */}
          <button className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-pink-600">M</span>
          </button>

          {/* Закрыть */}
          <button className="p-2 hover:bg-gray-200 rounded-lg">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Левая панель инструментов */}
        <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = currentTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setCurrentTool(tool.id)}
                className={`p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title={tool.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        {/* Основная область canvas */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{ 
                background: 'white',
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
          </div>

          {/* Нижняя панель */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button 
              onClick={() => setShowStudentConnection(!showStudentConnection)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Связь с учениками</span>
              <ChevronUp className={`w-4 h-4 transition-transform ${showStudentConnection ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Панель настроек кисти */}
      {currentTool === 'pen' && (
        <div className="absolute top-20 left-20 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Размер кисти</label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{brushSize}px</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цвет</label>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-full h-8 rounded border border-gray-300"
              />
            </div>
            <button
              onClick={clearCanvas}
              className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Очистить доску
            </button>
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
