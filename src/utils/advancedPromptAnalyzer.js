/**
 * 高级提示词分析器
 * 融合NovelAI Spell项目和Live Context技术的智能提示词解析功能
 */

export class AdvancedPromptAnalyzer {
  
  constructor() {
    // 初始化分析配置
    this.config = {
      // 提示词权重阈值
      weightThresholds: {
        high: 1.2,
        medium: 1.0,
        low: 0.8
      },
      // 语义类别
      semanticCategories: {
        character: ['girl', 'boy', 'woman', 'man', 'person', 'character'],
        style: ['anime', 'realistic', 'cartoon', 'painting', 'digital art'],
        quality: ['masterpiece', 'best quality', 'high resolution', 'detailed'],
        composition: ['portrait', 'full body', 'close-up', 'wide shot'],
        lighting: ['soft lighting', 'dramatic lighting', 'natural light'],
        color: ['colorful', 'monochrome', 'vibrant', 'pastel'],
        emotion: ['happy', 'sad', 'angry', 'peaceful', 'excited'],
        environment: ['indoor', 'outdoor', 'nature', 'city', 'fantasy']
      },
      // NovelAI特定标签权重映射
      novelaiWeights: {
        '{{': 1.05,
        '((': 1.21,
        '[': 0.9,
        '[[': 0.81
      }
    };
  }

  /**
   * 分析提示词的完整结构
   * @param {string} positivePrompt - 正向提示词
   * @param {string} negativePrompt - 负向提示词
   * @param {Object} parameters - 生成参数
   * @returns {Object} 详细分析结果
   */
  analyzePrompts(positivePrompt, negativePrompt, parameters = {}) {
    const result = {
      positive: this.analyzePromptText(positivePrompt, 'positive'),
      negative: this.analyzePromptText(negativePrompt, 'negative'),
      relationships: this.analyzeRelationships(positivePrompt, negativePrompt),
      parameters: this.analyzeParameters(parameters),
      quality: this.assessPromptQuality(positivePrompt, negativePrompt),
      suggestions: this.generateSuggestions(positivePrompt, negativePrompt, parameters),
      metadata: {
        analyzedAt: new Date().toISOString(),
        analyzerVersion: '2.0',
        source: 'advanced-prompt-analyzer'
      }
    };

    return result;
  }

  /**
   * 分析单个提示词文本
   * @param {string} promptText - 提示词文本
   * @param {string} type - 类型 (positive/negative)
   * @returns {Object} 分析结果
   */
  analyzePromptText(promptText, type = 'positive') {
    if (!promptText || typeof promptText !== 'string') {
      return this.getEmptyAnalysis();
    }

    // 解析提示词标签
    const tags = this.parsePromptTags(promptText);
    
    // 分析权重和强调
    const weightAnalysis = this.analyzeWeights(tags);
    
    // 语义分类
    const semanticGroups = this.categorizeSemantics(tags);
    
    // 复杂度分析
    const complexity = this.analyzeComplexity(tags);
    
    // 风格检测
    const styleAnalysis = this.detectStyle(tags);

    return {
      originalText: promptText,
      type,
      tags: {
        parsed: tags,
        count: tags.length,
        weighted: weightAnalysis.weightedTags,
        emphasized: weightAnalysis.emphasizedTags
      },
      semantics: semanticGroups,
      weights: weightAnalysis,
      complexity,
      style: styleAnalysis,
      structure: this.analyzeStructure(promptText),
      effectiveness: this.calculateEffectiveness(tags, type)
    };
  }

  /**
   * 解析提示词标签 - 支持多种权重格式
   * @param {string} text - 提示词文本
   * @returns {Array} 解析后的标签数组
   */
  parsePromptTags(text) {
    const tags = [];
    
    // 分割基本标签（逗号分隔）
    const basicTags = text.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    for (const tag of basicTags) {
      const parsedTag = this.parseIndividualTag(tag);
      if (parsedTag) {
        tags.push(parsedTag);
      }
    }
    
    return tags;
  }

