import React, { useState } from 'react';
import { Globe, Settings, Zap, TrendingUp, Layers } from 'lucide-react';

/**
 * 翻译引擎状态组件
 * 显示当前翻译引擎信息和提供切换功能
 */
const TranslationEngineStatus = ({ 
  currentEngine, 
  allEngines, 
  onEngineSwitch, 
  onRefresh,
  stats 
}) => {
  const [showEnginePanel, setShowEnginePanel] = useState(false);
  const [showStats, setShowStats] = useState(false);

  if (!currentEngine) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Globe size={16} />
        <span>翻译引擎加载中...</span>
      </div>
    );
  }

  const handleEngineSwitch = (engineKey) => {
    onEngineSwitch?.(engineKey);
    setShowEnginePanel(false);
  };

  const getEngineStatusColor = (engine) => {
    if (!engine.available) return 'text-red-500';
    if (engine.lastCheck?.responseTime > 2000) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getEngineStatusIcon = (engine) => {
    if (!engine.available) return '❌';
    if (engine.lastCheck?.responseTime > 2000) return '⚠️';
    return '✅';
  };

  return (
    <div className="relative">
      {/* 当前引擎状态 */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-blue-500" />
          <span className="text-sm font-medium text-gray-700">翻译引擎:</span>
          <span className="text-sm font-semibold text-blue-600">
            {currentEngine.name}
          </span>
          <span className={`text-xs ${getEngineStatusColor(currentEngine)}`}>
            {getEngineStatusIcon(currentEngine)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* 引擎设置按钮 */}
          <button
            onClick={() => setShowEnginePanel(!showEnginePanel)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="切换翻译引擎"
          >
            <Settings size={14} className="text-gray-500" />
          </button>

          {/* 统计按钮 */}
          {stats && (
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="翻译统计"
            >
              <TrendingUp size={14} className="text-gray-500" />
            </button>
          )}

          {/* 刷新按钮 */}
          <button
            onClick={onRefresh}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="刷新引擎状态"
          >
            <Zap size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* 引擎切换面板 */}
      {showEnginePanel && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">选择翻译引擎</h4>
              <button
                onClick={() => setShowEnginePanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allEngines.map((engine) => (
                <div
                  key={engine.key}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    engine.key === currentEngine.key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${!engine.available ? 'opacity-50' : ''}`}
                  onClick={() => engine.available && handleEngineSwitch(engine.key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{engine.name}</span>
                        <span className={`text-xs ${getEngineStatusColor(engine)}`}>
                          {getEngineStatusIcon(engine)}
                        </span>
                        {engine.key === currentEngine.key && (
                          <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                            当前
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {engine.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          支持 {engine.languages} 种语言
                        </span>
                        {engine.lastCheck && (
                          <span className="text-xs text-gray-400">
                            响应: {engine.lastCheck.responseTime}ms
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-blue-500 font-medium">
                      优先级 {engine.priority}
                    </div>
                  </div>

                  {/* 引擎特性标签 */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {engine.features?.map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* 错误信息 */}
                  {!engine.available && engine.lastCheck?.error && (
                    <div className="text-xs text-red-500 mt-1">
                      错误: {engine.lastCheck.error}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                系统会自动选择最优引擎，失败时自动切换备用引擎
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 翻译统计面板 */}
      {showStats && stats && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">翻译统计</h4>
              <button
                onClick={() => setShowStats(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* 总体统计 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs text-blue-600 mb-1">总翻译次数</div>
                  <div className="text-lg font-semibold text-blue-700">
                    {stats.totalTranslations}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xs text-green-600 mb-1">缓存命中率</div>
                  <div className="text-lg font-semibold text-green-700">
                    {stats.cacheHitRate}%
                  </div>
                </div>
              </div>

              {/* 引擎使用统计 */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Layers size={14} />
                  引擎使用情况
                </div>
                <div className="space-y-1">
                  {Object.entries(stats.engineUsage).map(([engine, count]) => (
                    <div key={engine} className="flex justify-between text-xs">
                      <span className="text-gray-600">
                        {allEngines.find(e => e.key === engine)?.name || engine}
                      </span>
                      <span className="font-medium">{count} 次</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 语言对统计 */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Globe size={14} />
                  语言翻译对
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {Object.entries(stats.languagePairs).map(([pair, count]) => (
                    <div key={pair} className="flex justify-between text-xs">
                      <span className="text-gray-600">{pair}</span>
                      <span className="font-medium">{count} 次</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationEngineStatus; 