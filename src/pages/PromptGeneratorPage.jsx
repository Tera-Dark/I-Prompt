import React, { useState } from 'react';
import { Brain, Copy, CheckCircle, Loader2, Sparkles, AlertCircle, Heart, Clock, History, Cpu } from 'lucide-react';
import { usePromptGenerator } from '../hooks/usePromptGenerator';
import { QUICK_TAGS, PAINTING_STYLES } from '../constants/data';
import { APP_CONFIG } from '../constants/config';
import { useNotify } from '../components/common/NotificationSystem';
import GenerationStatusModal from '../components/GenerationStatusModal';

const PromptGeneratorPage = () => {
  const {
    inputText,
    generatedPrompt,
    selectedStyle,
    selectedModel,
    isGenerating,
    generationCount,
    apiError,
    validationErrors,
    savedResults,
    currentApiInfo,
    setInputText,
    setSelectedStyle,
    setSelectedModel,
    generatePrompt,
    copyPrompt,
    insertTag,
    getApiStatus,
    getAvailableModels
  } = usePromptGenerator();

  const [showQuickTags, setShowQuickTags] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('idle');
  const { notifySuccess, notifyError } = useNotify();

  const handleCopy = async (text) => {
    const success = await copyPrompt(text);
    if (success) {
      notifySuccess('copy', '提示词');
    } else {
      notifyError('copy', '复制失败');
    }
  };

  const handleGenerate = async () => {
    setGenerationStatus('connecting');
    setShowStatusModal(true);
    
    setTimeout(() => {
      setGenerationStatus('generating');
    }, 1000);

    const success = await generatePrompt();
    
    if (success) {
      setGenerationStatus('success');
      notifySuccess('create', '提示词生成');
      setTimeout(() => {
        setShowStatusModal(false);
        setGenerationStatus('idle');
      }, 2000);
    } else if (validationErrors.length > 0) {
      setGenerationStatus('error');
      notifyError('validation', '输入验证失败');
      setTimeout(() => {
        setShowStatusModal(false);
        setGenerationStatus('idle');
      }, 3000);
    } else {
      setGenerationStatus('error');
      notifyError('create', '生成失败，请稍后重试');
      setTimeout(() => {
        setShowStatusModal(false);
        setGenerationStatus('idle');
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <Brain className="mr-3 text-purple-600" size={32} />
          智能提示词生成器
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          描述你想要的画面，AI会为你生成专业的提示词，让创作更精准、更高效
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full">
            ✨ 由 DeepSeek-R1 驱动
          </span>
          {currentApiInfo && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              当前API: {currentApiInfo.name}
            </span>
          )}
        </div>
      </div>

      {/* 主输入区域 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Sparkles className="mr-2 text-purple-600" size={20} />
          创作描述
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

          {/* 模型选择 */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <Cpu className="mr-2 text-blue-600" size={16} />
                选择AI模型：
              </span>
              <span className="text-xs text-gray-500">
                {currentApiInfo ? `当前: ${currentApiInfo.provider}` : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getAvailableModels().map(model => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`p-3 text-left rounded-lg border transition-all text-sm ${
                    selectedModel === model.id
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{model.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      model.available 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {model.available ? '可用' : '不可用'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">{model.description}</div>
                  <div className="text-xs text-gray-500 mt-1">{model.provider}</div>
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

          {/* 生成按钮 */}
          <div className="flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={!inputText.trim() || isGenerating}
              className="w-full max-w-md bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                  DeepSeek AI 生成中...
                </>
              ) : (
                <>
                  <Brain className="inline mr-3" size={20} />
                  DeepSeek AI 智能生成
                </>
              )}
            </button>
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
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleCopy(generatedPrompt)}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors group"
                  title="复制到剪贴板"
                >
                  <Copy size={16} className="text-gray-600 group-hover:text-green-600" />
                </button>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors group disabled:opacity-50"
                  title="重新生成"
                >
                  <Loader2 size={16} className="text-gray-600 group-hover:text-purple-600" />
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
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span>{currentApiInfo?.name || 'DeepSeek-R1'}模型</span>
                {generationCount > 0 && (
                  <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                    第{generationCount}次
                  </span>
                )}
                {currentApiInfo && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    {currentApiInfo.provider}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 使用提示 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50">
        <h3 className="font-medium text-blue-900 mb-3 flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="mr-2 text-blue-600" size={20} />
            DeepSeek AI 使用技巧
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">多模型支持</span>
          </div>
          <button
            onClick={() => {
              const status = getApiStatus();
              alert(`API状态报告:\n当前API: ${status.currentApi}\n可用API: ${status.availableApis}/${status.totalApis}\n\n详细状态:\n${status.apis.map(api => `${api.name}: ${api.available ? '✅可用' : '❌不可用'}`).join('\n')}`);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            查看API状态
          </button>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="text-blue-500 mr-2 mt-0.5">▸</span>
              <span>详细描述人物、场景、风格，AI会生成更精确的提示词</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-500 mr-2 mt-0.5">▸</span>
              <span>选择合适的风格会让AI自动添加相关的专业标签</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-500 mr-2 mt-0.5">▸</span>
              <span>可以描述情绪、光影、构图等细节，AI理解能力很强</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2 mt-0.5">🤖</span>
              <span>不同模型有不同特色：R1推理强，V3性能佳，NVIDIA稳定</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="text-purple-500 mr-2 mt-0.5">★</span>
              <span>DeepSeek AI 擅长生成高质量的艺术描述词汇</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-500 mr-2 mt-0.5">★</span>
              <span>支持中文输入，AI会自动转换为专业英文提示词</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-500 mr-2 mt-0.5">★</span>
              <span>可以多次生成不同版本，选择最满意的结果</span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-500 mr-2 mt-0.5">⚡</span>
              <span>系统会自动切换可用模型，确保服务稳定性</span>
            </div>
          </div>
        </div>
      </div>

      {/* 历史记录 */}
      {savedResults.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <History className="mr-2 text-gray-600" size={20} />
              最近生成
            </h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {showHistory ? '收起' : `查看全部 (${savedResults.length})`}
            </button>
          </div>

          <div className="space-y-3">
            {(showHistory ? savedResults : savedResults.slice(0, 3)).map((result) => (
              <div
                key={result.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => {
                  setInputText(result.inputText);
                  setSelectedStyle(result.selectedStyle || '');
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">输入：</span>
                      {result.inputText}
                    </p>
                    {result.selectedStyle && (
                      <p className="text-xs text-purple-600 mb-2">
                        风格：{result.selectedStyle}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock size={12} className="mr-1" />
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(result.generatedPrompt);
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="复制"
                    >
                      <Copy size={14} className="text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-xs text-gray-700 font-mono leading-relaxed line-clamp-2">
                    {result.generatedPrompt}
                  </p>
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>字符数：{result.metadata?.characterCount || 0}</span>
                  <span>标签数：{result.metadata?.tagCount || 0}</span>
                </div>
              </div>
            ))}
          </div>

          {!showHistory && savedResults.length > 3 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowHistory(true)}
                className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
              >
                查看更多历史记录 ({savedResults.length - 3} 条)
              </button>
            </div>
          )}
        </div>
      )}

      {/* 状态模态框 */}
      <GenerationStatusModal
        isVisible={showStatusModal}
        isGenerating={isGenerating}
        status={generationStatus}
        onClose={(action) => {
          if (action === 'showDetails') {
            // 从后台模式重新显示详情
            setShowStatusModal(true);
          } else {
            // 正常关闭
            setShowStatusModal(false);
          }
        }}
        statusMessage={
          generationStatus === 'connecting' ? '正在连接到DeepSeek AI...' :
          generationStatus === 'generating' ? 'DeepSeek AI正在分析和生成提示词...' :
          generationStatus === 'success' ? '提示词生成完成！' :
          generationStatus === 'error' ? (apiError || '生成失败') : ''
        }
        estimatedTime={25}
      />
    </div>
  );
};

export default PromptGeneratorPage; 