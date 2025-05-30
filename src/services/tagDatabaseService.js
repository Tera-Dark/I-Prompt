/**
 * 标签库数据服务 - 从JSON文件统一管理
 * 替代原有的分散在代码中的标签库数据
 */

import tagDatabaseData from '../data/tagDatabase.json';

/**
 * 标签库数据管理类
 */
export class TagDatabaseService {
  constructor() {
    this.data = tagDatabaseData;
    this.userDatabase = this.loadUserDatabase();
  }

  /**
   * 获取完整的标签库数据
   */
  getDatabase() {
    return {
      ...this.data.categories,
      ...this.userDatabase
    };
  }

  /**
   * 获取默认标签库数据
   */
  getDefaultDatabase() {
    return this.data.categories;
  }

  /**
   * 获取翻译映射表
   */
  getTranslations() {
    return this.data.translations.mapping;
  }

  /**
   * 根据英文查找中文翻译
   */
  findChineseTranslation(englishText) {
    const translations = this.getTranslations();
    console.log(`🔍 [findChineseTranslation] 查找: "${englishText}" -> toLowerCase: "${englishText.toLowerCase()}"`);
    console.log(`📚 [findChineseTranslation] 可用翻译数量: ${Object.keys(translations).length}`);
    
    // 检查一些特定的键
    const testKeys = ['dig', 'volvo', 'big four', 'annoying frenchman'];
    testKeys.forEach(key => {
      if (translations.hasOwnProperty(key)) {
        console.log(`✅ [findChineseTranslation] 找到键: "${key}" = "${translations[key]}"`);
      } else {
        console.log(`❌ [findChineseTranslation] 未找到键: "${key}"`);
      }
    });
    
    const result = translations[englishText.toLowerCase()] || '';
    console.log(`🎯 [findChineseTranslation] 查找结果: "${englishText}" -> "${result}"`);
    return result;
  }

  /**
   * 根据中文查找英文翻译（反向查找）
   */
  findEnglishTranslation(chineseText) {
    const translations = this.getTranslations();
    
    // 遍历所有翻译映射，查找中文对应的英文
    for (const [english, chinese] of Object.entries(translations)) {
      if (chinese === chineseText || chinese.includes(chineseText)) {
        return english;
      }
    }
    
    // 如果没有找到精确匹配，尝试在标签库中查找
    const database = this.getDatabase();
    for (const category of Object.values(database)) {
      if (category.subcategories) {
        for (const subcategory of Object.values(category.subcategories)) {
          if (subcategory.tags) {
            for (const tag of subcategory.tags) {
              if (tag.cn === chineseText || tag.cn.includes(chineseText)) {
                return tag.en;
              }
            }
          }
        }
      }
    }
    
    return '';
  }

