import React, { useState } from 'react';
import { Wand2, Sparkles, Copy, CheckCircle, AlertCircle, RefreshCw, Heart, TrendingUp } from 'lucide-react';
import { usePromptGenerator } from '../hooks/usePromptGenerator';
import { QUICK_TAGS, PAINTING_STYLES } from '../constants/data';
import { APP_CONFIG } from '../constants/config';

const PromptGeneratorPage = () => {
  const {
    inputText,
    generatedPrompt,
    selectedStyle,
    isGenerating,
    generationSource,
    generationCount,
    apiError,
    validationErrors,
    setInputText,
    setSelectedStyle,
    generatePrompt,
    copyPrompt,
    insertTag
  } = usePromptGenerator();

  const [showQuickTags, setShowQuickTags] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  const handleCopy = async (text) => {
    const success = await copyPrompt(text);
    setCopyStatus(success ? 'copied' : 'error');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  const handleGenerate = async (useApi = false) => {
    const success = await generatePrompt(useApi);
    if (!success && validationErrors.length > 0) {
      // 验证失败的处理
      console.log('Validation failed:', validationErrors);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <Wand2 className="mr-3 text-purple-600" size={32} />
          智能提示词生成器
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          描述你想要的画面，AI会为你生成专业的提示词，让创作更精准、更高效
        </p>
      </div>

      {/* 主输入区域 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Sparkles className="mr-2 text-purple-600" size={20} />
          创作描述
          {generationSource === 'api' && (
            <span className="ml-auto text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full">
              AI增强
            </span>
          )}
        </h2>

        <div className="space-y-4">
          {/* 文本输入 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                描述你想要的画面
              </label>
              <span className={`text-xs ${
                inputText.length > APP_CONFIG.MAX_INPUT_LENGTH * 0.8 
                  ? 'text-red-500' 
                  : 'text-gray-500'
              }`}>
                {inputText.length}/{APP_CONFIG.MAX_INPUT_LENGTH} 字符
              </span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="例如：一个可爱的猫女孩，穿着白色连衣裙，在樱花树下微笑..."
              maxLength={APP_CONFIG.MAX_INPUT_LENGTH}
              className={`w-full h-28 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all bg-gradient-to-br from-white to-purple-50/30 ${
                validationErrors.length > 0 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
            />
            
            {/* 验证错误提示 */}
            {validationErrors.length > 0 && (
              <div className="mt-2 text-sm text-red-600">
                {validationErrors.map((error, index) => (
                  <div key={index} className="flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {error}
                  </div>
                ))}
              </div>
            )}

            {/* 智能预览 */}
            {inputText.length > 0 && validationErrors.length === 0 && (
              <div className="mt-2 text-xs text-gray-600">
                <span className="font-medium">智能识别：</span>
                {inputText.match(/女孩|男孩|人物|角色|美女|帅哥|少女|boy|girl|character|人|风景|森林|海边|城市|建筑|landscape|forest|ocean|city|building|场景|动漫|anime|写实|realistic/gi)?.map((word, idx) => (
                  <span key={idx} className="inline-block mx-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                    {word}
                  </span>
                )) || <span className="text-gray-400">输入描述以获得智能建议</span>}
                {inputText.length > 10 && (
                  <span className="ml-2 text-green-600">✨ 准备就绪</span>
                )}
              </div>
            )}
          </div>

          {/* 风格选择 */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">选择风格 (可选)：</span>
            <div className="flex flex-wrap gap-2">
              {PAINTING_STYLES.map(style => (
                <button 
                  key={style.name} 
                  onClick={() => setSelectedStyle(selectedStyle === style.name ? '' : style.name)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    selectedStyle === style.name 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'bg-gray-100 hover:bg-purple-100 text-gray-700 border border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* 快速标签 */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">快速插入标签</span>
              <button
                onClick={() => setShowQuickTags(!showQuickTags)}
                className="text-xs text-purple-600 hover:text-purple-800 transition-colors"
              >
                {showQuickTags ? '收起' : '展开更多'}
              </button>
            </div>
            {showQuickTags && (
              <div className="space-y-3">
                {QUICK_TAGS.map((category, idx) => (
                  <div key={idx} className="space-y-2">
                    <span className="text-xs font-medium text-gray-600">{category.category}</span>
                    <div className="flex flex-wrap gap-2">
                      {category.tags.map((tag, tagIdx) => (
                        <button
                          key={tagIdx}
                          onClick={() => insertTag(tag)}
                          className="px-3 py-1.5 text-xs bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-purple-100 text-gray-700 rounded-lg border border-gray-200 hover:border-purple-300 transition-all group"
                          title={`${tag.en} - ${tag.cn}`}
                        >
                          <span className="font-medium text-gray-800">{tag.en}</span>
                          <span className="text-gray-500 ml-1 text-xs group-hover:text-purple-600">
                            ({tag.cn})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 生成按钮组 */}
          <div className="flex gap-3">
            <button
              onClick={() => handleGenerate(false)}
              disabled={!inputText.trim() || isGenerating}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  生成中...
                </>
              ) : (
                <>
                  <Wand2 className="inline mr-2" size={16} />
                  快速生成
                </>
              )}
            </button>
            
            {APP_CONFIG.FEATURES.AI_GENERATION && (
              <button
                onClick={() => handleGenerate(true)}
                disabled={!inputText.trim() || isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="使用AI增强生成"
              >
                <Sparkles className="inline" size={16} />
              </button>
            )}
          </div>

          {/* API错误提示 */}
          {apiError && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="mr-2 text-orange-600 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-sm text-orange-800">{apiError}</p>
              </div>
            </div>
          )}
        </div>

        {/* 生成结果 */}
        {generatedPrompt && (
          <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <CheckCircle className="mr-2 text-green-600" size={16} />
                生成的提示词
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  generationSource === 'api' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {generationSource === 'api' ? 'AI智能生成' : '本地增强'}
                </span>
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleCopy(generatedPrompt)}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors group"
                  title="复制到剪贴板"
                >
                  {copyStatus === 'copied' ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : copyStatus === 'error' ? (
                    <AlertCircle size={16} className="text-red-600" />
                  ) : (
                    <Copy size={16} className="text-gray-600 group-hover:text-green-600" />
                  )}
                </button>
                <button 
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors group disabled:opacity-50"
                  title="重新生成"
                >
                  <RefreshCw size={16} className="text-gray-600 group-hover:text-purple-600" />
                </button>
                <button 
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors group"
                  title="收藏"
                >
                  <Heart size={16} className="text-gray-600 group-hover:text-red-500" />
                </button>
              </div>
            </div>
            <div className="bg-white p-3 rounded border border-green-200/30">
              <p className="text-sm text-gray-700 leading-relaxed font-mono">{generatedPrompt}</p>
            </div>
            <div className="mt-3 flex justify-between items-center text-xs text-gray-600">
              <div className="flex gap-4">
                <span>字符数：{generatedPrompt.length}</span>
                <span>标签数：{generatedPrompt.split(',').length}</span>
                <span className={`font-medium ${
                  generationSource === 'api' ? 'text-purple-600' : 'text-green-600'
                }`}>
                  {generationSource === 'api' ? '🤖 AI增强' : '⚡ 本地增强'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span>{generationSource === 'api' ? 'DeepSeek-R1模型' : '本地算法'}</span>
                {generationCount > 0 && (
                  <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                    第{generationCount}次
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 使用提示 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50">
        <h3 className="font-medium text-blue-900 mb-3 flex items-center">
          <TrendingUp className="mr-2 text-blue-600" size={20} />
          使用技巧
          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Pro Tips</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="text-blue-500 mr-2 mt-0.5">▸</span>
              <span>详细描述人物、场景、风格，获得更精确的提示词</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-500 mr-2 mt-0.5">▸</span>
              <span>选择合适的风格会自动添加相关的专业标签</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="text-purple-500 mr-2 mt-0.5">★</span>
              <span>可以多次生成，选择最满意的结果</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-500 mr-2 mt-0.5">★</span>
              <span>AI增强模式提供更专业的提示词优化</span>
            </div>
          </div>
        </div>
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

export default PromptGeneratorPage; 