/**
 * 分层标签库数据
 */

// 标签数据库
export const TAG_DATABASE = {
  // 收藏分类
  favorites: {
    name: '收藏',
    icon: '❤️',
    color: 'bg-red-100 text-red-700',
    subcategories: {
      personal: {
        name: '个人收藏',
        tags: [] // 这里会动态填充用户收藏的标签
      },
      popular: {
        name: '热门标签',
        tags: [
          { en: 'masterpiece', cn: '杰作', frequency: 95 },
          { en: 'best quality', cn: '最佳质量', frequency: 92 },
          { en: 'ultra detailed', cn: '超详细', frequency: 88 },
          { en: 'beautiful girl', cn: '美丽女孩', frequency: 90 },
          { en: 'anime style', cn: '动漫风格', frequency: 89 }
        ]
      }
    }
  },

  // 人物分类
  character: {
    name: '人物',
    icon: '👤',
    color: 'bg-blue-100 text-blue-700',
    subcategories: {
      identity: {
        name: '身份职业',
        tags: [
          { en: 'actor', cn: '演员', frequency: 75 },
          { en: 'teacher', cn: '教师', frequency: 68 },
          { en: 'hacker', cn: '黑客', frequency: 72 },
          { en: 'scientist', cn: '科学家', frequency: 65 },
          { en: 'artist', cn: '艺术家', frequency: 78 },
          { en: 'doctor', cn: '医生', frequency: 70 },
          { en: 'nurse', cn: '护士', frequency: 73 },
          { en: 'police', cn: '警察', frequency: 69 },
          { en: 'student', cn: '学生', frequency: 85 },
          { en: 'businessman', cn: '商人', frequency: 66 },
          { en: 'chef', cn: '厨师', frequency: 62 },
          { en: 'musician', cn: '音乐家', frequency: 74 },
          { en: 'photographer', cn: '摄影师', frequency: 67 },
          { en: 'writer', cn: '作家', frequency: 71 },
          { en: 'soldier', cn: '士兵', frequency: 76 }
        ]
      },
      age: {
        name: '年龄阶段',
        tags: [
          { en: 'child', cn: '儿童', frequency: 82 },
          { en: 'teenager', cn: '青少年', frequency: 79 },
          { en: 'young adult', cn: '青年', frequency: 88 },
          { en: 'adult', cn: '成年人', frequency: 85 },
          { en: 'middle aged', cn: '中年', frequency: 72 },
          { en: 'elderly', cn: '老年', frequency: 68 },
          { en: 'toddler', cn: '幼儿', frequency: 65 },
          { en: 'teen girl', cn: '少女', frequency: 83 },
          { en: 'young woman', cn: '年轻女性', frequency: 89 },
          { en: 'mature woman', cn: '成熟女性', frequency: 78 }
        ]
      },
      gender: {
        name: '性别特征',
        tags: [
          { en: 'beautiful girl', cn: '美丽女孩', frequency: 90 },
          { en: 'handsome boy', cn: '英俊男孩', frequency: 82 },
          { en: 'cute girl', cn: '可爱女孩', frequency: 87 },
          { en: 'pretty woman', cn: '漂亮女性', frequency: 84 },
          { en: 'strong man', cn: '强壮男性', frequency: 78 },
          { en: 'elegant lady', cn: '优雅女士', frequency: 75 },
          { en: 'gentle man', cn: '绅士', frequency: 73 },
          { en: 'charming girl', cn: '迷人女孩', frequency: 81 },
          { en: 'masculine', cn: '阳刚', frequency: 70 },
          { en: 'feminine', cn: '柔美', frequency: 76 }
        ]
      },
      bodytype: {
        name: '体型特征',
        tags: [
          { en: 'slim', cn: '苗条', frequency: 86 },
          { en: 'curvy', cn: '曲线美', frequency: 79 },
          { en: 'athletic', cn: '运动型', frequency: 82 },
          { en: 'petite', cn: '娇小', frequency: 77 },
          { en: 'tall', cn: '高挑', frequency: 74 },
          { en: 'muscular', cn: '肌肉发达', frequency: 71 },
          { en: 'voluptuous', cn: '丰满', frequency: 68 },
          { en: 'lean', cn: '精瘦', frequency: 72 },
          { en: 'fit', cn: '健美', frequency: 80 },
          { en: 'busty', cn: '丰胸', frequency: 65 }
        ]
      }
    }
  },

  // 服饰分类
  clothing: {
    name: '服饰',
    icon: '👗',
    color: 'bg-purple-100 text-purple-700',
    subcategories: {
      style: {
        name: '服装风格',
        tags: [
          { en: 'casual wear', cn: '休闲装', frequency: 84 },
          { en: 'formal wear', cn: '正装', frequency: 78 },
          { en: 'school uniform', cn: '校服', frequency: 89 },
          { en: 'business suit', cn: '商务套装', frequency: 72 },
          { en: 'evening dress', cn: '晚礼服', frequency: 75 },
          { en: 'kimono', cn: '和服', frequency: 82 },
          { en: 'gothic lolita', cn: '哥特萝莉', frequency: 76 },
          { en: 'maid outfit', cn: '女仆装', frequency: 88 },
          { en: 'nurse outfit', cn: '护士服', frequency: 73 },
          { en: 'military uniform', cn: '军装', frequency: 69 }
        ]
      },
      tops: {
        name: '上装',
        tags: [
          { en: 'blouse', cn: '衬衫', frequency: 81 },
          { en: 't-shirt', cn: 'T恤', frequency: 85 },
          { en: 'sweater', cn: '毛衣', frequency: 78 },
          { en: 'jacket', cn: '夹克', frequency: 76 },
          { en: 'hoodie', cn: '连帽衫', frequency: 82 },
          { en: 'tank top', cn: '背心', frequency: 74 },
          { en: 'cardigan', cn: '开衫', frequency: 70 },
          { en: 'crop top', cn: '短上衣', frequency: 77 },
          { en: 'blazer', cn: '西装外套', frequency: 68 },
          { en: 'vest', cn: '马甲', frequency: 65 }
        ]
      },
      bottoms: {
        name: '下装',
        tags: [
          { en: 'skirt', cn: '裙子', frequency: 88 },
          { en: 'pants', cn: '裤子', frequency: 82 },
          { en: 'shorts', cn: '短裤', frequency: 79 },
          { en: 'jeans', cn: '牛仔裤', frequency: 84 },
          { en: 'mini skirt', cn: '迷你裙', frequency: 86 },
          { en: 'long skirt', cn: '长裙', frequency: 75 },
          { en: 'pleated skirt', cn: '百褶裙', frequency: 83 },
          { en: 'leggings', cn: '紧身裤', frequency: 77 },
          { en: 'tights', cn: '连裤袜', frequency: 81 },
          { en: 'stockings', cn: '长筒袜', frequency: 85 }
        ]
      },
      accessories: {
        name: '配饰',
        tags: [
          { en: 'glasses', cn: '眼镜', frequency: 87 },
          { en: 'hat', cn: '帽子', frequency: 83 },
          { en: 'earrings', cn: '耳环', frequency: 78 },
          { en: 'necklace', cn: '项链', frequency: 76 },
          { en: 'bracelet', cn: '手镯', frequency: 72 },
          { en: 'ring', cn: '戒指', frequency: 74 },
          { en: 'bow', cn: '蝴蝶结', frequency: 85 },
          { en: 'ribbon', cn: '丝带', frequency: 82 },
          { en: 'hair ornament', cn: '发饰', frequency: 88 },
          { en: 'bag', cn: '包包', frequency: 80 }
        ]
      }
    }
  },

  // 表情动作分类
  expression: {
    name: '表情动作',
    icon: '😊',
    color: 'bg-yellow-100 text-yellow-700',
    subcategories: {
      facial: {
        name: '面部表情',
        tags: [
          { en: 'smile', cn: '微笑', frequency: 92 },
          { en: 'happy', cn: '开心', frequency: 89 },
          { en: 'sad', cn: '悲伤', frequency: 76 },
          { en: 'angry', cn: '愤怒', frequency: 72 },
          { en: 'surprised', cn: '惊讶', frequency: 78 },
          { en: 'confused', cn: '困惑', frequency: 68 },
          { en: 'shy', cn: '害羞', frequency: 84 },
          { en: 'crying', cn: '哭泣', frequency: 73 },
          { en: 'laughing', cn: '大笑', frequency: 81 },
          { en: 'serious', cn: '严肃', frequency: 75 }
        ]
      },
      pose: {
        name: '姿势动作',
        tags: [
          { en: 'standing', cn: '站立', frequency: 88 },
          { en: 'sitting', cn: '坐着', frequency: 85 },
          { en: 'lying', cn: '躺着', frequency: 79 },
          { en: 'walking', cn: '行走', frequency: 82 },
          { en: 'running', cn: '奔跑', frequency: 76 },
          { en: 'dancing', cn: '跳舞', frequency: 78 },
          { en: 'jumping', cn: '跳跃', frequency: 74 },
          { en: 'waving', cn: '挥手', frequency: 77 },
          { en: 'pointing', cn: '指向', frequency: 71 },
          { en: 'kneeling', cn: '跪着', frequency: 68 }
        ]
      },
      gesture: {
        name: '手势动作',
        tags: [
          { en: 'peace sign', cn: '比V', frequency: 86 },
          { en: 'thumbs up', cn: '点赞', frequency: 83 },
          { en: 'heart hands', cn: '比心', frequency: 88 },
          { en: 'clapping', cn: '鼓掌', frequency: 75 },
          { en: 'praying', cn: '祈祷', frequency: 72 },
          { en: 'winking', cn: '眨眼', frequency: 80 },
          { en: 'saluting', cn: '敬礼', frequency: 69 },
          { en: 'covering face', cn: '捂脸', frequency: 78 },
          { en: 'finger to lips', cn: '嘘声', frequency: 74 },
          { en: 'crossed arms', cn: '交叉双臂', frequency: 71 }
        ]
      }
    }
  },

  // 场景环境分类
  scene: {
    name: '场景环境',
    icon: '🌍',
    color: 'bg-green-100 text-green-700',
    subcategories: {
      indoor: {
        name: '室内场景',
        tags: [
          { en: 'bedroom', cn: '卧室', frequency: 84 },
          { en: 'classroom', cn: '教室', frequency: 87 },
          { en: 'office', cn: '办公室', frequency: 78 },
          { en: 'kitchen', cn: '厨房', frequency: 75 },
          { en: 'bathroom', cn: '浴室', frequency: 72 },
          { en: 'library', cn: '图书馆', frequency: 79 },
          { en: 'cafe', cn: '咖啡厅', frequency: 82 },
          { en: 'restaurant', cn: '餐厅', frequency: 76 },
          { en: 'hospital', cn: '医院', frequency: 68 },
          { en: 'school', cn: '学校', frequency: 85 }
        ]
      },
      outdoor: {
        name: '户外场景',
        tags: [
          { en: 'park', cn: '公园', frequency: 83 },
          { en: 'beach', cn: '海滩', frequency: 86 },
          { en: 'forest', cn: '森林', frequency: 81 },
          { en: 'mountain', cn: '山脉', frequency: 78 },
          { en: 'city street', cn: '城市街道', frequency: 82 },
          { en: 'garden', cn: '花园', frequency: 79 },
          { en: 'field', cn: '田野', frequency: 74 },
          { en: 'desert', cn: '沙漠', frequency: 69 },
          { en: 'rooftop', cn: '屋顶', frequency: 76 },
          { en: 'bridge', cn: '桥梁', frequency: 72 }
        ]
      },
      fantasy: {
        name: '幻想场景',
        tags: [
          { en: 'castle', cn: '城堡', frequency: 82 },
          { en: 'magic forest', cn: '魔法森林', frequency: 79 },
          { en: 'underwater', cn: '水下', frequency: 76 },
          { en: 'space', cn: '太空', frequency: 73 },
          { en: 'floating island', cn: '浮空岛', frequency: 71 },
          { en: 'crystal cave', cn: '水晶洞穴', frequency: 68 },
          { en: 'cloud city', cn: '云中城市', frequency: 70 },
          { en: 'dragon lair', cn: '龙穴', frequency: 65 },
          { en: 'fairy tale', cn: '童话世界', frequency: 77 },
          { en: 'cyberpunk', cn: '赛博朋克', frequency: 80 }
        ]
      }
    }
  },

  // 风格效果分类
  style: {
    name: '风格效果',
    icon: '🎨',
    color: 'bg-pink-100 text-pink-700',
    subcategories: {
      art_style: {
        name: '艺术风格',
        tags: [
          { en: 'anime style', cn: '动漫风格', frequency: 89 },
          { en: 'realistic', cn: '写实风格', frequency: 86 },
          { en: 'oil painting', cn: '油画', frequency: 78 },
          { en: 'watercolor', cn: '水彩', frequency: 75 },
          { en: 'digital art', cn: '数字艺术', frequency: 83 },
          { en: 'sketch', cn: '素描', frequency: 72 },
          { en: 'cartoon', cn: '卡通', frequency: 80 },
          { en: 'manga', cn: '漫画', frequency: 84 },
          { en: 'pixel art', cn: '像素艺术', frequency: 69 },
          { en: 'vector art', cn: '矢量艺术', frequency: 66 }
        ]
      },
      lighting: {
        name: '光照效果',
        tags: [
          { en: 'soft lighting', cn: '柔和光照', frequency: 87 },
          { en: 'dramatic lighting', cn: '戏剧性光照', frequency: 82 },
          { en: 'golden hour', cn: '黄金时刻', frequency: 85 },
          { en: 'neon lights', cn: '霓虹灯', frequency: 78 },
          { en: 'candlelight', cn: '烛光', frequency: 74 },
          { en: 'sunlight', cn: '阳光', frequency: 83 },
          { en: 'moonlight', cn: '月光', frequency: 76 },
          { en: 'backlight', cn: '背光', frequency: 79 },
          { en: 'rim lighting', cn: '轮廓光', frequency: 71 },
          { en: 'ambient lighting', cn: '环境光', frequency: 73 }
        ]
      },
      quality: {
        name: '质量标签',
        tags: [
          { en: 'masterpiece', cn: '杰作', frequency: 95 },
          { en: 'best quality', cn: '最佳质量', frequency: 92 },
          { en: 'ultra detailed', cn: '超详细', frequency: 88 },
          { en: 'high resolution', cn: '高分辨率', frequency: 85 },
          { en: '8k wallpaper', cn: '8K壁纸', frequency: 82 },
          { en: 'professional', cn: '专业级', frequency: 79 },
          { en: 'award winning', cn: '获奖作品', frequency: 76 },
          { en: 'trending', cn: '热门', frequency: 83 },
          { en: 'perfect', cn: '完美', frequency: 81 },
          { en: 'stunning', cn: '惊艳', frequency: 78 }
        ]
      }
    }
  }
};

