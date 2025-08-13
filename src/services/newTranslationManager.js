/**
 * 新一代翻译管理器
 * 以智谱GLM为主要翻译引擎，传统API作为备用
 * 提供免费、高质量的AI翻译服务
 */

import zhipuTranslationService from './zhipuTranslationService.js';
import { logger } from '../config/debug.js';

// 翻译引擎配置 - 智谱GLM为主，传统API为备用
export const TRANSLATION_ENGINES = {
  zhipu: {
    name: '智谱GLM',
    provider: 'zhipu-ai',
    description: '智谱AI GLM-4-Flash模型，免费高质量AI翻译',
    url: 'https://bigmodel.cn/',
    priority: 1,
    available: true,
    languages: 100,
    features: ['AI翻译', '免费', '高质量', '上下文理解'],
    implementation: 'ai_model',
    type: 'primary'
  },
  google: {
    name: 'Google翻译',
    provider: 'google',
    description: 'Google翻译，支持134种语言',
    url: 'https://translate.google.com',
    priority: 2,
    available: true,
    languages: 134,
    features: ['全球服务', '高质量'],
    implementation: 'web_api',
    type: 'fallback'
  },
  alibaba: {
    name: '阿里翻译',
    provider: 'alibaba',
    description: '阿里巴巴翻译，支持221种语言',
    url: 'https://translate.alibaba.com',
    priority: 3,
    available: true,
    languages: 221,
    features: ['专业领域', '高质量'],
    implementation: 'web_scraping',
    type: 'fallback'
  },
  baidu: {
    name: '百度翻译',
    provider: 'baidu',
    description: '百度翻译，支持201种语言',
    url: 'https://fanyi.baidu.com',
    priority: 4,
    available: true,
    languages: 201,
    features: ['古文翻译', '专业领域'],
    implementation: 'web_scraping',
    type: 'fallback'
  }
};

/**
 * 语言代码映射
 */
const LANGUAGE_MAPPING = {
  'zh': { name: '中文', google: 'zh', alibaba: 'zh', baidu: 'zh' },
  'en': { name: '英文', google: 'en', alibaba: 'en', baidu: 'en' },
  'ja': { name: '日文', google: 'ja', alibaba: 'ja', baidu: 'jp' },
  'ko': { name: '韩文', google: 'ko', alibaba: 'ko', baidu: 'kor' },
  'fr': { name: '法文', google: 'fr', alibaba: 'fr', baidu: 'fra' },
  'de': { name: '德文', google: 'de', alibaba: 'de', baidu: 'de' },
  'es': { name: '西班牙文', google: 'es', alibaba: 'es', baidu: 'spa' },
  'ru': { name: '俄文', google: 'ru', alibaba: 'ru', baidu: 'ru' },
  'it': { name: '意大利文', google: 'it', alibaba: 'it', baidu: 'it' },
  'pt': { name: '葡萄牙文', google: 'pt', alibaba: 'pt', baidu: 'pt' },
  'ar': { name: '阿拉伯文', google: 'ar', alibaba: 'ar', baidu: 'ara' },
  'th': { name: '泰文', google: 'th', alibaba: 'th', baidu: 'th' },
  'vi': { name: '越南文', google: 'vi', alibaba: 'vi', baidu: 'vie' },
  'hi': { name: '印地文', google: 'hi', alibaba: 'hi', baidu: 'hi' }
};

/**
 * 新一代翻译管理器类
 */
class NewTranslationManager {
  constructor() {
    this.engines = { ...TRANSLATION_ENGINES };
    this.currentEngine = 'zhipu'; // 默认使用智谱GLM
    this.zhipuService = zhipuTranslationService;
    this.translationCache = new Map();
    this.healthCheckInterval = null;
    this.lastHealthCheck = {};
    this.healthStatus = {};
    this.fallbackAttempts = 0;
    this.maxFallbackAttempts = 3;
    
    logger.translation('🚀 [NewTranslationManager] 新一代翻译管理器初始化完成');
    logger.translation('🤖 [NewTranslationManager] 主引擎: 智谱GLM (免费AI翻译)');
    
    this.initializeEngines();
  }

