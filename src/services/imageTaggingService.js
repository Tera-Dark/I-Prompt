/**
 * 图像反推标签服务
 * 调用本地Python后端 (与测试模块完全一致)
 */

// WD-Tagger 配置
const WD_TAGGER_CONFIG = {
  // 根据环境选择API URL
  localApiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://i-prompt-api.vercel.app/api'  // 生产环境：固定域名
    : 'http://localhost:5000/api',           // 开发环境：本地服务器
  
  // 可用的模型列表
  models: [
    "SmilingWolf/wd-swinv2-tagger-v3",
    "SmilingWolf/wd-convnext-tagger-v3", 
    "SmilingWolf/wd-vit-tagger-v3",
    "SmilingWolf/wd-vit-large-tagger-v3",
    "SmilingWolf/wd-eva02-large-tagger-v3"
  ],
  defaultModel: "SmilingWolf/wd-swinv2-tagger-v3",
  
  // 请求配置
  timeout: 120000, // 120秒超时（考虑Gradio API调用时间）
  maxFileSize: 10 * 1024 * 1024, // 10MB
  
  // 支持的图像格式
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
};

/**
 * 验证图像文件
 */
export const validateImageFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('请选择图像文件');
    return { isValid: false, errors };
  }
  
  // 检查文件类型
  if (!WD_TAGGER_CONFIG.supportedFormats.includes(file.type)) {
    errors.push('不支持的图像格式，请使用 JPG、PNG、WebP 格式');
  }
  
  // 检查文件大小
  if (file.size > WD_TAGGER_CONFIG.maxFileSize) {
    errors.push('图像文件过大，请使用小于10MB的图像');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 检查本地Python后端状态
 */
const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${WD_TAGGER_CONFIG.localApiUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(60000)  // 延长到60秒，考虑Vercel冷启动
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Python后端连接正常:', result);
      return true;
    } else {
      console.log('⚠️ Python后端响应异常:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Python后端连接失败:', error.message);
    return false;
  }
};

/**
 * 调用本地Python后端分析图像
 */
