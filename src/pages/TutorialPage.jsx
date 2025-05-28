import React, { useState } from 'react';
import { BookOpen, Play, CheckCircle, Clock, Award, Star } from 'lucide-react';

const TutorialPage = () => {
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [completedTutorials, setCompletedTutorials] = useState(['tutorial-1']);

  const tutorials = [
    {
      id: 'tutorial-1',
      title: 'AI绘画入门基础',
      description: '了解AI绘画的基本概念和工具，掌握基础操作和核心原理。本教程将带您从零开始，了解AI绘画的基本原理，学习如何使用主流的AI绘画工具，掌握基础的界面操作，并完成您的第一张AI作品。',
      level: '新手',
      duration: '30分钟',
      progress: 100,
      rating: 4.8,
      content: [
        { type: 'section', title: '什么是AI绘画？', duration: '5分钟', description: '介绍AI绘画的基本概念、发展历程和应用场景' },
        { type: 'section', title: '主流AI绘画工具介绍', duration: '10分钟', description: '详细介绍Stable Diffusion、Midjourney等主流工具的特点和使用场景' },
        { type: 'section', title: '基础界面操作', duration: '8分钟', description: '学习工具界面的基本操作，包括参数设置、模型选择等' },
        { type: 'section', title: '第一张AI作品生成', duration: '7分钟', description: '实际操作生成您的第一张AI绘画作品，体验完整的创作流程' }
      ]
    },
    {
      id: 'tutorial-2',
      title: '提示词编写技巧',
      description: '掌握高效提示词写作方法，学会描述想要的画面效果。本教程深入讲解提示词的编写技巧，包括基础语法、权重控制、风格描述等核心技能，帮助您写出更精准、更有效的提示词。',
      level: '初级',
      duration: '45分钟',
      progress: 60,
      rating: 4.9,
      content: [
        { type: 'section', title: '提示词基础语法', duration: '10分钟', description: '学习提示词的基本语法规则，包括关键词排列、标点符号使用等' },
        { type: 'section', title: '关键词权重控制', duration: '12分钟', description: '掌握如何通过权重控制来强调或弱化特定元素' },
        { type: 'section', title: '风格描述技巧', duration: '15分钟', description: '学习如何准确描述艺术风格、色彩搭配和画面氛围' },
        { type: 'section', title: '实战练习', duration: '8分钟', description: '通过实际案例练习，巩固所学的提示词编写技巧' }
      ]
    },
    {
      id: 'tutorial-3',
      title: '高级构图方法',
      description: '学习专业构图技巧，提升作品的视觉冲击力和艺术性。本教程将深入探讨构图的基本原理，学习黄金比例、三分法等经典构图方法，掌握色彩搭配理论，通过实际案例分析提升您的艺术审美。',
      level: '进阶',
      duration: '60分钟',
      progress: 0,
      rating: 4.7,
      content: [
        { type: 'section', title: '构图基本原理', duration: '15分钟', description: '了解构图的基本概念，学习平衡、对比、节奏等构图要素' },
        { type: 'section', title: '黄金比例和三分法', duration: '18分钟', description: '掌握经典的构图法则，学会运用黄金比例和三分法创造和谐的画面' },
        { type: 'section', title: '色彩搭配理论', duration: '20分钟', description: '学习色彩理论基础，掌握冷暖色调搭配、对比色运用等技巧' },
        { type: 'section', title: '案例分析', duration: '7分钟', description: '通过经典艺术作品分析，理解构图和色彩在实际作品中的运用' }
      ]
    },
    {
      id: 'tutorial-4',
      title: '风格控制技术',
      description: '控制图片风格的高级技巧，实现特定艺术风格的精准表达。本教程将教您如何精确控制AI生成图像的艺术风格，包括各种艺术风格的分类、LoRA模型的使用方法，以及如何混合多种风格创造独特效果。',
      level: '进阶',
      duration: '40分钟',
      progress: 0,
      rating: 4.6,
      content: [
        { type: 'section', title: '艺术风格分类', duration: '8分钟', description: '了解不同艺术风格的特点，包括写实、动漫、油画、水彩等风格的区别' },
        { type: 'section', title: 'LoRA模型使用', duration: '15分钟', description: '学习如何使用LoRA模型来实现特定风格，包括模型选择和参数调节' },
        { type: 'section', title: '混合风格技巧', duration: '12分钟', description: '掌握多种风格混合的技巧，创造出独特的艺术效果' },
        { type: 'section', title: '实用案例', duration: '5分钟', description: '通过实际案例演示风格控制的应用，展示不同风格的效果对比' }
      ]
    },
    {
      id: 'tutorial-5',
      title: '参数调优指南',
      description: '深入理解生成参数，掌握各种参数对图像质量的影响。本教程将详细讲解AI绘画中的各种技术参数，包括采样器的选择、CFG Scale的优化、生成步数的设置等，帮助您精确控制图像生成质量。',
      level: '高级',
      duration: '90分钟',
      progress: 30,
      rating: 4.8,
      content: [
        { type: 'section', title: '采样器详解', duration: '25分钟', description: '深入了解不同采样器的工作原理和适用场景，学会选择最适合的采样器' },
        { type: 'section', title: 'CFG Scale优化', duration: '20分钟', description: '掌握CFG Scale参数的作用机制，学会调节以获得最佳的图像质量' },
        { type: 'section', title: '步数与质量关系', duration: '25分钟', description: '理解生成步数对图像质量的影响，找到效率和质量的最佳平衡点' },
        { type: 'section', title: '高级参数调优', duration: '20分钟', description: '学习其他高级参数的调节技巧，包括种子值、尺寸比例等的优化方法' }
      ]
    },
    {
      id: 'tutorial-6',
      title: '工作流程优化',
      description: '提高创作效率的工作流，从构思到成品的完整流程。本教程将教您如何建立高效的AI绘画工作流程，包括创作前的规划、批量生成的技巧、后期处理的方法，以及作品的管理和整理。',
      level: '高级',
      duration: '75分钟',
      progress: 0,
      rating: 4.5,
      content: [
        { type: 'section', title: '创作流程规划', duration: '20分钟', description: '学习如何制定完整的创作计划，从灵感收集到最终输出的系统化流程' },
        { type: 'section', title: '批量生成技巧', duration: '25分钟', description: '掌握批量生成的方法和技巧，提高创作效率和作品产出质量' },
        { type: 'section', title: '后期处理方法', duration: '20分钟', description: '学习AI生成图像的后期处理技巧，包括修图、调色、合成等方法' },
        { type: 'section', title: '作品管理', duration: '10分钟', description: '建立有效的作品管理系统，包括分类、标签、版本控制等管理方法' }
      ]
    }
  ];

  const getLevelColor = (level) => {
    switch (level) {
      case '新手': return 'bg-green-100 text-green-800';
      case '初级': return 'bg-blue-100 text-blue-800';
      case '进阶': return 'bg-orange-100 text-orange-800';
      case '高级': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleTutorialCompletion = (tutorialId) => {
    setCompletedTutorials(prev => 
      prev.includes(tutorialId)
        ? prev.filter(id => id !== tutorialId)
        : [...prev, tutorialId]
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <BookOpen className="mr-3 text-indigo-600" size={32} />
          学习教程
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          从入门到精通的AI绘画学习路径，系统化掌握AI绘画技能，成为创作高手
        </p>
      </div>

      {/* 学习进度统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<BookOpen className="text-indigo-600" size={24} />}
          title="课程总数"
          value={tutorials.length}
          subtitle="个教程"
        />
        <StatCard
          icon={<CheckCircle className="text-green-600" size={24} />}
          title="已完成"
          value={completedTutorials.length}
          subtitle="个课程"
        />
        <StatCard
          icon={<Clock className="text-orange-600" size={24} />}
          title="学习时长"
          value="5.5"
          subtitle="小时"
        />
        <StatCard
          icon={<Award className="text-yellow-600" size={24} />}
          title="完成率"
          value={Math.round((completedTutorials.length / tutorials.length) * 100)}
          subtitle="%"
        />
      </div>

      {/* 教程列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tutorials.map(tutorial => (
          <TutorialCard
            key={tutorial.id}
            tutorial={tutorial}
            isCompleted={completedTutorials.includes(tutorial.id)}
            onToggleComplete={() => toggleTutorialCompletion(tutorial.id)}
            onSelect={() => setSelectedTutorial(tutorial)}
            getLevelColor={getLevelColor}
          />
        ))}
      </div>

      {/* 教程详情模态框 */}
      {selectedTutorial && (
        <TutorialModal
          tutorial={selectedTutorial}
          onClose={() => setSelectedTutorial(null)}
          isCompleted={completedTutorials.includes(selectedTutorial.id)}
          onToggleComplete={() => toggleTutorialCompletion(selectedTutorial.id)}
          getLevelColor={getLevelColor}
        />
      )}
    </div>
  );
};

/**
 * 统计卡片组件
 */
const StatCard = ({ icon, title, value, subtitle }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className="opacity-80">{icon}</div>
    </div>
  </div>
);

/**
 * 教程卡片组件
 */
const TutorialCard = ({ tutorial, isCompleted, onToggleComplete, onSelect, getLevelColor }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className={`px-3 py-1 text-xs rounded-full ${getLevelColor(tutorial.level)}`}>
            {tutorial.level}
          </span>
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-gray-500" />
            <span className="text-sm text-gray-500">{tutorial.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-500" />
            <span className="text-sm text-gray-600">{tutorial.rating}</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{tutorial.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{tutorial.description}</p>
      </div>
    </div>

    {/* 进度条 */}
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">学习进度</span>
        <span className="text-sm text-gray-500">{tutorial.progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all ${
            tutorial.progress === 100 ? 'bg-green-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${tutorial.progress}%` }}
        />
      </div>
    </div>

    {/* 完成状态 */}
    <div className="flex items-center justify-end mb-4">
      {isCompleted && (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">已完成</span>
        </div>
      )}
    </div>

    {/* 操作按钮 */}
    <div className="flex gap-2">
      <button
        onClick={onSelect}
        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
      >
        <Play size={16} />
        {tutorial.progress > 0 ? '继续学习' : '开始学习'}
      </button>
      <button
        onClick={onToggleComplete}
        className={`px-4 py-2 rounded-lg border transition-colors ${
          isCompleted
            ? 'bg-green-100 text-green-600 border-green-200'
            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
        }`}
        title={isCompleted ? '标记为未完成' : '标记为已完成'}
      >
        <CheckCircle size={16} />
      </button>
    </div>
  </div>
);

/**
 * 教程详情模态框
 */
const TutorialModal = ({ tutorial, onClose, isCompleted, onToggleComplete, getLevelColor }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 text-xs rounded-full ${getLevelColor(tutorial.level)}`}>
                {tutorial.level}
              </span>
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-gray-500" />
                <span className="text-sm text-gray-500">{tutorial.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500" />
                <span className="text-sm text-gray-600">{tutorial.rating}</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{tutorial.title}</h2>
            <p className="text-gray-600">{tutorial.description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* 课程大纲 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">课程大纲</h3>
          <div className="space-y-3">
            {tutorial.content.map((section, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{section.title}</span>
                  </div>
                  <span className="text-sm text-gray-500">{section.duration}</span>
                </div>
                {section.description && (
                  <p className="text-sm text-gray-600 ml-11">{section.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 课程评分 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="font-medium text-blue-900 mb-2">课程评分</p>
              <div className="flex items-center gap-1 justify-center">
                <Star size={20} className="text-yellow-500 fill-current" />
                <span className="text-xl font-bold text-blue-800">{tutorial.rating}</span>
                <span className="text-sm text-blue-600 ml-1">/ 5.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
            <Play size={20} />
            {tutorial.progress > 0 ? '继续学习' : '开始学习'}
          </button>
          <button
            onClick={onToggleComplete}
            className={`px-6 py-3 rounded-lg border transition-colors flex items-center gap-2 ${
              isCompleted
                ? 'bg-green-100 text-green-600 border-green-200'
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <CheckCircle size={20} />
            {isCompleted ? '已完成' : '标记完成'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default TutorialPage; 