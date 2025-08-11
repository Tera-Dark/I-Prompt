import React, { useState, useRef, useCallback } from 'react';
import { 
  FolderOpen, 
  Play, 
  Square, 
  Settings, 
  FileText, 
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Package,
  X
} from 'lucide-react';
import JSZip from 'jszip';
import { getAvailableModels, analyzeImageTags } from '../services/imageTaggingService';
import { useNotify } from '../components/common/NotificationSystem';

const BatchTaggingPage = () => {
  const [folderPath, setFolderPath] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [logs, setLogs] = useState([]);
  const [selectedModel, setSelectedModel] = useState('SmilingWolf/wd-swinv2-tagger-v3');
  const [generalThreshold, setGeneralThreshold] = useState(0.35);
  const [characterThreshold, setCharacterThreshold] = useState(0.85);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [downloadMode, setDownloadMode] = useState('zip'); // 'individual' or 'zip'
  const [preserveFolderStructure, setPreserveFolderStructure] = useState(true);
  const [tagFiles, setTagFiles] = useState([]); // 存储生成的标签文件
  
  const abortControllerRef = useRef(null);
  const fileInputRef = useRef(null);

  const availableModels = getAvailableModels();
  const { notifySuccess, notifyError, showWarning } = useNotify();

  // 添加日志
  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = {
      id: Date.now(),
      timestamp,
      message,
      type // info, success, error, warning
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  // 清空日志
  const clearLogs = () => {
    setLogs([]);
  };

  // 下载所有标签文件为ZIP
  const downloadAllAsZip = async () => {
    if (tagFiles.length === 0) {
      notifyError('没有可下载的标签文件');
      return;
    }

    try {
      const zip = new JSZip();
      
      // 添加文件到ZIP
      tagFiles.forEach(({ fileName, content, relativePath }) => {
        const zipPath = preserveFolderStructure && relativePath 
          ? relativePath 
          : fileName;
        zip.file(zipPath, content);
      });

      // 生成ZIP文件
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // 下载ZIP文件
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderPath || 'batch_tags'}_tags.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      notifySuccess('ZIP文件下载成功');
      addLog(`✓ 已下载包含 ${tagFiles.length} 个标签文件的ZIP包`, 'success');
    } catch (error) {
      notifyError('ZIP文件生成失败: ' + error.message);
      addLog(`✗ ZIP文件生成失败: ${error.message}`, 'error');
    }
  };

  // 清空处理结果
  const clearResults = () => {
    setProcessedFiles([]);
    setTagFiles([]);
    setProgress({ current: 0, total: 0, percentage: 0 });
  };

  // 选择文件夹
  const handleFolderSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 处理文件夹选择
  const handleFolderChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      // 获取第一个文件的路径来推断文件夹路径
      const firstFile = files[0];
      const pathParts = firstFile.webkitRelativePath.split('/');
      const folderName = pathParts[0];
      setFolderPath(folderName);
      addLog(`已选择文件夹: ${folderName}，包含 ${files.length} 个文件`, 'info');
    }
  };

  // 获取图片文件
  const getImageFiles = () => {
    if (!fileInputRef.current || !fileInputRef.current.files) return [];
    
    const files = Array.from(fileInputRef.current.files);
    const imageFiles = files.filter(file => {
      const extension = file.name.toLowerCase().split('.').pop();
      return ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'].includes(extension);
    });
    
    return imageFiles;
  };

  // 开始批量处理
  const startBatchProcessing = async () => {
    const imageFiles = getImageFiles();
    
    if (imageFiles.length === 0) {
      notifyError('请先选择包含图片的文件夹');
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: imageFiles.length, percentage: 0 });
    setProcessedFiles([]);
    setTagFiles([]);
    
    // 创建中止控制器
    abortControllerRef.current = new AbortController();
    
    addLog(`开始批量处理 ${imageFiles.length} 张图片`, 'info');
    addLog(`使用模型: ${selectedModel}`, 'info');
    addLog(`通用标签阈值: ${generalThreshold}, 角色标签阈值: ${characterThreshold}`, 'info');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < imageFiles.length; i++) {
      if (abortControllerRef.current?.signal.aborted) {
        addLog('批量处理已被用户终止', 'warning');
        break;
      }

      const file = imageFiles[i];
      const fileName = file.name;
      const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
      const relativePath = file.webkitRelativePath || fileName;
      const tagFileName = `${fileNameWithoutExt}.txt`;
      const tagRelativePath = relativePath.replace(/\.[^/.]+$/, '.txt');
      
      try {
        addLog(`正在处理: ${fileName}`, 'info');
        
        // 分析图片
        const result = await analyzeImageTags(file, {
          model: selectedModel,
          generalThresh: generalThreshold,
          characterThresh: characterThreshold
        });

        if (result && result.success && result.data) {
          // 生成标签文本
          const allTags = [
            ...(result.data.general || []),
            ...(result.data.character || []),
            ...(result.data.copyright || []),
            ...(result.data.artist || [])
          ];
          
          const tagsText = allTags.map(tag => tag.tag || tag).join(', ');
          
          // 根据下载模式处理文件
          if (downloadMode === 'zip') {
            // ZIP模式：存储到数组中，稍后批量下载
            setTagFiles(prev => [...prev, {
              fileName: tagFileName,
              content: tagsText,
              relativePath: tagRelativePath,
              originalFile: fileName
            }]);
          } else {
            // 单独下载模式：立即下载
            const blob = new Blob([tagsText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = tagFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
          
          successCount++;
          addLog(`✓ ${fileName} 处理完成，生成 ${allTags.length} 个标签`, 'success');
          
          setProcessedFiles(prev => [...prev, {
            fileName,
            status: 'success',
            tagCount: allTags.length,
            tags: tagsText
          }]);
        } else {
          throw new Error('分析结果为空');
        }
      } catch (error) {
        errorCount++;
        addLog(`✗ ${fileName} 处理失败: ${error.message}`, 'error');
        
        setProcessedFiles(prev => [...prev, {
          fileName,
          status: 'error',
          error: error.message
        }]);
      }

      // 更新进度
      const current = i + 1;
      const percentage = Math.round((current / imageFiles.length) * 100);
      setProgress({ current, total: imageFiles.length, percentage });
    }

    setIsProcessing(false);
    addLog(`批量处理完成！成功: ${successCount}, 失败: ${errorCount}`, 'info');
    
    if (successCount > 0) {
      if (downloadMode === 'zip') {
        addLog(`✓ 已生成 ${successCount} 个标签文件，点击"下载ZIP包"按钮获取所有文件`, 'success');
        notifySuccess('batch_process', `成功处理 ${successCount} 张图片，可下载ZIP包`);
      } else {
        notifySuccess('batch_process', `成功处理 ${successCount} 张图片`);
      }
    }
    if (errorCount > 0) {
      showWarning(`有 ${errorCount} 张图片处理失败，请查看日志`);
    }
  };

  // 停止处理
  const stopBatchProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      addLog('用户终止了批量处理', 'warning');
    }
  };

  // 获取日志图标
  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">批量图片打标</h1>
          <p className="text-gray-600">批量处理文件夹中的图片，自动生成标签文件</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：配置和控制面板 */}
          <div className="space-y-6">
            {/* 文件夹选择 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FolderOpen className="w-5 h-5 mr-2" />
                文件夹选择
              </h2>
              
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleFolderChange}
                  className="hidden"
                  accept="image/*"
                />
                
                <button
                  onClick={handleFolderSelect}
                  disabled={isProcessing}
                  className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-center">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-gray-600">点击选择图片文件夹</p>
                  </div>
                </button>
                
                {folderPath && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700">
                      已选择文件夹: <span className="font-medium">{folderPath}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 模型配置 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                模型配置
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择模型
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={isProcessing}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  >
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  {availableModels.find(m => m.id === selectedModel)?.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {availableModels.find(m => m.id === selectedModel).description}
                    </p>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    {showAdvanced ? '隐藏' : '显示'}高级设置
                  </button>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      下载模式
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="zip"
                          checked={downloadMode === 'zip'}
                          onChange={(e) => setDownloadMode(e.target.value)}
                          disabled={isProcessing}
                          className="mr-2"
                        />
                        <Package className="w-4 h-4 mr-1" />
                        ZIP批量下载（推荐）
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="individual"
                          checked={downloadMode === 'individual'}
                          onChange={(e) => setDownloadMode(e.target.value)}
                          disabled={isProcessing}
                          className="mr-2"
                        />
                        <Download className="w-4 h-4 mr-1" />
                        单独下载
                      </label>
                    </div>
                  </div>

                  {downloadMode === 'zip' && (
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preserveFolderStructure}
                          onChange={(e) => setPreserveFolderStructure(e.target.checked)}
                          disabled={isProcessing}
                          className="mr-2"
                        />
                        保持文件夹结构
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        在ZIP包中保持原有的文件夹层级结构
                      </p>
                    </div>
                  )}
                </div>

                {showAdvanced && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        通用标签阈值: {generalThreshold}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={generalThreshold}
                        onChange={(e) => setGeneralThreshold(parseFloat(e.target.value))}
                        disabled={isProcessing}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        角色标签阈值: {characterThreshold}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={characterThreshold}
                        onChange={(e) => setCharacterThreshold(parseFloat(e.target.value))}
                        disabled={isProcessing}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">控制面板</h2>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={startBatchProcessing}
                    disabled={isProcessing || !folderPath}
                    className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    开始处理
                  </button>
                  
                  <button
                    onClick={stopBatchProcessing}
                    disabled={!isProcessing}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    停止处理
                  </button>
                </div>

                {/* ZIP下载和清除按钮 */}
                {downloadMode === 'zip' && tagFiles.length > 0 && (
                  <div className="flex gap-3">
                    <button
                      onClick={downloadAllAsZip}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Package className="w-5 h-5 mr-2" />
                      下载ZIP包 ({tagFiles.length}个文件)
                    </button>
                    
                    <button
                      onClick={clearResults}
                      disabled={isProcessing}
                      className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <X className="w-5 h-5 mr-2" />
                      清除结果
                    </button>
                  </div>
                )}

                {/* 进度显示 */}
                {(isProcessing || progress.total > 0) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>进度: {progress.current} / {progress.total}</span>
                      <span>{progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：日志和结果 */}
          <div className="space-y-6">
            {/* 处理结果 */}
            {processedFiles.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  处理结果
                </h2>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {processedFiles.map((file, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        file.status === 'success' 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{file.fileName}</span>
                        {file.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      {file.status === 'success' && (
                        <p className="text-xs text-green-600 mt-1">
                          生成 {file.tagCount} 个标签
                        </p>
                      )}
                      {file.status === 'error' && (
                        <p className="text-xs text-red-600 mt-1">
                          错误: {file.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 日志面板 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  处理日志
                </h2>
                <button
                  onClick={clearLogs}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  清空日志
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-center">暂无日志</p>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-2 text-sm">
                        {getLogIcon(log.type)}
                        <span className="text-gray-500 min-w-0 flex-shrink-0">
                          {log.timestamp}
                        </span>
                        <span className="text-gray-700 break-words">
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchTaggingPage;