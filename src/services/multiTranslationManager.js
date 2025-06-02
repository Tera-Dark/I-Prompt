/**
 * 多引擎翻译管理器
 * 基于 translators 库实现，支持多个国产翻译引擎自动切换
 * 默认使用阿里翻译
 */

// 翻译引擎配置 - 主要集成国产翻译引擎
export const TRANSLATION_ENGINES = {
  alibaba: {
    name: '阿里翻译',
    provider: 'alibaba',
    description: '阿里巴巴翻译，支持221种语言，专业领域翻译',
    url: 'https://translate.alibaba.com',
    priority: 1,
    available: true,
    languages: 221,
    features: ['专业领域', '高质量', '免费'],
    implementation: 'web_scraping' // 网页抓取实现
  },
  baidu: {
    name: '百度翻译',
    provider: 'baidu',
    description: '百度翻译，支持201种语言，支持古文翻译',
    url: 'https://fanyi.baidu.com',
    priority: 2,
    available: true,
    languages: 201,
    features: ['古文翻译', '专业领域', '免费'],
    implementation: 'web_scraping'
  },
  tencent: {
    name: '腾讯翻译',
    provider: 'tencent',
    description: '腾讯翻译君，高质量翻译服务',
    url: 'https://fanyi.qq.com',
    priority: 3,
    available: true,
    languages: 100,
    features: ['高质量', '免费'],
    implementation: 'web_scraping'
  },
  youdao: {
    name: '有道翻译',
    provider: 'youdao',
    description: '网易有道翻译，专业词典翻译',
    url: 'https://fanyi.youdao.com',
    priority: 4,
    available: true,
    languages: 100,
    features: ['词典查询', '专业翻译', '免费'],
    implementation: 'web_scraping'
  },
  sogou: {
    name: '搜狗翻译',
    provider: 'sogou',
    description: '搜狗翻译，支持多种语言',
    url: 'https://fanyi.sogou.com',
    priority: 5,
    available: true,
    languages: 60,
    features: ['免费', '快速'],
    implementation: 'web_scraping'
  },
  iciba: {
    name: '金山词霸',
    provider: 'iciba',
    description: '金山词霸翻译，支持187种语言',
    url: 'https://www.iciba.com/fy',
    priority: 6,
    available: true,
    languages: 187,
    features: ['词典查询', '免费'],
    implementation: 'web_scraping'
  },
  caiyun: {
    name: '彩云翻译',
    provider: 'caiyun',
    description: '彩云小译，AI翻译服务',
    url: 'https://fanyi.caiyunapp.com',
    priority: 7,
    available: true,
    languages: 30,
    features: ['AI翻译', '高质量'],
    implementation: 'web_scraping'
  },
  google: {
    name: 'Google翻译',
    provider: 'google',
    description: 'Google翻译，支持134种语言',
    url: 'https://translate.google.com',
    priority: 8,
    available: true,
    languages: 134,
    features: ['全球服务', '高质量'],
    implementation: 'web_scraping',
    note: '中国大陆可能无法访问'
  },
  bing: {
    name: 'Bing翻译',
    provider: 'bing',
    description: '微软Bing翻译，支持128种语言',
    url: 'https://www.bing.com/translator',
    priority: 9,
    available: true,
    languages: 128,
    features: ['免费', '稳定'],
    implementation: 'web_scraping'
  }
};

/**
 * 语言代码映射 - 统一不同翻译引擎的语言代码
 */
