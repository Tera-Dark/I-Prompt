import { API_CONFIG } from '../constants/config';
import { logger } from '../config/debug.js';

/**
 * AI智能提示词生成服务
 */
class AIService {
  constructor() {
    this.apiKey = API_CONFIG.SILICONFLOW_API_KEY;
    this.baseUrl = API_CONFIG.BASE_URL;
    this.defaultModel = API_CONFIG.DEFAULT_MODEL;
  }

  /**
   * 构建系统提示词
   */
  buildSystemPrompt(userInput) {
    return `You are an AI assistant specialized in generating detailed, comma-separated English tags for AI image generation platforms like Stable Diffusion. 

Your task:
1. If the input is in Chinese, first understand the meaning and translate key concepts to English
2. Expand the description into a rich list of descriptive English tags
3. Add quality enhancers, lighting, composition, and style tags
4. Output MUST be a single line of English tags, separated by commas
5. Do not add any other text, sentences, or explanations

Example Input: "一个美丽的精灵法师在黑暗森林中"
Example Output: "1girl, solo, elf, sorceress, beautiful, long_hair, pointy_ears, magical_staff, flowing_robe, dark_forest, ancient_trees, mystical_atmosphere, masterpiece, best quality, ultra detailed, cinematic lighting, dramatic shadows, perfect composition"

Example Input: "a cyberpunk cityscape at night"
Example Output: "cyberpunk, cityscape, night, neon_lights, skyscrapers, futuristic_architecture, flying_cars, holographic_advertisements, rain_effects, atmospheric_perspective, masterpiece, best quality, ultra detailed, moody_lighting, cinematic_composition"

User Input: ${userInput}

Output Tags (comma-separated English tags only):`;
  }

  /**
   * 生成智能提示词
   */
  async generatePrompt(input, style = '') {
    // 构建完整的用户输入
    let fullInput = input;
    if (style) {
      fullInput += `, ${style} style`;
    }

    const systemPrompt = this.buildSystemPrompt(fullInput);

    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CHAT_COMPLETIONS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [
            {
              role: 'user',
              content: systemPrompt
            }
          ],
          stream: false,
          max_tokens: API_CONFIG.DEFAULT_PARAMS.max_tokens,
          temperature: 0.6 + (Math.random() * 0.4), // 0.6-1.0 随机温度
          top_p: API_CONFIG.DEFAULT_PARAMS.top_p
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const generatedTags = data.choices[0]?.message?.content?.trim();
      
      if (generatedTags) {
        return { content: generatedTags, source: 'ai' };
      } else {
        throw new Error('API返回的内容为空');
      }
      
    } catch (error) {
      logger.error('AI生成失败:', error);
      throw error;
    }
  }

  /**
   * 检查API状态
   */
  async checkApiStatus() {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CHAT_COMPLETIONS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        })
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default new AIService();