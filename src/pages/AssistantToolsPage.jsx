import React, { useState } from 'react';
import { Settings, Scale, Lightbulb, Languages, Tag, ArrowLeftRight, Plus, Copy, CheckCircle } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

const AssistantToolsPage = () => {
  const [activeToolId, setActiveToolId] = useState('weight');
  const [copyStatus, setCopyStatus] = useState('');

  const handleCopy = async (text) => {
    const success = await copyToClipboard(text);
    setCopyStatus(success ? 'copied' : 'error');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  const tools = [
    { id: 'weight', name: '权重调节', icon: Scale, component: WeightAdjustTool },
    { id: 'inspiration', name: '灵感生成', icon: Lightbulb, component: InspirationTool },
    { id: 'translate', name: '翻译工具', icon: Languages, component: TranslateTool },
    { id: 'tags', name: '标签补全', icon: Tag, component: TagCompletionTool }
  ];

  const ActiveTool = tools.find(tool => tool.id === activeToolId)?.component || WeightAdjustTool;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <Settings className="mr-3 text-orange-600" size={32} />
          辅助工具
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          专业的AI绘画辅助工具集，提供权重调节、灵感生成、翻译和标签补全等实用功能
        </p>
      </div>

      {/* 工具导航 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-orange-100/50 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tools.map(tool => {
            const IconComponent = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveToolId(tool.id)}
                className={`p-4 rounded-lg border transition-all ${
                  activeToolId === tool.id
                    ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                    : 'bg-white hover:bg-orange-50 text-gray-700 border-gray-200 hover:border-orange-300'
                }`}
              >
                <IconComponent className="mx-auto mb-2" size={24} />
                <p className="text-sm font-medium">{tool.name}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 活动工具内容 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
        <ActiveTool onCopy={handleCopy} copyStatus={copyStatus} />
      </div>

      {/* 复制状态提示 */}
      {copyStatus && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white text-sm transition-all duration-300 shadow-lg ${
          copyStatus === 'copied' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {copyStatus === 'copied' ? '✅ 已复制到剪贴板' : '❌ 复制失败'}
        </div>
      )}
    </div>
  );
};

/**
 * 权重调节工具
 */
