/**
 * 简化的图像元数据提取器
 * 参考stable-diffusion-inspector的实现方式
 */

// 主要的提取函数
export async function extractMetadata(file) {
  console.log('🚀 开始提取图像元数据...');
  
  const result = {
    success: false,
    filename: file.name,
    extractedData: {},
    standardizedData: null,
    timestamp: new Date().toISOString()
  };

  try {
    // 基本文件信息
    result.basicInfo = {
      size: file.size,
      sizeFormatted: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type,
      lastModified: new Date(file.lastModified).toLocaleString()
    };

    // 根据文件类型选择提取方法
    if (file.type === 'image/png') {
      const pngData = await extractFromPNG(file);
      if (pngData) {
        result.extractedData.PNG = pngData;
      }
    }

    // 尝试EXIF提取
    try {
      const exifData = await extractFromEXIF(file);
      if (exifData) {
        result.extractedData.EXIF = exifData;
      }
    } catch (error) {
      console.warn('EXIF提取失败:', error);
    }

    // 标准化数据
    result.standardizedData = standardizeData(result.extractedData);
    result.success = Object.keys(result.extractedData).length > 0;

    // 添加提取方法信息
    result.extractionMethods = Object.keys(result.extractedData).map(method => ({
      method: method,
      confidence: result.extractedData[method]?.confidence || 'unknown'
    }));

    return result;
    
  } catch (error) {
    console.error('❌ 元数据提取失败:', error);
    result.error = error.message;
    throw error;
  }
}

// PNG文件解析 - 参考stable-diffusion-inspector的简洁实现
async function extractFromPNG(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const chunks = parsePNGChunks(buffer);
        const metadata = extractMetadataFromChunks(chunks);
        
        resolve({
          type: 'PNG',
          confidence: metadata.confidence || 'medium',
          data: metadata
        });
      } catch (error) {
        console.warn('PNG解析失败:', error);
        resolve(null);
      }
    };
    
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file);
  });
}

// 简化的PNG块解析
function parsePNGChunks(buffer) {
  const view = new DataView(buffer);
  const chunks = [];
  let offset = 8; // 跳过PNG签名

  // 验证PNG签名
  const signature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  for (let i = 0; i < 8; i++) {
    if (view.getUint8(i) !== signature[i]) {
      throw new Error('不是有效的PNG文件');
    }
  }

  while (offset < buffer.byteLength - 8) {
    try {
      const length = view.getUint32(offset);
      offset += 4;

      const type = String.fromCharCode(
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3)
      );
      offset += 4;

      const data = new Uint8Array(buffer, offset, length);
      offset += length;

      const crc = view.getUint32(offset);
      offset += 4;

      chunks.push({ type, length, data, crc });

      if (type === 'IEND') break;
    } catch (error) {
      console.warn('PNG块解析警告:', error);
      break;
    }
  }

  return chunks;
}

// 从PNG块提取元数据
function extractMetadataFromChunks(chunks) {
  const textChunks = chunks.filter(chunk => 
    ['tEXt', 'iTXt', 'zTXt'].includes(chunk.type)
  );

  const metadata = {
    confidence: 'low',
    generationTool: 'Unknown',
    positive: '',
    negative: '',
    parameters: {}
  };

  for (const chunk of textChunks) {
    const textData = parseTextChunk(chunk);
    if (!textData.keyword || !textData.text) continue;

    console.log('解析文本块:', textData.keyword, '长度:', textData.text.length);

    // 检测不同格式
    if (textData.keyword === 'parameters' && isAutomatic1111Format(textData.text)) {
      const parsed = parseAutomatic1111(textData.text);
      Object.assign(metadata, parsed);
      metadata.generationTool = 'AUTOMATIC1111';
      metadata.confidence = 'high';
    } else if (['workflow', 'prompt'].includes(textData.keyword)) {
      try {
        const parsed = parseComfyUI(textData.text);
        Object.assign(metadata, parsed);
        metadata.generationTool = 'ComfyUI';
        metadata.confidence = 'high';
      } catch (error) {
        console.warn('ComfyUI解析失败:', error);
      }
    } else if (['Description', 'Comment'].includes(textData.keyword)) {
      try {
        const parsed = parseNovelAI(textData.text);
        Object.assign(metadata, parsed);
        metadata.generationTool = 'NovelAI';
        metadata.confidence = 'high';
      } catch (error) {
        console.warn('NovelAI解析失败:', error);
      }
    }
  }

  return metadata;
}

// 解析文本块
function parseTextChunk(chunk) {
  try {
    const data = chunk.data;
    
    if (chunk.type === 'tEXt') {
      const nullIndex = data.indexOf(0);
      if (nullIndex === -1) return {};

      const keyword = decodeLatin1(data.slice(0, nullIndex));
      const text = decodeLatin1(data.slice(nullIndex + 1));
      return { keyword, text };
    }
    
    if (chunk.type === 'iTXt') {
      const nullIndices = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i] === 0) {
          nullIndices.push(i);
          if (nullIndices.length >= 4) break;
        }
      }

      if (nullIndices.length < 4) return {};

      const keyword = decodeUTF8(data.slice(0, nullIndices[0]));
      const text = decodeUTF8(data.slice(nullIndices[3] + 1));
      return { keyword, text };
    }
    
    return {};
  } catch (error) {
    console.warn('文本块解析失败:', error);
    return {};
  }
}

// 安全的字符解码
function decodeLatin1(data) {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data[i]);
  }
  return result;
}

function decodeUTF8(data) {
  try {
    return new TextDecoder('utf-8', { fatal: false }).decode(data);
  } catch (error) {
    return decodeLatin1(data);
  }
}

// 检测AUTOMATIC1111格式
function isAutomatic1111Format(text) {
  const lowerText = text.toLowerCase();
  return lowerText.includes('steps:') || 
         lowerText.includes('cfg scale:') || 
         lowerText.includes('sampler:') || 
         lowerText.includes('negative prompt:');
}

// 解析AUTOMATIC1111数据
function parseAutomatic1111(text) {
  const result = {
    positive: '',
    negative: '',
    parameters: {}
  };

  try {
    const negativeIndex = text.indexOf('Negative prompt:');
    
    if (negativeIndex !== -1) {
      result.positive = text.substring(0, negativeIndex).trim();
      
      const afterNegative = text.substring(negativeIndex + 16);
      const lines = afterNegative.split('\n');
      
      let negativePrompt = '';
      let parameterLines = [];
      let foundParams = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (isParameterLine(trimmed)) {
          foundParams = true;
          parameterLines.push(trimmed);
        } else if (!foundParams && trimmed) {
          negativePrompt += (negativePrompt ? '\n' : '') + trimmed;
        } else if (foundParams) {
          parameterLines.push(trimmed);
        }
      }
      
      result.negative = negativePrompt.trim();
      
      if (parameterLines.length > 0) {
        result.parameters = parseParameters(parameterLines.join(', '));
      }
    } else {
      // 没有负向提示词的情况
      const lines = text.split('\n');
      let positiveLines = [];
      let parameterLines = [];
      let foundParams = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (isParameterLine(trimmed)) {
          foundParams = true;
          parameterLines.push(trimmed);
        } else if (!foundParams && trimmed) {
          positiveLines.push(trimmed);
        } else if (foundParams) {
          parameterLines.push(trimmed);
        }
      }
      
      result.positive = positiveLines.join(' ').trim();
      
      if (parameterLines.length > 0) {
        result.parameters = parseParameters(parameterLines.join(', '));
      }
    }
  } catch (error) {
    console.warn('AUTOMATIC1111解析警告:', error);
    result.positive = text;
  }

  return result;
}

// 检测参数行
function isParameterLine(line) {
  return /\b(Steps|Sampler|CFG scale|Seed|Size|Model):/i.test(line);
}

// 解析参数
function parseParameters(paramText) {
  const parameters = {};
  const regex = /(\w+(?:\s+\w+)*)\s*:\s*([^,]+?)(?=,\s*\w+\s*:|$)/g;
  let match;

  while ((match = regex.exec(paramText)) !== null) {
    const key = match[1].trim().toLowerCase().replace(/\s+/g, '');
    const value = match[2].trim();
    
    const numValue = parseFloat(value);
    parameters[key] = !isNaN(numValue) && isFinite(numValue) ? numValue : value;
  }

  return parameters;
}

