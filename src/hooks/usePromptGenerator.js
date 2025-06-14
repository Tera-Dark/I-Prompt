import { useState, useCallback, useEffect } from 'react';
import { validateInput, cleanPrompt } from '../utils/validation';
import { copyToClipboard } from '../utils/clipboard';
import { APP_CONFIG, ERROR_MESSAGES, API_CONFIG } from '../constants/config';
import { persistentStorage } from '../utils/persistentStorage';
import apiManager from '../services/apiManager';

/**
 * 提示词生成器 Hook - 使用多API自动切换
 */
export const usePromptGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  const [apiError, setApiError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [savedResults, setSavedResults] = useState([]);
  const [currentApiInfo, setCurrentApiInfo] = useState(null);

  // 获取可用模型列表
  const getAvailableModels = useCallback(() => {
    return API_CONFIG.APIS.map(api => ({
      id: api.name,
      name: api.name,
      description: api.description || api.model,
      provider: api.provider,
      model: api.model,
      available: api.available
    }));
  }, []);

  // 根据选择的模型切换API
  const switchToModel = useCallback((modelId) => {
    const targetApi = API_CONFIG.APIS.find(api => api.name === modelId);
    if (targetApi) {
      apiManager.setPreferredApi(targetApi);
      setCurrentApiInfo(targetApi);
      console.log(`🔄 [Hook] 切换到模型: ${targetApi.name} (${targetApi.model})`);
    }
  }, []);

  // 初始化时恢复数据
  useEffect(() => {
    // 恢复草稿内容
    const draft = persistentStorage.getDraftContent();
    if (draft) {
      setInputText(draft.inputText || '');
      setSelectedStyle(draft.selectedStyle || '');
      setSelectedModel(draft.selectedModel || '');
      console.log('✅ 恢复草稿内容');
    }

    // 加载历史记录
    const history = persistentStorage.getGeneratedPrompts();
    setSavedResults(history.slice(0, 10)); // 显示最近10条

    // 监听API切换事件
    apiManager.onApiSwitch = (newApi, oldApi) => {
      setCurrentApiInfo(newApi);
      setSelectedModel(newApi.name);
      console.log(`🔄 [Hook] API已切换: ${oldApi} -> ${newApi.name}`);
    };

    // 设置初始API信息
    const currentApi = apiManager.getCurrentApi();
    setCurrentApiInfo(currentApi);
    setSelectedModel(currentApi?.name || '');
  }, []);

  // 自动保存草稿
  useEffect(() => {
    if (inputText || selectedStyle || selectedModel) {
      const timer = setTimeout(() => {
        persistentStorage.saveDraftContent({
          inputText,
          selectedStyle,
          selectedModel
        });
      }, 2000); // 2秒后自动保存

      return () => clearTimeout(timer);
    }
  }, [inputText, selectedStyle, selectedModel]);

  // 监听模型选择变化
  useEffect(() => {
    if (selectedModel && selectedModel !== currentApiInfo?.name) {
      switchToModel(selectedModel);
    }
  }, [selectedModel, currentApiInfo, switchToModel]);

  /**
   * 验证输入
   */
  const validatePromptInput = useCallback((text) => {
    const validation = validateInput(text);
    setValidationErrors(validation.errors);
    return validation.isValid;
  }, []);

  /**
   * 生成提示词 - 使用API管理器自动切换
   */
  const generateApiPrompt = useCallback(async (text, style) => {
    const messages = [
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
    ];

    // 使用API管理器发送请求，自动处理切换
    const data = await apiManager.makeRequest(messages, {
      max_tokens: APP_CONFIG.API.MAX_TOKENS,
      temperature: 0.7,
      top_p: APP_CONFIG.API.TOP_P
    });

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error(ERROR_MESSAGES.API.INVALID_RESPONSE);
    }

    return cleanPrompt(data.choices[0].message.content);
  }, []);

  /**
   * 主生成函数 - 使用API管理器自动切换
   */
  const generatePrompt = useCallback(async () => {
    // 验证输入
    if (!validatePromptInput(inputText)) {
      return false;
    }

    setIsGenerating(true);
    setApiError(null);

    try {
      // 保存输入历史
      persistentStorage.saveInputHistory(inputText, selectedStyle);

      const result = await generateApiPrompt(inputText, selectedStyle);
      setGeneratedPrompt(result);
      
      // 保存生成结果
      const newGenerationCount = generationCount + 1;
      setGenerationCount(newGenerationCount);
      const sessionId = persistentStorage.saveGeneratedPrompt({
        inputText,
        selectedStyle,
        generatedPrompt: result,
        source: 'ai',
        generationCount: newGenerationCount,
        apiUsed: apiManager.getCurrentApi()?.name || 'Unknown'
      });

      setCurrentSessionId(sessionId);

      // 更新历史列表
      const updatedHistory = persistentStorage.getGeneratedPrompts();
      setSavedResults(updatedHistory.slice(0, 10));

      // 清除草稿
      persistentStorage.clearDraftContent();

      // 更新当前API信息
      setCurrentApiInfo(apiManager.getCurrentApi());

      return true;
    } catch (error) {
      console.error('API 生成提示词失败:', error);
      
      // 获取详细的API状态信息
      const statusReport = apiManager.getStatusReport();
      const errorMessage = error.message || ERROR_MESSAGES.API.UNKNOWN_ERROR;
      
      // 如果没有可用的API，提供更详细的错误信息
      if (statusReport.availableApis === 0) {
        setApiError('所有API服务暂时不可用，请稍后重试');
      } else {
        setApiError(`${errorMessage} (当前使用: ${statusReport.currentApi})`);
      }
      
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, selectedStyle, validatePromptInput, generateApiPrompt, generationCount]);

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

  /**
   * 获取API状态信息
   */
  const getApiStatus = useCallback(() => {
    return apiManager.getStatusReport();
  }, []);

  /**
   * 手动刷新API状态
   */
  const refreshApiStatus = useCallback(async () => {
    await apiManager.refreshApis();
    setCurrentApiInfo(apiManager.getCurrentApi());
  }, []);

  return {
    // 状态
    inputText,
    generatedPrompt,
    selectedStyle,
    selectedModel,
    isGenerating,
    generationCount,
    apiError,
    validationErrors,
    currentSessionId,
    savedResults,
    currentApiInfo,
    
    // 设置函数
    setInputText,
    setSelectedStyle,
    setSelectedModel,
    setGeneratedPrompt,
    
    // 操作函数
    generatePrompt,
    copyPrompt,
    insertTag,
    reset,
    extractStyleFromPrompt,
    validatePromptInput,
    
    // API管理功能
    getApiStatus,
    refreshApiStatus,
    
    // 持久化功能
    loadFromHistory: (id) => {
      const result = persistentStorage.getGeneratedPromptById(id);
      if (result) {
        setInputText(result.inputText);
        setSelectedStyle(result.selectedStyle || '');
        setSelectedModel(result.selectedModel || '');
        setGeneratedPrompt(result.generatedPrompt);
        return true;
      }
      return false;
    },
    
    clearHistory: () => {
      persistentStorage.clearAllData();
      setSavedResults([]);
    },
    
    exportHistory: () => {
      return persistentStorage.exportData();
    },
    
    importHistory: (data) => {
      const success = persistentStorage.importData(data);
      if (success) {
        const history = persistentStorage.getGeneratedPrompts();
        setSavedResults(history.slice(0, 10));
      }
      return success;
    },

    // 新增功能
    getAvailableModels,
    switchToModel
  };
}; 