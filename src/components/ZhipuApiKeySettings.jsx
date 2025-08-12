import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X, ExternalLink, AlertCircle } from 'lucide-react';
import { zhipuConfigManager } from '../config/zhipuConfig.js';

/**
 * 智谱GLM API密钥设置组件
 */
const ZhipuApiKeySettings = ({ onApiKeyChange, className = '' }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // 初始化时检查是否已有API密钥
  useEffect(() => {
    const existingKey = zhipuConfigManager.getApiKey();
    if (existingKey) {
      setHasApiKey(true);
      setApiKey(existingKey);
    }
  }, []);

  // 处理API密钥保存
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationResult({ success: false, message: 'API密钥不能为空' });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      // 验证API密钥格式
      if (!zhipuConfigManager.validateApiKey(apiKey)) {
        throw new Error('API密钥格式不正确');
      }

      // 保存API密钥
      zhipuConfigManager.setApiKey(apiKey);
      setHasApiKey(true);
      setIsEditing(false);
      setValidationResult({ success: true, message: 'API密钥保存成功' });

      // 通知父组件
      if (onApiKeyChange) {
        onApiKeyChange(apiKey);
      }

      // 清除成功消息
      setTimeout(() => setValidationResult(null), 3000);
    } catch (error) {
      setValidationResult({ success: false, message: error.message });
    } finally {
      setIsValidating(false);
    }
  };

  // 处理API密钥清除
  const handleClearApiKey = () => {
    zhipuConfigManager.clearApiKey();
    setApiKey('');
    setHasApiKey(false);
    setIsEditing(false);
    setValidationResult({ success: true, message: 'API密钥已清除' });

    // 通知父组件
    if (onApiKeyChange) {
      onApiKeyChange(null);
    }

    // 清除消息
    setTimeout(() => setValidationResult(null), 3000);
  };

  // 开始编辑
  const handleStartEdit = () => {
    setIsEditing(true);
    setValidationResult(null);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    setValidationResult(null);
    // 恢复原始值
    const existingKey = zhipuConfigManager.getApiKey();
    setApiKey(existingKey || '');
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Key className="text-blue-500" size={20} />
        <h3 className="text-lg font-semibold text-gray-800">智谱GLM API密钥设置</h3>
      </div>

      <div className="space-y-3">
        {/* API密钥状态显示 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">状态:</span>
          {hasApiKey ? (
            <span className="flex items-center gap-1 text-green-600 text-sm">
              <Check size={16} />
              已配置
            </span>
          ) : (
            <span className="flex items-center gap-1 text-orange-600 text-sm">
              <AlertCircle size={16} />
              未配置
            </span>
          )}
        </div>

        {/* API密钥输入区域 */}
        {(!hasApiKey || isEditing) && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              API密钥
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="请输入智谱GLM API密钥"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isValidating}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          {!hasApiKey || isEditing ? (
            <>
              <button
                onClick={handleSaveApiKey}
                disabled={isValidating || !apiKey.trim()}
                className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Check size={16} />
                {isValidating ? '验证中...' : '保存'}
              </button>
              {isEditing && (
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                >
                  <X size={16} />
                  取消
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                <Key size={16} />
                修改密钥
              </button>
              <button
                onClick={handleClearApiKey}
                className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
              >
                <X size={16} />
                清除密钥
              </button>
            </>
          )}
        </div>

        {/* 验证结果显示 */}
        {validationResult && (
          <div className={`p-2 rounded-md text-sm ${
            validationResult.success 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {validationResult.message}
          </div>
        )}

        {/* 帮助信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-2">如何获取API密钥？</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. 访问智谱AI开放平台</li>
            <li>2. 注册账号并完成实名认证</li>
            <li>3. 在控制台创建API密钥</li>
            <li>4. GLM-4-Flash模型完全免费使用</li>
          </ol>
          <a
            href="https://bigmodel.cn/usercenter/apikeys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            <ExternalLink size={14} />
            前往获取API密钥
          </a>
        </div>
      </div>
    </div>
  );
};

export default ZhipuApiKeySettings;