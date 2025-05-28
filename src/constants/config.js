// API配置
export const API_CONFIG = {
  SILICONFLOW_API_KEY: process.env.REACT_APP_SILICONFLOW_API_KEY || 'sk-zzvfbjuitzusxvjwztcfrlpnjzcfdkutdkgxnhrwgihtytkh',
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://api.siliconflow.cn/v1',
  ENDPOINTS: {
    CHAT_COMPLETIONS: '/chat/completions'
  },
  DEFAULT_MODEL: 'deepseek-ai/DeepSeek-R1',
  DEFAULT_PARAMS: {
    max_tokens: 512,
    temperature: 0.7,
    top_p: 0.9,
    stream: false
  }
};

// 应用配置
export const APP_CONFIG = {
  // 输入限制
  MAX_INPUT_LENGTH: 500,
  MIN_INPUT_LENGTH: 2,
  
  // API配置
  API: {
    SILICONFLOW_API_KEY: process.env.REACT_APP_SILICONFLOW_API_KEY || 'sk-zzvfbjuitzusxvjwztcfrlpnjzcfdkutdkgxnhrwgihtytkh',
    BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://api.siliconflow.cn/v1/chat/completions',
    MODEL: 'deepseek-ai/DeepSeek-R1',
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