  /**
   * 解析单个标签的权重和格式
   * @param {string} tagText - 单个标签文本
   * @returns {Object} 解析结果
   */
  parseIndividualTag(tagText) {
    let cleanText = tagText.trim();
    let weight = 1.0;
    let emphasis = 'normal';
    let brackets = [];

    // NovelAI风格权重解析
    const patterns = [
      { regex: /^\{\{(.+?)\}\}$/, weight: 1.05, emphasis: 'light', type: 'double_curly' },
      { regex: /^\{(.+?)\}$/, weight: 1.02, emphasis: 'very_light', type: 'single_curly' },
      { regex: /^\(\((.+?)\)\)$/, weight: 1.21, emphasis: 'strong', type: 'double_round' },
      { regex: /^\((.+?)\)$/, weight: 1.1, emphasis: 'medium', type: 'single_round' },
      { regex: /^\[\[(.+?)\]\]$/, weight: 0.81, emphasis: 'weak', type: 'double_square' },
      { regex: /^\[(.+?)\]$/, weight: 0.9, emphasis: 'light_negative', type: 'single_square' },
      { regex: /^(.+?):(\d*\.?\d+)$/, weight: 'custom', emphasis: 'custom', type: 'colon_weight' }
    ];

    // 检查权重模式
    for (const pattern of patterns) {
      const match = cleanText.match(pattern.regex);
      if (match) {
        cleanText = match[1];
        
        if (pattern.weight === 'custom') {
          weight = parseFloat(match[2]);
          emphasis = weight > 1.0 ? 'custom_positive' : weight < 1.0 ? 'custom_negative' : 'normal';
        } else {
          weight = pattern.weight;
          emphasis = pattern.emphasis;
        }
        
        brackets.push(pattern.type);
        break;
      }
    }

    // 检测特殊标记
    const specialMarkers = this.detectSpecialMarkers(cleanText);

    return {
      original: tagText,
      text: cleanText,
      weight,
      emphasis,
      brackets,
      special: specialMarkers,
      category: this.categorizeTag(cleanText),
      importance: this.calculateTagImportance(cleanText, weight)
    };
  }

  /**
   * 分析权重分布
   * @param {Array} tags - 标签数组
   * @returns {Object} 权重分析结果
   */
  analyzeWeights(tags) {
    const weightDistribution = {
      emphasized: tags.filter(tag => tag.weight > 1.0),
      normal: tags.filter(tag => tag.weight === 1.0),
      deemphasized: tags.filter(tag => tag.weight < 1.0)
    };

    const avgWeight = tags.reduce((sum, tag) => sum + tag.weight, 0) / tags.length;
    const maxWeight = Math.max(...tags.map(tag => tag.weight));
    const minWeight = Math.min(...tags.map(tag => tag.weight));

    return {
      distribution: weightDistribution,
      statistics: {
        average: avgWeight,
        maximum: maxWeight,
        minimum: minWeight,
        range: maxWeight - minWeight
      },
      weightedTags: tags.filter(tag => tag.weight !== 1.0),
      emphasizedTags: tags.filter(tag => tag.weight > 1.0).sort((a, b) => b.weight - a.weight)
    };
  }

  /**
   * 语义分类
   * @param {Array} tags - 标签数组
   * @returns {Object} 分类结果
   */
  categorizeSemantics(tags) {
    const categories = {};
    
    // 初始化分类
    Object.keys(this.config.semanticCategories).forEach(category => {
      categories[category] = [];
    });
    categories.other = [];

    // 分类标签
    tags.forEach(tag => {
      let categorized = false;
      
      for (const [category, keywords] of Object.entries(this.config.semanticCategories)) {
        if (keywords.some(keyword => tag.text.toLowerCase().includes(keyword.toLowerCase()))) {
          categories[category].push(tag);
          categorized = true;
          break;
        }
      }
      
      if (!categorized) {
        categories.other.push(tag);
      }
    });

    // 统计每个分类的权重和重要性
    const categoryStats = {};
    Object.entries(categories).forEach(([category, categoryTags]) => {
      if (categoryTags.length > 0) {
        const avgWeight = categoryTags.reduce((sum, tag) => sum + tag.weight, 0) / categoryTags.length;
        const maxImportance = Math.max(...categoryTags.map(tag => tag.importance));
        
        categoryStats[category] = {
          count: categoryTags.length,
          averageWeight: avgWeight,
          maxImportance,
          dominance: categoryTags.length / tags.length
        };
      }
    });

    return {
      categories,
      statistics: categoryStats,
      dominantCategory: this.findDominantCategory(categoryStats)
    };
  }

