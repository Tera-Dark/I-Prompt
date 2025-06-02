import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Eye, EyeOff, Copy, Heart, Languages, 
  Plus, Minus, RotateCcw
} from 'lucide-react';

export default function TagPill(props) {
  const {
    tag, 
    index,
    isDisabled = false,
    isFavorited = false,
    onDelete, 
    onToggleDisabled,
    onAdjustWeight,
    onAdjustBrackets,
    onCopy,
    onFavorite,
    onTranslate,
    onTranslationUpdate,
    translatedTags = {},
    hoveredTag,
    setHoveredTag
  } = props;

  // 状态
  const [chineseTranslation, setChineseTranslation] = useState('');
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  // Refs
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const timeoutRef = useRef(null);

  // 解析标签格式 - 完全重写版本
  const parseTagFormat = (tagStr) => {
    if (!tagStr || typeof tagStr !== 'string') {
      return { text: '', weight: 1.0, bracketType: 'none', brackets: 0 };
    }
    
    let text = tagStr.trim();
    let weight = 1.0;
    let bracketType = 'none';
    let brackets = 0;
    
    // 1. 首先检查权重格式: (text:1.3) 
    const weightMatch = text.match(/^\(([^:()]+):([\d.]+)\)$/);
    if (weightMatch) {
      text = weightMatch[1];
      weight = parseFloat(weightMatch[2]) || 1.0;
      return { text, weight, bracketType: 'none', brackets: 0 };
    }
    
    // 2. 检查纯权重格式: text:1.3 (没有括号)
    const pureWeightMatch = text.match(/^([^:()[\]{}]+):([\d.]+)$/);
    if (pureWeightMatch) {
      text = pureWeightMatch[1];
      weight = parseFloat(pureWeightMatch[2]) || 1.0;
      return { text, weight, bracketType: 'none', brackets: 0 };
    }
    
    // 3. 解析各种括号（没有权重时）
    let originalText = text;
    
    // 检测圆括号
    const roundMatch = text.match(/^(\(+)(.+?)(\)+)$/);
    if (roundMatch && roundMatch[1].length === roundMatch[3].length) {
      brackets = roundMatch[1].length;
      bracketType = 'round';
      text = roundMatch[2];
    }
    // 检测方括号  
    else {
      const squareMatch = text.match(/^(\[+)(.+?)(\]+)$/);
      if (squareMatch && squareMatch[1].length === squareMatch[3].length) {
        brackets = squareMatch[1].length;
        bracketType = 'square';
        text = squareMatch[2];
      }
      // 检测花括号
      else {
        const curlyMatch = text.match(/^(\{+)(.+?)(\}+)$/);
        if (curlyMatch && curlyMatch[1].length === curlyMatch[3].length) {
          brackets = curlyMatch[1].length;
          bracketType = 'curly';
          text = curlyMatch[2];
        }
      }
    }
    
    // 如果解析后的文本为空，使用原始文本
    if (!text.trim()) {
      text = originalText;
      bracketType = 'none';
      brackets = 0;
    }
    
    return { text, weight, bracketType, brackets };
  };

  const { text, weight, bracketType, brackets } = parseTagFormat(tag);

  // 颜色函数
  const getWeightColor = () => {
    if (weight >= 1.5) return 'text-red-600';
    if (weight > 1.2) return 'text-orange-600';
    if (weight > 1.0) return 'text-yellow-600';
    if (weight < 0.8) return 'text-blue-600';
    return 'text-green-600';
  };

  const getBracketColor = () => {
    switch (bracketType) {
      case 'round': return 'text-blue-600';
      case 'square': return 'text-purple-600';
      case 'curly': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // 悬浮控制 - 修复版本
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowControls(true);
    if (setHoveredTag) setHoveredTag(index);
  };

  const handleMouseLeave = (e) => {
    // 检查鼠标是否移到了控制栏
    const relatedTarget = e.relatedTarget;
    if (relatedTarget && controlsRef.current && controlsRef.current.contains(relatedTarget)) {
      return; // 不隐藏控制栏
    }
    
    timeoutRef.current = setTimeout(() => {
      setShowControls(false);
      if (setHoveredTag) setHoveredTag(null);
    }, 100);
  };

  const handleControlsMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowControls(true);
  };

  const handleControlsMouseLeave = (e) => {
    // 检查鼠标是否回到了主容器
    const relatedTarget = e.relatedTarget;
    if (relatedTarget && containerRef.current && containerRef.current.contains(relatedTarget)) {
      return; // 不隐藏控制栏
    }
    
    timeoutRef.current = setTimeout(() => {
      setShowControls(false);
      if (setHoveredTag) setHoveredTag(null);
    }, 100);
  };

  // 操作处理
  const handleAction = (action, ...args) => {
    switch (action) {
      case 'delete':
        if (onDelete) onDelete(index);
        break;
      case 'toggle':
        if (onToggleDisabled) onToggleDisabled(index);
        break;
      case 'copy':
        if (onCopy) onCopy(tag);
        break;
      case 'favorite':
        if (onFavorite) onFavorite(tag, chineseTranslation);
        break;
      case 'translate':
        if (onTranslate) onTranslate(text);
        break;
      case 'weightUp':
        if (onAdjustWeight) onAdjustWeight(index, 0.1);
        break;
      case 'weightDown':
        if (onAdjustWeight) onAdjustWeight(index, -0.1);
        break;
      case 'setBrackets':
        if (onAdjustBrackets) onAdjustBrackets(index, args[0], 999);
        break;
      case 'addBracket':
        if (onAdjustBrackets) onAdjustBrackets(index, bracketType || 'round', 1);
        break;
      case 'removeBracket':
        if (onAdjustBrackets) onAdjustBrackets(index, bracketType, -1);
        break;
      case 'reset':
        if (weight !== 1.0 && onAdjustWeight) onAdjustWeight(index, 1.0 - weight);
        if (brackets > 0 && onAdjustBrackets) onAdjustBrackets(index, bracketType, -brackets);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  };

  // 清理
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 监听外部悬浮状态
  useEffect(() => {
    if (hoveredTag === index) {
      setShowControls(true);
    } else if (hoveredTag !== index) {
      setShowControls(false);
    }
  }, [hoveredTag, index]);

  // 清理翻译结果的通用函数 (与主页面保持一致)
  const cleanTranslationResult = (translatedText) => {
    if (!translatedText || typeof translatedText !== 'string') {
      return '';
    }
    
    let cleaned = translatedText.trim();
    
    // 移除各种翻译引擎的标记 - 更全面的清理
    const patterns = [
      /^\[ALIBABA\]\s*翻译[：:]?\s*/i,
      /^\[ALIBABA\]\s*Translated[：:]?\s*/i,
      /^\[.+?\]\s*翻译[：:]?\s*/i,
      /^\[.+?\]\s*Translated[：:]?\s*/i,
      /^[^\u4e00-\u9fa5a-zA-Z]*[：:]\s*/,  // 移除非中英文前缀
      /^翻译[：:]?\s*/,
      /^Translated[：:]?\s*/i,
      /^Result[：:]?\s*/i,
      /^Output[：:]?\s*/i
    ];
    
    patterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    return cleaned.trim();
  };

  // 翻译逻辑 - 修复版本
  useEffect(() => {
    if (!text) return;
    
    // 检查缓存
    if (translatedTags[text]) {
      setChineseTranslation(translatedTags[text]);
      return;
    }

    // 自动翻译英文
    if (/^[a-zA-Z\s\-_\d]+$/.test(text)) {
      setIsLoadingTranslation(true);
      
      const doTranslation = async () => {
        try {
          if (onTranslate) {
            console.log(`🏷️ [TagPill] 开始翻译标签: "${text}"`);
            const result = await onTranslate(text);
            
            if (result?.translatedText) {
              console.log(`📝 [TagPill] 原始翻译结果: "${result.translatedText}"`);
              
              // 使用统一的清理函数
              const cleanTranslation = cleanTranslationResult(result.translatedText);
              console.log(`✨ [TagPill] 清理后结果: "${cleanTranslation}"`);
              
              // 验证翻译质量
              if (cleanTranslation && 
                  cleanTranslation !== text && 
                  /[\u4e00-\u9fa5]/.test(cleanTranslation)) {
                setChineseTranslation(cleanTranslation);
                if (onTranslationUpdate) {
                  onTranslationUpdate(text, cleanTranslation);
                }
                console.log(`✅ [TagPill] 翻译成功: ${text} → ${cleanTranslation}`);
              } else {
                console.log(`⚠️ [TagPill] 翻译质量不合格，不显示翻译`);
              }
            }
          }
        } catch (error) {
          console.error('❌ [TagPill] 翻译失败:', error);
        } finally {
          setIsLoadingTranslation(false);
        }
      };
      
      // 延迟翻译，避免频繁请求
      const timer = setTimeout(doTranslation, 500);
      return () => clearTimeout(timer);
    }
  }, [text, translatedTags, onTranslate, onTranslationUpdate]);

  return (
    <div 
      ref={containerRef}
      className="relative inline-block mb-16"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 主标签 */}
      <div className={`
        relative bg-blue-50 border-2 rounded-lg px-3 py-2 transition-all duration-200 cursor-pointer
        ${isDisabled 
          ? 'border-gray-300 bg-gray-100 opacity-50' 
          : 'border-blue-200 hover:border-blue-300 hover:shadow-md'
        }
        ${showControls ? 'transform scale-105 shadow-lg border-blue-400' : ''}
      `}>
        <div className="text-center">
          <div className={`text-sm font-medium ${isDisabled ? 'text-gray-500' : 'text-blue-700'}`}>
            {text}
            {weight !== 1.0 && (
              <span className={`ml-1 text-xs ${getWeightColor()}`}>
                :{weight.toFixed(1)}
              </span>
            )}
            {brackets > 0 && (
              <span className={`ml-1 text-xs ${getBracketColor()}`}>
                {bracketType === 'round' && '()'}
                {bracketType === 'square' && '[]'}
                {bracketType === 'curly' && '{}'}
                {brackets > 1 && `×${brackets}`}
              </span>
            )}
          </div>
          
          <div className={`text-xs mt-1 px-2 py-1 rounded transition-all ${
            isDisabled 
              ? 'text-gray-400 bg-gray-50' 
              : chineseTranslation 
                ? 'text-orange-600 bg-orange-50 border border-orange-200'
                : 'text-gray-500 bg-gray-50 border border-gray-200'
          }`}>
            {isLoadingTranslation ? (
              <span className="text-blue-500">翻译中...</span>
            ) : chineseTranslation || (
              <span className="text-gray-400">点击翻译按钮获取中文</span>
            )}
          </div>
        </div>
      </div>

      {/* 控制栏 */}
      {showControls && (
        <div 
          ref={controlsRef}
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 z-[9999]"
          style={{ zIndex: 9999 }}
          onMouseEnter={handleControlsMouseEnter}
          onMouseLeave={handleControlsMouseLeave}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xl px-3 py-2 flex items-center gap-2 min-w-max">
            
            {/* 权重控制 */}
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded border">
              <button
                onClick={() => handleAction('weightDown')}
                disabled={weight <= 0.1}
                className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
                title="降低权重"
              >
                <Minus size={12} />
              </button>
              <span className="text-xs font-mono min-w-[2rem] text-center font-semibold">
                {weight.toFixed(1)}
              </span>
              <button
                onClick={() => handleAction('weightUp')}
                disabled={weight >= 2.0}
                className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
                title="提高权重"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* 括号控制 */}
            {weight === 1.0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleAction('setBrackets', 'round')}
                  className={`w-6 h-6 flex items-center justify-center rounded transition-colors text-xs ${
                    bracketType === 'round' 
                      ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  title="圆括号"
                >
                  ()
                </button>
                <button
                  onClick={() => handleAction('setBrackets', 'square')}
                  className={`w-6 h-6 flex items-center justify-center rounded transition-colors text-xs ${
                    bracketType === 'square' 
                      ? 'bg-purple-100 text-purple-600 border border-purple-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  title="方括号"
                >
                  []
                </button>
                <button
                  onClick={() => handleAction('setBrackets', 'curly')}
                  className={`w-6 h-6 flex items-center justify-center rounded transition-colors text-xs ${
                    bracketType === 'curly' 
                      ? 'bg-green-100 text-green-600 border border-green-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  title="花括号"
                >
                  {'{'}{'}'} 
                </button>
              </div>
            )}
            
            {brackets > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleAction('removeBracket')}
                  disabled={brackets <= 1}
                  className="w-6 h-6 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors text-xs disabled:opacity-50"
                  title="减少嵌套"
                >
                  -
                </button>
                <span className="text-xs text-gray-600 min-w-[1.5rem] text-center">
                  ×{brackets}
                </span>
                <button
                  onClick={() => handleAction('addBracket')}
                  disabled={brackets >= 5}
                  className="w-6 h-6 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-600 rounded transition-colors text-xs disabled:opacity-50"
                  title="增加嵌套"
                >
                  +
                </button>
              </div>
            )}

            <div className="w-px h-5 bg-gray-300"></div>

            {/* 功能按钮 */}
            <button
              onClick={() => handleAction('translate')}
              className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
              title="翻译标签"
            >
              <Languages size={14} />
            </button>
            
            <button
              onClick={() => handleAction('copy')}
              className="p-1 hover:bg-green-100 rounded text-green-600 transition-colors"
              title="复制标签"
            >
              <Copy size={14} />
            </button>
            
            <button
              onClick={() => handleAction('favorite')}
              className={`p-1 rounded transition-colors ${
                isFavorited 
                  ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                  : 'hover:bg-red-100 text-red-600'
              }`}
              title={isFavorited ? "取消收藏" : "收藏标签"}
            >
              <Heart size={14} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
            
            <button
              onClick={() => handleAction('toggle')}
              className={`p-1 rounded transition-colors ${
                isDisabled 
                  ? 'hover:bg-gray-100 text-gray-600' 
                  : 'hover:bg-yellow-100 text-yellow-600'
              }`}
              title={isDisabled ? "启用标签" : "禁用标签"}
            >
              {isDisabled ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            
            <button
              onClick={() => handleAction('reset')}
              disabled={weight === 1.0 && brackets === 0}
              className={`p-1 rounded transition-colors ${
                weight === 1.0 && brackets === 0
                  ? 'opacity-30 cursor-not-allowed text-gray-400'
                  : 'hover:bg-yellow-100 text-yellow-600'
              }`}
              title="重置"
            >
              <RotateCcw size={14} />
            </button>
            
            <button
              onClick={() => handleAction('delete')}
              className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
              title="删除标签"
            >
              <X size={14} />
            </button>
          </div>
          
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white drop-shadow-sm"></div>
        </div>
      )}
    </div>
  );
} 