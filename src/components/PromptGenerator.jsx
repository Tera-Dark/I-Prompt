import React, { useState } from 'react';
import { Wand2, Sparkles, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { usePromptGenerator } from '../hooks/usePromptGenerator';
import { QUICK_TAGS, PAINTING_STYLES } from '../constants/data';
import { APP_CONFIG } from '../constants/config';

/**
 * 提示词生成器组件
 * 展示重构后的架构和组件分离
 */
const PromptGenerator = () => {
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

  const handleGenerate = async () => {
    await generatePrompt();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Wand2 className="mr-2 text-purple-600" size={20} />
          I Prompt 智能生成器
          <span className="ml-auto text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full">
            智能AI
          </span>
        </h2>
        
        <div className="space-y-4">
          {/* 输入区域 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                描述你想要的画面
              </label>
              <span className="text-xs text-gray-500">
                {inputText.length}/{APP_CONFIG.MAX_INPUT_LENGTH} 字符
              </span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="例如：一个可爱的猫女孩，穿着白色连衣裙，在樱花树下..."
              maxLength={APP_CONFIG.MAX_INPUT_LENGTH}
              className="w-full h-28 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all bg-gradient-to-br from-white to-purple-50/30"
            />
            
            {/* 验证错误显示 */}
            {validationErrors.length > 0 && (
              <div className="mt-2 text-sm text-red-600">
                {validationErrors.map((error, idx) => (
                  <div key={idx} className="flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {error}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 风格选择 */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">选择风格：</span>
            <div className="flex flex-wrap gap-2">
              {PAINTING_STYLES.map(style => (
                <button 
                  key={style.name} 
                  onClick={() => setSelectedStyle(selectedStyle === style.name ? '' : style.name)}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    selectedStyle === style.name 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 hover:bg-purple-100 text-gray-700'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* 快速标签 */}
          <QuickTagsSection 
            showQuickTags={showQuickTags}
            setShowQuickTags={setShowQuickTags}
            insertTag={insertTag}
          />
          
          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={!inputText.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                AI智能生成中...
              </>
            ) : (
              <>
                <Sparkles className="inline mr-2" size={16} />
                AI智能生成
              </>
            )}
          </button>
          
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
          <GeneratedResult
            prompt={generatedPrompt}
            source={generationSource}
            count={generationCount}
            onCopy={handleCopy}
            copyStatus={copyStatus}
          />
        )}
      </div>
    </div>
  );
};

/**
 * 快速标签区域组件
 */
const QuickTagsSection = ({ showQuickTags, setShowQuickTags, insertTag }) => (
  <div className="border-t pt-4">
    <div className="flex justify-between items-center mb-3">
      <span className="text-sm font-medium text-gray-700">快速插入标签</span>
      <button
        onClick={() => setShowQuickTags(!showQuickTags)}
        className="text-xs text-purple-600 hover:text-purple-800 transition-colors"
      >
        {showQuickTags ? '收起' : '展开'}
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
                  <span className="text-gray-500 ml-1 text-xs group-hover:text-purple-600">({tag.cn})</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

/**
 * 生成结果显示组件
 */
const GeneratedResult = ({ prompt, source, count, onCopy, copyStatus }) => (
  <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-lg animate-slide-up shadow-sm">
    <div className="flex justify-between items-start mb-3">
      <h3 className="font-medium text-gray-900 flex items-center">
        <Sparkles className="mr-2 text-green-600" size={16} />
        生成的提示词
        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
          source === 'ai' 
            ? 'bg-purple-100 text-purple-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {source === 'ai' ? 'AI智能生成' : '本地增强'}
        </span>
      </h3>
      <div className="flex gap-2">
        <button 
          onClick={() => onCopy(prompt)}
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
      </div>
    </div>
    <div className="bg-white p-3 rounded border border-green-200/30">
      <p className="text-sm text-gray-700 leading-relaxed">{prompt}</p>
    </div>
    <div className="mt-3 flex justify-between items-center text-xs text-gray-600">
      <div className="flex gap-4">
        <span>字符数：{prompt.length}</span>
        <span>标签数：{prompt.split(',').length}</span>
        <span className={`font-medium ${
          source === 'ai' ? 'text-purple-600' : 'text-green-600'
        }`}>
          {source === 'ai' ? '🤖 AI增强' : '⚡ 本地增强'}
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <span>{source === 'ai' ? 'DeepSeek-R1模型' : '本地算法'}</span>
        {count > 0 && (
          <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
            第{count}次生成
          </span>
        )}
      </div>
    </div>
  </div>
);

export default PromptGenerator; 