  /**
   * 分析提示词复杂度
   * @param {Array} tags - 标签数组
   * @returns {Object} 复杂度分析
   */
  analyzeComplexity(tags) {
    const uniqueWeights = new Set(tags.map(tag => tag.weight));
    const hasCustomWeights = tags.some(tag => tag.brackets.includes('colon_weight'));
    const hasMultipleBrackets = tags.some(tag => tag.brackets.length > 1);
    const hasSpecialMarkers = tags.some(tag => tag.special.length > 0);

    const complexityScore = this.calculateComplexityScore(tags);

    return {
      score: complexityScore,
      level: this.getComplexityLevel(complexityScore),
      factors: {
        tagCount: tags.length,
        uniqueWeights: uniqueWeights.size,
        hasCustomWeights,
        hasMultipleBrackets,
        hasSpecialMarkers,
        averageTagLength: tags.reduce((sum, tag) => sum + tag.text.length, 0) / tags.length
      },
      assessment: this.assessComplexity(complexityScore)
    };
  }

  /**
   * 风格检测
   * @param {Array} tags - 标签数组
   * @returns {Object} 风格分析
   */
  detectStyle(tags) {
    const styleIndicators = {
      anime: ['anime', 'manga', 'kawaii', 'chibi', 'moe'],
      realistic: ['realistic', 'photorealistic', 'photography', 'photo'],
      artistic: ['painting', 'artwork', 'illustration', 'drawing'],
      fantasy: ['fantasy', 'magical', 'mystical', 'ethereal'],
      cyberpunk: ['cyberpunk', 'neon', 'futuristic', 'sci-fi'],
      vintage: ['vintage', 'retro', 'classic', 'old-fashioned']
    };

    const detectedStyles = {};
    let primaryStyle = 'mixed';
    let maxScore = 0;

    Object.entries(styleIndicators).forEach(([style, indicators]) => {
      const matchingTags = tags.filter(tag => 
        indicators.some(indicator => 
          tag.text.toLowerCase().includes(indicator.toLowerCase())
        )
      );
      
      if (matchingTags.length > 0) {
        const score = matchingTags.reduce((sum, tag) => sum + tag.weight * tag.importance, 0);
        detectedStyles[style] = {
          score,
          matchingTags,
          confidence: Math.min(score / tags.length, 1.0)
        };
        
        if (score > maxScore) {
          maxScore = score;
          primaryStyle = style;
        }
      }
    });

    return {
      primary: primaryStyle,
      detected: detectedStyles,
      confidence: maxScore > 0 ? detectedStyles[primaryStyle]?.confidence : 0,
      isStyleConsistent: Object.keys(detectedStyles).length <= 2
    };
  }

  /**
   * 分析提示词之间的关系
   * @param {string} positive - 正向提示词
   * @param {string} negative - 负向提示词
   * @returns {Object} 关系分析
   */
  analyzeRelationships(positive, negative) {
    const positiveTags = this.parsePromptTags(positive || '');
    const negativeTags = this.parsePromptTags(negative || '');

    // 检查冲突
    const conflicts = this.findConflicts(positiveTags, negativeTags);
    
    // 检查互补性
    const complements = this.findComplements(positiveTags, negativeTags);
    
    // 平衡性分析
    const balance = this.analyzeBalance(positiveTags, negativeTags);

    return {
      conflicts,
      complements,
      balance,
      coherence: this.calculateCoherence(positiveTags, negativeTags),
      effectiveness: this.calculateRelationshipEffectiveness(conflicts, complements, balance)
    };
  }