// 获取所有标签的扁平化列表
export function getAllTags() {
  const allTags = [];
  
  Object.values(TAG_DATABASE).forEach(category => {
    Object.values(category.subcategories).forEach(subcategory => {
      allTags.push(...subcategory.tags);
    });
  });
  
  return allTags;
}

// 根据关键词搜索标签
export function searchTags(keyword) {
  const allTags = getAllTags();
  const lowerKeyword = keyword.toLowerCase();
  
  return allTags.filter(tag => 
    tag.en.toLowerCase().includes(lowerKeyword) ||
    tag.cn.includes(keyword)
  ).sort((a, b) => b.frequency - a.frequency);
}

// 获取热门标签（使用频率最高的）
export function getPopularTags(limit = 20) {
  const allTags = getAllTags();
  return allTags
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
}

// 获取指定分类的标签
export function getTagsByCategory(categoryKey, subcategoryKey = null) {
  const category = TAG_DATABASE[categoryKey];
  if (!category) return [];
  
  if (subcategoryKey) {
    const subcategory = category.subcategories[subcategoryKey];
    return subcategory ? subcategory.tags : [];
  }
  
  // 返回该分类下所有子分类的标签
  const allTags = [];
  Object.values(category.subcategories).forEach(subcategory => {
    allTags.push(...subcategory.tags);
  });
  
  return allTags;
}

export default TAG_DATABASE; 