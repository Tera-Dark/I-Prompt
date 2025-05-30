import React from 'react';
import { Settings, X, CheckCircle, XCircle, TestTube } from 'lucide-react';

/**
 * 翻译引擎设置组件
 */
const TranslatorSettings = ({ 
  availableTranslators, 
  selectedTranslator, 
  setSelectedTranslator, 
  targetLanguage,
  setTargetLanguage,
  translatorStatus, 
  onTestTranslator, 
  onClose 
}) => {
  // 按类型分组翻译引擎
  const groupedTranslators = Object.entries(availableTranslators).reduce((groups, [key, translator]) => {
    let category = '国际引擎';
    
    // 判断是否为国产引擎
    if (['baidu_web', 'alibaba_web', 'tencent_web', 'youdao_web', 'sogou_web', 'caiyun_web', 'volcengine_web', 'iflytek_web'].includes(key)) {
      category = '国产引擎';
    }
    
    if (!groups[category]) {
      groups[category] = [];
    }
    
    groups[category].push([key, translator]);
    return groups;
  }, {});

  // 点击背景关闭
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="text-blue-600 mr-2" size={20} />
              翻译引擎设置
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2">
                共{Object.keys(availableTranslators).length}个引擎
              </span>
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* 滚动容器 */}
          <div className="max-h-[70vh] overflow-y-auto">
            {/* 目标语言选择 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">目标语言</h4>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { code: 'en', name: '🇺🇸 英文', flag: '🇺🇸' },
                  { code: 'zh', name: '🇨🇳 中文', flag: '🇨🇳' },
                  { code: 'ja', name: '🇯🇵 日文', flag: '🇯🇵' },
                  { code: 'ko', name: '🇰🇷 韩文', flag: '🇰🇷' },
                  { code: 'fr', name: '🇫🇷 法文', flag: '🇫🇷' },
                  { code: 'de', name: '🇩🇪 德文', flag: '🇩🇪' },
                  { code: 'es', name: '🇪🇸 西班牙文', flag: '🇪🇸' },
                  { code: 'ru', name: '🇷🇺 俄文', flag: '🇷🇺' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setTargetLanguage(lang.code)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      targetLanguage === lang.code
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 当前选中引擎信息 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <CheckCircle className="text-blue-600 mr-2" size={16} />
                当前配置
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><span className="font-medium">翻译引擎:</span> {availableTranslators[selectedTranslator]?.name || '未选择'}</p>
                <p><span className="font-medium">目标语言:</span> 
                  {targetLanguage === 'en' ? '🇺🇸 英文' :
                   targetLanguage === 'zh' ? '🇨🇳 中文' :
                   targetLanguage === 'ja' ? '🇯🇵 日文' :
                   targetLanguage === 'ko' ? '🇰🇷 韩文' :
                   targetLanguage === 'fr' ? '🇫🇷 法文' :
                   targetLanguage === 'de' ? '🇩🇪 德文' :
                   targetLanguage === 'es' ? '🇪🇸 西班牙文' :
                   targetLanguage === 'ru' ? '🇷🇺 俄文' : '未知'}
                </p>
                <p><span className="font-medium">描述:</span> {availableTranslators[selectedTranslator]?.description || '无描述'}</p>
                <p><span className="font-medium">支持语言:</span> {availableTranslators[selectedTranslator]?.languages || 0} 种</p>
                <p><span className="font-medium">状态:</span> 
                  {translatorStatus[selectedTranslator] === 'available' ? '✅可用' :
                   translatorStatus[selectedTranslator] === 'unavailable' ? '❌不可用' :
                   translatorStatus[selectedTranslator] === 'testing' ? '🔄 测试中' :
                   '❓未测试'}
                </p>
                {availableTranslators[selectedTranslator]?.specialty && (
                  <p><span className="font-medium">特色:</span> {availableTranslators[selectedTranslator].specialty.join(', ')}</p>
                )}
              </div>
            </div>

            {/* 按类别显示翻译引擎 */}
            {Object.entries(groupedTranslators).map(([category, translators]) => (
              <div key={category} className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  {category === '国产引擎' ? (
                    <span className="text-red-600 mr-2">🇨🇳</span>
                  ) : (
                    <span className="text-blue-600 mr-2">🌍</span>
                  )}
                  {category}
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2">
                    {translators.length}个
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {translators.map(([key, translator]) => (
                    <div 
                      key={key}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTranslator === key 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedTranslator(key)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 text-sm">{translator.name}</h5>
                        <div className="flex items-center gap-1">
                          {translatorStatus[key] === 'testing' && (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          )}
                          {translatorStatus[key] === 'available' && (
                            <CheckCircle className="text-green-600" size={14} />
                          )}
                          {translatorStatus[key] === 'unavailable' && (
                            <XCircle className="text-red-600" size={14} />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTestTranslator(key);
                            }}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                            title="测试引擎"
                          >
                            <TestTube size={12} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{translator.description}</p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full ${
                            translator.status === 'stable' ? 'bg-green-100 text-green-700' :
                            translator.status === 'premium' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {translator.status === 'stable' ? '稳定' :
                             translator.status === 'premium' ? '高级' : 
                             translator.status === 'experimental' ? '实验' : '未知'}
                          </span>
                          
                          <span className="text-gray-500">
                            {translator.languages}种语言
                          </span>
                        </div>
                        
                        {selectedTranslator === key && (
                          <span className="text-blue-600 font-medium">✓已选择</span>
                        )}
                      </div>
                      
                      {/* 特色功能标签 */}
                      {translator.specialty && translator.specialty.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {translator.specialty.slice(0, 2).map((spec, index) => (
                            <span 
                              key={index}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                          {translator.specialty.length > 2 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              +{translator.specialty.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* 重新测试所有引擎按钮 */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  Object.keys(availableTranslators).forEach(key => {
                    onTestTranslator(key);
                  });
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <TestTube className="mr-2" size={16} />
                重新测试所有引擎
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslatorSettings; 