/**
 * 存储状态管理 Hook - I-Prompt
 * 支持会话数据和持久化数据的自动同步
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  sessionStorage_custom, 
  persistentStorage, 
  temporaryStorage, 
  STORAGE_KEYS,
  STORAGE_TYPES
} from '../utils/storageManager';

/**
 * 存储状态Hook - 自动同步状态和存储
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @param {string} storageType - 存储类型 ('session' | 'persistent' | 'temporary')
 * @param {object} options - 选项配置
 */
export function useStorageState(key, defaultValue = null, storageType = 'persistent', options = {}) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    debounceMs = 300,
    enableLogging = false
  } = options;

  // 获取对应的存储接口
  const getStorageInterface = useCallback(() => {
    switch (storageType) {
      case 'session':
        return sessionStorage_custom;
      case 'temporary':
        return temporaryStorage;
      default:
        return persistentStorage;
    }
  }, [storageType]);

  const storage = getStorageInterface();
  
  // 初始化状态
  const [state, setState] = useState(() => {
    const stored = storage.get(key, defaultValue);
    if (enableLogging) {
      console.log(`🔄 [useStorageState] 初始化 ${key}:`, stored);
    }
    return stored;
  });

  // 防抖计时器
  const debounceTimer = useRef(null);
  const isInitialized = useRef(false);

  // 更新存储的防抖函数
  const updateStorage = useCallback((value) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      storage.set(key, value);
      if (enableLogging) {
        console.log(`💾 [useStorageState] 保存 ${key}:`, value);
      }
    }, debounceMs);
  }, [key, storage, debounceMs, enableLogging]);

  // 状态更新函数
  const setValue = useCallback((value) => {
    setState(prevState => {
      const newValue = typeof value === 'function' ? value(prevState) : value;
      
      // 只有在初始化完成后才更新存储
      if (isInitialized.current) {
        updateStorage(newValue);
      }
      
      return newValue;
    });
  }, [updateStorage]);

  // 监听状态变化，同步到存储
  useEffect(() => {
    if (isInitialized.current) {
      updateStorage(state);
    } else {
      // 标记初始化完成
      isInitialized.current = true;
    }
  }, [state, updateStorage]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // 手动刷新函数
  const refresh = useCallback(() => {
    const stored = storage.get(key, defaultValue);
    setState(stored);
    if (enableLogging) {
      console.log(`🔄 [useStorageState] 刷新 ${key}:`, stored);
    }
  }, [key, defaultValue, storage, enableLogging]);

  // 删除函数
  const remove = useCallback(() => {
    storage.remove(key);
    setState(defaultValue);
    if (enableLogging) {
      console.log(`🗑️ [useStorageState] 删除 ${key}`);
    }
  }, [key, defaultValue, storage, enableLogging]);

  return [state, setValue, { refresh, remove }];
}

/**
 * 会话状态Hook (1小时过期)
 */
export function useSessionState(key, defaultValue = null, options = {}) {
  return useStorageState(key, defaultValue, 'session', options);
}

/**
 * 持久状态Hook (半永久)
 */
export function usePersistentState(key, defaultValue = null, options = {}) {
  return useStorageState(key, defaultValue, 'persistent', options);
}

/**
 * 临时状态Hook (页面关闭时清除)
 */
export function useTemporaryState(key, defaultValue = null, options = {}) {
  return useStorageState(key, defaultValue, 'temporary', options);
}

// =============================================================================
// 预定义的状态Hook - 会话数据
// =============================================================================

/**
 * 用户输入提示词 Hook (会话数据)
 */
export function useInputPrompt() {
  return useSessionState(STORAGE_KEYS.SESSION.INPUT_PROMPT, '');
}

/**
 * 英文提示词 Hook (会话数据)
 */
export function useEnglishPrompt() {
  return useSessionState(STORAGE_KEYS.SESSION.ENGLISH_PROMPT, '');
}

/**
 * 选中标签 Hook (会话数据)
 */
export function useSelectedTags() {
  return useSessionState(STORAGE_KEYS.SESSION.SELECTED_TAGS, []);
}

/**
 * 禁用标签 Hook (会话数据)
 */
export function useDisabledTags() {
  return useSessionState(STORAGE_KEYS.SESSION.DISABLED_TAGS, new Set());
}

/**
 * 翻译设置 Hook (会话数据)
 */
export function useTranslationSettings() {
  return useSessionState(STORAGE_KEYS.SESSION.TRANSLATION_SETTINGS, {
    selectedTranslator: 'baidu_web',
    targetLanguage: 'en',
    autoTranslate: true
  });
}

/**
 * UI状态 Hook (会话数据)
 */
export function useUIState() {
  return useSessionState(STORAGE_KEYS.SESSION.UI_STATE, {
    expandedCategories: { favorites: true },
    managementMode: 'view',
    showAdvancedOptions: false
  });
}

/**
 * 选中分类 Hook (会话数据)
 */
export function useSelectedCategory() {
  return useSessionState(STORAGE_KEYS.SESSION.SELECTED_CATEGORY, 'favorites');
}

/**
 * 选中子分类 Hook (会话数据)
 */
export function useSelectedSubcategory() {
  return useSessionState(STORAGE_KEYS.SESSION.SELECTED_SUBCATEGORY, null);
}

/**
 * 展开分类 Hook (会话数据)
 */
export function useExpandedCategories() {
  return useSessionState(STORAGE_KEYS.SESSION.EXPANDED_CATEGORIES, { favorites: true });
}

/**
 * 库模式 Hook (会话数据)
 */
export function useLibraryMode() {
  return useSessionState(STORAGE_KEYS.SESSION.LIBRARY_MODE, 'default');
}

