import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen, Sparkles, Edit3, Heart } from 'lucide-react';

/**
 * 教程模态框组件 - 引导用户使用提示词库
 */
const TutorialModal = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "欢迎使用AI绘画提示词助手",
      icon: <Sparkles className="text-purple-600" size={32} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            这是一个专业的AI绘画提示词编辑器，帮助您创作出色的AI艺术作品。
          </p>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">主要功能：</h4>
            <ul className="text-purple-800 space-y-1 text-sm">
              <li>• 智能标签管理和组合</li>
              <li>• 实时中英文翻译</li>
              <li>• 权重和括号调节</li>
              <li>• 个人收藏夹管理</li>
              <li>• 丰富的标签数据库</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "提示词编辑区域",
      icon: <Edit3 className="text-blue-600" size={32} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            在顶部的文本框中输入您的提示词，支持中英文混合输入。
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">编辑功能：</h4>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• <strong>自动翻译：</strong> 中文会自动翻译为英文</li>
              <li>• <strong>标签解析：</strong> 自动分析为独立标签</li>
              <li>• <strong>权重调节：</strong> 使用 ±按钮调整重要性</li>
              <li>• <strong>括号强化：</strong> 增加标签强调程度</li>
              <li>• <strong>禁用功能：</strong> 临时关闭某些标签</li>
            </ul>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              💡 <strong>小贴士：</strong> 您可以直接在输入框中输入"美丽的女孩, 动漫风格"等中文描述
            </p>
          </div>
        </div>
      )
    },
    {
      title: "标签库使用",
      icon: <BookOpen className="text-green-600" size={32} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            右侧的标签库包含了丰富的分类标签，点击即可添加到提示词中。
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">标签分类：</h4>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• <strong>人物风格：</strong> 角色特征、表情、姿态</li>
              <li>• <strong>艺术风格：</strong> 绘画风格、技法、流派</li>
              <li>• <strong>场景环境：</strong> 背景、氛围、光影</li>
              <li>• <strong>质量控制：</strong> 分辨率、细节、效果</li>
              <li>• <strong>色彩构图：</strong> 配色、布局、视角</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-700 text-sm">
              🔍 <strong>搜索功能：</strong> 使用顶部搜索框快速找到所需标签
            </p>
          </div>
        </div>
      )
    },
    {
      title: "收藏和自定义",
      icon: <Heart className="text-red-600" size={32} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            您可以收藏常用标签，并创建自己的标签库。
          </p>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">个性化功能：</h4>
            <ul className="text-red-800 space-y-1 text-sm">
              <li>• <strong>个人收藏：</strong> 收藏常用标签便于快速访问</li>
              <li>• <strong>自定义库：</strong> 创建专属分类和标签</li>
              <li>• <strong>批量管理：</strong> 导入导出标签数据</li>
              <li>• <strong>使用统计：</strong> 查看标签使用频率</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white p-3 border border-red-200 rounded-lg">
              <div className="text-red-600 font-medium text-sm mb-1">库模式切换</div>
              <div className="text-xs text-gray-600">在默认库和自定义库间切换</div>
            </div>
            <div className="bg-white p-3 border border-red-200 rounded-lg">
              <div className="text-red-600 font-medium text-sm mb-1">翻译设置</div>
              <div className="text-xs text-gray-600">配置翻译引擎和目标语言</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "高级技巧",
      icon: <Sparkles className="text-indigo-600" size={32} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            掌握这些技巧，让您的AI绘画更加精准和高效。
          </p>
          <div className="space-y-3">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2">权重控制：</h4>
              <ul className="text-indigo-800 space-y-1 text-sm">
                <li>• <code className="bg-white px-1 rounded">tag:1.2</code> - 提高权重20%</li>
                <li>• <code className="bg-white px-1 rounded">tag:0.8</code> - 降低权重20%</li>
                <li>• <code className="bg-white px-1 rounded">(tag)</code> - 轻微强调</li>
                <li>• <code className="bg-white px-1 rounded">((tag))</code> - 中等强调</li>
                <li>• <code className="bg-white px-1 rounded">[tag]</code> - 降低影响</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2">组合策略：</h4>
              <ul className="text-yellow-800 space-y-1 text-sm">
                <li>• 先描述主体，再添加风格</li>
                <li>• 质量标签放在开头或结尾</li>
                <li>• 负面提示词用于排除不需要的元素</li>
                <li>• 保持提示词简洁，避免冲突</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, tutorialSteps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {currentTutorial.icon}
            <h2 className="text-xl font-bold text-gray-900">
              {currentTutorial.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 进度指示器 */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              步骤 {currentStep + 1} / {tutorialSteps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-96">
          {currentTutorial.content}
        </div>

        {/* 底部导航 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft size={20} />
            上一步
          </button>

          <div className="flex gap-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-blue-600' 
                    : index < currentStep 
                      ? 'bg-blue-300' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < tutorialSteps.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              下一步
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              开始使用
              <Sparkles size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialModal; 