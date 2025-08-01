import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, className = '' }) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-center space-x-3">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <div className="text-center">
          <p className="text-red-800 font-medium mb-2">Произошла ошибка</p>
          <p className="text-red-600 text-sm mb-4">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mx-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Попробовать снова
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;