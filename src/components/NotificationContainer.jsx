import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <XCircle size={20} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'info':
        return <Info size={20} className="text-blue-500" />;
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-700',
          text: 'text-green-800 dark:text-green-200',
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-700',
          text: 'text-red-800 dark:text-red-200',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-700',
          text: 'text-yellow-800 dark:text-yellow-200',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-700',
          text: 'text-blue-800 dark:text-blue-200',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-800 dark:text-gray-200',
        };
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => {
        const colors = getColors(notification.type);
        
        return (
          <div
            key={notification.id}
            className={`
              ${colors.bg} ${colors.border} ${colors.text}
              border rounded-lg shadow-lg p-4 
              transform transition-all duration-300 ease-in-out
              animate-slide-in-right
              backdrop-blur-sm
            `}
            style={{
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                {notification.title && (
                  <h4 className="font-medium text-sm mb-1">
                    {notification.title}
                  </h4>
                )}
                <p className="text-sm leading-relaxed">
                  {notification.message}
                </p>
                {notification.description && (
                  <p className="text-xs mt-1 opacity-75">
                    {notification.description}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                aria-label="Close notification"
              >
                <X size={16} className="opacity-60 hover:opacity-100" />
              </button>
            </div>
            
            {/* Progress bar for auto-dismiss */}
            {notification.duration && notification.duration > 0 && (
              <div className="mt-3 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-current opacity-30 rounded-full"
                  style={{
                    animation: `shrink ${notification.duration}ms linear forwards`
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationContainer;