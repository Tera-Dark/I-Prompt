/**
 * 纯前端翻译服务 - 适用于 GitHub Pages 部署
 * 使用免费的公共翻译API，无需后端服务
 */

// 导入标签数据库服务
import { findChineseTranslation, findEnglishTranslation } from './tagDatabaseService';

// 翻译引擎配置
export const TRANSLATION_ENGINES = {
  mymemory: {
    name: 'MyMemory',
    description: '免费翻译API，无需密钥',
    url: 'https://api.mymemory.translated.net/get',
    priority: 1,
    free: true,
    rateLimit: '1000/天'
  },
  libre: {
    name: 'LibreTranslate',
    description: '开源免费翻译',
    url: 'https://libretranslate.de/translate',
    priority: 2,
    free: true,
    rateLimit: '无限制'
  },
  lingvanex: {
    name: 'Lingvanex',
    description: '免费翻译API',
    url: 'https://api-b2b.backenster.com/b1/api/v3/translate',
    priority: 3,
    free: true,
    rateLimit: '100/小时'
  }
};

// 默认翻译引擎设置
export const DEFAULT_TRANSLATION_ENGINE = 'mymemory';

// 推荐的引擎优先级顺序（按稳定性和可用性排序）
export const PREFERRED_ENGINE_ORDER = ['mymemory', 'libre', 'lingvanex'];

// 语言代码映射
const LANGUAGE_CODES = {
  'zh': { mymemory: 'zh-CN', libre: 'zh', lingvanex: 'zh_CN' },
  'en': { mymemory: 'en-US', libre: 'en', lingvanex: 'en_US' },
  'ja': { mymemory: 'ja-JP', libre: 'ja', lingvanex: 'ja_JP' },
  'ko': { mymemory: 'ko-KR', libre: 'ko', lingvanex: 'ko_KR' },
  'fr': { mymemory: 'fr-FR', libre: 'fr', lingvanex: 'fr_FR' },
  'de': { mymemory: 'de-DE', libre: 'de', lingvanex: 'de_DE' },
  'es': { mymemory: 'es-ES', libre: 'es', lingvanex: 'es_ES' },
  'ru': { mymemory: 'ru-RU', libre: 'ru', lingvanex: 'ru_RU' }
};

/**
 * 使用 MyMemory API 翻译
 */