// =============================================================================
// 预定义的状态Hook - 持久数据
// =============================================================================

/**
 * 自定义标签库 Hook (持久数据)
 */
export function useCustomTagLibrary() {
  return usePersistentState(STORAGE_KEYS.PERSISTENT.CUSTOM_TAG_LIBRARY, {
    categories: {
      'favorites': {
        name: '我的收藏',
        icon: '⭐',
        subcategories: {
          'personal': {
            name: '个人收藏',
            tags: [],
            isDefault: false
          }
        }
      }
    }
  });
}

/**
 * 用户标签库 Hook (持久数据)
 */
export function useUserTagDatabase() {
  return usePersistentState(STORAGE_KEYS.PERSISTENT.USER_TAG_DATABASE, {});
}

/**
 * 收藏夹 Hook (持久数据)
 */
export function useFavorites() {
  return usePersistentState(STORAGE_KEYS.PERSISTENT.FAVORITES, []);
}

/**
 * 用户偏好设置 Hook (持久数据)
 */
export function useUserPreferences() {
  return usePersistentState(STORAGE_KEYS.PERSISTENT.USER_PREFERENCES, {
    theme: 'light',
    language: 'zh-CN',
    autoSave: true,
    enableNotifications: true,
    defaultTranslator: 'baidu_web',
    autoTranslateOnInput: true
  });
}

/**
 * 翻译历史 Hook (持久数据)
 */
export function useTranslationHistory() {
  return usePersistentState(STORAGE_KEYS.PERSISTENT.TRANSLATION_HISTORY, []);
}

// =============================================================================
// 预定义的状态Hook - 临时数据
// =============================================================================

/**
 * 剪贴板历史 Hook (临时数据)
 */
export function useClipboardHistory() {
  return useTemporaryState(STORAGE_KEYS.TEMPORARY.CLIPBOARD_HISTORY, []);
}

/**
 * 搜索历史 Hook (临时数据)
 */
export function useSearchHistory() {
  return useTemporaryState(STORAGE_KEYS.TEMPORARY.SEARCH_HISTORY, []);
}

/**
 * 最后操作 Hook (临时数据)
 */
export function useLastOperation() {
  return useTemporaryState(STORAGE_KEYS.TEMPORARY.LAST_OPERATION, null);
}

// =============================================================================
// 便捷Hook函数引用 (非Hook工厂函数)
// =============================================================================

/**
 * 获取所有会话状态Hook函数引用
 * 这不是一个Hook，而是一个工厂函数
 */
export function getSessionStatesHooks() {
  return {
    inputPrompt: useInputPrompt,
    englishPrompt: useEnglishPrompt,
    selectedTags: useSelectedTags,
    disabledTags: useDisabledTags,
    translationSettings: useTranslationSettings,
    uiState: useUIState,
    selectedCategory: useSelectedCategory,
    selectedSubcategory: useSelectedSubcategory,
    expandedCategories: useExpandedCategories,
    libraryMode: useLibraryMode
  };
}

/**
 * 获取所有持久状态Hook函数引用
 * 这不是一个Hook，而是一个工厂函数
 */
export function getPersistentStatesHooks() {
  return {
    customTagLibrary: useCustomTagLibrary,
    userTagDatabase: useUserTagDatabase,
    favorites: useFavorites,
    userPreferences: useUserPreferences,
    translationHistory: useTranslationHistory
  };
}

/**
 * 获取所有临时状态Hook函数引用
 * 这不是一个Hook，而是一个工厂函数
 */
export function getTemporaryStatesHooks() {
  return {
    clipboardHistory: useClipboardHistory,
    searchHistory: useSearchHistory,
    lastOperation: useLastOperation
  };
}

// 弃用的函数已被移除，请使用对应的新函数：
// - getSessionStatesHooks()
// - getPersistentStatesHooks() 
// - getTemporaryStatesHooks()

/**
 * 存储同步Hook - 用于组件间数据同步
 */
export function useStorageSync(keys, storageType = 'session') {
  const [syncData, setSyncData] = useState({});
  const storage = storageType === 'session' ? sessionStorage_custom : persistentStorage;
  
  useEffect(() => {
    const loadSyncData = () => {
      const data = {};
      keys.forEach(key => {
        data[key] = storage.get(key);
      });
      setSyncData(data);
    };
    
    // 初始化加载
    loadSyncData();
    
    // 监听存储变化
    const handleStorageChange = (e) => {
      if (keys.includes(e.key)) {
        loadSyncData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [keys, storage]);
  
  const updateSyncData = useCallback((key, value) => {
    storage.set(key, value);
    setSyncData(prev => ({ ...prev, [key]: value }));
  }, [storage]);
  
  return [syncData, updateSyncData];
}

/**
 * 存储迁移Hook - 用于数据版本升级
 */
export function useStorageMigration(migrations) {
  useEffect(() => {
    const currentVersion = persistentStorage.get('data_version', '1.0.0');
    
    Object.entries(migrations).forEach(([version, migrationFn]) => {
      if (compareVersions(currentVersion, version) < 0) {
        try {
          migrationFn();
          console.log(`✅ [Migration] 成功迁移到版本 ${version}`);
        } catch (error) {
          console.error(`❌ [Migration] 迁移到版本 ${version} 失败:`, error);
        }
      }
    });
    
    // 更新版本号
    const latestVersion = Object.keys(migrations).sort(compareVersions).pop();
    if (latestVersion && compareVersions(currentVersion, latestVersion) < 0) {
      persistentStorage.set('data_version', latestVersion);
    }
  }, [migrations]);
}

/**
 * 版本比较函数
 */
function compareVersions(version1, version2) {
  const parts1 = version1.split('.').map(Number);
  const parts2 = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }
  
  return 0;
}