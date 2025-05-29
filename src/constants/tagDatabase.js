/**
 * 分层标签库数据 - 增强版
 * 支持基础默认库和可扩展用户库
 */

// 基础默认标签库（只读，不可修改）
export const DEFAULT_TAG_DATABASE = {
  // 收藏分类
  favorites: {
    name: '收藏',
    icon: '❤️',
    color: 'bg-red-100 text-red-700',
    isDefault: true,
    subcategories: {
      popular: {
        name: '热门标签',
        isDefault: true,
        tags: [
          { id: 'pop_001', en: 'masterpiece', cn: '杰作', frequency: 95 },
          { id: 'pop_002', en: 'best quality', cn: '最佳质量', frequency: 92 },
          { id: 'pop_003', en: 'ultra detailed', cn: '超详细', frequency: 88 },
          { id: 'pop_004', en: 'beautiful girl', cn: '美丽女孩', frequency: 90 },
          { id: 'pop_005', en: 'anime style', cn: '动漫风格', frequency: 89 },
          { id: 'pop_006', en: 'highly detailed', cn: '高度详细', frequency: 87 },
          { id: 'pop_007', en: 'perfect anatomy', cn: '完美解剖', frequency: 84 },
          { id: 'pop_008', en: 'sharp focus', cn: '锐利焦点', frequency: 86 },
          { id: 'pop_009', en: 'professional', cn: '专业级', frequency: 83 },
          { id: 'pop_010', en: 'photorealistic', cn: '照片级写实', frequency: 81 }
        ]
      },
      personal: {
        name: '个人收藏',
        isDefault: false,
        tags: []
      }
    }
  },

  // 人物分类
  character: {
    name: '人物',
    icon: '👤',
    color: 'bg-blue-100 text-blue-700',
    isDefault: true,
    subcategories: {
      gender: {
        name: '性别特征',
        isDefault: true,
        tags: [
          { id: 'char_001', en: 'beautiful girl', cn: '美丽女孩', frequency: 90 },
          { id: 'char_002', en: 'handsome boy', cn: '英俊男孩', frequency: 82 },
          { id: 'char_003', en: 'cute girl', cn: '可爱女孩', frequency: 87 },
          { id: 'char_004', en: 'pretty woman', cn: '漂亮女性', frequency: 84 },
          { id: 'char_005', en: 'strong man', cn: '强壮男性', frequency: 78 },
          { id: 'char_006', en: 'elegant lady', cn: '优雅女士', frequency: 75 },
          { id: 'char_007', en: 'gentle man', cn: '绅士', frequency: 73 },
          { id: 'char_008', en: 'charming girl', cn: '迷人女孩', frequency: 81 }
        ]
      },
      age: {
        name: '年龄阶段',
        isDefault: true,
        tags: [
          { id: 'age_001', en: 'child', cn: '儿童', frequency: 82 },
          { id: 'age_002', en: 'teenager', cn: '青少年', frequency: 79 },
          { id: 'age_003', en: 'young adult', cn: '青年', frequency: 88 },
          { id: 'age_004', en: 'adult', cn: '成年人', frequency: 85 },
          { id: 'age_005', en: 'middle aged', cn: '中年', frequency: 72 },
          { id: 'age_006', en: 'elderly', cn: '老年', frequency: 68 },
          { id: 'age_007', en: 'teen girl', cn: '少女', frequency: 83 },
          { id: 'age_008', en: 'young woman', cn: '年轻女性', frequency: 89 }
        ]
      }
    }
  },

  // 服饰分类
  clothing: {
    name: '服饰',
    icon: '👗',
    color: 'bg-purple-100 text-purple-700',
    isDefault: true,
    subcategories: {
      style: {
        name: '服装风格',
        isDefault: true,
        tags: [
          { id: 'cloth_001', en: 'school uniform', cn: '校服', frequency: 89 },
          { id: 'cloth_002', en: 'casual wear', cn: '休闲装', frequency: 84 },
          { id: 'cloth_003', en: 'formal wear', cn: '正装', frequency: 78 },
          { id: 'cloth_004', en: 'kimono', cn: '和服', frequency: 82 },
          { id: 'cloth_005', en: 'maid outfit', cn: '女仆装', frequency: 88 },
          { id: 'cloth_006', en: 'evening dress', cn: '晚礼服', frequency: 75 },
          { id: 'cloth_007', en: 'business suit', cn: '商务套装', frequency: 72 },
          { id: 'cloth_008', en: 'gothic lolita', cn: '哥特萝莉', frequency: 76 }
        ]
      },
      accessories: {
        name: '配饰',
        isDefault: true,
        tags: [
          { id: 'acc_001', en: 'glasses', cn: '眼镜', frequency: 87 },
          { id: 'acc_002', en: 'hat', cn: '帽子', frequency: 83 },
          { id: 'acc_003', en: 'earrings', cn: '耳环', frequency: 78 },
          { id: 'acc_004', en: 'necklace', cn: '项链', frequency: 76 },
          { id: 'acc_005', en: 'bow', cn: '蝴蝶结', frequency: 85 },
          { id: 'acc_006', en: 'hair ornament', cn: '发饰', frequency: 88 },
          { id: 'acc_007', en: 'ribbon', cn: '丝带', frequency: 82 },
          { id: 'acc_008', en: 'bag', cn: '包包', frequency: 80 }
        ]
      }
    }
  },

  // 表情动作分类
  expression: {
    name: '表情动作',
    icon: '😊',
    color: 'bg-yellow-100 text-yellow-700',
    isDefault: true,
    subcategories: {
      facial: {
        name: '面部表情',
        isDefault: true,
        tags: [
          { id: 'exp_001', en: 'smile', cn: '微笑', frequency: 92 },
          { id: 'exp_002', en: 'happy', cn: '开心', frequency: 89 },
          { id: 'exp_003', en: 'sad', cn: '悲伤', frequency: 76 },
          { id: 'exp_004', en: 'surprised', cn: '惊讶', frequency: 78 },
          { id: 'exp_005', en: 'shy', cn: '害羞', frequency: 84 },
          { id: 'exp_006', en: 'crying', cn: '哭泣', frequency: 73 },
          { id: 'exp_007', en: 'laughing', cn: '大笑', frequency: 81 },
          { id: 'exp_008', en: 'serious', cn: '严肃', frequency: 75 }
        ]
      },
      pose: {
        name: '姿势动作',
        isDefault: true,
        tags: [
          { id: 'pose_001', en: 'standing', cn: '站立', frequency: 88 },
          { id: 'pose_002', en: 'sitting', cn: '坐着', frequency: 85 },
          { id: 'pose_003', en: 'lying', cn: '躺着', frequency: 79 },
          { id: 'pose_004', en: 'walking', cn: '行走', frequency: 82 },
          { id: 'pose_005', en: 'running', cn: '奔跑', frequency: 74 },
          { id: 'pose_006', en: 'dancing', cn: '舞蹈', frequency: 77 },
          { id: 'pose_007', en: 'looking at viewer', cn: '看向观众', frequency: 91 },
          { id: 'pose_008', en: 'hands on hips', cn: '双手叉腰', frequency: 69 }
        ]
      }
    }
  },

  // 场景环境分类
  scene: {
    name: '场景环境',
    icon: '🌍',
    color: 'bg-green-100 text-green-700',
    isDefault: true,
    subcategories: {
      indoor: {
        name: '室内场景',
        isDefault: true,
        tags: [
          { id: 'scene_001', en: 'classroom', cn: '教室', frequency: 85 },
          { id: 'scene_002', en: 'bedroom', cn: '卧室', frequency: 88 },
          { id: 'scene_003', en: 'library', cn: '图书馆', frequency: 79 },
          { id: 'scene_004', en: 'kitchen', cn: '厨房', frequency: 75 },
          { id: 'scene_005', en: 'office', cn: '办公室', frequency: 72 },
          { id: 'scene_006', en: 'cafe', cn: '咖啡厅', frequency: 82 },
          { id: 'scene_007', en: 'restaurant', cn: '餐厅', frequency: 76 },
          { id: 'scene_008', en: 'shopping mall', cn: '商场', frequency: 71 }
        ]
      },
      outdoor: {
        name: '户外场景',
        isDefault: true,
        tags: [
          { id: 'outdoor_001', en: 'park', cn: '公园', frequency: 84 },
          { id: 'outdoor_002', en: 'beach', cn: '海滩', frequency: 87 },
          { id: 'outdoor_003', en: 'forest', cn: '森林', frequency: 81 },
          { id: 'outdoor_004', en: 'city street', cn: '城市街道', frequency: 78 },
          { id: 'outdoor_005', en: 'garden', cn: '花园', frequency: 83 },
          { id: 'outdoor_006', en: 'mountain', cn: '山', frequency: 75 },
          { id: 'outdoor_007', en: 'sky', cn: '天空', frequency: 89 },
          { id: 'outdoor_008', en: 'sunset', cn: '日落', frequency: 86 }
        ]
      }
    }
  },

  // 风格效果分类
  style: {
    name: '风格效果',
    icon: '🎨',
    color: 'bg-pink-100 text-pink-700',
    isDefault: true,
    subcategories: {
      art_style: {
        name: '艺术风格',
        isDefault: true,
        tags: [
          { id: 'style_001', en: 'anime', cn: '动漫', frequency: 94 },
          { id: 'style_002', en: 'realistic', cn: '写实', frequency: 87 },
          { id: 'style_003', en: 'oil painting', cn: '油画', frequency: 79 },
          { id: 'style_004', en: 'watercolor', cn: '水彩', frequency: 76 },
          { id: 'style_005', en: 'digital art', cn: '数字艺术', frequency: 85 },
          { id: 'style_006', en: 'sketch', cn: '素描', frequency: 73 },
          { id: 'style_007', en: 'cartoon', cn: '卡通', frequency: 81 },
          { id: 'style_008', en: 'fantasy', cn: '奇幻', frequency: 84 }
        ]
      },
      lighting: {
        name: '光照效果',
        isDefault: true,
        tags: [
          { id: 'light_001', en: 'soft lighting', cn: '柔和光照', frequency: 86 },
          { id: 'light_002', en: 'dramatic lighting', cn: '戏剧性光照', frequency: 82 },
          { id: 'light_003', en: 'natural lighting', cn: '自然光照', frequency: 84 },
          { id: 'light_004', en: 'warm lighting', cn: '暖色光照', frequency: 78 },
          { id: 'light_005', en: 'cool lighting', cn: '冷色光照', frequency: 75 },
          { id: 'light_006', en: 'backlight', cn: '背光', frequency: 79 },
          { id: 'light_007', en: 'golden hour', cn: '黄金时刻', frequency: 88 },
          { id: 'light_008', en: 'studio lighting', cn: '摄影棚光照', frequency: 74 }
        ]
      }
    }
  }
};