  /**
   * 搜索标签
   */
  searchTags(query, database = null) {
    const db = database || this.getDatabase();
    const results = [];
    const queryLower = query.toLowerCase();

    Object.values(db).forEach(category => {
      if (category.subcategories) {
        Object.values(category.subcategories).forEach(subcategory => {
          if (subcategory.tags) {
            subcategory.tags.forEach(tag => {
              if (
                tag.en.toLowerCase().includes(queryLower) ||
                tag.cn.includes(query) ||
                tag.id.toLowerCase().includes(queryLower)
              ) {
                results.push({
                  ...tag,
                  category: category.name,
                  subcategory: subcategory.name
                });
              }
            });
          }
        });
      }
    });

    // 按频率排序
    return results.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));
  }

  /**
   * 获取热门标签
   */
  getPopularTags(limit = 20, database = null) {
    const db = database || this.getDatabase();
    const allTags = [];

    Object.values(db).forEach(category => {
      if (category.subcategories) {
        Object.values(category.subcategories).forEach(subcategory => {
          if (subcategory.tags) {
            allTags.push(...subcategory.tags);
          }
        });
      }
    });

    return allTags
      .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
      .slice(0, limit);
  }

  /**
   * 获取分类下的所有标签
   */
  getCategoryTags(categoryKey, subcategoryKey = null) {
    const db = this.getDatabase();
    const category = db[categoryKey];
    
    if (!category || !category.subcategories) {
      return [];
    }

    if (subcategoryKey) {
      const subcategory = category.subcategories[subcategoryKey];
      return subcategory ? subcategory.tags || [] : [];
    }

    // 返回整个分类下的所有标签
    const allTags = [];
    Object.values(category.subcategories).forEach(subcategory => {
      if (subcategory.tags) {
        allTags.push(...subcategory.tags);
      }
    });

    return allTags;
  }

  /**
   * 加载用户自定义标签库
   */
  loadUserDatabase() {
    try {
      const stored = localStorage.getItem('userTagDatabase');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('加载用户标签库失败:', error);
      return {};
    }
  }

  /**
   * 保存用户自定义标签库
   */
  saveUserDatabase(database) {
    try {
      localStorage.setItem('userTagDatabase', JSON.stringify(database));
      this.userDatabase = database;
    } catch (error) {
      console.error('保存用户标签库失败:', error);
    }
  }

  /**
   * 添加用户自定义分类
   */
  addUserCategory(categoryKey, categoryData) {
    const userDB = { ...this.userDatabase };
    userDB[categoryKey] = {
      ...categoryData,
      isDefault: false,
      isUserDefined: true
    };
    this.saveUserDatabase(userDB);
  }

  /**
   * 删除用户自定义分类
   */
  removeUserCategory(categoryKey) {
    const userDB = { ...this.userDatabase };
    delete userDB[categoryKey];
    this.saveUserDatabase(userDB);
  }

  /**
   * 添加用户自定义子分类
   */
  addUserSubcategory(categoryKey, subcategoryKey, subcategoryData) {
    const userDB = { ...this.userDatabase };
    
    if (!userDB[categoryKey]) {
      userDB[categoryKey] = {
        name: categoryKey,
        subcategories: {},
        isDefault: false,
        isUserDefined: true
      };
    }
    
    if (!userDB[categoryKey].subcategories) {
      userDB[categoryKey].subcategories = {};
    }
    
    userDB[categoryKey].subcategories[subcategoryKey] = {
      ...subcategoryData,
      isDefault: false,
      isUserDefined: true
    };
    
    this.saveUserDatabase(userDB);
  }

  /**
   * 删除用户自定义子分类
   */
  removeUserSubcategory(categoryKey, subcategoryKey) {
    const userDB = { ...this.userDatabase };
    
    if (userDB[categoryKey] && userDB[categoryKey].subcategories) {
      delete userDB[categoryKey].subcategories[subcategoryKey];
      
      // 如果分类下没有子分类了，删除整个分类
      if (Object.keys(userDB[categoryKey].subcategories).length === 0) {
        delete userDB[categoryKey];
      }
    }
    
    this.saveUserDatabase(userDB);
  }

  /**
   * 添加标签到指定分类
   */
  addTagToCategory(categoryKey, subcategoryKey, tag) {
    const userDB = { ...this.userDatabase };
    
    // 确保分类和子分类存在
    if (!userDB[categoryKey]) {
      userDB[categoryKey] = {
        name: categoryKey,
        subcategories: {},
        isDefault: false,
        isUserDefined: true
      };
    }
    
    if (!userDB[categoryKey].subcategories) {
      userDB[categoryKey].subcategories = {};
    }
    
    if (!userDB[categoryKey].subcategories[subcategoryKey]) {
      userDB[categoryKey].subcategories[subcategoryKey] = {
        name: subcategoryKey,
        tags: [],
        isDefault: false,
        isUserDefined: true
      };
    }
    
    if (!userDB[categoryKey].subcategories[subcategoryKey].tags) {
      userDB[categoryKey].subcategories[subcategoryKey].tags = [];
    }
    
    // 添加标签
    const tags = userDB[categoryKey].subcategories[subcategoryKey].tags;
    const existingIndex = tags.findIndex(t => t.en === tag.en);
    
    if (existingIndex >= 0) {
      // 更新现有标签
      tags[existingIndex] = { ...tags[existingIndex], ...tag };
    } else {
      // 添加新标签
      tags.push({
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...tag,
        frequency: tag.frequency || 1
      });
    }
    
    this.saveUserDatabase(userDB);
  }

  /**
   * 从分类中移除标签
   */
  removeTagFromCategory(categoryKey, subcategoryKey, tagId) {
    const userDB = { ...this.userDatabase };
    
    if (userDB[categoryKey] && 
        userDB[categoryKey].subcategories && 
        userDB[categoryKey].subcategories[subcategoryKey] &&
        userDB[categoryKey].subcategories[subcategoryKey].tags) {
      
      const tags = userDB[categoryKey].subcategories[subcategoryKey].tags;
      const filteredTags = tags.filter(tag => tag.id !== tagId);
      userDB[categoryKey].subcategories[subcategoryKey].tags = filteredTags;
      
      this.saveUserDatabase(userDB);
    }
  }

  /**
   * 重置用户数据库
   */
  resetUserDatabase() {
    localStorage.removeItem('userTagDatabase');
    this.userDatabase = {};
  }

  /**
   * 导出用户数据库
   */
  exportUserDatabase() {
    return {
      version: this.data.version,
      exportDate: new Date().toISOString(),
      userData: this.userDatabase
    };
  }

  /**
   * 导入用户数据库
   */
  importUserDatabase(importData) {
    try {
      if (importData.userData) {
        this.saveUserDatabase(importData.userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('导入用户数据库失败:', error);
      return false;
    }
  }

  /**
   * 获取数据库统计信息
   */
  getStatistics() {
    const db = this.getDatabase();
    let totalCategories = 0;
    let totalSubcategories = 0;
    let totalTags = 0;
    let userCategories = 0;
    let userTags = 0;

    Object.values(db).forEach(category => {
      totalCategories++;
      if (category.isUserDefined) {
        userCategories++;
      }
      
      if (category.subcategories) {
        Object.values(category.subcategories).forEach(subcategory => {
          totalSubcategories++;
          if (subcategory.tags) {
            totalTags += subcategory.tags.length;
            if (category.isUserDefined) {
              userTags += subcategory.tags.length;
            }
          }
        });
      }
    });

    return {
      totalCategories,
      totalSubcategories,
      totalTags,
      userCategories,
      userTags,
      defaultCategories: totalCategories - userCategories,
      defaultTags: totalTags - userTags
    };
  }

  /**
   * 获取收藏的标签列表
   */
  getFavorites() {
    try {
      const stored = localStorage.getItem('favorites');
      if (stored) {
        const favorites = JSON.parse(stored);
        return Array.isArray(favorites) ? favorites : [];
      }
      return [];
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      return [];
    }
  }

  /**
   * 保存收藏的标签列表
   */
  saveFavorites(favorites) {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('保存收藏列表失败:', error);
      return false;
    }
  }

  /**
   * 添加标签到收藏
   */
  addToFavorites(tag) {
    const favorites = this.getFavorites();
    const tagText = typeof tag === 'string' ? tag : tag.en;
    
    // 检查是否已存在
    if (!favorites.some(fav => fav.en === tagText)) {
      const tagObj = {
        en: tagText,
        cn: typeof tag === 'object' ? tag.cn : this.findChineseTranslation(tagText),
        frequency: 50,
        id: `fav-${Date.now()}`
      };
      favorites.push(tagObj);
      this.saveFavorites(favorites);
    }
    return favorites;
  }

  /**
   * 从收藏中移除标签
   */
  removeFromFavorites(tag) {
    const favorites = this.getFavorites();
    const tagText = typeof tag === 'string' ? tag : tag.en;
    const filteredFavorites = favorites.filter(fav => fav.en !== tagText);
    this.saveFavorites(filteredFavorites);
    return filteredFavorites;
  }
}

// 创建单例实例
export const tagDatabaseService = new TagDatabaseService();

// 导出便捷函数
export const getTagDatabase = () => tagDatabaseService.getDatabase();
export const getDefaultTagDatabase = () => tagDatabaseService.getDefaultDatabase();
export const getTranslations = () => tagDatabaseService.getTranslations();
export const findChineseTranslation = (text) => tagDatabaseService.findChineseTranslation(text);
export const findEnglishTranslation = (text) => tagDatabaseService.findEnglishTranslation(text);
export const searchTags = (query) => tagDatabaseService.searchTags(query);
export const getPopularTags = (limit) => tagDatabaseService.getPopularTags(limit);
export const getFavorites = () => tagDatabaseService.getFavorites();
export const saveFavorites = (favorites) => tagDatabaseService.saveFavorites(favorites);
export const addToFavorites = (tag) => tagDatabaseService.addToFavorites(tag);
export const removeFromFavorites = (tag) => tagDatabaseService.removeFromFavorites(tag);

// 默认导出服务实例
export default tagDatabaseService; 