  /**
   * 设置智谱API密钥
   * @param {string} apiKey - API密钥
   */
  setZhipuApiKey(apiKey) {
    try {
      this.zhipuService.setApiKey(apiKey);
      logger.translation('✅ [NewTranslationManager] 智谱API密钥已设置');
      
      // 重新检查智谱健康状态
      this.checkZhipuHealth().then(isHealthy => {
        this.healthStatus.zhipu = isHealthy;
        logger.translation('🔍 [NewTranslationManager] 智谱健康状态更新:', isHealthy);
      });
      
      return true;
    } catch (error) {
      logger.error('❌ [NewTranslationManager] 设置智谱API密钥失败:', error);
      return false;
    }
  }

  /**
   * 获取智谱API密钥状态
   * @returns {boolean} 是否已设置API密钥
   */
  hasZhipuApiKey() {
    return this.zhipuService.hasApiKey();
  }

  /**
   * 检查智谱GLM健康状态
   * @returns {Promise<boolean>} 是否健康
   */
  async checkZhipuHealth() {
    try {
      if (!this.zhipuService.hasApiKey()) {
        logger.warn('⚠️ [NewTranslationManager] 智谱GLM未设置API密钥');
        return false;
      }
      
      // 简单的健康检查 - 翻译一个测试文本
      const testResult = await this.zhipuService.translate('test', 'zh', 'en');
      const isHealthy = testResult && testResult.status === 'success';
      
      logger.translation(`${isHealthy ? '✅' : '❌'} [NewTranslationManager] 智谱GLM健康检查: ${isHealthy ? '正常' : '异常'}`);
      return isHealthy;
    } catch (error) {
      logger.warn('⚠️ [NewTranslationManager] 智谱GLM健康检查失败:', error.message);
      return false;
    }
  }

  /**
   * 初始化翻译引擎
   */
  async initializeEngines() {
    logger.translation('🔧 [NewTranslationManager] 初始化翻译引擎...');
    
    // 检查智谱GLM可用性
    try {
      this.healthStatus.zhipu = await this.checkZhipuHealth();
    } catch (error) {
      logger.warn('⚠️ [NewTranslationManager] 智谱GLM初始化失败:', error.message);
      this.healthStatus.zhipu = false;
    }
    
    // 初始化其他引擎状态
    Object.keys(this.engines).forEach(key => {
      if (key !== 'zhipu') {
        this.healthStatus[key] = true; // 假设传统API可用
      }
    });
    
    logger.translation('✅ [NewTranslationManager] 引擎初始化完成:', this.healthStatus);
  }



  /**
   * 获取当前引擎信息
   */
  getCurrentEngine() {
    return {
      key: this.currentEngine,
      ...this.engines[this.currentEngine]
    };
  }

  /**
   * 获取所有引擎状态
   */
  getAllEngines() {
    return Object.entries(this.engines).map(([key, engine]) => ({
      key,
      ...engine,
      lastCheck: this.lastHealthCheck[key]
    }));
  }

  /**
   * 语言检测
   */
  detectLanguage(text) {
    return this.zhipuService.detectLanguage(text);
  }

  /**
   * 使用智谱GLM翻译
   */
  async translateWithZhipu(text, targetLang, sourceLang = 'auto') {
    try {
      logger.translation(`🤖 [NewTranslationManager] 使用智谱GLM翻译`);
      const result = await this.zhipuService.translate(text, targetLang, sourceLang);
      
      // 重置回退计数
      this.fallbackAttempts = 0;
      
      return result;
    } catch (error) {
      logger.error('❌ [NewTranslationManager] 智谱GLM翻译失败:', error.message);
      throw error;
    }
  }

  /**
   * 使用传统API翻译 (备用方案)
   */
  async translateWithFallback(text, targetLang, sourceLang = 'auto', engineKey = 'google') {
    try {
      logger.translation(`🔄 [NewTranslationManager] 使用备用引擎: ${this.engines[engineKey]?.name}`);
      
      const detectedLang = sourceLang === 'auto' ? this.detectLanguage(text) : sourceLang;
      const sourceCode = LANGUAGE_MAPPING[detectedLang]?.[engineKey] || detectedLang;
      const targetCode = LANGUAGE_MAPPING[targetLang]?.[engineKey] || targetLang;
      
      // 使用Google Translate免费API
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceCode}&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data[0] && Array.isArray(data[0])) {
        const translatedText = data[0]
          .filter(item => item && item[0])
          .map(item => item[0])
          .join('');

        if (translatedText && translatedText.trim()) {
          return {
            translatedText: translatedText.trim(),
            engine: engineKey,
            confidence: 0.85,
            status: 'success',
            sourceLanguage: detectedLang,
            targetLanguage: targetLang,
            fromFallback: true
          };
        }
      }
      
