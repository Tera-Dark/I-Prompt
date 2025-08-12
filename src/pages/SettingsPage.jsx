import React, { useState, useEffect } from 'react';
import { Settings, Key, Globe, Palette, Database, Info, CheckCircle, AlertCircle } from 'lucide-react';
import ZhipuApiKeySettings from '../components/ZhipuApiKeySettings';
import apiManager from '../services/apiManager';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('api');
  const [apiStatus, setApiStatus] = useState(null);

  // 获取API状态
  useEffect(() => {
    const updateApiStatus = () => {
      const status = apiManager.getStatusReport();
      setApiStatus(status);
    };

    updateApiStatus();
    
    // 每30秒更新一次状态
    const interval = setInterval(updateApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const sections = [
    { id: 'api', icon: Key, label: 'API设置', description: '配置AI模型API密钥' },
    { id: 'general', icon: Settings, label: '通用设置', description: '应用基础配置' },
    { id: 'appearance', icon: Palette, label: '外观设置', description: '界面主题和样式' },
    { id: 'data', icon: Database, label: '数据管理', description: '导入导出和清理' },
    { id: 'about', icon: Info, label: '关于', description: '版本信息和帮助' }
  ];

  const handleZhipuApiKeyChange = async (hasKey) => {
    if (hasKey) {
      // 更新API管理器中的Zhipu密钥
      await apiManager.updateZhipuApiKey();
      
      // 刷新API状态
      const status = apiManager.getStatusReport();
      setApiStatus(status);
    }
  };

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="text-blue-600" size={20} />
          <h3 className="font-semibold text-blue-900">API配置说明</h3>
        </div>
        <p className="text-blue-800 text-sm">
          配置AI模型API密钥以启用智能提示词生成功能。系统支持多个API自动切换，确保服务稳定性。
        </p>
      </div>

      {/* API状态概览 */}
      {apiStatus && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Globe size={20} />
            API状态概览
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{apiStatus.totalApis}</div>
              <div className="text-sm text-gray-600">总API数</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{apiStatus.availableApis}</div>
              <div className="text-sm text-gray-600">可用API</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">{apiStatus.currentApi || '无'}</div>
              <div className="text-sm text-gray-600">当前API</div>
            </div>
          </div>
        </div>
      )}

      {/* Zhipu GLM API设置 */}
      <ZhipuApiKeySettings 
        onApiKeyChange={handleZhipuApiKeyChange}
        className="border-0 shadow-sm"
      />

      {/* API列表 */}
      {apiStatus && apiStatus.apis && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">API服务状态</h3>
          <div className="space-y-2">
            {apiStatus.apis.map((api, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {api.available ? (
                    <CheckCircle className="text-green-500" size={16} />
                  ) : (
                    <AlertCircle className="text-red-500" size={16} />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{api.name}</div>
                    <div className="text-sm text-gray-600">{api.description || api.provider}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${api.available ? 'text-green-600' : 'text-red-600'}`}>
                    {api.available ? '可用' : '不可用'}
                  </div>
                  {api.lastChecked && (
                    <div className="text-xs text-gray-500">
                      {new Date(api.lastChecked).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">通用设置</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">自动保存</div>
              <div className="text-sm text-gray-600">自动保存生成的提示词</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">显示提示</div>
              <div className="text-sm text-gray-600">显示使用提示和帮助信息</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">外观设置</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">主题</label>
            <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="light">浅色主题</option>
              <option value="dark">深色主题</option>
              <option value="auto">跟随系统</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">字体大小</label>
            <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">数据管理</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">导出数据</div>
              <div className="text-sm text-gray-600">导出所有生成的提示词和设置</div>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              导出
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">导入数据</div>
              <div className="text-sm text-gray-600">从备份文件恢复数据</div>
            </div>
            <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
              导入
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
            <div>
              <div className="font-medium text-red-900">清除所有数据</div>
              <div className="text-sm text-red-600">删除所有本地存储的数据</div>
            </div>
            <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
              清除
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">关于 I Prompt</h3>
        <div className="space-y-4">
          <div className="text-center">
            <img 
              src={process.env.PUBLIC_URL + "/logo192.png"} 
              alt="I Prompt Logo" 
              className="w-16 h-16 mx-auto rounded-xl mb-4"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h4 className="text-xl font-bold text-gray-900">I Prompt</h4>
            <p className="text-gray-600">智能提示词助手</p>
            <p className="text-sm text-gray-500 mt-2">版本 3.0.0</p>
          </div>
          
          <div className="border-t pt-4">
            <h5 className="font-semibold text-gray-900 mb-2">功能特性</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 智能提示词生成</li>
              <li>• 多API自动切换</li>
              <li>• 图像标签提取</li>
              <li>• 批量图像处理</li>
              <li>• 提示词库管理</li>
              <li>• 学习教程指导</li>
            </ul>
          </div>
          
          <div className="border-t pt-4">
            <h5 className="font-semibold text-gray-900 mb-2">技术支持</h5>
            <p className="text-sm text-gray-600">
              如有问题或建议，请联系开发团队。
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'api':
        return renderApiSettings();
      case 'general':
        return renderGeneralSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'data':
        return renderDataManagement();
      case 'about':
        return renderAbout();
      default:
        return renderApiSettings();
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">设置</h1>
        <p className="text-gray-600">配置应用程序的各项设置和偏好</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧导航 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <nav className="space-y-2">
              {sections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent size={18} />
                    <div>
                      <div className="font-medium">{section.label}</div>
                      <div className="text-xs text-gray-500">{section.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 右侧内容 */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;