  /**
   * 生成智能建议
   * @param {string} positive - 正向提示词
   * @param {string} negative - 负向提示词
   * @param {Object} parameters - 生成参数
   * @returns {Array} 建议数组
   */
  generateSuggestions(positive, negative, parameters) {
    const suggestions = [];
    const positiveTags = this.parsePromptTags(positive || '');
    const negativeTags = this.parsePromptTags(negative || '');

    // 权重优化建议
    suggestions.push(...this.generateWeightSuggestions(positiveTags));
    
    // 结构优化建议
    suggestions.push(...this.generateStructureSuggestions(positiveTags, negativeTags));
    
    // 参数匹配建议
    suggestions.push(...this.generateParameterSuggestions(positiveTags, parameters));
    
    // 风格一致性建议
    suggestions.push(...this.generateStyleSuggestions(positiveTags));

    return suggestions.map(suggestion => ({
      ...suggestion,
      priority: this.calculateSuggestionPriority(suggestion),
      confidence: this.calculateSuggestionConfidence(suggestion)
    })).sort((a, b) => b.priority - a.priority);
  }

  /**
   * 生成权重优化建议
   * @param {Array} tags - 标签数组
   * @returns {Array} 建议数组
   */
  generateWeightSuggestions(tags) {
    const suggestions = [];
    
    // 检查过度强调
    const overEmphasized = tags.filter(tag => tag.weight > 1.3);
    if (overEmphasized.length > 0) {
      suggestions.push({
        type: 'weight_optimization',
        category: 'warning',
        title: '过度强调检测',
        description: `发现${overEmphasized.length}个过度强调的标签，可能导致生成效果不自然`,
        affectedTags: overEmphasized.map(tag => tag.original),
        recommendation: '建议将权重降低到1.2以下',
        impact: 'medium'
      });
    }

    // 检查权重不平衡
    const weights = tags.map(tag => tag.weight);
    const weightRange = Math.max(...weights) - Math.min(...weights);
    if (weightRange > 0.5) {
      suggestions.push({
        type: 'weight_optimization',
        category: 'improvement',
        title: '权重平衡优化',
        description: `权重范围过大(${weightRange.toFixed(2)})，建议调整以获得更平衡的效果`,
        recommendation: '考虑缩小权重差异，保持在0.3范围内',
        impact: 'low'
      });
    }

    return suggestions;
  }

  /**
   * 计算标签重要性
   * @param {string} text - 标签文本
   * @param {number} weight - 标签权重
   * @returns {number} 重要性分数
   */
  calculateTagImportance(text, weight) {
    let importance = weight;
    
    // 质量词汇加分
    const qualityKeywords = ['masterpiece', 'best quality', 'high resolution', 'detailed'];
    if (qualityKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      importance += 0.2;
    }
    
    // 长度因子
    const lengthFactor = Math.min(text.length / 20, 1.0);
    importance += lengthFactor * 0.1;
    
    return Math.min(importance, 2.0);
  }

  /**
   * 检测特殊标记
   * @param {string} text - 文本
   * @returns {Array} 特殊标记数组
   */
  detectSpecialMarkers(text) {
    const markers = [];
    
    // 艺术家标记
    if (text.includes('by ') || text.includes('artist:')) {
      markers.push('artist');
    }
    
    // 版权标记
    if (text.includes('©') || text.includes('copyright')) {
      markers.push('copyright');
    }
    
    // 质量标记
    const qualityMarkers = ['masterpiece', 'best quality', 'high quality'];
    if (qualityMarkers.some(marker => text.toLowerCase().includes(marker))) {
      markers.push('quality');
    }
    
    return markers;
  }