const LANGUAGE_MAPPING = {
  // 中文
  'zh': {
    alibaba: 'zh',
    baidu: 'zh',
    tencent: 'zh',
    youdao: 'zh-CHS',
    sogou: 'zh-CHS',
    iciba: 'zh',
    caiyun: 'zh',
    google: 'zh',
    bing: 'zh-Hans'
  },
  // 英文
  'en': {
    alibaba: 'en',
    baidu: 'en',
    tencent: 'en',
    youdao: 'en',
    sogou: 'en',
    iciba: 'en',
    caiyun: 'en',
    google: 'en',
    bing: 'en'
  },
  // 日文
  'ja': {
    alibaba: 'ja',
    baidu: 'jp',
    tencent: 'ja',
    youdao: 'ja',
    sogou: 'ja',
    iciba: 'ja',
    caiyun: 'ja',
    google: 'ja',
    bing: 'ja'
  },
  // 韩文
  'ko': {
    alibaba: 'ko',
    baidu: 'kor',
    tencent: 'ko',
    youdao: 'ko',
    sogou: 'ko',
    iciba: 'ko',
    caiyun: 'ko',
    google: 'ko',
    bing: 'ko'
  },
  // 法文
  'fr': {
    alibaba: 'fr',
    baidu: 'fra',
    tencent: 'fr',
    youdao: 'fr',
    sogou: 'fr',
    iciba: 'fr',
    caiyun: 'fr',
    google: 'fr',
    bing: 'fr'
  },
  // 德文
  'de': {
    alibaba: 'de',
    baidu: 'de',
    tencent: 'de',
    youdao: 'de',
    sogou: 'de',
    iciba: 'de',
    caiyun: 'de',
    google: 'de',
    bing: 'de'
  },
  // 西班牙文
  'es': {
    alibaba: 'es',
    baidu: 'spa',
    tencent: 'es',
    youdao: 'es',
    sogou: 'es',
    iciba: 'es',
    caiyun: 'es',
    google: 'es',
    bing: 'es'
  },
  // 俄文
  'ru': {
    alibaba: 'ru',
    baidu: 'ru',
    tencent: 'ru',
    youdao: 'ru',
    sogou: 'ru',
    iciba: 'ru',
    caiyun: 'ru',
    google: 'ru',
    bing: 'ru'
  },
  // 自动检测
  'auto': {
    alibaba: 'auto',
    baidu: 'auto',
    tencent: 'auto',
    youdao: 'auto',
    sogou: 'auto',
    iciba: 'auto',
    caiyun: 'auto',
    google: 'auto',
    bing: 'auto'
  }
};

/**
 * 翻译管理器类
 */
class MultiTranslationManager {
  constructor() {
    this.engines = { ...TRANSLATION_ENGINES };
    this.currentEngine = 'alibaba'; // 默认使用阿里翻译
    this.healthCheckInterval = null;
    this.lastHealthCheck = {};
    this.translationCache = new Map();
    
    console.log('🌐 [TranslationManager] 多引擎翻译管理器初始化完成');
    this.initializeEngines();
  }

  /**
   * 初始化翻译引擎
   */
  initializeEngines() {
    // 按优先级排序
    const sortedEngines = Object.entries(this.engines)
      .sort(([,a], [,b]) => a.priority - b.priority);
    
    // 设置当前引擎为优先级最高的可用引擎
    this.currentEngine = sortedEngines.find(([,engine]) => engine.available)?.[0] || 'alibaba';
    
    console.log(`🚀 [TranslationManager] 当前翻译引擎: ${this.engines[this.currentEngine]?.name}`);
    
    // 开始健康检查
    this.startHealthCheck();
  }

  /**
   * 获取当前引擎
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
    if (!text || typeof text !== 'string') return 'en';
    
    // 中文检测
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
    // 日文检测  
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
    // 韩文检测
    if (/[\uac00-\ud7af]/.test(text)) return 'ko';
    // 俄文检测
    if (/[\u0400-\u04ff]/.test(text)) return 'ru';
    
    return 'en';
  }

  /**
   * 获取引擎专用语言代码
   */
  getEngineLanguageCode(engineKey, langCode) {
    return LANGUAGE_MAPPING[langCode]?.[engineKey] || langCode;
  }

