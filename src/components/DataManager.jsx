import React, { useState } from 'react';
import { Download, Upload, Trash2, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { persistentStorage } from '../utils/persistentStorage';
import { logger } from '../config/debug.js';

/**
 * 数据管理组件
 * 提供数据导入导出、清理等功能
 */
const DataManager = ({ className = '' }) => {
  const [stats, setStats] = useState(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 获取存储统计
  const loadStats = () => {
    const storageStats = persistentStorage.getStorageStats();
    setStats(storageStats);
  };

  // 导出数据
  const handleExport = () => {
    setIsLoading(true);
    try {
      const data = persistentStorage.exportData();
      if (data) {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `I-Prompt-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        logger.ui('✅ 数据导出成功');
      }
    } catch (error) {
      logger.error('导出数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 导入数据
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const success = persistentStorage.importData(data);
        
        if (success) {
          logger.ui('✅ 数据导入成功');
          loadStats();
        } else {
          logger.error('导入数据失败');
        }
      } catch (error) {
        logger.error('解析导入文件失败:', error);
      } finally {
        setIsLoading(false);
        event.target.value = ''; // 重置文件输入
      }
    };
    
    reader.readAsText(file);
  };

  // 清除所有数据
  const handleClearAll = () => {
    setIsLoading(true);
    try {
      const success = persistentStorage.clearAllData();
      if (success) {
        logger.ui('✅ 所有数据已清除');
        setStats(null);
        setShowConfirmClear(false);
      }
    } catch (error) {
      logger.error('清除数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center mb-4">
        <Info className="mr-2 text-blue-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-900">数据管理</h3>
      </div>

      {/* 存储统计 */}
      {stats && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">存储统计</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">生成记录：</span>
              <span className="font-medium ml-1">{stats.generatedPrompts} 条</span>
            </div>
            <div>
              <span className="text-gray-600">输入历史：</span>
              <span className="font-medium ml-1">{stats.inputHistory} 条</span>
            </div>
            <div>
              <span className="text-gray-600">存储大小：</span>
              <span className="font-medium ml-1">{stats.storageSizeKB} KB</span>
            </div>
            <div>
              <span className="text-gray-600">草稿状态：</span>
              <span className={`font-medium ml-1 ${stats.hasDraft ? 'text-green-600' : 'text-gray-400'}`}>
                {stats.hasDraft ? '有草稿' : '无草稿'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="space-y-3">
        {/* 导出数据 */}
        <button
          onClick={handleExport}
          disabled={isLoading || !stats?.generatedPrompts}
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} className="mr-2" />
          导出数据备份
        </button>

        {/* 导入数据 */}
        <label className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <Upload size={16} className="mr-2" />
          导入数据备份
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            disabled={isLoading}
          />
        </label>

        {/* 清除数据 */}
        {!showConfirmClear ? (
          <button
            onClick={() => setShowConfirmClear(true)}
            disabled={isLoading || !stats?.generatedPrompts}
            className="w-full flex items-center justify-center py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} className="mr-2" />
            清除所有数据
          </button>
        ) : (
          <div className="space-y-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="mr-2 text-red-600 flex-shrink-0 mt-0.5" size={16} />
                <div className="text-sm text-red-800">
                  <p className="font-medium">确认清除所有数据？</p>
                  <p className="mt-1">此操作将删除所有生成记录、输入历史和草稿，且无法恢复。</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                disabled={isLoading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                确认清除
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                disabled={isLoading}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 刷新统计按钮 */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={loadStats}
          disabled={isLoading}
          className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          🔄 刷新统计信息
        </button>
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="mt-3 flex items-center justify-center text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
          处理中...
        </div>
      )}
    </div>
  );
};

export default DataManager;