const callLocalBackend = async (imageFile, options = {}) => {
  const {
    model = WD_TAGGER_CONFIG.defaultModel,
    generalThresh = 0.35,
    generalMcut = false,
    characterThresh = 0.85,
    characterMcut = false
  } = options;

  console.log('🐍 调用本地Python后端...');
  console.log(`🤖 模型: ${model}`);
  console.log(`⚙️ 参数: 一般阈值=${generalThresh}, 角色阈值=${characterThresh}`);

  try {
    // 创建FormData (完全按照测试模块的参数名称)
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('model_repo', model);  // 使用测试模块的参数名
    formData.append('general_thresh', generalThresh);
    formData.append('general_mcut_enabled', generalMcut);
    formData.append('character_thresh', characterThresh);
    formData.append('character_mcut_enabled', characterMcut);

    const response = await fetch(`${WD_TAGGER_CONFIG.localApiUrl}/wd-tagger`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(WD_TAGGER_CONFIG.timeout)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 本地后端调用成功');
      return result;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

  } catch (error) {
    console.error('❌ 本地后端调用失败:', error);
    throw new Error(`本地后端调用失败: ${error.message}`);
  }
};

/**
 * 主要的图像标签识别函数
 */
export const analyzeImageTags = async (file, options = {}) => {
  console.log('🖼️ [imageTaggingService] 开始图像标签识别');
  
  try {
    // 1. 验证文件
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // 2. 检查本地后端状态
    console.log('🔍 检查本地Python后端状态...');
    const backendOnline = await checkBackendHealth();
    
    if (!backendOnline) {
      throw new Error('本地Python后端不可用，请确保已启动 python server.py');
    }
    
    // 3. 调用本地Python后端
    console.log('🐍 使用本地Python后端...');
    const result = await callLocalBackend(file, options);
    
    if (!result || !result.success) {
      return {
        success: false,
        error: result?.error || '识别失败',
        totalTags: 0,
        tags: []
      };
    }
    
    // 4. 处理返回的数据，添加category属性
    const processedData = processTagData(result.data);
    
    // 5. 计算总标签数
    const totalTags = (processedData.general?.length || 0) + 
                     (processedData.character?.length || 0) + 
                     (processedData.copyright?.length || 0) + 
                     (processedData.artist?.length || 0) + 
                     (processedData.meta?.length || 0);
    
    console.log(`✅ 成功识别到 ${totalTags} 个标签`);
    
    return {
      success: true,
      data: processedData,
      totalTags: totalTags,
      modelUsed: options.model || WD_TAGGER_CONFIG.defaultModel,
      processingTime: Date.now(),
      source: 'local-backend'
    };

  } catch (error) {
    console.error('❌ 图像标签识别失败:', error);
    
    return {
      success: false,
      error: error.message,
      suggestions: [
        '确保本地Python后端已启动 (python server.py)',
        '检查Python依赖是否安装 (pip install -r requirements.txt)',
        '检查网络连接到Hugging Face'
      ],
      totalTags: 0,
      tags: []
    };
  }
};

/**
 * 处理标签数据，为每个标签添加category属性
 */
const processTagData = (data) => {
  const processedData = { ...data };
  
  // 为general标签添加category
  if (processedData.general) {
    processedData.general = processedData.general.map(tag => ({
      ...tag,
      category: 'general'
    }));
  }
  
  // 为character标签添加category
  if (processedData.character) {
    processedData.character = processedData.character.map(tag => ({
      ...tag,
      category: 'character'
    }));
  }
  
  // 为copyright标签添加category
  if (processedData.copyright) {
    processedData.copyright = processedData.copyright.map(tag => ({
      ...tag,
      category: 'copyright'
    }));
  }
  
  // 为artist标签添加category
  if (processedData.artist) {
    processedData.artist = processedData.artist.map(tag => ({
      ...tag,
      category: 'artist'
    }));
  }
  
  // 为meta标签添加category
  if (processedData.meta) {
    processedData.meta = processedData.meta.map(tag => ({
      ...tag,
      category: 'meta'
    }));
  }
  
  return processedData;
};

/**
 * 将标签转换为提示词格式
 */
export const tagsToPrompt = (tags, options = {}) => {
  const {
    minConfidence = 0.5,
    maxTags = 50,
    includeConfidence = false,
    category = 'all'
  } = options;
  
  let selectedTags = [];
  
  if (category === 'all') {
    selectedTags = [
      ...(tags.general || []),
      ...(tags.character || []),
      ...(tags.copyright || []),
      ...(tags.artist || [])
    ];
  } else {
    selectedTags = tags[category] || [];
  }
  
  // 过滤和排序
  const filteredTags = selectedTags
    .filter(tag => tag.confidence >= minConfidence)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxTags);
  
  // 生成提示词字符串
  const promptTags = filteredTags.map(tag => {
    if (includeConfidence) {
      return `${tag.tag} (${(tag.confidence * 100).toFixed(1)}%)`;
    }
    return tag.tag;
  });
  
  return promptTags.join(', ');
};

/**
 * 获取可用的模型列表
 */
export const getAvailableModels = () => {
  return WD_TAGGER_CONFIG.models.map(model => ({
    id: model,
    name: model.split('/')[1] || model,
    fullName: model
  }));
};

/**
 * 检查后端状态
 */
export const checkBackendStatus = async () => {
  return await checkBackendHealth();
};

/**
 * 导出配置
 */
export const imageTaggingConfig = WD_TAGGER_CONFIG;

// 默认导出
const imageTaggingService = {
  analyzeImageTags,
  validateImageFile,
  tagsToPrompt,
  getAvailableModels,
  checkBackendStatus,
  imageTaggingConfig
};

export default imageTaggingService; 