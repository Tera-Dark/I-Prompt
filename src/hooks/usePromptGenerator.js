import { useState, useCallback } from 'react';
import { validateInput, cleanPrompt } from '../utils/validation';
import { copyToClipboard } from '../utils/clipboard';
import { APP_CONFIG, ERROR_MESSAGES } from '../constants/config';

/**
 * 提示词生成器 Hook - 使用 DeepSeek API
 */
export const usePromptGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  const [apiError, setApiError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  /**
   * 验证输入
   */
  const validatePromptInput = useCallback((text) => {
    const validation = validateInput(text);
    setValidationErrors(validation.errors);
    return validation.isValid;
  }, []);

  /**
   * 生成提示词 - 使用 DeepSeek API
   */
  const generateApiPrompt = useCallback(async (text, style) => {
    const requestBody = {
      model: APP_CONFIG.API.MODEL,
      messages: [
        {
          role: 'system',
          content: `你是一个专业的AI绘画提示词生成助手。请根据用户的描述，生成高质量的英文提示词。

要求：
1. 输出纯英文提示词，用逗号分隔
2. 包含质量控制词如 masterpiece, best quality, ultra detailed
3. 根据风格要求添加对应的风格描述词
4. 确保语法正确，词汇专业
5. 长度控制在100-200个词汇之间
6. 不要包含任何解释文字，只输出提示词
7. 提示词要具体生动，包含丰富的细节描述

风格要求：${style || '通用风格'}`
        },
        {
          role: 'user',
          content: `请为以下描述生成AI绘画提示词：${text}`
        }
      ],
      max_tokens: APP_CONFIG.API.MAX_TOKENS,
      temperature: 0.7,
      top_p: APP_CONFIG.API.TOP_P
    };

    const response = await fetch(APP_CONFIG.API.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APP_CONFIG.API.SILICONFLOW_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error(ERROR_MESSAGES.API.INVALID_RESPONSE);
    }

    return cleanPrompt(data.choices[0].message.content);
  }, []);

  /**
   * 主生成函数 - 只使用 DeepSeek API
   */
  const generatePrompt = useCallback(async () => {
    // 验证输入
    if (!validatePromptInput(inputText)) {
      return false;
    }

    setIsGenerating(true);
    setApiError(null);

    try {
      const result = await generateApiPrompt(inputText, selectedStyle);
      setGeneratedPrompt(result);
      setGenerationCount(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('DeepSeek API 生成提示词失败:', error);
      setApiError(error.message || ERROR_MESSAGES.API.UNKNOWN_ERROR);
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, selectedStyle, validatePromptInput, generateApiPrompt]);

  /**
   * 复制提示词
   */
  const copyPrompt = useCallback(async (text = generatedPrompt) => {
    const success = await copyToClipboard(text);
    return success;
  }, [generatedPrompt]);

  /**
   * 插入标签到输入框
   */
  const insertTag = useCallback((tag) => {
    const tagText = typeof tag === 'object' ? tag.en : tag;
    const currentText = inputText.trim();
    
    if (currentText) {
      setInputText(prev => `${prev}, ${tagText}`);
    } else {
      setInputText(tagText);
    }
  }, [inputText]);

  /**
   * 重置所有状态
   */
  const reset = useCallback(() => {
    setInputText('');
    setGeneratedPrompt('');
    setSelectedStyle('');
    setApiError(null);
    setValidationErrors([]);
    setGenerationCount(0);
  }, []);

  /**
   * 从提示词中提取风格
   */
  const extractStyleFromPrompt = useCallback((prompt) => {
    const styleKeywords = {
      'realistic': ['photorealistic', 'hyperrealistic', 'realistic', 'photograph'],
      'anime': ['anime', 'manga', 'cel shading', 'cartoon'],
      'oil': ['oil painting', 'classical', 'renaissance'],
      'watercolor': ['watercolor', 'aquarelle'],
      'sketch': ['sketch', 'pencil', 'charcoal', 'drawing']
    };

    const lowerPrompt = prompt.toLowerCase();
    
    for (const [style, keywords] of Object.entries(styleKeywords)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        return style;
      }
    }
    
    return '';
  }, []);

  return {
    // 状态
    inputText,
    generatedPrompt,
    selectedStyle,
    isGenerating,
    generationCount,
    apiError,
    validationErrors,
    
    // 设置函数
    setInputText,
    setSelectedStyle,
    setGeneratedPrompt,
    
    // 操作函数
    generatePrompt,
    copyPrompt,
    insertTag,
    reset,
    extractStyleFromPrompt,
    validatePromptInput
  };
}; 