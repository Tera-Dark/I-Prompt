import React, { useState, useCallback } from 'react';
import { Upload, Image, Copy, CheckCircle, AlertCircle, FileImage, Download, Info } from 'lucide-react';
import { validateImageFile } from '../utils/validation';
import { copyToClipboard } from '../utils/clipboard';
import { imageMetadataExtractor } from '../utils/imageMetadataExtractor';

const ImageExtractorPage = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 处理文件上传
  const handleFileUpload = useCallback(async (file) => {
    setErrorMessage('');
    
    // 验证文件
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.errors.join(', '));
      return;
    }

    // 创建预览URL
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage({
      file,
      url: imageUrl,
      name: file.name,
      size: file.size
    });

    // 开始提取
    await extractImageInfo(file);
  }, []);

  // 真正的图像信息提取
  const extractImageInfo = async (file) => {
    setIsExtracting(true);
    setExtractedData(null);
    setErrorMessage('');

    try {
      // 使用真正的元数据提取器
      const result = await imageMetadataExtractor.extractMetadata(file);
      
      // 检查是否成功提取到数据
      if (result.success && result.standardizedData) {
        const { positive, negative, parameters } = result.standardizedData;
        
        // 转换为旧格式以兼容现有UI
        const extractedMetadata = {
          positivePrompts: positive || '',
          negativePrompts: negative || '',
          parameters: parameters || {},
          generationTool: result.standardizedData.generationTool || 'Unknown',
          extractionMethods: result.extractionMethods || [],
          rawData: result.extractedData || {}
        };
        
        setExtractedData(extractedMetadata);
      } else {
        // 如果没有提取到任何有用信息，显示提示
        setErrorMessage('未能从图像中提取到AI生成信息。这可能是因为：\n1. 图像不是AI生成的\n2. 图像元数据已被清除\n3. 使用了不支持的AI工具格式');
      }
    } catch (error) {
      console.error('图像信息提取失败:', error);
      setErrorMessage(error.message || '图像信息提取失败，请确保上传的是包含元数据的AI生成图像');
    } finally {
      setIsExtracting(false);
    }
  };

  // 拖拽处理
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  const handleCopy = async (text) => {
    const success = await copyToClipboard(text);
    setCopyStatus(success ? 'copied' : 'error');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const resetExtractor = () => {
    setUploadedImage(null);
    setExtractedData(null);
    setErrorMessage('');
    setCopyStatus('');
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <Image className="mr-3 text-green-600" size={32} />
          图像信息提取器
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          上传AI生成的图片，自动提取其中的提示词、参数和元数据信息，支持主流AI绘画工具格式
        </p>
      </div>

      {/* 上传区域 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 p-6">
        {!uploadedImage ? (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-lg font-medium text-gray-700 mb-2">
              拖拽图片到此处，或点击选择文件
            </p>
            <p className="text-sm text-gray-500 mb-6">
              支持 JPG、PNG、WEBP 格式，最大 10MB
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
            >
              <FileImage className="mr-2" size={20} />
              选择图片文件
            </label>
          </div>
        ) : (
          <ImagePreview
            image={uploadedImage}
            onReset={resetExtractor}
            onReExtract={() => extractImageInfo(uploadedImage.file)}
          />
        )}

        {/* 错误信息 */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="mr-2 text-red-600 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* 提取进度 */}
      {isExtracting && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg font-medium text-gray-700">正在分析图像元数据...</span>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">正在读取EXIF信息和PNG文本块</p>
            <p className="text-xs text-gray-500">支持ComfyUI、AUTOMATIC1111、NovelAI等格式</p>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '85%' }}></div>
          </div>
        </div>
      )}

      {/* 提取结果 */}
      {extractedData && (
        <ExtractedDataDisplay
          data={extractedData}
          onCopy={handleCopy}
          copyStatus={copyStatus}
        />
      )}

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
 * 图片预览组件
 */
