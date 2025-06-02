import React, { useState, useEffect } from 'react';
import { 
  Brain, Clock, CheckCircle, AlertCircle, X, 
  Zap, Sparkles, RefreshCw, Wifi, WifiOff 
} from 'lucide-react';

/**
 * 生成状态模态框组件
 * 显示请求进度、状态信息和用户提示
 */
const GenerationStatusModal = ({ 
  isVisible, 
  isGenerating, 
  onClose, 
  status = 'idle',
  progress = 0,
  statusMessage = '',
  estimatedTime = null,
  allowBackgroundMode = true 
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isBackgroundMode, setIsBackgroundMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('online');

  // 计时器
  useEffect(() => {
    let interval;
    if (isGenerating) {
      setTimeElapsed(0);
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setTimeElapsed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => setConnectionStatus('online');
    const handleOffline = () => setConnectionStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 获取状态信息
  const getStatusInfo = () => {
    const baseInfo = {
      idle: {
        icon: Brain,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        title: '准备就绪',
        description: '等待开始生成'
      },
      connecting: {
        icon: Wifi,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
        title: '连接中',
        description: '正在连接到AI服务...'
      },
      generating: {
        icon: Sparkles,
        color: 'text-purple-500',
        bgColor: 'bg-purple-100',
        title: '生成中',
        description: statusMessage || 'AI正在分析和生成提示词...'
      },
      success: {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-100',
        title: '生成成功',
        description: '提示词生成完成！'
      },
      error: {
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-100',
        title: '生成失败',
        description: statusMessage || '生成过程中遇到问题'
      }
    };

    return baseInfo[status] || baseInfo.idle;
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算进度
  const calculateProgress = () => {
    if (status === 'success') return 100;
    if (status === 'error') return 0;
    if (status === 'generating') {
      // 基于时间的模拟进度
      const timeProgress = Math.min((timeElapsed / 30) * 80, 80); // 30秒内到80%
      return Math.max(progress, timeProgress);
    }
    return progress;
  };

  const currentProgress = calculateProgress();

  // 背景模式处理
  const handleBackgroundMode = () => {
    setIsBackgroundMode(true);
    onClose();
  };

  // 显示详情处理
  const handleShowDetails = () => {
    setIsBackgroundMode(false);
    // 重新显示主模态框，不能直接设置isVisible，需要通过onClose回调通知父组件
    // 这里使用一个特殊的事件来标识需要重新显示模态框
    if (onClose) {
      onClose('showDetails');
    }
  };

  if (!isVisible && !isBackgroundMode) return null;

  return (
    <>
      {/* 模态框遮罩 */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative animate-in zoom-in-95 duration-200">
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            {/* 头部 */}
            <div className="p-6 pb-4">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full ${statusInfo.bgColor} mr-4`}>
                  <Icon className={`${statusInfo.color} ${isGenerating && status === 'generating' ? 'animate-spin' : ''}`} size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{statusInfo.title}</h3>
                  <p className="text-sm text-gray-600">{statusInfo.description}</p>
                </div>
              </div>

              {/* 进度条 */}
              {(isGenerating || status === 'generating') && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>进度</span>
                    <span>{Math.round(currentProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${currentProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 时间信息 */}
              {isGenerating && (
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    <span>已用时: {formatTime(timeElapsed)}</span>
                  </div>
                  {estimatedTime && (
                    <div className="flex items-center">
                      <span>预计: {estimatedTime}s</span>
                    </div>
                  )}
                </div>
              )}

              {/* 网络状态 */}
              <div className="flex items-center text-xs text-gray-500 mb-4">
                {connectionStatus === 'online' ? (
                  <div className="flex items-center text-green-600">
                    <Wifi size={14} className="mr-1" />
                    <span>网络连接正常</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff size={14} className="mr-1" />
                    <span>网络连接异常</span>
                  </div>
                )}
              </div>

              {/* 状态消息 */}
              {isGenerating && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-blue-800 text-sm">
                    <Zap size={16} className="mr-2 text-blue-600" />
                    <span>数据已自动保存，可安全切换页面</span>
                  </div>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="p-6 pt-0">
              <div className="flex gap-3">
                {allowBackgroundMode && isGenerating && (
                  <button
                    onClick={handleBackgroundMode}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    后台继续
                  </button>
                )}
                
                {!isGenerating && (
                  <button
                    onClick={onClose}
                    className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    {status === 'success' ? '查看结果' : '关闭'}
                  </button>
                )}
              </div>

              {/* 提示信息 */}
              {isGenerating && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    💡 生成过程需要10-30秒，您可以切换到其他标签页，结果会自动保存
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 后台模式指示器 */}
      {isBackgroundMode && isGenerating && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <RefreshCw className="text-purple-500 animate-spin" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">后台生成中</p>
                <p className="text-xs text-gray-500">
                  {formatTime(timeElapsed)} | {Math.round(currentProgress)}%
                </p>
              </div>
            </div>
            
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-purple-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleShowDetails}
              className="mt-2 w-full text-xs text-purple-600 hover:text-purple-800 transition-colors"
            >
              显示详情
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GenerationStatusModal; 