// 获取用户自定义标签库（从localStorage）
const getUserTagDatabase = () => {
  try {
    const stored = localStorage.getItem('userTagDatabase');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('获取用户标签库失败:', error);
    return {};
  }
};

// 保存用户自定义标签库到localStorage
const saveUserTagDatabase = (database) => {
  try {
    localStorage.setItem('userTagDatabase', JSON.stringify(database));
  } catch (error) {
    console.error('保存用户标签库失败:', error);
  }
};

// 合并默认库和用户库
export const TAG_DATABASE = {
  ...DEFAULT_TAG_DATABASE,
  ...getUserTagDatabase()
};

/**
 * 标签库管理器
 */
export class TagDatabaseManager {
  static addCategory(categoryKey, categoryData) {
    const userDB = getUserTagDatabase();
    userDB[categoryKey] = {
      ...categoryData,
      isDefault: false,
      subcategories: categoryData.subcategories || {}
    };
    saveUserTagDatabase(userDB);
    
    // 更新全局TAG_DATABASE
    Object.assign(TAG_DATABASE, userDB);
    return userDB[categoryKey];
  }

  static removeCategory(categoryKey) {
    const userDB = getUserTagDatabase();
    if (userDB[categoryKey]) {
      delete userDB[categoryKey];
      saveUserTagDatabase(userDB);
      
      // 更新全局TAG_DATABASE
      if (TAG_DATABASE[categoryKey] && !DEFAULT_TAG_DATABASE[categoryKey]) {
        delete TAG_DATABASE[categoryKey];
      }
      return true;
    }
    return false;
  }

