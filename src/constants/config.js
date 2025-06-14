// API配置 - 多个备用选项
export const API_CONFIG = {
  // 主要API选项
  APIS: [
    {
      name: 'SiliconFlow-DeepSeek-R1',
      provider: 'siliconflow',
      baseUrl: 'https://api.siliconflow.cn/v1',
      apiKey: process.env.REACT_APP_SILICONFLOW_API_KEY || 'sk-zzvfbjuitzusxvjwztcfrlpnjzcfdkutdkgxnhrwgihtytkh',
      model: 'deepseek-ai/DeepSeek-R1',
      available: true,
      priority: 1,
      description: 'DeepSeek-R1 推理模型，理解能力强'
    },
    {
      name: 'SiliconFlow-DeepSeek-V3',
      provider: 'siliconflow',
      baseUrl: 'https://api.siliconflow.cn/v1',
      apiKey: process.env.REACT_APP_SILICONFLOW_API_KEY || 'sk-zzvfbjuitzusxvjwztcfrlpnjzcfdkutdkgxnhrwgihtytkh',
      model: 'deepseek-ai/DeepSeek-V3',
      available: true,
      priority: 2,
      description: 'DeepSeek-V3 最新模型，性能更强'
    },
    {
      name: 'SiliconFlow-DeepSeek-R1-Qwen3',
      provider: 'siliconflow',
      baseUrl: 'https://api.siliconflow.cn/v1',
      apiKey: process.env.REACT_APP_SILICONFLOW_API_KEY || 'sk-zzvfbjuitzusxvjwztcfrlpnjzcfdkutdkgxnhrwgihtytkh',
      model: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
      available: true,
      priority: 3,
      description: 'DeepSeek-R1 Qwen3混合模型'
    },
    {
      name: 'NVIDIA-DeepSeek-R1',
      provider: 'nvidia',
      baseUrl: 'https://integrate.api.nvidia.com/v1',
      apiKey: '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',
      model: 'deepseek-ai/deepseek-r1',
      available: true,
      priority: 4,
      description: 'NVIDIA API DeepSeek-R1 模型',
      headers: {
        'User-Agent': 'I-Prompt/3.0 NVIDIA-API-Client'
      }
    },
    {
      name: 'OpenRouter-DeepSeek',
      provider: 'openrouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: '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',
      model: 'deepseek/deepseek-chat',
      available: true,
      priority: 5,
      description: 'OpenRouter DeepSeek 模型',
      headers: {
        'HTTP-Referer': window.location.origin, // OpenRouter要求的额外头
        'X-Title': 'I-Prompt Assistant'
      }
    }
  ],

  // 默认参数
  DEFAULT_PARAMS: {
    max_tokens: 512,
    temperature: 0.7,
    top_p: 0.9,
    stream: false
  },

  // 健康检查配置
  HEALTH_CHECK: {
    TIMEOUT: 5000, // 5秒超时
    RETRY_INTERVAL: 30000, // 30秒重试间隔
    MAX_RETRIES: 3 // 最大重试次数
  }
};

// 应用配置
export const APP_CONFIG = {
  // 输入限制
  MAX_INPUT_LENGTH: 500,
  MIN_INPUT_LENGTH: 2,
  
  // API配置 - 兼容旧版本
  API: {
    // 当前使用的API (动态设置)
    CURRENT_API: null,
    // 备用API列表
    AVAILABLE_APIS: [],
    // 默认参数
    MAX_TOKENS: 512,
    TEMPERATURE_RANGE: [0.6, 1.0],
    TOP_P: 0.9
  },
  
  // 文件上传限制
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  },
  
  // 界面配置
  UI: {
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 3000,
    ANIMATION_DURATION: 300
  },
  
  // 功能开关
  FEATURES: {
    AI_GENERATION: true,
    IMAGE_EXTRACTION: true,
    OFFLINE_MODE: true,
    DARK_MODE: false
  },
  
  NAME: 'I Prompt',
  VERSION: '1.0.0',
  DESCRIPTION: '智能提示词助手，让AI创作更简单',
  AUTHOR: 'I Prompt Team',
  LOCAL_PORT: 3000,
  GENERATION_TIMEOUT: 30000 // 30秒超时
};

// 路由配置
export const ROUTES = {
  GENERATOR: 'generator',
  LIBRARY: 'library',
  EXTRACTOR: 'extractor',
  TOOLS: 'tools',
  TUTORIAL: 'tutorial'
};

// 错误消息
export const ERROR_MESSAGES = {
  VALIDATION: {
    EMPTY_INPUT: '请输入描述内容',
    INPUT_TOO_SHORT: `输入内容至少需要${APP_CONFIG.MIN_INPUT_LENGTH}个字符`,
    INPUT_TOO_LONG: `输入内容不能超过${APP_CONFIG.MAX_INPUT_LENGTH}个字符`,
    INVALID_FILE_TYPE: '不支持的文件类型',
    FILE_TOO_LARGE: `文件大小不能超过${APP_CONFIG.FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB`,
    NO_FILE_SELECTED: '请选择文件'
  },
  API: {
    NETWORK_ERROR: '网络连接失败，请检查网络设置',
    SERVER_ERROR: '服务器错误，请稍后重试',
    TIMEOUT_ERROR: '请求超时，请重试',
    RATE_LIMIT: '请求频率过高，请稍后再试',
    INVALID_RESPONSE: 'API返回数据格式错误'
  },
  GENERAL: {
    UNKNOWN_ERROR: '未知错误，请重试',
    COPY_FAILED: '复制到剪贴板失败',
    PASTE_FAILED: '粘贴失败'
  }
};

// 成功消息
export const SUCCESS_MESSAGES = {
  COPY_SUCCESS: '已成功复制到剪贴板',
  GENERATION_SUCCESS: '提示词生成成功',
  UPLOAD_SUCCESS: '文件上传成功',
  SAVE_SUCCESS: '保存成功'
}; 