async function translateWithMyMemory(text, targetLang = 'en', sourceLang = 'auto') {
  try {
    const sourceCode = sourceLang === 'auto' ? detectLanguage(text) : sourceLang;
    const targetCode = LANGUAGE_CODES[targetLang]?.mymemory || 'en-US';
    const sourceCodeFull = LANGUAGE_CODES[sourceCode]?.mymemory || 'zh-CN';
    
    const langPair = `${sourceCodeFull}|${targetCode}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return {
        translatedText: data.responseData.translatedText,
        engine: 'mymemory',
        confidence: data.responseData.match || 0,
        status: 'success'
      };
    }
    
    throw new Error('翻译失败');
  } catch (error) {
    console.error('MyMemory翻译失败:', error);
    throw error;
  }
}

/**
 * 使用 LibreTranslate API 翻译
 */
async function translateWithLibre(text, targetLang = 'en', sourceLang = 'auto') {
  try {
    const sourceCode = sourceLang === 'auto' ? detectLanguage(text) : sourceLang;
    const targetCode = LANGUAGE_CODES[targetLang]?.libre || 'en';
    const sourceCodeShort = LANGUAGE_CODES[sourceCode]?.libre || 'zh';
    
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceCodeShort,
        target: targetCode,
        format: 'text'
      })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (data.translatedText) {
      return {
        translatedText: data.translatedText,
        engine: 'libre',
        confidence: 0.8,
        status: 'success'
      };
    }
    
    throw new Error('翻译失败');
  } catch (error) {
    console.error('LibreTranslate翻译失败:', error);
    throw error;
  }
}

/**
 * 使用标签数据库翻译
 */
function translateWithTagDatabase(text, targetLang = 'zh') {
  try {
    if (targetLang === 'zh') {
      // 英文到中文翻译
      const translation = findChineseTranslation(text);
      if (translation) {
        return {
          translatedText: translation,
          engine: 'tagDatabase',
          confidence: 1.0,
          status: 'success'
        };
      }
    } else if (targetLang === 'en') {
      // 中文到英文翻译（反向查找）
      const englishTag = findEnglishTranslation(text);
      if (englishTag) {
        return {
          translatedText: englishTag,
          engine: 'tagDatabase',
          confidence: 1.0,
          status: 'success'
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('标签数据库翻译失败:', error);
    return null;
  }
}

/**
 * 语言检测
 */
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';
  
  // 中文检测
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
  
  // 日文检测
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
  
  // 韩文检测
  if (/[\uac00-\ud7af]/.test(text)) return 'ko';
  
  // 俄文检测
  if (/[\u0400-\u04ff]/.test(text)) return 'ru';
  
  // 默认为英文
  return 'en';
}

/**
 * 智能翻译 - 多引擎降级策略
 */
export async function smartTranslate(text, targetLang = 'en', sourceLang = 'auto') {
  if (!text || !text.trim()) {
    throw new Error('翻译内容不能为空');
  }
  
  // 1. 优先使用标签数据库翻译
  const tagDbResult = translateWithTagDatabase(text, targetLang);
  if (tagDbResult) {
    console.log('✅ 使用标签数据库翻译:', tagDbResult);
    return tagDbResult;
  }
  
  // 2. 按优先级尝试在线翻译引擎（MyMemory为默认首选引擎）
  const engines = [
    { name: 'mymemory', fn: translateWithMyMemory },  // 默认引擎：最稳定的免费API
    { name: 'libre', fn: translateWithLibre }         // 备用引擎：开源免费翻译
  ];
  
  for (const engine of engines) {
    try {
      console.log(`🔄 尝试使用 ${engine.name} 翻译...`);
      const result = await Promise.race([
        engine.fn(text, targetLang, sourceLang),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('请求超时')), 8000)
        )
      ]);
      
      if (result && result.translatedText) {
        console.log(`✅ ${engine.name} 翻译成功:`, result);
        return result;
      }
    } catch (error) {
      console.warn(`❌ ${engine.name} 翻译失败:`, error.message);
      continue;
    }
  }
  
  // 3. 所有引擎都失败，返回原文
  console.warn('⚠️ 所有翻译引擎都失败，返回原文');
  return {
    translatedText: text,
    engine: 'fallback',
    confidence: 0,
    status: 'fallback',
    error: '翻译服务暂时不可用'
  };
}

/**
 * 翻译单个标签
 */
export async function translateTag(tag, targetLang = 'zh') {
  if (!tag || typeof tag !== 'string') {
    throw new Error('标签不能为空');
  }
  
  try {
    const result = await smartTranslate(tag.trim(), targetLang);
    return result;
  } catch (error) {
    console.error('标签翻译失败:', error);
    throw error;
  }
}

/**
 * 翻译提示词
 */
export async function translatePrompt(prompt, options = {}) {
  const {
    targetLang = 'en',
    sourceLang = 'auto'
  } = options;
  
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('提示词不能为空');
  }
  
  try {
    const result = await smartTranslate(prompt.trim(), targetLang, sourceLang);
    return result;
  } catch (error) {
    console.error('提示词翻译失败:', error);
    throw error;
  }
}

/**
 * 批量翻译
 */
export async function batchTranslate(items, targetLang = 'en') {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('翻译项目不能为空');
  }
  
  const results = [];
  
  for (const item of items) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // 防止频率限制
      const result = await translateTag(item, targetLang);
      results.push({
        original: item,
        translated: result.translatedText,
        engine: result.engine,
        status: 'success'
      });
    } catch (error) {
      results.push({
        original: item,
        translated: item,
        engine: 'error',
        status: 'error',
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * 获取可用的翻译引擎
 */
export function getAvailableEngines() {
  return TRANSLATION_ENGINES;
}

/**
 * 测试翻译引擎
 */
export async function testEngine(engineKey) {
  const testText = '你好';
  const expectedResult = 'hello';
  
  try {
    let result;
    
    switch (engineKey) {
      case 'mymemory':
        result = await translateWithMyMemory(testText, 'en');
        break;
      case 'libre':
        result = await translateWithLibre(testText, 'en');
        break;
      case 'tagDatabase':
        result = translateWithTagDatabase('beautiful girl', 'zh');
        break;
      default:
        throw new Error(`未知的翻译引擎: ${engineKey}`);
    }
    
    if (result && result.translatedText) {
      return {
        status: 'available',
        engine: engineKey,
        testResult: result.translatedText,
        message: '测试成功'
      };
    } else {
      throw new Error('翻译结果为空');
    }
  } catch (error) {
    return {
      status: 'unavailable',
      engine: engineKey,
      error: error.message,
      message: '测试失败'
    };
  }
}

/**
 * 检查翻译服务状态
 */
export async function checkTranslationService() {
  const results = {};
  
  for (const engineKey of Object.keys(TRANSLATION_ENGINES)) {
    try {
      const result = await testEngine(engineKey);
      results[engineKey] = result;
    } catch (error) {
      results[engineKey] = {
        status: 'unavailable',
        engine: engineKey,
        error: error.message
      };
    }
  }
  
  // 添加标签数据库引擎测试
  try {
    const tagDbResult = await testEngine('tagDatabase');
    results.tagDatabase = tagDbResult;
  } catch (error) {
    results.tagDatabase = {
      status: 'unavailable',
      engine: 'tagDatabase',
      error: error.message
    };
  }
  
  return {
    overall: Object.values(results).some(r => r.status === 'available') ? 'available' : 'unavailable',
    engines: results,
    timestamp: new Date().toISOString()
  };
}

/**
 * 获取默认翻译引擎
 */
export function getDefaultEngine() {
  return DEFAULT_TRANSLATION_ENGINE;
}

/**
 * 获取推荐的引擎顺序
 */
export function getPreferredEngineOrder() {
  return PREFERRED_ENGINE_ORDER;
}

// 默认导出
export default {
  smartTranslate,
  translateTag,
  translatePrompt,
  batchTranslate,
  detectLanguage,
  testEngine,
  getAvailableEngines,
  checkTranslationService,
  getDefaultEngine,
  getPreferredEngineOrder,
  TRANSLATION_ENGINES,
  DEFAULT_TRANSLATION_ENGINE,
  PREFERRED_ENGINE_ORDER
}; 