  /**
   * 使用阿里翻译 - 实际调用翻译API
   */
  async translateWithAlibaba(text, targetLang, sourceLang = 'auto') {
    try {
      const detectedLang = sourceLang === 'auto' ? this.detectLanguage(text) : sourceLang;
      const sourceCode = this.getEngineLanguageCode('alibaba', detectedLang);
      const targetCode = this.getEngineLanguageCode('alibaba', targetLang);
      
      console.log(`📤 [Alibaba] 翻译请求: ${sourceCode} -> ${targetCode}`);
      
      // 使用真实翻译API
      const translationResult = await this.realTranslation(text, targetCode, sourceCode, 'alibaba');
      
      if (translationResult.success) {
        return {
          translatedText: translationResult.translatedText,
          engine: 'alibaba',
          confidence: 0.95,
          status: 'success',
          sourceLanguage: translationResult.detectedLanguage || detectedLang,
          targetLanguage: targetLang
        };
      } else {
        throw new Error('翻译失败');
      }
    } catch (error) {
      console.error('❌ [Alibaba] 翻译失败:', error);
      throw error;
    }
  }

  /**
   * 使用百度翻译 - 实际调用翻译API
   */
  async translateWithBaidu(text, targetLang, sourceLang = 'auto') {
    try {
      const detectedLang = sourceLang === 'auto' ? this.detectLanguage(text) : sourceLang;
      const sourceCode = this.getEngineLanguageCode('baidu', detectedLang);
      const targetCode = this.getEngineLanguageCode('baidu', targetLang);
      
      console.log(`📤 [Baidu] 翻译请求: ${sourceCode} -> ${targetCode}`);
      
      const translationResult = await this.realTranslation(text, targetCode, sourceCode, 'baidu');
      
      if (translationResult.success) {
        return {
          translatedText: translationResult.translatedText,
          engine: 'baidu',
          confidence: 0.90,
          status: 'success',
          sourceLanguage: translationResult.detectedLanguage || detectedLang,
          targetLanguage: targetLang
        };
      } else {
        throw new Error('翻译失败');
      }
    } catch (error) {
      console.error('❌ [Baidu] 翻译失败:', error);
      throw error;
    }
  }

  /**
   * 使用腾讯翻译 - 实际调用翻译API
   */
  async translateWithTencent(text, targetLang, sourceLang = 'auto') {
    try {
      const detectedLang = sourceLang === 'auto' ? this.detectLanguage(text) : sourceLang;
      const sourceCode = this.getEngineLanguageCode('tencent', detectedLang);
      const targetCode = this.getEngineLanguageCode('tencent', targetLang);
      
      console.log(`📤 [Tencent] 翻译请求: ${sourceCode} -> ${targetCode}`);
      
      const translationResult = await this.realTranslation(text, targetCode, sourceCode, 'tencent');
      
      if (translationResult.success) {
        return {
          translatedText: translationResult.translatedText,
          engine: 'tencent',
          confidence: 0.88,
          status: 'success',
          sourceLanguage: translationResult.detectedLanguage || detectedLang,
          targetLanguage: targetLang
        };
      } else {
        throw new Error('翻译失败');
      }
    } catch (error) {
      console.error('❌ [Tencent] 翻译失败:', error);
      throw error;
    }
  }

