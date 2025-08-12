/**
 * 智谱GLM翻译服务
 * 使用GLM-4-Flash模型进行免费翻译
 */

import { zhipuConfigManager } from '../config/zhipuConfig.js';

// 支持的语言映射
const LANGUAGE_MAPPING = {
  'zh': '中文',
  'en': '英文',
  'ja': '日文',
  'ko': '韩文',
  'fr': '法文',
  'de': '德文',
  'es': '西班牙文',
  'ru': '俄文',
  'it': '意大利文',
  'pt': '葡萄牙文',
  'ar': '阿拉伯文',
  'th': '泰文',
  'vi': '越南文',
  'hi': '印地文'
};

/**
 * 智谱GLM翻译服务类
 */
class ZhipuTranslationService {
  constructor() {
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.requestCount = 0;
    this.rateLimitWindow = 60000; // 1分钟
    this.maxRequestsPerMinute = 60;
  }

  /**
   * 设置API密钥
   * @param {string} apiKey - 智谱AI API密钥
   */
  setApiKey(apiKey) {
    zhipuConfigManager.setApiKey(apiKey);
    console.log('✅ [ZhipuTranslation] API密钥已设置');
  }

  /**
   * 获取API密钥
   * @returns {string|null} API密钥
   */
  getApiKey() {
    return zhipuConfigManager.getApiKey();
  }

  /**
   * 检查API密钥是否已设置
   * @returns {boolean} 是否已设置
   */
  hasApiKey() {
    return zhipuConfigManager.hasApiKey();
  }

  /**
   * 检测文本语言
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
    // 阿拉伯文检测
    if (/[\u0600-\u06ff]/.test(text)) return 'ar';
    
    return 'en';
  }

  /**
   * 构建翻译提示词
   */
  buildTranslationPrompt(text, targetLang, sourceLang = 'auto') {
    const sourceLanguage = sourceLang === 'auto' ? '自动检测' : (LANGUAGE_MAPPING[sourceLang] || sourceLang);
    const targetLanguage = LANGUAGE_MAPPING[targetLang] || targetLang;

    return `请将以下文本从${sourceLanguage}翻译成${targetLanguage}。

要求：
1. 保持原文的语义和语调
2. 确保翻译自然流畅
3. 对于专业术语，请使用准确的对应词汇
4. 只返回翻译结果，不要包含任何解释或额外内容
5. 如果是代码或特殊格式，请保持原有格式

原文：
${text}

翻译：`;
  }

  /**
   * 调用智谱GLM API进行翻译
   */
  async callZhipuAPI(prompt) {
    try {
      const config = zhipuConfigManager.getConfig();
      
      if (!config.apiKey) {
        throw new Error('请先设置智谱AI API密钥');
      }

      // 简单的频率限制
      const now = Date.now();
      if (now - this.lastRequestTime < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - (now - this.lastRequestTime)));
      }
      this.lastRequestTime = Date.now();

      const response = await fetch(`${config.baseURL}chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1, // 降低随机性，提高翻译一致性
          max_tokens: 2000,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`智谱API调用失败: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const translatedText = data.choices[0].message.content.trim();
        this.requestCount++;
        
        console.log(`✅ [ZhipuTranslation] 翻译成功 (请求次数: ${this.requestCount})`);
        return {
          success: true,
          translatedText,
          usage: data.usage
        };
      } else {
        throw new Error('智谱API返回格式错误');
      }
    } catch (error) {
      console.error('❌ [ZhipuTranslation] API调用失败:', error);
      throw error;
    }
  }

  /**
   * 主要翻译方法
   */
  async translate(text, targetLang = 'en', sourceLang = 'auto') {
    if (!text || !text.trim()) {
      throw new Error('翻译内容不能为空');
    }

    if (!this.config.apiKey || this.config.apiKey === 'your-zhipu-api-key-here') {
      throw new Error('请先设置智谱AI的API Key。获取地址: https://bigmodel.cn/usercenter/apikeys');
    }

    // 检查缓存
    const cacheKey = `${text}_${sourceLang}_${targetLang}`;
    if (this.translationCache.has(cacheKey)) {
      const cached = this.translationCache.get(cacheKey);
      console.log('💾 [ZhipuTranslation] 使用缓存结果');
      return { ...cached, fromCache: true };
    }

    try {
      // 检测源语言
      const detectedLang = sourceLang === 'auto' ? this.detectLanguage(text) : sourceLang;
      
      // 如果源语言和目标语言相同，直接返回原文
      if (detectedLang === targetLang) {
        return {
          translatedText: text,
          engine: 'zhipu-glm',
          confidence: 1.0,
          status: 'success',
          sourceLanguage: detectedLang,
          targetLanguage: targetLang,
          fromCache: false
        };
      }

      console.log(`🤖 [ZhipuTranslation] 开始翻译: "${text}" (${detectedLang} → ${targetLang})`);

      // 构建翻译提示词
      const prompt = this.buildTranslationPrompt(text, targetLang, detectedLang);

      // 调用智谱GLM API
      const apiResult = await this.callZhipuAPI(prompt);

      if (apiResult.success) {
        const result = {
          translatedText: apiResult.translatedText,
          engine: 'zhipu-glm',
          confidence: 0.95,
          status: 'success',
          sourceLanguage: detectedLang,
          targetLanguage: targetLang,
          fromCache: false,
          usage: apiResult.usage
        };

        // 缓存结果
        this.translationCache.set(cacheKey, result);
        
        // 限制缓存大小
        if (this.translationCache.size > 500) {
          const firstKey = this.translationCache.keys().next().value;
          this.translationCache.delete(firstKey);
        }

        return result;
      } else {
        throw new Error('翻译失败');
      }
    } catch (error) {
      console.error('❌ [ZhipuTranslation] 翻译失败:', error);
      throw new Error(`智谱GLM翻译失败: ${error.message}`);
    }
  }

  /**
   * 批量翻译
   */
  async batchTranslate(texts, targetLang = 'en', sourceLang = 'auto') {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error('批量翻译内容不能为空');
    }

    console.log(`🔄 [ZhipuTranslation] 开始批量翻译 ${texts.length} 条内容`);

    const results = [];
    for (let i = 0; i < texts.length; i++) {
      try {
        const result = await this.translate(texts[i], targetLang, sourceLang);
        results.push({
          index: i,
          original: texts[i],
          ...result
        });
        
        // 批量翻译时添加延迟，避免频率限制
        if (i < texts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
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

    console.log(`✅ [ZhipuTranslation] 批量翻译完成: ${results.filter(r => r.status === 'success').length}/${texts.length} 成功`);
    return results;
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages() {
    return Object.entries(LANGUAGE_MAPPING).map(([code, name]) => ({
      code,
      name,
      nativeName: name
    }));
  }

  /**
   * 获取服务状态
   */
  getStatus() {
    return {
      service: 'zhipu-glm',
      model: this.config.model,
      available: !!this.config.apiKey && this.config.apiKey !== 'your-zhipu-api-key-here',
      requestCount: this.requestCount,
      cacheSize: this.translationCache.size,
      supportedLanguages: Object.keys(LANGUAGE_MAPPING).length
    };
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.translationCache.clear();
    console.log('🗑️ [ZhipuTranslation] 翻译缓存已清除');
  }
}

// 创建单例实例
const zhipuTranslationService = new ZhipuTranslationService();

export default zhipuTranslationService;
export { ZhipuTranslationService, LANGUAGE_MAPPING };