  static addSubcategory(categoryKey, subcategoryKey, subcategoryData) {
    const userDB = getUserTagDatabase();
    
    // 如果分类不存在，创建分类
    if (!userDB[categoryKey]) {
      userDB[categoryKey] = {
        name: categoryKey,
        icon: '🏷️',
        color: 'bg-gray-100 text-gray-700',
        isDefault: false,
        subcategories: {}
      };
    }
    
    userDB[categoryKey].subcategories[subcategoryKey] = {
      ...subcategoryData,
      isDefault: false,
      tags: subcategoryData.tags || []
    };
    
    saveUserTagDatabase(userDB);
    
    // 更新全局TAG_DATABASE
    Object.assign(TAG_DATABASE, userDB);
    return userDB[categoryKey].subcategories[subcategoryKey];
  }

  static removeSubcategory(categoryKey, subcategoryKey) {
    const userDB = getUserTagDatabase();
    if (userDB[categoryKey] && userDB[categoryKey].subcategories[subcategoryKey]) {
      delete userDB[categoryKey].subcategories[subcategoryKey];
      
      // 如果分类下没有子分类了，删除整个分类
      if (Object.keys(userDB[categoryKey].subcategories).length === 0) {
        delete userDB[categoryKey];
      }
      
      saveUserTagDatabase(userDB);
      
      // 更新全局TAG_DATABASE
      if (TAG_DATABASE[categoryKey] && TAG_DATABASE[categoryKey].subcategories[subcategoryKey]) {
        delete TAG_DATABASE[categoryKey].subcategories[subcategoryKey];
        if (Object.keys(TAG_DATABASE[categoryKey].subcategories).length === 0 && !DEFAULT_TAG_DATABASE[categoryKey]) {
          delete TAG_DATABASE[categoryKey];
        }
      }
      return true;
    }
    return false;
  }

