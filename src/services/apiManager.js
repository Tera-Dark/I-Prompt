import { API_CONFIG } from '../constants/config.js';
import { zhipuConfigManager } from '../config/zhipuConfig.js';

/**
 * API管理服务
 * 负责管理多个API端点，自动检测可用性并进行切换
 */
class ApiManager {
  constructor() {
    this.apis = [...API_CONFIG.APIS];
    this.currentApi = null;
    this.healthCheckInterval = null;
    this.lastHealthCheck = {};
  }

  /**
   * 初始化API管理器
   */
  async init() {
    console.log('🚀 [ApiManager] 初始化API管理器...');
    
    // 深拷贝API配置，避免修改原始配置
    this.apis = JSON.parse(JSON.stringify(API_CONFIG.APIS));
    
    // 为智谱GLM动态设置API密钥
    const zhipuApi = this.apis.find(api => api.provider === 'zhipu');
    if (zhipuApi) {
      const zhipuConfig = zhipuConfigManager.getConfig();
      if (zhipuConfig.apiKey) {
        zhipuApi.apiKey = zhipuConfig.apiKey;
        console.log('🔑 [ApiManager] 已为智谱GLM设置API密钥');
      } else {
        console.log('⚠️ [ApiManager] 智谱GLM未设置API密钥');
      }
    }
    
    // 初始化健康检查记录
    this.lastHealthCheck = {};
    
    // 执行初始健康检查
    await this.checkAllApisHealth();
    
    // 选择第一个可用的API
    await this.switchToNextAvailableApi();
    
    console.log(`✅ [ApiManager] 初始化完成，当前API: ${this.currentApi?.name || 'None'}`);
  }



  /**
   * 获取当前可用的API
   */
  getCurrentApi() {
    return this.currentApi;
  }

  /**
   * 获取所有API状态
   */
  getAllApis() {
    return this.apis.map(api => ({
      name: api.name,
      provider: api.provider,
      available: api.available,
      priority: api.priority,
      lastCheck: this.lastHealthCheck[api.name]
    }));
  }

  /**
   * 健康检查单个API
   */
  async checkApiHealth(api) {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 [ApiManager] 检查API健康状态: ${api.name}`);
      
      // 如果是智谱GLM且需要API密钥但未设置，跳过检查
      if (api.provider === 'zhipu' && api.requiresApiKey && !api.apiKey) {
        console.log(`⚠️ [ApiManager] ${api.name} 需要设置API密钥，跳过健康检查`);
        api.available = false;
        this.lastHealthCheck[api.name] = {
          timestamp: Date.now(),
          healthy: false,
          responseTime: 0,
          status: null,
          error: '需要设置API密钥'
        };
        return false;
      }
      
      // 构建测试请求
      const testRequest = {
        model: api.model,
        messages: [
          {
            role: 'user',
            content: 'Test connection'
          }
        ],
        max_tokens: 10,
        temperature: 0.7
      };

      // 构建请求头
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api.apiKey}`,
        ...api.headers // 添加API特定的头部
      };

