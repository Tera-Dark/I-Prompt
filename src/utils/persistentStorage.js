/**
 * 持久化存储工具
 * 用于保存提示词生成结果、输入历史和用户偏好
 */

import { logger } from '../config/debug.js';

const STORAGE_KEYS = {
  GENERATED_PROMPTS: 'i_prompt_generated_prompts',
  INPUT_HISTORY: 'i_prompt_input_history',
  USER_PREFERENCES: 'i_prompt_user_preferences',
  GENERATION_SESSIONS: 'i_prompt_generation_sessions',
  DRAFT_CONTENT: 'i_prompt_draft_content'
};

class PersistentStorage {
  constructor() {
    this.isSupported = this.checkStorageSupport();
  }

  /**
   * 检查本地存储支持
   */
  checkStorageSupport() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      logger.warn('LocalStorage不支持，数据不会持久化');
      return false;
    }
  }

  /**
   * 安全的JSON序列化
   */
  safeStringify(data) {
    try {
      return JSON.stringify(data);
    } catch (error) {
      logger.error('JSON序列化失败:', error);
      return null;
    }
  }

  /**
   * 安全的JSON反序列化
   */
  safeParse(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      logger.error('JSON解析失败:', error);
      return null;
    }
  }

  /**
   * 保存生成的提示词
   */
  saveGeneratedPrompt(promptData) {
    if (!this.isSupported) return false;

    const sessionId = Date.now().toString();
    const data = {
      id: sessionId,
      timestamp: new Date().toISOString(),
      inputText: promptData.inputText,
      selectedStyle: promptData.selectedStyle,
      generatedPrompt: promptData.generatedPrompt,
      metadata: {
        source: promptData.source || 'ai',
        generationCount: promptData.generationCount || 1,
        characterCount: promptData.generatedPrompt?.length || 0,
        tagCount: promptData.generatedPrompt?.split(',').length || 0
      }
    };

    try {
      const existing = this.getGeneratedPrompts();
      const updated = [data, ...existing.slice(0, 49)]; // 保持最近50条记录
      
      localStorage.setItem(STORAGE_KEYS.GENERATED_PROMPTS, this.safeStringify(updated));
      
      // 同时保存到会话记录
      this.saveGenerationSession(data);
      
      logger.ui('✅ 提示词已保存到本地存储:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('保存生成提示词失败:', error);
      return false;
    }
  }

  /**
   * 获取所有生成的提示词
   */
  getGeneratedPrompts() {
    if (!this.isSupported) return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GENERATED_PROMPTS);
      return stored ? this.safeParse(stored) || [] : [];
    } catch (error) {
      console.error('获取生成提示词失败:', error);
      return [];
    }
  }

  /**
   * 根据ID获取特定的提示词
   */
  getGeneratedPromptById(id) {
    const prompts = this.getGeneratedPrompts();
    return prompts.find(prompt => prompt.id === id) || null;
  }

  /**
   * 删除特定的提示词
   */
  deleteGeneratedPrompt(id) {
    if (!this.isSupported) return false;

    try {
      const existing = this.getGeneratedPrompts();
      const filtered = existing.filter(prompt => prompt.id !== id);
      
      localStorage.setItem(STORAGE_KEYS.GENERATED_PROMPTS, this.safeStringify(filtered));
      return true;
    } catch (error) {
      console.error('删除提示词失败:', error);
      return false;
    }
  }

  /**
   * 保存输入历史
   */
  saveInputHistory(inputText, selectedStyle) {
    if (!this.isSupported || !inputText?.trim()) return false;

    try {
      const existing = this.getInputHistory();
      const newEntry = {
        text: inputText.trim(),
        style: selectedStyle || '',
        timestamp: new Date().toISOString()
      };

      // 去重并保持最近20条记录
      const filtered = existing.filter(entry => 
        entry.text !== newEntry.text || entry.style !== newEntry.style
      );
      const updated = [newEntry, ...filtered.slice(0, 19)];
      
      localStorage.setItem(STORAGE_KEYS.INPUT_HISTORY, this.safeStringify(updated));
      return true;
    } catch (error) {
      console.error('保存输入历史失败:', error);
      return false;
    }
  }

  /**
   * 获取输入历史
   */
  getInputHistory() {
    if (!this.isSupported) return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INPUT_HISTORY);
      return stored ? this.safeParse(stored) || [] : [];
    } catch (error) {
      console.error('获取输入历史失败:', error);
      return [];
    }
  }

  /**
   * 保存草稿内容
   */
  saveDraftContent(content) {
    if (!this.isSupported) return false;

    try {
      const draftData = {
        inputText: content.inputText || '',
        selectedStyle: content.selectedStyle || '',
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEYS.DRAFT_CONTENT, this.safeStringify(draftData));
      return true;
    } catch (error) {
      console.error('保存草稿失败:', error);
      return false;
    }
  }

  /**
   * 获取草稿内容
   */
  getDraftContent() {
    if (!this.isSupported) return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DRAFT_CONTENT);
      const draft = stored ? this.safeParse(stored) : null;
      
      // 检查草稿是否过期（24小时）
      if (draft && draft.timestamp) {
        const draftTime = new Date(draft.timestamp);
        const now = new Date();
        const hoursDiff = (now - draftTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          this.clearDraftContent();
          return null;
        }
      }
      
      return draft;
    } catch (error) {
      console.error('获取草稿失败:', error);
      return null;
    }
  }

  /**
   * 清除草稿内容
   */
  clearDraftContent() {
    if (!this.isSupported) return false;

    try {
      localStorage.removeItem(STORAGE_KEYS.DRAFT_CONTENT);
      return true;
    } catch (error) {
      console.error('清除草稿失败:', error);
      return false;
    }
  }

  /**
   * 保存用户偏好
   */
  saveUserPreferences(preferences) {
    if (!this.isSupported) return false;

    try {
      const existing = this.getUserPreferences();
      const updated = { ...existing, ...preferences };
      
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, this.safeStringify(updated));
      return true;
    } catch (error) {
      console.error('保存用户偏好失败:', error);
      return false;
    }
  }

  /**
   * 获取用户偏好
   */
  getUserPreferences() {
    if (!this.isSupported) return {};

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return stored ? this.safeParse(stored) || {} : {};
    } catch (error) {
      console.error('获取用户偏好失败:', error);
      return {};
    }
  }

  /**
   * 保存生成会话
   */
  saveGenerationSession(sessionData) {
    if (!this.isSupported) return false;

    try {
      const existing = this.getGenerationSessions();
      const updated = [sessionData, ...existing.slice(0, 9)]; // 保持最近10次会话
      
      localStorage.setItem(STORAGE_KEYS.GENERATION_SESSIONS, this.safeStringify(updated));
      return true;
    } catch (error) {
      console.error('保存生成会话失败:', error);
      return false;
    }
  }

  /**
   * 获取生成会话
   */
  getGenerationSessions() {
    if (!this.isSupported) return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GENERATION_SESSIONS);
      return stored ? this.safeParse(stored) || [] : [];
    } catch (error) {
      console.error('获取生成会话失败:', error);
      return [];
    }
  }

  /**
   * 清除所有数据
   */
  clearAllData() {
    if (!this.isSupported) return false;

    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('✅ 所有本地数据已清除');
      return true;
    } catch (error) {
      console.error('清除数据失败:', error);
      return false;
    }
  }

  /**
   * 获取存储统计信息
   */
  getStorageStats() {
    if (!this.isSupported) return null;

    try {
      const stats = {
        generatedPrompts: this.getGeneratedPrompts().length,
        inputHistory: this.getInputHistory().length,
        generationSessions: this.getGenerationSessions().length,
        hasDraft: !!this.getDraftContent(),
        storageSize: 0
      };

      // 计算总存储大小
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          stats.storageSize += item.length;
        }
      });

      stats.storageSizeKB = Math.round(stats.storageSize / 1024 * 100) / 100;

      return stats;
    } catch (error) {
      console.error('获取存储统计失败:', error);
      return null;
    }
  }

  /**
   * 导出数据
   */
  exportData() {
    if (!this.isSupported) return null;

    try {
      const data = {
        generatedPrompts: this.getGeneratedPrompts(),
        inputHistory: this.getInputHistory(),
        userPreferences: this.getUserPreferences(),
        generationSessions: this.getGenerationSessions(),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      return data;
    } catch (error) {
      console.error('导出数据失败:', error);
      return null;
    }
  }

  /**
   * 导入数据
   */
  importData(data) {
    if (!this.isSupported || !data) return false;

    try {
      if (data.generatedPrompts) {
        localStorage.setItem(STORAGE_KEYS.GENERATED_PROMPTS, this.safeStringify(data.generatedPrompts));
      }
      if (data.inputHistory) {
        localStorage.setItem(STORAGE_KEYS.INPUT_HISTORY, this.safeStringify(data.inputHistory));
      }
      if (data.userPreferences) {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, this.safeStringify(data.userPreferences));
      }
      if (data.generationSessions) {
        localStorage.setItem(STORAGE_KEYS.GENERATION_SESSIONS, this.safeStringify(data.generationSessions));
      }

      console.log('✅ 数据导入成功');
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
}

// 创建全局实例
export const persistentStorage = new PersistentStorage();

// 导出常用方法
export const {
  saveGeneratedPrompt,
  getGeneratedPrompts,
  getGeneratedPromptById,
  deleteGeneratedPrompt,
  saveInputHistory,
  getInputHistory,
  saveDraftContent,
  getDraftContent,
  clearDraftContent,
  saveUserPreferences,
  getUserPreferences,
  getStorageStats,
  clearAllData,
  exportData,
  importData
} = persistentStorage;

export default persistentStorage;