// 解析ComfyUI数据
function parseComfyUI(text) {
  const result = {
    positive: '',
    negative: '',
    parameters: {}
  };

  try {
    const data = JSON.parse(text);
    
    if (Array.isArray(data?.nodes)) {
      // 工作流格式
      console.log('📋 检测到ComfyUI工作流格式');
      const prompts = extractFromComfyWorkflow(data);
      result.positive = prompts.positive;
      result.negative = prompts.negative;
      Object.assign(result.parameters, prompts.parameters);
    } else if (typeof data === 'object') {
      // 提示格式
      console.log('📋 检测到ComfyUI提示格式');
      const prompts = extractFromComfyPrompt(data);
      result.positive = prompts.positive;
      result.negative = prompts.negative;
      Object.assign(result.parameters, prompts.parameters);
    }
    
    // 如果没有提取到提示词，尝试深度搜索
    if (!result.positive && !result.negative) {
      console.log('🔍 开始深度搜索提示词...');
      const deepSearch = deepSearchPrompts(data);
      result.positive = deepSearch.positive;
      result.negative = deepSearch.negative;
      Object.assign(result.parameters, deepSearch.parameters);
    }
    
  } catch (error) {
    console.warn('ComfyUI解析失败:', error);
  }

  return result;
}

// 深度搜索提示词（用于复杂工作流）
function deepSearchPrompts(data) {
  const result = {
    positive: '',
    negative: '',
    parameters: {}
  };
  
  const allTexts = [];
  
  // 递归搜索所有可能包含文本的字段
  function searchObject(obj, path = '') {
    if (typeof obj === 'string' && obj.trim().length > 10) {
      // 过滤掉明显不是提示词的文本
      if (!isSystemText(obj)) {
        allTexts.push({
          text: obj.trim(),
          path: path,
          length: obj.trim().length
        });
        console.log(`🔍 发现文本 (${path}): ${obj.substring(0, 50)}...`);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        searchObject(item, `${path}[${index}]`);
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        // 重点关注可能包含提示词的字段
        const importantKeys = ['text', 'prompt', 'string', 'content', 'value', 'input', 'output'];
        const newPath = importantKeys.includes(key.toLowerCase()) ? `${path}.${key}*` : `${path}.${key}`;
        searchObject(value, newPath);
      });
    }
  }
  
  searchObject(data);
  
  // 按长度排序，优先处理较长的文本（可能是最终结果）
  allTexts.sort((a, b) => b.length - a.length);
  
  console.log(`🎯 共发现 ${allTexts.length} 个文本片段`);
  
  // 智能分类文本
  const positiveTexts = [];
  const negativeTexts = [];
  
  for (const textObj of allTexts) {
    const text = textObj.text;
    
    // 跳过重复的文本
    if (positiveTexts.some(t => t.includes(text) || text.includes(t)) ||
        negativeTexts.some(t => t.includes(text) || text.includes(t))) {
      continue;
    }
    
    if (isNegativePrompt(text)) {
      negativeTexts.push(text);
      console.log(`➖ 分类为负向: ${text.substring(0, 30)}...`);
    } else {
      positiveTexts.push(text);
      console.log(`➕ 分类为正向: ${text.substring(0, 30)}...`);
    }
  }
  
  // 选择最佳文本
  result.positive = selectBestPrompt(positiveTexts);
  result.negative = selectBestPrompt(negativeTexts);
  
  return result;
}

// 判断是否为系统文本（非提示词）
function isSystemText(text) {
  const systemPatterns = [
    /^[a-f0-9]{8,}$/i,  // 哈希值
    /^\d+\.\d+\.\d+/,   // 版本号
    /^https?:\/\//,     // URL
    /^[A-Z_]+$/,        // 全大写常量
    /^\w+\.(png|jpg|jpeg|webp|gif)$/i,  // 文件名
    /^(true|false|null|undefined)$/i,   // 布尔值
    /^\d+x\d+$/,        // 尺寸
    /^#[a-f0-9]{6}$/i,  // 颜色代码
  ];
  
  return systemPatterns.some(pattern => pattern.test(text.trim()));
}

