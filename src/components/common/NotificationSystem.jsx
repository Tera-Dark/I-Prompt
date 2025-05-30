import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  CheckCircle, AlertTriangle, XCircle, Info, X 
} from 'lucide-react';

// 通知上下文
const NotificationContext = createContext();

// 通知类型和样式配置
const NOTIFICATION_TYPES = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-gradient-to-r from-green-400 to-emerald-500',
    borderColor: 'border-green-300',
    shadowColor: 'shadow-green-200',
    iconBg: 'bg-green-600/20',
    title: '操作成功'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    borderColor: 'border-yellow-300',
    shadowColor: 'shadow-yellow-200',
    iconBg: 'bg-yellow-600/20',
    title: '注意'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-gradient-to-r from-red-400 to-red-500',
    borderColor: 'border-red-300',
    shadowColor: 'shadow-red-200',
    iconBg: 'bg-red-600/20',
    title: '操作失败'
  },
  info: {
    icon: Info,
    bgColor: 'bg-gradient-to-r from-blue-400 to-blue-500',
    borderColor: 'border-blue-300',
    shadowColor: 'shadow-blue-200',
    iconBg: 'bg-blue-600/20',
    title: '提示'
  }
};

// 单个通知组件
const NotificationItem = ({ notification, onRemove }) => {
  const config = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info;
  const IconComponent = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, notification.duration || 1500);

    return () => clearTimeout(timer);
  }, [notification.id, notification.duration, onRemove]);

  return (
    <div
      className={`
        transform transition-all duration-500 ease-out
        ${config.bgColor} ${config.borderColor} ${config.shadowColor}
        text-white px-3 py-2 rounded-lg shadow-xl border backdrop-blur-sm
        animate-slide-in-right max-w-xs min-w-[225px]
      `}
      style={{
        animation: 'slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1), fadeOut 0.5s ease-out 1s forwards'
      }}
    >
      <div className="flex items-center gap-2">
        <div className={`p-0.5 rounded-full ${config.iconBg}`}>
          <IconComponent size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold">
            {notification.title || config.title}
          </div>
          <div className="text-xs opacity-90 truncate">
            {notification.message}
          </div>
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
        >
          <X size={12} className="text-white" />
        </button>
      </div>
      
      {/* 进度条 */}
      <div className="mt-1.5 h-0.5 bg-white/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white/60 rounded-full transition-all ease-linear"
          style={{
            width: '100%',
            animation: `progressBar ${notification.duration || 1500}ms linear forwards`
          }}
        />
      </div>
    </div>
  );
};

// 通知容器组件
const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
      
      {/* CSS 动画样式 */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.8);
          }
        }
        
        @keyframes progressBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* 悬停效果 */
        .fixed .transform:hover {
          transform: translateX(-5px) scale(1.02) !important;
          transition: transform 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

// 通知提供者组件
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'success',
      duration: 1500,
      ...notification,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // 预定义的快捷方法
  const showSuccess = useCallback((message, title = null, duration = 1500) => {
    return addNotification({
      type: 'success',
      message,
      title,
      duration
    });
  }, [addNotification]);

  const showError = useCallback((message, title = null, duration = 2500) => {
    return addNotification({
      type: 'error',
      message,
      title,
      duration
    });
  }, [addNotification]);

  const showWarning = useCallback((message, title = null, duration = 2000) => {
    return addNotification({
      type: 'warning',
      message,
      title,
      duration
    });
  }, [addNotification]);

  const showInfo = useCallback((message, title = null, duration = 1500) => {
    return addNotification({
      type: 'info',
      message,
      title,
      duration
    });
  }, [addNotification]);

  // 常用操作的快捷方法
  const notifySuccess = useCallback((action, item = '') => {
    const messages = {
      'translate': `翻译成功${item ? ': ' + item : ''}`,
      'copy': `复制成功${item ? ': ' + item : ''}`,
      'add': `添加成功${item ? ': ' + item : ''}`,
      'delete': `删除成功${item ? ': ' + item : ''}`,
      'save': `保存成功${item ? ': ' + item : ''}`,
      'import': `导入成功${item ? ': ' + item : ''}`,
      'export': `导出成功${item ? ': ' + item : ''}`,
      'favorite': `收藏成功${item ? ': ' + item : ''}`,
      'enable': `启用成功${item ? ': ' + item : ''}`,
      'disable': `禁用成功${item ? ': ' + item : ''}`,
      'reset': `重置成功${item ? ': ' + item : ''}`,
      'update': `更新成功${item ? ': ' + item : ''}`,
      'create': `创建成功${item ? ': ' + item : ''}`,
      'upload': `上传成功${item ? ': ' + item : ''}`,
      'download': `下载成功${item ? ': ' + item : ''}`
    };
    
    return showSuccess(messages[action] || `${action}成功${item ? ': ' + item : ''}`);
  }, [showSuccess]);

  const notifyError = useCallback((action, error = '', item = '') => {
    const messages = {
      'translate': `翻译失败${item ? ': ' + item : ''}${error ? ' - ' + error : ''}`,
      'copy': `复制失败${item ? ': ' + item : ''}${error ? ' - ' + error : ''}`,
      'add': `添加失败${item ? ': ' + item : ''}${error ? ' - ' + error : ''}`,
      'delete': `删除失败${item ? ': ' + item : ''}${error ? ' - ' + error : ''}`,
      'save': `保存失败${item ? ': ' + item : ''}${error ? ' - ' + error : ''}`,
      'import': `导入失败${item ? ': ' + item : ''}${error ? ' - ' + error : ''}`,
      'export': `导出失败${item ? ': ' + item : ''}${error ? ' - ' + error : ''}`,
      'favorite': `收藏失败${item ? ': ' + item : ''}${error ? ' - ' + error : ''}`,
      'network': `网络错误${error ? ': ' + error : ''}`,
      'permission': `权限不足${error ? ': ' + error : ''}`,
      'validation': `数据验证失败${error ? ': ' + error : ''}`
    };
    
    return showError(messages[action] || `${action}失败${item ? ': ' + item : ''}${error ? ' - ' + error : ''}`);
  }, [showError]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    notifySuccess,
    notifyError
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

// 自定义Hook
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// 快捷Hook
export const useNotify = () => {
  const { notifySuccess, notifyError, showWarning, showInfo } = useNotification();
  return { notifySuccess, notifyError, showWarning, showInfo };
};

export default NotificationProvider; 