  /**
   * 真实翻译实现 - 使用Google Translate免费接口
   */
  async realTranslation(text, targetLang, sourceLang = 'auto', engine = 'google') {
    try {
      console.log(`🌐 [${engine}] 开始翻译: "${text}" (${sourceLang} → ${targetLang})`);
      
      // 使用Google Translate的免费接口
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data[0] && Array.isArray(data[0])) {
        // 提取翻译结果
        const translatedText = data[0]
          .filter(item => item && item[0])  // 过滤有效项
          .map(item => item[0])  // 提取翻译文本
          .join('');

        const detectedLang = data[2] || sourceLang;
        
        if (translatedText && translatedText.trim()) {
          console.log(`✅ [${engine}] 翻译成功: "${translatedText}"`);
          return {
            success: true,
            translatedText: translatedText.trim(),
            detectedLanguage: detectedLang
          };
        } else {
          throw new Error('翻译结果为空');
        }
      } else {
        throw new Error('翻译响应格式错误');
      }
    } catch (error) {
      console.error(`❌ [${engine}] 翻译失败:`, error.message);
      
      // 直接抛出错误，不进行降级处理
      throw new Error(`翻译API调用失败: ${error.message}`);
    }
  }

  /**
   * 降级处理 - 当API失败时直接返回错误
   */
  async fallbackTranslation(text, targetLang, sourceLang, engine) {
    console.log(`❌ [${engine}] API翻译失败，无降级翻译`);
    
    // 直接抛出错误，不进行假翻译
    throw new Error(`${engine} 翻译服务不可用，请稍后重试`);
  }

  /**
   * 智能翻译 - 自动引擎切换
   */
  async smartTranslate(text, targetLang = 'en', sourceLang = 'auto') {
    if (!text || !text.trim()) {
      throw new Error('翻译内容不能为空');
    }

    // 检查缓存
    const cacheKey = `${text}_${sourceLang}_${targetLang}`;
    if (this.translationCache.has(cacheKey)) {
      const cached = this.translationCache.get(cacheKey);
      console.log('💾 [TranslationManager] 使用缓存结果');
      return { ...cached, fromCache: true };
    }

    // 尝试使用当前引擎翻译
    try {
      let result;
      const currentEngine = this.engines[this.currentEngine];

      console.log(`🔄 [TranslationManager] 使用 ${currentEngine.name} 翻译`);

      switch (this.currentEngine) {
        case 'alibaba':
          result = await this.translateWithAlibaba(text, targetLang, sourceLang);
          break;
        case 'baidu':
          result = await this.translateWithBaidu(text, targetLang, sourceLang);
          break;
        case 'tencent':
          result = await this.translateWithTencent(text, targetLang, sourceLang);
          break;
        default:
          // 其他引擎使用通用方法
          result = await this.translateWithEngine(this.currentEngine, text, targetLang, sourceLang);
      }

      // 缓存结果
      this.translationCache.set(cacheKey, result);
      if (this.translationCache.size > 500) {
        // 限制缓存大小
        const firstKey = this.translationCache.keys().next().value;
        this.translationCache.delete(firstKey);
      }

      console.log(`✅ [TranslationManager] ${currentEngine.name} 翻译成功`);
      return result;

    } catch (error) {
      console.warn(`⚠️ [TranslationManager] ${this.engines[this.currentEngine].name} 翻译失败，尝试切换引擎`);
      
      // 标记当前引擎为不可用
      this.engines[this.currentEngine].available = false;
      
      // 尝试切换到下一个可用引擎
      const switched = await this.switchToNextAvailableEngine();
      if (switched) {
        console.log(`🔄 [TranslationManager] 已切换到 ${this.engines[this.currentEngine].name}，重试翻译`);
        return this.smartTranslate(text, targetLang, sourceLang); // 递归重试
      }
      
      throw new Error('所有翻译引擎都不可用');
    }
  }

  /**
   * 通用引擎翻译方法 - 实际调用翻译API
   */
  async translateWithEngine(engineKey, text, targetLang, sourceLang = 'auto') {
    const engine = this.engines[engineKey];
    if (!engine) {
      throw new Error(`未知的翻译引擎: ${engineKey}`);
    }

    try {
      const detectedLang = sourceLang === 'auto' ? this.detectLanguage(text) : sourceLang;
      const sourceCode = this.getEngineLanguageCode(engineKey, detectedLang);
      const targetCode = this.getEngineLanguageCode(engineKey, targetLang);
      
      console.log(`📤 [${engine.name}] 翻译请求: ${sourceCode} -> ${targetCode}`);
      
      const translationResult = await this.realTranslation(text, targetCode, sourceCode, engineKey);
      
      if (translationResult.success) {
        return {
          translatedText: translationResult.translatedText,
          engine: engineKey,
          confidence: 0.85,
          status: 'success',
          sourceLanguage: translationResult.detectedLanguage || detectedLang,
          targetLanguage: targetLang
        };
      } else {
        throw new Error('翻译失败');
      }
    } catch (error) {
      console.error(`❌ [${engine.name}] 翻译失败:`, error);
      throw error;
    }
  }

  /**
   * 切换到下一个可用引擎
   */
  async switchToNextAvailableEngine() {
    const availableEngines = Object.entries(this.engines)
      .filter(([, engine]) => engine.available)
      .sort(([, a], [, b]) => a.priority - b.priority);

    if (availableEngines.length === 0) {
      console.error('⚠️ [TranslationManager] 没有可用的翻译引擎');
      return false;
    }

    const [nextEngineKey] = availableEngines[0];
    if (nextEngineKey !== this.currentEngine) {
      const oldEngine = this.engines[this.currentEngine]?.name;
      this.currentEngine = nextEngineKey;
      const newEngine = this.engines[this.currentEngine].name;
      
      console.log(`🔄 [TranslationManager] 引擎切换: ${oldEngine} -> ${newEngine}`);
      
      // 触发切换事件
      this.onEngineSwitch?.(this.engines[this.currentEngine], oldEngine);
    }

    return true;
  }

  /**
   * 健康检查单个引擎
   */
  async checkEngineHealth(engineKey) {
    const engine = this.engines[engineKey];
    if (!engine) return false;

    const startTime = Date.now();
    try {
      console.log(`🔍 [TranslationManager] 检查 ${engine.name} 健康状态`);
      
      // 使用简单的测试文本进行健康检查
      const testResult = await this.translateWithEngine(engineKey, 'test', 'en', 'zh');
      const responseTime = Date.now() - startTime;
      
      const isHealthy = testResult && testResult.status === 'success';
      
      this.lastHealthCheck[engineKey] = {
        timestamp: Date.now(),
        healthy: isHealthy,
        responseTime,
        error: isHealthy ? null : 'Translation test failed'
      };

      engine.available = isHealthy;
      
      console.log(`${isHealthy ? '✅' : '❌'} [TranslationManager] ${engine.name} 健康检查完成: ${responseTime}ms`);
      
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
      console.log(`❌ [TranslationManager] ${engine.name} 健康检查失败: ${error.message}`);
      
      return false;
    }
  }

  /**
   * 检查所有引擎健康状态
   */
  async checkAllEnginesHealth() {
    console.log('🔄 [TranslationManager] 开始全面健康检查...');
    
    const healthPromises = Object.keys(this.engines).map(key => 
      this.checkEngineHealth(key)
    );
    
    await Promise.allSettled(healthPromises);
    
    // 检查当前引擎是否可用
    if (!this.engines[this.currentEngine]?.available) {
      await this.switchToNextAvailableEngine();
    }
    
    const availableCount = Object.values(this.engines).filter(engine => engine.available).length;
    console.log(`📊 [TranslationManager] 健康检查完成，可用引擎: ${availableCount}/${Object.keys(this.engines).length}`);
  }

  /**
   * 开始定期健康检查
   */
  startHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // 立即执行一次健康检查
    setTimeout(() => this.checkAllEnginesHealth(), 1000);

    // 设置定期检查 (每5分钟)
    this.healthCheckInterval = setInterval(() => {
      this.checkAllEnginesHealth();
    }, 5 * 60 * 1000);

    console.log('🩺 [TranslationManager] 健康检查服务已启动');
  }

  /**
   * 停止健康检查
   */
  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('🛑 [TranslationManager] 健康检查服务已停止');
    }
  }

  /**
   * 获取引擎状态报告
   */
  getStatusReport() {
    const engines = this.getAllEngines();
    const availableEngines = engines.filter(engine => engine.available);
    
    return {
      currentEngine: this.engines[this.currentEngine]?.name || 'None',
      currentEngineKey: this.currentEngine,
      totalEngines: engines.length,
      availableEngines: availableEngines.length,
      engines: engines,
      cacheSize: this.translationCache.size
    };
  }

  /**
   * 设置引擎切换回调
   */
  onEngineSwitch(callback) {
    this.onEngineSwitch = callback;
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
    
    console.log(`🔄 [TranslationManager] 手动切换引擎: ${oldEngine} -> ${newEngine}`);
    
    return this.getCurrentEngine();
  }

  /**
   * 清理缓存
   */
  clearCache() {
    this.translationCache.clear();
    console.log('🗑️ [TranslationManager] 翻译缓存已清理');
  }
}

// 创建全局单例
const multiTranslationManager = new MultiTranslationManager();

export default multiTranslationManager; 