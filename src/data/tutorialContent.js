/**
 * 完整的AI绘画教程内容数据
 * 包含详细的文字教程、示例和练习
 */

export const TUTORIAL_CONTENT = {
  'tutorial-1': {
    id: 'tutorial-1',
    title: 'AI绘画入门基础',
    description: '了解AI绘画的基本概念和工具，掌握基础操作和核心原理。',
    level: '新手',
    duration: '30分钟',
    rating: 4.8,
    tags: ['入门', '基础概念', '工具介绍'],
    objectives: [
      '理解AI绘画的基本概念和工作原理',
      '了解主流AI绘画工具的特点和区别',
      '掌握基础的界面操作和参数设置',
      '完成第一张AI绘画作品的生成'
    ],
    prerequisites: [],
    chapters: [
      {
        id: 'chapter-1-1',
        title: '什么是AI绘画？',
        duration: '5分钟',
        content: {
          introduction: 'AI绘画是利用人工智能技术自动生成图像的技术。它通过深度学习模型，特别是生成对抗网络(GAN)和扩散模型(Diffusion Model)，将文字描述转换为相应的图像。核心概念包括文本到图像生成、扩散模型原理等。AI绘画技术发展迅速，目前已广泛应用于艺术创作、商业设计、内容创作等领域。',
          keyPoints: [
            'AI绘画是通过深度学习模型将文字转换为图像的技术',
            '扩散模型是目前最主流的AI绘画技术基础',
            'AI绘画在多个领域有广泛应用前景'
          ],
          quiz: [
            {
              question: 'AI绘画的核心技术原理是什么？',
              options: [
                '将文字描述转换为相应的图像',
                '复制现有的艺术作品',
                '随机生成图像内容',
                '人工手绘后数字化'
              ],
              correct: 0,
              explanation: 'AI绘画的核心是文本到图像生成，通过理解文字描述来生成相应的视觉图像。'
            }
          ]
        }
      },
      {
        id: 'chapter-1-2',
        title: '主流AI绘画工具介绍',
        duration: '10分钟',
        content: {
          introduction: '当前市场上有众多优秀的AI绘画工具。Stable Diffusion是最受欢迎的开源模型，完全免费且高度可定制。Midjourney以出色的艺术风格著称，操作简单。DALL-E系列由OpenAI开发，文本理解能力强。国产工具如文心一格、6pen Art等在中文理解方面有优势。选择工具要考虑使用场景、技术水平和预算。',
          keyPoints: [
            'Stable Diffusion开源免费，适合技术用户',
            'Midjourney操作简单，艺术质量高',
            'DALL-E文本理解能力强，图像真实感好',
            '选择工具要考虑使用场景和技术水平'
          ],
          quiz: [
            {
              question: 'Stable Diffusion的最大优势是什么？',
              options: [
                '完全免费且开源',
                '生成速度最快',
                '艺术质量最高',
                '操作最简单'
              ],
              correct: 0,
              explanation: 'Stable Diffusion的最大优势是完全免费开源，用户可以自由使用和修改。'
            }
          ]
        }
      },
      {
        id: 'chapter-1-3',
        title: '基础界面操作',
        duration: '8分钟',
        content: {
          introduction: '掌握AI绘画工具的基础界面操作是成功创作的第一步。以Stable Diffusion WebUI为例，界面分为导航栏、提示词区、参数区和控制区。重要参数包括采样方法、采样步数、CFG Scale等。提示词分为正向和负向，要合理组织描述。参数调优要根据具体问题进行针对性调整。',
          keyPoints: [
            '界面分为四个主要部分：导航栏、提示词区、参数区和控制区',
            '采样方法和步数直接影响生成质量和速度',
            'CFG Scale控制AI对提示词的遵循程度，推荐7-12',
            '提示词分为正向和负向，要合理组织'
          ],
          quiz: [
            {
              question: 'CFG Scale的推荐设置范围是？',
              options: [
                '1-5',
                '7-12',
                '15-20',
                '25-30'
              ],
              correct: 1,
              explanation: 'CFG Scale推荐设置在7-12之间，这个范围能平衡创意性和准确性。'
            }
          ]
        }
      },
      {
        id: 'chapter-1-4',
        title: '第一张AI作品生成',
        duration: '7分钟',
        content: {
          introduction: '通过实际操作创作第一张AI绘画作品。以"森林中的小木屋"为主题，按照"主体+环境+风格+质量"的结构组织提示词。从简单开始，逐步添加细节优化。参数调优要根据实际效果进行调整。完整的创作流程包括构思、生成、分析、优化多个环节。记录每次尝试有助于后续改进。',
          keyPoints: [
            '创作前要先确定主题和构思提示词结构',
            '从简单的提示词开始，逐步添加细节',
            '参数调优要根据实际效果进行调整',
            '完整流程包括构思、生成、分析、优化'
          ],
          quiz: [
            {
              question: '提示词的推荐组织结构是什么？',
              options: [
                '风格+主体+环境+质量',
                '主体+环境+风格+质量',
                '质量+风格+主体+环境',
                '环境+质量+主体+风格'
              ],
              correct: 1,
              explanation: '推荐按照"主体+环境+风格+质量"的结构组织提示词，这样逻辑清晰，效果更好。'
            }
          ]
        }
      }
    ]
  },
  'tutorial-2': {
    id: 'tutorial-2',
    title: '提示词编写技巧',
    description: '掌握高效提示词写作方法，学会描述想要的画面效果。',
    level: '初级',
    duration: '45分钟',
    rating: 4.9,
    tags: ['提示词', '写作技巧', '优化方法'],
    objectives: [
      '掌握提示词的基础语法和结构',
      '学会使用权重控制强调重点',
      '了解风格描述的技巧和方法',
      '通过实战练习提升写作能力'
    ],
    prerequisites: ['tutorial-1'],
    chapters: [
      {
        id: 'chapter-2-1',
        title: '提示词基础语法',
        duration: '10分钟',
        content: {
          introduction: '提示词是AI绘画的核心，好的提示词能够精确表达创作意图。基础语法包括词汇选择、语序排列、权重设置等。要遵循简洁明确的原则，避免复杂长句。合理使用逗号分隔，按重要性排序。掌握基础语法是高效创作的前提。',
          keyPoints: [
            '提示词要简洁明确，避免复杂长句',
            '使用逗号分隔不同元素',
            '按重要性排序关键词',
            '掌握基础语法规则'
          ],
          quiz: [
            {
              question: '提示词编写的基本原则是什么？',
              options: [
                '越长越好',
                '简洁明确',
                '语法复杂',
                '随意排列'
              ],
              correct: 1,
              explanation: '提示词要简洁明确，避免复杂长句，这样AI更容易理解。'
            }
          ]
        }
      },
      {
        id: 'chapter-2-2',
        title: '关键词权重控制',
        duration: '12分钟',
        content: {
          introduction: '权重控制是提示词的高级技巧，通过调整关键词的权重来强调或弱化特定元素。使用括号增加权重，减号降低权重。合理的权重设置能够精确控制画面效果。要注意权重不宜过高，避免画面失衡。',
          keyPoints: [
            '使用括号增加关键词权重',
            '使用减号降低权重',
            '权重设置要适度，避免过高',
            '通过权重控制画面重点'
          ],
          quiz: [
            {
              question: '如何增加关键词的权重？',
              options: [
                '使用减号',
                '使用括号',
                '重复书写',
                '大写字母'
              ],
              correct: 1,
              explanation: '使用括号可以增加关键词的权重，让AI更重视这个元素。'
            }
          ]
        }
      },
      {
        id: 'chapter-2-3',
        title: '风格描述技巧',
        duration: '15分钟',
        content: {
          introduction: '风格描述是提示词的重要组成部分，直接影响画面的视觉效果。包括艺术风格、色彩搭配、光线氛围等方面。要学会使用专业的艺术术语，参考知名艺术家和艺术流派。合理搭配不同风格元素，创造独特的视觉效果。',
          keyPoints: [
            '使用专业的艺术术语',
            '参考知名艺术家和流派',
            '注意色彩搭配和光线描述',
            '合理搭配不同风格元素'
          ],
          quiz: [
            {
              question: '风格描述应该包含哪些方面？',
              options: [
                '只有艺术风格',
                '艺术风格、色彩、光线等',
                '只有色彩搭配',
                '只有光线效果'
              ],
              correct: 1,
              explanation: '风格描述应该包含艺术风格、色彩搭配、光线氛围等多个方面。'
            }
          ]
        }
      },
      {
        id: 'chapter-2-4',
        title: '实战练习',
        duration: '8分钟',
        content: {
          introduction: '通过实际案例练习提示词编写技巧。从简单场景开始，逐步增加复杂度。分析优秀提示词的结构和特点，学习其中的技巧。通过大量练习提升写作能力，形成自己的风格。实践是最好的老师。',
          keyPoints: [
            '从简单场景开始练习',
            '分析优秀提示词案例',
            '逐步增加复杂度',
            '通过实践提升能力'
          ],
          quiz: [
            {
              question: '提高提示词写作能力的最佳方法是什么？',
              options: [
                '只看教程',
                '大量实践练习',
                '背诵模板',
                '随意尝试'
              ],
              correct: 1,
              explanation: '大量实践练习是提高提示词写作能力的最佳方法。'
            }
          ]
        }
      }
    ]
  },
  'tutorial-3': {
    id: 'tutorial-3',
    title: '高级构图方法',
    description: '学习专业构图技巧，提升作品的视觉冲击力和艺术性。',
    level: '进阶',
    duration: '60分钟',
    rating: 4.7,
    tags: ['构图', '色彩', '艺术理论'],
    objectives: [
      '理解构图的基本原理和要素',
      '掌握经典构图法则的应用',
      '学习色彩搭配的理论知识',
      '通过案例分析提升审美能力'
    ],
    prerequisites: ['tutorial-1', 'tutorial-2'],
    chapters: [
      {
        id: 'chapter-3-1',
        title: '构图基本原理',
        duration: '15分钟',
        content: {
          introduction: '构图是视觉艺术的基础，决定了作品的视觉效果和表现力。基本原理包括平衡、对比、节奏、统一等要素。要学会运用点、线、面的关系，创造有序的视觉结构。好的构图能够引导观者的视线，增强作品的表现力。',
          keyPoints: [
            '构图包括平衡、对比、节奏、统一等要素',
            '运用点、线、面的关系',
            '创造有序的视觉结构',
            '引导观者视线'
          ],
          quiz: [
            {
              question: '构图的基本要素不包括？',
              options: [
                '平衡',
                '对比',
                '价格',
                '节奏'
              ],
              correct: 2,
              explanation: '构图的基本要素包括平衡、对比、节奏、统一等，不包括价格。'
            }
          ]
        }
      },
      {
        id: 'chapter-3-2',
        title: '黄金比例和三分法',
        duration: '18分钟',
        content: {
          introduction: '黄金比例和三分法是经典的构图法则。黄金比例创造最和谐的视觉效果，三分法则简单实用。要学会将重要元素放置在关键位置，避免居中构图的单调。灵活运用这些法则，创造有趣的视觉节奏。',
          keyPoints: [
            '黄金比例创造和谐的视觉效果',
            '三分法则简单实用',
            '重要元素放置在关键位置',
            '避免单调的居中构图'
          ],
          quiz: [
            {
              question: '三分法则的核心是什么？',
              options: [
                '将画面等分为三部分',
                '使用三种颜色',
                '创作三个主体',
                '分三次完成'
              ],
              correct: 0,
              explanation: '三分法则是将画面分为三等分，重要元素放在分割线上。'
            }
          ]
        }
      },
      {
        id: 'chapter-3-3',
        title: '色彩搭配理论',
        duration: '20分钟',
        content: {
          introduction: '色彩是构图的重要组成部分，直接影响情感表达。要理解色相、明度、纯度的关系，掌握冷暖色调的搭配。学会使用对比色和邻近色，创造不同的视觉效果。色彩搭配要服务于主题表达。',
          keyPoints: [
            '理解色相、明度、纯度的关系',
            '掌握冷暖色调搭配',
            '使用对比色和邻近色',
            '色彩服务于主题表达'
          ],
          quiz: [
            {
              question: '对比色的效果是什么？',
              options: [
                '创造和谐感',
                '增强视觉冲击',
                '降低饱和度',
                '统一色调'
              ],
              correct: 1,
              explanation: '对比色能够增强视觉冲击力，创造强烈的视觉效果。'
            }
          ]
        }
      },
      {
        id: 'chapter-3-4',
        title: '案例分析',
        duration: '7分钟',
        content: {
          introduction: '通过经典艺术作品分析构图和色彩的运用。学习大师们的构图技巧，理解其作品的成功之处。分析不同风格作品的特点，从中汲取灵感。将理论知识与实际作品结合，提升审美能力。',
          keyPoints: [
            '分析经典艺术作品',
            '学习大师的构图技巧',
            '理解不同风格特点',
            '理论结合实际'
          ],
          quiz: [
            {
              question: '学习构图最好的方法是什么？',
              options: [
                '只看理论书籍',
                '分析经典作品',
                '随意模仿',
                '避免学习他人'
              ],
              correct: 1,
              explanation: '分析经典作品是学习构图的最好方法，能够理解实际应用。'
            }
          ]
        }
      }
    ]
  },
  'tutorial-4': {
    id: 'tutorial-4',
    title: '风格控制技术',
    description: '控制图片风格的高级技巧，实现特定艺术风格的精准表达。',
    level: '进阶',
    duration: '40分钟',
    rating: 4.6,
    tags: ['风格控制', 'LoRA', '艺术风格'],
    objectives: [
      '了解不同艺术风格的特点',
      '掌握LoRA模型的使用方法',
      '学会混合多种风格的技巧',
      '通过案例学习实际应用'
    ],
    prerequisites: ['tutorial-1', 'tutorial-2'],
    chapters: [
      {
        id: 'chapter-4-1',
        title: '艺术风格分类',
        duration: '8分钟',
        content: {
          introduction: '不同艺术风格有各自的特点和表现形式。写实风格注重真实感，动漫风格强调可爱和夸张，油画风格追求厚重感，水彩风格体现清新感。要理解各种风格的核心特征，选择合适的风格词汇。风格选择要与主题内容相匹配。',
          keyPoints: [
            '写实风格注重真实感',
            '动漫风格强调可爱夸张',
            '油画风格追求厚重感',
            '风格选择要匹配主题'
          ],
          quiz: [
            {
              question: '水彩风格的主要特点是什么？',
              options: [
                '厚重感强',
                '色彩鲜艳',
                '清新透明',
                '线条粗犷'
              ],
              correct: 2,
              explanation: '水彩风格的主要特点是清新透明，色彩自然过渡。'
            }
          ]
        }
      },
      {
        id: 'chapter-4-2',
        title: 'LoRA模型使用',
        duration: '15分钟',
        content: {
          introduction: 'LoRA是低秩适应技术，能够快速适配特定风格。使用LoRA需要下载相应模型文件，设置合适的权重。不同LoRA有不同的特点和适用场景。要学会调节LoRA权重，获得最佳效果。合理搭配多个LoRA可以创造独特风格。',
          keyPoints: [
            'LoRA是低秩适应技术',
            '需要下载相应模型文件',
            '调节权重获得最佳效果',
            '可以搭配多个LoRA'
          ],
          quiz: [
            {
              question: 'LoRA的主要作用是什么？',
              options: [
                '增加生成速度',
                '快速适配特定风格',
                '减少内存占用',
                '提高图像分辨率'
              ],
              correct: 1,
              explanation: 'LoRA的主要作用是快速适配特定风格，无需重新训练整个模型。'
            }
          ]
        }
      },
      {
        id: 'chapter-4-3',
        title: '混合风格技巧',
        duration: '12分钟',
        content: {
          introduction: '混合风格能够创造独特的视觉效果。要选择兼容的风格进行混合，避免冲突的元素。通过调节权重控制混合比例，创造平衡的效果。实验不同的组合方式，找到最适合的搭配。混合风格需要经验积累和反复尝试。',
          keyPoints: [
            '选择兼容的风格混合',
            '避免冲突的元素',
            '调节权重控制比例',
            '需要经验积累'
          ],
          quiz: [
            {
              question: '混合风格时最重要的是什么？',
              options: [
                '使用最多的风格',
                '选择兼容的风格',
                '随意组合',
                '只用一种风格'
              ],
              correct: 1,
              explanation: '混合风格时最重要的是选择兼容的风格，避免冲突。'
            }
          ]
        }
      },
      {
        id: 'chapter-4-4',
        title: '实用案例',
        duration: '5分钟',
        content: {
          introduction: '通过实际案例展示风格控制的应用效果。分析不同风格的参数设置和效果对比，总结成功经验。从失败案例中学习避免的问题，积累实战经验。风格控制是技术与艺术的结合，需要持续练习和探索。',
          keyPoints: [
            '分析实际案例效果',
            '总结成功经验',
            '从失败中学习',
            '技术与艺术结合'
          ],
          quiz: [
            {
              question: '风格控制技术的本质是什么？',
              options: [
                '纯技术操作',
                '纯艺术创作',
                '技术与艺术结合',
                '随机尝试'
              ],
              correct: 2,
              explanation: '风格控制技术是技术与艺术的结合，需要技术手段和艺术感觉。'
            }
          ]
        }
      }
    ]
  },
  'tutorial-5': {
    id: 'tutorial-5',
    title: '参数调优指南',
    description: '深入理解生成参数，掌握各种参数对图像质量的影响。',
    level: '高级',
    duration: '90分钟',
    rating: 4.8,
    tags: ['参数调优', '采样器', '高级技巧'],
    objectives: [
      '深入理解各种采样器的特点',
      '掌握CFG Scale等参数的优化',
      '学会根据需求调节生成步数',
      '熟练运用高级参数组合'
    ],
    prerequisites: ['tutorial-1', 'tutorial-2', 'tutorial-3'],
    chapters: [
      {
        id: 'chapter-5-1',
        title: '采样器详解',
        duration: '25分钟',
        content: {
          introduction: '采样器是控制图像生成过程的核心组件。不同采样器有不同的算法和特点。Euler系列速度快适合预览，DPM系列质量高适合正式创作，DDIM系列稳定性好适合批量生成。要根据具体需求选择合适的采样器，平衡质量和速度。',
          keyPoints: [
            'Euler系列速度快适合预览',
            'DPM系列质量高适合创作',
            'DDIM系列稳定性好',
            '要平衡质量和速度'
          ],
          quiz: [
            {
              question: '快速预览应该选择什么采样器？',
              options: [
                'DPM++ 2M',
                'Euler a',
                'DDIM',
                'LMS'
              ],
              correct: 1,
              explanation: 'Euler a速度快，适合快速预览和测试。'
            }
          ]
        }
      },
      {
        id: 'chapter-5-2',
        title: 'CFG Scale优化',
        duration: '20分钟',
        content: {
          introduction: 'CFG Scale控制AI对提示词的遵循程度，是重要的调优参数。数值过低会偏离提示词，过高会显得死板。一般推荐7-12的范围，根据具体情况微调。不同模型和风格可能需要不同的CFG值。要通过实验找到最适合的设置。',
          keyPoints: [
            'CFG Scale控制提示词遵循程度',
            '推荐范围7-12',
            '不同模型需要不同设置',
            '要通过实验找到最佳值'
          ],
          quiz: [
            {
              question: 'CFG Scale设置过高会导致什么问题？',
              options: [
                '图像模糊',
                '偏离提示词',
                '显得死板',
                '生成速度慢'
              ],
              correct: 2,
              explanation: 'CFG Scale过高会让图像显得死板，缺乏创意性。'
            }
          ]
        }
      },
      {
        id: 'chapter-5-3',
        title: '步数与质量关系',
        duration: '25分钟',
        content: {
          introduction: '生成步数直接影响图像质量和生成时间。步数越多质量越高，但收益递减。一般15-20步用于快速预览，25-30步用于日常创作，40-50步用于高质量输出。要根据实际需求选择合适的步数，避免浪费时间。',
          keyPoints: [
            '步数影响质量和时间',
            '收益递减规律',
            '不同用途选择不同步数',
            '避免浪费时间'
          ],
          quiz: [
            {
              question: '日常创作推荐多少步数？',
              options: [
                '15-20步',
                '25-30步',
                '40-50步',
                '100步以上'
              ],
              correct: 1,
              explanation: '日常创作推荐25-30步，能够平衡质量和速度。'
            }
          ]
        }
      },
      {
        id: 'chapter-5-4',
        title: '高级参数调优',
        duration: '20分钟',
        content: {
          introduction: '高级参数包括种子值、尺寸比例、批量设置等。种子值用于复现特定结果，尺寸影响构图和细节，批量设置提高效率。要学会组合使用各种参数，创造最佳效果。参数调优是个性化的过程，需要积累经验。',
          keyPoints: [
            '种子值用于复现结果',
            '尺寸影响构图和细节',
            '批量设置提高效率',
            '需要积累经验'
          ],
          quiz: [
            {
              question: '种子值的主要作用是什么？',
              options: [
                '提高图像质量',
                '复现特定结果',
                '加快生成速度',
                '节省内存'
              ],
              correct: 1,
              explanation: '种子值的主要作用是复现特定的生成结果。'
            }
          ]
        }
      }
    ]
  },
  'tutorial-6': {
    id: 'tutorial-6',
    title: '工作流程优化',
    description: '提高创作效率的工作流，从构思到成品的完整流程。',
    level: '高级',
    duration: '75分钟',
    rating: 4.5,
    tags: ['工作流程', '效率优化', '项目管理'],
    objectives: [
      '建立系统化的创作流程',
      '掌握批量生成的技巧',
      '学会后期处理的方法',
      '建立有效的作品管理系统'
    ],
    prerequisites: ['tutorial-1', 'tutorial-2', 'tutorial-3', 'tutorial-4'],
    chapters: [
      {
        id: 'chapter-6-1',
        title: '创作流程规划',
        duration: '20分钟',
        content: {
          introduction: '系统化的创作流程能够提高效率和质量。包括前期的需求分析、中期的制作执行、后期的优化完善。要建立标准化的工作步骤，减少重复劳动。合理安排时间，设置里程碑节点。流程要根据项目特点灵活调整。',
          keyPoints: [
            '包括前期、中期、后期三个阶段',
            '建立标准化工作步骤',
            '合理安排时间节点',
            '根据项目特点调整'
          ],
          quiz: [
            {
              question: '创作流程的第一步是什么？',
              options: [
                '开始制作',
                '需求分析',
                '后期处理',
                '作品发布'
              ],
              correct: 1,
              explanation: '创作流程的第一步是需求分析，明确目标和要求。'
            }
          ]
        }
      },
      {
        id: 'chapter-6-2',
        title: '批量生成技巧',
        duration: '25分钟',
        content: {
          introduction: '批量生成能够大幅提高创作效率。要合理设置批量参数，避免资源浪费。使用不同的种子值生成多样化结果，通过脚本自动化重复操作。要注意质量控制，及时筛选优秀作品。批量生成适合探索创意和风格实验。',
          keyPoints: [
            '合理设置批量参数',
            '使用不同种子值',
            '脚本自动化操作',
            '注意质量控制'
          ],
          quiz: [
            {
              question: '批量生成的主要优势是什么？',
              options: [
                '提高图像质量',
                '提高创作效率',
                '减少内存使用',
                '简化操作步骤'
              ],
              correct: 1,
              explanation: '批量生成的主要优势是提高创作效率，快速产出多个作品。'
            }
          ]
        }
      },
      {
        id: 'chapter-6-3',
        title: '后期处理方法',
        duration: '20分钟',
        content: {
          introduction: '后期处理能够进一步提升作品质量。包括基础的修图调色，高级的合成特效。要选择合适的工具，掌握基本操作技巧。后期处理要服务于创作目标，避免过度处理。要保持原作的风格特点，适度优化即可。',
          keyPoints: [
            '包括修图调色和合成特效',
            '选择合适的工具',
            '服务于创作目标',
            '适度优化'
          ],
          quiz: [
            {
              question: '后期处理的原则是什么？',
              options: [
                '越复杂越好',
                '完全改变原作',
                '适度优化',
                '不做任何处理'
              ],
              correct: 2,
              explanation: '后期处理的原则是适度优化，保持原作风格特点。'
            }
          ]
        }
      },
      {
        id: 'chapter-6-4',
        title: '作品管理',
        duration: '10分钟',
        content: {
          introduction: '有效的作品管理系统能够提高工作效率。包括文件命名规范、分类整理方法、版本控制系统。要建立清晰的目录结构，使用标签分类。定期备份重要作品，记录创作参数。良好的管理习惯是长期创作的基础。',
          keyPoints: [
            '建立文件命名规范',
            '使用分类整理方法',
            '定期备份重要作品',
            '记录创作参数'
          ],
          quiz: [
            {
              question: '作品管理最重要的是什么？',
              options: [
                '使用昂贵软件',
                '建立管理系统',
                '随意存放',
                '不做备份'
              ],
              correct: 1,
              explanation: '作品管理最重要的是建立系统化的管理方法。'
            }
          ]
        }
      }
    ]
  }
};

// 教程元数据
export const TUTORIAL_METADATA = {
  'tutorial-1': {
    id: 'tutorial-1',
    title: 'AI绘画入门基础',
    level: '新手',
    duration: 30,
    chapters: 4,
    totalQuizzes: 8
  },
  'tutorial-2': {
    id: 'tutorial-2', 
    title: '提示词编写技巧',
    level: '初级',
    duration: 45,
    chapters: 4,
    totalQuizzes: 12
  },
  'tutorial-3': {
    id: 'tutorial-3',
    title: '高级构图方法', 
    level: '进阶',
    duration: 60,
    chapters: 4,
    totalQuizzes: 15
  },
  'tutorial-4': {
    id: 'tutorial-4',
    title: '风格控制技术',
    level: '进阶', 
    duration: 40,
    chapters: 4,
    totalQuizzes: 10
  },
  'tutorial-5': {
    id: 'tutorial-5',
    title: '参数调优指南',
    level: '高级',
    duration: 90,
    chapters: 4,
    totalQuizzes: 20
  },
  'tutorial-6': {
    id: 'tutorial-6',
    title: '工作流程优化',
    level: '高级',
    duration: 75,
    chapters: 4,
    totalQuizzes: 16
  }
};

export default TUTORIAL_CONTENT; 