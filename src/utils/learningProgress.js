/**
 * 学习进度管理工具
 * 用于保存和跟踪用户的学习进度
 */

const STORAGE_KEYS = {
  TUTORIAL_PROGRESS: 'i_prompt_tutorial_progress',
  CHAPTER_COMPLETION: 'i_prompt_chapter_completion',
  QUIZ_RESULTS: 'i_prompt_quiz_results',
  LEARNING_STATS: 'i_prompt_learning_stats',
  STUDY_TIME: 'i_prompt_study_time'
};

class LearningProgressManager {
  constructor() {
    this.isSupported = this.checkStorageSupport();
  }

  /**
   * 检查本地存储支持
   */
  checkStorageSupport() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('LocalStorage不支持，学习进度不会保存');
      return false;
    }
  }

  /**
   * 安全的JSON序列化
   */
  safeStringify(data) {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.error('JSON序列化失败:', error);
      return null;
    }
  }

  /**
   * 安全的JSON反序列化
   */
  safeParse(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('JSON解析失败:', error);
      return null;
    }
  }

  /**
   * 获取教程进度
   */
  getTutorialProgress(tutorialId) {
    if (!this.isSupported) return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TUTORIAL_PROGRESS);
      const allProgress = stored ? this.safeParse(stored) || {} : {};
      
      return allProgress[tutorialId] || {
        id: tutorialId,
        status: 'not_started', // not_started, in_progress, completed
        progress: 0,
        currentChapter: null,
        completedChapters: [],
        startTime: null,
        lastAccessTime: null,
        totalStudyTime: 0,
        quizScores: {}
      };
    } catch (error) {
      console.error('获取教程进度失败:', error);
      return null;
    }
  }

  /**
   * 更新教程进度
   */
  updateTutorialProgress(tutorialId, progressData) {
    if (!this.isSupported) return false;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TUTORIAL_PROGRESS);
      const allProgress = stored ? this.safeParse(stored) || {} : {};
      
      const currentProgress = allProgress[tutorialId] || this.getTutorialProgress(tutorialId);
      const updatedProgress = {
        ...currentProgress,
        ...progressData,
        lastAccessTime: new Date().toISOString()
      };

      // 如果是第一次开始学习
      if (!currentProgress.startTime && progressData.status === 'in_progress') {
        updatedProgress.startTime = new Date().toISOString();
      }

      allProgress[tutorialId] = updatedProgress;
      
      localStorage.setItem(STORAGE_KEYS.TUTORIAL_PROGRESS, this.safeStringify(allProgress));
      
      // 更新统计信息
      this.updateLearningStats();
      
      console.log('✅ 教程进度已更新:', tutorialId);
      return true;
    } catch (error) {
      console.error('更新教程进度失败:', error);
      return false;
    }
  }

  /**
   * 标记章节完成
   */
  completeChapter(tutorialId, chapterId, studyTime = 0) {
    const progress = this.getTutorialProgress(tutorialId);
    
    if (!progress.completedChapters.includes(chapterId)) {
      progress.completedChapters.push(chapterId);
    }
    
    progress.totalStudyTime += studyTime;
    progress.lastAccessTime = new Date().toISOString();
    
    // 计算完成百分比
    const totalChapters = this.getTotalChapters(tutorialId);
    progress.progress = Math.round((progress.completedChapters.length / totalChapters) * 100);
    
    // 如果全部章节完成，标记教程完成
    if (progress.completedChapters.length >= totalChapters) {
      progress.status = 'completed';
    } else {
      progress.status = 'in_progress';
    }

    return this.updateTutorialProgress(tutorialId, progress);
  }

  /**
   * 记录章节学习时间
   */
  recordStudyTime(tutorialId, chapterId, timeSpent) {
    const sessionData = {
      tutorialId,
      chapterId,
      date: new Date().toISOString().split('T')[0],
      timeSpent,
      timestamp: Date.now()
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDY_TIME);
      const studyTimes = stored ? this.safeParse(stored) || [] : [];
      
      studyTimes.push(sessionData);
      
      // 保持最近100条记录
      if (studyTimes.length > 100) {
        studyTimes.splice(0, studyTimes.length - 100);
      }
      
      localStorage.setItem(STORAGE_KEYS.STUDY_TIME, this.safeStringify(studyTimes));
      
      // 更新教程总学习时间
      const progress = this.getTutorialProgress(tutorialId);
      progress.totalStudyTime = (progress.totalStudyTime || 0) + timeSpent;
      this.updateTutorialProgress(tutorialId, progress);
      
      return true;
    } catch (error) {
      console.error('记录学习时间失败:', error);
      return false;
    }
  }

  /**
   * 保存测验结果
   */
  saveQuizResult(tutorialId, chapterId, quizResults) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
      const allResults = stored ? this.safeParse(stored) || {} : {};
      
      if (!allResults[tutorialId]) {
        allResults[tutorialId] = {};
      }
      
      allResults[tutorialId][chapterId] = {
        score: quizResults.score,
        totalQuestions: quizResults.totalQuestions,
        correctAnswers: quizResults.correctAnswers,
        answers: quizResults.answers,
        timeSpent: quizResults.timeSpent,
        completedAt: new Date().toISOString(),
        attempts: (allResults[tutorialId][chapterId]?.attempts || 0) + 1
      };
      
      localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, this.safeStringify(allResults));
      
      // 更新教程进度中的测验分数
      const progress = this.getTutorialProgress(tutorialId);
      if (!progress.quizScores) progress.quizScores = {};
      progress.quizScores[chapterId] = quizResults.score;
      this.updateTutorialProgress(tutorialId, progress);
      
      console.log('✅ 测验结果已保存:', tutorialId, chapterId);
      return true;
    } catch (error) {
      console.error('保存测验结果失败:', error);
      return false;
    }
  }

  /**
   * 获取测验结果
   */
  getQuizResult(tutorialId, chapterId) {
    if (!this.isSupported) return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
      const allResults = stored ? this.safeParse(stored) || {} : {};
      
      return allResults[tutorialId]?.[chapterId] || null;
    } catch (error) {
      console.error('获取测验结果失败:', error);
      return null;
    }
  }

  /**
   * 获取所有教程进度
   */
  getAllTutorialProgress() {
    if (!this.isSupported) return {};

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TUTORIAL_PROGRESS);
      return stored ? this.safeParse(stored) || {} : {};
    } catch (error) {
      console.error('获取所有教程进度失败:', error);
      return {};
    }
  }

  /**
   * 获取学习统计信息
   */
  getLearningStats() {
    if (!this.isSupported) return null;

    try {
      const allProgress = this.getAllTutorialProgress();
      const studyTimeData = localStorage.getItem(STORAGE_KEYS.STUDY_TIME);
      const studyTimes = studyTimeData ? this.safeParse(studyTimeData) || [] : [];
      
      // 基础统计
      const totalTutorials = Object.keys(allProgress).length;
      const completedTutorials = Object.values(allProgress).filter(p => p.status === 'completed').length;
      const inProgressTutorials = Object.values(allProgress).filter(p => p.status === 'in_progress').length;
      
      // 总学习时间（分钟）
      const totalStudyTime = Object.values(allProgress).reduce((sum, p) => sum + (p.totalStudyTime || 0), 0);
      
      // 章节完成统计
      const totalChaptersCompleted = Object.values(allProgress).reduce((sum, p) => sum + (p.completedChapters?.length || 0), 0);
      
      // 最近7天学习时间
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentStudyTime = studyTimes
        .filter(s => s.timestamp > sevenDaysAgo)
        .reduce((sum, s) => sum + s.timeSpent, 0);
      
      // 平均测验分数
      const quizResults = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
      const allQuizzes = quizResults ? this.safeParse(quizResults) || {} : {};
      let totalQuizScore = 0;
      let totalQuizCount = 0;
      
      Object.values(allQuizzes).forEach(tutorialQuizzes => {
        Object.values(tutorialQuizzes).forEach(quiz => {
          totalQuizScore += quiz.score;
          totalQuizCount++;
        });
      });
      
      const averageQuizScore = totalQuizCount > 0 ? Math.round(totalQuizScore / totalQuizCount) : 0;
      
      return {
        totalTutorials,
        completedTutorials,
        inProgressTutorials,
        completionRate: totalTutorials > 0 ? Math.round((completedTutorials / totalTutorials) * 100) : 0,
        totalStudyTime: Math.round(totalStudyTime / 60), // 转换为小时
        totalChaptersCompleted,
        recentStudyTime: Math.round(recentStudyTime / 60), // 转换为小时
        averageQuizScore,
        lastStudyDate: studyTimes.length > 0 ? studyTimes[studyTimes.length - 1].date : null,
        studyStreak: this.calculateStudyStreak(studyTimes)
      };
    } catch (error) {
      console.error('获取学习统计失败:', error);
      return null;
    }
  }

  /**
   * 计算连续学习天数
   */
  calculateStudyStreak(studyTimes) {
    if (!studyTimes || studyTimes.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const studyDates = [...new Set(studyTimes.map(s => s.date))].sort().reverse();
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (const studyDate of studyDates) {
      const studyDateObj = new Date(studyDate);
      const dayDiff = Math.floor((currentDate - studyDateObj) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === streak) {
        streak++;
        currentDate = studyDateObj;
      } else if (dayDiff === streak + 1) {
        streak++;
        currentDate = studyDateObj;
      } else {
        break;
      }
    }
    
    return streak;
  }

  /**
   * 更新学习统计
   */
  updateLearningStats() {
    const stats = this.getLearningStats();
    if (stats) {
      localStorage.setItem(STORAGE_KEYS.LEARNING_STATS, this.safeStringify({
        ...stats,
        lastUpdated: new Date().toISOString()
      }));
    }
  }

  /**
   * 获取教程总章节数
   */
  getTotalChapters(tutorialId) {
    // 这里应该从教程数据中获取，暂时使用固定值
    const chapterCounts = {
      'tutorial-1': 4,
      'tutorial-2': 4,
      'tutorial-3': 4,
      'tutorial-4': 4,
      'tutorial-5': 4,
      'tutorial-6': 4
    };
    return chapterCounts[tutorialId] || 4;
  }

  /**
   * 重置教程进度
   */
  resetTutorialProgress(tutorialId) {
    if (!this.isSupported) return false;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TUTORIAL_PROGRESS);
      const allProgress = stored ? this.safeParse(stored) || {} : {};
      
      delete allProgress[tutorialId];
      
      localStorage.setItem(STORAGE_KEYS.TUTORIAL_PROGRESS, this.safeStringify(allProgress));
      
      // 同时清除相关的测验结果
      const quizStored = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
      const allQuizzes = quizStored ? this.safeParse(quizStored) || {} : {};
      delete allQuizzes[tutorialId];
      localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, this.safeStringify(allQuizzes));
      
      console.log('✅ 教程进度已重置:', tutorialId);
      return true;
    } catch (error) {
      console.error('重置教程进度失败:', error);
      return false;
    }
  }

  /**
   * 清除所有学习数据
   */
  clearAllLearningData() {
    if (!this.isSupported) return false;

    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('✅ 所有学习数据已清除');
      return true;
    } catch (error) {
      console.error('清除学习数据失败:', error);
      return false;
    }
  }

  /**
   * 导出学习数据
   */
  exportLearningData() {
    if (!this.isSupported) return null;

    try {
      const data = {
        tutorialProgress: this.getAllTutorialProgress(),
        quizResults: JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS) || '{}'),
        studyTimes: JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDY_TIME) || '[]'),
        learningStats: this.getLearningStats(),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      return data;
    } catch (error) {
      console.error('导出学习数据失败:', error);
      return null;
    }
  }

  /**
   * 导入学习数据
   */
  importLearningData(data) {
    if (!this.isSupported || !data) return false;

    try {
      if (data.tutorialProgress) {
        localStorage.setItem(STORAGE_KEYS.TUTORIAL_PROGRESS, this.safeStringify(data.tutorialProgress));
      }
      if (data.quizResults) {
        localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, this.safeStringify(data.quizResults));
      }
      if (data.studyTimes) {
        localStorage.setItem(STORAGE_KEYS.STUDY_TIME, this.safeStringify(data.studyTimes));
      }

      this.updateLearningStats();
      console.log('✅ 学习数据导入成功');
      return true;
    } catch (error) {
      console.error('导入学习数据失败:', error);
      return false;
    }
  }
}

// 创建全局实例
export const learningProgress = new LearningProgressManager();

// 导出常用方法
export const {
  getTutorialProgress,
  updateTutorialProgress,
  completeChapter,
  recordStudyTime,
  saveQuizResult,
  getQuizResult,
  getAllTutorialProgress,
  getLearningStats,
  resetTutorialProgress,
  clearAllLearningData,
  exportLearningData,
  importLearningData
} = learningProgress;

export default learningProgress; 