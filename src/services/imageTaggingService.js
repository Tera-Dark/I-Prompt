/**
 * 图像标签识别服务
 * 集成Hugging Face wd-tagger API
 */

// wd-tagger API配置
const WD_TAGGER_CONFIG = {
  // 基础URL
  baseUrl: 'https://smilingwolf-wd-tagger.hf.space',
  // 新的API端点格式
  apiEndpoints: [
    'https://smilingwolf-wd-tagger.hf.space/call/submit',  // 新的提交端点
    'https://smilingwolf-wd-tagger.hf.space/gradio_api/call/submit', // Gradio API格式
    'https://smilingwolf-wd-tagger.hf.space/api/v0/predict',  // 另一种可能格式
    'https://smilingwolf-wd-tagger.hf.space/run/predict',     // 备用格式
  ],
  // 支持的图像格式
  supportedFormats: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/bmp'
  ],
  // 最大文件大小 (10MB)
  maxFileSize: 10 * 1024 * 1024,
  // 可用的模型列表
  availableModels: [
    'SmilingWolf/wd-swinv2-tagger-v3',
    'SmilingWolf/wd-convnext-tagger-v3',
    'SmilingWolf/wd-vit-tagger-v3',
    'SmilingWolf/wd-vit-large-tagger-v3',
    'SmilingWolf/wd-eva02-large-tagger-v3',
    'SmilingWolf/wd-v1-4-moat-tagger-v2',
    'SmilingWolf/wd-v1-4-swinv2-tagger-v2',
    'SmilingWolf/wd-v1-4-convnext-tagger-v2',
    'SmilingWolf/wd-v1-4-convnextv2-tagger-v2',
    'SmilingWolf/wd-v1-4-vit-tagger-v2'
  ],
  defaultModel: 'SmilingWolf/wd-swinv2-tagger-v3',
  // 请求配置
  timeout: 120000, // 2分钟超时
  maxRetries: 2,   // 减少重试次数
  retryDelay: 3000 // 3秒重试间隔
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
    errors.push('不支持的图像格式，请使用 JPG、PNG、WebP 或 BMP 格式');
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
 * 将图像文件转换为Base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // 确保返回正确的base64格式
      const result = reader.result;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 压缩图像（如果需要）
 */
