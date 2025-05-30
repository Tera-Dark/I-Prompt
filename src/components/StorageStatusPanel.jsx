/**
 * 存储状态面板组件 - I-Prompt
 * 可以集成到任何页面中显示存储状态和统计信息
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Clock, 
  Save, 
  RefreshCw, 
  Trash2, 
  Info,
  ChevronDown,
  ChevronUp,
  BarChart3
} from 'lucide-react';

import { storageUtils } from '../utils/storageManager';

const StorageStatusPanel = ({ 
  position = 'fixed', // 'fixed' | 'static' | 'relative'
  theme = 'light', // 'light' | 'dark'
  showDetailed = false,
  onStorageAction = null // 回调函数，用于通知父组件存储操作
}) => {
  const [storageStats, setStorageStats] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // 定期更新存储统计
  useEffect(() => {
    const updateStats = () => {
      const stats = storageUtils.getStats();
      setStorageStats(stats);
    };
    
    updateStats();
    const interval = setInterval(updateStats, 30000); // 每30秒更新
    
    return () => clearInterval(interval);
  }, []);

  const handleCleanup = () => {
    storageUtils.cleanup();
    const newStats = storageUtils.getStats();
    setStorageStats(newStats);
    onStorageAction && onStorageAction('cleanup', newStats);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = () => {
    if (!storageStats) return 'gray';
    
    const totalItems = storageStats.sessionData + storageStats.persistentData + storageStats.temporaryData;
    if (totalItems > 100) return 'red';
    if (totalItems > 50) return 'yellow';
    return 'green';
  };

  const statusColor = getStatusColor();
  
  // 主题样式配置
  const themeClasses = {
    light: {
      panel: 'bg-white border-gray-200 text-gray-800',
      header: 'bg-gray-50 text-gray-700',
      button: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      stat: 'bg-gray-50',
      statText: 'text-gray-600'
    },
    dark: {
      panel: 'bg-gray-800 border-gray-600 text-gray-100',
      header: 'bg-gray-700 text-gray-200',
      button: 'bg-gray-600 hover:bg-gray-500 text-gray-200',
      stat: 'bg-gray-700',
      statText: 'text-gray-300'
    }
  };

  const currentTheme = themeClasses[theme];

  if (!isVisible || !storageStats) return null;

  const positionClasses = {
    fixed: 'fixed bottom-4 right-4 z-50',
    static: 'static',
    relative: 'relative'
  };

  return (
    <div className={`${positionClasses[position]} w-80 rounded-lg border shadow-lg ${currentTheme.panel}`}>
      {/* 面板头部 */}
      <div 
        className={`flex items-center justify-between p-3 rounded-t-lg cursor-pointer ${currentTheme.header}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Database size={16} />
          <span className="font-medium text-sm">存储状态</span>
          <div className={`w-2 h-2 rounded-full ${
            statusColor === 'green' ? 'bg-green-500' : 
            statusColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-75">
            {formatBytes(storageStats.totalSize)}
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* 快速统计 */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className={`p-2 rounded text-center ${currentTheme.stat}`}>
              <div className="font-semibold text-blue-600">{storageStats.sessionData}</div>
              <div className={currentTheme.statText}>会话</div>
            </div>
            <div className={`p-2 rounded text-center ${currentTheme.stat}`}>
              <div className="font-semibold text-green-600">{storageStats.persistentData}</div>
              <div className={currentTheme.statText}>持久</div>
            </div>
            <div className={`p-2 rounded text-center ${currentTheme.stat}`}>
              <div className="font-semibold text-yellow-600">{storageStats.temporaryData}</div>
              <div className={currentTheme.statText}>临时</div>
            </div>
          </div>

          {/* 详细信息 */}
          {showDetailed && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className={currentTheme.statText}>存储大小:</span>
                <span>{formatBytes(storageStats.totalSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className={currentTheme.statText}>过期项目:</span>
                <span className="text-red-500">{storageStats.expiredItems}</span>
              </div>
              <div className="flex justify-between">
                <span className={currentTheme.statText}>存储支持:</span>
                <span className={storageUtils.isSupported ? 'text-green-500' : 'text-orange-500'}>
                  {storageUtils.isSupported ? '✓ 本地存储' : '⚠ 内存存储'}
                </span>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <button
              onClick={handleCleanup}
              className={`flex-1 py-1.5 px-2 rounded text-xs flex items-center justify-center gap-1 ${currentTheme.button}`}
              title="清理过期数据"
            >
              <RefreshCw size={12} />
              清理
            </button>
            
            <button
              onClick={() => setIsVisible(false)}
              className={`py-1.5 px-2 rounded text-xs ${currentTheme.button}`}
              title="隐藏面板"
            >
              ✕
            </button>
          </div>

          {/* 状态指示器 */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Clock size={10} />
              <span className={currentTheme.statText}>会话数据1小时过期</span>
            </div>
          </div>
        </div>
      )}

      {/* 紧凑模式：只显示基本信息 */}
      {!isExpanded && (
        <div className="px-3 pb-2">
          <div className="flex justify-between items-center text-xs">
            <span className={currentTheme.statText}>
              {storageStats.sessionData + storageStats.persistentData + storageStats.temporaryData} 项数据
            </span>
            {storageStats.expiredItems > 0 && (
              <span className="text-red-500">
                {storageStats.expiredItems} 过期
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageStatusPanel; 