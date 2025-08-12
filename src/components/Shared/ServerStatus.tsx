import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const ServerStatus: React.FC = () => {
  const { isConnected } = useData();
  const [isVisible, setIsVisible] = useState(false);
  const [lastStatus, setLastStatus] = useState<boolean | null>(null);

  useEffect(() => {
    // Показываем статус только при изменении состояния соединения
    if (lastStatus !== null && lastStatus !== isConnected) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
    setLastStatus(isConnected);
  }, [isConnected, lastStatus]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-20 right-4 z-50 transition-all duration-500 ease-out ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
    }`}>
      <div className={`flex items-center space-x-3 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 ${
        isConnected
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <CheckCircle className="h-5 w-5 text-green-600 animate-pulse" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 animate-pulse" />
          )}
          <span className="font-medium">
            {isConnected ? 'Соединение установлено' : 'Соединение потеряно'}
          </span>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ServerStatus; 