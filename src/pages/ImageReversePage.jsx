import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, Sparkles, Download, Copy, 
  RefreshCw, CheckCircle, XCircle, Eye, EyeOff, 
  Filter, BarChart3, Tag, Zap, Camera, Brain,
  AlertCircle, Info, Settings, Star, ChevronDown
} from 'lucide-react';
import { 
  analyzeImageTags, 
  validateImageFile, 
  tagsToPrompt, 
  getRecommendedTags,
  getAvailableModels 
} from '../services/imageTaggingService';
import { copyToClipboard } from '../utils/clipboard';
import { useNotify } from '../components/common/NotificationSystem';

const ImageReversePage = () => {
  const { notifySuccess, notifyError, showWarning, showInfo } = useNotify();
  
  // 状态管理
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.3);
  const [maxTags, setMaxTags] = useState(20);
  const [selectedTags, setSelectedTags] = useState([]);
  const [copyStatus, setCopyStatus] = useState('');
  
  // 新增：模型和阈值配置
  const [selectedModel, setSelectedModel] = useState('SmilingWolf/wd-swinv2-tagger-v3');
  const [generalThreshold, setGeneralThreshold] = useState(0.35);
  const [characterThreshold, setCharacterThreshold] = useState(0.85);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // 获取可用模型
  const availableModels = getAvailableModels();

  // 处理文件选择
  const handleFileSelect = useCallback((file) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      notifyError('validation', validation.errors.join(', '));
      return;
    }

    setSelectedImage(file);
    setAnalysisResult(null);
    setSelectedTags([]);

    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    notifySuccess('upload', `图像已加载: ${file.name}`);
  }, [notifyError, notifySuccess]);

  // 文件输入处理
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 拖拽处理
  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // 分析图像
  const analyzeImage = async () => {
    if (!selectedImage) {
      showWarning('请先选择要分析的图像');
      return;
    }

    setIsAnalyzing(true);
    try {
      showInfo(`正在调用wd-tagger AI模型分析图像... (模型: ${selectedModel.split('/')[1]})`);
      
      const result = await analyzeImageTags(selectedImage, {
        model: selectedModel,
        generalThreshold,
        characterThreshold
      });
      
      if (result.success) {
        setAnalysisResult(result);
        
        if (result.warning) {
          showWarning(result.warning);
        } else {
          notifySuccess('analyze', `✅ 成功识别到 ${result.totalTags} 个标签`);
        }
        
        // 自动选择推荐标签
        const recommended = getRecommendedTags(result.tags, 12);
        setSelectedTags(recommended.map(tag => tag.tag));
        
      } else {
        // 显示详细的错误信息和建议
        let errorMessage = result.error;
        if (result.suggestions && result.suggestions.length > 0) {
          errorMessage += '\n\n解决建议：\n' + result.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n');
        }
        
        notifyError('analyze', errorMessage);
        
        // 显示技术错误详情（供调试用）
        if (result.technicalError && result.technicalError !== result.error) {
          console.log('技术错误详情:', result.technicalError);
        }
      }
      
    } catch (error) {
      console.error('图像分析出错:', error);
      notifyError('analyze', `图像分析失败: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 复制提示词
  const handleCopy = async (text) => {
    try {
      await copyToClipboard(text || generatePrompt());
      setCopyStatus('copied');
      notifySuccess('copy', '提示词已复制到剪贴板');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (error) {
      setCopyStatus('error');
      notifyError('copy', '复制失败');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  // 生成最终提示词
  const generatePrompt = () => {
    if (!analysisResult || selectedTags.length === 0) return '';
    
    return selectedTags.join(', ');
  };

  // 切换标签选择
  const toggleTagSelection = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // 过滤标签
  const getFilteredTags = () => {
    if (!analysisResult) return [];
    
    return analysisResult.tags
      .filter(tag => tag.confidence >= confidenceThreshold)
      .slice(0, showAllTags ? undefined : maxTags);
  };

  // 导出结果
  const exportResults = () => {
    if (!analysisResult) return;
    
    const exportData = {
      fileName: selectedImage?.name,
      model: selectedModel,
      settings: {
        generalThreshold,
        characterThreshold,
        confidenceThreshold,
        maxTags
      },
      analysisTimestamp: analysisResult.timestamp,
      totalTags: analysisResult.totalTags,
      selectedTags,
      generatedPrompt: generatePrompt(),
      allTags: analysisResult.tags,
      rawOutput: analysisResult.rawOutput
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wd-tagger-result-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    notifySuccess('export', '分析结果已导出');
  };

  const filteredTags = getFilteredTags();
  const finalPrompt = generatePrompt();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* 页面标题 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <Brain className="text-purple-600 mr-2" size={28} />
                AI图像反推
              </h1>
              <p className="text-gray-600 text-sm">
                基于WaifuDiffusion的专业图像标签识别，支持多种模型和精准参数调节
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs text-gray-500">wd-tagger v3</div>
                <div className="text-sm font-semibold text-purple-600">多模型支持</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 图像上传区域 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="text-purple-600 mr-2" size={20} />
            图像上传
          </h2>
          
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {imagePreview ? (
              <div className="space-y-4">
                <img 
                  src={imagePreview} 
                  alt="上传的图像" 
                  className="max-h-64 mx-auto rounded-lg shadow-md"
                />
                <div className="text-sm text-gray-600">
                  {selectedImage?.name} ({(selectedImage?.size / 1024 / 1024).toFixed(2)} MB)
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    更换图像
                  </button>
                  <button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Zap size={16} />
                    )}
                    {isAnalyzing ? '分析中...' : '开始分析'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Camera className="mx-auto text-gray-400" size={48} />
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    拖拽图像到此处或点击上传
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    支持 JPG、PNG、WebP、BMP 格式，最大 10MB
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    选择图像文件
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* 模型和参数配置 */}
        {selectedImage && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="text-purple-600 mr-2" size={20} />
                模型配置
              </h3>
              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="flex items-center gap-2 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                高级设置
                <ChevronDown size={16} className={`transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* 模型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择模型
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {availableModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  推荐使用 wd-swinv2-tagger-v3 或 wd-vit-tagger-v3 获得最佳效果
                </p>
              </div>

              {/* 基础阈值设置 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    通用标签阈值: {(generalThreshold * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={generalThreshold}
                    onChange={(e) => setGeneralThreshold(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>保守 (更少标签)</span>
                    <span>激进 (更多标签)</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    角色标签阈值: {(characterThreshold * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.99"
                    step="0.05"
                    value={characterThreshold}
                    onChange={(e) => setCharacterThreshold(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>宽松 (更多角色)</span>
                    <span>严格 (精确角色)</span>
                  </div>
                </div>
              </div>

              {/* 高级设置 */}
              {showAdvancedSettings && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">高级设置</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        显示置信度阈值: {(confidenceThreshold * 100).toFixed(0)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.1"
                        value={confidenceThreshold}
                        onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">控制结果显示的最低置信度</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        最大显示标签数: {maxTags}
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={maxTags}
                        onChange={(e) => setMaxTags(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">限制显示的标签数量</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={() => setShowAllTags(!showAllTags)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        showAllTags 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {showAllTags ? <EyeOff size={16} /> : <Eye size={16} />}
                      {showAllTags ? '隐藏低分标签' : '显示所有标签'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 分析结果 */}
        {analysisResult && (
          <div className="space-y-6">
            {/* 统计信息 */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="text-purple-600 mr-2" size={20} />
                识别结果统计
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{analysisResult.totalTags}</div>
                  <div className="text-sm text-gray-600">识别标签</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{filteredTags.length}</div>
                  <div className="text-sm text-gray-600">过滤后</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedTags.length}</div>
                  <div className="text-sm text-gray-600">已选择</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {filteredTags.length > 0 ? (filteredTags[0].confidence * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">最高置信度</div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 border-t border-gray-200 pt-4">
                <div className="flex flex-wrap gap-4">
                  <span>模型: <strong>{selectedModel.split('/')[1]}</strong></span>
                  <span>通用阈值: <strong>{(generalThreshold * 100).toFixed(0)}%</strong></span>
                  <span>角色阈值: <strong>{(characterThreshold * 100).toFixed(0)}%</strong></span>
                </div>
              </div>
            </div>

            {/* 标签选择 */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Tag className="text-purple-600 mr-2" size={20} />
                  标签选择
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTags(filteredTags.map(tag => tag.tag))}
                    className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                  >
                    全选
                  </button>
                  <button
                    onClick={() => setSelectedTags([])}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    清空
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredTags.map((tagObj, index) => {
                  const isSelected = selectedTags.includes(tagObj.tag);
                  const confidencePercent = (tagObj.confidence * 100).toFixed(1);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => toggleTagSelection(tagObj.tag)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-purple-100 border-purple-300 text-purple-900'
                          : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{tagObj.tag}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            tagObj.confidence > 0.7 ? 'bg-green-100 text-green-700' :
                            tagObj.confidence > 0.5 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {confidencePercent}%
                          </span>
                          {isSelected && <CheckCircle size={16} className="text-purple-600" />}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 capitalize">
                        {tagObj.category}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 生成的提示词 */}
            {selectedTags.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Sparkles className="text-purple-600 mr-2" size={20} />
                    生成的提示词
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={exportResults}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download size={16} />
                      导出结果
                    </button>
                    <button
                      onClick={() => handleCopy(finalPrompt)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {copyStatus === 'copied' ? <CheckCircle size={16} /> : <Copy size={16} />}
                      复制提示词
                    </button>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm font-mono text-gray-700 leading-relaxed">
                    {finalPrompt}
                  </p>
                </div>
                
                <div className="mt-3 text-sm text-gray-500 text-center">
                  {selectedTags.length} 个标签 · 
                  {finalPrompt.length} 个字符
                </div>
              </div>
            )}
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <Info className="mr-2" size={20} />
            使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">功能特点</h4>
              <ul className="space-y-1">
                <li>• 支持多种WaifuDiffusion模型</li>
                <li>• 可调节的通用和角色标签阈值</li>
                <li>• 智能标签分类和置信度评估</li>
                <li>• 实时参数调节和预览</li>
                <li>• 完整的分析结果导出</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">使用技巧</h4>
              <ul className="space-y-1">
                <li>• 动漫风格图像效果最佳</li>
                <li>• 调低通用阈值可获得更多标签</li>
                <li>• 角色阈值影响人物识别精度</li>
                <li>• 不同模型有不同的特点和优势</li>
                <li>• 可导出完整结果用于后续分析</li>
              </ul>
            </div>
          </div>
        </div>

        {/* API状态提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 mt-0.5" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">服务说明 & 故障排除</p>
              <div className="space-y-2">
                <p>本功能使用Hugging Face的wd-tagger在线服务，可能遇到以下情况：</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>首次使用较慢：</strong> 服务可能需要30-60秒冷启动时间</li>
                  <li><strong>404错误：</strong> 服务正在启动中，请等待1-2分钟后重试</li>
                  <li><strong>超时错误：</strong> 网络较慢或服务繁忙，建议重新尝试</li>
                  <li><strong>无标签结果：</strong> 尝试调低"通用标签阈值"或更换图像</li>
                </ul>
                <p className="text-xs bg-blue-100 p-2 rounded">
                  💡 <strong>最佳效果：</strong> 使用清晰的动漫风格图像，调整阈值参数获得最佳识别结果
                </p>
              </div>
            </div>
          </div>
        </div>
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

export default ImageReversePage; 