// 选择最佳提示词
function selectBestPrompt(texts) {
  if (texts.length === 0) return '';
  if (texts.length === 1) return texts[0];
  
  // 评分系统
  const scoredTexts = texts.map(text => {
    let score = 0;
    
    // 长度加分（但不是越长越好）
    const idealLength = 200;
    const lengthScore = Math.max(0, 1 - Math.abs(text.length - idealLength) / idealLength);
    score += lengthScore * 0.3;
    
    // 逗号数量加分（表示标签丰富度）
    const commaCount = (text.match(/,/g) || []).length;
    score += Math.min(commaCount / 10, 1) * 0.2;
    
    // 包含质量词加分
    const qualityWords = ['masterpiece', 'best quality', 'high quality', 'detailed', 'professional'];
    const qualityScore = qualityWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length / qualityWords.length;
    score += qualityScore * 0.2;
    
    // 包含艺术风格词加分
    const styleWords = ['anime', 'realistic', 'painting', 'illustration', 'digital art', 'concept art'];
    const styleScore = styleWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length / styleWords.length;
    score += styleScore * 0.1;
    
    // 避免重复词汇
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const uniqueRatio = uniqueWords.size / words.length;
    score += uniqueRatio * 0.2;
    
    return { text, score };
  });
  
  // 选择得分最高的
  scoredTexts.sort((a, b) => b.score - a.score);
  const best = scoredTexts[0];
  
  console.log(`🏆 选择最佳提示词 (得分: ${best.score.toFixed(2)}): ${best.text.substring(0, 50)}...`);
  
  return best.text;
}

