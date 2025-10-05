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
            className="p-3 text-white relative overflow-hidden"
            style={{ backgroundColor: classData.color }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-lg font-bold">{classData.name}</h1>
                  <div className="flex items-center space-x-1 bg-white bg-opacity-20 px-1.5 py-0.5 rounded-full">
                    <Users className="h-2.5 w-2.5" />
                    <span className="text-xs font-medium">{classData.students?.length || 0}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-white text-opacity-90">
                  {classData.subject && (
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-3 w-3" />
                      <span className="text-xs">{classData.subject}</span>
                    </div>
                  )}
                  {classData.grade && (
                    <div className="flex items-center space-x-1">
                      <GraduationCap className="h-3 w-3" />
                      <span className="text-xs">{classData.grade}</span>
                    </div>
                  )}
                  {classData.teacherName && (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span className="text-xs">{classData.teacherName}</span>
                    </div>
                  )}
                </div>
                {classData.description && (
                  <p className="mt-1 text-white text-opacity-80 text-xs">{classData.description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium text-sm">Назад</span>
              </button>
            </div>
          </div>

          {/* Основной контент */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* Боковая панель с вкладками */}
            <div className={`${isSidebarCollapsed ? 'w-12' : 'w-64'} border-r border-gray-200 bg-gray-50 flex flex-col transition-all duration-300`}>
              <div className="p-3">
                {!isSidebarCollapsed && (
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Функции класса</h3>
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
                        className={`w-full flex items-center ${shouldShowText ? 'space-x-2' : 'justify-center'} p-2 rounded-lg text-left transition-all duration-200 ${
                          isActive
                            ? getActiveButtonClass(tab.color)
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                        title={isSidebarCollapsed ? tab.label : undefined}
                      >
                        <div className={`p-1.5 rounded-md ${
                          isActive 
                            ? 'bg-white bg-opacity-20' 
                            : getInactiveIconBgClass(tab.color)
                        }`}>
                          <Icon className={`h-3.5 w-3.5 ${
                            isActive 
                              ? 'text-white' 
                              : getInactiveIconClass(tab.color)
                          }`} />
                        </div>
                        {shouldShowText && (
                          <div className="flex-1">
                            <div className="font-medium text-xs">{tab.label}</div>
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
                                className="mt-1 px-2 py-0.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-xs font-medium transition-colors"
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
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  // Преобразование координат окна в систему координат canvas
  const getCanvasCoordinates = (e: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current;
    const vp = viewportRef.current;
    if (!canvas || !vp) return { x: 0, y: 0 };

    const vpRect = vp.getBoundingClientRect();
    const scale = Math.max(0.01, zoom / 100);

    // Базовые CSS‑размеры canvas (до transform), у нас = размеру viewport
    // Базовые CSS‑размеры берём из CSS (чтобы учитывать стратегию, когда
    // мы подгоняем CSS‑ширину/высоту под viewport/scale). Если недоступно —
    // fallback к внутренним размерам canvas.
    const cs = getComputedStyle(canvas);
    const baseCssW = parseFloat(cs.width) || canvas.width;
    const baseCssH = parseFloat(cs.height) || canvas.height;
    // Фактические отображаемые размеры после scale
    const displayW = baseCssW * scale;
    const displayH = baseCssH * scale;

    // Координаты внутри прямоугольника отображаемого canvas (учитываем pan)
    let localX = (e.clientX - vpRect.left) - canvasOffset.x;
    let localY = (e.clientY - vpRect.top) - canvasOffset.y;

    // Если пользователь кликает вне видимого прямоугольника(canvas после scale),
    // координаты попадают в "пустую" область viewport. Клампим их в границы
    // отображаемой области, чтобы рисование продолжалось по всему экрану
    // (вне зависимоти от того, меньше ли displayW/H ширины/высоты viewport).
    // (повтор не нужен — используем ранее вычисленные displayW/displayH)
    localX = Math.max(0, Math.min(localX, displayW));
    localY = Math.max(0, Math.min(localY, displayH));

    // Нормализуем относительно отображаемой области и переводим во внутренние пиксели
    const x = (localX / displayW) * canvas.width;
    const y = (localY / displayH) * canvas.height;

    return { x, y };
  };

  // Инициализация canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Увеличенные размеры canvas для полноэкранного отображения
    const CANVAS_WIDTH = 2400;
    const CANVAS_HEIGHT = 1600;
    
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Начальные CSS размеры под текущий зум выставим ниже в эффекте на zoom
    canvas.style.maxWidth = 'none';
    canvas.style.maxHeight = 'none';

    // Настройки по умолчанию
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;

    console.log('Canvas initialized with fixed dimensions:', CANVAS_WIDTH, 'x', CANVAS_HEIGHT);
    
    // Сохраняем начальное состояние в историю
    saveToHistory();
  }, []);

  // При смене масштаба оставляем canvas в базовом крупном размере,
  // а эффект зума достигается только transform: scale(...).
  // Так визуально доска уменьшается, но реальный холст остаётся большим.
  useEffect(() => {
    const canvas = canvasRef.current;
    const vp = viewportRef.current;
    if (!canvas || !vp) return;
    const scale = Math.max(0.01, zoom / 100);
    // При 25% увеличиваем реальный рисуемый CSS‑размер, чтобы зона ввода
    // покрывала весь viewport после масштабирования.
    const targetCssWidth = Math.max(canvas.width, vp.clientWidth / scale);
    const targetCssHeight = Math.max(canvas.height, vp.clientHeight / scale);
    canvas.style.width = `${targetCssWidth}px`;
    canvas.style.height = `${targetCssHeight}px`;
  }, [zoom]);

  // Функции для работы с историей
  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setHistoryIndex(historyIndex - 1);
      ctx.putImageData(history[historyIndex - 1], 0, 0);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setHistoryIndex(historyIndex + 1);
      ctx.putImageData(history[historyIndex + 1], 0, 0);
    }
  };


  const startDrawing = (e: React.MouseEvent) => {
    if (currentTool === 'hand') return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Координаты считаем относительно viewport с учетом масштаба и смещения
    const { x, y } = getCanvasCoordinates(e);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || currentTool === 'hand') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoordinates(e);

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
    
    // Сохраняем в историю после завершения рисования
    saveToHistory();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  // Функции для панорамирования (инструмент "Рука")
  const startPanning = (e: React.MouseEvent) => {
    if (currentTool === 'hand') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const pan = (e: React.MouseEvent) => {
    if (isPanning && currentTool === 'hand') {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      
      setCanvasOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const stopPanning = () => {
    setIsPanning(false);
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
            <button 
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4 text-gray-600" />
            </button>
            <button 
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
            <button 
              onClick={() => setZoom(100)}
              className="p-2 hover:bg-gray-200 rounded-lg text-xs"
            >
              Сброс
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
          <div ref={viewportRef} className="flex-1 relative overflow-hidden">
            <canvas
              ref={canvasRef}
              className={`w-full h-full ${
                currentTool === 'hand' ? 'cursor-grab' : 
                currentTool === 'pointer' ? 'cursor-pointer' : 
                'cursor-crosshair'
              }`}
              style={{ 
                background: 'white',
                transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom / 100})`,
                transformOrigin: '0 0',
                pointerEvents: 'none'
              }}
            />
            {/* Перехватываем события на оверлее, чтобы хиты работали на любом масштабе */}
            <div
              className="absolute inset-0"
              onMouseDown={(e) => {
                if (currentTool === 'hand') {
                  startPanning(e);
                } else {
                  startDrawing(e);
                }
              }}
              onMouseMove={(e) => {
                if (currentTool === 'hand') {
                  pan(e);
                } else {
                  draw(e);
                }
              }}
              onMouseUp={(e) => {
                if (currentTool === 'hand') {
                  stopPanning();
                } else {
                  stopDrawing();
                }
              }}
              onMouseLeave={(e) => {
                if (currentTool === 'hand') {
                  stopPanning();
                } else {
                  stopDrawing();
                }
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

      {/* Панель настроек кисти - только для кисти */}
      {currentTool === 'pen' && (
        <div className="absolute top-20 left-20 bg-white rounded-lg shadow-lg p-3 border border-gray-200 z-10">
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Размер кисти</label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-xs text-gray-500 ml-2">{brushSize}px</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Цвет</label>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-8 h-6 rounded border border-gray-300"
              />
            </div>
            <button
              onClick={clearCanvas}
              className="w-full px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
            >
              Очистить
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
