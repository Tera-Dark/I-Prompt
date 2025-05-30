import React, { useState, useEffect } from 'react';
import { Lightbulb, Copy, CheckCircle, RefreshCw, Sparkles, Shuffle, Download, Eye, Heart, Star, Palette, Camera, Wand2 } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import { getTagDatabase } from '../services/tagDatabaseService';

const AssistantToolsPage = () => {
  const [copyStatus, setCopyStatus] = useState('');
  const [tagDatabase, setTagDatabase] = useState(null);

  useEffect(() => {
    // 加载标签库数据
    const database = getTagDatabase();
    setTagDatabase(database);
  }, []);

  const handleCopy = async (text) => {
    const success = await copyToClipboard(text);
    setCopyStatus(success ? 'copied' : 'error');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* 页面标题 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <Lightbulb className="text-orange-600 mr-2" size={28} />
                灵感生成器
        </h1>
              <p className="text-gray-600 text-sm">
                基于标签库的智能创意灵感生成，为您的AI绘画提供无限创意灵感
        </p>
      </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs text-gray-500">智能模式</div>
                <div className="text-sm font-semibold text-orange-600">AI驱动</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <Lightbulb className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <InspirationTool onCopy={handleCopy} copyStatus={copyStatus} tagDatabase={tagDatabase} />
      </div>

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

/**
 * 智能灵感生成工具
 */
const InspirationTool = ({ onCopy, copyStatus, tagDatabase }) => {
  const [selectedStyle, setSelectedStyle] = useState('random');
  const [selectedComplexity, setSelectedComplexity] = useState('medium');
  const [generatedPrompts, setGeneratedPrompts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [favoritePrompts, setFavoritePrompts] = useState([]);
    
  // 加载收藏的提示词
  useEffect(() => {
    const saved = localStorage.getItem('favoritePrompts');
    if (saved) {
      try {
        setFavoritePrompts(JSON.parse(saved));
      } catch (error) {
        console.error('加载收藏提示词失败:', error);
    }
    }
  }, []);

  // 保存收藏的提示词
  useEffect(() => {
    localStorage.setItem('favoritePrompts', JSON.stringify(favoritePrompts));
  }, [favoritePrompts]);

  // 灵感生成模式
  const inspirationModes = [
    { 
      id: 'random', 
      name: '随机灵感', 
      icon: Shuffle, 
      description: '随机组合不同类型的标签',
      color: 'bg-purple-500'
    },
    { 
      id: 'character', 
      name: '人物创作', 
      icon: Eye, 
      description: '专注于人物角色设计',
      color: 'bg-blue-500'
    },
    { 
      id: 'scene', 
      name: '场景构建', 
      icon: Camera, 
      description: '创建环境和背景场景',
      color: 'bg-green-500'
    },
    { 
      id: 'style', 
      name: '风格探索', 
      icon: Palette, 
      description: '尝试不同的艺术风格',
      color: 'bg-pink-500'
    },
    { 
      id: 'fantasy', 
      name: '奇幻世界', 
      icon: Wand2, 
      description: '魔法与奇幻元素',
      color: 'bg-indigo-500'
    }
  ];

  // 复杂度设置
  const complexityLevels = [
    { id: 'simple', name: '简约', tagCount: '3-5个标签', description: '简洁明了的基础提示词' },
    { id: 'medium', name: '均衡', tagCount: '6-10个标签', description: '平衡的细节和复杂度' },
    { id: 'complex', name: '丰富', tagCount: '11-15个标签', description: '详细且复杂的描述' },
    { id: 'detailed', name: '极致', tagCount: '16+个标签', description: '极其详细的专业级提示词' }
  ];

  // 从标签库获取随机标签
  const getRandomTagsFromCategory = (categoryKey, count = 1) => {
    if (!tagDatabase || !tagDatabase[categoryKey]) return [];
    
    const category = tagDatabase[categoryKey];
    const allTags = [];
    
    // 收集该分类下的所有标签
    if (category.subcategories) {
      Object.values(category.subcategories).forEach(subcategory => {
        if (subcategory.tags) {
          allTags.push(...subcategory.tags);
        }
      });
    }
    
    // 随机选择标签
    const shuffled = allTags.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(tag => tag.en || tag);
  };

  // 获取高频标签
  const getPopularTags = (categoryKey, count = 2) => {
    if (!tagDatabase || !tagDatabase[categoryKey]) return [];
    
    const category = tagDatabase[categoryKey];
    const allTags = [];
    
    if (category.subcategories) {
      Object.values(category.subcategories).forEach(subcategory => {
        if (subcategory.tags) {
          allTags.push(...subcategory.tags);
        }
      });
    }
    
    // 按频率排序并选择前几个
    const sortedByFrequency = allTags
      .filter(tag => tag.frequency)
      .sort((a, b) => b.frequency - a.frequency);
    
    return sortedByFrequency.slice(0, count).map(tag => tag.en || tag);
  };

  // 生成基于模式的提示词
  const generatePromptByMode = (mode, complexity) => {
    if (!tagDatabase) return '';

    const complexityMap = {
      'simple': { total: 4, quality: 1, main: 2, detail: 1 },
      'medium': { total: 8, quality: 2, main: 4, detail: 2 },
      'complex': { total: 13, quality: 3, main: 6, detail: 4 },
      'detailed': { total: 18, quality: 4, main: 8, detail: 6 }
    };

    const config = complexityMap[complexity];
    let tags = [];

    // 必须的质量标签
    const qualityTags = getPopularTags('quality', config.quality);
    tags.push(...qualityTags);

    switch (mode) {
      case 'character':
        // 人物模式：性别+外观+表情+服装
        tags.push(...getRandomTagsFromCategory('character', 2));
        tags.push(...getRandomTagsFromCategory('appearance', Math.ceil(config.main / 2)));
        tags.push(...getRandomTagsFromCategory('clothing', Math.floor(config.main / 2)));
        if (config.detail > 0) {
          tags.push(...getRandomTagsFromCategory('environment', Math.min(2, config.detail)));
        }
        break;

      case 'scene':
        // 场景模式：环境+天气+风格
        tags.push(...getRandomTagsFromCategory('environment', config.main));
        tags.push(...getRandomTagsFromCategory('style', Math.ceil(config.detail / 2)));
        if (config.detail > 2) {
          tags.push(...getRandomTagsFromCategory('character', 1));
        }
        break;

      case 'style':
        // 风格模式：艺术风格+质量+色彩
        tags.push(...getRandomTagsFromCategory('style', config.main));
        if (config.detail > 0) {
          tags.push(...getRandomTagsFromCategory('appearance', config.detail));
        }
        break;

      case 'fantasy':
        // 奇幻模式：特殊角色+魔法元素+奇幻场景
        tags.push(...getRandomTagsFromCategory('character', 1));
        const specialTags = getRandomTagsFromCategory('character', 2).filter(tag => 
          tag.includes('dragon') || tag.includes('elf') || tag.includes('angel') || 
          tag.includes('demon') || tag.includes('fairy') || tag.includes('witch')
        );
        tags.push(...specialTags);
        tags.push(...getRandomTagsFromCategory('environment', Math.ceil(config.main / 2)));
        tags.push(...getRandomTagsFromCategory('style', config.detail));
        break;

      default: // random
        // 随机模式：从各个分类随机选择
        const categories = Object.keys(tagDatabase);
        const selectedCategories = categories.sort(() => 0.5 - Math.random()).slice(0, 4);
        
        selectedCategories.forEach(category => {
          if (category !== 'quality') {
            const count = Math.ceil(config.main / selectedCategories.length);
            tags.push(...getRandomTagsFromCategory(category, count));
          }
        });
        break;
    }

    // 去重并限制数量
    const uniqueTags = [...new Set(tags)].filter(tag => tag);
    const finalTags = uniqueTags.slice(0, config.total);

    return finalTags.join(', ');
  };

  // 生成多个灵感提示词
  const generateInspiration = () => {
    if (!tagDatabase) {
      console.warn('标签库未加载');
      return;
    }

    setIsGenerating(true);
    setGeneratedPrompts([]);

    // 模拟生成过程
    setTimeout(() => {
      const prompts = [];
      
      // 生成4个不同的提示词
      for (let i = 0; i < 4; i++) {
        const prompt = generatePromptByMode(selectedStyle, selectedComplexity);
        if (prompt) {
          prompts.push({
            id: Date.now() + i,
            text: prompt,
            mode: selectedStyle,
            complexity: selectedComplexity,
            timestamp: new Date().toLocaleTimeString()
          });
        }
      }

      setGeneratedPrompts(prompts);
    setIsGenerating(false);
    }, 1500);
  };

  // 收藏提示词
  const toggleFavorite = (prompt) => {
    setFavoritePrompts(prev => {
      const exists = prev.find(fav => fav.id === prompt.id);
      if (exists) {
        return prev.filter(fav => fav.id !== prompt.id);
      } else {
        return [...prev, prompt];
      }
    });
  };

  // 导出收藏的提示词
  const exportFavorites = () => {
    if (favoritePrompts.length === 0) {
      alert('暂无收藏的提示词');
      return;
    }

    const exportData = {
      title: 'I-Prompt 收藏的灵感提示词',
      exportTime: new Date().toISOString(),
      prompts: favoritePrompts
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inspiration-prompts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 灵感模式选择 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="text-orange-600 mr-2" size={20} />
              灵感模式
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {inspirationModes.map(mode => {
                const IconComponent = mode.icon;
                return (
          <button
                    key={mode.id}
                    onClick={() => setSelectedStyle(mode.id)}
                    className={`p-4 rounded-lg border transition-all text-left ${
                      selectedStyle === mode.id
                        ? `${mode.color} text-white border-transparent shadow-md`
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
                    <div className="flex items-center gap-3">
                      <IconComponent size={20} />
                      <div>
                        <h4 className="font-medium">{mode.name}</h4>
                        <p className={`text-sm ${selectedStyle === mode.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {mode.description}
                        </p>
                      </div>
                    </div>
          </button>
                );
              })}
        </div>
          </div>

          {/* 复杂度设置 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="text-orange-600 mr-2" size={20} />
              复杂度设置
            </h3>
            <div className="space-y-3">
              {complexityLevels.map(level => (
                <button
                  key={level.id}
                  onClick={() => setSelectedComplexity(level.id)}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    selectedComplexity === level.id
                      ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                      : 'bg-white hover:bg-orange-50 text-gray-700 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{level.name}</h4>
                      <p className={`text-sm ${selectedComplexity === level.id ? 'text-white/80' : 'text-gray-500'}`}>
                        {level.description}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedComplexity === level.id ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      {level.tagCount}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 生成按钮 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              模式: <span className="font-medium text-orange-600">
                {inspirationModes.find(m => m.id === selectedStyle)?.name}
              </span>
              {' | '}
              复杂度: <span className="font-medium text-orange-600">
                {complexityLevels.find(l => l.id === selectedComplexity)?.name}
              </span>
            </div>
            <div className="flex gap-3">
              {favoritePrompts.length > 0 && (
                <button
                  onClick={exportFavorites}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={16} />
                  导出收藏 ({favoritePrompts.length})
                </button>
              )}
        <button
                onClick={generateInspiration}
                disabled={isGenerating || !tagDatabase}
                className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
                {isGenerating ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Lightbulb size={16} />
                )}
                {isGenerating ? '生成中...' : '生成灵感'}
        </button>
      </div>
    </div>
        </div>
      </div>

      {/* 加载状态 */}
      {isGenerating && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">正在生成创意灵感...</h3>
            <p className="text-gray-600">基于标签库智能分析中，请稍候</p>
          </div>
        </div>
      )}

      {/* 生成结果 */}
      {generatedPrompts.length > 0 && (
      <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">生成的创意灵感</h3>
            <span className="text-sm text-gray-500">{generatedPrompts.length} 个提示词</span>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {generatedPrompts.map((prompt, index) => {
              const isFavorited = favoritePrompts.some(fav => fav.id === prompt.id);
              return (
                <div key={prompt.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-xs text-gray-500">
                        {inspirationModes.find(m => m.id === prompt.mode)?.name} · {prompt.timestamp}
                      </span>
                    </div>
        <button
                      onClick={() => toggleFavorite(prompt)}
                      className={`p-1 rounded transition-colors ${
                        isFavorited 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart size={16} className={isFavorited ? 'fill-current' : ''} />
        </button>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 font-mono leading-relaxed">
                      {prompt.text}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {prompt.text.split(', ').length} 个标签 · 
                      {complexityLevels.find(l => l.id === prompt.complexity)?.name}复杂度
                    </div>
                    <button
                      onClick={() => onCopy(prompt.text)}
                      className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                    >
                      {copyStatus === 'copied' ? <CheckCircle size={14} /> : <Copy size={14} />}
                      复制
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 收藏的提示词 */}
      {favoritePrompts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Heart className="text-red-500 mr-2" size={20} />
              收藏的灵感 ({favoritePrompts.length})
            </h3>
            <button
              onClick={() => setFavoritePrompts([])}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              清空收藏
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {favoritePrompts.map((prompt, index) => (
              <div key={prompt.id} className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-100">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-red-600 font-medium">
                    {inspirationModes.find(m => m.id === prompt.mode)?.name}
                  </span>
                  <button
                    onClick={() => toggleFavorite(prompt)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Heart size={14} className="fill-current" />
                  </button>
                </div>
                <p className="text-sm text-gray-700 font-mono mb-3 leading-relaxed">
                  {prompt.text}
                </p>
                <button
                  onClick={() => onCopy(prompt.text)}
                  className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-xs"
                >
                  <Copy size={12} />
                  复制
                </button>
              </div>
            ))}
          </div>
          </div>
        )}

      {/* 使用说明 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">使用说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">灵感模式</h4>
            <ul className="space-y-1">
              <li>• <strong>随机灵感</strong>：从各分类随机组合标签</li>
              <li>• <strong>人物创作</strong>：专注角色设计和外观</li>
              <li>• <strong>场景构建</strong>：创建环境和背景</li>
              <li>• <strong>风格探索</strong>：尝试不同艺术风格</li>
              <li>• <strong>奇幻世界</strong>：魔法与奇幻元素</li>
            </ul>
            </div>
          <div>
            <h4 className="font-medium mb-2">功能特点</h4>
            <ul className="space-y-1">
              <li>• 基于完整标签库数据生成</li>
              <li>• 智能分析标签频率和搭配</li>
              <li>• 支持收藏和导出功能</li>
              <li>• 可调节复杂度和标签数量</li>
              <li>• 一键复制到剪贴板</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantToolsPage; 