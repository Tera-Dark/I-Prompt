import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Clock, CheckCircle, ArrowLeft, ArrowRight, 
  Award, Target, 
  FileText, HelpCircle, Lightbulb, ExternalLink
} from 'lucide-react';
import { TUTORIAL_CONTENT } from '../data/tutorialContent';
import { learningProgress } from '../utils/learningProgress';

/**
 * 教程阅读器组件
 * 显示完整的教程内容，支持章节导航和进度跟踪
 */
const TutorialReader = ({ tutorialId, onClose }) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [progress, setProgress] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const tutorial = TUTORIAL_CONTENT[tutorialId];
  
  // 初始加载effect - 只在组件挂载时执行
  useEffect(() => {
    if (!tutorial) return;

    // 加载学习进度
    const tutorialProgress = learningProgress.getTutorialProgress(tutorialId);
    setProgress(tutorialProgress);

    // 如果有当前章节，跳转到该章节
    if (tutorialProgress.currentChapter) {
      const chapterIndex = tutorial.chapters.findIndex(
        ch => ch.id === tutorialProgress.currentChapter
      );
      if (chapterIndex >= 0) {
        setCurrentChapter(chapterIndex);
      }
    }

    // 标记开始学习
    learningProgress.updateTutorialProgress(tutorialId, {
      status: 'in_progress',
      currentChapter: tutorial.chapters[0]?.id // 初始设为第一章
    });

    setStartTime(Date.now());
  }, [tutorialId, tutorial]); // 移除currentChapter依赖

  // 阅读时间计时器
  useEffect(() => {
    const interval = setInterval(() => {
      setReadingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 章节切换时保存进度 - 仅在章节变化时执行
  useEffect(() => {
    if (!tutorial || !tutorial.chapters[currentChapter]) return;

    // 更新当前章节进度
    learningProgress.updateTutorialProgress(tutorialId, {
      currentChapter: tutorial.chapters[currentChapter].id
    });

    // 重置开始时间用于新章节
    setStartTime(Date.now());
  }, [currentChapter, tutorialId, tutorial]); // 移除startTime依赖避免循环

  if (!tutorial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">教程内容加载失败</p>
          <button onClick={onClose} className="mt-4 text-blue-600 hover:text-blue-800">
            返回教程列表
          </button>
        </div>
      </div>
    );
  }

  const currentChapterData = tutorial.chapters[currentChapter];
  const isLastChapter = currentChapter >= tutorial.chapters.length - 1;
  const isFirstChapter = currentChapter === 0;

  // 处理章节导航
  const goToNextChapter = () => {
    // 记录当前章节学习时间
    const chapterTime = Math.floor((Date.now() - startTime) / 1000);
    if (chapterTime > 5) { // 至少学习5秒才记录
      learningProgress.recordStudyTime(tutorialId, currentChapterData.id, chapterTime);
    }
    
    // 标记当前章节完成
    learningProgress.completeChapter(tutorialId, currentChapterData.id, chapterTime);
    
    if (!isLastChapter) {
      // 切换到下一章节
      setCurrentChapter(prev => prev + 1);
      setShowQuiz(false);
      setQuizAnswers({});
      setQuizSubmitted(false);
    } else {
      // 最后一章 - 完成整个教程
      learningProgress.updateTutorialProgress(tutorialId, {
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString()
      });
      
      // 显示完成模态框
      setShowCompletionModal(true);
    }
  };

  const goToPrevChapter = () => {
    if (!isFirstChapter) {
      // 记录当前章节学习时间
      const chapterTime = Math.floor((Date.now() - startTime) / 1000);
      if (chapterTime > 5) { // 至少学习5秒才记录
        learningProgress.recordStudyTime(tutorialId, currentChapterData.id, chapterTime);
      }
      
      // 切换到上一章节
      setCurrentChapter(prev => prev - 1);
      setShowQuiz(false);
      setQuizAnswers({});
      setQuizSubmitted(false);
    }
  };

  // 处理测验
  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const submitQuiz = () => {
    const quiz = currentChapterData.content.quiz;
    if (!quiz) return;

    let correctCount = 0;
    const results = {};

    quiz.forEach((question, index) => {
      const userAnswer = quizAnswers[index];
      const isCorrect = userAnswer === question.correct;
      if (isCorrect) correctCount++;
      
      results[index] = {
        question: question.question,
        userAnswer,
        correctAnswer: question.correct,
        isCorrect,
        explanation: question.explanation
      };
    });

    const score = Math.round((correctCount / quiz.length) * 100);
    
    // 保存测验结果
    learningProgress.saveQuizResult(tutorialId, currentChapterData.id, {
      score,
      totalQuestions: quiz.length,
      correctAnswers: correctCount,
      answers: results,
      timeSpent: readingTime
    });

    setQuizSubmitted(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* 教程完成模态框 */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 恭喜完成！</h2>
            <p className="text-gray-600 mb-6">
              您已成功完成《{tutorial.title}》教程！
              <br />
              您的学习成果已保存，可以继续学习其他课程。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                继续查看
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                返回教程列表
              </button>
            </div>
          </div>
        </div>
      )}

    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回教程列表</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">{tutorial.title}</h1>
                <p className="text-sm text-gray-600">
                  第 {currentChapter + 1} 章 / 共 {tutorial.chapters.length} 章
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <Clock size={16} className="inline mr-1" />
                {formatTime(readingTime)}
              </div>
              
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentChapter + 1) / tutorial.chapters.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏 - 章节导航 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen size={18} className="mr-2 text-blue-600" />
                课程大纲
              </h3>
              
              <nav className="space-y-2">
                {tutorial.chapters.map((chapter, index) => {
                  const isCompleted = progress?.completedChapters?.includes(chapter.id);
                  const isCurrent = index === currentChapter;
                  
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        // 记录当前章节学习时间
                        const chapterTime = Math.floor((Date.now() - startTime) / 1000);
                        if (chapterTime > 5 && currentChapter !== index) { // 章节不同且学习时间大于5秒
                          learningProgress.recordStudyTime(tutorialId, currentChapterData.id, chapterTime);
                        }
                        
                        // 切换章节
                        setCurrentChapter(index);
                        setShowQuiz(false);
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isCurrent 
                          ? 'bg-blue-50 border border-blue-200 text-blue-800' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCompleted 
                            ? 'bg-green-100 text-green-600' 
                            : isCurrent 
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-500'
                        }`}>
                          {isCompleted ? <CheckCircle size={14} /> : index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{chapter.title}</div>
                          <div className="text-xs text-gray-500">{chapter.duration}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* 学习目标 */}
              {tutorial.objectives && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Target size={16} className="mr-2 text-green-600" />
                    学习目标
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {tutorial.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 主内容区 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* 章节头部 */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-blue-600">{currentChapter + 1}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {currentChapterData.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {currentChapterData.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText size={14} />
                          第 {currentChapter + 1} 章
                        </span>
                      </div>
                    </div>
                  </div>

                  {progress?.completedChapters?.includes(currentChapterData.id) && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle size={20} />
                      <span className="font-medium">已完成</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 章节内容 */}
              <div className="p-6">
                {!showQuiz ? (
                  <div className="prose max-w-none">
                    {/* 渲染Markdown内容 */}
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: currentChapterData.content.introduction
                          .replace(/##\s+(.+)/g, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
                          .replace(/###\s+(.+)/g, '<h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">$1</h3>')
                          .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                          .replace(/```(.+?)```/gs, '<pre class="bg-gray-100 p-4 rounded-lg my-4 overflow-x-auto"><code>$1</code></pre>')
                          .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>')
                          .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
                          .replace(/\n\n/g, '</p><p class="mb-4">')
                          .replace(/^(.+)$/gm, '<p class="mb-4">$1</p>')
                      }}
                    />

                    {/* 要点总结 */}
                    {currentChapterData.content.keyPoints && (
                      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                          <Lightbulb size={18} className="mr-2" />
                          本章要点
                        </h4>
                        <ul className="space-y-2">
                          {currentChapterData.content.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-3 text-blue-800">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 测验按钮 */}
                    {currentChapterData.content.quiz && (
                      <div className="mt-8 text-center">
                        <button
                          onClick={() => setShowQuiz(true)}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                        >
                          <HelpCircle size={20} />
                          开始章节测验
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 测验界面 */
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                        <HelpCircle size={24} className="mr-2 text-green-600" />
                        章节测验
                      </h3>
                      <p className="text-gray-600">
                        请回答以下问题来测试您对本章内容的理解程度
                      </p>
                    </div>

                    <div className="space-y-6">
                      {currentChapterData.content.quiz.map((question, qIndex) => (
                        <div key={qIndex} className="p-6 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-4">
                            {qIndex + 1}. {question.question}
                          </h4>
                          
                          <div className="space-y-3">
                            {question.options.map((option, oIndex) => {
                              const isSelected = quizAnswers[qIndex] === oIndex;
                              const isCorrect = oIndex === question.correct;
                              const showResult = quizSubmitted;
                              
                              return (
                                <label
                                  key={oIndex}
                                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                    showResult
                                      ? isCorrect
                                        ? 'bg-green-100 border-green-300'
                                        : isSelected
                                          ? 'bg-red-100 border-red-300'
                                          : 'bg-white border-gray-200'
                                      : isSelected
                                        ? 'bg-blue-100 border-blue-300'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                  } border`}
                                >
                                  <input
                                    type="radio"
                                    name={`question-${qIndex}`}
                                    value={oIndex}
                                    checked={isSelected}
                                    onChange={() => handleQuizAnswer(qIndex, oIndex)}
                                    disabled={quizSubmitted}
                                    className="mt-1"
                                  />
                                  <span className={`flex-1 ${
                                    showResult && isCorrect ? 'font-medium text-green-800' : ''
                                  }`}>
                                    {option}
                                  </span>
                                  {showResult && isCorrect && (
                                    <CheckCircle size={16} className="text-green-600" />
                                  )}
                                </label>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-blue-800 text-sm">
                                <strong>解析：</strong>{question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {!quizSubmitted ? (
                      <div className="mt-6 text-center">
                        <button
                          onClick={submitQuiz}
                          disabled={Object.keys(quizAnswers).length < currentChapterData.content.quiz.length}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          提交答案
                        </button>
                      </div>
                    ) : (
                      <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="text-center">
                          <Award size={32} className="text-blue-600 mx-auto mb-3" />
                          <h4 className="text-lg font-bold text-blue-900 mb-2">测验完成！</h4>
                          <p className="text-blue-800 mb-4">
                            您的得分：{Math.round((Object.values(quizAnswers).filter((answer, index) => 
                              answer === currentChapterData.content.quiz[index].correct
                            ).length / currentChapterData.content.quiz.length) * 100)}分
                          </p>
                          <button
                            onClick={() => setShowQuiz(false)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            继续学习
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 章节导航 */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPrevChapter}
                    disabled={isFirstChapter}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowLeft size={16} />
                    上一章
                  </button>

                  <div className="text-sm text-gray-600">
                    第 {currentChapter + 1} 章 / 共 {tutorial.chapters.length} 章
                  </div>

                  <button
                    onClick={goToNextChapter}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isLastChapter 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLastChapter ? '完成教程' : '下一章'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* 相关资源 */}
            {tutorial.resources && (
              <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <ExternalLink size={18} className="mr-2 text-purple-600" />
                  相关资源
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tutorial.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="font-medium text-gray-900 mb-1">{resource.title}</div>
                      <div className="text-sm text-gray-600 capitalize">{resource.type}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default TutorialReader; 