/**
 * 智谱GLM配置文件
 * 管理API密钥、模型配置等
 */

// 默认配置
export const ZHIPU_CONFIG = {
  // API配置
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
  model: 'glm-4-flash',
  
  // 翻译配置
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  
  // 速率限制配置
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerSecond: 2
  },
  
  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 24 * 60 * 60 * 1000 // 24小时
  }
};

// API密钥管理
class ZhipuConfigManager {
  constructor() {
    this.apiKey = null;
    this.loadApiKey();
  }

  /**
   * 从localStorage加载API密钥
   */
  loadApiKey() {
    try {
      const stored = localStorage.getItem('zhipu_api_key');
      if (stored) {
        this.apiKey = stored;
        console.log('✅ [ZhipuConfig] API密钥已从本地存储加载');
      }
    } catch (error) {
      console.error('❌ [ZhipuConfig] 加载API密钥失败:', error);
    }
  }

  /**
   * 设置API密钥
   * @param {string} key - API密钥
   */
  setApiKey(key) {
    if (!key || typeof key !== 'string') {
      throw new Error('API密钥不能为空');
    }

    this.apiKey = key.trim();
    
    try {
      localStorage.setItem('zhipu_api_key', this.apiKey);
      console.log('✅ [ZhipuConfig] API密钥已保存');
    } catch (error) {
      console.error('❌ [ZhipuConfig] 保存API密钥失败:', error);
      throw new Error('保存API密钥失败');
    }
  }

  /**
   * 获取API密钥
   * @returns {string|null} API密钥
   */
  getApiKey() {
    return this.apiKey;
  }

  /**
   * 检查API密钥是否已设置
   * @returns {boolean} 是否已设置
   */
  hasApiKey() {
    return !!this.apiKey;
  }

  /**
   * 清除API密钥
   */
  clearApiKey() {
    this.apiKey = null;
    try {
      localStorage.removeItem('zhipu_api_key');
      console.log('✅ [ZhipuConfig] API密钥已清除');
    } catch (error) {
      console.error('❌ [ZhipuConfig] 清除API密钥失败:', error);
    }
  }

  /**
   * 验证API密钥格式
   * @param {string} key - API密钥
   * @returns {boolean} 是否有效
   */
  validateApiKey(key) {
    if (!key || typeof key !== 'string') {
      return false;
    }
    
    // 智谱API密钥通常以特定格式开头
    const trimmedKey = key.trim();
    return trimmedKey.length > 10; // 基本长度检查
  }

  /**
   * 获取完整配置
   * @returns {object} 配置对象
   */
  getConfig() {
    return {
      ...ZHIPU_CONFIG,
      apiKey: this.apiKey
    };
  }
}

// 导出单例实例
export const zhipuConfigManager = new ZhipuConfigManager();

// 便捷函数
export const setZhipuApiKey = (key) => zhipuConfigManager.setApiKey(key);
export const getZhipuApiKey = () => zhipuConfigManager.getApiKey();
export const hasZhipuApiKey = () => zhipuConfigManager.hasApiKey();
export const clearZhipuApiKey = () => zhipuConfigManager.clearApiKey();
export const validateZhipuApiKey = (key) => zhipuConfigManager.validateApiKey(key);