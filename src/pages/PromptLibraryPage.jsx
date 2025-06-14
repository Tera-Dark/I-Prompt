/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, Copy, X, Languages, 
  Sparkles, Settings, RefreshCw,
  Globe, ArrowRightLeft, Database, BookOpen, Edit3, Tag as TagIcon
} from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import { useMultiTranslation } from '../hooks/useMultiTranslation';
import TranslationEngineStatus from '../components/TranslationEngineStatus';
import { 
  getTagDatabase,
  searchTags,
  tagDatabaseService
} from '../services/tagDatabaseService';

// 导入拆分的组件
import TagPill from '../components/PromptLibrary/TagPill';
import { 
  TagCard, 
  TutorialModal,
  CategorySidebar,
  TagManagerToolbar
} from '../components/PromptLibrary';

// 导入通知系统
import { useNotify } from '../components/common/NotificationSystem';

const PromptLibraryPage = () => {
  // 使用通知系统
  const { notifySuccess, notifyError, showWarning, showInfo } = useNotify();

  // 使用多引擎翻译系统
  const {
    isTranslating: isMultiTranslating,
    currentEngine,
    translationError,
    translate,
    batchTranslate,
    switchEngine,
    getAllEngines,
    getEngineStatus,
    refreshEngines,
    detectLanguage: detectLang,
    getTranslationStats
  } = useMultiTranslation();

  // 提示词编辑状态
  const [inputPrompt, setInputPrompt] = useState('');
  const [englishPrompt, setEnglishPrompt] = useState('');
  const [isTranslatingPrompt, setIsTranslatingPrompt] = useState(false);
  const [inputLanguage, setInputLanguage] = useState('auto');
  
  // 提示词编辑器状态
  const [selectedTags, setSelectedTags] = useState([]);
  const [disabledTags, setDisabledTags] = useState(new Set());
  const [translatedTags, setTranslatedTags] = useState({});
  const [hoveredTag, setHoveredTag] = useState(null);
  
  // 翻译设置状态
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [autoTranslate, setAutoTranslate] = useState(true);
  
  // 标签库状态
  const [selectedCategory, setSelectedCategory] = useState('favorites');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({ favorites: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // 库模式切换状态
  const [libraryMode, setLibraryMode] = useState('default'); // 'default' | 'custom'
  const [customLibrary, setCustomLibrary] = useState({
    categories: {
      'favorites': {
        name: '我的收藏',
        icon: '⭐',
        subcategories: {
          'personal': {
            name: '个人收藏',
            tags: [],
            isDefault: false
          }
        }
      },
      'personal-tags': {
        name: '个人标签',
        icon: '🏷️',
        subcategories: {
          'custom': {
            name: '自定义标签',
            tags: [],
            isDefault: false
          }
        }
      }
    }
  });
  
  // 自定义库管理状态
  const [showCustomLibraryManager, setShowCustomLibraryManager] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryData, setNewCategoryData] = useState({ name: '', icon: '📁' });
  const [newSubcategoryData, setNewSubcategoryData] = useState({ name: '' });
  
  // 标签库管理状态
  const [showTagManager, setShowTagManager] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [newTagData, setNewTagData] = useState({ en: '', cn: '', frequency: 50 });
  const [importExportData, setImportExportData] = useState('');
  
  // UI状态
  const [favorites, setFavorites] = useState([]);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const textareaRef = useRef(null);
  const selectedTagsRef = useRef(selectedTags);
  const disabledTagsRef = useRef(disabledTags);

  // 更新ref
  useEffect(() => {
    selectedTagsRef.current = selectedTags;
    disabledTagsRef.current = disabledTags;
  }, [selectedTags, disabledTags]);

  // 状态保护变量
  const [updateSource, setUpdateSource] = useState(null);

  // 翻译状态管理
  const [translationState, setTranslationState] = useState({
    status: 'idle',
    source: null,
    lastInput: '',
    completedAt: 0
  });

  // 翻译状态机控制器
  const translationController = useMemo(() => ({
    start: (source, input) => {
      console.log(`🎬 [TranslationController] 开始翻译 source=${source}, input="${input}"`);
      setTranslationState({
        status: 'translating',
        source,
        lastInput: input,
        completedAt: 0
      });
      setIsTranslatingPrompt(true);
      setUpdateSource(source);
    },
    
    complete: (result) => {
      console.log(`🏁 [TranslationController] 翻译完成: "${result}"`);
      setTranslationState(prev => ({
        ...prev,
        status: 'completed',
        completedAt: Date.now()
      }));
      setIsTranslatingPrompt(false);
      setTimeout(() => {
        setUpdateSource(null);
        setTranslationState(prev => ({
          ...prev,
          status: 'idle'
        }));
      }, 1000);
    },
    
    error: (error) => {
      console.log(`❌ [TranslationController] 翻译失败:`, error);
      setTranslationState(prev => ({
        ...prev,
        status: 'error',
        completedAt: Date.now()
      }));
      setIsTranslatingPrompt(false);
      setTimeout(() => {
        setUpdateSource(null);
        setTranslationState(prev => ({
          ...prev,
          status: 'idle'
        }));
      }, 500);
    },
    
    shouldTranslate: (input) => {
      const state = translationState;
      if (state.status === 'translating') {
        console.log(`🛑 [TranslationController] 正在翻译中，跳过`);
        return false;
      }
      
      if (state.lastInput === input) {
        console.log(`🛑 [TranslationController] 输入内容未变化，跳过: "${input}"`);
        return false;
      }
      
      if (state.completedAt > 0 && Date.now() - state.completedAt < 1000) {
        console.log(`🛑 [TranslationController] 防抖期内，跳过翻译`);
        return false;
      }
      
      return true;
    }
  }), [translationState]);

  // 页面加载时的初始化
  useEffect(() => {
    console.log('🚀 [PromptLibraryPage] 组件初始化');
    
    // 设置初始测试数据，不进行任何翻译预设
    const testTags = ['beautiful girl', 'anime style', 'masterpiece', 'blue eyes', 'long hair'];
    setSelectedTags(testTags);
    setEnglishPrompt(testTags.join(', '));
    
    console.log('📝 [初始化] 设置初始标签，等待真正的翻译引擎处理');
    
    // 初始化收藏夹数据
    const favoritesList = tagDatabaseService.getFavorites();
    if (favoritesList && favoritesList.length > 0) {
      setFavorites(favoritesList);
    }

    // 加载自定义库数据
    try {
      const savedCustomLibrary = localStorage.getItem('customTagLibrary');
      if (savedCustomLibrary) {
        const parsedLibrary = JSON.parse(savedCustomLibrary);
        setCustomLibrary(parsedLibrary);
        console.log('📚 [初始化] 加载自定义库数据:', parsedLibrary);
      }
    } catch (error) {
      console.error('加载自定义库数据失败:', error);
    }


  }, []);

  // 保存收藏到localStorage
  useEffect(() => {
    try {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('保存收藏失败:', error);
      notifyError('save', '收藏数据保存失败');
    }
  }, [favorites]);

  // 保存自定义库到localStorage
  useEffect(() => {
    try {
      localStorage.setItem('customTagLibrary', JSON.stringify(customLibrary));
    } catch (error) {
      console.error('保存自定义库失败:', error);
      notifyError('save', '自定义库保存失败');
    }
  }, [customLibrary]);

  // 搜索功能
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchTags(searchQuery).slice(0, 20);
      setSearchResults(results);
        } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // 自动翻译效果
  useEffect(() => {
    if (!autoTranslate || !inputPrompt.trim()) {
    if (!inputPrompt.trim()) {
        console.log('🧹 [useEffect-autoTranslate] 输入为空，清空内容');
        setEnglishPrompt('');
        setSelectedTags([]);
        setDisabledTags(new Set());
        setInputLanguage('auto');
      }
      return;
    }
    
    if (!translationController.shouldTranslate(inputPrompt)) {
      return;
    }
    
    console.log('🚀 [useEffect-autoTranslate] 准备自动翻译');
      const timer = setTimeout(() => {
        handleAutoTranslation();
    }, 1000);
      
      return () => clearTimeout(timer);
  }, [inputPrompt, autoTranslate, translationController]);

  // 清理翻译结果的通用函数
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

  // 自动翻译处理函数
  const handleAutoTranslation = useCallback(async () => {
    if (!inputPrompt.trim()) return;
    
    const text = inputPrompt.trim();
    console.log('🚀 [handleAutoTranslation] 开始自动翻译:', text);
    
    try {
      translationController.start('input', text);
      setUpdateSource('translation'); // 设置更新源为翻译
      
      // 检测输入语言
      const detectedLang = detectLanguage(text);
      console.log('🔍 [handleAutoTranslation] 检测到语言:', detectedLang);
      
      // 根据检测到的语言决定翻译方向
      let fromLang = detectedLang;
      let toLang = targetLanguage;
      
      // 如果输入是中文，强制翻译到英文（AI绘画标准）
      if (detectedLang === 'zh') {
        toLang = 'en';
        console.log('🎯 [handleAutoTranslation] 中文输入，翻译到英文');
      }
      
      const result = await translate(text, toLang, fromLang);
      const rawTranslation = result?.translatedText || result || text;
      
      console.log('📝 [handleAutoTranslation] 原始翻译结果:', rawTranslation);
      
      // 清理翻译结果
      const cleanedTranslation = cleanTranslationResult(rawTranslation);
      console.log('✨ [handleAutoTranslation] 清理后结果:', cleanedTranslation);
      
      // 如果清理后为空或与原文相同，使用原文
      const finalText = cleanedTranslation && cleanedTranslation !== text ? cleanedTranslation : text;
      
      // 标准化英文术语
      const standardizedText = standardizeEnglishTerms(finalText);
      setEnglishPrompt(standardizedText);
      
      // 解析标签
      const newTags = standardizedText.split(/[,，]/)
        .map(tag => tag.trim())
        .filter(tag => tag);
      setSelectedTags(newTags);
      setDisabledTags(new Set());
      
      translationController.complete(standardizedText);
      
      if (cleanedTranslation && cleanedTranslation !== text) {
        notifySuccess('translate', `翻译成功: ${text} → ${cleanedTranslation}`);
      } else {
        notifySuccess('info', '内容已处理，无需翻译');
      }
      
    } catch (error) {
      console.error('❌ [handleAutoTranslation] 翻译失败:', error);
      translationController.error(error);
      notifyError('translate', error.message || '翻译服务暂时不可用');
      
      // 失败时使用原文
      setEnglishPrompt(text);
      const newTags = text.split(/[,，]/).map(tag => tag.trim()).filter(tag => tag);
      setSelectedTags(newTags);
      setDisabledTags(new Set());
    } finally {
      // 清除更新源标记
      setTimeout(() => setUpdateSource(null), 500);
    }
  }, [inputPrompt, targetLanguage, inputLanguage, autoTranslate, translationController, notifySuccess, notifyError]);

  // 标准化英文术语
  const standardizeEnglishTerms = (text) => {
    // 这里可以添加标准化处理逻辑
    return text;
  };

  // 解析标签格式（权重、括号等）
  const parseTag = (tag) => {
    const tagStr = typeof tag === 'string' ? tag : (tag?.en || String(tag));
    
    if (!tagStr) {
      return { text: '', weight: 1.0, bracketType: 'none', brackets: 0 };
    }
    
    let text = tagStr.trim();
    let weight = 1.0;
    let bracketType = 'none';
    let brackets = 0;
    
    // 首先检查权重格式 (text:weight)
    const weightMatch = text.match(/^\(([^:()]+):(\d+(?:\.\d+)?)\)$/);
    if (weightMatch) {
      text = weightMatch[1];
      weight = parseFloat(weightMatch[2]);
      return { text, weight, bracketType: 'none', brackets: 0 };
    }
    
    // 检查括号嵌套（没有权重的情况）
    let originalText = text;
    
    // 检测圆括号
    if (text.startsWith('(') && text.endsWith(')')) {
      bracketType = 'round';
      while (text.startsWith('(') && text.endsWith(')') && brackets < 5) {
        text = text.slice(1, -1);
        brackets++;
      }
    }
    // 检测方括号
    else if (text.startsWith('[') && text.endsWith(']')) {
      bracketType = 'square';
      while (text.startsWith('[') && text.endsWith(']') && brackets < 5) {
        text = text.slice(1, -1);
        brackets++;
      }
    }
    // 检测花括号
    else if (text.startsWith('{') && text.endsWith('}')) {
      bracketType = 'curly';
      while (text.startsWith('{') && text.endsWith('}') && brackets < 5) {
        text = text.slice(1, -1);
        brackets++;
      }
    }
    
    // 如果解析后的文本为空或不合理，使用原始文本
    if (!text.trim()) {
      text = originalText;
      bracketType = 'none';
      brackets = 0;
    }
    
    return { text, weight, bracketType, brackets };
  };

  // 构建标签字符串
  const buildTag = (text, weight, bracketType, brackets) => {
    let result = text;
    
    // 添加权重
    if (weight !== 1.0) {
      result = `(${text}:${weight.toFixed(1)})`;
      return result;
    }
    
    // 添加括号
    if (bracketType === 'round') {
      for (let i = 0; i < brackets; i++) {
        result = `(${result})`;
      }
    } else if (bracketType === 'curly') {
      for (let i = 0; i < brackets; i++) {
        result = `{${result}}`;
      }
    } else if (bracketType === 'square') {
      for (let i = 0; i < brackets; i++) {
        result = `[${result}]`;
      }
    }
    
    return result;
  };

  // 获取当前标签列表
  const getCurrentTags = () => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    
    const currentDatabase = libraryMode === 'custom' ? customLibrary?.categories : getTagDatabase();
    
    if (!currentDatabase) {
      return [];
    }
    
    if (selectedCategory === 'favorites') {
      if (selectedSubcategory === 'personal') {
        return favorites;
      } else if (selectedSubcategory === 'popular') {
        if (libraryMode === 'default') {
          return currentDatabase?.favorites?.subcategories?.popular?.tags || [];
      } else {
          return [];
        }
      } else {
        const allFavoriteTags = [...favorites];
        
        if (libraryMode === 'default' && currentDatabase?.favorites?.subcategories) {
          Object.entries(currentDatabase.favorites.subcategories).forEach(([subKey, subcategory]) => {
            if (subKey !== 'personal' && subcategory?.tags) {
              allFavoriteTags.push(...subcategory.tags);
            }
          });
        }
        
        const uniqueTags = [];
        const seen = new Set();
        allFavoriteTags.forEach(tag => {
          if (tag && tag.en && !seen.has(tag.en)) {
            seen.add(tag.en);
            uniqueTags.push(tag);
          }
        });
        
        return uniqueTags;
      }
    }
    
    const category = currentDatabase?.[selectedCategory];
    if (!category) return [];
    
    if (selectedSubcategory) {
      const subcategory = category.subcategories?.[selectedSubcategory];
      return subcategory?.tags || [];
    }
    
    const allTags = [];
    if (category.subcategories) {
    Object.values(category.subcategories).forEach(subcategory => {
        if (subcategory?.tags) {
      allTags.push(...subcategory.tags);
        }
    });
    }
    return allTags;
  };

  const currentTags = getCurrentTags();

  // 简单的语言检测函数
  const detectLanguage = (text) => {
    if (!text || !text.trim()) return 'auto';
    
    // 检测中文
    if (/[\u4e00-\u9fa5]/.test(text)) {
      return 'zh';
    }
    
    // 检测英文
    if (/^[a-zA-Z\s\-_\d,，.]+$/.test(text.trim())) {
      return 'en';
    }
    
    // 其他情况
    return 'auto';
  };

  // 处理输入提示词变化
  const handleInputPromptChange = (value) => {
    console.log('📝 [handleInputPromptChange] 输入内容变化:', value);
    setInputPrompt(value);
    
    // 自动检测语言
    const detectedLang = detectLanguage(value);
    console.log('🔍 [handleInputPromptChange] 检测到语言:', detectedLang);
    setInputLanguage(detectedLang);
    
    // 清空现有标签，让翻译结果来重新填充
    if (value.trim() === '') {
      console.log('🧹 [handleInputPromptChange] 输入为空，清空所有内容');
      setEnglishPrompt('');
      setSelectedTags([]);
      setDisabledTags(new Set());
      setInputLanguage('auto');
      return;
    }

    // 如果开启自动翻译且内容不为空
    if (autoTranslate && value.trim()) {
      console.log('⏰ [handleInputPromptChange] 设置延迟翻译');
      // 延迟执行翻译，避免频繁操作
      clearTimeout(window.autoTranslateTimeout);
      window.autoTranslateTimeout = setTimeout(() => {
        if (translationController.shouldTranslate(value)) {
          console.log('🚀 [handleInputPromptChange] 执行延迟翻译');
          handleAutoTranslation();
        }
      }, 1200); // 增加延迟时间，避免频繁翻译
    }
  };

  // 新增：处理英文输出栏变化，同步到提示词编辑区
  const handleEnglishPromptChange = (value) => {
    console.log('🔄 [handleEnglishPromptChange] 英文输出栏内容变化:', value);
    
    setEnglishPrompt(value);
    
    // 如果不是由翻译或添加标签触发的更新，则同步到提示词编辑区
    if (updateSource !== 'translation' && updateSource !== 'add-tag' && updateSource !== 'tag-edit') {
      console.log('📝 [handleEnglishPromptChange] 手动输入，同步到提示词编辑区');
      
      // 解析英文提示词为标签
      const newTags = value.split(/[,，]/)
        .map(tag => tag.trim())
        .filter(tag => tag);
      
      setSelectedTags(newTags);
      setDisabledTags(new Set()); // 重置禁用状态
      
      console.log('📝 [handleEnglishPromptChange] 标签将通过TagPill组件自动翻译');
      
      // 同步到中文输入区（如果没有正在翻译）
      if (!isTranslatingPrompt) {
        setInputPrompt(value);
      }
    }
  };

  // 添加标签到提示词
  const addTag = useCallback((tagToAdd, fromDatabase = false) => {
    console.log('🏷️ [addTag] 添加标签:', tagToAdd, '来源:', fromDatabase ? '数据库' : '手动');
    
    setUpdateSource('add-tag'); // 设置更新源为添加标签
    
    let tagText = ''; // 在try块外部定义，确保catch块可以访问
    
    try {
      if (typeof tagToAdd === 'string') {
        tagText = tagToAdd.trim();
      } else if (tagToAdd && typeof tagToAdd === 'object') {
        tagText = tagToAdd.en || tagToAdd.tag || String(tagToAdd);
      } else {
        console.warn('⚠️ [addTag] 无效的标签格式:', tagToAdd);
        return;
      }
      
      if (!tagText) {
        console.warn('⚠️ [addTag] 标签内容为空');
        return;
      }
      
      // 检查是否已存在
      if (selectedTags.includes(tagText)) {
        console.log('ℹ️ [addTag] 标签已存在:', tagText);
        notifySuccess('info', `标签已存在: ${tagText}`);
        return;
      }
      
      // 添加到选中标签
      setSelectedTags(prev => {
        const newTags = [...prev, tagText];
        console.log('📝 [addTag] 更新标签列表:', newTags);
        
        // 同步更新英文输出栏
        const enabledTags = newTags.filter((_, index) => !disabledTags.has(index));
        setEnglishPrompt(enabledTags.join(', '));
        
        return newTags;
      });
      
      console.log('📝 [addTag] 标签已添加，翻译将由TagPill组件自动处理');
      
      notifySuccess('add', fromDatabase ? '从数据库添加' : '手动添加', tagText);
      
    } catch (error) {
      console.error('❌ [addTag] 添加标签失败:', error);
      notifyError('add', error.message, tagText || String(tagToAdd));
    } finally {
      
      // 清除更新源标记
      setTimeout(() => setUpdateSource(null), 100);
    }
  }, [selectedTags, disabledTags, notifySuccess, notifyError]);

  // 删除标签
  const deleteTag = (index) => {
    const tagToDelete = selectedTags[index];
    setUpdateSource('tag-edit'); // 设置更新源为标签编辑
    
    setSelectedTags(prev => {
      const newTags = prev.filter((_, i) => i !== index);
      
      // 同步更新英文输出栏
      const enabledIndices = Array.from({ length: newTags.length }, (_, i) => i)
        .filter(i => !disabledTags.has(i < index ? i : i + 1));
      const enabledTags = newTags.filter((_, i) => enabledIndices.includes(i));
      setEnglishPrompt(enabledTags.join(', '));
      
      return newTags;
    });
    
    setDisabledTags(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      const adjustedSet = new Set();
      Array.from(newSet).forEach(i => {
        if (i > index) {
          adjustedSet.add(i - 1);
        } else if (i < index) {
          adjustedSet.add(i);
        }
      });
      return adjustedSet;
    });

    notifySuccess('delete', tagToDelete);

    // 清除更新源标记
    setTimeout(() => setUpdateSource(null), 100);
  };

  // 切换标签禁用状态
  const toggleDisabled = (index) => {
    const tag = selectedTags[index];
    const isCurrentlyDisabled = disabledTags.has(index);
    
    setUpdateSource('tag-edit'); // 设置更新源为标签编辑
    
    setDisabledTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      
      // 同步更新英文输出栏
      const enabledTags = selectedTags.filter((_, i) => !newSet.has(i));
      setEnglishPrompt(enabledTags.join(', '));
      
      return newSet;
    });

    notifySuccess(isCurrentlyDisabled ? 'enable' : 'disable', tag);

    // 清除更新源标记
    setTimeout(() => setUpdateSource(null), 100);
  };

  // 调整权重 - 全新优化版本
  const adjustWeight = (index, delta) => {
    setUpdateSource('tag-edit'); // 设置更新源为标签编辑
    
    setSelectedTags(prev => {
      const newTags = [...prev];
      const tag = newTags[index];
      
      // 解析当前标签格式
      const { text, weight: currentWeight, bracketType, brackets } = parseTag(tag);
      
      // 如果有括号，不允许调整权重
      if (brackets > 0) {
        console.warn('有括号的标签不能调整权重');
        return prev;
      }
      
      // 计算新权重，限制在0.1-2.0之间
      let newWeight;
      if (typeof delta === 'number' && delta !== 0) {
        newWeight = Math.max(0.1, Math.min(2.0, currentWeight + delta));
        newWeight = Math.round(newWeight * 10) / 10; // 保留一位小数
    } else {
        // 如果delta是目标权重值
        newWeight = Math.max(0.1, Math.min(2.0, delta));
        newWeight = Math.round(newWeight * 10) / 10;
      }
      
      // 构建新标签
      if (newWeight === 1.0) {
        newTags[index] = text; // 权重为1.0时不显示权重
      } else {
        newTags[index] = `(${text}:${newWeight.toFixed(1)})`; // 权重格式: (tag:1.1)
      }
      
      // 同步更新英文输出栏
      const enabledTags = newTags.filter((_, i) => !disabledTags.has(i));
      setEnglishPrompt(enabledTags.join(', '));
      
      return newTags;
    });

    notifySuccess('update', `权重调整为 ${(parseTag(selectedTags[index]).weight + delta).toFixed(1)}`);

    // 清除更新源标记
    setTimeout(() => setUpdateSource(null), 100);
  };

  // 调整括号 - 全新优化版本
  const adjustBrackets = (index, bracketType, delta) => {
    setUpdateSource('tag-edit'); // 设置更新源为标签编辑
    
    setSelectedTags(prev => {
      const newTags = [...prev];
      const tag = newTags[index];
      
      // 解析当前标签格式
      const parsed = parseTag(tag);
      let { text, weight, bracketType: currentBracketType, brackets: currentBrackets } = parsed;
      
      // 如果有权重，不允许调整括号
      if (weight !== 1.0) {
        console.warn('有权重的标签不能调整括号');
        return prev;
      }
      
      let newBrackets = currentBrackets;
      let newBracketType = currentBracketType;
      
      // 特殊处理：delta为999表示类型切换，保持当前层数
      if (delta === 999) {
        if (currentBrackets > 0 && currentBracketType !== bracketType) {
          // 切换类型，保持层数
          newBracketType = bracketType;
          newBrackets = currentBrackets;
        } else if (currentBrackets === 0) {
          // 没有括号时，添加1层新类型
          newBracketType = bracketType;
          newBrackets = 1;
        } else if (currentBracketType === bracketType) {
          // 相同类型时，清除所有括号
          newBrackets = 0;
          newBracketType = 'none';
        }
      } else if (delta > 0) {
        // 添加括号
        if (currentBrackets === 0) {
          // 第一次添加括号，设置类型
          newBracketType = bracketType;
          newBrackets = 1;
        } else if (currentBracketType === bracketType) {
          // 相同类型，增加层数（最多5层）
          newBrackets = Math.min(5, currentBrackets + 1);
        } else {
          // 不同类型，不允许混用
          console.warn('不能混用不同类型的括号');
          return prev;
        }
      } else if (delta < 0) {
        // 减少括号
        newBrackets = Math.max(0, currentBrackets - 1);
        if (newBrackets === 0) {
          newBracketType = 'none';
        }
      }
      
      // 构建新标签
      let newTag = text;
      if (newBrackets > 0) {
        const bracketPairs = {
          'round': ['(', ')'],
          'square': ['[', ']'],
          'curly': ['{', '}']
        };
        
        const [open, close] = bracketPairs[newBracketType] || ['(', ')'];
        
        // 添加指定层数的括号
        for (let i = 0; i < newBrackets; i++) {
          newTag = open + newTag + close;
        }
      }
      
      newTags[index] = newTag;
      
      // 同步更新英文输出栏
      const enabledTags = newTags.filter((_, i) => !disabledTags.has(i));
      setEnglishPrompt(enabledTags.join(', '));
      
      return newTags;
    });

    const action = delta > 0 ? '添加' : '减少';
    const bracketName = {
      'round': '圆括号',
      'square': '方括号', 
      'curly': '花括号'
    }[bracketType] || '括号';
    
    notifySuccess('update', `${action}${bracketName}`);

    // 清除更新源标记
    setTimeout(() => setUpdateSource(null), 100);
  };

  // 复制标签
  const copyTag = async (tag) => {
    try {
      await copyToClipboard(tag);
      notifySuccess('copy', tag);
    } catch (error) {
      notifyError('copy', '复制失败', tag);
    }
  };

  // 收藏标签
  const favoriteTag = async (tag, chineseTranslation = null) => {
    const tagText = typeof tag === 'string' ? tag : tag.en;
    const tagObj = {
      en: tagText,
      cn: chineseTranslation || (typeof tag === 'object' ? tag.cn : ''),
      frequency: 50,
      id: `fav-${Date.now()}`
    };
    
    // 检查是否已收藏
    const existingIndex = favorites.findIndex(fav => fav.en === tagObj.en);
    
    if (existingIndex >= 0) {
      // 已收藏，执行取消收藏
      setFavorites(prev => prev.filter((_, index) => index !== existingIndex));
      notifySuccess('delete', `取消收藏: ${tagObj.en}`);
    } else {
      // 未收藏，执行收藏
      setFavorites(prev => [...prev, tagObj]);
      notifySuccess('favorite', tagObj.en);
    }
  };

  // 复制功能 - 支持多种内容类型
  const handleCopy = async (text) => {
    let contentToCopy = '';
    let contentType = '';
    
    if (text && text.trim()) {
      // 明确指定要复制的内容
      contentToCopy = text.trim();
      contentType = '内容';
    } else if (englishPrompt && englishPrompt.trim()) {
      // 复制英文输出栏内容
      contentToCopy = englishPrompt.trim();
      contentType = '英文提示词';
    } else if (selectedTags.length > 0) {
      // 复制当前启用的标签
      const enabledTags = selectedTags.filter((_, index) => !disabledTags.has(index));
      if (enabledTags.length > 0) {
        contentToCopy = enabledTags.join(', ');
        contentType = `${enabledTags.length}个标签`;
      }
    }
    
    if (contentToCopy) {
      try {
        console.log('📋 [handleCopy] 复制内容:', contentToCopy);
        await copyToClipboard(contentToCopy);
        notifySuccess('copy', `${contentType}已复制到剪贴板`);
      } catch (error) {
        console.error('❌ [handleCopy] 复制失败:', error);
        notifyError('copy', '复制失败，请重试');
      }
    } else {
      console.log('⚠️ [handleCopy] 没有内容可复制');
      notifyError('copy', '没有内容可复制');
    }
  };

  // 翻译单个标签
  const translateSingleTag = async (text) => {
    try {
      // 如果是标签对象，解析获取纯文本；如果已经是文本，直接使用
      const tagText = typeof text === 'string' ? text : parseTag(text).text;
      
      // 检查是否为英文标签，只翻译英文标签
      if (!/^[a-zA-Z\s\-_\d]+$/.test(tagText)) {
        console.log(`⚠️ [translateSingleTag] 跳过非英文标签: "${tagText}"`);
        return null;
      }
      
      console.log(`🌐 [translateSingleTag] 开始翻译英文标签: "${tagText}"`);
      
      const result = await translate(tagText, 'zh', 'en'); // 明确指定英文到中文
      const rawTranslation = result?.translatedText || result;
      
      if (rawTranslation) {
        console.log(`📝 [translateSingleTag] 原始翻译结果: "${rawTranslation}"`);
        
        // 使用统一的清理函数
        const cleanTranslation = cleanTranslationResult(rawTranslation);
        console.log(`✨ [translateSingleTag] 清理后结果: "${cleanTranslation}"`);
        
        // 如果清理后为空或与原文相同，返回null
        if (!cleanTranslation || cleanTranslation === tagText) {
          console.log(`⚠️ [translateSingleTag] 翻译结果无效或未变化`);
          return null;
        }
        
        // 检查是否为合理的中文翻译
        if (!/[\u4e00-\u9fa5]/.test(cleanTranslation)) {
          console.log(`⚠️ [translateSingleTag] 翻译结果不包含中文: "${cleanTranslation}"`);
          return null;
        }
        
        setTranslatedTags(prev => ({
          ...prev,
          [tagText]: cleanTranslation
        }));
        
        console.log(`✅ [translateSingleTag] 翻译成功: ${tagText} -> ${cleanTranslation}`);
        notifySuccess('translate', `${tagText} → ${cleanTranslation}`);
        
        // 返回清理后的结果
        return { 
          ...result, 
          translatedText: cleanTranslation 
        };
      } else {
        console.log(`❌ [translateSingleTag] 翻译返回空结果`);
        return null;
      }
    } catch (error) {
      console.error('❌ [translateSingleTag] 翻译失败:', error);
      notifyError('translate', error.message || '翻译失败', text);
      return null;
    }
  };



  // 切换分类
  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  const selectCategory = (categoryKey, subcategoryKey = null) => {
    setSelectedCategory(categoryKey);
    setSelectedSubcategory(subcategoryKey);
    setSearchQuery('');
  };

  // 获取当前数据库
  const currentDatabase = libraryMode === 'custom' ? customLibrary?.categories : getTagDatabase();

  // 翻译全部标签
  const translateAllTags = async () => {
    if (selectedTags.length === 0) {
      showWarning('没有标签需要翻译');
      return;
    }

    console.log('🌐 [translateAllTags] 开始翻译所有标签:', selectedTags);
    const newTranslations = {};
    let translatedCount = 0;
    let skippedCount = 0;
    let nonEnglishCount = 0;

    for (const tag of selectedTags) {
      // 解析标签获取纯文本
      const { text } = parseTag(tag);
      
      // 检查是否已有翻译缓存
      if (translatedTags[text]) {
        console.log('📖 [translateAllTags] 跳过已翻译的标签:', text);
        skippedCount++;
        continue;
      }

      // 检查是否为英文标签
      if (!/^[a-zA-Z\s\-_\d]+$/.test(text)) {
        console.log('⚠️ [translateAllTags] 跳过非英文标签:', text);
        nonEnglishCount++;
        continue;
      }

      try {
        await new Promise(resolve => setTimeout(resolve, 300)); // 防止频率限制
        console.log(`🌐 [translateAllTags] 开始翻译: "${text}"`);
        
        const result = await translate(text, 'zh', 'en'); // 明确指定英文到中文
        const rawTranslation = result?.translatedText || result;
        
        if (rawTranslation) {
          console.log(`📝 [translateAllTags] 原始翻译结果: "${rawTranslation}"`);
          
          // 使用统一的清理函数
          const cleanTranslation = cleanTranslationResult(rawTranslation);
          console.log(`✨ [translateAllTags] 清理后结果: "${cleanTranslation}"`);
          
          // 验证翻译质量
          if (cleanTranslation && 
              cleanTranslation !== text && 
              /[\u4e00-\u9fa5]/.test(cleanTranslation)) {
            newTranslations[text] = cleanTranslation;
            translatedCount++;
            console.log('✅ [translateAllTags] 翻译成功:', text, '→', cleanTranslation);
          } else {
            console.log('⚠️ [translateAllTags] 翻译结果质量不合格:', text, '→', cleanTranslation);
          }
        } else {
          console.log('⚠️ [translateAllTags] 翻译返回空结果:', text);
        }
      } catch (error) {
        console.error('❌ [translateAllTags] 翻译失败:', text, error.message);
      }
    }

    // 更新翻译缓存
    if (Object.keys(newTranslations).length > 0) {
      setTranslatedTags(prev => ({
        ...prev,
        ...newTranslations
      }));
    }

    // 显示结果
    let message = '';
    if (translatedCount > 0) {
      message += `成功翻译 ${translatedCount} 个标签`;
      notifySuccess('translate', message);
    }
    
    if (skippedCount > 0) {
      showInfo(`跳过 ${skippedCount} 个已翻译的标签`);
    }

    if (nonEnglishCount > 0) {
      showInfo(`跳过 ${nonEnglishCount} 个非英文标签`);
    }

    if (translatedCount === 0) {
      if (skippedCount > 0) {
        showInfo('所有英文标签都已翻译');
      } else {
        showWarning('没有找到可翻译的英文标签');
      }
    }

    console.log('✅ [translateAllTags] 翻译完成，新增翻译:', newTranslations);
  };

  // 翻译更新回调 - 用于TagPill组件自动翻译后更新缓存
  const handleTranslationUpdate = useCallback((tagText, translation) => {
    console.log(`📖 [handleTranslationUpdate] 更新翻译缓存: "${tagText}" -> "${translation}"`);
    setTranslatedTags(prev => ({
      ...prev,
      [tagText]: translation
    }));
  }, []);

  // 自定义库管理功能
  const handleAddNewTag = useCallback(() => {
    if (libraryMode !== 'custom') {
      showWarning('只能在自定义库模式下添加标签');
      return;
    }
    
    setEditingTag({ isNew: true });
    setNewTagData({ en: '', cn: '', frequency: 50 });
    setShowTagManager(true);
    notifySuccess('info', '已进入标签添加模式');
  }, [libraryMode, showWarning, notifySuccess]);

  const handleSaveNewTag = useCallback((tagData) => {
    if (!tagData.en.trim()) {
      notifyError('add', '英文标签不能为空');
      return;
    }

    const newTag = {
      id: `custom-${Date.now()}`,
      en: tagData.en.trim(),
      cn: tagData.cn.trim() || '',
      frequency: parseInt(tagData.frequency) || 50
    };

    // 添加到当前分类
    const currentCategoryKey = selectedCategory || 'personal-tags';
    const currentSubcategoryKey = selectedSubcategory || 'custom';

    setCustomLibrary(prev => {
      const newLibrary = { ...prev };
      
      // 确保分类存在
      if (!newLibrary.categories[currentCategoryKey]) {
        newLibrary.categories[currentCategoryKey] = {
          name: '个人标签',
          icon: '🏷️',
          subcategories: {}
        };
      }
      
      // 确保子分类存在
      if (!newLibrary.categories[currentCategoryKey].subcategories[currentSubcategoryKey]) {
        newLibrary.categories[currentCategoryKey].subcategories[currentSubcategoryKey] = {
          name: '自定义标签',
          tags: []
        };
      }
      
      // 添加标签
      newLibrary.categories[currentCategoryKey].subcategories[currentSubcategoryKey].tags.push(newTag);
      
      return newLibrary;
    });

    setEditingTag(null);
    setNewTagData({ en: '', cn: '', frequency: 50 });
    notifySuccess('add', `标签 "${newTag.en}" 添加成功`);
  }, [selectedCategory, selectedSubcategory, notifyError, notifySuccess]);

  const handleRefreshDatabase = useCallback(() => {
    try {
      // 重新加载收藏数据
      const favoritesList = tagDatabaseService.getFavorites();
      setFavorites(favoritesList || []);
      
      // 重新加载自定义库数据
      if (libraryMode === 'custom') {
        const savedCustomLibrary = localStorage.getItem('customTagLibrary');
        if (savedCustomLibrary) {
          const parsedLibrary = JSON.parse(savedCustomLibrary);
          setCustomLibrary(parsedLibrary);
        }
      }
      
      // 清空搜索结果
      setSearchQuery('');
      setSearchResults([]);
      
      notifySuccess('refresh', '数据库刷新成功');
    } catch (error) {
      console.error('刷新数据库失败:', error);
      notifyError('refresh', '数据库刷新失败');
    }
  }, [libraryMode, notifySuccess, notifyError]);

  const handleAddNewCategory = useCallback((categoryData) => {
    if (!categoryData.name.trim()) {
      notifyError('add', '分类名称不能为空');
      return;
    }

    const categoryId = `category-${Date.now()}`;
    const newCategory = {
      name: categoryData.name.trim(),
      icon: categoryData.icon || '📁',
      subcategories: {
        'default': {
          name: '默认分组',
          tags: []
        }
      }
    };

    setCustomLibrary(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryId]: newCategory
      }
    }));

    setNewCategoryData({ name: '', icon: '📁' });
    setEditingCategory(null);
    notifySuccess('add', `分类 "${newCategory.name}" 创建成功`);
  }, [notifyError, notifySuccess]);

  const handleAddNewSubcategory = useCallback((categoryKey, subcategoryData) => {
    if (!subcategoryData.name.trim()) {
      notifyError('add', '子分类名称不能为空');
      return;
    }

    const subcategoryId = `subcategory-${Date.now()}`;
    const newSubcategory = {
      name: subcategoryData.name.trim(),
      tags: []
    };

    setCustomLibrary(prev => {
      const newLibrary = { ...prev };
      if (newLibrary.categories[categoryKey]) {
        newLibrary.categories[categoryKey].subcategories[subcategoryId] = newSubcategory;
      }
      return newLibrary;
    });

    setNewSubcategoryData({ name: '' });
    notifySuccess('add', `子分类 "${newSubcategory.name}" 创建成功`);
  }, [notifyError, notifySuccess]);

  const handleDeleteTag = useCallback((tagId, categoryKey, subcategoryKey) => {
    setCustomLibrary(prev => {
      const newLibrary = { ...prev };
      if (newLibrary.categories[categoryKey]?.subcategories[subcategoryKey]?.tags) {
        newLibrary.categories[categoryKey].subcategories[subcategoryKey].tags = 
          newLibrary.categories[categoryKey].subcategories[subcategoryKey].tags.filter(tag => tag.id !== tagId);
      }
      return newLibrary;
    });
    
    notifySuccess('delete', '标签删除成功');
  }, [notifySuccess]);

  const handleEditTag = useCallback((tag, categoryKey, subcategoryKey) => {
    setEditingTag({ tag, categoryKey, subcategoryKey });
    setNewTagData({
      en: tag.en,
      cn: tag.cn || '',
      frequency: tag.frequency || 50
    });
  }, []);

  const handleSaveEditedTag = useCallback((tagData) => {
    if (!editingTag.tag || !tagData.en.trim()) {
      notifyError('edit', '标签数据无效');
      return;
    }

    const updatedTag = {
      ...editingTag.tag,
      en: tagData.en.trim(),
      cn: tagData.cn.trim() || '',
      frequency: parseInt(tagData.frequency) || 50
    };

    setCustomLibrary(prev => {
      const newLibrary = { ...prev };
      const categoryKey = editingTag.categoryKey;
      const subcategoryKey = editingTag.subcategoryKey;
      
      if (newLibrary.categories[categoryKey]?.subcategories[subcategoryKey]?.tags) {
        const tagIndex = newLibrary.categories[categoryKey].subcategories[subcategoryKey].tags.findIndex(
          tag => tag.id === editingTag.tag.id
        );
        
        if (tagIndex !== -1) {
          newLibrary.categories[categoryKey].subcategories[subcategoryKey].tags[tagIndex] = updatedTag;
        }
      }
      
      return newLibrary;
    });

    setEditingTag(null);
    setNewTagData({ en: '', cn: '', frequency: 50 });
    notifySuccess('edit', `标签 "${updatedTag.en}" 更新成功`);
  }, [editingTag, notifyError, notifySuccess]);

  const handleExportLibrary = useCallback(() => {
    try {
      const exportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        library: customLibrary,
        favorites: favorites
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `custom-tag-library-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      notifySuccess('export', '库数据导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      notifyError('export', '库数据导出失败');
    }
  }, [customLibrary, favorites, notifySuccess, notifyError]);

  const handleImportLibrary = useCallback((importData) => {
    try {
      const data = JSON.parse(importData);
      
      if (data.library) {
        setCustomLibrary(data.library);
        notifySuccess('import', '库数据导入成功');
      }
      
      if (data.favorites) {
        setFavorites(data.favorites);
        notifySuccess('import', '收藏数据导入成功');
      }
      
      setImportExportData('');
      setShowImportExport(false);
    } catch (error) {
      console.error('导入失败:', error);
      notifyError('import', '数据格式错误，导入失败');
    }
  }, [notifySuccess, notifyError]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* 页面标题 */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  <Sparkles className="text-blue-600 mr-2" size={28} />
                  智能提示词库 3.0
                </h1>
                <p className="text-gray-600 text-sm">
                  AI绘画提示词编辑管理工具，支持中英文智能输入、多引擎翻译
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-gray-500">当前模式</div>
                  <div className="text-sm font-semibold text-blue-600">内测版本</div>
                </div>
                <button
                  onClick={() => setShowTutorial(true)}
                  className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  title="查看使用教程"
                >
                  <BookOpen size={16} />
                  使用教程
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="text-white" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* 提示词预览和翻译区 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 智能输入区 */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="text-blue-600" size={16} />
                    <span className="text-sm font-medium text-gray-900">智能输入</span>
                    <div className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                      {inputLanguage === 'zh' ? '🇨🇳' : inputLanguage === 'en' ? '🇺🇸' : '🌐'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="flex items-center text-xs text-gray-600" title="自动翻译">
                      <input
                        type="checkbox"
                        checked={autoTranslate}
                        onChange={(e) => setAutoTranslate(e.target.checked)}
                        className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Languages size={12} className="ml-1" />
                    </label>
                    <button
                      onClick={() => handleCopy(inputPrompt)}
                      disabled={!inputPrompt.trim()}
                      className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                      title="复制"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={() => {
                        setInputPrompt('');
                        setEnglishPrompt('');
                        setSelectedTags([]);
                        setDisabledTags(new Set());
                        setInputLanguage('auto');
                        notifySuccess('clear', '已清空');
                      }}
                      disabled={!inputPrompt.trim()}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                      title="清空"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                {/* 快速测试 */}
                <div className="mb-3 flex gap-1">
                  {[
                    { text: 'beautiful girl, anime style', icon: '👧', title: '基础' },
                    { text: 'masterpiece, best quality, ultra detailed', icon: '✨', title: '质量' },
                    { text: 'blue eyes, long hair, smile', icon: '👁️', title: '特征' },
                    { text: 'forest, sunset, cinematic lighting', icon: '🌅', title: '场景' }
                  ].map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputPrompt(preset.text);
                        handleInputPromptChange(preset.text);
                      }}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      title={preset.title}
                    >
                      {preset.icon}
                    </button>
                  ))}
                </div>

                <textarea
                  ref={textareaRef}
                  value={inputPrompt}
                  onChange={(e) => handleInputPromptChange(e.target.value)}
                  placeholder="支持中英文输入，如：美丽的女孩, beautiful girl..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
                
                <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                  <span>{inputPrompt.length}</span>
                  <span className="text-xs">
                    {inputLanguage === 'zh' ? '🇨🇳' : inputLanguage === 'en' ? '🇺🇸' : '🌐'}
                  </span>
                </div>
              </div>
            </div>

            {/* 英文输出区 */}  
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="text-green-600" size={16} />
                    <span className="text-sm font-medium text-gray-900">输出</span>
                    <div className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">
                      AI标准
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="text-xs bg-gray-50 border border-gray-300 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-blue-500"
                      title="选择语言"
                    >
                      <option value="en">🇺🇸</option>
                      <option value="zh">🇨🇳</option>
                      <option value="ja">🇯🇵</option>
                      <option value="ko">🇰🇷</option>
                    </select>
                    
                    {/* 翻译引擎状态 */}
                    <div className="text-xs bg-gray-50 px-2 py-0.5 rounded flex items-center gap-1" title={`当前引擎: ${currentEngine?.name || '未知'}`}>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">{currentEngine?.name?.slice(0, 2) || 'N/A'}</span>
                    </div>
                    
                    <button
                      onClick={() => handleCopy(englishPrompt)}
                      disabled={!englishPrompt.trim()}
                      className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                      title="复制"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={englishPrompt}
                    onChange={(e) => handleEnglishPromptChange(e.target.value)}
                    placeholder={isTranslatingPrompt ? "翻译中..." : "请先在左侧输入提示词..."}
                    className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
                  />
                  {isTranslatingPrompt && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <RefreshCw size={14} className="animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                  <span>{englishPrompt.length}</span>
                  <span>AI标准</span>
                </div>
              </div>
            </div>
          </div>

          {/* 提示词编辑区 - 单独一行，自适应高度 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 prompt-edit-area">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-md font-semibold text-gray-900 flex items-center">
                  <Edit3 className="text-blue-600 mr-2" size={18} />
                  提示词编辑器
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2">
                    悬停编辑 · 权重调节 · 智能翻译
                  </span>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full ml-2">
                    ({selectedTags.filter((_, i) => !disabledTags.has(i)).length}/{selectedTags.length})
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={translateAllTags}
                    disabled={selectedTags.length === 0 || isMultiTranslating}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isMultiTranslating ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Globe size={12} />
                    )}
                    翻译全部
                  </button>
                  <button
                    onClick={() => {
                      console.log('🧹 [清空按钮] 清空所有内容');
                      setSelectedTags([]);
                      setEnglishPrompt('');
                      setInputPrompt('');
                      setTranslatedTags({});
                      setDisabledTags(new Set());
                      setInputLanguage('auto');
                      notifySuccess('clear', '已清空所有内容');
                    }}
                    disabled={selectedTags.length === 0 && !englishPrompt.trim() && !inputPrompt.trim()}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={12} />
                    清空
                  </button>
                </div>
              </div>

              {/* 翻译功能说明 */}
              {selectedTags.length > 0 && (
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <Languages className="text-blue-600" size={16} />
                      <span className="font-medium">智能翻译已启用</span>
                      <span className="text-blue-600">
                        • 标签下方会自动显示中文翻译 
                        • 支持本地词典和在线翻译
                        • 点击"翻译全部"获取所有标签翻译
                      </span>
                    </div>
                    <div className="text-xs text-blue-600 bg-white px-2 py-1 rounded border">
                      {Object.keys(translatedTags).length}/{selectedTags.length} 已翻译
                    </div>
                  </div>
                </div>
              )}
              
              <div 
                className="border border-gray-300 rounded-lg p-4 bg-blue-50/20 relative"
                style={{
                  minHeight: '200px',
                  height: 'auto'
                }}
              >
                {selectedTags.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-gray-500">
                    <div className="text-center">
                      <TagIcon size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">点击下方标签库添加标签</p>
                      <p className="text-xs text-gray-400 mt-1">或在上方输入区直接输入提示词</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 标签预览区域 - 类似英文输出区格式 */}
                    <div className="mb-4">
                      <textarea
                        value={selectedTags.filter((_, index) => !disabledTags.has(index)).join(', ')}
                        readOnly
                        className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none bg-green-50/30 text-sm overflow-y-auto text-gray-700"
                        placeholder="编辑后的标签将在这里显示..."
                      />
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <span>
                          {selectedTags.filter((_, index) => !disabledTags.has(index)).join(', ').length} 字符
                        </span>
                        <span>启用标签: {selectedTags.filter((_, index) => !disabledTags.has(index)).length}/{selectedTags.length}</span>
                      </div>
                    </div>
                    
                    {/* 标签编辑区域 */}
                    <div 
                      className="flex flex-wrap gap-3"
                      style={{
                        paddingBottom: '20px'
                      }}
                    >
                      {selectedTags.map((tag, index) => {
                        // 检查当前标签是否已收藏
                        const tagText = typeof tag === 'string' ? tag : tag.en;
                        const isTagFavorited = favorites.some(fav => fav.en === tagText);
                        
                        return (
                          <TagPill
                            key={`${tag}-${index}`}
                            tag={tag}
                            index={index}
                            isDisabled={disabledTags.has(index)}
                            isFavorited={isTagFavorited}
                            onDelete={deleteTag}
                            onToggleDisabled={toggleDisabled}
                            onAdjustWeight={adjustWeight}
                            onAdjustBrackets={adjustBrackets}
                            onCopy={copyTag}
                            onFavorite={favoriteTag}
                            onTranslate={translateSingleTag}
                            translatedTags={translatedTags}
                            hoveredTag={hoveredTag}
                            setHoveredTag={setHoveredTag}
                            targetLanguage={targetLanguage}
                            onTranslationUpdate={handleTranslationUpdate}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 标签库区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* 左侧：搜索和分类 */}
            <div className="lg:col-span-1 space-y-4">
              {/* 搜索框 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索标签..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 库模式切换 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">标签库模式</h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setLibraryMode('default')}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      libraryMode === 'default'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    默认标签库
                  </button>
                  <button
                    onClick={() => setLibraryMode('custom')}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      libraryMode === 'custom'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    自定义库
                  </button>
                </div>
              </div>

              {/* 分类侧边栏 */}
              <CategorySidebar
                libraryMode={libraryMode}
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                expandedCategories={expandedCategories}
                currentDatabase={currentDatabase}
                favorites={favorites}
                onSelectCategory={selectCategory}
                onToggleCategory={toggleCategory}
              />

              {/* 管理工具栏 */}
              <TagManagerToolbar
                libraryMode={libraryMode}
                showTagManager={showTagManager}
                showImportExport={showImportExport}
                onToggleTagManager={() => setShowTagManager(!showTagManager)}
                onShowImportExport={() => setShowImportExport(!showImportExport)}
                onShowCustomLibraryManager={() => setShowCustomLibraryManager(true)}
                onShowLibraryManager={() => setShowImportExport(true)}
                onAddTag={handleAddNewTag}
                onRefreshDatabase={handleRefreshDatabase}
                canEdit={libraryMode === 'custom'}
              />
            </div>

            {/* 右侧：标签展示 */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Database className="text-purple-600 mr-2" size={18} />
                    标签库 ({currentTags.length} 个标签)
                    {searchQuery && (
                      <span className="text-sm text-gray-500 ml-2">
                        搜索 "{searchQuery}"
                      </span>
                    )}
                  </h3>
                  
                  {/* 当前分类信息 */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      {selectedCategory === 'favorites' ? '我的收藏' : 
                       currentDatabase?.[selectedCategory]?.name || selectedCategory}
                    </span>
                    {selectedSubcategory && (
                      <>
                        <span>›</span>
                        <span>
                          {currentDatabase?.[selectedCategory]?.subcategories?.[selectedSubcategory]?.name || selectedSubcategory}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                  {currentTags.map((tag, index) => (
                    <TagCard
                      key={`${tag.en}-${index}`}
                      tag={tag}
                      onAdd={addTag}
                      onToggleFavorite={favoriteTag}
                      isFavorited={favorites.some(fav => fav.en === tag.en)}
                      onEdit={(tag) => handleEditTag(tag, selectedCategory, selectedSubcategory)}
                      onDelete={(tag) => {
                        if (window.confirm(`确定要删除标签 "${tag.en}" 吗？`)) {
                          handleDeleteTag(tag.id, selectedCategory, selectedSubcategory);
                        }
                      }}
                      isEditable={libraryMode === 'custom'}
                      showManagement={showTagManager}
                    />
                  ))}
                </div>

                {currentTags.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Database size={48} className="mx-auto mb-2 opacity-50" />
                    <p>暂无标签</p>
                    {searchQuery ? (
                      <p className="text-sm">尝试其他搜索关键词</p>
                    ) : (
                      <p className="text-sm">尝试切换分类或添加标签</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 教程模态框 */}
        {showTutorial && (
          <TutorialModal onClose={() => setShowTutorial(false)} />
        )}

        {/* 自定义库管理模态框 */}
        {showCustomLibraryManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">自定义库管理</h2>
                <p className="text-gray-600 text-sm mt-1">管理您的自定义标签库和分类</p>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                {/* 添加新分类 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">添加新分类</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="分类名称"
                      value={newCategoryData.name}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="图标"
                      value={newCategoryData.icon}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                    />
                    <button
                      onClick={() => handleAddNewCategory(newCategoryData)}
                      disabled={!newCategoryData.name.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      添加
                    </button>
                  </div>
                </div>

                {/* 现有分类管理 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">现有分类</h3>
                  {Object.entries(customLibrary.categories || {}).map(([categoryKey, category]) => (
                    <div key={categoryKey} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium">{category.name}</span>
                          <span className="text-xs text-gray-500">
                            ({Object.values(category.subcategories || {}).reduce((total, sub) => total + (sub.tags?.length || 0), 0)} 个标签)
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setNewSubcategoryData({ name: '' });
                              setEditingCategory(categoryKey);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            添加子分类
                          </button>
                        </div>
                      </div>
                      
                      {editingCategory === categoryKey && (
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="子分类名称"
                            value={newSubcategoryData.name}
                            onChange={(e) => setNewSubcategoryData({ name: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <button
                            onClick={() => {
                              handleAddNewSubcategory(categoryKey, newSubcategoryData);
                              setEditingCategory(null);
                            }}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            添加
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm"
                          >
                            取消
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowCustomLibraryManager(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 标签编辑模态框 */}
        {editingTag && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTag.isNew ? '添加新标签' : '编辑标签'}
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">英文标签</label>
                  <input
                    type="text"
                    placeholder="beautiful girl"
                    value={newTagData.en}
                    onChange={(e) => setNewTagData(prev => ({ ...prev, en: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">中文翻译</label>
                  <input
                    type="text"
                    placeholder="美丽女孩"
                    value={newTagData.cn}
                    onChange={(e) => setNewTagData(prev => ({ ...prev, cn: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    热度值 ({newTagData.frequency})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={newTagData.frequency}
                    onChange={(e) => setNewTagData(prev => ({ ...prev, frequency: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>冷门</span>
                    <span>热门</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setEditingTag(null);
                    setNewTagData({ en: '', cn: '', frequency: 50 });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => editingTag.isNew ? handleSaveNewTag(newTagData) : handleSaveEditedTag(newTagData)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTag.isNew ? '添加' : '保存'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 导入导出模态框 */}
        {showImportExport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">库管理系统</h2>
                <p className="text-gray-600 text-sm mt-1">导入导出您的标签库数据</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* 导出功能 */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">导出数据</h3>
                  <p className="text-gray-600 text-sm mb-3">将您的自定义库和收藏导出为JSON文件</p>
                  <button
                    onClick={handleExportLibrary}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    下载库数据
                  </button>
                </div>

                {/* 导入功能 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">导入数据</h3>
                  <p className="text-gray-600 text-sm mb-3">从JSON文件导入标签库数据</p>
                  <textarea
                    placeholder="请粘贴JSON数据..."
                    value={importExportData}
                    onChange={(e) => setImportExportData(e.target.value)}
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleImportLibrary(importExportData)}
                      disabled={!importExportData.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      导入数据
                    </button>
                    <button
                      onClick={() => setImportExportData('')}
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      清空
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowImportExport(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PromptLibraryPage; 