import React, { useState, useRef } from 'react';
import { 
  Database, Trash2, AlertTriangle, Settings,
  Check, X, Loader, BookOpen, FolderOpen 
} from 'lucide-react';
import { 
  Download 
} from 'lucide-react';
import { tagDatabaseService } from '../../services/tagDatabaseService';

/**
 * 完善的库管理组件
 * 支持导入导出JSON文件、库管理、统计信息等
 */
const LibraryManager = ({ onClose, onLibraryUpdate }) => {
  const [activeTab, setActiveTab] = useState('import-export');
  const [importData, setImportData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [statistics, setStatistics] = useState(null);
  const fileInputRef = useRef(null);

  // 获取统计信息
  React.useEffect(() => {
    const stats = tagDatabaseService.getStatistics();
    setStatistics(stats);
  }, []);

  // 显示消息
  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 3000);
  };

  // 导出当前库为JSON
  const handleExportLibrary = () => {
    try {
      const exportData = {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        exportType: "complete_library",
        description: "I-Prompt 完整标签库导出",
        defaultDatabase: tagDatabaseService.getDefaultDatabase(),
        userDatabase: tagDatabaseService.exportUserDatabase(),
        statistics: tagDatabaseService.getStatistics()
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      setImportData(jsonString);
      
      // 自动下载
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `i-prompt-library-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage('success', '库导出成功！文件已下载到本地。');
    } catch (error) {
      console.error('导出失败:', error);
      showMessage('error', '导出失败：' + error.message);
    }
  };

  // 导出用户自定义库
  const handleExportUserLibrary = () => {
    try {
      const userData = tagDatabaseService.exportUserDatabase();
      const jsonString = JSON.stringify(userData, null, 2);
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `i-prompt-user-library-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage('success', '用户库导出成功！');
    } catch (error) {
      console.error('导出用户库失败:', error);
      showMessage('error', '导出失败：' + error.message);
    }
  };

  // 从文件导入
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showMessage('error', '请选择JSON格式的文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        setImportData(content);
        showMessage('success', '文件读取成功，请检查内容后点击导入');
      } catch (error) {
        showMessage('error', '文件读取失败：' + error.message);
      }
    };
    reader.readAsText(file);
  };

  // 导入库数据
  const handleImportLibrary = async () => {
    if (!importData.trim()) {
      showMessage('error', '请先输入或选择要导入的JSON数据');
      return;
    }

    setIsProcessing(true);
    try {
      const data = JSON.parse(importData);
      
      // 验证数据格式
      if (!data.version) {
        throw new Error('无效的库文件格式：缺少版本信息');
      }

      let importSuccess = false;

      // 根据导出类型处理不同的导入逻辑
      if (data.exportType === 'complete_library' && data.userDatabase) {
        // 完整库导入
        importSuccess = tagDatabaseService.importUserDatabase(data.userDatabase);
      } else if (data.userData) {
        // 用户库导入
        importSuccess = tagDatabaseService.importUserDatabase(data);
      } else if (data.categories) {
        // 直接的分类数据导入
        const userData = { userData: data.categories };
        importSuccess = tagDatabaseService.importUserDatabase(userData);
      } else {
        throw new Error('无法识别的库文件格式');
      }

      if (importSuccess) {
        showMessage('success', '库导入成功！页面将刷新以显示新数据。');
        
        // 更新统计信息
        const newStats = tagDatabaseService.getStatistics();
        setStatistics(newStats);
        
        // 通知父组件更新
        if (onLibraryUpdate) {
          onLibraryUpdate();
        }
        
        // 清空导入数据
        setImportData('');
        
        // 延迟关闭对话框
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error('导入过程中发生错误');
      }
    } catch (error) {
      console.error('导入失败:', error);
      showMessage('error', '导入失败：' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 重置用户库
  const handleResetUserLibrary = () => {
    if (window.confirm('确定要重置用户自定义库吗？这将删除所有自定义分类和标签，此操作不可撤销！')) {
      try {
        tagDatabaseService.resetUserDatabase();
        showMessage('success', '用户库已重置');
        
        // 更新统计信息
        const newStats = tagDatabaseService.getStatistics();
        setStatistics(newStats);
        
        if (onLibraryUpdate) {
          onLibraryUpdate();
        }
      } catch (error) {
        showMessage('error', '重置失败：' + error.message);
      }
    }
  };

  // 创建示例库文件
  const handleCreateSampleLibrary = () => {
    const sampleLibrary = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      exportType: "user_library",
      description: "I-Prompt 示例自定义库",
      userData: {
        "my-characters": {
          name: "我的角色",
          icon: "👤",
          color: "bg-blue-100 text-blue-700",
          isDefault: false,
          isUserDefined: true,
          subcategories: {
            "anime-girls": {
              name: "动漫女孩",
              isDefault: false,
              isUserDefined: true,
              tags: [
                { id: "sample_001", en: "miku", cn: "初音未来", frequency: 80 },
                { id: "sample_002", en: "rem", cn: "蕾姆", frequency: 75 },
                { id: "sample_003", en: "zero two", cn: "02", frequency: 70 }
              ]
            }
          }
        },
        "my-styles": {
          name: "我的风格",
          icon: "🎨",
          color: "bg-purple-100 text-purple-700",
          isDefault: false,
          isUserDefined: true,
          subcategories: {
            "favorite-styles": {
              name: "喜爱风格",
              isDefault: false,
              isUserDefined: true,
              tags: [
                { id: "style_001", en: "ghibli style", cn: "吉卜力风格", frequency: 85 },
                { id: "style_002", en: "makoto shinkai", cn: "新海诚风格", frequency: 80 }
              ]
            }
          }
        }
      }
    };

    const jsonString = JSON.stringify(sampleLibrary, null, 2);
    setImportData(jsonString);
    showMessage('success', '示例库已生成，您可以修改后导入');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Database className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">标签库管理系统</h2>
              <p className="text-sm text-gray-600">导入导出、统计管理、库维护</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 标签页导航 */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'import-export', label: '导入导出', icon: FolderOpen },
            { id: 'statistics', label: '统计信息', icon: BookOpen },
            { id: 'maintenance', label: '库维护', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* 消息提示 */}
          {message.content && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              {message.content}
            </div>
          )}

          {/* 导入导出标签页 */}
          {activeTab === 'import-export' && (
            <div className="space-y-6">
              {/* 导出部分 */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <Download size={18} />
                  导出标签库
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleExportLibrary}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download size={16} />
                    导出完整库（包含默认库+用户库）
                  </button>
                  <button
                    onClick={handleExportUserLibrary}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Download size={16} />
                    仅导出用户自定义库
                  </button>
                  <p className="text-sm text-green-700">
                    💡 导出的JSON文件可以分享给其他用户，或作为备份保存
                  </p>
                </div>
              </div>

              {/* 导入部分 */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Download size={18} />
                  导入标签库
                </h3>
                <div className="space-y-3">
                  {/* 文件选择 */}
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download size={16} />
                      选择JSON文件
                    </button>
                    <button
                      onClick={handleCreateSampleLibrary}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <BookOpen size={16} />
                      生成示例库
                    </button>
                  </div>

                  {/* JSON数据输入 */}
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="粘贴JSON数据或使用上方按钮选择文件..."
                    className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm"
                  />

                  {/* 导入按钮 */}
                  <button
                    onClick={handleImportLibrary}
                    disabled={isProcessing || !importData.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    {isProcessing ? '导入中...' : '导入库数据'}
                  </button>

                  <p className="text-sm text-blue-700">
                    💡 支持导入完整库文件、用户库文件或标准格式的分类数据
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 统计信息标签页 */}
          {activeTab === 'statistics' && statistics && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{statistics.totalCategories}</div>
                  <div className="text-sm text-blue-700">总分类数</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{statistics.totalSubcategories}</div>
                  <div className="text-sm text-green-700">子分类数</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{statistics.totalTags}</div>
                  <div className="text-sm text-purple-700">总标签数</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{statistics.userTags}</div>
                  <div className="text-sm text-orange-700">用户标签</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">详细统计</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">默认分类：</span>
                    <span className="font-medium">{statistics.defaultCategories}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">用户分类：</span>
                    <span className="font-medium">{statistics.userCategories}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">默认标签：</span>
                    <span className="font-medium">{statistics.defaultTags}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">用户标签：</span>
                    <span className="font-medium">{statistics.userTags}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 库维护标签页 */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  危险操作
                </h3>
                <button
                  onClick={handleResetUserLibrary}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                  重置用户自定义库
                </button>
                <p className="text-sm text-yellow-700 mt-2">
                  ⚠️ 此操作将删除所有用户自定义的分类和标签，请谨慎操作！
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3">使用说明</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <p>• <strong>导出完整库：</strong>包含默认库和用户库的完整数据，适合完整备份</p>
                  <p>• <strong>导出用户库：</strong>仅包含用户自定义数据，适合分享个人库</p>
                  <p>• <strong>导入库：</strong>支持导入其他用户分享的库文件</p>
                  <p>• <strong>JSON格式：</strong>所有数据使用标准JSON格式，便于编辑和管理</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibraryManager; 