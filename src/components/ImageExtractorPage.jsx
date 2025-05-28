import React, { useState, useRef } from 'react';
import { Upload, Download, Eye, Settings, AlertCircle, CheckCircle, Info, Lightbulb, Star, Zap, Brain } from 'lucide-react';
import { imageMetadataExtractor } from '../utils/imageMetadataExtractor.js';
import { advancedPromptAnalyzer } from '../utils/advancedPromptAnalyzer.js';

const ImageExtractorPage = () => {
  const [image, setImage] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedPrompts, setExpandedPrompts] = useState({
    positive: false,
    negative: false
  });
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      extractMetadata(file);
    }
  };

  const extractMetadata = async (file) => {
    setIsExtracting(true);
    setExtractedData(null);
    
    try {
      console.log('开始提取图像元数据...');
      const result = await imageMetadataExtractor.extractMetadata(file);
      console.log('提取结果:', result);
      
      // 如果成功提取到数据，进行高级提示词分析
      if (result.success && result.standardizedData) {
        const { positive, negative } = result.standardizedData;
        
        if (positive || negative) {
          console.log('开始高级提示词分析...');
          try {
            const promptAnalysis = await advancedPromptAnalyzer.analyzeExtractedPrompts({
              positive: positive || '',
              negative: negative || '',
              parameters: result.standardizedData.parameters || {}
            });
            
            // 将分析结果添加到结果中
            result.promptAnalysis = promptAnalysis;
            console.log('提示词分析完成:', promptAnalysis);
          } catch (analysisError) {
            console.warn('提示词分析失败:', analysisError);
            result.promptAnalysis = {
              analyzed: false,
              reason: `分析失败: ${analysisError.message}`,
              extractedPrompts: {
                positive: positive || '',
                negative: negative || ''
              }
            };
          }
        } else {
          result.promptAnalysis = {
            analyzed: false,
            reason: '未找到有效的提示词数据',
            extractedPrompts: {
              positive: '',
              negative: ''
            }
          };
        }
      } else {
        result.promptAnalysis = {
          analyzed: false,
          reason: '元数据提取失败或无有效数据',
          extractedPrompts: {
            positive: '',
            negative: ''
          }
        };
      }
      
      // 添加提取方法信息
      result.extractionMethods = Object.keys(result.extractedData || {}).map(method => ({
        method: method,
        confidence: result.extractedData[method]?.confidence || 'unknown'
      }));
      
      // 添加基本文件信息
      result.basicInfo = {
        size: file.size,
        sizeFormatted: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
        lastModified: new Date(file.lastModified).toLocaleString()
      };
      
      result.timestamp = new Date().toISOString();
      setExtractedData(result);
    } catch (error) {
      console.error('元数据提取失败:', error);
      setExtractedData({
        success: false,
        error: error.message,
        filename: file.name,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const exportData = () => {
    if (!extractedData) return;
    
    const exportContent = {
      ...extractedData,
      exportedAt: new Date().toISOString(),
      exportVersion: '2.0'
    };
    
    const blob = new Blob([JSON.stringify(exportContent, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${extractedData.filename}_metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400">暂无内容</span>;
    }
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.length > 0 ? JSON.stringify(value) : <span className="text-gray-400">空数组</span>;
      }
      return <span className="text-blue-600">[复杂对象]</span>;
    }
    
    return <span className="break-words">{String(value)}</span>;
  };

  const getQualityColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLevel = (score) => {
    if (score >= 0.8) return '优秀';
    if (score >= 0.6) return '良好';
    if (score >= 0.4) return '一般';
    return '需改进';
  };

  const getSuggestionIcon = (category) => {
    switch (category) {
      case 'warning': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'improvement': return <Lightbulb className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          基本信息
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">文件名:</span>
            <p className="text-gray-600 break-all">{extractedData.filename}</p>
          </div>
          <div>
            <span className="font-medium">文件大小:</span>
            <p className="text-gray-600">{extractedData.basicInfo?.sizeFormatted}</p>
          </div>
          <div>
            <span className="font-medium">生成工具:</span>
            <p className="text-gray-600">{extractedData.standardizedData?.generationTool || '未知'}</p>
          </div>
          <div>
            <span className="font-medium">提取时间:</span>
            <p className="text-gray-600">{new Date(extractedData.timestamp).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 质量评估 */}
      {extractedData.standardizedData?.quality && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            质量评估
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getQualityColor(extractedData.standardizedData.quality.promptEffectiveness)}`}>
                {(extractedData.standardizedData.quality.promptEffectiveness * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">提示词效果</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getQualityColor(extractedData.standardizedData.quality.parameterOptimization)}`}>
                {(extractedData.standardizedData.quality.parameterOptimization * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">参数优化</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getQualityColor(extractedData.standardizedData.quality.overallScore)}`}>
                {(extractedData.standardizedData.quality.overallScore * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">综合评分</div>
            </div>
          </div>
        </div>
      )}

      {/* 提取方法 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-green-500" />
          提取方法
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {extractedData.extractionMethods?.map((method, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{method.method}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPromptAnalysis = () => {
    const analysis = extractedData.promptAnalysis;
    
    if (!analysis?.analyzed) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-yellow-700">未找到提示词数据或分析失败</p>
          {analysis?.reason && <p className="text-sm text-yellow-600 mt-1">{analysis.reason}</p>}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* 提示词内容 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">提示词内容</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">正向提示词</label>
                <div className="flex items-center gap-2">
                  {analysis.extractedPrompts?.positive && (
                    <span className="text-xs text-blue-600">
                      {analysis.extractedPrompts.positive.length} 字符
                    </span>
                  )}
                  {analysis.extractedPrompts?._sources?.bestSource && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      来源: {analysis.extractedPrompts._sources.bestSource}
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                {analysis.extractedPrompts?.positive ? (
                  <div className="whitespace-pre-wrap break-words">
                    {expandedPrompts.positive 
                      ? analysis.extractedPrompts.positive
                      : analysis.extractedPrompts.positive.length > 200
                        ? analysis.extractedPrompts.positive.substring(0, 200) + '...'
                        : analysis.extractedPrompts.positive
                    }
                  </div>
                ) : (
                  <span className="text-gray-400">未找到正向提示词</span>
                )}
              </div>
              {analysis.extractedPrompts?.positive && analysis.extractedPrompts.positive.length > 200 && (
                <button 
                  onClick={() => setExpandedPrompts(prev => ({
                    ...prev,
                    positive: !prev.positive
                  }))}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                >
                  {expandedPrompts.positive ? '收起' : '展开全部'}
                  <span className={`transform transition-transform duration-200 ${expandedPrompts.positive ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
              )}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">负向提示词</label>
                {analysis.extractedPrompts?.negative && (
                  <span className="text-xs text-blue-600">
                    {analysis.extractedPrompts.negative.length} 字符
                  </span>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                {analysis.extractedPrompts?.negative ? (
                  <div className="whitespace-pre-wrap break-words">
                    {expandedPrompts.negative 
                      ? analysis.extractedPrompts.negative
                      : analysis.extractedPrompts.negative.length > 100
                        ? analysis.extractedPrompts.negative.substring(0, 100) + '...'
                        : analysis.extractedPrompts.negative
                    }
                  </div>
                ) : (
                  <span className="text-gray-400">未找到负向提示词</span>
                )}
              </div>
              {analysis.extractedPrompts?.negative && analysis.extractedPrompts.negative.length > 100 && (
                <button 
                  onClick={() => setExpandedPrompts(prev => ({
                    ...prev,
                    negative: !prev.negative
                  }))}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                >
                  {expandedPrompts.negative ? '收起' : '展开全部'}
                  <span className={`transform transition-transform duration-200 ${expandedPrompts.negative ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
              )}
            </div>
            
            {/* 多数据源信息 */}
            {analysis.extractedPrompts?._sources && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">数据源详情</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.extractedPrompts._sources.positive?.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-blue-700">正向提示词来源:</span>
                      <div className="space-y-1 mt-1">
                        {analysis.extractedPrompts._sources.positive.slice(0, 3).map((source, index) => (
                          <div key={index} className="text-xs text-blue-600">
                            {source.source}: {source.length}字符 ({source.confidence})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.extractedPrompts._sources.negative?.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-blue-700">负向提示词来源:</span>
                      <div className="space-y-1 mt-1">
                        {analysis.extractedPrompts._sources.negative.slice(0, 3).map((source, index) => (
                          <div key={index} className="text-xs text-blue-600">
                            {source.source}: {source.length}字符 ({source.confidence})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 正向提示词分析 */}
        {analysis.positive && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">正向提示词分析</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{analysis.positive.tags?.count || 0}</div>
                <div className="text-sm text-gray-600">标签数量</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {analysis.positive.complexity?.level || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">复杂度</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">
                  {analysis.positive.style?.primary || '未知'}
                </div>
                <div className="text-sm text-gray-600">主要风格</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${getQualityColor(analysis.positive.effectiveness)}`}>
                  {(analysis.positive.effectiveness * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">效果评分</div>
              </div>
            </div>

            {/* 语义分类 */}
            {analysis.positive.semantics?.categories && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">语义分类</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(analysis.positive.semantics.categories).map(([category, tags]) => {
                    if (tags.length === 0) return null;
                    return (
                      <div key={category} className="bg-gray-50 rounded px-2 py-1 text-xs">
                        <span className="font-medium">{category}:</span> {tags.length}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 权重分析 */}
            {analysis.positive.weights && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">权重分析</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-green-600 font-medium">强调: </span>
                    {analysis.positive.weights.distribution?.emphasized?.length || 0}
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">正常: </span>
                    {analysis.positive.weights.distribution?.normal?.length || 0}
                  </div>
                  <div>
                    <span className="text-orange-600 font-medium">弱化: </span>
                    {analysis.positive.weights.distribution?.deemphasized?.length || 0}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 生成参数 */}
        {analysis.parameters && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">生成参数</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">步数:</span>
                <p className="text-gray-600">{analysis.parameters.steps || '未知'}</p>
              </div>
              <div>
                <span className="font-medium">引导强度:</span>
                <p className="text-gray-600">{analysis.parameters.guidance || '未知'}</p>
              </div>
              <div>
                <span className="font-medium">采样器:</span>
                <p className="text-gray-600">{analysis.parameters.sampler || '未知'}</p>
              </div>
              <div>
                <span className="font-medium">种子:</span>
                <p className="text-gray-600">{analysis.parameters.seed || '未知'}</p>
              </div>
              <div>
                <span className="font-medium">分辨率:</span>
                <p className="text-gray-600">{analysis.parameters.size || '未知'}</p>
              </div>
              <div>
                <span className="font-medium">模型:</span>
                <p className="text-gray-600 break-all">{analysis.parameters.model || '未知'}</p>
              </div>
            </div>
          </div>
        )}

        {/* 智能建议 */}
        {analysis.suggestions && analysis.suggestions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              智能建议
            </h3>
            <div className="space-y-3">
              {analysis.suggestions.slice(0, 5).map((suggestion, index) => (
                <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  {getSuggestionIcon(suggestion.category)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{suggestion.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{suggestion.description}</div>
                    <div className="text-xs text-blue-600 mt-1">{suggestion.recommendation}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    优先级: {suggestion.priority?.toFixed(1) || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRawData = () => (
    <div className="space-y-4">
      {Object.entries(extractedData.extractedData || {}).map(([source, data]) => (
        <div key={source} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 capitalize flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            {source} 数据源
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-600 mb-2">
              类型: {data?.type || '未知'} | 置信度: {data?.confidence || '未知'}
            </div>
            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-auto max-h-64">
              {JSON.stringify(data?.data || {}, null, 2)}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎨 AI图像信息提取器 2.0
          </h1>
          <p className="text-gray-600">
            支持NovelAI Stealth PNG、ComfyUI、AUTOMATIC1111等主流AI绘画工具
          </p>
          <p className="text-sm text-blue-600 mt-1">
            ✨ 融合NovelAI Spell技术 + 高级提示词智能分析
          </p>
        </div>

        {/* 上传区域 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              点击或拖拽上传AI生成的图像
            </p>
            <p className="text-sm text-gray-500">
              支持PNG、JPG、JPEG、WEBP格式
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* 图像预览 */}
        {image && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              图像预览
            </h3>
            <div className="flex justify-center">
              <img
                src={URL.createObjectURL(image)}
                alt="预览"
                className="max-w-full max-h-96 rounded-lg shadow-sm"
              />
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {isExtracting && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-blue-700 font-medium">正在提取元数据...</p>
            <p className="text-sm text-blue-600 mt-1">使用多种先进技术进行深度分析</p>
          </div>
        )}

        {/* 提取失败 */}
        {extractedData && !extractedData.success && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-red-800">提取失败</h3>
            </div>
            <p className="text-red-700">{extractedData.error}</p>
          </div>
        )}

        {/* 提取成功 */}
        {extractedData && extractedData.success && (
          <>
            {/* 标签页导航 */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: '概览', icon: Info },
                    { id: 'analysis', label: '智能分析', icon: Brain },
                    { id: 'rawdata', label: '原始数据', icon: Settings }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                        activeTab === id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* 标签页内容 */}
            <div className="min-h-96">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'analysis' && renderPromptAnalysis()}
              {activeTab === 'rawdata' && renderRawData()}
            </div>

            {/* 导出按钮 */}
            <div className="text-center mt-8">
              <button
                onClick={exportData}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <Download className="w-5 h-5" />
                导出完整数据
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageExtractorPage; 