const ImagePreview = ({ image, onReset, onReExtract }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-900">上传的图片</h3>
      <div className="flex gap-2">
        <button
          onClick={onReExtract}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          重新提取
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          重新上传
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <img
          src={image.url}
          alt="上传的图片"
          className="w-full h-64 object-cover rounded-lg border border-gray-200"
        />
      </div>
      
      <div className="space-y-3">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">文件信息</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">文件名：</span>{image.name}</p>
            <p><span className="font-medium">文件大小：</span>{(image.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><span className="font-medium">文件类型：</span>{image.file.type}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * 提取数据显示组件
 */
const ExtractedDataDisplay = ({ data, onCopy, copyStatus }) => {
  // 获取提取来源的友好显示名称
  const getSourceDisplayName = (source) => {
    const sourceMap = {
      'comfyui': 'ComfyUI',
      'automatic1111': 'AUTOMATIC1111',
      'novelai': 'NovelAI',
      'sd-webui': 'Stable Diffusion WebUI',
      'exif_usercomment': 'EXIF UserComment',
      'unknown': '未知格式'
    };
    return sourceMap[source] || source || '未知格式';
  };

  // 安全获取元数据，如果不存在则创建默认值
  const metadata = data.rawData || {};
  const extractionSource = data.generationTool || 'unknown';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <CheckCircle className="mr-2 text-green-600" size={24} />
          提取完成
        </h2>
        <div className="flex items-center space-x-2">
          <Info className="text-blue-600" size={16} />
          <span className="text-sm text-gray-600">
            来源: <span className="font-medium text-blue-600">{getSourceDisplayName(extractionSource)}</span>
          </span>
        </div>
      </div>

    {/* 提示词信息 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DataCard
        title="正向提示词 (Positive Prompts)"
        content={data.positivePrompts || ''}
        onCopy={onCopy}
        copyStatus={copyStatus}
        bgColor="bg-green-50"
        borderColor="border-green-200"
      />
      
      <DataCard
        title="负向提示词 (Negative Prompts)"
        content={data.negativePrompts || ''}
        onCopy={onCopy}
        copyStatus={copyStatus}
        bgColor="bg-red-50"
        borderColor="border-red-200"
      />
    </div>

    {/* 生成参数 */}
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">生成参数</h3>
        <button
          onClick={() => onCopy(JSON.stringify(data.parameters || {}, null, 2))}
          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
          title="复制参数"
        >
          <Copy size={16} />
        </button>
      </div>
      
      {data.parameters && Object.keys(data.parameters).length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.parameters).map(([key, value]) => {
            // 安全地渲染值，如果是对象则转换为字符串
            const displayValue = typeof value === 'object' && value !== null 
              ? '[复杂对象]' 
              : String(value);
            
            return (
              <div key={key} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{key}</p>
                <p className="text-sm font-medium text-gray-900 break-words">{displayValue}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>未找到生成参数</p>
        </div>
      )}
    </div>

    {/* 元数据信息 */}
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">元数据信息</h3>
      {metadata && Object.keys(metadata).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(metadata).map(([key, value]) => {
            // 安全地渲染值
            const displayValue = typeof value === 'object' && value !== null 
              ? JSON.stringify(value) 
              : String(value || '');
            
            return (
              <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{key}:</span>
                <span className="text-sm font-medium text-gray-900 break-words max-w-xs">{displayValue}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>未找到元数据信息</p>
        </div>
      )}
    </div>

    {/* 提取方法信息 */}
    {data.extractionMethods && data.extractionMethods.length > 0 && (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">提取方法</h3>
        <div className="flex flex-wrap gap-2">
          {data.extractionMethods.map((method, index) => (
            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {method.method} ({method.confidence})
            </span>
          ))}
        </div>
      </div>
    )}

    {/* 一键复制所有信息 */}
    <div className="text-center">
      <button
        onClick={() => onCopy(`正向提示词:\n${data.positivePrompts || ''}\n\n负向提示词:\n${data.negativePrompts || ''}\n\n参数:\n${JSON.stringify(data.parameters || {}, null, 2)}`)}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
      >
        <Download className="inline mr-2" size={20} />
        一键复制所有信息
      </button>
    </div>
  </div>
  );
};

/**
 * 数据卡片组件
 */
const DataCard = ({ title, content, onCopy, copyStatus, bgColor, borderColor }) => (
  <div className={`${bgColor} ${borderColor} border rounded-xl p-6`}>
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <button
        onClick={() => onCopy(content)}
        className="p-2 bg-white/80 rounded-lg hover:bg-white transition-colors"
        title="复制内容"
      >
        {copyStatus === 'copied' ? (
          <CheckCircle size={16} className="text-green-600" />
        ) : (
          <Copy size={16} className="text-gray-600" />
        )}
      </button>
    </div>
    <div className="bg-white/80 p-4 rounded-lg">
      <p className="text-sm font-mono text-gray-700 leading-relaxed">
        {content || '暂无内容'}
      </p>
    </div>
  </div>
);

export default ImageExtractorPage; 