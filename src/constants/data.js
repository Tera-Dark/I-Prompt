// 快速标签 - 中英文对照
export const QUICK_TAGS = [
  { 
    category: 'Quality 质量', 
    tags: [
      { en: 'masterpiece', cn: '杰作' },
      { en: 'best quality', cn: '最佳质量' },
      { en: 'ultra detailed', cn: '超详细' },
      { en: '8k wallpaper', cn: '8K壁纸' },
      { en: 'high resolution', cn: '高分辨率' },
      { en: 'professional', cn: '专业级' }
    ] 
  },
  { 
    category: 'Style 风格', 
    tags: [
      { en: 'anime style', cn: '动漫风格' },
      { en: 'realistic', cn: '写实风格' },
      { en: 'oil painting', cn: '油画' },
      { en: 'watercolor', cn: '水彩' },
      { en: 'sketch', cn: '素描' },
      { en: 'digital art', cn: '数字艺术' }
    ] 
  },
  { 
    category: 'Lighting 光照', 
    tags: [
      { en: 'cinematic lighting', cn: '电影级光照' },
      { en: 'soft lighting', cn: '柔和光照' },
      { en: 'dramatic lighting', cn: '戏剧性光照' },
      { en: 'golden hour', cn: '黄金时刻' },
      { en: 'studio lighting', cn: '摄影棚光照' },
      { en: 'natural lighting', cn: '自然光照' }
    ] 
  },
  { 
    category: 'Composition 构图', 
    tags: [
      { en: 'perfect composition', cn: '完美构图' },
      { en: 'rule of thirds', cn: '三分法则' },
      { en: 'dynamic angle', cn: '动态角度' },
      { en: 'close-up', cn: '特写镜头' },
      { en: 'wide shot', cn: '远景镜头' },
      { en: 'bird eye view', cn: '鸟瞰视角' }
    ] 
  },
  { 
    category: 'Effects 效果', 
    tags: [
      { en: 'depth of field', cn: '景深效果' },
      { en: 'bokeh', cn: '虚化效果' },
      { en: 'sharp focus', cn: '锐利对焦' },
      { en: 'motion blur', cn: '运动模糊' },
      { en: 'lens flare', cn: '镜头光晕' },
      { en: 'chromatic aberration', cn: '色差效果' }
    ] 
  }
];

// 绘画风格
export const PAINTING_STYLES = [
  { name: 'Photorealistic 写实', prompt: 'photorealistic, ultra realistic, high quality' },
  { name: 'Anime 动漫', prompt: 'anime style, manga style, cel shading' },
  { name: 'Oil Painting 油画', prompt: 'oil painting, classical art, painterly' },
  { name: 'Watercolor 水彩', prompt: 'watercolor, soft colors, flowing' },
  { name: 'Sketch 素描', prompt: 'pencil sketch, charcoal drawing, monochrome' }
];

// 提示词分类
export const PROMPT_CATEGORIES = [
  { name: 'Character 人物', count: 1250, color: 'bg-blue-100 text-blue-800', description: '人物角色、表情、动作 | Characters, expressions, actions' },
  { name: 'Scene 场景', count: 892, color: 'bg-green-100 text-green-800', description: '背景环境、建筑、风景 | Background, architecture, landscapes' },
  { name: 'Style 风格', count: 456, color: 'bg-purple-100 text-purple-800', description: '艺术风格、画风流派 | Art styles, artistic movements' },
  { name: 'Effects 效果', count: 334, color: 'bg-orange-100 text-orange-800', description: '光影、质感、特效 | Lighting, textures, visual effects' },
  { name: 'Composition 构图', count: 198, color: 'bg-pink-100 text-pink-800', description: '镜头角度、画面布局 | Camera angles, layout composition' }
];

// 热门提示词
export const HOT_PROMPTS = [
  { en: 'masterpiece, best quality, ultra detailed', cn: '杰作，最佳质量，超详细', usage: '89%', category: 'Quality', popularity: 95 },
  { en: 'beautiful girl, cute, kawaii', cn: '美丽女孩，可爱，萌', usage: '76%', category: 'Character', popularity: 88 },
  { en: 'cinematic lighting, dramatic shadows', cn: '电影级光照，戏剧性阴影', usage: '65%', category: 'Effects', popularity: 82 },
  { en: 'fantasy landscape, magical forest', cn: '奇幻风景，魔法森林', usage: '58%', category: 'Scene', popularity: 75 },
  { en: 'anime style, cel shading', cn: '动漫风格，赛璐珞着色', usage: '52%', category: 'Style', popularity: 70 },
  { en: 'photorealistic, hyperrealistic', cn: '照片级写实，超写实', usage: '48%', category: 'Style', popularity: 68 },
  { en: 'dynamic pose, action shot', cn: '动态姿势，动作镜头', usage: '45%', category: 'Composition', popularity: 65 },
  { en: 'soft lighting, golden hour', cn: '柔和光照，黄金时刻', usage: '42%', category: 'Effects', popularity: 62 },
  { en: 'detailed background, rich colors', cn: '详细背景，丰富色彩', usage: '39%', category: 'Quality', popularity: 60 },
  { en: 'portrait, close-up, shallow depth of field', cn: '肖像，特写，浅景深', usage: '36%', category: 'Composition', popularity: 58 },
  { en: 'medieval castle, gothic architecture', cn: '中世纪城堡，哥特式建筑', usage: '34%', category: 'Scene', popularity: 56 },
  { en: 'cyberpunk, neon lights, futuristic', cn: '赛博朋克，霓虹灯，未来感', usage: '32%', category: 'Style', popularity: 54 },
  { en: 'natural lighting, outdoor scene', cn: '自然光照，户外场景', usage: '30%', category: 'Effects', popularity: 52 },
  { en: 'character design, concept art', cn: '角色设计，概念艺术', usage: '28%', category: 'Character', popularity: 50 },
  { en: 'abstract art, geometric shapes', cn: '抽象艺术，几何形状', usage: '26%', category: 'Style', popularity: 48 }
];

// 辅助工具数据
export const ASSISTANT_TOOLS = [
  { 
    id: 'weight',
    name: '权重调节', 
    description: '为提示词添加权重标记，控制生成效果的强弱',
    icon: 'Scale',
    color: 'text-orange-600'
  },
  { 
    id: 'inspiration',
    name: '灵感生成', 
    description: '基于主题生成创作灵感和想法',
    icon: 'Lightbulb',
    color: 'text-yellow-600'
  },
  { 
    id: 'translate',
    name: '翻译工具', 
    description: '中英文提示词互译功能',
    icon: 'Languages',
    color: 'text-blue-600'
  },
  { 
    id: 'tags',
    name: '标签补全', 
    description: '智能提示标签建议和补全',
    icon: 'Tag',
    color: 'text-green-600'
  }
];

// 教程数据
export const TUTORIALS = [
  { title: 'AI绘画入门基础', level: '新手', time: '30分钟', progress: 0, description: '了解AI绘画基本概念和工具' },
  { title: '提示词编写技巧', level: '初级', time: '45分钟', progress: 60, description: '掌握高效提示词写作方法' },
  { title: '高级构图方法', level: '进阶', time: '60分钟', progress: 100, description: '学习专业构图技巧' },
  { title: '风格控制技术', level: '进阶', time: '40分钟', progress: 0, description: '控制图片风格的高级技巧' },
  { title: '参数调优指南', level: '高级', time: '90分钟', progress: 30, description: '深入理解生成参数' },
  { title: '工作流程优化', level: '高级', time: '75分钟', progress: 0, description: '提高创作效率的工作流' }
]; 