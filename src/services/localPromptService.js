import { PAINTING_STYLES } from '../constants/data';
import { findChineseTranslation, findEnglishTranslation } from './tagDatabaseService';

/**
 * 本地提示词增强服务 - AI服务的降级备份
 */
class LocalPromptService {
  constructor() {
    this.basePrompts = {
      portrait: '肖像, 人像摄影',
      landscape: '风景, 自然景观',
      anime: '动漫风格, 二次元',
      realistic: '写实风格, 逼真',
      fantasy: '奇幻, 魔幻世界',
      scifi: '科幻, 未来主义',
      abstract: '抽象艺术, 概念性',
      minimalist: '极简主义, 简约风格'
    };

    this.qualityTags = [
      'masterpiece', 'best quality', 'ultra detailed',
      'highly detailed', 'sharp focus', 'professional',
      'cinematic lighting', 'perfect composition'
    ];

    this.negativeTags = [
      'low quality', 'blurry', 'bad anatomy',
      'extra fingers', 'bad hands', 'deformed',
      'ugly', 'duplicate', 'mutated'
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
    // 使用标签数据库进行翻译
    let translatedText = text;
    
    try {
      // 将文本按词汇分割，尝试翻译每个词汇
      const words = text.split(/[\s,，、。！？；：""''（）【】]+/);
      
      words.forEach(word => {
        if (word.trim()) {
          // 使用标签数据库查找对应的英文翻译
          const englishTranslation = findEnglishTranslation(word.trim());
          if (englishTranslation) {
            const regex = new RegExp(word, 'g');
            translatedText = translatedText.replace(regex, englishTranslation);
          }
        }
      });
      
      return translatedText;
    } catch (error) {
      console.error('词汇翻译失败:', error);
      return text; // 翻译失败时返回原文
    }
  }
}

export default new LocalPromptService(); 