      // 根据API提供商选择不同的端点
      let endpoint;
      if (api.provider === 'zhipu') {
        endpoint = `${api.baseUrl}chat/completions`;
      } else {
        endpoint = `${api.baseUrl}/chat/completions`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(testRequest),
        signal: AbortSignal.timeout(API_CONFIG.HEALTH_CHECK.TIMEOUT)
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok || response.status === 400; // 400可能是参数问题，但API可达

      this.lastHealthCheck[api.name] = {
        timestamp: Date.now(),
        healthy: isHealthy,
        responseTime,
        status: response.status,
        error: isHealthy ? null : `HTTP ${response.status}`
      };

      // 更新API可用状态
      api.available = isHealthy;

      console.log(`${isHealthy ? '✅' : '❌'} [ApiManager] ${api.name} 健康检查完成: ${responseTime}ms, 状态: ${response.status}`);

      return isHealthy;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.lastHealthCheck[api.name] = {
        timestamp: Date.now(),
        healthy: false,
        responseTime,
        status: null,
        error: error.message || 'Network error'
      };

      api.available = false;
      
      console.log(`❌ [ApiManager] ${api.name} 健康检查失败: ${error.message}`);
      
      return false;
    }
  }

  /**
   * 检查所有API的健康状态
   */
  async checkAllApisHealth() {
    console.log('🔄 [ApiManager] 开始全面健康检查...');
    
    const healthPromises = this.apis.map(api => this.checkApiHealth(api));
    await Promise.allSettled(healthPromises);
    
    // 检查当前API是否仍然可用
    if (!this.currentApi?.available) {
      await this.switchToNextAvailableApi();
    }
    
    const availableCount = this.apis.filter(api => api.available).length;
    console.log(`📊 [ApiManager] 健康检查完成，可用API: ${availableCount}/${this.apis.length}`);
  }

  /**
   * 切换到下一个可用的API
   */
  async switchToNextAvailableApi() {
    const availableApis = this.apis.filter(api => api.available);
    
    if (availableApis.length === 0) {
      console.warn('⚠️ [ApiManager] 没有可用的API');
      return false;
    }

    // 选择优先级最高的可用API
    const nextApi = availableApis[0];
    
    if (nextApi !== this.currentApi) {
      const oldApi = this.currentApi?.name || 'None';
      this.currentApi = nextApi;
      console.log(`🔄 [ApiManager] API切换: ${oldApi} -> ${nextApi.name}`);
      
      // 触发切换事件
      this.onApiSwitch?.(nextApi, oldApi);
    }

    return true;
  }

  /**
   * 尝试使用指定API发送请求
   */
  async makeRequest(messages, options = {}) {
    if (!this.currentApi) {
      throw new Error('没有可用的API');
    }

    const api = this.currentApi;
    
    // 检查智谱GLM是否需要API密钥
    if (api.provider === 'zhipu' && api.requiresApiKey && !api.apiKey) {
      throw new Error('智谱GLM需要设置API密钥，请在设置中配置');
    }
    
    const requestBody = {
      model: api.model,
      messages: messages,
      ...API_CONFIG.DEFAULT_PARAMS,
      ...options
    };

    console.log(`📤 [ApiManager] 使用 ${api.name} 发送请求`);
    console.log(`📋 [ApiManager] 请求体:`, JSON.stringify(requestBody, null, 2));

    try {
      // 构建请求头
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api.apiKey}`,
        ...api.headers // 添加API特定的头部
      };

      console.log(`📡 [ApiManager] 请求头:`, headers);

      // 根据API提供商选择不同的端点
      let endpoint;
      if (api.provider === 'zhipu') {
        endpoint = `${api.baseUrl}chat/completions`;
      } else {
        endpoint = `${api.baseUrl}/chat/completions`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000) // 30秒超时
      });

      console.log(`📶 [ApiManager] 响应状态: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        // 尝试读取错误响应体
        let errorText = '';
        try {
          errorText = await response.text();
          console.log(`❌ [ApiManager] 错误响应内容:`, errorText);
        } catch (e) {
          console.log(`❌ [ApiManager] 无法读取错误响应内容`);
        }

        // 标记当前API为不可用
        api.available = false;
        this.lastHealthCheck[api.name] = {
          timestamp: Date.now(),
          healthy: false,
          responseTime: 0,
          status: response.status,
          error: `HTTP ${response.status}: ${errorText}`
        };

        // 尝试切换到其他API
        const switched = await this.switchToNextAvailableApi();
        if (switched && this.currentApi !== api) {
          console.log(`🔄 [ApiManager] 请求失败，已切换到 ${this.currentApi.name}，重试请求`);
          return this.makeRequest(messages, options); // 递归重试
        }

        throw new Error(`API请求失败: ${response.status} ${response.statusText}${errorText ? ': ' + errorText : ''}`);
      }

      const data = await response.json();
      console.log(`📥 [ApiManager] 响应数据:`, JSON.stringify(data, null, 2));
      
      // 检查响应内容是否有效
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.warn(`⚠️ [ApiManager] ${api.name} 返回了无效的响应结构`);
        throw new Error('API返回了无效的响应结构');
      }

      const content = data.choices[0].message.content;
      if (!content || content.trim().length === 0) {
        console.warn(`⚠️ [ApiManager] ${api.name} 返回了空内容`);
        throw new Error('API返回了空内容');
      }

      console.log(`✅ [ApiManager] ${api.name} 请求成功，内容长度: ${content.length}`);
      
      return data;

    } catch (error) {
      console.error(`❌ [ApiManager] ${api.name} 请求失败:`, error);
      
      // 标记当前API为不可用
      api.available = false;
      
      // 尝试切换到其他API
      const switched = await this.switchToNextAvailableApi();
      if (switched && this.currentApi !== api) {
        console.log(`🔄 [ApiManager] 请求错误，已切换到 ${this.currentApi.name}，重试请求`);
        return this.makeRequest(messages, options); // 递归重试
      }

      throw error;
    }
  }

  /**
   * 开始定期健康检查
   */
  startHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // 立即执行一次健康检查
    this.checkAllApisHealth();

    // 设置定期检查
    this.healthCheckInterval = setInterval(() => {
      this.checkAllApisHealth();
    }, API_CONFIG.HEALTH_CHECK.RETRY_INTERVAL);

    console.log('🩺 [ApiManager] 健康检查服务已启动');
  }

  /**
   * 停止健康检查
   */
  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('🛑 [ApiManager] 健康检查服务已停止');
    }
  }

  /**
   * 手动重新检查所有API
   */
  async refreshApis() {
    console.log('🔄 [ApiManager] 手动刷新API状态...');
    await this.checkAllApisHealth();
  }

  /**
   * 设置API切换回调
   */
  onApiSwitch(callback) {
    this.onApiSwitch = callback;
  }

  /**
   * 获取API状态报告
   */
  getStatusReport() {
    const report = {
      currentApi: this.currentApi?.name || 'None',
      totalApis: this.apis.length,
      availableApis: this.apis.filter(api => api.available).length,
      apis: this.getAllApis()
    };

    return report;
  }

  /**
   * 手动设置首选API
   */
  setPreferredApi(targetApi) {
    const foundApi = this.apis.find(api => api.name === targetApi.name);
    if (foundApi) {
      const oldApi = this.currentApi?.name || 'None';
      this.currentApi = foundApi;
      console.log(`🎯 [ApiManager] 手动切换API: ${oldApi} -> ${foundApi.name}`);
      
      // 触发切换事件
      this.onApiSwitch?.(foundApi, oldApi);
      return true;
    }
    return false;
  }

  /**
   * 更新智谱GLM API密钥
   */
  async updateZhipuApiKey() {
    const zhipuApi = this.apis.find(api => api.provider === 'zhipu');
    if (zhipuApi) {
      const zhipuConfig = zhipuConfigManager.getConfig();
      if (zhipuConfig.apiKey) {
        zhipuApi.apiKey = zhipuConfig.apiKey;
        console.log('🔑 [ApiManager] 智谱GLM API密钥已更新');
        
        // 重新检查健康状态
        await this.checkApiHealth(zhipuApi);
        
        // 如果当前没有可用API，尝试切换
        if (!this.currentApi?.available) {
          await this.switchToNextAvailableApi();
        }
        
        return true;
      } else {
        zhipuApi.apiKey = null;
        zhipuApi.available = false;
        console.log('⚠️ [ApiManager] 智谱GLM API密钥已清除');
        return false;
      }
    }
    return false;
  }
}

// 创建全局单例
const apiManager = new ApiManager();

export default apiManager;