  static addTag(categoryKey, subcategoryKey, tagData) {
    const userDB = getUserTagDatabase();
    
    // 确保路径存在
    if (!userDB[categoryKey]) {
      userDB[categoryKey] = {
        name: categoryKey,
        icon: '🏷️',
        color: 'bg-gray-100 text-gray-700',
        isDefault: false,
        subcategories: {}
      };
    }
    
    if (!userDB[categoryKey].subcategories[subcategoryKey]) {
      userDB[categoryKey].subcategories[subcategoryKey] = {
        name: subcategoryKey,
        isDefault: false,
        tags: []
      };
    }
    
    const newTag = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      en: tagData.en,
      cn: tagData.cn,
      frequency: tagData.frequency || 50
    };
    
    userDB[categoryKey].subcategories[subcategoryKey].tags.push(newTag);
    saveUserTagDatabase(userDB);
    
    // 更新全局TAG_DATABASE
    Object.assign(TAG_DATABASE, userDB);
    return newTag;
  }

  static updateTag(categoryKey, subcategoryKey, tagId, newTagData) {
    const userDB = getUserTagDatabase();
    
    if (userDB[categoryKey] && 
        userDB[categoryKey].subcategories[subcategoryKey] && 
        userDB[categoryKey].subcategories[subcategoryKey].tags) {
      
      const tagIndex = userDB[categoryKey].subcategories[subcategoryKey].tags.findIndex(tag => tag.id === tagId);
      if (tagIndex !== -1) {
        userDB[categoryKey].subcategories[subcategoryKey].tags[tagIndex] = {
          ...userDB[categoryKey].subcategories[subcategoryKey].tags[tagIndex],
          ...newTagData
        };
        
        saveUserTagDatabase(userDB);
        
        // 更新全局TAG_DATABASE
        Object.assign(TAG_DATABASE, userDB);
        return userDB[categoryKey].subcategories[subcategoryKey].tags[tagIndex];
      }
    }
    return null;
  }

  static removeTag(categoryKey, subcategoryKey, tagId) {
    const userDB = getUserTagDatabase();
    
    if (userDB[categoryKey] && 
        userDB[categoryKey].subcategories[subcategoryKey] && 
        userDB[categoryKey].subcategories[subcategoryKey].tags) {
      
      const tagIndex = userDB[categoryKey].subcategories[subcategoryKey].tags.findIndex(tag => tag.id === tagId);
      if (tagIndex !== -1) {
        userDB[categoryKey].subcategories[subcategoryKey].tags.splice(tagIndex, 1);
        saveUserTagDatabase(userDB);
        
        // 更新全局TAG_DATABASE
        Object.assign(TAG_DATABASE, userDB);
        return true;
      }
    }
    return false;
  }

  static exportUserDatabase() {
    return getUserTagDatabase();
  }

  static importUserDatabase(databaseData) {
    try {
      // 验证数据格式
      if (typeof databaseData !== 'object' || databaseData === null) {
        throw new Error('无效的数据格式');
      }
      
      // 标记所有导入的数据为用户数据
      const processedData = {};
      Object.keys(databaseData).forEach(categoryKey => {
        const category = databaseData[categoryKey];
        processedData[categoryKey] = {
          ...category,
          isDefault: false,
          subcategories: {}
        };
        
        if (category.subcategories) {
          Object.keys(category.subcategories).forEach(subKey => {
            const subcategory = category.subcategories[subKey];
            processedData[categoryKey].subcategories[subKey] = {
              ...subcategory,
              isDefault: false,
              tags: subcategory.tags || []
            };
          });
        }
      });
      
      saveUserTagDatabase(processedData);
      
      // 更新全局TAG_DATABASE
      Object.assign(TAG_DATABASE, processedData);
      return true;
    } catch (error) {
      console.error('导入用户标签库失败:', error);
      return false;
    }
  }

  static resetUserDatabase() {
    localStorage.removeItem('userTagDatabase');
    
    // 重置全局TAG_DATABASE为只包含默认库
    Object.keys(TAG_DATABASE).forEach(key => {
      if (!DEFAULT_TAG_DATABASE[key]) {
        delete TAG_DATABASE[key];
      }
    });
    
    Object.assign(TAG_DATABASE, DEFAULT_TAG_DATABASE);
  }
}

