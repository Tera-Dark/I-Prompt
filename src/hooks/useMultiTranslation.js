import { useState, useCallback, useEffect } from 'react';
import multiTranslationManager from '../services/multiTranslationManager';

/**
 * 多引擎翻译Hook
 * 提供翻译功能、状态管理和引擎切换功能
 */
export const useMultiTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentEngine, setCurrentEngine] = useState(null);
  const [translationError, setTranslationError] = useState(null);
  const [translationHistory, setTranslationHistory] = useState([]);

  // 初始化
  useEffect(() => {
    // 设置引擎切换监听
    multiTranslationManager.onEngineSwitch = (newEngine, oldEngine) => {
      setCurrentEngine(newEngine);
      console.log(`🔄 [Hook] 翻译引擎已切换: ${oldEngine} -> ${newEngine.name}`);
    };

    // 获取初始引擎信息
    setCurrentEngine(multiTranslationManager.getCurrentEngine());
  }, []);

  /**
   * 执行翻译
   */
  const translate = useCallback(async (text, targetLang = 'en', sourceLang = 'auto') => {
    if (!text || !text.trim()) {
      setTranslationError('翻译内容不能为空');
      return null;
    }

    setIsTranslating(true);
    setTranslationError(null);

    try {
      const result = await multiTranslationManager.smartTranslate(text, targetLang, sourceLang);
      
      // 添加到历史记录
      const historyItem = {
        id: Date.now(),
        originalText: text,
        translatedText: result.translatedText,
        sourceLang,
        targetLang,
        engine: result.engine,
        confidence: result.confidence,
        timestamp: new Date(),
        fromCache: result.fromCache || false
      };

      setTranslationHistory(prev => [historyItem, ...prev.slice(0, 49)]); // 保持最近50条记录

      return result;
    } catch (error) {
      console.error('翻译失败:', error);
      setTranslationError(error.message || '翻译失败，请稍后重试');
      return null;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  /**
   * 批量翻译
   */
  const batchTranslate = useCallback(async (texts, targetLang = 'en', sourceLang = 'auto') => {
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      setTranslationError('翻译列表不能为空');
      return [];
    }

    setIsTranslating(true);
    setTranslationError(null);

    try {
      const results = [];
      for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        if (text && text.trim()) {
          try {
            const result = await multiTranslationManager.smartTranslate(text, targetLang, sourceLang);
            results.push({
              index: i,
              original: text,
              translated: result.translatedText,
              engine: result.engine,
              confidence: result.confidence,
              success: true
            });
          } catch (error) {
            results.push({
              index: i,
              original: text,
              translated: null,
              error: error.message,
              success: false
            });
          }
        } else {
          results.push({
            index: i,
            original: text,
            translated: null,
            error: '空内容',
            success: false
          });
        }

        // 添加延迟避免请求过快
        if (i < texts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      return results;
    } catch (error) {
      console.error('批量翻译失败:', error);
      setTranslationError(error.message || '批量翻译失败');
      return [];
    } finally {
      setIsTranslating(false);
    }
  }, []);

  /**
   * 获取引擎状态
   */
  const getEngineStatus = useCallback(() => {
    return multiTranslationManager.getStatusReport();
  }, []);

  /**
   * 切换翻译引擎
   */
  const switchEngine = useCallback((engineKey) => {
    try {
      const newEngine = multiTranslationManager.switchEngine(engineKey);
      setCurrentEngine(newEngine);
      setTranslationError(null);
      return newEngine;
    } catch (error) {
      setTranslationError(error.message);
      return null;
    }
  }, []);

  /**
   * 获取所有可用引擎
   */
  const getAllEngines = useCallback(() => {
    return multiTranslationManager.getAllEngines();
  }, []);

  /**
   * 检测语言
   */
  const detectLanguage = useCallback((text) => {
    return multiTranslationManager.detectLanguage(text);
  }, []);

  /**
   * 清理翻译缓存
   */
  const clearCache = useCallback(() => {
    multiTranslationManager.clearCache();
    setTranslationHistory([]);
  }, []);

  /**
   * 手动刷新引擎状态
   */
  const refreshEngines = useCallback(async () => {
    try {
      await multiTranslationManager.checkAllEnginesHealth();
      setCurrentEngine(multiTranslationManager.getCurrentEngine());
    } catch (error) {
      console.error('刷新引擎状态失败:', error);
    }
  }, []);

  /**
   * 获取翻译历史统计
   */
  const getTranslationStats = useCallback(() => {
    const stats = {
      totalTranslations: translationHistory.length,
      engineUsage: {},
      languagePairs: {},
      cacheHitRate: 0
    };

    let cacheHits = 0;

    translationHistory.forEach(item => {
      // 引擎使用统计
      stats.engineUsage[item.engine] = (stats.engineUsage[item.engine] || 0) + 1;

      // 语言对统计
      const langPair = `${item.sourceLang} -> ${item.targetLang}`;
      stats.languagePairs[langPair] = (stats.languagePairs[langPair] || 0) + 1;

      // 缓存命中统计
      if (item.fromCache) {
        cacheHits++;
      }
    });

    stats.cacheHitRate = translationHistory.length > 0 
      ? Math.round((cacheHits / translationHistory.length) * 100) 
      : 0;

    return stats;
  }, [translationHistory]);

  return {
    // 状态
    isTranslating,
    currentEngine,
    translationError,
    translationHistory,

    // 翻译功能
    translate,
    batchTranslate,

    // 引擎管理
    switchEngine,
    getAllEngines,
    getEngineStatus,
    refreshEngines,

    // 工具功能
    detectLanguage,
    clearCache,
    getTranslationStats
  };
}; 