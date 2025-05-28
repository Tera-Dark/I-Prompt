import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Edit3, Languages, Plus, Minus, Heart, Trash2, Copy, 
  CheckCircle, Lightbulb, Tag, Zap, Search, X, 
  ChevronDown, ChevronUp, Settings, Save, Undo
} from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import { translateText } from '../services/aliTranslationService';

/**
 * 高级提示词编辑器组件
 * 功能：直接编辑、一键翻译、智能补全、权重调节、删除收藏
 */
const AdvancedPromptEditor = ({ 
  initialPrompt = '', 
  onSave, 
  onClose,
  className = '' 
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [translatedPrompt, setTranslatedPrompt] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([initialPrompt]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [copyStatus, setCopyStatus] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  
  const textareaRef = useRef(null);
  const suggestionsRef = useRef(null);

  // 模拟标签数据库（按使用频率排序）
  const tagDatabase = [
    // 质量标签
    { tag: 'masterpiece', cn: '杰作', frequency: 95, category: 'quality' },
    { tag: 'best quality', cn: '最佳质量', frequency: 92, category: 'quality' },
    { tag: 'ultra detailed', cn: '超详细', frequency: 88, category: 'quality' },
    { tag: 'high resolution', cn: '高分辨率', frequency: 85, category: 'quality' },
    { tag: 'professional', cn: '专业级', frequency: 82, category: 'quality' },
    { tag: '8k wallpaper', cn: '8K壁纸', frequency: 78, category: 'quality' },
    
    // 人物标签
    { tag: 'beautiful girl', cn: '美丽女孩', frequency: 90, category: 'character' },
    { tag: 'cute', cn: '可爱', frequency: 87, category: 'character' },
    { tag: 'kawaii', cn: '萌', frequency: 84, category: 'character' },
    { tag: 'portrait', cn: '肖像', frequency: 81, category: 'character' },
    { tag: 'detailed face', cn: '精细面部', frequency: 79, category: 'character' },
    { tag: 'expressive eyes', cn: '有表现力的眼睛', frequency: 76, category: 'character' },
    
    // 风格标签
    { tag: 'anime style', cn: '动漫风格', frequency: 89, category: 'style' },
    { tag: 'realistic', cn: '写实', frequency: 86, category: 'style' },
    { tag: 'photorealistic', cn: '照片级写实', frequency: 83, category: 'style' },
    { tag: 'oil painting', cn: '油画', frequency: 75, category: 'style' },
    { tag: 'watercolor', cn: '水彩', frequency: 72, category: 'style' },
    { tag: 'digital art', cn: '数字艺术', frequency: 80, category: 'style' },
    
    // 光照标签
    { tag: 'cinematic lighting', cn: '电影级光照', frequency: 88, category: 'lighting' },
    { tag: 'soft lighting', cn: '柔和光照', frequency: 85, category: 'lighting' },
    { tag: 'dramatic lighting', cn: '戏剧性光照', frequency: 82, category: 'lighting' },
    { tag: 'golden hour', cn: '黄金时刻', frequency: 79, category: 'lighting' },
    { tag: 'natural lighting', cn: '自然光照', frequency: 76, category: 'lighting' },
    { tag: 'studio lighting', cn: '摄影棚光照', frequency: 73, category: 'lighting' },
    
    // 构图标签
    { tag: 'perfect composition', cn: '完美构图', frequency: 84, category: 'composition' },
    { tag: 'dynamic pose', cn: '动态姿势', frequency: 81, category: 'composition' },
    { tag: 'close-up', cn: '特写', frequency: 78, category: 'composition' },
    { tag: 'wide shot', cn: '远景', frequency: 75, category: 'composition' },
    { tag: 'rule of thirds', cn: '三分法则', frequency: 72, category: 'composition' },
    { tag: 'bird eye view', cn: '鸟瞰视角', frequency: 69, category: 'composition' },
    
    // 效果标签
    { tag: 'depth of field', cn: '景深', frequency: 86, category: 'effects' },
    { tag: 'bokeh', cn: '虚化', frequency: 83, category: 'effects' },
    { tag: 'sharp focus', cn: '锐利对焦', frequency: 80, category: 'effects' },
    { tag: 'motion blur', cn: '运动模糊', frequency: 77, category: 'effects' },
    { tag: 'lens flare', cn: '镜头光晕', frequency: 74, category: 'effects' },
    { tag: 'chromatic aberration', cn: '色差', frequency: 71, category: 'effects' }
  ];

  // 监听文本变化，触发智能补全
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const text = textarea.value;
      const position = textarea.selectionStart;
      
      // 获取当前光标位置的单词
      const beforeCursor = text.substring(0, position);
      const words = beforeCursor.split(/[,\s]+/);
      const currentWord = words[words.length - 1] || '';
      
      setCurrentWord(currentWord);
      setCursorPosition(position);
      
      // 如果当前单词长度大于1，显示建议
      if (currentWord.length > 1) {
        const filteredSuggestions = tagDatabase
          .filter(item => 
            item.tag.toLowerCase().includes(currentWord.toLowerCase()) ||
            item.cn.includes(currentWord)
          )
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 8); // 显示8个建议
        
        setSuggestions(filteredSuggestions);
        setShowSuggestions(filteredSuggestions.length > 0);
      } else {
        setShowSuggestions(false);
      }
    }
  }, [prompt]);

  // 处理文本变化
  const handlePromptChange = useCallback((value) => {
    setPrompt(value);
    
    // 添加到历史记录
    if (value !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(value);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [history, historyIndex]);

  // 一键翻译功能
  const handleTranslate = async () => {
    if (!prompt.trim()) return;
    
    setIsTranslating(true);
    try {
      const translated = await translateText(prompt);
      setTranslatedPrompt(translated);
    } catch (error) {
      console.error('翻译失败:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // 应用建议
  const applySuggestion = (suggestion) => {
    const textarea = textareaRef.current;
    const text = textarea.value;
    const position = textarea.selectionStart;
    
    // 找到当前单词的开始位置
    const beforeCursor = text.substring(0, position);
    const words = beforeCursor.split(/[,\s]+/);
    const currentWordStart = beforeCursor.lastIndexOf(words[words.length - 1]);
    
    // 替换当前单词
    const newText = text.substring(0, currentWordStart) + 
                   suggestion.tag + 
                   text.substring(position);
    
    handlePromptChange(newText);
    setShowSuggestions(false);
    
    // 设置光标位置
    setTimeout(() => {
      const newPosition = currentWordStart + suggestion.tag.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  // 添加权重
  const addWeight = (weight = 1.2) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText) {
      const weightedText = `(${selectedText}:${weight})`;
      const newText = textarea.value.substring(0, start) + 
                     weightedText + 
                     textarea.value.substring(end);
      handlePromptChange(newText);
      
      // 重新选中加权后的文本
      setTimeout(() => {
        textarea.setSelectionRange(start, start + weightedText.length);
        textarea.focus();
      }, 0);
    }
  };

  // 移除权重
  const removeWeight = () => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    // 移除权重标记 (text:weight) 或 ((text))
    const cleanText = selectedText
      .replace(/\(([^:)]+):[0-9.]+\)/g, '$1')
      .replace(/\(\(([^)]+)\)\)/g, '$1')
      .replace(/\(([^)]+)\)/g, '$1');
    
    if (cleanText !== selectedText) {
      const newText = textarea.value.substring(0, start) + 
                     cleanText + 
                     textarea.value.substring(end);
      handlePromptChange(newText);
    }
  };

  // 删除选中的标签
  const deleteSelected = () => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      const newText = textarea.value.substring(0, start) + 
                     textarea.value.substring(end);
      handlePromptChange(newText);
      
      setTimeout(() => {
        textarea.setSelectionRange(start, start);
        textarea.focus();
      }, 0);
    }
  };

  // 收藏当前提示词
  const toggleFavorite = () => {
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt) {
      setFavorites(prev => 
        prev.includes(trimmedPrompt)
          ? prev.filter(fav => fav !== trimmedPrompt)
          : [...prev, trimmedPrompt]
      );
    }
  };

  // 撤销操作
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPrompt(history[newIndex]);
    }
  };

  // 重做操作
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPrompt(history[newIndex]);
    }
  };

  // 复制功能
  const handleCopy = async (text) => {
    const success = await copyToClipboard(text || prompt);
    setCopyStatus(success ? 'copied' : 'error');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  // 保存功能
  const handleSave = () => {
    if (onSave) {
      onSave(prompt);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Edit3 className="text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-900">高级提示词编辑器</h3>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
            智能补全 | 权重调节 | 一键翻译
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={isExpanded ? '收起' : '展开'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="关闭"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* 主编辑区域 */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="输入您的提示词，支持中英文混合输入，输入时会自动显示智能建议..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm leading-relaxed"
              style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
            />
            
            {/* 智能建议下拉框 */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
              >
                <div className="p-2 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Lightbulb size={12} />
                    <span>智能建议 (按使用频率排序)</span>
                  </div>
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => applySuggestion(suggestion)}
                    className="flex items-center justify-between p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-900">
                          {suggestion.tag}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          suggestion.category === 'quality' ? 'bg-purple-100 text-purple-600' :
                          suggestion.category === 'character' ? 'bg-blue-100 text-blue-600' :
                          suggestion.category === 'style' ? 'bg-green-100 text-green-600' :
                          suggestion.category === 'lighting' ? 'bg-yellow-100 text-yellow-600' :
                          suggestion.category === 'composition' ? 'bg-pink-100 text-pink-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {suggestion.category}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {suggestion.cn} • 使用率 {suggestion.frequency}%
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-12 bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full" 
                          style={{ width: `${suggestion.frequency}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 工具栏 */}
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
            {/* 权重控制 */}
            <div className="flex items-center gap-1 bg-white rounded-lg p-1">
              <span className="text-xs text-gray-600 px-2">权重:</span>
              <button
                onClick={() => addWeight(1.1)}
                className="px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200 transition-colors"
                title="添加轻微权重 (1.1)"
              >
                +1.1
              </button>
              <button
                onClick={() => addWeight(1.2)}
                className="px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200 transition-colors"
                title="添加标准权重 (1.2)"
              >
                +1.2
              </button>
              <button
                onClick={() => addWeight(1.5)}
                className="px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200 transition-colors"
                title="添加强权重 (1.5)"
              >
                +1.5
              </button>
              <button
                onClick={removeWeight}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                title="移除权重"
              >
                <Minus size={12} />
              </button>
            </div>

            {/* 编辑操作 */}
            <div className="flex items-center gap-1 bg-white rounded-lg p-1">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="撤销"
              >
                <Undo size={14} />
              </button>
              <button
                onClick={deleteSelected}
                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                title="删除选中"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={toggleFavorite}
                className={`p-1 rounded transition-colors ${
                  favorites.includes(prompt.trim())
                    ? 'text-red-600 bg-red-100 hover:bg-red-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={favorites.includes(prompt.trim()) ? '取消收藏' : '收藏'}
              >
                <Heart size={14} fill={favorites.includes(prompt.trim()) ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* 功能操作 */}
            <div className="flex items-center gap-1 bg-white rounded-lg p-1">
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !prompt.trim()}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors"
                title="一键翻译"
              >
                <Languages size={12} />
                {isTranslating ? '翻译中...' : '翻译'}
              </button>
              <button
                onClick={() => handleCopy()}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                title="复制提示词"
              >
                {copyStatus === 'copied' ? <CheckCircle size={12} /> : <Copy size={12} />}
                复制
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-colors"
                title="保存提示词"
              >
                <Save size={12} />
                保存
              </button>
            </div>
          </div>

          {/* 翻译结果 */}
          {translatedPrompt && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Languages className="text-blue-600" size={16} />
                  <span className="text-sm font-medium text-blue-800">翻译结果</span>
                </div>
                <button
                  onClick={() => handleCopy(translatedPrompt)}
                  className="p-1 text-blue-600 hover:bg-blue-200 rounded transition-colors"
                  title="复制翻译结果"
                >
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-sm font-mono text-blue-900 leading-relaxed">
                {translatedPrompt}
              </p>
            </div>
          )}

          {/* 统计信息 */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <span>字符数: {prompt.length}</span>
              <span>标签数: {prompt.split(',').filter(tag => tag.trim()).length}</span>
              <span>历史记录: {historyIndex + 1}/{history.length}</span>
            </div>
            <div className="flex items-center gap-2">
              {favorites.includes(prompt.trim()) && (
                <span className="flex items-center gap-1 text-red-600">
                  <Heart size={12} fill="currentColor" />
                  已收藏
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 复制状态提示 */}
      {copyStatus && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white text-sm transition-all duration-300 shadow-lg z-50 ${
          copyStatus === 'copied' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {copyStatus === 'copied' ? '✅ 已复制到剪贴板' : '❌ 复制失败'}
        </div>
      )}
    </div>
  );
};

export default AdvancedPromptEditor; 