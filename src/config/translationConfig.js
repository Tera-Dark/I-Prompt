/**
 * I-Prompt 翻译服务配置
 * 
 * 该配置文件定义了翻译服务的默认设置
 * 确保在整个应用中使用一致的翻译引擎配置
 */

// 默认翻译引擎：MyMemory
// 选择理由：
// 1. 免费且稳定的API
// 2. 无需API密钥
// 3. 支持多种语言
// 4. 在国内网络环境下表现良好
export const DEFAULT_TRANSLATION_ENGINE = 'mymemory';

// 默认目标语言
export const DEFAULT_TARGET_LANGUAGE = 'en';

// 默认源语言（auto表示自动检测）
export const DEFAULT_SOURCE_LANGUAGE = 'auto';

// 翻译请求超时时间（毫秒）
export const TRANSLATION_TIMEOUT = 10000;

// 批量翻译间隔时间（毫秒）
export const BATCH_TRANSLATION_DELAY = 200;

// 翻译缓存配置
export const TRANSLATION_CACHE = {
  enabled: true,
  maxSize: 1000,
  ttl: 24 * 60 * 60 * 1000, // 24小时
  storageKey: 'translation_cache'
};

// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

// 用户友好的引擎名称映射
export const ENGINE_DISPLAY_NAMES = {
  mymemory: 'MyMemory (推荐)',
  libre: 'LibreTranslate',
  lingvanex: 'Lingvanex',
  tagDatabase: '标签数据库'
};

export default {
  DEFAULT_TRANSLATION_ENGINE,
  DEFAULT_TARGET_LANGUAGE,
  DEFAULT_SOURCE_LANGUAGE,
  TRANSLATION_TIMEOUT,
  BATCH_TRANSLATION_DELAY,
  TRANSLATION_CACHE,
  ENGINE_DISPLAY_NAMES
}; 