// 从ComfyUI工作流提取
function extractFromComfyWorkflow(workflow) {
  const positivePrompts = [];
  const negativePrompts = [];
  const parameters = {};

  console.log('🔍 分析ComfyUI工作流，节点数量:', workflow.nodes?.length || 0);

  for (const node of workflow.nodes || []) {
    console.log(`📝 检查节点: ${node.type} (${node.title || 'untitled'})`);
    
    // 扩展支持的文本编码节点类型
    const textEncoderTypes = [
      'CLIPTextEncode', 
      'CLIPTextEncodeSDXL',
      'BNK_CLIPTextEncoder',  // BNK系列节点
      'WeiLin-ComfyUI-prompt-all-in-one',  // WeiLin插件
      'TIPO',  // TIPO节点
      'PromptWithStyle',  // 样式提示词节点
      'StringFunction',  // 字符串处理节点
      'Text',  // 通用文本节点
      'TextInput',  // 文本输入节点
      'PromptBuilder',  // 提示词构建器
      'AdvancedCLIPTextEncode',  // 高级CLIP编码器
      'CLIPTextEncodeFlux',  // Flux模型编码器
      'ShowText',  // 显示文本节点
      'StringConstant',  // 字符串常量
      'MultilineStringLiteral'  // 多行字符串
    ];

    if (textEncoderTypes.includes(node.type)) {
      console.log(`✅ 找到文本编码节点: ${node.type}`);
      
      // 尝试多种方式获取文本内容
      let text = null;
      
      // 方式1: widgets_values数组
      if (node.widgets_values && Array.isArray(node.widgets_values)) {
        for (const value of node.widgets_values) {
          if (typeof value === 'string' && value.trim().length > 0) {
            text = value.trim();
            console.log(`📄 从widgets_values获取文本: ${text.substring(0, 50)}...`);
            break;
          }
        }
      }
      
      // 方式2: 直接的text属性
      if (!text && node.text && typeof node.text === 'string') {
        text = node.text.trim();
        console.log(`📄 从text属性获取文本: ${text.substring(0, 50)}...`);
      }
      
      // 方式3: inputs中的text
      if (!text && node.inputs) {
        for (const input of node.inputs) {
          if (input.name === 'text' && input.widget && input.widget.value) {
            text = input.widget.value.trim();
            console.log(`📄 从inputs获取文本: ${text.substring(0, 50)}...`);
            break;
          }
        }
      }
      
      // 方式4: properties中查找
      if (!text && node.properties) {
        if (node.properties.text) {
          text = node.properties.text.trim();
          console.log(`📄 从properties获取文本: ${text.substring(0, 50)}...`);
        }
      }
      
      if (text && text.length > 0) {
        // 智能判断是否为负向提示词
        const isNegative = isNegativePrompt(text) || 
                          node.title?.toLowerCase().includes('negative') ||
                          node.title?.toLowerCase().includes('负向') ||
                          node.title?.toLowerCase().includes('反向') ||
                          (node.color && (node.color === '#ff6b6b' || node.color === '#e74c3c')); // 红色通常表示负向
        
        if (isNegative) {
          negativePrompts.push(text);
          console.log(`➖ 识别为负向提示词: ${text.substring(0, 30)}...`);
        } else {
          positivePrompts.push(text);
          console.log(`➕ 识别为正向提示词: ${text.substring(0, 30)}...`);
        }
      }
    }
    
    // 提取采样器参数
    if (['KSampler', 'KSamplerAdvanced', 'SamplerCustom'].includes(node.type)) {
      if (node.widgets_values) {
        const [seed, steps, cfg, sampler_name, scheduler, denoise] = node.widgets_values;
        if (seed !== undefined) parameters.seed = seed;
        if (steps !== undefined) parameters.steps = steps;
        if (cfg !== undefined) parameters.cfg_scale = cfg;
        if (sampler_name !== undefined) parameters.sampler = sampler_name;
        if (scheduler !== undefined) parameters.scheduler = scheduler;
        if (denoise !== undefined) parameters.denoise = denoise;
        console.log(`⚙️ 提取采样器参数: steps=${steps}, cfg=${cfg}, sampler=${sampler_name}`);
      }
    }
    
    // 提取模型信息
    if (['CheckpointLoaderSimple', 'CheckpointLoader'].includes(node.type)) {
      if (node.widgets_values && node.widgets_values[0]) {
        parameters.model = node.widgets_values[0];
        console.log(`🎯 提取模型: ${parameters.model}`);
      }
    }
    
    // 提取图像尺寸
    if (['EmptyLatentImage', 'LatentUpscale'].includes(node.type)) {
      if (node.widgets_values) {
        const [width, height] = node.widgets_values;
        if (width !== undefined) parameters.width = width;
        if (height !== undefined) parameters.height = height;
        console.log(`📐 提取尺寸: ${width}x${height}`);
      }
    }
  }

  // 智能合并提示词
  const finalPositive = smartMergePrompts(positivePrompts);
  const finalNegative = smartMergePrompts(negativePrompts);
  
  console.log(`🎯 最终结果: 正向提示词${finalPositive.length}字符, 负向提示词${finalNegative.length}字符`);

  return {
    positive: finalPositive,
    negative: finalNegative,
    parameters
  };
}

// 智能合并提示词
function smartMergePrompts(prompts) {
  if (prompts.length === 0) return '';
  if (prompts.length === 1) return prompts[0];
  
  // 去重并按长度排序，优先选择更完整的提示词
  const uniquePrompts = [...new Set(prompts)];
  uniquePrompts.sort((a, b) => b.length - a.length);
  
  // 如果最长的提示词明显比其他的长很多，可能是最终合成的结果
  const longest = uniquePrompts[0];
  const secondLongest = uniquePrompts[1] || '';
  
  if (longest.length > secondLongest.length * 2) {
    console.log(`🎯 选择最长提示词作为最终结果: ${longest.length} vs ${secondLongest.length}`);
    return longest;
  }
  
  // 否则合并所有唯一的提示词
  return uniquePrompts.join(', ');
}