      throw new Error('翻译结果为空');
    } catch (error) {
      logger.error(`❌ [NewTranslationManager] ${engineKey} 翻译失败:`, error.message);
      throw error;
    }
  }

  /**
   * 智能翻译 - 主要翻译方法
   */
  async smartTranslate(text, targetLang = 'en', sourceLang = 'auto') {
    if (!text || !text.trim()) {
      throw new Error('翻译内容不能为空');
    }

    // 检查缓存
    const cacheKey = `${text}_${sourceLang}_${targetLang}`;
    if (this.translationCache.has(cacheKey)) {
      const cached = this.translationCache.get(cacheKey);
      logger.translation('💾 [NewTranslationManager] 使用缓存结果');
      return { ...cached, fromCache: true };
    }

    let result = null;
    let lastError = null;

    // 1. 优先使用智谱GLM
    if (this.engines.zhipu.available && this.fallbackAttempts < this.maxFallbackAttempts) {
      try {
        result = await this.translateWithZhipu(text, targetLang, sourceLang);
        logger.translation('✅ [NewTranslationManager] 智谱GLM翻译成功');
      } catch (error) {
        lastError = error;
        this.fallbackAttempts++;
        logger.warn(`⚠️ [NewTranslationManager] 智谱GLM翻译失败 (${this.fallbackAttempts}/${this.maxFallbackAttempts}):`, error.message);
        
        // 如果是API Key问题，标记为不可用
        if (error.message.includes('API Key') || error.message.includes('401') || error.message.includes('403')) {
          this.engines.zhipu.available = false;
          logger.warn('🔑 [NewTranslationManager] 智谱GLM API Key问题，切换到备用引擎');
        }
      }
    }

    // 2. 如果智谱GLM失败，使用备用引擎
    if (!result) {
      const fallbackEngines = ['google', 'alibaba', 'baidu'];
      
      for (const engineKey of fallbackEngines) {
        if (!this.engines[engineKey]?.available) continue;
        
        try {
          result = await this.translateWithFallback(text, targetLang, sourceLang, engineKey);
          logger.translation(`✅ [NewTranslationManager] 备用引擎 ${this.engines[engineKey].name} 翻译成功`);
          break;
        } catch (error) {
          lastError = error;
          logger.warn(`⚠️ [NewTranslationManager] 备用引擎 ${this.engines[engineKey].name} 失败:`, error.message);
          this.engines[engineKey].available = false;
        }
      }
    }

    // 3. 如果所有引擎都失败
    if (!result) {
      throw new Error(`所有翻译引擎都不可用。最后错误: ${lastError?.message || '未知错误'}`);
    }

    // 缓存结果
    this.translationCache.set(cacheKey, result);
    if (this.translationCache.size > 500) {
      const firstKey = this.translationCache.keys().next().value;
      this.translationCache.delete(firstKey);
    }

    return result;
  }

  /**
   * 批量翻译
   */
  async batchTranslate(texts, targetLang = 'en', sourceLang = 'auto') {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error('批量翻译内容不能为空');
    }

    logger.translation(`🔄 [NewTranslationManager] 开始批量翻译 ${texts.length} 条内容`);

    // 优先使用智谱GLM的批量翻译
    if (this.engines.zhipu.available) {
      try {
        const results = await this.zhipuService.batchTranslate(texts, targetLang, sourceLang);
        logger.translation('✅ [NewTranslationManager] 智谱GLM批量翻译完成');
        return results;
      } catch (error) {
        logger.warn('⚠️ [NewTranslationManager] 智谱GLM批量翻译失败，使用逐个翻译:', error.message);
      }
    }

    // 备用方案：逐个翻译
    const results = [];
    for (let i = 0; i < texts.length; i++) {
      try {
        const result = await this.smartTranslate(texts[i], targetLang, sourceLang);
        results.push({
          index: i,
          original: texts[i],
          ...result
        });
        
        // 添加延迟避免频率限制
        if (i < texts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        results.push({
          index: i,
          original: texts[i],
          error: error.message,
          status: 'failed'
        });
      }
    }

    logger.translation(`✅ [NewTranslationManager] 批量翻译完成: ${results.filter(r => r.status === 'success').length}/${texts.length} 成功`);
    return results;
  }

  /**
   * 健康检查
   */
  async checkEngineHealth(engineKey) {
    const engine = this.engines[engineKey];
    if (!engine) return false;

    const startTime = Date.now();
    try {
      logger.translation(`🔍 [NewTranslationManager] 检查 ${engine.name} 健康状态`);
      
      let testResult;
      if (engineKey === 'zhipu') {
        testResult = await this.translateWithZhipu('测试', 'en', 'zh');
      } else {
        testResult = await this.translateWithFallback('test', 'zh', 'en', engineKey);
      }
      
      const responseTime = Date.now() - startTime;
      const isHealthy = testResult && testResult.status === 'success';
      
      this.lastHealthCheck[engineKey] = {
        timestamp: Date.now(),
        healthy: isHealthy,
        responseTime,
        error: isHealthy ? null : 'Translation test failed'
      };

      engine.available = isHealthy;
      
      logger.translation(`${isHealthy ? '✅' : '❌'} [NewTranslationManager] ${engine.name} 健康检查完成: ${responseTime}ms`);
      
      return isHealthy;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.lastHealthCheck[engineKey] = {
        timestamp: Date.now(),
        healthy: false,
        responseTime,
        error: error.message
      };

      engine.available = false;
      logger.error(`❌ [NewTranslationManager] ${engine.name} 健康检查失败: ${error.message}`);
      
      return false;
    }
  }

  /**
   * 开始健康检查
   */
  startHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // 立即执行一次健康检查
    setTimeout(() => this.checkAllEnginesHealth(), 2000);

    // 设置定期检查 (每10分钟)
    this.healthCheckInterval = setInterval(() => {
      this.checkAllEnginesHealth();
    }, 10 * 60 * 1000);

    logger.translation('🩺 [NewTranslationManager] 健康检查服务已启动');
  }

  /**
   * 检查所有引擎健康状态
   */
  async checkAllEnginesHealth() {
    logger.translation('🔄 [NewTranslationManager] 开始全面健康检查...');
    
    const healthPromises = Object.keys(this.engines).map(key => 
      this.checkEngineHealth(key)
    );
    
    await Promise.allSettled(healthPromises);
    
    const availableCount = Object.values(this.engines).filter(engine => engine.available).length;
    logger.translation(`📊 [NewTranslationManager] 健康检查完成，可用引擎: ${availableCount}/${Object.keys(this.engines).length}`);
    
    // 重置回退计数
    this.fallbackAttempts = 0;
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages() {
    return Object.entries(LANGUAGE_MAPPING).map(([code, info]) => ({
      code,
      name: info.name,
      nativeName: info.name
    }));
  }

  /**
   * 获取状态报告
   */
  getStatusReport() {
    const engines = this.getAllEngines();
    const availableEngines = engines.filter(engine => engine.available);
    const zhipuStatus = this.zhipuService.getStatus();
    
    return {
      currentEngine: this.engines[this.currentEngine]?.name || 'None',
      currentEngineKey: this.currentEngine,
      totalEngines: engines.length,
      availableEngines: availableEngines.length,
      engines: engines,
      cacheSize: this.translationCache.size,
      zhipuStatus,
      fallbackAttempts: this.fallbackAttempts,
      maxFallbackAttempts: this.maxFallbackAttempts
    };
  }

  /**
   * 手动切换引擎
   */
  switchEngine(engineKey) {
    if (!this.engines[engineKey]) {
      throw new Error(`未知的翻译引擎: ${engineKey}`);
    }
    
    const oldEngine = this.engines[this.currentEngine]?.name;
    this.currentEngine = engineKey;
    const newEngine = this.engines[this.currentEngine].name;
    
    logger.translation(`🔄 [NewTranslationManager] 手动切换引擎: ${oldEngine} -> ${newEngine}`);
    
    return this.getCurrentEngine();
  }

  /**
   * 清理缓存
   */
  clearCache() {
    this.translationCache.clear();
    this.zhipuService.clearCache();
    logger.translation('🗑️ [NewTranslationManager] 所有翻译缓存已清理');
  }

  /**
   * 停止健康检查
   */
  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      logger.translation('🛑 [NewTranslationManager] 健康检查服务已停止');
    }
  }
}

// 创建全局单例
const newTranslationManager = new NewTranslationManager();

export default newTranslationManager;
export { NewTranslationManager, LANGUAGE_MAPPING };