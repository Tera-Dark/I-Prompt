import React, { useState, useEffect } from 'react';
import { Search, Wand2, BookOpen, Image, Settings, Brain, FolderOpen } from 'lucide-react';

// 导入新架构的组件和模块
import PromptGeneratorPage from './pages/PromptGeneratorPage';
import PromptLibraryPage from './pages/PromptLibraryPage';
import ImageExtractorPage from './pages/ImageExtractorPage';
import AssistantToolsPage from './pages/AssistantToolsPage';
import TutorialPage from './pages/TutorialPage';
import ImageReversePage from './pages/ImageReversePage';
import BatchTaggingPage from './pages/BatchTaggingPage';
import SettingsPage from './pages/SettingsPage';

// 导入通知系统
import { NotificationProvider } from './components/common/NotificationSystem';

// 导入API管理器
import apiManager from './services/apiManager';

const AIPaintingAssistant = () => {
  const [activeTab, setActiveTab] = useState('generator');

  // 初始化API管理器
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await apiManager.init();
        console.log('API管理器初始化完成');
      } catch (error) {
        console.error('API管理器初始化失败:', error);
      }
    };

    initializeApp();
  }, []);

  const tabs = [
    { id: 'generator', icon: Wand2, label: '提示词生成', color: 'text-purple-600' },
    { id: 'library', icon: Search, label: '提示词库', color: 'text-blue-600' },
    { id: 'extractor', icon: Image, label: '图像提取', color: 'text-green-600' },
    { id: 'tools', icon: Settings, label: '灵感生成', color: 'text-orange-600' },
    { id: 'reverse', icon: Brain, label: '图像反推', color: 'text-purple-600' },
    { id: 'batch', icon: FolderOpen, label: '批量打标', color: 'text-red-600' },
    { id: 'settings', icon: Settings, label: '设置', color: 'text-gray-600' },
    { id: 'tutorial', icon: BookOpen, label: '学习教程', color: 'text-indigo-600' }
  ];

  // 渲染当前页面内容
  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'generator':
        return <PromptGeneratorPage />;
      case 'library':
        return <PromptLibraryPage />;
      case 'extractor':
        return <ImageExtractorPage />;
      case 'tools':
        return <AssistantToolsPage />;
      case 'reverse':
        return <ImageReversePage />;
      case 'batch':
        return <BatchTaggingPage />;
      case 'settings':
        return <SettingsPage />;
      case 'tutorial':
        return <TutorialPage />;
      default:
        return <PromptGeneratorPage />;
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        {/* 头部导航 */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <img 
                  src={process.env.PUBLIC_URL + "/logo192.png"} 
                  alt="I Prompt Logo" 
                  className="w-10 h-10 rounded-xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">I Prompt</h1>
                  <p className="text-xs text-gray-500">智能提示词助手</p>
                </div>
              </div>

              {/* 导航标签 */}
              <div className="flex space-x-0.5 sm:space-x-1 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      title={tab.label} // 添加tooltip，在只显示图标时提供文字提示
                      className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap min-w-0 ${
                        activeTab === tab.id
                          ? 'bg-gray-900 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent size={16} className={`sm:w-[18px] sm:h-[18px] ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                      <span className="hidden lg:inline text-xs sm:text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderCurrentPage()}
        </div>

        {/* 页脚 */}
        <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <img 
                  src={process.env.PUBLIC_URL + "/logo192.png"} 
                  alt="I Prompt Logo" 
                  className="w-8 h-8 rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="text-lg font-bold text-gray-900">I Prompt</span>
              </div>
              <p className="text-gray-600 mb-2">
                让AI绘画创作更简单 | Make AI art creation easier
              </p>
              <p className="text-sm text-gray-500">
                © 2024 I Prompt. 专业的AI绘画提示词工具平台
              </p>
              <div className="flex justify-center space-x-6 mt-4 text-sm text-gray-500">
                <span>🎨 提示词生成</span>
                <span>📚 提示词库</span>
                <span>🖼️ 图像提取</span>
                <span>💡 灵感生成</span>
                <span>🧠 图像反推</span>
                <span>📁 批量打标</span>
                <span>📖 学习教程</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </NotificationProvider>
  );
};

export default AIPaintingAssistant;