// 从ComfyUI提示提取
function extractFromComfyPrompt(prompt) {
  const positivePrompts = [];
  const negativePrompts = [];
  const parameters = {};

  console.log('🔍 分析ComfyUI提示格式，节点数量:', Object.keys(prompt).length);

  for (const [nodeId, nodeData] of Object.entries(prompt)) {
    console.log(`📝 检查节点 ${nodeId}: ${nodeData.class_type}`);
    
    // 扩展支持的节点类型
    const textEncoderTypes = [
      'CLIPTextEncode', 
      'CLIPTextEncodeSDXL',
      'BNK_CLIPTextEncoder',
      'WeiLin-ComfyUI-prompt-all-in-one',
      'TIPO',
      'PromptWithStyle',
      'StringFunction',
      'Text',
      'TextInput',
      'PromptBuilder',
      'AdvancedCLIPTextEncode',
      'CLIPTextEncodeFlux',
      'ShowText',
      'StringConstant',
      'MultilineStringLiteral'
    ];
    
    if (textEncoderTypes.includes(nodeData.class_type)) {
      console.log(`✅ 找到文本编码节点: ${nodeData.class_type}`);
      
      // 尝试多种方式获取文本
      let text = null;
      
      if (nodeData.inputs?.text && typeof nodeData.inputs.text === 'string') {
        text = nodeData.inputs.text.trim();
        console.log(`📄 从inputs.text获取: ${text.substring(0, 50)}...`);
      } else if (nodeData.inputs?.prompt && typeof nodeData.inputs.prompt === 'string') {
        text = nodeData.inputs.prompt.trim();
        console.log(`📄 从inputs.prompt获取: ${text.substring(0, 50)}...`);
      } else if (nodeData.inputs?.string && typeof nodeData.inputs.string === 'string') {
        text = nodeData.inputs.string.trim();
        console.log(`📄 从inputs.string获取: ${text.substring(0, 50)}...`);
      }
      
      if (text && text.length > 0) {
        if (isNegativePrompt(text)) {
          negativePrompts.push(text);
          console.log(`➖ 识别为负向提示词`);
        } else {
          positivePrompts.push(text);
          console.log(`➕ 识别为正向提示词`);
        }
      }
    }
    
    // 提取其他参数...
    if (['KSampler', 'KSamplerAdvanced', 'SamplerCustom'].includes(nodeData.class_type)) {
      const inputs = nodeData.inputs;
      if (inputs.seed !== undefined) parameters.seed = inputs.seed;
      if (inputs.steps !== undefined) parameters.steps = inputs.steps;
      if (inputs.cfg !== undefined) parameters.cfg_scale = inputs.cfg;
      if (inputs.sampler_name !== undefined) parameters.sampler = inputs.sampler_name;
      if (inputs.scheduler !== undefined) parameters.scheduler = inputs.scheduler;
      if (inputs.denoise !== undefined) parameters.denoise = inputs.denoise;
    }
  }

  const finalPositive = smartMergePrompts(positivePrompts);
  const finalNegative = smartMergePrompts(negativePrompts);
  
  console.log(`🎯 最终结果: 正向提示词${finalPositive.length}字符, 负向提示词${finalNegative.length}字符`);

  return {
    positive: finalPositive,
    negative: finalNegative,
    parameters
  };
}