const compressImage = (file, maxWidth = 1024, quality = 0.9) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 计算压缩后的尺寸
      let { width, height } = img;
      
      if (width > maxWidth || height > maxWidth) {
        const ratio = Math.min(maxWidth / width, maxWidth / height);
        width = width * ratio;
        height = height * ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 绘制压缩后的图像
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 调用wd-tagger API进行图像标签识别
 * 使用最新的Hugging Face Spaces API格式
 */
const callWdTaggerAPI = async (imageData, model, generalThreshold, characterThreshold) => {
  console.log('🌐 开始调用wd-tagger API...');
  
  // 多种API调用方式
  const apiEndpoints = [
    `${WD_TAGGER_CONFIG.baseUrl}/run/predict`,
    `${WD_TAGGER_CONFIG.baseUrl}/api/predict`,
    `${WD_TAGGER_CONFIG.baseUrl}/call/predict`
  ];
  
  let lastError = null;
  
  for (const apiUrl of apiEndpoints) {
    try {
      console.log(`📤 尝试API端点: ${apiUrl}`);
      
      // 构建请求负载
      const payload = {
        data: [
          imageData,           // 图像数据 (base64，不需要data:前缀)
          model,              // 模型选择
          generalThreshold,   // General tags阈值
          characterThreshold, // Character tags阈值
          false,              // 使用标准阈值
          false               // 不使用MCut阈值
        ]
      };
      
      console.log('📦 发送API请求...');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(WD_TAGGER_CONFIG.timeout)
      });

      console.log(`📥 API响应状态: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ API响应错误: ${response.status} ${errorText}`);
        
        // 如果是404，尝试下一个端点
        if (response.status === 404) {
          lastError = new Error(`端点不可用: ${response.status}`);
          continue;
        }
        
        throw new Error(`API请求失败: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ API调用成功，解析结果...');
      return result;

    } catch (error) {
      console.log(`❌ API端点 ${apiUrl} 调用失败: ${error.message}`);
      lastError = error;
      
      // 如果不是404错误，不需要尝试其他端点
      if (!error.message.includes('404') && !error.message.includes('端点不可用')) {
        break;
      }
    }
  }
  
  // 所有端点都失败，提供用户友好的错误信息
  throw new Error(
    'wd-tagger服务暂时不可用。可能的原因：\n' +
    '• Hugging Face Spaces需要启动时间（首次使用需1-2分钟）\n' +
    '• 服务正在更新或维护中\n' +
    '• 网络连接问题\n\n' +
    '建议：请稍后重试，或尝试刷新页面后再试'
  );
};

/**
 * 解析wd-tagger返回的结果
 */
const parseWdTaggerResult = (apiResult) => {
  try {
    console.log('📊 解析API结果:', apiResult);
    
    // wd-tagger API返回格式: {data: [string_output, rating_output, character_output, tags_output]}
    if (!apiResult) {
      throw new Error('API返回结果为空');
    }
    
    // 处理不同的返回格式
    let data = apiResult.data || apiResult;
    if (!Array.isArray(data)) {
      // 如果不是数组，尝试作为直接的标签对象处理
      if (typeof data === 'object' && data !== null) {
        return parseDirectTagsObject(data);
      }
      throw new Error('API返回格式不受支持');
    }
    
    const [stringOutput, ratingOutput, characterOutput, tagsOutput] = data;
    
    const tags = [];
    
    // 解析tags输出 (通常是一个包含标签和置信度的对象)
    if (tagsOutput && typeof tagsOutput === 'object') {
      Object.entries(tagsOutput).forEach(([tag, confidence]) => {
        if (typeof confidence === 'number' && confidence > 0) {
          tags.push({
            tag: tag.replace(/_/g, ' '), // 替换下划线为空格
            confidence: confidence,
            category: categorizeTag(tag)
          });
        }
      });
    }
    
    // 如果tags输出为空，尝试解析字符串输出
    if (tags.length === 0 && stringOutput && typeof stringOutput === 'string') {
      console.log('📝 从字符串输出解析标签...');
      // 解析字符串格式的标签
      const tagStrings = stringOutput.split(',').map(s => s.trim()).filter(s => s);
      tagStrings.forEach(tagStr => {
        // 提取标签和置信度 (格式可能是 "tag_name: 0.95" 或者只是 "tag_name")
        const match = tagStr.match(/^(.+?)(?:\s*:\s*([\d.]+))?$/);
        if (match) {
          const tagName = match[1].trim();
          const confidence = match[2] ? parseFloat(match[2]) : 0.8; // 默认置信度
          
          tags.push({
            tag: tagName.replace(/_/g, ' '),
            confidence: confidence,
            category: categorizeTag(tagName)
          });
        }
      });
    }
    
    // 如果仍然没有标签，尝试从其他输出解析
    if (tags.length === 0) {
      console.log('⚠️ 主要输出为空，尝试从其他输出解析...');
      
      // 尝试从character输出解析
      if (characterOutput && typeof characterOutput === 'object') {
        Object.entries(characterOutput).forEach(([tag, confidence]) => {
          if (typeof confidence === 'number' && confidence > 0.5) { // 角色标签使用更高阈值
            tags.push({
              tag: tag.replace(/_/g, ' '),
              confidence: confidence,
              category: 'character'
            });
          }
        });
      }
    }
    
    // 按置信度排序
    tags.sort((a, b) => b.confidence - a.confidence);
    
    console.log(`✅ 成功解析 ${tags.length} 个标签`);
    
    return {
      success: true,
      tags,
      totalTags: tags.length,
      rawOutput: {
        string: stringOutput,
        rating: ratingOutput,
        character: characterOutput,
        tags: tagsOutput
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ 解析结果失败:', error);
    throw new Error('无法解析识别结果: ' + error.message);
  }
};

/**
 * 解析直接的标签对象（备用解析方法）
 */
const parseDirectTagsObject = (data) => {
  const tags = [];
  
  // 尝试直接从对象中提取标签
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'number' && value > 0) {
      tags.push({
        tag: key.replace(/_/g, ' '),
        confidence: value,
        category: categorizeTag(key)
      });
    } else if (typeof value === 'object' && value !== null) {
      // 递归处理嵌套对象
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (typeof subValue === 'number' && subValue > 0) {
          tags.push({
            tag: subKey.replace(/_/g, ' '),
            confidence: subValue,
            category: categorizeTag(subKey)
          });
        }
      });
    }
  });
  
  tags.sort((a, b) => b.confidence - a.confidence);
  
  return {
    success: true,
    tags,
    totalTags: tags.length,
    rawOutput: data,
    timestamp: new Date().toISOString()
  };
};

/**
 * 标签分类（根据常见的动漫标签进行分类）
 */
const categorizeTag = (tag) => {
  const lowerTag = tag.toLowerCase();
  
  // 角色相关
  if (lowerTag.includes('girl') || lowerTag.includes('boy') || lowerTag.includes('woman') || 
      lowerTag.includes('man') || lowerTag.includes('person') || lowerTag.includes('character')) {
    return 'character';
  }
  
  // 头发相关
  if (lowerTag.includes('hair') || lowerTag.includes('twintail') || lowerTag.includes('ponytail') ||
      lowerTag.includes('braid') || lowerTag.includes('bangs')) {
    return 'hair';
  }
  
  // 眼睛相关
  if (lowerTag.includes('eyes') || lowerTag.includes('eye') || lowerTag.includes('eyelashes')) {
    return 'eyes';
  }
  
  // 服装相关
  if (lowerTag.includes('dress') || lowerTag.includes('uniform') || lowerTag.includes('clothes') || 
      lowerTag.includes('shirt') || lowerTag.includes('skirt') || lowerTag.includes('outfit') ||
      lowerTag.includes('jacket') || lowerTag.includes('coat') || lowerTag.includes('hat') ||
      lowerTag.includes('accessory') || lowerTag.includes('jewelry')) {
    return 'clothing';
  }
  
  // 表情动作
  if (lowerTag.includes('smile') || lowerTag.includes('looking') || lowerTag.includes('pose') ||
      lowerTag.includes('standing') || lowerTag.includes('sitting') || lowerTag.includes('lying') ||
      lowerTag.includes('expression') || lowerTag.includes('emotion')) {
    return 'expression';
  }
  
  // 背景环境
  if (lowerTag.includes('background') || lowerTag.includes('outdoor') || lowerTag.includes('indoor') ||
      lowerTag.includes('sky') || lowerTag.includes('tree') || lowerTag.includes('building') ||
      lowerTag.includes('scenery') || lowerTag.includes('landscape')) {
    return 'background';
  }
  
  // 艺术风格和质量
  if (lowerTag.includes('art') || lowerTag.includes('style') || lowerTag.includes('anime') ||
      lowerTag.includes('realistic') || lowerTag.includes('quality') || lowerTag.includes('masterpiece') ||
      lowerTag.includes('detailed') || lowerTag.includes('illustration')) {
    return 'style';
  }
  
  // 身体部位
  if (lowerTag.includes('face') || lowerTag.includes('hand') || lowerTag.includes('arm') ||
      lowerTag.includes('leg') || lowerTag.includes('body') || lowerTag.includes('skin')) {
    return 'body';
  }
  
  return 'other';
};

/**
 * 智能标签分类
 */
const categorizeTags = (tags) => {
  return tags.map(tag => ({
    ...tag,
    category: categorizeTag(tag.tag)
  }));
};

/**
 * 计算标签权重
 */
const calculateTagWeights = (tags) => {
  return tags.map(tag => ({
    ...tag,
    weight: calculateWeight(tag.confidence, tag.category)
  }));
};

/**
 * 获取分类统计
 */
const getCategoryStats = (tags) => {
  const stats = {};
  tags.forEach(tag => {
    if (!stats[tag.category]) {
      stats[tag.category] = 0;
    }
    stats[tag.category]++;
  });
  return stats;
};

/**
 * 计算单个标签权重
 */
const calculateWeight = (confidence, category) => {
  // 根据类别调整权重
  const categoryMultipliers = {
    character: 1.2,
    style: 1.1,
    quality: 1.0,
    body: 1.0,
    clothing: 0.9,
    background: 0.8,
    other: 0.7
  };
  
  const multiplier = categoryMultipliers[category] || 1.0;
  return Math.round(confidence * multiplier * 100) / 100;
};

/**
 * 主要的图像标签识别函数
 */
export const analyzeImageTags = async (file, options = {}) => {
  const {
    model = WD_TAGGER_CONFIG.defaultModel,
    generalThreshold = 0.35,
    characterThreshold = 0.85
  } = options;
  
  console.log('🖼️ [imageTaggingService] 开始图像标签识别', {
    fileName: file?.name,
    fileSize: file?.size,
    model,
    generalThreshold,
    characterThreshold
  });
  
  try {
    // 1. 验证文件
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // 2. 压缩图像（如果需要）
    let processedFile = file;
    if (file.size > 2 * 1024 * 1024) { // 大于2MB时压缩
      console.log('📦 压缩图像中...');
      processedFile = await compressImage(file);
    }
    
    // 3. 转换为Base64
    console.log('🔄 转换图像格式...');
    const base64Data = await fileToBase64(processedFile);
    
    // 4. 调用API
    console.log('🌐 调用wd-tagger API（包含重试机制）...');
    const apiResult = await callWdTaggerAPI(
      base64Data, 
      model, 
      generalThreshold, 
      characterThreshold
    );
    
    // 5. 解析结果
    console.log('📊 解析和分类标签...');
    const tags = parseWdTaggerResult(apiResult);
    
    if (!tags || tags.length === 0) {
      return {
        success: false,
        error: '没有识别到任何标签，请尝试：\n1. 调低"通用标签阈值"到0.25\n2. 更换更清晰的图像\n3. 尝试不同的模型',
        warning: '可能是图像质量问题或阈值设置过高',
        totalTags: 0,
        tags: [],
        processingTime: 0
      };
    }
    
    // 6. 智能标签分类和权重计算
    const categorizedTags = categorizeTags(tags);
    const processedTags = calculateTagWeights(categorizedTags);
    
    console.log(`✅ 成功识别到 ${processedTags.length} 个标签`);
    
    return {
      success: true,
      totalTags: processedTags.length,
      tags: processedTags,
      categories: getCategoryStats(processedTags),
      processingTime: Date.now(),
      modelUsed: model,
      thresholds: { generalThreshold, characterThreshold }
    };

  } catch (error) {
    console.error('❌ 图像标签识别失败:', error);
    
    let userFriendlyMessage = error.message;
    let suggestions = [];
    
    // 根据错误类型提供具体建议
    if (error.message.includes('404')) {
      userFriendlyMessage = 'wd-tagger服务暂时不可用';
      suggestions = [
        '这通常是因为Hugging Face Spaces需要启动时间',
        '首次使用可能需要1-2分钟启动时间',
        '请稍后重试（建议等待30秒后再试）'
      ];
    } else if (error.message.includes('timeout') || error.message.includes('TimeoutError')) {
      userFriendlyMessage = '请求超时';
      suggestions = [
        '网络连接较慢或服务繁忙',
        '建议重新尝试',
        '或者尝试压缩图像后再试'
      ];
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      userFriendlyMessage = '网络连接问题';
      suggestions = [
        '请检查网络连接',
        '如果问题持续，可能是服务暂时不可用'
      ];
    }
    
    return {
      success: false,
      error: userFriendlyMessage,
      suggestions,
      technicalError: error.message,
      totalTags: 0,
      tags: []
    };
  }
};

/**
 * 将识别的标签转换为提示词格式
 */
export const tagsToPrompt = (tags, options = {}) => {
  const {
    minConfidence = 0.5,
    maxTags = 20,
    includeConfidence = false,
    groupByCategory = false
  } = options;
  
  // 过滤和排序标签
  const filteredTags = tags
    .filter(tag => tag.confidence >= minConfidence)
    .slice(0, maxTags);
  
  if (groupByCategory) {
    // 按分类分组
    const grouped = {};
    filteredTags.forEach(tag => {
      if (!grouped[tag.category]) {
        grouped[tag.category] = [];
      }
      grouped[tag.category].push(tag);
    });
    
    return grouped;
  }
  
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
 * 获取推荐的标签（基于置信度和重要性）
 */
export const getRecommendedTags = (tags, count = 10) => {
  // 定义重要标签的权重
  const importantCategories = {
    'character': 1.3,
    'style': 1.2,
    'hair': 1.1,
    'eyes': 1.1,
    'clothing': 1.0,
    'expression': 0.9,
    'body': 0.8,
    'background': 0.7,
    'other': 0.6
  };
  
  // 计算加权分数
  const weightedTags = tags.map(tag => ({
    ...tag,
    score: tag.confidence * (importantCategories[tag.category] || 0.5)
  }));
  
  // 按分数排序并返回前N个
  return weightedTags
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
};

/**
 * 获取可用的模型列表
 */
export const getAvailableModels = () => {
  return WD_TAGGER_CONFIG.availableModels.map(model => ({
    id: model,
    name: model.split('/')[1] || model,
    fullName: model
  }));
};

/**
 * 导出配置和工具函数
 */
export const imageTaggingConfig = WD_TAGGER_CONFIG;

export default {
  analyzeImageTags,
  validateImageFile,
  tagsToPrompt,
  getRecommendedTags,
  getAvailableModels,
  imageTaggingConfig
}; 