const WeightAdjustTool = ({ onCopy, copyStatus }) => {
  const [inputText, setInputText] = useState('');
  const [adjustedText, setAdjustedText] = useState('');

  const adjustWeight = (text, weight) => {
    if (!text.trim()) return '';
    
    // 根据权重格式化
    if (weight > 1) {
      return `(${text}:${weight})`;
    } else if (weight < 1) {
      return `[${text}:${weight}]`;
    } else {
      return text;
    }
  };

  const handleQuickAdjust = (weight) => {
    if (!inputText.trim()) return;
    
    const tags = inputText.split(',').map(tag => tag.trim()).filter(tag => tag);
    const adjustedTags = tags.map(tag => adjustWeight(tag, weight));
    setAdjustedText(adjustedTags.join(', '));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Scale className="text-orange-600" size={24} />
        <h2 className="text-xl font-bold text-gray-900">权重调节工具</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输入提示词</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="输入需要调节权重的提示词，用逗号分隔..."
            className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">快速权重调节</label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[0.5, 0.7, 0.9, 1.1, 1.3, 1.5].map(weight => (
              <button
                key={weight}
                onClick={() => handleQuickAdjust(weight)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  weight === 1 
                    ? 'bg-gray-100 text-gray-700 border-gray-300'
                    : weight > 1 
                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
              >
                {weight > 1 ? '↑' : weight < 1 ? '↓' : '='} {weight}
              </button>
            ))}
          </div>
        </div>

        {adjustedText && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-900">调节结果</h3>
              <button
                onClick={() => onCopy(adjustedText)}
                className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
              >
                {copyStatus === 'copied' ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-sm font-mono text-gray-700">{adjustedText}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">权重语法说明</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <code>(keyword:1.5)</code> - 增强权重到1.5倍</li>
            <li>• <code>[keyword:0.7]</code> - 降低权重到0.7倍</li>
            <li>• <code>((keyword))</code> - 双重括号增强</li>
            <li>• <code>[[keyword]]</code> - 双重方括号减弱</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * 灵感生成工具
 */
const InspirationTool = ({ onCopy, copyStatus }) => {
  const [selectedTheme, setSelectedTheme] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const themes = [
    { id: 'fantasy', name: '奇幻魔法', keywords: ['魔法', '精灵', '龙', '城堡', '魔法师'] },
    { id: 'scifi', name: '科幻未来', keywords: ['机器人', '太空', '霓虹灯', '赛博朋克', '外星人'] },
    { id: 'nature', name: '自然风光', keywords: ['森林', '山脉', '海洋', '花朵', '动物'] },
    { id: 'anime', name: '动漫风格', keywords: ['少女', '校园', '和服', '樱花', '猫咪'] },
    { id: 'historical', name: '历史古典', keywords: ['宫殿', '武士', '古装', '传统', '文化'] }
  ];

  const generateIdeas = async (theme) => {
    setIsGenerating(true);
    setGeneratedIdeas([]);

    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 1500));

    const themeData = themes.find(t => t.id === theme);
    if (!themeData) return;

    const ideas = [
      `${themeData.keywords[0]}主题的概念艺术`,
      `${themeData.keywords[1]}与${themeData.keywords[2]}的结合`,
      `${themeData.keywords[3]}背景下的${themeData.keywords[4]}`,
      `梦幻般的${themeData.keywords[0]}场景`,
      `${themeData.keywords[2]}风格的角色设计`
    ];

    setGeneratedIdeas(ideas);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="text-yellow-600" size={24} />
        <h2 className="text-xl font-bold text-gray-900">灵感生成器</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">选择主题</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => {
                  setSelectedTheme(theme.id);
                  generateIdeas(theme.id);
                }}
                className={`p-4 text-left rounded-lg border transition-all ${
                  selectedTheme === theme.id
                    ? 'bg-yellow-600 text-white border-yellow-600'
                    : 'bg-white hover:bg-yellow-50 text-gray-700 border-gray-200 hover:border-yellow-300'
                }`}
              >
                <h3 className="font-medium">{theme.name}</h3>
                <p className="text-sm opacity-75 mt-1">
                  {theme.keywords.join(' • ')}
                </p>
              </button>
            ))}
          </div>
        </div>

        {isGenerating && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-3"></div>
            <p className="text-gray-600">正在生成创意灵感...</p>
          </div>
        )}

        {generatedIdeas.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">生成的创意灵感</h3>
            {generatedIdeas.map((idea, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-700">{idea}</p>
                  <button
                    onClick={() => onCopy(idea)}
                    className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 翻译工具
 */
const TranslateTool = ({ onCopy, copyStatus }) => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [direction, setDirection] = useState('cn-en'); // cn-en 或 en-cn

  const translations = {
    '美丽': 'beautiful',
    '可爱': 'cute',
    '女孩': 'girl',
    '男孩': 'boy',
    '猫': 'cat',
    '狗': 'dog',
    '花': 'flower',
    '树': 'tree',
    '天空': 'sky',
    '海洋': 'ocean',
    '森林': 'forest',
    '城市': 'city',
    '夜晚': 'night',
    '白天': 'day',
    '阳光': 'sunlight',
    '月亮': 'moon',
    '星星': 'stars',
    '房子': 'house',
    '汽车': 'car'
  };

  const translate = () => {
    if (!inputText.trim()) return;

    if (direction === 'cn-en') {
      let result = inputText;
      Object.entries(translations).forEach(([cn, en]) => {
        const regex = new RegExp(cn, 'g');
        result = result.replace(regex, en);
      });
      setTranslatedText(result);
    } else {
      let result = inputText;
      Object.entries(translations).forEach(([cn, en]) => {
        const regex = new RegExp(en, 'gi');
        result = result.replace(regex, cn);
      });
      setTranslatedText(result);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Languages className="text-blue-600" size={24} />
        <h2 className="text-xl font-bold text-gray-900">翻译工具</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDirection('cn-en')}
            className={`px-4 py-2 rounded-lg transition-all ${
              direction === 'cn-en'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            中文 → 英文
          </button>
          <ArrowLeftRight className="text-gray-400" size={20} />
          <button
            onClick={() => setDirection('en-cn')}
            className={`px-4 py-2 rounded-lg transition-all ${
              direction === 'en-cn'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            英文 → 中文
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {direction === 'cn-en' ? '中文输入' : '英文输入'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={direction === 'cn-en' ? '输入中文提示词...' : '输入英文提示词...'}
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {direction === 'cn-en' ? '英文输出' : '中文输出'}
            </label>
            <div className="relative">
              <textarea
                value={translatedText}
                readOnly
                placeholder="翻译结果将显示在这里..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 resize-none"
              />
              {translatedText && (
                <button
                  onClick={() => onCopy(translatedText)}
                  className="absolute top-2 right-2 p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {copyStatus === 'copied' ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={translate}
          disabled={!inputText.trim()}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          翻译
        </button>
      </div>
    </div>
  );
};

/**
 * 标签补全工具
 */
const TagCompletionTool = ({ onCopy, copyStatus }) => {
  const [inputTags, setInputTags] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const commonTags = {
    quality: ['masterpiece', 'best quality', 'ultra detailed', 'high resolution', 'professional'],
    lighting: ['cinematic lighting', 'soft lighting', 'dramatic lighting', 'natural lighting'],
    composition: ['perfect composition', 'rule of thirds', 'dynamic angle', 'close-up'],
    style: ['anime style', 'realistic', 'oil painting', 'watercolor', 'digital art']
  };

  const generateSuggestions = () => {
    if (!inputTags.trim()) return;

    const currentTags = inputTags.toLowerCase().split(',').map(tag => tag.trim());
    const newSuggestions = [];

    // 检查缺失的常用标签
    Object.entries(commonTags).forEach(([category, tags]) => {
      const missingTags = tags.filter(tag => 
        !currentTags.some(currentTag => currentTag.includes(tag.toLowerCase()))
      );
      if (missingTags.length > 0) {
        newSuggestions.push({
          category,
          tags: missingTags.slice(0, 3)
        });
      }
    });

    setSuggestions(newSuggestions);
  };

  const addTag = (tag) => {
    const newTags = inputTags ? `${inputTags}, ${tag}` : tag;
    setInputTags(newTags);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Tag className="text-green-600" size={24} />
        <h2 className="text-xl font-bold text-gray-900">标签补全工具</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">当前标签</label>
          <textarea
            value={inputTags}
            onChange={(e) => setInputTags(e.target.value)}
            placeholder="输入已有的标签，用逗号分隔..."
            className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>

        <button
          onClick={generateSuggestions}
          disabled={!inputTags.trim()}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          生成标签建议
        </button>

        {suggestions.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">建议添加的标签</h3>
            {suggestions.map((suggestion, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2 capitalize">{suggestion.category}</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestion.tags.map((tag, tagIndex) => (
                    <button
                      key={tagIndex}
                      onClick={() => addTag(tag)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors text-sm"
                    >
                      <Plus size={12} className="inline mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {inputTags && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-900">完整标签列表</h3>
              <button
                onClick={() => onCopy(inputTags)}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {copyStatus === 'copied' ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-sm font-mono text-gray-700">{inputTags}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantToolsPage; 