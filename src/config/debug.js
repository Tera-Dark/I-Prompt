/**
 * 调试配置
 * 用于控制生产环境中的日志输出
 */

// 检测是否为生产环境
const isProduction = process.env.NODE_ENV === 'production';

// 调试配置
export const DEBUG_CONFIG = {
  // 是否启用调试日志
  ENABLE_LOGS: !isProduction,
  
  // 翻译管理器日志
  TRANSLATION_LOGS: !isProduction,
  
  // API管理器日志
  API_LOGS: !isProduction,
  
  // 组件日志
  COMPONENT_LOGS: !isProduction,
  
  // 错误日志 (生产环境也保留)
  ERROR_LOGS: true,
  
  // 警告日志 (生产环境也保留)
  WARN_LOGS: true
};

/**
 * 条件日志函数
 */
export const logger = {
  log: (...args) => {
    if (DEBUG_CONFIG.ENABLE_LOGS) {
      console.log(...args);
    }
  },
  
  warn: (...args) => {
    if (DEBUG_CONFIG.WARN_LOGS) {
      console.warn(...args);
    }
  },
  
  error: (...args) => {
    if (DEBUG_CONFIG.ERROR_LOGS) {
      console.error(...args);
    }
  },
  
  translation: (...args) => {
    if (DEBUG_CONFIG.TRANSLATION_LOGS) {
      console.log(...args);
    }
  },
  
  api: (...args) => {
    if (DEBUG_CONFIG.API_LOGS) {
      console.log(...args);
    }
  },
  
  component: (...args) => {
    if (DEBUG_CONFIG.COMPONENT_LOGS) {
      console.log(...args);
    }
  },
  
  ui: (...args) => {
    if (DEBUG_CONFIG.COMPONENT_LOGS) {
      console.log(...args);
    }
  },
  
  analysis: (...args) => {
     if (DEBUG_CONFIG.ENABLE_LOGS) {
       console.log(...args);
     }
   }
 };

export default logger;