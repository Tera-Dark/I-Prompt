import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Search, Copy, Heart, X, Languages, 
  ChevronDown, ChevronRight, Tag as TagIcon,
  Sparkles, Bookmark, Clock, TrendingUp, Edit3,
  Minus, Trash2, Star, Weight, Zap, ChevronLeft, ChevronRight as ChevronRightIcon,
  EyeOff, Eye, Settings, TestTube, CheckCircle, XCircle, RefreshCw, ArrowUpDown,
  Globe, ArrowRightLeft
} from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import { 
  translateText, 
  translateTag, 
  getAvailableTranslators, 
  testTranslator, 
  batchTranslate,
  translatePrompt,
  detectLanguage
} from '../services/translationService';
import { TAG_DATABASE, searchTags, getPopularTags } from '../constants/tagDatabase';

const PromptLibraryPage = () => {
  // 提示词编辑状态
  const [inputPrompt, setInputPrompt] = useState(''); // 用户输入的提示词（可能是中文）
  const [englishPrompt, setEnglishPrompt] = useState(''); // 最终的英文提示词
  const [promptHistory, setPromptHistory] = useState([]);
  const [isTranslatingPrompt, setIsTranslatingPrompt] = useState(false);
  const [inputLanguage, setInputLanguage] = useState('auto'); // 检测到的输入语言
  
  // 提示词编辑器状态
  const [selectedTags, setSelectedTags] = useState([]);
  const [disabledTags, setDisabledTags] = useState(new Set());
  const [translatedTags, setTranslatedTags] = useState({});
  const [hoveredTag, setHoveredTag] = useState(null);
  
  // 翻译设置状态
  const [availableTranslators, setAvailableTranslators] = useState({});
  const [selectedTranslator, setSelectedTranslator] = useState('baidu_web');
  const [targetLanguage, setTargetLanguage] = useState('en'); // 默认翻译目标语言为英文
  const [showTranslatorSettings, setShowTranslatorSettings] = useState(false);
  const [translatorStatus, setTranslatorStatus] = useState({});
  const [autoTranslate, setAutoTranslate] = useState(true); // 默认开启自动翻译
  
  // 标签库状态
  const [selectedCategory, setSelectedCategory] = useState('favorites');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({ favorites: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // UI状态
  const [favorites, setFavorites] = useState([]);
  const [copyStatus, setCopyStatus] = useState('');
  
  const textareaRef = useRef(null);

  // 是否正在更新提示词（避免循环更新）
  const [isUpdatingPrompt, setIsUpdatingPrompt] = useState(false);

  // 加载翻译引擎列表
  useEffect(() => {
    loadTranslators();
  }, []);

  const loadTranslators = async () => {
    try {
      const translators = await getAvailableTranslators();
      setAvailableTranslators(translators);
    } catch (error) {
      console.error('加载翻译引擎失败:', error);
    }
  };

  // 实时搜索建议
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchTags(searchQuery).slice(0, 20);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // 同步提示词和选中标签（当英文提示词变化时）
  useEffect(() => {
    // 避免在正在更新时同步
    if (isUpdatingPrompt) return;
    
    // 当英文提示词发生变化时，将其分解为英文标签
    if (englishPrompt.trim()) {
      const tagsFromPrompt = englishPrompt.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // 检查是否与当前选中的标签一致，避免无限循环
      const currentTagsStr = selectedTags.join(', ');
      const newTagsStr = tagsFromPrompt.join(', ');
      
      if (currentTagsStr !== newTagsStr) {
        setSelectedTags(tagsFromPrompt);
        // 重置禁用状态，因为这是新的标签集合
        setDisabledTags(new Set());
      }
    } else {
      // 英文提示词为空时，清空标签
      if (selectedTags.length > 0) {
        setSelectedTags([]);
        setDisabledTags(new Set());
      }
    }
  }, [englishPrompt, isUpdatingPrompt]);

  // 当禁用状态变化时，更新英文提示词显示
  useEffect(() => {
    if (!isUpdatingPrompt && selectedTags.length > 0) {
      updateEnglishPrompt(selectedTags);
    }
  }, [disabledTags]);

  // 自动翻译监听 - 检测输入语言并翻译
  useEffect(() => {
    if (autoTranslate && inputPrompt.trim()) {
      const timer = setTimeout(() => {
        handleAutoTranslation();
      }, 1000); // 延迟1秒自动翻译
      
      return () => clearTimeout(timer);
    }
  }, [inputPrompt, autoTranslate]);

  // 处理自动翻译
  const handleAutoTranslation = async () => {
    if (!inputPrompt.trim()) return;
    
    // 检测输入语言
    const detectedLang = detectLanguage(inputPrompt);
    setInputLanguage(detectedLang);
    
    console.log(`自动翻译: 输入语言=${detectedLang}, 目标语言=${targetLanguage}`);
    
    // 统一翻译流程：所有输入都转换为用户选择的目标语言
    if (detectedLang === targetLanguage) {
      // 语言相同也要经过规范化处理
      setEnglishPrompt(inputPrompt.trim());
    } else {
      // 需要翻译为目标语言
      await translateToTargetLanguage();
    }
  };

  // 翻译为目标语言
  const translateToTargetLanguage = async () => {
    if (!inputPrompt.trim()) {
      setCopyStatus('empty-prompt');
      setTimeout(() => setCopyStatus(''), 2000);
      return;
    }

    setIsTranslatingPrompt(true);
    setCopyStatus('translating-to-target');

    try {
      const result = await translatePrompt(inputPrompt, {
        preferredEngines: [selectedTranslator, 'baidu_web', 'alibaba_web', 'mymemory', 'google_web'],
        targetLang: targetLanguage,
        sourceLang: inputLanguage === 'auto' ? 'zh' : inputLanguage
      });

      setEnglishPrompt(result.translatedText);
      
      setCopyStatus('translate-to-target-success');
      setTimeout(() => setCopyStatus(''), 3000);
      
      // 获取目标语言的显示名称
      const getLanguageName = (code) => {
        const languageNames = {
          'en': '英文',
          'zh': '中文', 
          'ja': '日文',
          'ko': '韩文',
          'fr': '法文',
          'de': '德文',
          'es': '西班牙文',
          'ru': '俄文'
        };
        return languageNames[code] || code;
      };
      
      console.log(`翻译完成: ${result.successCount}/${result.totalCount} 个标签成功翻译为${getLanguageName(targetLanguage)}`);
      if (result.errors.length > 0) {
        console.warn('翻译错误:', result.errors);
      }
      
    } catch (error) {
      console.error('提示词翻译失败:', error);
      setCopyStatus('translate-error');
      setTimeout(() => setCopyStatus(''), 3000);
    } finally {
      setIsTranslatingPrompt(false);
    }
  };

  // 更新英文提示词（排除禁用的标签）
  const updateEnglishPrompt = (tags) => {
    if (isUpdatingPrompt) return; // 避免循环更新
    
    setIsUpdatingPrompt(true);
    const enabledTags = tags.filter((_, index) => !disabledTags.has(index));
    const newPrompt = enabledTags.join(', ');
    setEnglishPrompt(newPrompt);
    
    // 添加到历史记录
    if (newPrompt.trim() && !promptHistory.includes(newPrompt.trim())) {
      setPromptHistory(prev => [newPrompt.trim(), ...prev.slice(0, 9)]);
    }
    
    // 重置更新标志
    setTimeout(() => setIsUpdatingPrompt(false), 0);
  };

  // 处理输入提示词变化
  const handleInputPromptChange = (value) => {
    setInputPrompt(value);
    
    // 清空现有标签，让翻译结果来重新填充
    if (value.trim() === '') {
      setEnglishPrompt('');
      setSelectedTags([]);
      setDisabledTags(new Set());
      setInputLanguage('auto');
    }
  };

  // 添加标签到提示词
  const addTagToPrompt = async (tag) => {
    // 确保标签是英文格式
    let englishTag = tag.en;
    
    // 如果标签本身是中文，先翻译成英文
    if (detectLanguage(tag.en) === 'zh') {
      try {
        setCopyStatus('translating-tag');
        const result = await translateTag(tag.en, {
          preferredEngines: [selectedTranslator, 'baidu_web', 'alibaba_web', 'mymemory', 'google_web'],
          targetLang: 'en', // 标签总是翻译成英文
          sourceLang: 'zh'
        });
        englishTag = result.translatedText || result;
        setCopyStatus('tag-translated');
        setTimeout(() => setCopyStatus(''), 2000);
      } catch (error) {
        console.error('标签翻译失败:', error);
        // 翻译失败时仍然使用原标签
      }
    }
    
    // 添加到英文提示词，让同步机制自动更新编辑区
    const currentPrompt = englishPrompt.trim();
    const newPrompt = currentPrompt ? `${currentPrompt}, ${englishTag}` : englishTag;
    setEnglishPrompt(newPrompt);
    
    // 聚焦到文本框末尾
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(inputPrompt.length, inputPrompt.length);
    }
  };

  // 删除标签
  const deleteTag = (index) => {
    const newTags = selectedTags.filter((_, i) => i !== index);
    const newDisabled = new Set([...disabledTags].map(i => i > index ? i - 1 : i).filter(i => i !== index));
    
    // 更新英文提示词，让同步机制自动处理
    const enabledTags = newTags.filter((_, i) => !newDisabled.has(i));
    const newPrompt = enabledTags.join(', ');
    setEnglishPrompt(newPrompt);
    
    // 更新状态
    setDisabledTags(newDisabled);
  };

  // 切换禁用状态
  const toggleDisabled = (index) => {
    const newDisabled = new Set(disabledTags);
    if (newDisabled.has(index)) {
      newDisabled.delete(index);
    } else {
      newDisabled.add(index);
    }
    setDisabledTags(newDisabled);
    // 不需要手动调用updateEnglishPrompt，useEffect会自动处理
  };

  // 解析标签
  const parseTag = (tag) => {
    // 检测权重格式 (tag:1.2)
    const weightMatch = tag.match(/^\((.+?):([0-9.]+)\)$/);
    if (weightMatch) {
      return {
        text: weightMatch[1],
        weight: parseFloat(weightMatch[2]),
        bracketType: 'none',
        brackets: 0
      };
    }
    
    // 检测括号类型和层级
    let brackets = 0;
    let text = tag;
    let bracketType = 'none';
    
    // 检测圆括号 ()
    if (text.startsWith('(') && text.endsWith(')')) {
      bracketType = 'round';
      while (text.startsWith('(') && text.endsWith(')')) {
        brackets++;
        text = text.slice(1, -1);
      }
    }
    // 检测花括号 {}
    else if (text.startsWith('{') && text.endsWith('}')) {
      bracketType = 'curly';
      while (text.startsWith('{') && text.endsWith('}')) {
        brackets++;
        text = text.slice(1, -1);
      }
    }
    // 检测方括号 []
    else if (text.startsWith('[') && text.endsWith(']')) {
      bracketType = 'square';
      while (text.startsWith('[') && text.endsWith(']')) {
        brackets++;
        text = text.slice(1, -1);
      }
    }
    
    return { text, weight: 1.0, bracketType, brackets };
  };

  // 构建标签字符串
  const buildTag = (text, weight, bracketType, brackets) => {
    let result = text;
    
    // 添加权重 - 权重格式为 (text:weight)
    if (weight !== 1.0) {
      result = `(${text}:${weight.toFixed(1)})`;
      // 如果已经有权重，就不再添加括号
      return result;
    }
    
    // 添加括号（仅当没有权重时）
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

  // 调整权重
  const adjustWeight = (index, delta) => {
    const tag = selectedTags[index];
    const parsed = parseTag(tag);
    const newWeight = Math.max(0.1, Math.min(2.0, parsed.weight + delta));
    
    // 当调整权重时，清除括号（权重和括号互斥）
    const newTag = buildTag(parsed.text, newWeight, 'none', 0);
    
    const newTags = [...selectedTags];
    newTags[index] = newTag;
    
    // 更新英文提示词
    const enabledTags = newTags.filter((_, i) => !disabledTags.has(i));
    const newPrompt = enabledTags.join(', ');
    setEnglishPrompt(newPrompt);
  };

  // 调整括号
  const adjustBrackets = (index, bracketType, delta) => {
    const tag = selectedTags[index];
    const parsed = parseTag(tag);
    
    // 如果要增加括号且当前没有括号，或者类型相同，才允许调整
    if (delta > 0 && parsed.bracketType !== 'none' && parsed.bracketType !== bracketType) {
      return; // 不允许混用不同类型的括号
    }
    
    const newBrackets = Math.max(0, Math.min(5, parsed.brackets + delta));
    const newBracketType = newBrackets === 0 ? 'none' : bracketType;
    
    // 当使用括号时，将权重重置为1.0（权重和括号互斥）
    const newTag = buildTag(parsed.text, 1.0, newBracketType, newBrackets);
    
    const newTags = [...selectedTags];
    newTags[index] = newTag;
    
    // 更新英文提示词
    const enabledTags = newTags.filter((_, i) => !disabledTags.has(i));
    const newPrompt = enabledTags.join(', ');
    setEnglishPrompt(newPrompt);
  };

  // 测试翻译引擎
  const handleTestTranslator = async (translatorKey) => {
    setTranslatorStatus(prev => ({ ...prev, [translatorKey]: 'testing' }));
    
    try {
      const result = await testTranslator(translatorKey);
      setTranslatorStatus(prev => ({ 
        ...prev, 
        [translatorKey]: result.success ? 'available' : 'unavailable'
      }));
      
      if (result.success) {
        setCopyStatus('test-success');
      } else {
        setCopyStatus('test-failed');
      }
    } catch (error) {
      setTranslatorStatus(prev => ({ ...prev, [translatorKey]: 'unavailable' }));
      setCopyStatus('test-failed');
    }
    
    setTimeout(() => setCopyStatus(''), 2000);
  };

  // 一键翻译所有未翻译的标签为中文（用于显示）
  const translateAllTags = async () => {
    const untranslatedTags = selectedTags.filter(tag => {
      const parsed = parseTag(tag);
      return !translatedTags[parsed.text] || detectLanguage(parsed.text) !== 'zh';
    });

    if (untranslatedTags.length === 0) {
      setCopyStatus('no-untranslated');
      setTimeout(() => setCopyStatus(''), 2000);
      return;
    }

    setCopyStatus('translating-tags-to-chinese');
    
    try {
      const texts = untranslatedTags.map(tag => parseTag(tag).text);
      const results = await batchTranslate(texts, {
        preferredEngines: [selectedTranslator, 'baidu_web', 'alibaba_web', 'mymemory', 'google_web'],
        targetLang: 'zh', // 翻译为中文用于显示
        sourceLang: 'auto'
      });

      const newTranslations = {};
      results.forEach(result => {
        if (result.success && result.result) {
          // 确保只保存字符串，不是对象
          const translatedText = result.result.translatedText || result.result;
          newTranslations[result.text] = translatedText;
        }
      });

      setTranslatedTags(prev => ({ ...prev, ...newTranslations }));
      setCopyStatus('tags-translated-to-chinese');
    } catch (error) {
      console.error('批量翻译失败:', error);
      setCopyStatus('translate-error');
    }
    
    setTimeout(() => setCopyStatus(''), 2000);
  };

  // 翻译单个标签为中文（用于显示）
  const translateSingleTag = async (tag) => {
    // 提取纯文本进行翻译
    const parsed = parseTag(tag);
    const pureText = parsed.text;
    
    // 如果已经有翻译，直接返回
    if (translatedTags[pureText]) {
      return translatedTags[pureText];
    }
    
    // 如果已经是中文，直接返回
    if (detectLanguage(pureText) === 'zh') {
      setTranslatedTags(prev => ({ ...prev, [pureText]: pureText }));
      return pureText;
    }
    
    try {
      const result = await translateTag(pureText, {
        preferredEngines: [selectedTranslator, 'baidu_web', 'alibaba_web', 'mymemory', 'google_web'],
        targetLang: 'zh', // 翻译为中文用于显示
        sourceLang: 'auto'
      });
      
      // 确保只返回字符串，不是对象
      const translatedText = result.translatedText || result;
      setTranslatedTags(prev => ({ ...prev, [pureText]: translatedText }));
      return translatedText;
    } catch (error) {
      console.error('翻译失败:', error);
      return pureText;
    }
  };

  // 复制标签
  const copyTag = async (tag) => {
    const success = await copyToClipboard(tag);
    setCopyStatus(success ? 'copied' : 'error');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  // 收藏标签
  const favoriteTag = (tag) => {
    const parsed = parseTag(tag);
    let translatedText = translatedTags[parsed.text] || parsed.text;
    
    // 确保翻译文本是字符串
    if (typeof translatedText === 'object' && translatedText.translatedText) {
      translatedText = translatedText.translatedText;
    }
    
    const tagObj = { en: parsed.text, cn: translatedText, frequency: 80 };
    toggleFavorite(tagObj);
  };

  // 复制功能
  const handleCopy = async (text) => {
    const success = await copyToClipboard(text || inputPrompt);
    setCopyStatus(success ? 'copied' : 'error');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  // 收藏功能
  const toggleFavorite = (tag) => {
    setFavorites(prev => {
      const isAlreadyFavorited = prev.some(fav => fav.en === tag.en);
      if (isAlreadyFavorited) {
        return prev.filter(fav => fav.en !== tag.en);
      } else {
        return [...prev, tag];
      }
    });
  };

  // 分类展开/收起
  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  // 选择分类
  const selectCategory = (categoryKey, subcategoryKey = null) => {
    setSelectedCategory(categoryKey);
    setSelectedSubcategory(subcategoryKey);
  };

  // 获取当前显示的标签
  const getCurrentTags = () => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    
    if (selectedCategory === 'favorites') {
      if (selectedSubcategory === 'personal') {
        return favorites;
      } else {
        // 显示热门标签
        return getPopularTags(20);
      }
    }
    
    const category = TAG_DATABASE[selectedCategory];
    if (!category) return [];
    
    if (selectedSubcategory) {
      const subcategory = category.subcategories[selectedSubcategory];
      return subcategory ? subcategory.tags : [];
    }
    
    // 返回该分类下所有标签
    const allTags = [];
    Object.values(category.subcategories).forEach(subcategory => {
      allTags.push(...subcategory.tags);
    });
    return allTags;
  };

  // 动态更新TAG_DATABASE中的收藏标签
  useEffect(() => {
    if (TAG_DATABASE.favorites && TAG_DATABASE.favorites.subcategories.personal) {
      TAG_DATABASE.favorites.subcategories.personal.tags = favorites;
    }
  }, [favorites]);

  const currentTags = getCurrentTags();

  // 复制状态映射
  const getCopyStatusMessage = () => {
    // 获取目标语言的显示名称
    const getLanguageName = (code) => {
      const languageNames = {
        'en': '英文',
        'zh': '中文', 
        'ja': '日文',
        'ko': '韩文',
        'fr': '法文',
        'de': '德文',
        'es': '西班牙文',
        'ru': '俄文'
      };
      return languageNames[code] || code;
    };

    const messages = {
      'copied': '已复制到剪贴板',
      'copy-failed': '复制失败',
      'empty-prompt': '提示词不能为空',
      'translating-prompt': '翻译中...',
      'translating-to-target': `翻译为${getLanguageName(targetLanguage)}中...`,
      'translate-to-target-success': `翻译为${getLanguageName(targetLanguage)}成功`,
      'translate-error': '翻译失败',
      'translating-tag': '翻译标签中...',
      'tag-translated': '标签翻译成功',
      'tag-translate-failed': '标签翻译失败',
      'all-tags-translated': '所有标签翻译完成',
      'testing-translator': '测试翻译引擎中...'
    };
    return messages[copyStatus] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 页面标题 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3 flex items-center">
                <Sparkles className="text-blue-600 mr-3" size={32} />
                智能提示词库 3.0
              </h1>
              <p className="text-gray-600 text-lg">
                支持中英文智能输入 • 多引擎翻译 • 自动语言检测 • 专业AI绘画提示词编辑管理工具
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-500">当前模式</div>
                <div className="text-lg font-semibold text-blue-600">内测版本</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 提示词预览和翻译区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 智能输入区 - 支持中英文 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Globe className="text-blue-600 mr-2" size={20} />
                  智能输入区
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2">
                    支持中英文 • 自动检测
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                    检测: {inputLanguage === 'zh' ? '🇨🇳 中文' : inputLanguage === 'en' ? '🇺🇸 英文' : '🌐 自动'}
                  </div>
                  <label className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                    <input
                      type="checkbox"
                      checked={autoTranslate}
                      onChange={(e) => setAutoTranslate(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    自动翻译
                  </label>
                  <button
                    onClick={() => handleCopy(inputPrompt)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Copy size={14} />
                    复制输入
                  </button>
                  <button
                    onClick={() => {
                      setInputPrompt('');
                      setEnglishPrompt('');
                      setSelectedTags([]);
                      setDisabledTags(new Set());
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={(e) => handleInputPromptChange(e.target.value)}
                placeholder="支持中英文输入，如：美丽的女孩 或 beautiful girl..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm overflow-y-auto"
              />
              
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span>输入字符数: {inputPrompt.length}</span>
                <span>语言: {inputLanguage === 'zh' ? '中文' : inputLanguage === 'en' ? '英文' : '未检测'}</span>
              </div>

              {/* 快速历史记录 */}
              {promptHistory.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">最近使用</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {promptHistory.slice(0, 5).map((historyPrompt, index) => (
                      <button
                        key={index}
                        onClick={() => setInputPrompt(historyPrompt)}
                        className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors truncate max-w-xs"
                      >
                        {historyPrompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 英文输出区 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ArrowRightLeft className="text-green-600 mr-2" size={20} />
                  {(() => {
                    const languageNames = {
                      'en': '英文输出区',
                      'zh': '中文输出区', 
                      'ja': '日文输出区',
                      'ko': '韩文输出区',
                      'fr': '法文输出区',
                      'de': '德文输出区',
                      'es': '西班牙文输出区',
                      'ru': '俄文输出区'
                    };
                    return languageNames[targetLanguage] || `${targetLanguage.toUpperCase()}输出区`;
                  })()}
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full ml-2">
                    AI绘画标准 • 可编辑
                  </span>
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* 目标语言选择器 */}
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="text-xs bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en">🇺🇸 英文</option>
                    <option value="zh">🇨🇳 中文</option>
                    <option value="ja">🇯🇵 日文</option>
                    <option value="ko">🇰🇷 韩文</option>
                    <option value="fr">🇫🇷 法文</option>
                    <option value="de">🇩🇪 德文</option>
                    <option value="es">🇪🇸 西班牙文</option>
                    <option value="ru">🇷🇺 俄文</option>
                  </select>
                  
                  <button
                    onClick={() => setShowTranslatorSettings(!showTranslatorSettings)}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Settings size={14} />
                    引擎
                  </button>
                  <button
                    onClick={translateToTargetLanguage}
                    disabled={isTranslatingPrompt || !inputPrompt.trim()}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTranslatingPrompt ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <ArrowRightLeft size={14} />
                    )}
                    {isTranslatingPrompt ? '翻译中' : '翻译'}
                  </button>
                  <button
                    onClick={() => handleCopy(englishPrompt)}
                    disabled={!englishPrompt.trim()}
                    className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy size={14} />
                    复制{(() => {
                      const languageNames = {
                        'en': '英文',
                        'zh': '中文', 
                        'ja': '日文',
                        'ko': '韩文',
                        'fr': '法文',
                        'de': '德文',
                        'es': '西班牙文',
                        'ru': '俄文'
                      };
                      return languageNames[targetLanguage] || '文本';
                    })()}
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={englishPrompt}
                  onChange={(e) => setEnglishPrompt(e.target.value)}
                  placeholder={(() => {
                    if (isTranslatingPrompt) return "正在智能翻译中，请稍候...";
                    if (inputPrompt.trim()) {
                      const languageNames = {
                        'en': '英文',
                        'zh': '中文', 
                        'ja': '日文',
                        'ko': '韩文',
                        'fr': '法文',
                        'de': '德文',
                        'es': '西班牙文',
                        'ru': '俄文'
                      };
                      return `将自动翻译为${languageNames[targetLanguage] || targetLanguage}...`;
                    }
                    return "请先在左侧输入提示词...";
                  })()}
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm overflow-y-auto font-mono"
                  disabled={isTranslatingPrompt}
                />
                
                {/* 翻译加载状态 */}
                {isTranslatingPrompt && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <div className="flex items-center gap-3 text-purple-600">
                      <RefreshCw size={20} className="animate-spin" />
                      <span className="text-sm font-medium">智能翻译为{(() => {
                        const languageNames = {
                          'en': '英文',
                          'zh': '中文', 
                          'ja': '日文',
                          'ko': '韩文',
                          'fr': '法文',
                          'de': '德文',
                          'es': '西班牙文',
                          'ru': '俄文'
                        };
                        return languageNames[targetLanguage] || targetLanguage;
                      })()}中...</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span>{(() => {
                  const languageNames = {
                    'en': '英文',
                    'zh': '中文', 
                    'ja': '日文',
                    'ko': '韩文',
                    'fr': '法文',
                    'de': '德文',
                    'es': '西班牙文',
                    'ru': '俄文'
                  };
                  return languageNames[targetLanguage] || '目标语言';
                })()}字符数: {englishPrompt.length}</span>
                <div className="flex items-center gap-2">
                  <span>引擎: {availableTranslators[selectedTranslator]?.name || '未选择'}</span>
                  {translatorStatus[selectedTranslator] === 'available' && (
                    <CheckCircle size={12} className="text-green-500" />
                  )}
                  {translatorStatus[selectedTranslator] === 'unavailable' && (
                    <XCircle size={12} className="text-red-500" />
                  )}
                </div>
              </div>

              {/* 翻译提示信息 */}
              {!englishPrompt && !isTranslatingPrompt && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRightLeft size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-700">智能翻译说明</span>
                  </div>
                  <ul className="text-xs text-green-600 space-y-1">
                    <li>• 支持中文、英文、日文、韩文等多语言输入</li>
                    <li>• 自动检测语言类型并翻译为选定的目标语言</li>
                    <li>• 内置专业词典，确保艺术术语准确翻译</li>
                    <li>• 支持手动编辑翻译输出结果</li>
                    <li>• 实时同步到下方编辑区进行精细调整</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 翻译引擎设置面板 */}
        {showTranslatorSettings && (
          <TranslatorSettings
            availableTranslators={availableTranslators}
            selectedTranslator={selectedTranslator}
            setSelectedTranslator={setSelectedTranslator}
            targetLanguage={targetLanguage}
            setTargetLanguage={setTargetLanguage}
            translatorStatus={translatorStatus}
            onTestTranslator={handleTestTranslator}
            onClose={() => setShowTranslatorSettings(false)}
          />
        )}

        {/* 提示词编辑区 - 单独一行，自适应高度 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Edit3 className="text-blue-600 mr-2" size={20} />
                提示词编辑区
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2">
                  悬停编辑 • 权重调节 • 括号控制 • 智能翻译
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={translateAllTags}
                  disabled={selectedTags.length === 0}
                  className="flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Languages size={14} />
                  翻译全部
                </button>
              </div>
            </div>
            
            <div 
              className="border border-gray-300 rounded-lg p-6 bg-blue-50/20 overflow-y-auto"
              style={{
                minHeight: '200px',
                maxHeight: '1200px',
                height: 'auto'
              }}
            >
              {selectedTags.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <div className="text-center">
                    <TagIcon size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">点击下方标签库添加标签</p>
                    <p className="text-xs text-gray-400 mt-1">或在上方输入区直接输入提示词</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {selectedTags.map((tag, index) => (
                    <TagPill
                      key={index}
                      tag={tag}
                      index={index}
                      isDisabled={disabledTags.has(index)}
                      onDelete={() => deleteTag(index)}
                      onToggleDisabled={() => toggleDisabled(index)}
                      onAdjustWeight={(delta) => adjustWeight(index, delta)}
                      onAdjustBrackets={(bracketType, delta) => adjustBrackets(index, bracketType, delta)}
                      onCopy={() => copyTag(tag)}
                      onFavorite={() => favoriteTag(tag)}
                      onTranslate={translateSingleTag}
                      translatedTags={translatedTags}
                      hoveredTag={hoveredTag}
                      setHoveredTag={setHoveredTag}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧分类导航 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sticky top-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索标签..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                {Object.entries(TAG_DATABASE).map(([categoryKey, category]) => (
                  <div key={categoryKey}>
                    <button
                      onClick={() => toggleCategory(categoryKey)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedCategory === categoryKey && !selectedSubcategory
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      {expandedCategories[categoryKey] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>

                    {expandedCategories[categoryKey] && (
                      <div className="ml-4 mt-1 space-y-1">
                        {Object.entries(category.subcategories).map(([subcategoryKey, subcategory]) => (
                          <button
                            key={subcategoryKey}
                            onClick={() => selectCategory(categoryKey, subcategoryKey)}
                            className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                              selectedCategory === categoryKey && selectedSubcategory === subcategoryKey
                                ? 'bg-blue-50 text-blue-700'
                                : 'hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            {subcategory.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧标签展示区 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {searchQuery ? '搜索结果' : 
                       selectedSubcategory ? 
                       `${TAG_DATABASE[selectedCategory]?.name} - ${TAG_DATABASE[selectedCategory]?.subcategories[selectedSubcategory]?.name}` :
                       TAG_DATABASE[selectedCategory]?.name || '标签库'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {searchQuery ? `找到 ${currentTags.length} 个相关标签` : 
                       `共 ${currentTags.length} 个标签`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      点击标签添加到提示词
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {currentTags.length === 0 ? (
                  <div className="text-center py-12">
                    <TagIcon className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 mb-4">
                      {searchQuery ? '未找到匹配的标签' : '该分类暂无标签'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {currentTags.map((tag, index) => (
                      <TagCard
                        key={`${tag.en}-${index}`}
                        tag={tag}
                        onAdd={() => addTagToPrompt(tag)}
                        onToggleFavorite={() => toggleFavorite(tag)}
                        isFavorited={favorites.some(fav => fav.en === tag.en)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 复制状态提示 */}
      {copyStatus && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white text-sm transition-all duration-300 shadow-lg z-50 ${
          copyStatus === 'copied' ? 'bg-green-600' : 
          copyStatus === 'translating-to-target' ? 'bg-blue-600' :
          copyStatus === 'translate-to-target-success' ? 'bg-green-600' :
          copyStatus === 'translating-tag' ? 'bg-orange-600' :
          copyStatus === 'tag-translated' ? 'bg-green-600' :
          copyStatus === 'translating-tags-to-chinese' ? 'bg-purple-600' :
          copyStatus === 'tags-translated-to-chinese' ? 'bg-green-600' :
          copyStatus === 'translate-error' ? 'bg-red-600' :
          copyStatus === 'empty-prompt' ? 'bg-orange-600' :
          copyStatus === 'no-untranslated' ? 'bg-yellow-600' :
          copyStatus === 'test-success' ? 'bg-green-600' :
          copyStatus === 'test-failed' ? 'bg-red-600' :
          'bg-red-600'
        }`}>
          {getCopyStatusMessage()}
        </div>
      )}
    </div>
  );
};

/**
 * 翻译引擎设置组件
 */
const TranslatorSettings = ({ 
  availableTranslators, 
  selectedTranslator, 
  setSelectedTranslator, 
  targetLanguage,
  setTargetLanguage,
  translatorStatus, 
  onTestTranslator, 
  onClose 
}) => {
  // 按类型分组翻译引擎
  const groupedTranslators = Object.entries(availableTranslators).reduce((groups, [key, translator]) => {
    let category = '国际引擎';
    
    // 判断是否为国产引擎
    if (['baidu_web', 'alibaba_web', 'tencent_web', 'youdao_web', 'sogou_web', 'caiyun_web', 'volcengine_web', 'iflytek_web'].includes(key)) {
      category = '国产引擎';
    }
    
    if (!groups[category]) {
      groups[category] = [];
    }
    
    groups[category].push([key, translator]);
    return groups;
  }, {});

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="text-blue-600 mr-2" size={20} />
            翻译引擎设置
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2">
              共{Object.keys(availableTranslators).length}个引擎
            </span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* 当前选中引擎信息 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <CheckCircle className="text-blue-600 mr-2" size={16} />
            当前配置
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><span className="font-medium">翻译引擎:</span> {availableTranslators[selectedTranslator]?.name || '未选择'}</p>
            <p><span className="font-medium">目标语言:</span> 
              {targetLanguage === 'en' ? '🇺🇸 英文' :
               targetLanguage === 'zh' ? '🇨🇳 中文' :
               targetLanguage === 'ja' ? '🇯🇵 日文' :
               targetLanguage === 'ko' ? '🇰🇷 韩文' :
               targetLanguage === 'fr' ? '🇫🇷 法文' :
               targetLanguage === 'de' ? '🇩🇪 德文' :
               targetLanguage === 'es' ? '🇪🇸 西班牙文' :
               targetLanguage === 'ru' ? '🇷🇺 俄文' : '未知'}
            </p>
            <p><span className="font-medium">描述:</span> {availableTranslators[selectedTranslator]?.description || '无描述'}</p>
            <p><span className="font-medium">支持语言:</span> {availableTranslators[selectedTranslator]?.languages || 0} 种</p>
            <p><span className="font-medium">状态:</span> 
              {translatorStatus[selectedTranslator] === 'available' ? '✅ 可用' :
               translatorStatus[selectedTranslator] === 'unavailable' ? '❌ 不可用' :
               translatorStatus[selectedTranslator] === 'testing' ? '🔄 测试中' :
               '❓ 未测试'}
            </p>
            {availableTranslators[selectedTranslator]?.specialty && (
              <p><span className="font-medium">特色:</span> {availableTranslators[selectedTranslator].specialty.join(', ')}</p>
            )}
          </div>
        </div>

        {/* 按类别显示翻译引擎 */}
        {Object.entries(groupedTranslators).map(([category, translators]) => (
          <div key={category} className="mb-6">
            <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
              {category === '国产引擎' ? (
                <span className="text-red-600 mr-2">🇨🇳</span>
              ) : (
                <span className="text-blue-600 mr-2">🌍</span>
              )}
              {category}
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2">
                {translators.length}个
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {translators.map(([key, translator]) => (
                <div 
                  key={key}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTranslator === key 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedTranslator(key)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900 text-sm">{translator.name}</h5>
                    <div className="flex items-center gap-1">
                      {translatorStatus[key] === 'testing' && (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      )}
                      {translatorStatus[key] === 'available' && (
                        <CheckCircle className="text-green-600" size={14} />
                      )}
                      {translatorStatus[key] === 'unavailable' && (
                        <XCircle className="text-red-600" size={14} />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTestTranslator(key);
                        }}
                        className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                        title="测试引擎"
                      >
                        <TestTube size={12} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{translator.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full ${
                        translator.status === 'stable' ? 'bg-green-100 text-green-700' :
                        translator.status === 'premium' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {translator.status === 'stable' ? '稳定' :
                         translator.status === 'premium' ? '高级' : 
                         translator.status === 'experimental' ? '实验' : '未知'}
                      </span>
                      
                      <span className="text-gray-500">
                        {translator.languages}种语言
                      </span>
                    </div>
                    
                    {selectedTranslator === key && (
                      <span className="text-blue-600 font-medium">✓ 已选择</span>
                    )}
                  </div>
                  
                  {/* 特色功能标签 */}
                  {translator.specialty && translator.specialty.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {translator.specialty.slice(0, 2).map((spec, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-orange-100 text-orange-600 px-1 py-0.5 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                      {translator.specialty.length > 2 && (
                        <span className="text-xs text-gray-500">+{translator.specialty.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 使用提示 */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            使用提示
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• <span className="font-medium">目标语言</span>：在英文输出区可选择翻译目标语言，默认为英文</li>
            <li>• <span className="font-medium">国产引擎</span>：对中文翻译优化，支持AI绘画术语</li>
            <li>• <span className="font-medium">国际引擎</span>：覆盖语言更广，部分支持更多语言对</li>
            <li>• <span className="font-medium">智能降级</span>：优先使用选中引擎，失败时自动切换</li>
            <li>• <span className="font-medium">专业词典</span>：内置200+ AI绘画术语，离线可用</li>
            <li>• <span className="font-medium">引擎测试</span>：点击测试按钮检查引擎可用性</li>
            <li>• <span className="font-medium">CORS限制</span>：部分引擎可能需要代理或有访问限制</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * 标签胶囊组件 - 重新设计，增强翻译功能
 */
const TagPill = ({ 
  tag, 
  index,
  isDisabled,
  onDelete, 
  onToggleDisabled,
  onAdjustWeight,
  onAdjustBrackets,
  onCopy,
  onFavorite,
  onTranslate,
  translatedTags,
  hoveredTag,
  setHoveredTag
}) => {
  const [chineseTranslation, setChineseTranslation] = useState('');
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);

  // 解析标签
  const parseTag = (tag) => {
    // 检测权重格式 (tag:1.2)
    const weightMatch = tag.match(/^\((.+?):([0-9.]+)\)$/);
    if (weightMatch) {
      return {
        text: weightMatch[1],
        weight: parseFloat(weightMatch[2]),
        bracketType: 'none',
        brackets: 0
      };
    }
    
    // 检测括号类型和层级
    let brackets = 0;
    let text = tag;
    let bracketType = 'none';
    
    // 检测圆括号 ()
    if (text.startsWith('(') && text.endsWith(')')) {
      bracketType = 'round';
      while (text.startsWith('(') && text.endsWith(')')) {
        brackets++;
        text = text.slice(1, -1);
      }
    }
    // 检测花括号 {}
    else if (text.startsWith('{') && text.endsWith('}')) {
      bracketType = 'curly';
      while (text.startsWith('{') && text.endsWith('}')) {
        brackets++;
        text = text.slice(1, -1);
      }
    }
    // 检测方括号 []
    else if (text.startsWith('[') && text.endsWith(']')) {
      bracketType = 'square';
      while (text.startsWith('[') && text.endsWith(']')) {
        brackets++;
        text = text.slice(1, -1);
      }
    }
    
    return { text, weight: 1.0, bracketType, brackets };
  };

  const parsed = parseTag(tag);
  const isHovered = hoveredTag === index;

  // 自动加载中文翻译
  useEffect(() => {
    const loadChineseTranslation = async () => {
      // 如果已经有翻译或正在加载，跳过
      if (chineseTranslation || isLoadingTranslation) return;
      
      // 检查是否已经是中文
      if (detectLanguage(parsed.text) === 'zh') {
        setChineseTranslation(parsed.text);
        return;
      }
      
      // 检查缓存的翻译
      if (translatedTags[parsed.text]) {
        const cached = translatedTags[parsed.text];
        const translatedText = typeof cached === 'object' && cached.translatedText ? cached.translatedText : cached;
        setChineseTranslation(translatedText);
        return;
      }
      
      // 异步加载翻译
      setIsLoadingTranslation(true);
      try {
        const result = await onTranslate(tag);
        const translatedText = typeof result === 'object' && result.translatedText ? result.translatedText : result;
        setChineseTranslation(translatedText);
      } catch (error) {
        console.error('标签翻译失败:', error);
        setChineseTranslation(parsed.text); // 翻译失败时显示原文
      } finally {
        setIsLoadingTranslation(false);
      }
    };

    // 延迟加载翻译，避免同时加载太多
    const timer = setTimeout(loadChineseTranslation, index * 200);
    return () => clearTimeout(timer);
  }, [tag, translatedTags, onTranslate, parsed.text, index, chineseTranslation, isLoadingTranslation]);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setHoveredTag(index)}
      onMouseLeave={(e) => {
        // 扩大判定范围：检查鼠标是否真的离开了整个区域
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        // 扩大检测范围20像素
        const margin = 20;
        if (x < rect.left - margin || x > rect.right + margin || 
            y < rect.top - margin || y > rect.bottom + 140) { // 底部多留140px给编辑栏
          setHoveredTag(null);
        }
      }}
    >
      {/* 主标签胶囊 */}
      <div
        className={`inline-flex flex-col gap-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer min-w-0 ${
          isDisabled 
            ? 'bg-gray-200 text-gray-400 opacity-60' 
            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={`break-all ${isDisabled ? 'line-through' : ''}`}>{tag}</span>
          <button
            onClick={onDelete}
            className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
          >
            <X size={10} />
          </button>
        </div>
        
        {/* 中文翻译显示 */}
        <div className={`text-xs px-1 flex items-center gap-1 ${
          isDisabled ? 'text-gray-400 line-through' : 'text-gray-600'
        }`}>
          {isLoadingTranslation ? (
            <>
              <RefreshCw size={10} className="animate-spin" />
              <span>翻译中...</span>
            </>
          ) : chineseTranslation ? (
            <>
              <Languages size={10} className="text-blue-500" />
              <span>{chineseTranslation}</span>
            </>
          ) : (
            <span className="text-gray-400">点击翻译</span>
          )}
        </div>
      </div>

      {/* 悬停编辑栏 */}
      {isHovered && (
        <div 
          className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-3 z-30 min-w-max"
          onMouseEnter={() => setHoveredTag(index)}
          onMouseLeave={() => setHoveredTag(null)}
        >
          {/* 使用提示 */}
          <div className="text-xs text-gray-500 mb-2 px-1">
            权重格式: (tag:1.2) • 括号强调: ((tag)) • 两者互斥
          </div>
          
          {/* 翻译信息显示 */}
          {chineseTranslation && chineseTranslation !== parsed.text && (
            <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded mb-2">
              <Languages size={10} className="inline mr-1" />
              中文: {chineseTranslation}
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {/* 权重调整 */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600 min-w-8">权重</span>
              <button
                onClick={() => onAdjustWeight(-0.1)}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600"
                disabled={parsed.weight <= 0.1}
              >
                -
              </button>
              <div className="text-xs font-mono min-w-12 text-center bg-gray-50 px-2 py-1 rounded border text-gray-700">
                {parsed.weight !== 1.0 ? parsed.weight.toFixed(1) : '1.0'}
              </div>
              <button
                onClick={() => onAdjustWeight(0.1)}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600"
                disabled={parsed.weight >= 2.0}
              >
                +
              </button>
            </div>

            {/* 分隔线 */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* 括号控制 - 三个类型共用控制 */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600 min-w-8">括号</span>
              <button
                onClick={() => {
                  if (parsed.bracketType === 'round') onAdjustBrackets('round', -1);
                  else if (parsed.bracketType === 'curly') onAdjustBrackets('curly', -1);
                  else if (parsed.bracketType === 'square') onAdjustBrackets('square', -1);
                }}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={parsed.bracketType === 'none' || parsed.weight !== 1.0}
              >
                -
              </button>
              
              <div className="text-xs font-mono min-w-10 text-center bg-gray-50 px-2 py-1 rounded border text-gray-700">
                {parsed.weight !== 1.0 ? '权重模式' :
                 parsed.bracketType === 'round' ? `()×${parsed.brackets}` :
                 parsed.bracketType === 'curly' ? `{}×${parsed.brackets}` :
                 parsed.bracketType === 'square' ? `[]×${parsed.brackets}` : '无'}
              </div>
              
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => onAdjustBrackets('round', 1)}
                  className={`w-6 h-6 rounded text-xs flex items-center justify-center font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    (parsed.bracketType === 'none' || parsed.bracketType === 'round') && parsed.weight === 1.0
                      ? 'bg-orange-100 hover:bg-orange-200 text-orange-700' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  disabled={(parsed.bracketType !== 'none' && parsed.bracketType !== 'round') || parsed.weight !== 1.0}
                  title="圆括号 () - 标准强调"
                >
                  ()
                </button>
                <button
                  onClick={() => onAdjustBrackets('curly', 1)}
                  className={`w-6 h-6 rounded text-xs flex items-center justify-center font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    (parsed.bracketType === 'none' || parsed.bracketType === 'curly') && parsed.weight === 1.0
                      ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  disabled={(parsed.bracketType !== 'none' && parsed.bracketType !== 'curly') || parsed.weight !== 1.0}
                  title="花括号 {} - 强制强调"
                >
                  {}
                </button>
                <button
                  onClick={() => onAdjustBrackets('square', 1)}
                  className={`w-6 h-6 rounded text-xs flex items-center justify-center font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    (parsed.bracketType === 'none' || parsed.bracketType === 'square') && parsed.weight === 1.0
                      ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  disabled={(parsed.bracketType !== 'none' && parsed.bracketType !== 'square') || parsed.weight !== 1.0}
                  title="方括号 [] - 弱化强调"
                >
                  []
                </button>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* 功能按钮 */}
            <div className="flex items-center gap-1">
              <button
                onClick={onCopy}
                className="w-7 h-7 rounded bg-green-100 hover:bg-green-200 text-green-700 flex items-center justify-center transition-colors"
                title="复制"
              >
                <Copy size={12} />
              </button>
              <button
                onClick={onFavorite}
                className="w-7 h-7 rounded bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center transition-colors"
                title="收藏"
              >
                <Heart size={12} />
              </button>
              <button
                onClick={onToggleDisabled}
                className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                  isDisabled 
                    ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={isDisabled ? "启用标签" : "禁用标签"}
              >
                {isDisabled ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
              <button
                onClick={async () => {
                  setIsLoadingTranslation(true);
                  try {
                    const result = await onTranslate(tag);
                    const translatedText = typeof result === 'object' && result.translatedText ? result.translatedText : result;
                    setChineseTranslation(translatedText);
                  } catch (error) {
                    console.error('手动翻译失败:', error);
                  } finally {
                    setIsLoadingTranslation(false);
                  }
                }}
                className="w-7 h-7 rounded bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center transition-colors"
                title="重新翻译"
                disabled={isLoadingTranslation}
              >
                {isLoadingTranslation ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Languages size={12} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 标签卡片组件
 */
const TagCard = ({ tag, onAdd, onToggleFavorite, isFavorited }) => (
  <div className="group bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer">
    <div onClick={onAdd} className="flex-1">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-blue-700 transition-colors">
            {tag.en}
          </h4>
          <p className="text-xs text-blue-600 mb-2">
            {tag.cn}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`p-1 rounded-full transition-colors ${
            isFavorited 
              ? 'text-red-500 hover:bg-red-50' 
              : 'text-gray-400 hover:bg-gray-100 hover:text-red-500'
          }`}
        >
          <Heart size={14} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <TrendingUp size={12} className="text-green-600" />
            <span className="text-xs text-green-600 font-medium">{tag.frequency}%</span>
          </div>
          <div className="w-12 bg-gray-200 rounded-full h-1">
            <div 
              className="bg-green-500 h-1 rounded-full transition-all" 
              style={{ width: `${tag.frequency}%` }}
            />
          </div>
        </div>
        
        <button
          onClick={onAdd}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-blue-600 text-white px-2 py-1 rounded-full hover:bg-blue-700"
        >
          <Plus size={10} className="inline mr-1" />
          添加
        </button>
      </div>
    </div>
  </div>
);

export default PromptLibraryPage;