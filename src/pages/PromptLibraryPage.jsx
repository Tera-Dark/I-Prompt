import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Copy, Heart, X, Languages, 
  ChevronDown, ChevronRight, Tag as TagIcon,
  Sparkles, TrendingUp, Edit3,
  Trash2, 
  EyeOff, Eye, Settings, TestTube, CheckCircle, XCircle, RefreshCw,
  Globe, ArrowRightLeft, Download, Upload, Edit, Save, Database, 
  Shield, AlertTriangle, FileText, Lock
} from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import { 
  translateTag, 
  getAvailableTranslators, 
  testTranslator, 
  batchTranslate,
  translatePrompt,
  detectLanguage
} from '../services/translationService';
import { 
  TAG_DATABASE, 
  TagDatabaseManager,
  searchTags
} from '../constants/tagDatabase';

const PromptLibraryPage = () => {
  // 提示词编辑状态
  const [inputPrompt, setInputPrompt] = useState(''); // 用户输入的提示词（可能是中文）
  const [englishPrompt, setEnglishPrompt] = useState(''); // 最终的英文提示词
  // const [promptHistory, setPromptHistory] = useState([]);
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
  
  // 标签库管理状态
  const [showTagManager, setShowTagManager] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [managementMode, setManagementMode] = useState('view'); // view, edit, add
  const [editingTag, setEditingTag] = useState(null);
  const [newTagData, setNewTagData] = useState({ en: '', cn: '', frequency: 50 });
  const [importExportData, setImportExportData] = useState('');
  const [tagManagerMessage, setTagManagerMessage] = useState('');
  
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
    
    // 当英文提示词发生变化时，将其分解为标签
    if (englishPrompt.trim()) {
      // 支持中英文逗号分割
      const tagsFromPrompt = englishPrompt.split(/[,，]/).map(tag => tag.trim()).filter(tag => tag);
      
      // 检查是否与当前选中的标签一致，避免无限循环
      const currentTagsStr = selectedTags.join(', ');
      const newTagsStr = tagsFromPrompt.join(', ');
      
      if (currentTagsStr !== newTagsStr) {
        // 关键修复：只有当新的标签集合包含当前所有启用的标签时，才认为这是内部更新
        const enabledTags = selectedTags.filter((_, index) => !disabledTags.has(index));
        const enabledTagsStr = enabledTags.join(', ');
        
        // 如果英文提示词正好等于启用标签的组合，说明这是禁用操作导致的内部更新，不要同步
        if (newTagsStr === enabledTagsStr) {
          return; // 不进行同步，保持现有的selectedTags和disabledTags
        }
        
        // 否则，这是用户输入或其他外部变化导致的，需要同步
        setSelectedTags(tagsFromPrompt);
        
        // 检查是否为全新的标签集合（没有任何重叠）
        const hasOverlap = selectedTags.some(tag => tagsFromPrompt.includes(tag));
        if (!hasOverlap && selectedTags.length > 0) {
          // 完全不同的标签集合，重置禁用状态
          setDisabledTags(new Set());
        } else {
          // 有重叠或者是从空开始，保持现有的禁用状态，但需要调整索引
          const newDisabled = new Set();
          disabledTags.forEach(oldIndex => {
            if (oldIndex < selectedTags.length) {
              const oldTag = selectedTags[oldIndex];
              const newIndex = tagsFromPrompt.indexOf(oldTag);
              if (newIndex !== -1) {
                newDisabled.add(newIndex);
              }
            }
          });
          setDisabledTags(newDisabled);
        }
      }
    } else {
      // 英文提示词为空时，清空标签
      if (selectedTags.length > 0) {
        setSelectedTags([]);
        setDisabledTags(new Set());
      }
    }
  }, [englishPrompt, isUpdatingPrompt, selectedTags, disabledTags]);

  // 当禁用状态变化时，更新英文提示词显示
  const updateEnglishPrompt = useCallback((tags) => {
    setIsUpdatingPrompt(true);
    
    // 过滤掉禁用的标签
    const enabledTags = tags.filter((_, index) => !disabledTags.has(index));
    const newPrompt = enabledTags.join(', ');
    
    setEnglishPrompt(newPrompt);
    
    setTimeout(() => {
      setIsUpdatingPrompt(false);
    }, 0);
  }, [disabledTags]);

  useEffect(() => {
    if (!isUpdatingPrompt && selectedTags.length > 0) {
      updateEnglishPrompt(selectedTags);
    }
  }, [disabledTags, isUpdatingPrompt, selectedTags, updateEnglishPrompt]);

  // 翻译为目标语言
  const translateToTargetLanguage = useCallback(async () => {
    if (!inputPrompt.trim()) {
      setCopyStatus('empty-prompt');
      setTimeout(() => setCopyStatus(''), 2000);
      return;
    }

    setIsTranslatingPrompt(true);
    setCopyStatus('translating-to-target');

    try {
      console.log(`开始翻译提示词: "${inputPrompt}" 到 ${targetLanguage}`);
      
      const result = await translatePrompt(inputPrompt, {
        preferredEngines: ['mymemory', 'google_web', 'libre', selectedTranslator], // 免费引擎优先
        targetLang: targetLanguage,
        sourceLang: inputLanguage === 'auto' ? 'zh' : inputLanguage
      });

      console.log('翻译结果:', result);
      
      if (result && result.translatedText) {
        setEnglishPrompt(result.translatedText);
        setCopyStatus('translate-to-target-success');
        
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
        if (result.errors && result.errors.length > 0) {
          console.warn('翻译错误:', result.errors);
        }
      } else {
        throw new Error('翻译结果为空');
      }
      
    } catch (error) {
      console.error('提示词翻译失败:', error);
      setCopyStatus('translate-error');
      
      // 如果在线翻译失败，尝试使用本地词典
      try {
        const { translateText } = await import('../services/translationService');
        const fallbackResult = await translateText(inputPrompt, {
          targetLang: targetLanguage,
          sourceLang: 'zh',
          preferredEngines: ['dictionary'] // 强制使用词典
        });
        
        if (fallbackResult && fallbackResult.translatedText) {
          setEnglishPrompt(fallbackResult.translatedText);
          setCopyStatus('translate-fallback-success');
          console.log('词典翻译成功:', fallbackResult.translatedText);
        }
      } catch (fallbackError) {
        console.error('词典翻译也失败:', fallbackError);
      }
    } finally {
      setIsTranslatingPrompt(false);
      setTimeout(() => setCopyStatus(''), 3000);
    }
  }, [inputPrompt, targetLanguage, inputLanguage, selectedTranslator]);

  // 自动翻译监听 - 检测输入语言并翻译
  const handleAutoTranslation = useCallback(async () => {
    if (!inputPrompt.trim()) return;
    
    setIsTranslatingPrompt(true);

    // 检测输入语言
    const detectedLang = detectLanguage(inputPrompt);
    setInputLanguage(detectedLang);

    if (detectedLang === targetLanguage) {
      // 语言相同也要经过规范化处理
      setEnglishPrompt(inputPrompt.trim());
    } else {
      // 需要翻译为目标语言
      await translateToTargetLanguage();
    }
  }, [inputPrompt, targetLanguage, translateToTargetLanguage]);

  useEffect(() => {
    if (autoTranslate && inputPrompt.trim()) {
      const timer = setTimeout(() => {
        handleAutoTranslation();
      }, 1000); // 延迟1秒自动翻译
      
      return () => clearTimeout(timer);
    }
  }, [inputPrompt, autoTranslate, handleAutoTranslation]);

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

  // 添加标签到提示词（移除跳转功能）
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
    
    // 显示添加成功提示
    setCopyStatus('tag-added');
    setTimeout(() => setCopyStatus(''), 1500);
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

  // 翻译所有标签为目标语言
  const translateAllTags = async () => {
    const untranslatedTags = selectedTags.filter(tag => {
      const parsed = parseTag(tag);
      return !translatedTags[parsed.text] || detectLanguage(parsed.text) !== targetLanguage;
    });

    if (untranslatedTags.length === 0) {
      setCopyStatus('no-untranslated');
      setTimeout(() => setCopyStatus(''), 2000);
      return;
    }

    setCopyStatus('translating-tags-to-target');
    
    try {
      const texts = untranslatedTags.map(tag => parseTag(tag).text);
      const results = await batchTranslate(texts, {
        preferredEngines: [selectedTranslator, 'mymemory', 'google_web', 'libre'],
        targetLang: targetLanguage, // 使用用户选择的目标语言
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
      setCopyStatus('tags-translated-to-target');
    } catch (error) {
      console.error('批量翻译失败:', error);
      setCopyStatus('translate-error');
    }
    
    setTimeout(() => setCopyStatus(''), 2000);
  };

  // 翻译单个标签为目标语言（用于显示）
  const translateSingleTag = async (tag) => {
    // 提取纯文本进行翻译
    const parsed = parseTag(tag);
    const pureText = parsed.text;
    
    // 如果已经有中文翻译，直接返回
    if (translatedTags[pureText]) {
      const cached = translatedTags[pureText];
      const translatedText = typeof cached === 'object' && cached.translatedText ? cached.translatedText : cached;
      return translatedText;
    }
    
    // 检查是否已经是中文（简单检测：包含中文字符）
    const isAlreadyChinese = /[\u4e00-\u9fff]/.test(pureText);
    if (isAlreadyChinese) {
      setTranslatedTags(prev => ({ ...prev, [pureText]: pureText }));
      return pureText;
    }
    
    try {
      console.log(`翻译标签为中文: "${pureText}"`);
      
      const result = await translateTag(pureText, {
        preferredEngines: ['mymemory', 'google_web', 'libre'], // 使用免费引擎
        targetLang: 'zh', // 固定翻译为中文
        sourceLang: 'auto'
      });
      
      console.log(`标签翻译结果:`, result);
      
      // 确保只返回字符串，不是对象
      const translatedText = result.translatedText || result;
      
      // 检查翻译质量
      if (translatedText && translatedText.trim() !== pureText.trim()) {
        setTranslatedTags(prev => ({ ...prev, [pureText]: translatedText }));
        return translatedText;
      } else {
        // 翻译质量不佳，尝试使用内置词典
        const fallbackTranslation = getFallbackChineseTranslation(pureText);
        setTranslatedTags(prev => ({ ...prev, [pureText]: fallbackTranslation }));
        return fallbackTranslation;
      }
      
    } catch (error) {
      console.error('标签翻译失败:', error);
      
      // 翻译失败时使用内置词典
      const fallbackTranslation = getFallbackChineseTranslation(pureText);
      setTranslatedTags(prev => ({ ...prev, [pureText]: fallbackTranslation }));
      return fallbackTranslation;
    }
  };

  // 内置中文词典翻译（降级方案）
  const getFallbackChineseTranslation = (englishText) => {
    const chineseDict = {
      // 人物相关
      'beautiful': '美丽',
      'cute': '可爱',
      'pretty': '漂亮',
      'handsome': '英俊',
      'gorgeous': '华丽',
      'stunning': '令人惊叹',
      'amazing': '惊人',
      'perfect': '完美',
      'flawless': '无瑕',
      'elegant': '优雅',
      'graceful': '优美',
      'charming': '迷人',
      'attractive': '有吸引力',
      'lovely': '可爱',
      'sweet': '甜美',
      
      // 人物类型
      'girl': '女孩',
      'boy': '男孩',
      'woman': '女性',
      'man': '男性',
      'lady': '女士',
      'gentleman': '绅士',
      'person': '人物',
      'character': '角色',
      'figure': '人物',
      'maiden': '少女',
      'youth': '青年',
      'child': '儿童',
      'baby': '婴儿',
      'adult': '成人',
      'teenager': '青少年',
      'young': '年轻',
      'old': '年老',
      
      // 动物相关
      'cat': '猫',
      'dog': '狗',
      'wolf': '狼',
      'fox': '狐狸',
      'rabbit': '兔子',
      'bird': '鸟',
      'dragon': '龙',
      'tiger': '老虎',
      'lion': '狮子',
      'bear': '熊',
      'horse': '马',
      'deer': '鹿',
      'mouse': '老鼠',
      'fish': '鱼',
      'butterfly': '蝴蝶',
      'white': '白色',
      'black': '黑色',
      'red': '红色',
      'blue': '蓝色',
      'green': '绿色',
      'yellow': '黄色',
      'purple': '紫色',
      'pink': '粉色',
      'orange': '橙色',
      'brown': '棕色',
      'gray': '灰色',
      'silver': '银色',
      'gold': '金色',
      
      // 外观特征
      'hair': '头发',
      'eyes': '眼睛',
      'face': '脸',
      'skin': '皮肤',
      'smile': '微笑',
      'dress': '连衣裙',
      'clothes': '衣服',
      'outfit': '服装',
      'uniform': '制服',
      'kimono': '和服',
      'hat': '帽子',
      'glasses': '眼镜',
      'jewelry': '珠宝',
      'long': '长',
      'short': '短',
      'curly': '卷曲',
      'straight': '直',
      'wavy': '波浪',
      'thick': '厚',
      'thin': '薄',
      'big': '大',
      'small': '小',
      'large': '大型',
      'tiny': '微小',
      
      // 表情情感
      'happy': '开心',
      'sad': '悲伤',
      'angry': '愤怒',
      'surprised': '惊讶',
      'excited': '兴奋',
      'calm': '平静',
      'peaceful': '宁静',
      'joyful': '快乐',
      'cheerful': '愉快',
      'smiling': '微笑',
      'laughing': '大笑',
      'crying': '哭泣',
      'serious': '严肃',
      'gentle': '温柔',
      'kind': '善良',
      'friendly': '友好',
      'shy': '害羞',
      'confident': '自信',
      'proud': '骄傲',
      'humble': '谦逊',
      
      // 风格类型
      'anime': '动漫',
      'manga': '漫画',
      'realistic': '写实',
      'cartoon': '卡通',
      'fantasy': '奇幻',
      'sci-fi': '科幻',
      'cyberpunk': '赛博朋克',
      'steampunk': '蒸汽朋克',
      'medieval': '中世纪',
      'modern': '现代',
      'vintage': '复古',
      'retro': '怀旧',
      'classic': '经典',
      'traditional': '传统',
      'contemporary': '当代',
      'futuristic': '未来派',
      'gothic': '哥特',
      'baroque': '巴洛克',
      'minimalist': '极简',
      'abstract': '抽象',
      'surreal': '超现实',
      
      // 艺术质量
      'masterpiece': '杰作',
      'artwork': '艺术品',
      'illustration': '插画',
      'painting': '绘画',
      'drawing': '素描',
      'sketch': '草图',
      'digital art': '数字艺术',
      'oil painting': '油画',
      'watercolor': '水彩',
      'pencil': '铅笔',
      'ink': '墨水',
      'acrylic': '丙烯',
      'best quality': '最佳质量',
      'high quality': '高质量',
      'ultra detailed': '超详细',
      'extremely detailed': '极其详细',
      'highly detailed': '高度详细',
      'detailed': '详细',
      'sharp': '锐利',
      'clear': '清晰',
      'vivid': '鲜艳',
      'bright': '明亮',
      'colorful': '多彩',
      'vibrant': '充满活力',
      
      // 环境场景
      'background': '背景',
      'scenery': '风景',
      'landscape': '风景',
      'nature': '自然',
      'forest': '森林',
      'mountain': '山',
      'sea': '海',
      'ocean': '海洋',
      'beach': '海滩',
      'sky': '天空',
      'cloud': '云',
      'sun': '太阳',
      'moon': '月亮',
      'star': '星星',
      'night': '夜晚',
      'day': '白天',
      'sunset': '日落',
      'sunrise': '日出',
      'rain': '雨',
      'snow': '雪',
      'wind': '风',
      'flower': '花',
      'tree': '树',
      'grass': '草',
      'leaf': '叶子',
      'garden': '花园',
      'park': '公园',
      'city': '城市',
      'building': '建筑',
      'house': '房子',
      'room': '房间',
      'window': '窗户',
      'door': '门',
      'bridge': '桥',
      'road': '道路',
      'street': '街道',
      
      // 动作姿势
      'standing': '站立',
      'sitting': '坐着',
      'lying': '躺着',
      'walking': '行走',
      'running': '奔跑',
      'jumping': '跳跃',
      'dancing': '舞蹈',
      'singing': '唱歌',
      'reading': '阅读',
      'writing': '写作',
      'sleeping': '睡觉',
      'eating': '吃饭',
      'drinking': '喝水',
      'playing': '玩耍',
      'working': '工作',
      'studying': '学习',
      'looking': '看',
      'watching': '观看',
      'listening': '听',
      'thinking': '思考',
      'dreaming': '做梦',
      
      // 视角构图
      'close-up': '特写',
      'full body': '全身',
      'upper body': '上半身',
      'portrait': '肖像',
      'profile': '侧面',
      'front view': '正面',
      'side view': '侧面',
      'back view': '背面',
      'from above': '俯视',
      'from below': '仰视',
      'wide shot': '远景',
      'medium shot': '中景',
      'extreme close-up': '大特写',
      
      // 复合词处理
      'beautiful girl': '美丽女孩',
      'cute girl': '可爱女孩',
      'pretty woman': '漂亮女性',
      'handsome man': '英俊男性',
      'white cat': '白猫',
      'black cat': '黑猫',
      'red hair': '红色头发',
      'blue eyes': '蓝色眼睛',
      'long hair': '长发',
      'short hair': '短发',
      'school uniform': '校服',
      'wedding dress': '婚纱',
      'casual clothes': '便装',
      'formal wear': '正装',
      'dragon lady': '龙娘',
      'white wolf': '白狼',
      'red wolf': '红狼',
      'best friend': '最好的朋友',
      'love story': '爱情故事',
      'fairy tale': '童话',
      'magic spell': '魔法咒语',
      'crystal clear': '水晶般清澈',
      'snow white': '雪白',
      'cherry blossom': '樱花',
      'full moon': '满月',
      'shooting star': '流星',
      'rainbow': '彩虹',
      'golden hour': '黄金时刻',
      'blue hour': '蓝调时刻'
    };
    
    // 先尝试完整匹配
    const exactMatch = chineseDict[englishText.toLowerCase()];
    if (exactMatch) {
      return exactMatch;
    }
    
    // 如果没有完整匹配，尝试分词匹配
    const words = englishText.toLowerCase().split(/\s+/);
    const translatedWords = words.map(word => {
      return chineseDict[word] || word;
    });
    
    // 如果有翻译成功的词，返回翻译结果
    const hasTranslation = translatedWords.some((word, index) => word !== words[index]);
    if (hasTranslation) {
      return translatedWords.join(' ');
    }
    
    // 都没有匹配到，返回原文
    return englishText;
  };

  // 复制标签
  const copyTag = async (tag) => {
    const success = await copyToClipboard(tag);
    setCopyStatus(success ? 'copied' : 'error');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  // 收藏标签（从TagPill调用，包含翻译信息）
  const favoriteTag = async (tag, chineseTranslation = null) => {
    const parsed = parseTag(tag);
    
    let finalTranslation = chineseTranslation;
    
    // 如果没有提供翻译，尝试获取现有翻译
    if (!finalTranslation) {
      if (translatedTags[parsed.text]) {
        const cached = translatedTags[parsed.text];
        finalTranslation = typeof cached === 'object' && cached.translatedText ? cached.translatedText : cached;
      } else {
        // 尝试获取翻译
        try {
          const result = await translateSingleTag(tag);
          finalTranslation = typeof result === 'object' && result.translatedText ? result.translatedText : result;
        } catch (error) {
          console.error('收藏时翻译失败:', error);
          finalTranslation = parsed.text; // 使用原文作为降级方案
        }
      }
    }
    
    // 创建标签对象 - 英文作为主要标签，翻译作为显示
    const tagObj = { 
      en: parsed.text, 
      cn: finalTranslation || parsed.text,
      frequency: 80 
    };
    
    toggleFavorite(tagObj);
    
    // 显示收藏成功提示
    setCopyStatus('tag-favorited');
    setTimeout(() => setCopyStatus(''), 2000);
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
      } else if (selectedSubcategory === 'popular') {
        // 显示热门标签子分类
        return TAG_DATABASE.favorites.subcategories.popular.tags || [];
      } else {
        // 没有选择子分类时，显示所有收藏下的标签
        const allFavoriteTags = [];
        if (TAG_DATABASE.favorites && TAG_DATABASE.favorites.subcategories) {
          Object.values(TAG_DATABASE.favorites.subcategories).forEach(subcategory => {
            if (subcategory.tags) {
              allFavoriteTags.push(...subcategory.tags);
            }
          });
        }
        // 添加个人收藏的标签
        allFavoriteTags.push(...favorites);
        
        // 去重，基于英文标签名
        const uniqueTags = [];
        const seen = new Set();
        allFavoriteTags.forEach(tag => {
          if (!seen.has(tag.en)) {
            seen.add(tag.en);
            uniqueTags.push(tag);
          }
        });
        
        return uniqueTags;
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
      'translate-fallback-success': `词典翻译为${getLanguageName(targetLanguage)}成功`,
      'translate-error': '翻译失败',
      'translating-tag': '翻译标签中...',
      'tag-translated': '标签翻译成功',
      'tag-translate-failed': '标签翻译失败',
      'tag-added': '标签已添加到提示词',
      'tag-favorited': '标签已添加到个人收藏',
      'translating-tags-to-target': `批量翻译为${getLanguageName(targetLanguage)}中...`,
      'tags-translated-to-target': `标签已翻译为${getLanguageName(targetLanguage)}`,
      'no-untranslated': `所有标签已是${getLanguageName(targetLanguage)}`,
      'all-tags-translated': '所有标签翻译完成',
      'testing-translator': '测试翻译引擎中...',
      'test-success': '引擎测试成功',
      'test-failed': '引擎测试失败',
      'error': '操作失败'
    };
    return messages[copyStatus] || '';
  };

  // 标签库管理功能
  const handleAddTag = async () => {
    try {
      if (!newTagData.en || !newTagData.cn) {
        setTagManagerMessage('请输入英文和中文标签');
        return;
      }
      
      const addedTag = TagDatabaseManager.addTag(
        selectedCategory, 
        selectedSubcategory, 
        newTagData
      );
      
      setNewTagData({ en: '', cn: '', frequency: 50 });
      setManagementMode('view');
      setTagManagerMessage(`标签 "${addedTag.en}" 添加成功`);
      
      // 强制刷新组件
      setSelectedCategory(selectedCategory);
    } catch (error) {
      setTagManagerMessage(`添加失败: ${error.message}`);
    }
    
    setTimeout(() => setTagManagerMessage(''), 3000);
  };

  const handleEditTag = (tag) => {
    setEditingTag(tag);
    setNewTagData({
      en: tag.en,
      cn: tag.cn,
      frequency: tag.frequency || 50
    });
    setManagementMode('edit');
  };

  const handleSaveTag = async () => {
    try {
      if (!editingTag || !newTagData.en || !newTagData.cn) {
        setTagManagerMessage('请输入完整的标签信息');
        return;
      }
      
      const updatedTag = TagDatabaseManager.updateTag(
        selectedCategory,
        selectedSubcategory,
        editingTag.id,
        newTagData
      );
      
      if (updatedTag) {
        setEditingTag(null);
        setNewTagData({ en: '', cn: '', frequency: 50 });
        setManagementMode('view');
        setTagManagerMessage(`标签 "${updatedTag.en}" 更新成功`);
        
        // 强制刷新组件
        setSelectedCategory(selectedCategory);
      } else {
        setTagManagerMessage('更新失败：标签不存在或为默认标签');
      }
    } catch (error) {
      setTagManagerMessage(`更新失败: ${error.message}`);
    }
    
    setTimeout(() => setTagManagerMessage(''), 3000);
  };

  const handleDeleteTag = async (tag) => {
    if (!window.confirm(`确定要删除标签 "${tag.en}" 吗？`)) {
      return;
    }
    
    try {
      const success = TagDatabaseManager.removeTag(
        selectedCategory,
        selectedSubcategory,
        tag.id
      );
      
      if (success) {
        setTagManagerMessage(`标签 "${tag.en}" 删除成功`);
        
        // 强制刷新组件
        setSelectedCategory(selectedCategory);
      } else {
        setTagManagerMessage('删除失败：标签不存在或为默认标签');
      }
    } catch (error) {
      setTagManagerMessage(`删除失败: ${error.message}`);
    }
    
    setTimeout(() => setTagManagerMessage(''), 3000);
  };

  const handleExportDatabase = () => {
    try {
      const exportData = TagDatabaseManager.exportUserDatabase();
      const jsonString = JSON.stringify(exportData, null, 2);
      setImportExportData(jsonString);
      setShowImportExport(true);
      setTagManagerMessage('用户标签库导出成功');
    } catch (error) {
      setTagManagerMessage(`导出失败: ${error.message}`);
    }
    
    setTimeout(() => setTagManagerMessage(''), 3000);
  };

  const handleImportDatabase = () => {
    try {
      if (!importExportData || typeof importExportData !== 'string' || !importExportData.trim()) {
        setTagManagerMessage('请输入有效的JSON数据');
        return;
      }
      
      const parsedData = JSON.parse(importExportData);
      TagDatabaseManager.importUserDatabase(parsedData);
      setImportExportData('');
      setShowImportExport(false);
      setTagManagerMessage('标签库导入成功');
      
      // 强制刷新组件
      setSelectedCategory('favorites');
    } catch (error) {
      setTagManagerMessage(`导入失败: ${error.message}`);
    }
    
    setTimeout(() => setTagManagerMessage(''), 3000);
  };

  const downloadExportFile = () => {
    const dataToDownload = typeof importExportData === 'string' ? importExportData : JSON.stringify(importExportData, null, 2);
    const blob = new Blob([dataToDownload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `i-prompt-tags-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setTagManagerMessage('标签库文件下载成功');
    setTimeout(() => setTagManagerMessage(''), 3000);
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
              {/* {promptHistory.length > 0 && (
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
              )} */}
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
              className="border border-gray-300 rounded-lg p-6 bg-blue-50/20 relative"
              style={{
                minHeight: '200px',
                maxHeight: '1200px',
                height: 'auto',
                overflow: 'visible'
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
                      onFavorite={(chineseTranslation) => favoriteTag(tag, chineseTranslation)}
                      onTranslate={translateSingleTag}
                      translatedTags={translatedTags}
                      hoveredTag={hoveredTag}
                      setHoveredTag={setHoveredTag}
                      targetLanguage={targetLanguage}
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
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-gray-600">
                        {searchQuery ? `找到 ${currentTags.length} 个相关标签` : 
                         `共 ${currentTags.length} 个标签`}
                      </p>
                      {selectedCategory && selectedSubcategory && TAG_DATABASE[selectedCategory]?.subcategories[selectedSubcategory]?.isDefault === false && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full flex items-center gap-1">
                          <Edit size={10} />
                          可编辑
                        </span>
                      )}
                      {selectedCategory && selectedSubcategory && TAG_DATABASE[selectedCategory]?.subcategories[selectedSubcategory]?.isDefault === true && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                          <Lock size={10} />
                          默认库
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* 管理按钮 */}
                    {selectedCategory && selectedSubcategory && (
                      <>
                        {TAG_DATABASE[selectedCategory]?.subcategories[selectedSubcategory]?.isDefault === false && (
                          <button
                            onClick={() => {
                              setManagementMode('add');
                              setNewTagData({ en: '', cn: '', frequency: 50 });
                              setShowTagManager(true);
                            }}
                            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <Plus size={14} />
                            添加标签
                          </button>
                        )}
                        <button
                          onClick={() => setShowTagManager(!showTagManager)}
                          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Database size={14} />
                          管理
                        </button>
                      </>
                    )}
                    
                    {/* 导入导出按钮 */}
                    <button
                      onClick={handleExportDatabase}
                      className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <Download size={14} />
                      导出
                    </button>
                    <button
                      onClick={() => setShowImportExport(true)}
                      className="flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                    >
                      <Upload size={14} />
                      导入
                    </button>
                    
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
                    {selectedCategory && selectedSubcategory && TAG_DATABASE[selectedCategory]?.subcategories[selectedSubcategory]?.isDefault === false && (
                      <button
                        onClick={() => {
                          setManagementMode('add');
                          setNewTagData({ en: '', cn: '', frequency: 50 });
                          setShowTagManager(true);
                        }}
                        className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus size={16} />
                        添加第一个标签
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {currentTags.map((tag, index) => (
                      <TagCard
                        key={`${tag.id || tag.en}-${index}`}
                        tag={tag}
                        onAdd={() => addTagToPrompt(tag)}
                        onToggleFavorite={() => favoriteTag(tag)}
                        isFavorited={favorites.some(fav => fav.en === tag.en)}
                        onEdit={showTagManager ? () => handleEditTag(tag) : null}
                        onDelete={showTagManager ? () => handleDeleteTag(tag) : null}
                        isEditable={TAG_DATABASE[selectedCategory]?.subcategories[selectedSubcategory]?.isDefault === false}
                        showManagement={showTagManager}
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
          copyStatus === 'tag-added' ? 'bg-blue-600' :
          copyStatus === 'tag-favorited' ? 'bg-pink-600' :
          copyStatus === 'translating-to-target' ? 'bg-blue-600' :
          copyStatus === 'translate-to-target-success' ? 'bg-green-600' :
          copyStatus === 'translating-tag' ? 'bg-orange-600' :
          copyStatus === 'tag-translated' ? 'bg-green-600' :
          copyStatus === 'translating-tags-to-target' ? 'bg-purple-600' :
          copyStatus === 'tags-translated-to-target' ? 'bg-green-600' :
          copyStatus === 'no-untranslated' ? 'bg-yellow-600' :
          copyStatus === 'translate-error' ? 'bg-red-600' :
          copyStatus === 'empty-prompt' ? 'bg-orange-600' :
          copyStatus === 'test-success' ? 'bg-green-600' :
          copyStatus === 'test-failed' ? 'bg-red-600' :
          'bg-red-600'
        }`}>
          {getCopyStatusMessage()}
        </div>
      )}

      {/* 标签管理面板 */}
      {showTagManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Database className="text-blue-600 mr-2" size={20} />
                  标签库管理
                  {selectedCategory && selectedSubcategory && (
                    <span className="text-sm text-gray-500 ml-2">
                      {TAG_DATABASE[selectedCategory]?.name} - {TAG_DATABASE[selectedCategory]?.subcategories[selectedSubcategory]?.name}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => {
                    setShowTagManager(false);
                    setManagementMode('view');
                    setEditingTag(null);
                    setNewTagData({ en: '', cn: '', frequency: 50 });
                  }}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              {tagManagerMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  tagManagerMessage.includes('成功') ? 'bg-green-50 text-green-700 border border-green-200' :
                  tagManagerMessage.includes('失败') || tagManagerMessage.includes('错误') ? 'bg-red-50 text-red-700 border border-red-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {tagManagerMessage}
                </div>
              )}
            </div>

            <div className="p-6">
              {(managementMode === 'add' || managementMode === 'edit') && (
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">
                    {managementMode === 'add' ? '添加新标签' : '编辑标签'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        英文标签 *
                      </label>
                      <input
                        type="text"
                        value={newTagData.en}
                        onChange={(e) => setNewTagData({ ...newTagData, en: e.target.value })}
                        placeholder="beautiful girl"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        中文翻译 *
                      </label>
                      <input
                        type="text"
                        value={newTagData.cn}
                        onChange={(e) => setNewTagData({ ...newTagData, cn: e.target.value })}
                        placeholder="美丽女孩"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        热度 (0-100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newTagData.frequency}
                        onChange={(e) => setNewTagData({ ...newTagData, frequency: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-6">
                    {managementMode === 'add' ? (
                      <button
                        onClick={handleAddTag}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus size={16} />
                        添加标签
                      </button>
                    ) : (
                      <button
                        onClick={handleSaveTag}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Save size={16} />
                        保存修改
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setManagementMode('view');
                        setEditingTag(null);
                        setNewTagData({ en: '', cn: '', frequency: 50 });
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              {/* 使用说明 */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Shield className="text-blue-600 mr-2" size={16} />
                  管理说明
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <span className="font-medium">默认库</span>：系统内置标签，不可编辑或删除</li>
                  <li>• <span className="font-medium">用户库</span>：自定义标签，支持增删改操作</li>
                  <li>• <span className="font-medium">导入导出</span>：支持JSON格式的标签库备份和恢复</li>
                  <li>• <span className="font-medium">数据安全</span>：所有修改都会自动保存到本地存储</li>
                  <li>• <span className="font-medium">热度影响</span>：影响搜索和推荐排序，建议设置为1-100</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 导入导出面板 */}
      {showImportExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="text-purple-600 mr-2" size={20} />
                  标签库导入导出
                </h3>
                <button
                  onClick={() => {
                    setShowImportExport(false);
                    setImportExportData('');
                  }}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 导出区域 */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                    <Download className="text-purple-600 mr-2" size={16} />
                    导出用户标签库
                  </h4>
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleExportDatabase}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Download size={16} />
                      生成导出数据
                    </button>
                    
                    {importExportData && (
                      <>
                        <textarea
                          value={importExportData}
                          readOnly
                          rows={12}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                          placeholder="导出的JSON数据将显示在这里..."
                        />
                        
                        <button
                          onClick={downloadExportFile}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download size={16} />
                          下载为文件
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 导入区域 */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                    <Upload className="text-orange-600 mr-2" size={16} />
                    导入标签库
                  </h4>
                  
                  <div className="space-y-4">
                    <textarea
                      value={importExportData}
                      onChange={(e) => setImportExportData(e.target.value)}
                      rows={12}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-mono"
                      placeholder="请粘贴要导入的JSON数据..."
                    />
                    
                    <button
                      onClick={handleImportDatabase}
                      disabled={!importExportData || (typeof importExportData === 'string' && !importExportData.trim())}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload size={16} />
                      导入标签库
                    </button>
                  </div>
                </div>
              </div>

              {/* 使用说明 */}
              <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                  <AlertTriangle className="text-yellow-600 mr-2" size={16} />
                  注意事项
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• <span className="font-medium">导出内容</span>：仅包含用户自定义的标签库，不包含系统默认库</li>
                  <li>• <span className="font-medium">导入合并</span>：导入的数据会与现有用户库合并，同名分类会覆盖</li>
                  <li>• <span className="font-medium">数据格式</span>：必须是有效的JSON格式，结构需与导出格式一致</li>
                  <li>• <span className="font-medium">备份建议</span>：重要数据请定期导出备份</li>
                  <li>• <span className="font-medium">安全提醒</span>：仅导入来源可信的标签库文件</li>
                </ul>
              </div>
            </div>
          </div>
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
  setHoveredTag,
  targetLanguage
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

  // 获取内置中文翻译
  const getBuiltinChineseTranslation = (englishText) => {
    const chineseDict = {
      // 基础词汇
      'beautiful': '美丽', 'cute': '可爱', 'pretty': '漂亮', 'handsome': '英俊',
      'girl': '女孩', 'boy': '男孩', 'woman': '女性', 'man': '男性',
      'cat': '猫', 'dog': '狗', 'wolf': '狼', 'dragon': '龙',
      'white': '白色', 'black': '黑色', 'red': '红色', 'blue': '蓝色',
      'hair': '头发', 'eyes': '眼睛', 'face': '脸部', 'smile': '微笑',
      'anime': '动漫', 'realistic': '写实', 'fantasy': '奇幻',
      'masterpiece': '杰作', 'best quality': '最佳质量',
      // 复合词
      'beautiful girl': '美丽女孩', 'cute girl': '可爱女孩',
      'white cat': '白猫', 'black cat': '黑猫', 'red wolf': '红狼',
      'dragon lady': '龙娘', 'long hair': '长发', 'short hair': '短发'
    };
    
    // 完整匹配
    const exactMatch = chineseDict[englishText.toLowerCase()];
    if (exactMatch) return exactMatch;
    
    // 分词匹配
    const words = englishText.toLowerCase().split(/\s+/);
    const translatedWords = words.map(word => chineseDict[word] || word);
    const hasTranslation = translatedWords.some((word, index) => word !== words[index]);
    
    return hasTranslation ? translatedWords.join(' ') : englishText;
  };

  // 自动加载中文翻译
  useEffect(() => {
    const loadChineseTranslation = async () => {
      // 检查是否已经是中文
      const isAlreadyChinese = /[\u4e00-\u9fff]/.test(parsed.text);
      if (isAlreadyChinese) {
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
      
      // 首先尝试内置词典
      const builtinTranslation = getBuiltinChineseTranslation(parsed.text);
      if (builtinTranslation !== parsed.text) {
        setChineseTranslation(builtinTranslation);
        return;
      }
      
      // 异步加载在线翻译
      if (!isLoadingTranslation) {
        setIsLoadingTranslation(true);
        try {
          const result = await onTranslate(tag);
          const translatedText = typeof result === 'object' && result.translatedText ? result.translatedText : result;
          setChineseTranslation(translatedText || builtinTranslation);
        } catch (error) {
          console.error('在线翻译失败，使用内置翻译:', error);
          setChineseTranslation(builtinTranslation);
        } finally {
          setIsLoadingTranslation(false);
        }
      }
    };

    // 延迟加载翻译，避免同时加载太多
    const timer = setTimeout(loadChineseTranslation, index * 50);
    return () => clearTimeout(timer);
  }, [tag, translatedTags, onTranslate, parsed.text, index, isLoadingTranslation]);

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
        {/* 英文标签（上层） */}
        <div className="flex items-center gap-2">
          <span className={`break-all ${isDisabled ? 'line-through' : ''}`} title="英文标签">{tag}</span>
          <button
            onClick={onDelete}
            className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
          >
            <X size={10} />
          </button>
        </div>
        
        {/* 中文翻译显示（下层） */}
        <div className={`text-xs px-1 flex items-center gap-1 ${
          isDisabled ? 'text-gray-400 line-through' : 'text-gray-600'
        }`}>
          {isLoadingTranslation ? (
            <>
              <RefreshCw size={10} className="animate-spin" />
              <span>翻译中...</span>
            </>
          ) : chineseTranslation && chineseTranslation !== parsed.text ? (
            <>
              <Languages size={10} className="text-blue-500" />
              <span title="中文翻译">中文: {chineseTranslation}</span>
            </>
          ) : (
            <>
              <Languages size={10} className="text-gray-400" />
              <span className="text-gray-400">点击翻译</span>
            </>
          )}
        </div>
      </div>

      {/* 悬停编辑栏 */}
      {isHovered && (
        <div 
          className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-3 min-w-max"
          style={{ zIndex: 9999 }}
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
                onClick={() => onFavorite(chineseTranslation)}
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
                  setChineseTranslation(''); // 清空旧翻译
                  try {
                    const result = await onTranslate(tag);
                    const translatedText = typeof result === 'object' && result.translatedText ? result.translatedText : result;
                    setChineseTranslation(translatedText || getBuiltinChineseTranslation(parsed.text));
                  } catch (error) {
                    console.error('手动翻译失败:', error);
                    setChineseTranslation(getBuiltinChineseTranslation(parsed.text));
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
const TagCard = ({ tag, onAdd, onToggleFavorite, isFavorited, onEdit, onDelete, isEditable, showManagement }) => (
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
    {showManagement && (
      <div className="flex items-center gap-2 mt-2">
        {isEditable && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
          >
            <Edit size={14} />
            编辑
          </button>
        )}
        {isEditable && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <Trash2 size={14} />
            删除
          </button>
        )}
      </div>
    )}
  </div>
);

export default PromptLibraryPage;