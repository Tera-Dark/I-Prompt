/**
 * 数据持久化存储管理器 - I-Prompt
 * 支持会话数据(1小时生命周期)和半永久数据的分别管理
 */

// 存储类型常量
export const STORAGE_TYPES = {
  SESSION: 'session',       // 会话数据 - 1小时过期
  PERSISTENT: 'persistent', // 半永久数据 - 长期保存
  TEMPORARY: 'temporary'    // 临时数据 - 页面关闭时清除
};

// 存储键名常量
export const STORAGE_KEYS = {
  // 会话数据 (1小时过期)
  SESSION: {
    INPUT_PROMPT: 'session_input_prompt',
    ENGLISH_PROMPT: 'session_english_prompt',
    SELECTED_TAGS: 'session_selected_tags',
    DISABLED_TAGS: 'session_disabled_tags',
    TRANSLATION_SETTINGS: 'session_translation_settings',
    UI_STATE: 'session_ui_state',
    SELECTED_CATEGORY: 'session_selected_category',
    SELECTED_SUBCATEGORY: 'session_selected_subcategory',
    EXPANDED_CATEGORIES: 'session_expanded_categories',
    LIBRARY_MODE: 'session_library_mode'
  },
  
  // 半永久数据 (长期保存)
  PERSISTENT: {
    CUSTOM_TAG_LIBRARY: 'customTagLibrary',
    USER_TAG_DATABASE: 'userTagDatabase',
    FAVORITES: 'favorites',
    USER_PREFERENCES: 'user_preferences',
    CUSTOM_CATEGORIES: 'custom_categories',
    CUSTOM_SUBCATEGORIES: 'custom_subcategories',
    TRANSLATION_HISTORY: 'translation_history'
  },
  
  // 临时数据 (页面关闭时清除)
  TEMPORARY: {
    CLIPBOARD_HISTORY: 'temp_clipboard_history',
    SEARCH_HISTORY: 'temp_search_history',
    LAST_OPERATION: 'temp_last_operation'
  }
};

// 数据过期时间设置
const EXPIRY_TIMES = {
  SESSION: 60 * 60 * 1000,     // 1小时
  PERSISTENT: 365 * 24 * 60 * 60 * 1000, // 1年（半永久）
  TEMPORARY: 0                  // 无过期时间，页面关闭时清除
};

/**
 * 存储管理器类
 */
class StorageManager {
  constructor() {
    this.isSupported = this.checkStorageSupport();
    this.initializeStorageType();
    this.startCleanupTimer();
  }

