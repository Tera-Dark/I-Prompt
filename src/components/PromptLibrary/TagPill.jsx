import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Eye, EyeOff, Copy, Heart, Languages, 
  Plus, Minus, RotateCcw, Weight, Square, Circle, Hexagon
} from 'lucide-react';

// 导入通知系统
import { useNotify } from '../common/NotificationSystem';
import { copyToClipboard } from '../../utils/clipboard';
import { translateTag } from '../../services/translationService';

/**
 * 标签药丸组件 - 重构版本
 * 上方显示英文标签，下方显示中文翻译
 * 鼠标悬停时显示悬浮编辑栏
 */
const TagPill = ({ 
  tag, 
  index,
  isDisabled,
  isFavorited = false,
  onDelete, 
  onToggleDisabled,
  onAdjustWeight,
  onAdjustBrackets,
  onCopy,
  onFavorite,
  onTranslate,
  onTranslationUpdate,
  translatedTags,
  hoveredTag,
  setHoveredTag,
  targetLanguage
}) => {
  // 使用通知系统
  const { notifySuccess, notifyError } = useNotify();
  
  const [chineseTranslation, setChineseTranslation] = useState('');
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [isOperating, setIsOperating] = useState(false);
  
  // 使用ref来更稳定地控制悬浮状态
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const operationTimeoutRef = useRef(null);

  // 解析标签格式
  const parseTag = useCallback((tagStr) => {
    if (!tagStr) return { text: '', weight: 1.0, bracketType: 'none', brackets: 0 };
    
    let text = tagStr.trim();
    let weight = 1.0;
    let bracketType = 'none';
    let brackets = 0;
    
    // 解析权重 (text:weight)
    const weightMatch = text.match(/^(.+?):([\d.]+)$/);
    if (weightMatch) {
      text = weightMatch[1];
      weight = parseFloat(weightMatch[2]);
    }
    
    // 解析括号
    const roundMatch = text.match(/^(\(+)(.+?)(\)+)$/);
    const squareMatch = text.match(/^(\[+)(.+?)(\]+)$/);
    const curlyMatch = text.match(/^(\{+)(.+?)(\}+)$/);
    
    if (roundMatch && roundMatch[1].length === roundMatch[3].length) {
      brackets = roundMatch[1].length;
      bracketType = 'round';
      text = roundMatch[2];
    } else if (squareMatch && squareMatch[1].length === squareMatch[3].length) {
      brackets = squareMatch[1].length;
      bracketType = 'square';
      text = squareMatch[2];
    } else if (curlyMatch && curlyMatch[1].length === curlyMatch[3].length) {
      brackets = curlyMatch[1].length;
      bracketType = 'curly';
      text = curlyMatch[2];
    }
    
    return { text, weight, bracketType, brackets };
  }, []);

  const { text, weight, bracketType, brackets } = parseTag(tag);

  // 重构的悬浮控制逻辑 - 更加稳定和可预测
  const showControls = useCallback(() => {
    // 清除所有定时器
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (operationTimeoutRef.current) {
      clearTimeout(operationTimeoutRef.current);
    }
    
    setIsHovered(true);
    setIsControlsVisible(true);
    setHoveredTag(index);
  }, [index, setHoveredTag]);

  const hideControls = useCallback(() => {
    // 如果正在操作，不允许隐藏
    if (isOperating) {
      return;
    }
    
    setIsHovered(false);
    setIsControlsVisible(false);
    setHoveredTag(null);
  }, [setHoveredTag, isOperating]);

  const handleMouseEnter = useCallback(() => {
    showControls();
  }, [showControls]);

  const handleMouseLeave = useCallback((e) => {
    // 如果正在操作，不隐藏
    if (isOperating) {
      return;
    }
    
    // 检查鼠标是否移动到控制栏
    const relatedTarget = e.relatedTarget;
    if (relatedTarget && relatedTarget instanceof Node) {
      if (controlsRef.current?.contains(relatedTarget) || 
          containerRef.current?.contains(relatedTarget)) {
        return; // 不隐藏
      }
    }
    
    // 延迟隐藏
    hoverTimeoutRef.current = setTimeout(hideControls, 150);
  }, [hideControls, isOperating]);

  const handleControlsMouseEnter = useCallback(() => {
    // 清除隐藏定时器
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // 确保控制栏显示
    setIsControlsVisible(true);
  }, []);

  const handleControlsMouseLeave = useCallback((e) => {
    // 如果正在操作，不隐藏
    if (isOperating) {
      return;
    }
    
    // 检查是否回到标签区域
    const relatedTarget = e.relatedTarget;
    if (relatedTarget && relatedTarget instanceof Node && 
        containerRef.current?.contains(relatedTarget)) {
      return; // 不隐藏
    }
    
    // 延迟隐藏
    controlsTimeoutRef.current = setTimeout(hideControls, 100);
  }, [hideControls, isOperating]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (operationTimeoutRef.current) {
        clearTimeout(operationTimeoutRef.current);
      }
    };
  }, []);

  // 监听hoveredTag变化，确保当前标签被选中时保持悬浮栏显示
  useEffect(() => {
    if (hoveredTag === index) {
      setIsControlsVisible(true);
      setIsHovered(true);
    } else if (hoveredTag !== index && !isOperating) {
      setIsControlsVisible(false);
      setIsHovered(false);
    }
  }, [hoveredTag, index, isOperating]);

  // 加载中文翻译
  useEffect(() => {
    const loadTranslation = async () => {
      console.log(`🔍 [TagPill] 开始加载翻译 - 原始标签: "${tag}", 解析文本: "${text}"`);
      
      // 检查缓存的翻译
      if (translatedTags && translatedTags[text]) {
        console.log(`💾 [TagPill] 使用缓存翻译: "${translatedTags[text]}"`);
        setChineseTranslation(translatedTags[text]);
        return;
      }

      // 如果是纯英文且没有找到翻译，自动尝试在线翻译
      if (text && /^[a-zA-Z\s\-_\d]+$/.test(text)) {
        console.log(`🌐 [TagPill] 开始在线翻译: "${text}"`);
        setIsLoadingTranslation(true);
        
        try {
          // 使用翻译引擎进行在线翻译
          const result = await translateTag(text, 'zh');
          
          if (result && result.translatedText) {
            console.log(`✅ [TagPill] 在线翻译成功: "${text}" -> "${result.translatedText}"`);
            setChineseTranslation(result.translatedText);
            
            // 将翻译结果添加到缓存中
            if (translatedTags && typeof translatedTags === 'object') {
              // 这里我们通过回调通知父组件更新翻译缓存
              if (onTranslationUpdate) {
                onTranslationUpdate(text, result.translatedText);
              }
            }
          } else {
            console.log(`⚠️ [TagPill] 在线翻译返回空结果: "${text}"`);
            setChineseTranslation('');
          }
        } catch (error) {
          console.error(`❌ [TagPill] 在线翻译失败: "${text}"`, error);
          setChineseTranslation('');
        } finally {
          setIsLoadingTranslation(false);
        }
      } else {
        console.log(`⚠️ [TagPill] 非英文标签，跳过翻译: "${text}"`);
        setChineseTranslation('');
      }
    };

    if (text) {
      loadTranslation();
    }
  }, [text, translatedTags]);

  // 获取权重颜色
  const getWeightColor = useCallback(() => {
    if (weight >= 1.5) return 'text-red-600';
    if (weight > 1.2) return 'text-orange-600';
    if (weight > 1.0) return 'text-yellow-600';
    if (weight < 0.8) return 'text-blue-600';
    return 'text-green-600';
  }, [weight]);

  // 获取括号颜色
  const getBracketColor = useCallback(() => {
    if (bracketType === 'round') return 'text-blue-600';
    if (bracketType === 'square') return 'text-purple-600';
    if (bracketType === 'curly') return 'text-green-600';
    return 'text-gray-600';
  }, [bracketType]);

  // 重构的事件处理函数 - 简化逻辑
  const handleOperation = useCallback((operation, ...args) => {
    // 设置操作状态，防止悬浮栏消失
    setIsOperating(true);
    
    // 执行操作
    switch (operation) {
      case 'weightAdjust':
        if (onAdjustWeight) {
          onAdjustWeight(index, args[0]);
        }
        break;
      case 'bracketAdjust':
        if (onAdjustBrackets) {
          onAdjustBrackets(index, args[0], args[1]);
        }
        break;
      case 'copy':
        if (onCopy) {
          onCopy(tag);
        }
        break;
      case 'favorite':
        if (onFavorite) {
          onFavorite(tag, chineseTranslation);
        }
        break;
      case 'translate':
        if (onTranslate) {
          onTranslate(tag);
        }
        break;
      case 'toggleDisabled':
        if (onToggleDisabled) {
          onToggleDisabled(index);
        }
        break;
      case 'delete':
        if (onDelete) {
          onDelete(index);
        }
        setIsOperating(false); // 删除操作完成
        hideControls(); // 删除后隐藏控制栏
        return;
      case 'reset':
        if (onAdjustWeight && weight !== 1.0) {
          onAdjustWeight(index, 1.0 - weight);
        }
        if (onAdjustBrackets && brackets > 0) {
          onAdjustBrackets(index, bracketType, -brackets);
        }
        break;
      case 'setBracketType':
        if (onAdjustBrackets) {
          const targetType = args[0];
          // 使用特殊的delta值999表示类型切换
          onAdjustBrackets(index, targetType, 999);
        }
        break;
    }
    
    // 操作后保持控制栏显示，并在短时间后解除操作状态
    showControls();
    
    // 延迟解除操作状态，确保状态更新完成
    operationTimeoutRef.current = setTimeout(() => {
      setIsOperating(false);
    }, 300); // 300ms后解除操作状态
    
  }, [onAdjustWeight, onAdjustBrackets, onCopy, onFavorite, onTranslate, 
      onToggleDisabled, onDelete, index, tag, chineseTranslation, weight, 
      brackets, bracketType, hideControls, showControls]);

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 主标签卡片 */}
      <div className={`
        relative bg-blue-50 border-2 rounded-lg px-3 py-2 transition-all duration-200 cursor-pointer
        ${isDisabled 
          ? 'border-gray-300 bg-gray-100 opacity-50' 
          : 'border-blue-200 hover:border-blue-300 hover:shadow-md'
        }
        ${isHovered ? 'transform scale-105 shadow-lg border-blue-400' : ''}
      `}>
        {/* 英文标签 */}
        <div className="text-center">
          <div className={`text-sm font-medium ${isDisabled ? 'text-gray-500' : 'text-blue-700'}`}>
            {text}
            {/* 权重显示 */}
            {weight !== 1.0 && (
              <span className={`ml-1 text-xs ${getWeightColor()}`}>
                :{weight.toFixed(1)}
              </span>
            )}
            {/* 括号显示 */}
            {brackets > 0 && (
              <span className={`ml-1 text-xs ${getBracketColor()}`}>
                {bracketType === 'round' && '()'}
                {bracketType === 'square' && '[]'}
                {bracketType === 'curly' && '{}'}
                {brackets > 1 && `×${brackets}`}
              </span>
            )}
          </div>
          
          {/* 中文翻译 - 总是显示翻译区域 */}
          <div className={`text-xs mt-1 px-2 py-1 rounded transition-all ${
            isDisabled 
              ? 'text-gray-400 bg-gray-50' 
              : chineseTranslation 
                ? 'text-orange-600 bg-orange-50 border border-orange-200'
                : 'text-gray-500 bg-gray-50 border border-gray-200'
          }`}>
            {isLoadingTranslation ? (
              <span className="text-blue-500">翻译中...</span>
            ) : chineseTranslation ? (
              chineseTranslation
            ) : (
              <span className="text-gray-400">点击翻译按钮获取中文</span>
            )}
          </div>
        </div>
      </div>

      {/* 悬浮编辑控制栏 - 精简一行布局 */}
      {isControlsVisible && (
        <div 
          ref={controlsRef}
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
          onMouseEnter={handleControlsMouseEnter}
          onMouseLeave={handleControlsMouseLeave}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl px-3 py-2 flex items-center gap-2">
            
            {/* 权重控制 - 总是显示，直接修改数值 */}
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded border">
              <button
                onClick={() => handleOperation('weightAdjust', -0.1)}
                disabled={weight <= 0.1}
                className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="降低权重"
              >
                <Minus size={12} />
              </button>
              <span className="text-xs font-mono min-w-[2rem] text-center font-semibold">
                {weight.toFixed(1)}
              </span>
              <button
                onClick={() => handleOperation('weightAdjust', 0.1)}
                disabled={weight >= 2.0}
                className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="提高权重"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* 括号控制 - 三个按钮共用嵌套数值 */}
            <div className="flex items-center gap-1">
              {/* 括号类型选择 */}
              <button
                onClick={() => handleOperation('setBracketType', 'round')}
                className={`px-1.5 py-1 text-xs rounded transition-colors border ${
                  bracketType === 'round' 
                    ? 'bg-blue-100 text-blue-700 border-blue-300' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
                title="圆括号"
              >
                ()
              </button>
              <button
                onClick={() => handleOperation('setBracketType', 'square')}
                className={`px-1.5 py-1 text-xs rounded transition-colors border ${
                  bracketType === 'square' 
                    ? 'bg-purple-100 text-purple-700 border-purple-300' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
                title="方括号"
              >
                []
              </button>
              <button
                onClick={() => handleOperation('setBracketType', 'curly')}
                className={`px-1.5 py-1 text-xs rounded transition-colors border ${
                  bracketType === 'curly' 
                    ? 'bg-green-100 text-green-700 border-green-300' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
                title="花括号"
              >
                {"{}"}
              </button>
              
              {/* 嵌套数值控制 - 只在有括号时显示 */}
              {brackets > 0 && (
                <>
                  <button
                    onClick={() => handleOperation('bracketAdjust', bracketType, -1)}
                    disabled={brackets <= 1}
                    className="w-6 h-6 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    title="减少嵌套"
                  >
                    -
                  </button>
                  <span className="text-xs text-gray-600 min-w-[1.5rem] text-center">
                    ×{brackets}
                  </span>
                  <button
                    onClick={() => handleOperation('bracketAdjust', bracketType, 1)}
                    disabled={brackets >= 5}
                    className="w-6 h-6 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-600 rounded transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    title="增加嵌套"
                  >
                    +
                  </button>
                </>
              )}
            </div>

            {/* 分隔线 */}
            <div className="w-px h-5 bg-gray-300"></div>

            {/* 功能按钮 - 只保留图标 */}
            <button
              onClick={() => handleOperation('translate')}
              className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
              title="翻译标签"
            >
              <Languages size={14} />
            </button>
            
            <button
              onClick={() => handleOperation('copy')}
              className="p-1 hover:bg-green-100 rounded text-green-600 transition-colors"
              title="复制标签"
            >
              <Copy size={14} />
            </button>
            
            <button
              onClick={() => handleOperation('favorite')}
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
              onClick={() => handleOperation('toggleDisabled')}
              className={`p-1 rounded transition-colors ${
                isDisabled 
                  ? 'hover:bg-gray-100 text-gray-600' 
                  : 'hover:bg-yellow-100 text-yellow-600'
              }`}
              title={isDisabled ? "启用标签" : "禁用标签"}
            >
              {isDisabled ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            
            {/* 重置按钮 - 只在有修改时激活 */}
            <button
              onClick={() => handleOperation('reset')}
              disabled={weight === 1.0 && brackets === 0}
              className={`p-1 rounded transition-colors ${
                weight === 1.0 && brackets === 0
                  ? 'opacity-30 cursor-not-allowed text-gray-400'
                  : 'hover:bg-yellow-100 text-yellow-600'
              }`}
              title="重置到原始状态"
            >
              <RotateCcw size={14} />
            </button>
            
            <button
              onClick={() => handleOperation('delete')}
              className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
              title="删除标签"
            >
              <X size={14} />
            </button>
          </div>
          
          {/* 指向标签的箭头 */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white drop-shadow-sm"></div>
        </div>
      )}
    </div>
  );
};

export default TagPill; 