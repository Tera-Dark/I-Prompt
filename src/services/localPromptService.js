import { PAINTING_STYLES } from '../constants/data';

/**
 * 本地提示词增强服务 - AI服务的降级备份
 */
class LocalPromptService {
  constructor() {
    this.qualityTags = [
      "masterpiece, best quality, ultra detailed, extremely detailed",
      "8k wallpaper, highly detailed, professional quality",
      "absurdres, incredible detail, finely detailed",
      "amazing quality, ultra high res, detailed background"
    ];

    this.lightingEffects = [
      "cinematic lighting, dramatic lighting",
      "soft lighting, natural lighting",
      "studio lighting, professional lighting",
      "golden hour lighting, warm lighting"
    ];

    this.compositionTags = [
      "perfect composition, rule of thirds",
      "dynamic angle, interesting composition",
      "centered composition, balanced layout",
      "artistic composition, visual harmony"
    ];
  }

  /**
   * 检测关键词并添加相关标签
   */
  detectKeywords(input) {
    const enhancements = [];

    // 人物相关关键词
    if (/女孩|男孩|人物|角色|美女|帅哥|少女|boy|girl|character|人/i.test(input)) {
      enhancements.push("beautiful detailed eyes, detailed face, perfect anatomy");
    }
    
    // 场景相关关键词
    if (/风景|森林|海边|城市|建筑|landscape|forest|ocean|city|building|场景/i.test(input)) {
      enhancements.push("wide shot, scenic view, atmospheric perspective");
    }

    // 动物相关
    if (/猫|狗|鸟|动物|cat|dog|bird|animal/i.test(input)) {
      enhancements.push("detailed fur, expressive eyes, natural pose");
    }

    // 食物相关
    if (/食物|美食|料理|食品|food|dish|cuisine/i.test(input)) {
      enhancements.push("appetizing, detailed texture, professional food photography");
    }

    return enhancements;
  }

  /**
   * 生成本地增强提示词
   */
  generatePrompt(input, style = '') {
    try {
      let enhancedPrompt = input;
      
      // 添加风格
      if (style) {
        const styleData = PAINTING_STYLES.find(s => s.name === style);
        if (styleData) {
          enhancedPrompt += ", " + styleData.prompt;
        }
      }
      
      // 检测关键词并添加相关标签
      const keywordEnhancements = this.detectKeywords(input);
      if (keywordEnhancements.length > 0) {
        enhancedPrompt += ", " + keywordEnhancements.join(", ");
      }
      
      // 随机添加质量、光照和构图标签
      const randomQuality = this.qualityTags[Math.floor(Math.random() * this.qualityTags.length)];
      const randomLighting = this.lightingEffects[Math.floor(Math.random() * this.lightingEffects.length)];
      const randomComposition = this.compositionTags[Math.floor(Math.random() * this.compositionTags.length)];
      
      const finalPrompt = `${enhancedPrompt}, ${randomQuality}, ${randomLighting}, ${randomComposition}`;
      
      return { content: finalPrompt, source: 'local' };
      
    } catch (error) {
      console.error('本地生成失败:', error);
      throw new Error('本地生成服务异常');
    }
  }

  /**
   * 翻译常见中文词汇
   */
  translateCommonWords(text) {
    const translations = {
      '女孩': 'girl',
      '男孩': 'boy', 
      '美女': 'beautiful woman',
      '帅哥': 'handsome man',
      '猫': 'cat',
      '狗': 'dog',
      '花': 'flower',
      '树': 'tree',
      '房子': 'house',
      '汽车': 'car',
      '天空': 'sky',
      '海洋': 'ocean',
      '森林': 'forest',
      '城市': 'city',
      '夜晚': 'night',
      '白天': 'day',
      '阳光': 'sunlight',
      '月亮': 'moon',
      '星星': 'stars'
    };

    let translatedText = text;
    Object.entries(translations).forEach(([chinese, english]) => {
      const regex = new RegExp(chinese, 'g');
      translatedText = translatedText.replace(regex, english);
    });

    return translatedText;
  }
}

export default new LocalPromptService(); 