import React, { useState, useEffect } from 'react';
import { BookOpen, Play, CheckCircle, Clock, Award, Star, BarChart3, TrendingUp } from 'lucide-react';
import { TUTORIAL_CONTENT } from '../data/tutorialContent';
import { learningProgress } from '../utils/learningProgress';
import TutorialReader from '../components/TutorialReader';

const TutorialPage = () => {
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [showReader, setShowReader] = useState(false);
  const [learningStats, setLearningStats] = useState(null);
  const [tutorialProgresses, setTutorialProgresses] = useState({});

  // 加载学习进度和统计
  useEffect(() => {
    const stats = learningProgress.getLearningStats();
    setLearningStats(stats);

    const allProgress = learningProgress.getAllTutorialProgress();
    setTutorialProgresses(allProgress);
  }, []);

  // 从教程内容获取教程列表
  const tutorials = Object.values(TUTORIAL_CONTENT).map(tutorial => ({
    ...tutorial,
    progress: tutorialProgresses[tutorial.id]?.progress || 0,
    status: tutorialProgresses[tutorial.id]?.status || 'not_started'
  }));

  const getLevelColor = (level) => {
    switch (level) {
      case '新手': return 'bg-green-100 text-green-800';
      case '初级': return 'bg-blue-100 text-blue-800';
      case '进阶': return 'bg-orange-100 text-orange-800';
      case '高级': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startTutorial = (tutorialId) => {
    setSelectedTutorial(tutorialId);
    setShowReader(true);
  };

  const closeTutorial = () => {
    setShowReader(false);
    setSelectedTutorial(null);
    
    // 重新加载进度数据
    const stats = learningProgress.getLearningStats();
    setLearningStats(stats);
    
    const allProgress = learningProgress.getAllTutorialProgress();
    setTutorialProgresses(allProgress);
  };

  // 显示教程阅读器
  if (showReader && selectedTutorial) {
    return <TutorialReader tutorialId={selectedTutorial} onClose={closeTutorial} />;
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <BookOpen className="mr-3 text-indigo-600" size={32} />
          AI绘画学习教程
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          从入门到精通的AI绘画学习路径，系统化掌握AI绘画技能，成为创作高手
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full">
            🎓 完整学习体系
          </span>
          <span className="text-sm bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full">
            📊 智能进度跟踪
          </span>
        </div>
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
          value={learningStats?.completedTutorials || 0}
          subtitle="个课程"
        />
        <StatCard
          icon={<Clock className="text-orange-600" size={24} />}
          title="学习时长"
          value={learningStats?.totalStudyTime || 0}
          subtitle="小时"
        />
        <StatCard
          icon={<Award className="text-yellow-600" size={24} />}
          title="完成率"
          value={learningStats?.completionRate || 0}
          subtitle="%"
        />
      </div>

      {/* 学习统计面板 */}
      {learningStats && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center">
              <BarChart3 className="mr-2" size={20} />
              学习概览
            </h3>
            <div className="flex items-center gap-4 text-sm text-blue-700">
              {learningStats.studyStreak > 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} />
                  <span>连续学习 {learningStats.studyStreak} 天</span>
                </div>
              )}
              {learningStats.averageQuizScore > 0 && (
                <div className="flex items-center gap-1">
                  <Award size={14} />
                  <span>平均分数 {learningStats.averageQuizScore} 分</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <div className="text-blue-600 font-medium mb-1">进行中的教程</div>
              <div className="text-2xl font-bold text-blue-800">{learningStats.inProgressTutorials}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <div className="text-blue-600 font-medium mb-1">已完成章节</div>
              <div className="text-2xl font-bold text-blue-800">{learningStats.totalChaptersCompleted}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <div className="text-blue-600 font-medium mb-1">本周学习</div>
              <div className="text-2xl font-bold text-blue-800">{learningStats.recentStudyTime}h</div>
            </div>
          </div>
        </div>
      )}

      {/* 教程列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tutorials.map(tutorial => (
          <TutorialCard
            key={tutorial.id}
            tutorial={tutorial}
            progress={tutorialProgresses[tutorial.id]}
            onStart={() => startTutorial(tutorial.id)}
            getLevelColor={getLevelColor}
          />
        ))}
      </div>
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
const TutorialCard = ({ tutorial, progress, onStart, getLevelColor }) => {
  const isCompleted = progress?.status === 'completed';
  const isInProgress = progress?.status === 'in_progress';
  const progressPercent = progress?.progress || 0;

  return (
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
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{tutorial.description}</p>
        </div>
      </div>

      {/* 课程信息 */}
      <div className="mb-4">
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span>📚 {tutorial.chapters?.length || 4} 个章节</span>
          <span>🎯 {tutorial.objectives?.length || 4} 个目标</span>
          {tutorial.tags && (
            <span>🏷️ {tutorial.tags.slice(0, 2).join(', ')}</span>
          )}
        </div>
      </div>

      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">学习进度</span>
          <span className="text-sm text-gray-500">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              isCompleted ? 'bg-green-500' : isInProgress ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 学习状态 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">已完成</span>
            </div>
          ) : isInProgress ? (
            <div className="flex items-center gap-1 text-blue-600">
              <Clock size={16} />
              <span className="text-sm font-medium">学习中</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-500">
              <BookOpen size={16} />
              <span className="text-sm font-medium">未开始</span>
            </div>
          )}
        </div>

        {progress?.totalStudyTime > 0 && (
          <div className="text-xs text-gray-500">
            已学习 {Math.round(progress.totalStudyTime / 60)} 分钟
          </div>
        )}
      </div>

      {/* 章节完成情况 */}
      {progress?.completedChapters?.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-blue-800 mb-1">章节进度</div>
          <div className="text-sm text-blue-600">
            已完成 {progress.completedChapters.length} / {tutorial.chapters?.length || 4} 章节
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={onStart}
          className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Play size={16} />
          {isCompleted ? '复习教程' : isInProgress ? '继续学习' : '开始学习'}
        </button>
        
        {isCompleted && (
          <button
            className="px-4 py-3 bg-green-100 text-green-600 rounded-lg border border-green-200"
            title="已完成"
          >
            <CheckCircle size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// TutorialModal 组件已删除，因为当前不使用

export default TutorialPage; 