  /**
   * 检查浏览器存储支持
   */
  checkStorageSupport() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('本地存储不可用，将使用内存存储');
      return false;
    }
  }

  /**
   * 初始化存储类型配置
   */
  initializeStorageType() {
    if (!this.isSupported) {
      // 如果localStorage不可用，创建内存存储
      this.memoryStorage = new Map();
    }
  }

  /**
   * 启动清理定时器
   */
  startCleanupTimer() {
    // 每15分钟清理一次过期数据
    setInterval(() => {
      this.cleanupExpiredData();
    }, 15 * 60 * 1000);

    // 页面加载时立即清理一次
    this.cleanupExpiredData();
  }

  /**
   * 获取存储对象
   */
  getStorageObject(storageType) {
    switch (storageType) {
      case STORAGE_TYPES.SESSION:
      case STORAGE_TYPES.PERSISTENT:
        return this.isSupported ? localStorage : this.memoryStorage;
      case STORAGE_TYPES.TEMPORARY:
        return this.isSupported ? sessionStorage : this.memoryStorage;
      default:
        return this.isSupported ? localStorage : this.memoryStorage;
    }
  }

  /**
   * 创建带时间戳的数据包装器
   */
  createDataWrapper(data, storageType) {
    const expiryTime = EXPIRY_TIMES[storageType] || EXPIRY_TIMES.PERSISTENT;
    return {
      data,
      timestamp: Date.now(),
      expiry: expiryTime > 0 ? Date.now() + expiryTime : null,
      storageType,
      version: '1.0'
    };
  }

  /**
   * 解析数据包装器
   */
  parseDataWrapper(wrappedData) {
    try {
      if (typeof wrappedData === 'string') {
        wrappedData = JSON.parse(wrappedData);
      }

      // 检查数据格式
      if (!wrappedData || typeof wrappedData !== 'object') {
        return null;
      }

      // 检查是否过期
      if (wrappedData.expiry && Date.now() > wrappedData.expiry) {
        return null; // 数据已过期
      }

      return wrappedData.data;
    } catch (error) {
      console.warn('解析存储数据失败:', error);
      return null;
    }
  }

  /**
   * 存储数据
   */
  setItem(key, data, storageType = STORAGE_TYPES.PERSISTENT) {
    try {
      const storage = this.getStorageObject(storageType);
      const wrappedData = this.createDataWrapper(data, storageType);

      if (this.isSupported) {
        storage.setItem(key, JSON.stringify(wrappedData));
      } else {
        storage.set(key, wrappedData);
      }

      console.log(`📦 [Storage] 保存数据: ${key} (${storageType})`);
      return true;
    } catch (error) {
      console.error(`存储数据失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 获取数据
   */
  getItem(key, defaultValue = null, storageType = STORAGE_TYPES.PERSISTENT) {
    try {
      const storage = this.getStorageObject(storageType);
      let wrappedData;

      if (this.isSupported) {
        wrappedData = storage.getItem(key);
      } else {
        wrappedData = storage.get(key);
      }

      if (!wrappedData) {
        return defaultValue;
      }

      const parsedData = this.parseDataWrapper(wrappedData);
      
      if (parsedData === null) {
        // 数据过期或损坏，删除它
        this.removeItem(key, storageType);
        return defaultValue;
      }

      console.log(`📂 [Storage] 读取数据: ${key} (${storageType})`);
      return parsedData;
    } catch (error) {
      console.error(`读取数据失败 [${key}]:`, error);
      return defaultValue;
    }
  }

  /**
   * 删除数据
   */
  removeItem(key, storageType = STORAGE_TYPES.PERSISTENT) {
    try {
      const storage = this.getStorageObject(storageType);
      
      if (this.isSupported) {
        storage.removeItem(key);
      } else {
        storage.delete(key);
      }

      console.log(`🗑️ [Storage] 删除数据: ${key} (${storageType})`);
      return true;
    } catch (error) {
      console.error(`删除数据失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 检查数据是否存在
   */
  hasItem(key, storageType = STORAGE_TYPES.PERSISTENT) {
    try {
      const storage = this.getStorageObject(storageType);
      
      if (this.isSupported) {
        return storage.getItem(key) !== null;
      } else {
        return storage.has(key);
      }
    } catch (error) {
      console.error(`检查数据存在性失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 清理过期数据
   */
  cleanupExpiredData() {
    try {
      const allKeys = [];
      
      if (this.isSupported) {
        // 获取localStorage的所有键
        for (let i = 0; i < localStorage.length; i++) {
          allKeys.push(localStorage.key(i));
        }
      } else {
        // 获取内存存储的所有键
        allKeys.push(...this.memoryStorage.keys());
      }

      let cleanedCount = 0;
      
      allKeys.forEach(key => {
        if (key && (key.startsWith('session_') || key.includes('temp_'))) {
          const data = this.getItem(key, null, STORAGE_TYPES.SESSION);
          if (data === null) {
            cleanedCount++;
          }
        }
      });

      if (cleanedCount > 0) {
        console.log(`🧹 [Storage] 清理了 ${cleanedCount} 个过期数据`);
      }
    } catch (error) {
      console.error('清理过期数据失败:', error);
    }
  }

  /**
   * 获取存储统计信息
   */
  getStorageStats() {
    try {
      const stats = {
        sessionData: 0,
        persistentData: 0,
        temporaryData: 0,
        totalSize: 0,
        expiredItems: 0
      };

      if (this.isSupported) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const item = localStorage.getItem(key);
          
          if (item) {
            stats.totalSize += item.length;
            
            if (key.startsWith('session_')) {
              stats.sessionData++;
            } else if (key.startsWith('temp_')) {
              stats.temporaryData++;
            } else {
              stats.persistentData++;
            }

            // 检查是否过期
            try {
              const parsed = JSON.parse(item);
              if (parsed.expiry && Date.now() > parsed.expiry) {
                stats.expiredItems++;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      } else {
        stats.sessionData = this.memoryStorage.size;
      }

      return stats;
    } catch (error) {
      console.error('获取存储统计失败:', error);
      return null;
    }
  }

  /**
   * 导出数据
   */
  exportData(storageType = STORAGE_TYPES.PERSISTENT) {
    try {
      const exportData = {};
      const storage = this.getStorageObject(storageType);

      if (this.isSupported) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const item = localStorage.getItem(key);
          
          if (item) {
            try {
              const parsed = JSON.parse(item);
              if (parsed.storageType === storageType) {
                exportData[key] = parsed.data;
              }
            } catch (e) {
              // 跳过无法解析的数据
            }
          }
        }
      } else {
        this.memoryStorage.forEach((value, key) => {
          if (value.storageType === storageType) {
            exportData[key] = value.data;
          }
        });
      }

      return {
        version: '1.0',
        storageType,
        timestamp: new Date().toISOString(),
        data: exportData
      };
    } catch (error) {
      console.error('导出数据失败:', error);
      return null;
    }
  }

  /**
   * 导入数据
   */
  importData(importData, storageType = STORAGE_TYPES.PERSISTENT) {
    try {
      if (!importData || !importData.data) {
        throw new Error('无效的导入数据格式');
      }

      let importCount = 0;
      
      Object.entries(importData.data).forEach(([key, value]) => {
        if (this.setItem(key, value, storageType)) {
          importCount++;
        }
      });

      console.log(`📥 [Storage] 导入了 ${importCount} 项数据`);
      return importCount;
    } catch (error) {
      console.error('导入数据失败:', error);
      throw error;
    }
  }

  /**
   * 清空特定类型的所有数据
   */
  clearStorageType(storageType) {
    try {
      let clearedCount = 0;
      const storage = this.getStorageObject(storageType);

      if (this.isSupported) {
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const item = localStorage.getItem(key);
          
          if (item) {
            try {
              const parsed = JSON.parse(item);
              if (parsed.storageType === storageType) {
                keysToRemove.push(key);
              }
            } catch (e) {
              // 跳过无法解析的数据
            }
          }
        }

        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          clearedCount++;
        });
      } else {
        const keysToRemove = [];
        this.memoryStorage.forEach((value, key) => {
          if (value.storageType === storageType) {
            keysToRemove.push(key);
          }
        });

        keysToRemove.forEach(key => {
          this.memoryStorage.delete(key);
          clearedCount++;
        });
      }

      console.log(`🧹 [Storage] 清空了 ${clearedCount} 项 ${storageType} 数据`);
      return clearedCount;
    } catch (error) {
      console.error(`清空${storageType}数据失败:`, error);
      return 0;
    }
  }
}

// 创建单例实例
const storageManager = new StorageManager();

/**
 * 便捷的存储操作函数
 */

// 会话数据操作 (1小时过期)
export const sessionStorage_custom = {
  set: (key, data) => storageManager.setItem(key, data, STORAGE_TYPES.SESSION),
  get: (key, defaultValue = null) => storageManager.getItem(key, defaultValue, STORAGE_TYPES.SESSION),
  remove: (key) => storageManager.removeItem(key, STORAGE_TYPES.SESSION),
  has: (key) => storageManager.hasItem(key, STORAGE_TYPES.SESSION),
  clear: () => storageManager.clearStorageType(STORAGE_TYPES.SESSION)
};

// 持久数据操作 (半永久)
export const persistentStorage = {
  set: (key, data) => storageManager.setItem(key, data, STORAGE_TYPES.PERSISTENT),
  get: (key, defaultValue = null) => storageManager.getItem(key, defaultValue, STORAGE_TYPES.PERSISTENT),
  remove: (key) => storageManager.removeItem(key, STORAGE_TYPES.PERSISTENT),
  has: (key) => storageManager.hasItem(key, STORAGE_TYPES.PERSISTENT),
  clear: () => storageManager.clearStorageType(STORAGE_TYPES.PERSISTENT)
};

// 临时数据操作 (页面关闭时清除)
export const temporaryStorage = {
  set: (key, data) => storageManager.setItem(key, data, STORAGE_TYPES.TEMPORARY),
  get: (key, defaultValue = null) => storageManager.getItem(key, defaultValue, STORAGE_TYPES.TEMPORARY),
  remove: (key) => storageManager.removeItem(key, STORAGE_TYPES.TEMPORARY),
  has: (key) => storageManager.hasItem(key, STORAGE_TYPES.TEMPORARY),
  clear: () => storageManager.clearStorageType(STORAGE_TYPES.TEMPORARY)
};

// 工具函数
export const storageUtils = {
  getStats: () => storageManager.getStorageStats(),
  cleanup: () => storageManager.cleanupExpiredData(),
  export: (type) => storageManager.exportData(type),
  import: (data, type) => storageManager.importData(data, type),
  isSupported: storageManager.isSupported
};

export default storageManager; 