// 搜索标签函数
export const searchTags = (query, database = TAG_DATABASE) => {
  if (!query || query.trim().length === 0) return [];
  
  const searchQuery = query.toLowerCase().trim();
  const results = [];
  
  Object.values(database).forEach(category => {
    if (category.subcategories) {
      Object.values(category.subcategories).forEach(subcategory => {
        if (subcategory.tags) {
          subcategory.tags.forEach(tag => {
            const matchesEn = tag.en.toLowerCase().includes(searchQuery);
            const matchesCn = tag.cn.toLowerCase().includes(searchQuery);
            
            if (matchesEn || matchesCn) {
              results.push({
                ...tag,
                score: matchesEn ? (tag.en.toLowerCase() === searchQuery ? 100 : 80) : 60
              });
            }
          });
        }
      });
    }
  });
  
  // 按分数和频率排序
  return results
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return (b.frequency || 0) - (a.frequency || 0);
    })
    .slice(0, 50); // 限制结果数量
};

// 获取热门标签
export const getPopularTags = (limit = 20, database = TAG_DATABASE) => {
  const allTags = [];
  
  Object.values(database).forEach(category => {
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
};

// 按分类获取标签（保持兼容）
export function getTagsByCategory(categoryKey, subcategoryKey = null) {
  const category = TAG_DATABASE[categoryKey];
  if (!category) return [];
  
  if (subcategoryKey) {
    return category.subcategories[subcategoryKey]?.tags || [];
  }
  
  const allTags = [];
  Object.values(category.subcategories || {}).forEach(subcategory => {
    allTags.push(...(subcategory.tags || []));
  });
  
  return allTags;
}

// 获取所有标签（保持兼容）
export function getAllTags() {
  const allTags = [];
  
  Object.values(TAG_DATABASE).forEach(category => {
    Object.values(category.subcategories || {}).forEach(subcategory => {
      allTags.push(...(subcategory.tags || []));
    });
  });
  
  return allTags;
} 