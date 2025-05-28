import { APP_CONFIG, ERROR_MESSAGES } from '../constants/config';

/**
 * 验证输入文本
 * @param {string} text - 输入文本
 * @returns {Object} 验证结果
 */
export const validateInput = (text) => {
  const errors = [];
  
  if (!text || text.trim().length === 0) {
    errors.push(ERROR_MESSAGES.VALIDATION.EMPTY_INPUT);
  } else if (text.trim().length < APP_CONFIG.MIN_INPUT_LENGTH) {
    errors.push(ERROR_MESSAGES.VALIDATION.INPUT_TOO_SHORT);
  } else if (text.length > APP_CONFIG.MAX_INPUT_LENGTH) {
    errors.push(ERROR_MESSAGES.VALIDATION.INPUT_TOO_LONG);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证图片文件
 * @param {File} file - 文件对象
 * @returns {Object} 验证结果
 */
export const validateImageFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push(ERROR_MESSAGES.VALIDATION.NO_FILE_SELECTED);
    return { isValid: false, errors };
  }
  
  // 检查文件大小
  if (file.size > APP_CONFIG.FILE_UPLOAD.MAX_SIZE) {
    errors.push(ERROR_MESSAGES.VALIDATION.FILE_TOO_LARGE);
  }
  
  // 检查文件类型
  if (!APP_CONFIG.FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
    errors.push(ERROR_MESSAGES.VALIDATION.INVALID_FILE_TYPE);
  }
  
  // 检查文件扩展名
  const fileName = file.name.toLowerCase();
  const hasValidExtension = APP_CONFIG.FILE_UPLOAD.ALLOWED_EXTENSIONS.some(ext => 
    fileName.endsWith(ext)
  );
  
  if (!hasValidExtension) {
    errors.push(ERROR_MESSAGES.VALIDATION.INVALID_FILE_TYPE);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证API密钥
 * @param {string} apiKey - API密钥
 * @returns {boolean} 是否有效
 */
export const validateApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // 检查格式（假设API密钥是以 sk- 开头的字符串）
  return apiKey.startsWith('sk-') && apiKey.length > 10;
};

/**
 * 验证URL
 * @param {string} url - URL字符串
 * @returns {boolean} 是否有效
 */
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 清理和格式化提示词
 * @param {string} prompt - 原始提示词
 * @returns {string} 清理后的提示词
 */
export const cleanPrompt = (prompt) => {
  if (!prompt || typeof prompt !== 'string') {
    return '';
  }
  
  return prompt
    .trim()
    .replace(/\s+/g, ' ') // 多个空格替换为单个空格
    .replace(/[，。！？；：]/g, ',') // 中文标点替换为英文逗号
    .replace(/,+/g, ',') // 多个逗号替换为单个逗号
    .replace(/^,|,$/g, ''); // 移除首尾逗号
};

/**
 * 验证邮箱格式
 * @param {string} email 邮箱地址
 * @returns {boolean} 是否有效
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}; 