// 检测负向提示词
function isNegativePrompt(text) {
  const lowerText = text.toLowerCase();
  
  // 扩展负向关键词列表
  const negativeKeywords = [
    // 质量相关
    'worst quality', 'bad quality', 'low quality', 'poor quality',
    'bad anatomy', 'bad proportions', 'bad hands', 'bad fingers',
    'ugly', 'deformed', 'disfigured', 'mutated', 'malformed',
    'blurry', 'blur', 'out of focus', 'unfocused', 'soft focus',
    'lowres', 'low resolution', 'pixelated', 'jpeg artifacts',
    
    // 技术问题
    'error', 'glitch', 'artifact', 'noise', 'grain', 'distorted',
    'cropped', 'cut off', 'truncated', 'incomplete',
    'watermark', 'signature', 'text', 'logo', 'username',
    'border', 'frame', 'black bars', 'letterbox',
    
    // 解剖问题
    'extra limbs', 'missing limbs', 'extra fingers', 'missing fingers',
    'extra arms', 'extra legs', 'fused fingers', 'too many fingers',
    'long neck', 'long body', 'elongated', 'stretched',
    'duplicate', 'multiple', 'conjoined', 'merged',
    
    // 风格问题
    'amateur', 'sketch', 'draft', 'unfinished', 'rough',
    'simple', 'basic', 'plain', 'boring', 'dull',
    'monochrome', 'grayscale', 'black and white', 'sepia',
    
    // 内容问题
    'nsfw', 'nude', 'naked', 'explicit', 'sexual',
    'violence', 'blood', 'gore', 'disturbing', 'scary',
    'dark', 'horror', 'nightmare', 'creepy', 'evil',
    
    // 中文负向词
    '最差质量', '糟糕质量', '低质量', '差质量',
    '糟糕解剖', '变形', '畸形', '丑陋', '模糊',
    '低分辨率', '像素化', '噪点', '伪影',
    '水印', '签名', '文字', '标志', '用户名',
    '多余的', '缺失的', '融合的', '重复的',
    '业余', '草图', '未完成', '粗糙', '简单',
    '单色', '灰度', '黑白', '暗色调'
  ];
  
  // 检查是否包含负向关键词
  const hasNegativeKeywords = negativeKeywords.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
  
  // 检查负向提示词的比例
  const negativeWordCount = negativeKeywords.filter(keyword => 
    lowerText.includes(keyword.toLowerCase())
  ).length;
  
  const totalWords = text.split(/\s+/).length;
  const negativeRatio = negativeWordCount / totalWords;
  
  // 如果负向词汇比例超过30%，很可能是负向提示词
  const isHighNegativeRatio = negativeRatio > 0.3;
  
  // 检查是否以负向词开头
  const startsWithNegative = negativeKeywords.some(keyword => 
    lowerText.startsWith(keyword.toLowerCase())
  );
  
  console.log(`🔍 负向检测: 关键词=${hasNegativeKeywords}, 比例=${negativeRatio.toFixed(2)}, 开头=${startsWithNegative}`);
  
  return hasNegativeKeywords || isHighNegativeRatio || startsWithNegative;
}

// 解析NovelAI数据
function parseNovelAI(text) {
  const result = {
    positive: '',
    negative: '',
    parameters: {}
  };

  try {
    const data = JSON.parse(text);
    result.positive = data.prompt || '';
    result.negative = data.uc || '';
    
    ['steps', 'scale', 'seed', 'sampler', 'width', 'height'].forEach(key => {
      if (data[key] !== undefined) {
        result.parameters[key] = data[key];
      }
    });
  } catch (error) {
    console.warn('NovelAI解析失败:', error);
  }

  return result;
}

// EXIF数据提取
async function extractFromEXIF(file) {
  try {
    // 动态导入exifr
    const exifr = await import('exifr');
    
    const exifData = await exifr.parse(file, {
      userComment: true,
      imageDescription: true,
      software: true
    });

    if (!exifData) return null;

    return {
      type: 'EXIF',
      confidence: 'medium',
      data: {
        software: exifData.Software,
        description: exifData.ImageDescription,
        userComment: exifData.UserComment,
        positive: exifData.UserComment || exifData.ImageDescription || '',
        negative: '',
        parameters: {}
      }
    };
  } catch (error) {
    console.warn('EXIF提取失败:', error);
    return null;
  }
}

// 标准化数据
function standardizeData(extractedData) {
  const standardized = {
    generationTool: 'Unknown',
    positive: '',
    negative: '',
    parameters: {}
  };

  // 优先级顺序
  const sources = ['PNG', 'EXIF'];
  
  for (const source of sources) {
    const data = extractedData[source];
    if (!data) continue;

    if (data.data.generationTool) {
      standardized.generationTool = data.data.generationTool;
    }

    if (data.data.positive && !standardized.positive) {
      standardized.positive = data.data.positive;
    }

    if (data.data.negative && !standardized.negative) {
      standardized.negative = data.data.negative;
    }

    Object.assign(standardized.parameters, data.data.parameters || {});
  }

  return standardized;
}

// 导出主要函数
export const imageMetadataExtractor = {
  extractMetadata
};

export default imageMetadataExtractor; 