  /**
   * 分类单个标签
   * @param {string} text - 标签文本
   * @returns {string} 分类结果
   */
  categorizeTag(text) {
    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(this.config.semanticCategories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    
    return 'other';
  }

  /**
   * 获取空分析结果
   * @returns {Object} 空结果
   */
  getEmptyAnalysis() {
    return {
      originalText: '',
      type: 'unknown',
      tags: { parsed: [], count: 0, weighted: [], emphasized: [] },
      semantics: { categories: {}, statistics: {}, dominantCategory: null },
      weights: { distribution: {}, statistics: {}, weightedTags: [], emphasizedTags: [] },
      complexity: { score: 0, level: 'none', factors: {}, assessment: '' },
      style: { primary: 'none', detected: {}, confidence: 0, isStyleConsistent: true },
      structure: {},
      effectiveness: 0
    };
  }

  /**
   * 计算复杂度分数
   * @param {Array} tags - 标签数组
   * @returns {number} 复杂度分数
   */
  calculateComplexityScore(tags) {
    let score = 0;
    
    // 基础分数：标签数量
    score += Math.min(tags.length / 10, 1.0) * 0.3;
    
    // 权重复杂度
    const uniqueWeights = new Set(tags.map(tag => tag.weight));
    score += Math.min(uniqueWeights.size / 5, 1.0) * 0.2;
    
    // 语法复杂度
    const hasComplexSyntax = tags.some(tag => tag.brackets.length > 0);
    if (hasComplexSyntax) score += 0.2;
    
    // 特殊标记
    const hasSpecialMarkers = tags.some(tag => tag.special.length > 0);
    if (hasSpecialMarkers) score += 0.1;
    
    // 平均标签长度
    const avgLength = tags.reduce((sum, tag) => sum + tag.text.length, 0) / tags.length;
    score += Math.min(avgLength / 20, 1.0) * 0.2;
    
    return Math.min(score, 1.0);
  }

  /**
   * 获取复杂度等级
   * @param {number} score - 复杂度分数
   * @returns {string} 复杂度等级
   */
  getComplexityLevel(score) {
    if (score >= 0.8) return 'very_high';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    if (score >= 0.2) return 'low';
    return 'very_low';
  }

  /**
   * 评估复杂度
   * @param {number} score - 复杂度分数
   * @returns {string} 评估结果
   */
  assessComplexity(score) {
    const level = this.getComplexityLevel(score);
    const assessments = {
      'very_high': '非常复杂的提示词结构，建议适当简化',
      'high': '相对复杂的提示词，注意权重平衡',
      'medium': '中等复杂度，结构合理',
      'low': '简单的提示词结构，可考虑添加更多细节',
      'very_low': '非常简单的结构，建议增加描述性标签'
    };
    
    return assessments[level] || '无法评估';
  }

  /**
   * 计算提示词效果评分
   * @param {Array} tags - 标签数组
   * @param {string} type - 类型
   * @returns {number} 效果评分
   */
  calculateEffectiveness(tags, type) {
    if (tags.length === 0) return 0;
    
    let score = 0;
    
    // 基础分数：标签多样性
    const categories = new Set(tags.map(tag => tag.category));
    score += Math.min(categories.size / 8, 1.0) * 0.3;
    
    // 权重合理性
    const avgWeight = tags.reduce((sum, tag) => sum + tag.weight, 0) / tags.length;
    const weightBalance = 1 - Math.abs(avgWeight - 1.0);
    score += weightBalance * 0.2;
    
    // 质量标签存在
    const hasQuality = tags.some(tag => tag.special.includes('quality'));
    if (hasQuality) score += 0.2;
    
    // 长度适中性
    const textLength = tags.reduce((sum, tag) => sum + tag.text.length, 0);
    const lengthScore = Math.max(0, 1 - Math.abs(textLength - 100) / 200);
    score += lengthScore * 0.3;
    
    return Math.min(score, 1.0);
  }

  /**
   * 分析结构特征
   * @param {string} promptText - 提示词文本
   * @returns {Object} 结构分析
   */
  analyzeStructure(promptText) {
    return {
      length: promptText.length,
      wordCount: promptText.split(/\s+/).length,
      tagCount: promptText.split(',').length,
      hasWeights: /[\(\[\{]/.test(promptText),
      hasColonWeights: /:[\d\.]+/.test(promptText),
      hasArtistTags: /by\s+/.test(promptText),
      hasCopyrightTags: /©|\(.*\)/.test(promptText)
    };
  }

  /**
   * 分析生成参数
   * @param {Object} parameters - 生成参数
   * @returns {Object} 参数分析
   */
  analyzeParameters(parameters) {
    const analysis = {
      guidance: parameters.guidance || parameters.cfg_scale || 7,
      steps: parameters.steps || parameters.sampling_steps || 20,
      sampler: parameters.sampler || parameters.sampling_method || 'unknown',
      seed: parameters.seed || -1,
      size: parameters.size || `${parameters.width || 512}x${parameters.height || 512}`,
      model: parameters.model || 'unknown'
    };

    // 参数合理性检查
    analysis.assessment = {
      guidanceLevel: this.assessGuidanceLevel(analysis.guidance),
      stepsEfficiency: this.assessStepsEfficiency(analysis.steps),
      overallBalance: this.assessParameterBalance(analysis)
    };

    return analysis;
  }

  /**
   * 评估提示词质量
   * @param {string} positive - 正向提示词
   * @param {string} negative - 负向提示词
   * @returns {Object} 质量评估
   */
  assessPromptQuality(positive, negative) {
    const positiveTags = this.parsePromptTags(positive || '');
    const negativeTags = this.parsePromptTags(negative || '');

    const positiveScore = this.calculateEffectiveness(positiveTags, 'positive');
    const negativeScore = this.calculateEffectiveness(negativeTags, 'negative');
    
    const overallScore = (positiveScore * 0.7 + negativeScore * 0.3);
    
    return {
      overall: overallScore,
      positive: positiveScore,
      negative: negativeScore,
      level: this.getQualityLevel(overallScore),
      strengths: this.identifyStrengths(positiveTags, negativeTags),
      weaknesses: this.identifyWeaknesses(positiveTags, negativeTags)
    };
  }

  /**
   * 寻找主导分类
   * @param {Object} categoryStats - 分类统计
   * @returns {string} 主导分类
   */
  findDominantCategory(categoryStats) {
    let maxDominance = 0;
    let dominantCategory = null;

    Object.entries(categoryStats).forEach(([category, stats]) => {
      if (stats.dominance > maxDominance) {
        maxDominance = stats.dominance;
        dominantCategory = category;
      }
    });

    return dominantCategory;
  }

  /**
   * 查找冲突
   * @param {Array} positiveTags - 正向标签
   * @param {Array} negativeTags - 负向标签
   * @returns {Array} 冲突列表
   */
  findConflicts(positiveTags, negativeTags) {
    const conflicts = [];
    
    positiveTags.forEach(positiveTag => {
      negativeTags.forEach(negativeTag => {
        if (this.areConflicting(positiveTag.text, negativeTag.text)) {
          conflicts.push({
            positive: positiveTag,
            negative: negativeTag,
            severity: this.calculateConflictSeverity(positiveTag, negativeTag)
          });
        }
      });
    });

    return conflicts;
  }

  /**
   * 查找互补关系
   * @param {Array} positiveTags - 正向标签
   * @param {Array} negativeTags - 负向标签
   * @returns {Array} 互补关系列表
   */
  findComplements(positiveTags, negativeTags) {
    const complements = [];
    
    positiveTags.forEach(positiveTag => {
      negativeTags.forEach(negativeTag => {
        if (this.areComplementary(positiveTag.text, negativeTag.text)) {
          complements.push({
            positive: positiveTag,
            negative: negativeTag,
            strength: this.calculateComplementStrength(positiveTag, negativeTag)
          });
        }
      });
    });

    return complements;
  }

  /**
   * 分析平衡性
   * @param {Array} positiveTags - 正向标签
   * @param {Array} negativeTags - 负向标签
   * @returns {Object} 平衡性分析
   */
  analyzeBalance(positiveTags, negativeTags) {
    const positiveWeight = positiveTags.reduce((sum, tag) => sum + tag.weight, 0);
    const negativeWeight = negativeTags.reduce((sum, tag) => sum + tag.weight, 0);
    
    const ratio = positiveWeight / Math.max(negativeWeight, 0.1);
    
    return {
      positiveWeight,
      negativeWeight,
      ratio,
      assessment: this.assessBalance(ratio),
      isBalanced: ratio >= 2 && ratio <= 8
    };
  }

  /**
   * 计算一致性
   * @param {Array} positiveTags - 正向标签
   * @param {Array} negativeTags - 负向标签
   * @returns {number} 一致性分数
   */
  calculateCoherence(positiveTags, negativeTags) {
    // 检查风格一致性
    const positiveStyles = this.detectStyle(positiveTags);
    const negativeStyles = this.detectStyle(negativeTags);
    
    let coherenceScore = 0.5; // 基础分数
    
    // 风格一致性加分
    if (positiveStyles.isStyleConsistent) {
      coherenceScore += 0.2;
    }
    
    // 冲突惩罚
    const conflicts = this.findConflicts(positiveTags, negativeTags);
    coherenceScore -= conflicts.length * 0.1;
    
    return Math.max(0, Math.min(1, coherenceScore));
  }

  /**
   * 计算关系有效性
   * @param {Array} conflicts - 冲突列表
   * @param {Array} complements - 互补列表
   * @param {Object} balance - 平衡分析
   * @returns {number} 有效性分数
   */
  calculateRelationshipEffectiveness(conflicts, complements, balance) {
    let score = 0.5;
    
    // 互补性加分
    score += complements.length * 0.1;
    
    // 冲突惩罚
    score -= conflicts.length * 0.15;
    
    // 平衡性评分
    if (balance.isBalanced) {
      score += 0.2;
    }
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * 生成结构建议
   * @param {Array} positiveTags - 正向标签
   * @param {Array} negativeTags - 负向标签
   * @returns {Array} 建议列表
   */
  generateStructureSuggestions(positiveTags, negativeTags) {
    const suggestions = [];
    
    // 标签数量建议
    if (positiveTags.length < 3) {
      suggestions.push({
        type: 'structure',
        category: 'improvement',
        title: '增加提示词数量',
        description: '正向提示词较少，建议添加更多描述性标签',
        recommendation: '添加质量标签、风格描述或细节描述',
        impact: 'medium'
      });
    }
    
    if (positiveTags.length > 20) {
      suggestions.push({
        type: 'structure',
        category: 'warning',
        title: '提示词过多',
        description: '过多的提示词可能导致效果混乱',
        recommendation: '保留最重要的标签，移除冗余内容',
        impact: 'medium'
      });
    }

    return suggestions;
  }

  /**
   * 生成参数建议
   * @param {Array} tags - 标签数组
   * @param {Object} parameters - 参数
   * @returns {Array} 建议列表
   */
  generateParameterSuggestions(tags, parameters) {
    const suggestions = [];
    
    const guidance = parameters.guidance || parameters.cfg_scale || 7;
    const steps = parameters.steps || parameters.sampling_steps || 20;
    
    // 引导强度建议
    if (guidance > 15) {
      suggestions.push({
        type: 'parameters',
        category: 'warning',
        title: 'CFG Scale过高',
        description: '过高的引导强度可能导致过拟合',
        recommendation: '建议将CFG Scale降低到7-12之间',
        impact: 'high'
      });
    }
    
    // 步数建议
    if (steps < 10) {
      suggestions.push({
        type: 'parameters',
        category: 'improvement',
        title: '采样步数较低',
        description: '较低的步数可能影响图像质量',
        recommendation: '建议将步数设置为20-30',
        impact: 'medium'
      });
    }

    return suggestions;
  }

  /**
   * 生成风格建议
   * @param {Array} tags - 标签数组
   * @returns {Array} 建议列表
   */
  generateStyleSuggestions(tags) {
    const suggestions = [];
    const styleAnalysis = this.detectStyle(tags);
    
    if (!styleAnalysis.isStyleConsistent) {
      suggestions.push({
        type: 'style',
        category: 'warning',
        title: '风格不一致',
        description: '检测到多种冲突的艺术风格',
        recommendation: '选择一种主要风格，移除冲突的风格标签',
        impact: 'high'
      });
    }
    
    if (styleAnalysis.confidence < 0.3) {
      suggestions.push({
        type: 'style',
        category: 'improvement',
        title: '风格定义不明确',
        description: '缺乏明确的风格定义',
        recommendation: '添加明确的风格标签，如"anime"、"realistic"等',
        impact: 'medium'
      });
    }

    return suggestions;
  }

  /**
   * 计算建议优先级
   * @param {Object} suggestion - 建议对象
   * @returns {number} 优先级分数
   */
  calculateSuggestionPriority(suggestion) {
    const impactWeights = { high: 3, medium: 2, low: 1 };
    const categoryWeights = { warning: 2, improvement: 1.5, info: 1 };
    
    return impactWeights[suggestion.impact] * categoryWeights[suggestion.category];
  }

  /**
   * 计算建议可信度
   * @param {Object} suggestion - 建议对象
   * @returns {number} 可信度分数
   */
  calculateSuggestionConfidence(suggestion) {
    // 基于建议类型和影响程度计算可信度
    const baseConfidence = {
      weight_optimization: 0.9,
      structure: 0.8,
      parameters: 0.85,
      style: 0.75
    };
    
    return baseConfidence[suggestion.type] || 0.7;
  }

  // 辅助方法
  areConflicting(tag1, tag2) {
    const conflicts = [
      ['realistic', 'anime'],
      ['black hair', 'blonde hair'],
      ['indoor', 'outdoor'],
      ['day', 'night']
    ];
    
    return conflicts.some(([a, b]) => 
      (tag1.includes(a) && tag2.includes(b)) || 
      (tag1.includes(b) && tag2.includes(a))
    );
  }

  areComplementary(positiveTag, negativeTag) {
    const complements = [
      ['detailed', 'blurry'],
      ['high quality', 'low quality'],
      ['beautiful', 'ugly']
    ];
    
    return complements.some(([pos, neg]) => 
      positiveTag.includes(pos) && negativeTag.includes(neg)
    );
  }

  calculateConflictSeverity(tag1, tag2) {
    return (tag1.weight + tag2.weight) / 2;
  }

  calculateComplementStrength(tag1, tag2) {
    return Math.min(tag1.weight, tag2.weight);
  }

  assessBalance(ratio) {
    if (ratio < 2) return '负向权重过强';
    if (ratio > 8) return '正向权重过强';
    return '权重平衡合理';
  }

  assessGuidanceLevel(guidance) {
    if (guidance < 5) return '引导强度较低';
    if (guidance > 15) return '引导强度过高';
    return '引导强度适中';
  }

  assessStepsEfficiency(steps) {
    if (steps < 10) return '步数过少';
    if (steps > 50) return '步数过多';
    return '步数合理';
  }

  assessParameterBalance(params) {
    // 综合评估参数平衡
    return '参数配置合理';
  }

  getQualityLevel(score) {
    if (score >= 0.8) return 'excellent';
    if (score >= 0.6) return 'good';
    if (score >= 0.4) return 'average';
    if (score >= 0.2) return 'poor';
    return 'very_poor';
  }

  identifyStrengths(positiveTags, negativeTags) {
    const strengths = [];
    
    // 检查质量标签
    const hasQuality = positiveTags.some(tag => tag.special.includes('quality'));
    if (hasQuality) strengths.push('包含质量标签');
    
    // 检查风格明确性
    const styleAnalysis = this.detectStyle(positiveTags);
    if (styleAnalysis.confidence > 0.7) strengths.push('风格定义明确');
    
    return strengths;
  }

  identifyWeaknesses(positiveTags, negativeTags) {
    const weaknesses = [];
    
    // 检查标签不足
    if (positiveTags.length < 3) weaknesses.push('正向标签过少');
    if (negativeTags.length === 0) weaknesses.push('缺少负向标签');
    
    return weaknesses;
  }

  /**
   * 分析从图像提取的提示词数据
   * @param {Object} extractedData - 提取的数据
   * @returns {Object} 分析结果
   */
  analyzeExtractedPrompts(extractedData) {
    const { positive = '', negative = '', parameters = {} } = extractedData;
    
    console.log('开始分析提取的提示词...');
    console.log('正向提示词长度:', positive.length);
    console.log('负向提示词长度:', negative.length);
    
    try {
      const analysis = this.analyzePrompts(positive, negative, parameters);
      
      // 添加提取特定的信息
      analysis.extractedPrompts = {
        positive: positive,
        negative: negative,
        _sources: {
          bestSource: 'PNG_Chunks', // 假设最佳来源
          positive: [
            { source: 'PNG_Chunks', length: positive.length, confidence: 'high' }
          ],
          negative: [
            { source: 'PNG_Chunks', length: negative.length, confidence: 'high' }
          ]
        }
      };
      
      analysis.analyzed = true;
      
      return analysis;
    } catch (error) {
      console.error('提示词分析失败:', error);
      return {
        analyzed: false,
        reason: `分析失败: ${error.message}`,
        extractedPrompts: {
          positive: positive,
          negative: negative
        }
      };
    }
  }
}

// 导出类和实例
export const advancedPromptAnalyzer = new AdvancedPromptAnalyzer();
export default AdvancedPromptAnalyzer; 