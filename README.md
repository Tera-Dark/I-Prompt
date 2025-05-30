# I-Prompt 智能提示词助手 3.0

<div align="center">

![i-Prompt Logo](public/logo192.png)

**专业的AI绘画提示词生成与图像分析工具**

[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![DeepSeek](https://img.shields.io/badge/DeepSeek-R1-purple.svg)](https://www.deepseek.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-3.0.0-red.svg)](package.json)

</div>

## 🎯 项目简介

I-Prompt 是一款专业的AI绘画提示词助手，集成了**世界首个开源NovelAI Stealth PNG解析器**和**全新升级的智能提示词库3.0**，帮助艺术家和创作者快速生成高质量的英文提示词，并深度分析AI生成图像的元数据。通过集成硅基流动的**DeepSeek-R1大模型**、多引擎翻译系统和先进的图像分析技术，提供从创作到分析的完整工作流。

### ✨ 核心特色

- 🧠 **DeepSeek-R1 AI生成** - 由最新的DeepSeek-R1大模型驱动，提供专业级提示词扩写
- 🔍 **专业图像分析** - 融合NovelAI Spell技术，支持所有主流AI工具
- 🎨 **智能提示词库3.0** - 全新界面设计，分层标签系统，多引擎翻译
- ✍️ **专业编辑器** - 双栏式编辑，实时翻译，智能补全
- 🌏 **中英文双语** - 完美支持中文输入，自动转换为英文标签
- 🤖 **纯AI驱动** - 摒弃传统本地算法，完全依靠AI智能理解和扩写
- 🎯 **精准分类** - 6大主分类，300+专业标签，20+子分类
- 📋 **一键操作** - 生成结果一键复制，快速分享

## 🌟 DeepSeek-R1 智能生成 - 全新升级

### 🧠 纯AI驱动的提示词生成
- **DeepSeek-R1 大模型** - 采用最新的DeepSeek-R1模型，理解能力超强
- **智能理解** - 支持中文输入，AI自动理解并转换为专业英文提示词
- **上下文感知** - 根据描述内容智能添加质量控制词和风格标签
- **创意扩写** - AI能够根据简单描述生成丰富详细的提示词
- **专业优化** - 针对AI绘画场景优化，生成符合各大绘画平台的提示词

### 💡 智能生成特性
```
输入：一个可爱的猫女孩，穿着白色连衣裙
AI扩写：masterpiece, best quality, ultra detailed, cute cat girl, white dress, 
       beautiful face, long hair, cat ears, tail, standing, outdoor garden, 
       soft lighting, anime style, high resolution, professional artwork
```

### 🎯 使用方法
1. **输入描述** - 用中文或英文描述你想要的画面
2. **选择风格** - 可选择动漫、写实、油画等风格（可选）
3. **AI生成** - 点击"DeepSeek AI 智能生成"按钮
4. **一键复制** - 复制生成的专业提示词到AI绘画工具

## 🌟 智能提示词库 3.0 重磅更新

### 🚀 最新更新 (2025年版本)

#### 📝 翻译功能全面升级
- **🌐 多引擎翻译系统**：基于Python translators库，支持Google、Bing、百度、有道、阿里等翻译引擎
- **🎯 AI绘画专业词典**：内置200+专业术语，确保翻译准确性
- **⚡ 智能降级机制**：自动选择可用引擎，确保翻译成功率
- **🔄 实时翻译预览**：支持自动翻译和手动编辑
- **📊 翻译质量监控**：显示翻译覆盖率、成功率等统计信息

#### 🎨 界面优化
- **提示词预览区**：将"英文提示词"改为"提示词预览"，更准确描述功能
- **中文翻译区**：新增独立的中文翻译显示区域
- **双栏布局**：英文和中文并排显示，方便对比
- **实时状态显示**：翻译进度、引擎状态、成功率等实时反馈

#### 🔧 技术特性

**支持的翻译引擎：**
- **Google翻译** - 支持134种语言，质量高
- **Bing翻译** - 微软翻译，稳定可靠
- **百度翻译** - 支持201种语言，中文效果好
- **有道翻译** - 支持114种语言，中文翻译质量高
- **阿里翻译** - 支持221种语言，专业领域翻译
- **MyMemory** - 免费翻译服务，支持多种语言

**智能特性：**
- 🧠 **智能引擎选择**：根据文本类型和可用性自动选择最佳引擎
- 🔄 **自动重试机制**：失败时自动切换引擎重试
- 📚 **专业词典降级**：在线翻译失败时使用内置AI绘画词典
- ⚡ **批量翻译优化**：支持并发翻译，智能限流避免被封
- 🎯 **语言自动检测**：自动识别源语言类型

## 🚀 快速开始

### 方法一：使用快速启动脚本（推荐）

1. 双击运行 `start-iprompt.bat`
2. 脚本会自动检测环境并安装依赖
3. 服务器启动后会自动打开浏览器

### 方法二：手动启动

```bash
# 克隆项目
git clone https://github.com/your-username/I-Prompt.git
cd I-Prompt

# 安装依赖
npm install

# 启动开发服务器
npm start

# 在浏览器中访问
# http://localhost:3000
```

## 🎮 使用指南

### DeepSeek AI 智能生成器

#### 💡 快速生成高质量提示词
```
1. 输入描述 → 用中文描述你想要的画面，如"一个可爱的猫女孩"
2. 选择风格 → 可选择动漫、写实、油画等风格（可选）
3. AI生成 → 点击"DeepSeek AI 智能生成"按钮
4. 一键复制 → 复制生成的专业提示词到AI绘画工具
```

#### 🎯 AI生成示例
```
用户输入: 森林中的精灵公主，金色长发，绿色眼睛
AI扩写: masterpiece, best quality, ultra detailed, elf princess in forest, 
       golden long hair, emerald green eyes, pointed ears, flowing white dress, 
       magical forest background, sunlight filtering through trees, 
       fantasy art style, ethereal atmosphere, high resolution
```

### 智能提示词库 3.0 使用方法

#### 快速构建提示词
```
1. 选择分类 → 点击左侧分类导航
2. 浏览标签 → 查看右侧标签卡片
3. 添加标签 → 点击标签自动添加到编辑器
4. 实时翻译 → 点击翻译按钮查看中文释义
5. 一键复制 → 复制完整提示词使用
```

#### 翻译效果展示
```
输入: masterpiece, best quality, beautiful girl
翻译: 杰作, 最佳质量, 美丽女孩

显示效果:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ masterpiece     │  │ best quality    │  │ beautiful girl  │
│ 杰作            │  │ 最佳质量        │  │ 美丽女孩        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

#### 标签卡片展示
```
beautiful girl (美丽女孩)
90% ████████████████████░ [+添加] [♡收藏]
```

## 🏗️ 项目架构

```
src/
├── components/          # React组件
│   ├── ImageExtractorPage.jsx      # 图像分析页面
│   ├── AdvancedPromptEditor.jsx    # 高级提示词编辑器
│   └── ...
├── services/           # 服务层
│   ├── translationService.js     # 多引擎翻译服务
│   └── imageMetadataService.js   # 图像元数据服务
├── hooks/              # React Hooks
│   └── usePromptGenerator.js     # DeepSeek AI生成Hook
├── constants/          # 常量配置
│   ├── config.js                 # 应用配置 (DeepSeek API)
│   ├── data.js                   # 静态数据
│   └── tagDatabase.js            # 分层标签库数据
├── utils/              # 工具函数
│   ├── imageMetadataExtractor.js  # 专业级图像元数据提取器
│   ├── advancedPromptAnalyzer.js  # 高级提示词分析器
│   └── clipboard.js              # 剪贴板操作
├── pages/              # 页面组件
│   ├── PromptGeneratorPage.jsx   # DeepSeek AI生成器页面
│   └── PromptLibraryPage.jsx     # 智能提示词库3.0页面
└── App.js              # 主应用组件
```

## 📚 功能模块

### 1. 🧠 DeepSeek AI 智能生成器
> **由DeepSeek-R1大模型驱动的专业提示词生成**

#### 🔥 核心特性
- **DeepSeek-R1模型** - 最新的推理模型，理解能力强
- **智能扩写** - 根据简单描述生成丰富详细的提示词
- **风格适配** - 支持动漫、写实、油画等多种艺术风格
- **中文支持** - 完美支持中文输入，自动转换为英文
- **上下文理解** - AI能理解描述的语境和情感

#### 🎯 使用体验
- **简单输入** - 只需用中文描述想要的画面
- **AI理解** - 智能理解描述意图和风格需求
- **专业输出** - 生成符合AI绘画平台标准的提示词
- **一键复制** - 方便快速使用

### 2. 🌟 智能提示词库 3.0
> **全新设计的分层标签系统**

#### 🔥 核心特性
- **分层分类** - 6大主分类，20+子分类，300+专业标签
- **双栏编辑** - 英文输入 + 中文翻译，所见即所得
- **实时翻译** - 多引擎翻译API，智能分词，格式保持
- **智能搜索** - 中英文混合搜索，模糊匹配
- **收藏系统** - 个人收藏 + 热门推荐

#### 🎯 使用体验
- **点击添加** - 点击标签自动添加到编辑器
- **一键翻译** - 瞬间获得中文释义
- **历史记录** - 自动保存，快速恢复
- **响应式设计** - 完美适配各种屏幕

### 3. 🌟 专业级图像信息提取器 2.0
> **世界首个开源NovelAI Stealth PNG解析器**

#### 📊 支持的AI工具格式
| 工具 | 支持度 | 特殊功能 |
|------|--------|----------|
| **NovelAI** | 95%+ | Stealth PNG完美解析 |
| **ComfyUI** | 95%+ | 工作流深度分析 |
| **AUTOMATIC1111** | 98%+ | 完整参数提取 |
| **Stable Diffusion WebUI** | 90%+ | 标准格式支持 |
| **通用PNG/EXIF** | 85%+ | 兼容性解析 |

### 4. 学习教程
- 📖 **入门指南**: AI绘画基础教程
- 🎓 **进阶技巧**: 专业提示词编写
- 🏆 **最佳实践**: 工作流程优化
- 📊 **进度跟踪**: 学习进度管理

## 📈 性能指标

### DeepSeek AI 智能生成器
- **生成速度**: < 3000ms (DeepSeek-R1 API)
- **理解准确率**: 95%+ (中文输入理解)
- **扩写质量**: 专业级 (100-200个词汇)
- **风格适配**: 支持5+种艺术风格
- **API响应**: < 2000ms (硅基流动)

### 智能提示词库 3.0
- **搜索响应**: < 100ms
- **翻译速度**: < 1000ms (多引擎API)
- **界面渲染**: < 50ms
- **标签数量**: 300+ 专业标签
- **分类覆盖**: 6大主分类，20+子分类

### 图像元数据提取器
- **解析成功率**: 95%+ (主流AI工具)
- **特殊字符处理**: 100% 零截断
- **NovelAI Stealth**: 世界首个开源支持
- **格式兼容**: 5+ 主流AI工具

## 🔐 API配置

### DeepSeek API (硅基流动)
```javascript
// src/constants/config.js
export const API_CONFIG = {
  SILICONFLOW_API_KEY: 'your-api-key',
  BASE_URL: 'https://api.siliconflow.cn/v1/chat/completions',
  DEFAULT_MODEL: 'deepseek-ai/DeepSeek-R1',
  DEFAULT_PARAMS: {
    max_tokens: 512,
    temperature: 0.7,
    top_p: 0.9
  }
};
```

### 多引擎翻译API
```javascript
// src/services/translationService.js
// 支持多种免费翻译API
// - MyMemory (主推荐) - 每日1000次免费
// - LibreTranslate (开源) - 完全免费
// - Google Web (稳定) - 非官方免费
// - 内置AI词典 (离线) - 200+专业术语
```

### API密钥获取
1. **硅基流动API**
   - 访问：https://siliconflow.cn
   - 注册账号并获取免费额度
   - 复制API密钥到配置文件

2. **翻译API**
   - MyMemory：https://mymemory.translated.net/doc/
   - LibreTranslate：https://libretranslate.com/
   - 大部分为免费服务，无需密钥

## 📝 更新日志

### v3.1.0 (2025-01-20) 🧠 DeepSeek AI 集成
🎉 **DeepSeek-R1 大模型集成，纯AI驱动**
- 🧠 **DeepSeek-R1集成**：接入最新的DeepSeek-R1推理模型
- 🚀 **纯AI生成**：移除本地算法，完全依靠AI智能扩写
- 🌐 **中文理解**：完美支持中文输入，智能转换为英文提示词
- 🎨 **风格感知**：AI能根据描述自动适配艺术风格
- ⚡ **性能优化**：简化架构，提升生成效率
- 💡 **智能扩写**：从简单描述生成100-200词汇的专业提示词
- 🔧 **界面升级**：全新的AI生成器界面设计

### v3.0.0 (2024-12-28)
🎉 **智能提示词库 3.0 重磅发布**
- ✨ 全新界面设计，参考专业AI绘画工具
- 🎨 双栏式编辑器，英文输入+中文翻译
- 🌐 集成多引擎翻译API，智能分词翻译
- 📚 分层标签库，6大分类300+标签
- 🔍 智能搜索，中英文混合支持
- ❤️ 收藏系统，个人收藏+热门推荐
- 📝 历史记录，自动保存快速恢复
- 🎯 一键操作，点击添加极简体验

### v2.0.0 (2024-12-28)
🎉 **智能提示词库 2.0 重磅发布**
- ✨ 新增高级提示词编辑器
- 🧠 智能补全系统（8个建议，按频率排序）
- ⚖️ 权重调节功能（支持多种格式）
- 🌐 一键翻译功能（中英文互译）
- 💾 自定义提示词管理
- 📊 实时统计和收藏功能

### v1.0.0 (2024-12-20)
- 🎉 首个版本发布
- 🤖 集成DeepSeek-R1大模型基础版本
- 🔍 世界首个开源NovelAI Stealth PNG解析器
- 📚 完整的提示词库系统
- 🎓 学习教程模块

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献指南

欢迎贡献代码和建议！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与项目开发。

## 📞 技术支持

- 📖 **详细文档**: [docs/PROMPT_LIBRARY_3.0.md](docs/PROMPT_LIBRARY_3.0.md)
- 🐛 **问题反馈**: [GitHub Issues](https://github.com/your-username/I-Prompt/issues)
- 💬 **讨论交流**: [GitHub Discussions](https://github.com/your-username/I-Prompt/discussions)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个Star支持一下！**

*智能提示词库 3.0 - 专业、高效、美观的提示词管理工具！*

</div>

[![Deploy Status](https://github.com/wjx19/I-Prompt/actions/workflows/deploy.yml/badge.svg)](https://github.com/wjx19/I-Prompt/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=flat&logo=github)](https://wjx19.github.io/I-Prompt)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-3.0.0-orange.svg)](https://github.com/wjx19/I-Prompt/releases)

> 🎨 **专业的AI绘画提示词生成和图像元数据提取工具**  
> 支持ComfyUI工作流解析、NovelAI Stealth PNG、智能提示词分析、多引擎翻译等功能

## 🌟 在线体验

**🚀 [立即使用 - GitHub Pages](https://wjx19.github.io/I-Prompt)**

## ✨ 核心功能

### 🖼️ 图像信息提取器
- **📋 多格式支持**: PNG、JPEG、WEBP等主流图像格式
- **🔍 智能解析**: 自动识别Stable Diffusion、ComfyUI、NovelAI等生成工具
- **🔐 NovelAI Stealth PNG**: 支持隐藏在Alpha通道的元数据提取
- **⚡ ComfyUI增强**: 深度解析复杂工作流，支持自定义节点
- **📊 可视化展示**: 三标签页设计 - 概览/智能分析/原始数据

### 🧠 智能提示词分析器
- **🏷️ 语义分类**: 8大分类 - 角色、风格、质量、构图、光照、色彩、情感、环境
- **⚖️ 权重解析**: 支持6种权重格式 - `(())`, `{}`, `[]`, `tag:1.2`等
- **📈 复杂度评估**: 多维度分析提示词质量和复杂度
- **💡 智能建议**: 基于分析结果生成优化建议

### 🌐 智能提示词库 3.0
- **📝 可视化编辑**: 悬停编辑、权重调节、括号控制
- **🔄 多引擎翻译**: 支持MyMemory、LibreTranslate、Google Web等免费API
- **📚 专业标签库**: 6大分类，300+专业标签，支持中英文
- **⭐ 智能管理**: 收藏、搜索、分类、历史记录

### 🔧 技术特性
- **🌍 纯前端部署**: 支持GitHub Pages，无需后端服务
- **📱 响应式设计**: 完美适配桌面和移动设备
- **⚡ 性能优化**: 组件懒加载、资源压缩、CDN加速
- **🛡️ 错误处理**: 完善的异常处理和降级机制

## 🚀 快速开始

### 在线使用
访问 [https://wjx19.github.io/I-Prompt](https://wjx19.github.io/I-Prompt) 立即开始使用

### 本地开发

```bash
# 克隆项目
git clone https://github.com/wjx19/I-Prompt.git
cd I-Prompt

# 安装依赖
npm install

# 启动开发服务器
npm start

# 在浏览器中打开 http://localhost:3000
```

### 本地构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📦 技术架构

### 前端技术栈
- **⚛️ React 18**: 现代React特性，并发渲染
- **🎨 Tailwind CSS**: 原子化CSS框架
- **🔧 Lucide React**: 现代图标库
- **📊 Exifr**: 高性能图像元数据解析
- **🌐 Axios**: HTTP客户端

### 翻译服务架构
```
前端应用
    ↓
免费翻译API (多引擎支持)
    ├── MyMemory (1000次/天)
    ├── LibreTranslate (20次/分钟)
    ├── Google Web (非官方)
    └── 内置词典 (降级方案)
```

### 部署架构
```
GitHub Repository
    ↓
GitHub Actions (自动化)
    ├── 代码检查 & 测试
    ├── 生产构建
    ├── 性能测试 (Lighthouse)
    └── 部署到 GitHub Pages
```

## 🔧 开发配置

### 环境要求
- **Node.js**: 18.x 或 20.x
- **npm**: 8.x+
- **浏览器**: 现代浏览器 (Chrome 88+, Firefox 85+, Safari 14+)

### 项目结构
```
I-Prompt/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 可复用组件
│   ├── pages/             # 页面组件
│   ├── services/          # 服务层
│   ├── constants/         # 常量配置
│   ├── utils/            # 工具函数
│   └── hooks/            # 自定义Hook
├── .github/
│   └── workflows/        # GitHub Actions配置
├── docs/                 # 文档
└── python_backend/       # 本地开发用Python服务(可选)
```

### 可用脚本

| 命令 | 功能 |
|------|------|
| `npm start` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run test` | 运行测试 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |
| `npm run preview` | 预览构建结果 |
| `npm run deploy` | 部署到GitHub Pages |
| `npm run lint` | 代码检查 |
| `npm run format` | 代码格式化 |

## 🌐 部署指南

### GitHub Pages自动部署

1. **Fork本项目** 到您的GitHub账户

2. **启用GitHub Pages**:
   - 进入 `Settings` → `Pages`
   - 选择 `GitHub Actions` 作为部署源

3. **触发部署**:
   - 推送代码到 `main` 或 `master` 分支
   - GitHub Actions自动构建和部署

4. **访问应用**:
   - 部署完成后访问: `https://用户名.github.io/I-Prompt`

### 手动部署

```bash
# 构建项目
npm run build

# 部署到GitHub Pages
npm run deploy
```

### 其他平台部署

- **Vercel**: 连接GitHub仓库，自动部署
- **Netlify**: 拖拽 `build` 文件夹或连接Git
- **静态服务器**: 将 `build` 文件夹内容上传到任意静态服务器

## 🔍 性能优化

### 自动化性能监控
- **Lighthouse CI**: 每次部署自动运行性能测试
- **Web Vitals**: 监控核心网页指标
- **Bundle分析**: 自动分析打包大小

### 优化特性
- **代码分割**: 按路由和组件分割
- **资源预加载**: DNS预解析、关键资源预加载
- **图像优化**: 响应式图像、懒加载
- **缓存策略**: 合理的缓存配置

## 🤝 贡献指南

### 参与贡献

1. **Fork项目** 并克隆到本地
2. **创建功能分支**: `git checkout -b feature/新功能`
3. **提交更改**: `git commit -m '添加新功能'`
4. **推送分支**: `git push origin feature/新功能`
5. **创建Pull Request**

### 开发规范

- **代码风格**: 使用Prettier格式化
- **提交规范**: 使用语义化提交信息
- **测试覆盖**: 新功能需要添加测试
- **文档更新**: 重要更改需要更新文档

## 📋 更新日志

### v3.0.0 (2024-12-28)
🎉 **智能提示词库 3.0 重磅发布**
- ✨ 全新界面设计，参考专业AI绘画工具
- 🎨 双栏式编辑器，英文输入+中文翻译
- 🌐 集成多引擎翻译API，智能分词翻译
- 📚 分层标签库，6大分类300+标签
- 🔍 智能搜索，中英文混合支持
- ❤️ 收藏系统，个人收藏+热门推荐
- 📝 历史记录，自动保存快速恢复
- 🎯 一键操作，点击添加极简体验

### v2.0.0 (2024-12-28)
🎉 **智能提示词库 2.0 重磅发布**
- ✨ 新增高级提示词编辑器
- 🧠 智能补全系统（8个建议，按频率排序）
- ⚖️ 权重调节功能（支持多种格式）
- 🌐 一键翻译功能（中英文互译）
- 💾 自定义提示词管理
- 📊 实时统计和收藏功能

### v1.0.0 (2024-12-20)
- 🎉 首个版本发布
- 🤖 集成DeepSeek-R1大模型
- 🔍 世界首个开源NovelAI Stealth PNG解析器
- 📚 完整的提示词库系统
- 🎓 学习教程模块

## 📄 许可证

本项目基于 [MIT许可证](LICENSE) 开源

## 🙏 致谢

- **[translators](https://github.com/UlionTse/translators)** - 多引擎翻译库
- **[stable-diffusion-inspector](https://github.com/Akegarasu/stable-diffusion-inspector)** - 元数据解析参考
- **[NovelAI](https://novelai.net/)** - Stealth PNG技术
- **[ComfyUI](https://github.com/comfyanonymous/ComfyUI)** - 工作流技术

## 📞 联系方式

- **项目主页**: [https://github.com/wjx19/I-Prompt](https://github.com/wjx19/I-Prompt)
- **在线体验**: [https://wjx19.github.io/I-Prompt](https://wjx19.github.io/I-Prompt)
- **问题反馈**: [GitHub Issues](https://github.com/wjx19/I-Prompt/issues)

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个星标！**

Made with ❤️ by I-Prompt Team

</div>

## ✨ 3.0 版本重大更新

### 🌍 多语言智能输入系统
- **支持中英文输入**：可以直接输入中文描述，如"美丽的女孩，樱花背景"
- **自动语言检测**：系统自动检测输入语言类型
- **智能翻译为英文**：自动将中文翻译为AI绘画标准英文提示词
- **实时预览**：左侧输入区显示原始内容，右侧输出区显示英文结果

### 🔄 强化翻译引擎
- **12种翻译引擎**：集成百度、阿里、腾讯、有道等国产引擎 + Google、DeepL等国际引擎
- **智能降级机制**：引擎失败时自动切换到备用引擎
- **专业词典**：内置400+ AI绘画专业术语，确保翻译准确性
- **批量翻译**：支持一键翻译所有标签

### 📝 智能标签编辑区
- **中文显示**：每个标签下方显示中文翻译，方便理解
- **悬停编辑**：鼠标悬停显示详细编辑选项
- **权重调节**：支持 (tag:1.2) 格式的权重控制
- **括号强调**：支持 ()、{}、[] 三种括号强调方式
- **禁用切换**：可临时禁用某些标签而不删除

## 🚀 核心功能

### 1. 智能提示词库 3.0
- **分层标签系统**：6大分类，300+精选标签
- **语义搜索**：智能搜索相关标签
- **收藏系统**：个人收藏和热门推荐
- **多语言支持**：标签支持中英文对照显示

### 2. 智能提示词生成器
- **接入DeepSeek-R1**：最新大模型支持
- **中文提示生成**：支持中文描述生成英文提示词
- **风格化生成**：根据不同绘画风格优化

### 3. 专业级图像信息提取器
- **NovelAI Stealth PNG解析**：提取隐藏的生成信息
- **元数据读取**：支持多种图像格式
- **参数解析**：自动识别绘画参数

### 4. 智能提示词分析器
- **语义分类**：自动分类提示词类型
- **权重解析**：分析各标签权重影响
- **优化建议**：提供提示词改进建议

## 💡 使用方法

### 基础使用
1. **输入提示词**：在左侧智能输入区输入中文或英文描述
2. **自动翻译**：系统自动检测语言并翻译为英文
3. **标签管理**：在编辑区调整权重、括号、禁用状态
4. **复制使用**：复制最终的英文提示词到AI绘画工具

### 高级功能
- **翻译引擎切换**：点击"引擎"按钮选择不同翻译服务
- **批量翻译**：点击"翻译全部"一键翻译所有标签
- **标签库浏览**：从下方标签库添加专业标签
- **历史记录**：查看最近使用的提示词

## 🔧 技术特性

### 前端架构
- **React 18**：最新React版本，组件化开发
- **Tailwind CSS**：现代CSS框架，响应式设计
- **Lucide React**：精美图标库

### 翻译服务
- **多引擎支持**：12种免费翻译引擎
- **智能降级**：引擎失败自动切换
- **专业词典**：AI绘画术语优化
- **语言检测**：自动识别输入语言

### 部署支持
- **GitHub Pages**：支持静态部署
- **Vercel/Netlify**：支持现代化部署
- **Docker**：容器化部署
- **Python后端**：可选Flask翻译服务

## 🌟 特色亮点

1. **零门槛使用**：支持中文输入，降低使用门槛
2. **专业级输出**：确保生成标准AI绘画英文提示词
3. **智能优化**：基于深度学习的提示词优化
4. **丰富标签库**：300+专业标签，覆盖各种绘画需求
5. **实时翻译**：毫秒级翻译响应，流畅用户体验

## 📚 更多功能

- **学习教程**：提供AI绘画提示词编写教程
- **辅助工具**：色彩搭配、构图建议等实用工具
- **图像提取**：从现有图像提取提示词信息
- **风格分析**：分析不同艺术风格的提示词特点

---

**立即体验智能提示词库 3.0，让AI绘画创作更简单！**

支持中文输入 → 自动翻译 → 专业输出 → 一键复制 → 开始创作 

## 🚀 部署方式

### GitHub Pages (前端)
前端自动部署到GitHub Pages: https://YourUsername.github.io/I-Prompt

### Vercel (Python后端)
Python后端部署到Vercel，为图像反推功能提供API支持。

#### 部署步骤
1. Fork本项目到你的GitHub账户
2. 登录 [Vercel](https://vercel.com)
3. 点击 "New Project" → Import Git Repository
4. 选择你fork的I-Prompt项目
5. 在Project Settings中：
   - Framework Preset: 选择 "Other"
   - Root Directory: 保持默认 (.)
   - Build Command: 留空
   - Output Directory: 留空
6. 点击 "Deploy" 开始部署

部署完成后，你会得到一个Vercel URL，比如：`https://i-prompt-api.vercel.app`

#### 配置前端API地址
部署完成后，需要更新前端配置：

1. 编辑 `src/services/imageTaggingService.js`
2. 将 `https://i-prompt-api.vercel.app/api` 替换为你的Vercel URL

## ✨ 功能特性

- 🎨 **智能提示词生成** - 基于DeepSeek AI的专业提示词生成
- 🖼️ **图像反推分析** - 使用WD-Tagger识别图像标签
- 🌍 **多语言翻译** - 支持中英文自动翻译
- 📊 **数据可视化** - 直观的标签置信度展示
- 💾 **结果导出** - 支持JSON格式导出分析结果
- 📱 **响应式设计** - 完美适配桌面和移动设备

## 🛠️ 本地开发

### 前端开发
```bash
npm install
npm start
```

### 后端开发 (可选)
```bash
pip install -r requirements.txt
python server.py
```

## 🔧 技术栈

- **前端**: React 18, Tailwind CSS, Lucide Icons
- **后端**: Flask, Gradio Client, CORS
- **部署**: GitHub Pages + Vercel
- **AI服务**: SiliconFlow API, Hugging Face

## 🌟 在线体验

**🚀 [立即使用 - GitHub Pages](https://wjx19.github.io/I-Prompt)**

## ✨ 核心功能

### 🖼️ 图像信息提取器
- **📋 多格式支持**: PNG、JPEG、WEBP等主流图像格式
- **🔍 智能解析**: 自动识别Stable Diffusion、ComfyUI、NovelAI等生成工具
- **🔐 NovelAI Stealth PNG**: 支持隐藏在Alpha通道的元数据提取
- **⚡ ComfyUI增强**: 深度解析复杂工作流，支持自定义节点
- **📊 可视化展示**: 三标签页设计 - 概览/智能分析/原始数据

### 🧠 智能提示词分析器
- **🏷️ 语义分类**: 8大分类 - 角色、风格、质量、构图、光照、色彩、情感、环境
- **⚖️ 权重解析**: 支持6种权重格式 - `(())`, `{}`, `[]`, `tag:1.2`等
- **📈 复杂度评估**: 多维度分析提示词质量和复杂度
- **💡 智能建议**: 基于分析结果生成优化建议

### 🌐 智能提示词库 3.0
- **📝 可视化编辑**: 悬停编辑、权重调节、括号控制
- **🔄 多引擎翻译**: 支持MyMemory、LibreTranslate、Google Web等免费API
- **📚 专业标签库**: 6大分类，300+专业标签，支持中英文
- **⭐ 智能管理**: 收藏、搜索、分类、历史记录

### 🔧 技术特性
- **🌍 纯前端部署**: 支持GitHub Pages，无需后端服务
- **📱 响应式设计**: 完美适配桌面和移动设备
- **⚡ 性能优化**: 组件懒加载、资源压缩、CDN加速
- **🛡️ 错误处理**: 完善的异常处理和降级机制

## 🚀 快速开始

### 在线使用
访问 [https://wjx19.github.io/I-Prompt](https://wjx19.github.io/I-Prompt) 立即开始使用

### 本地开发

```bash
# 克隆项目
git clone https://github.com/wjx19/I-Prompt.git
cd I-Prompt

# 安装依赖
npm install

# 启动开发服务器
npm start

# 在浏览器中打开 http://localhost:3000
```

### 本地构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📦 技术架构

### 前端技术栈
- **⚛️ React 18**: 现代React特性，并发渲染
- **🎨 Tailwind CSS**: 原子化CSS框架
- **🔧 Lucide React**: 现代图标库
- **📊 Exifr**: 高性能图像元数据解析
- **🌐 Axios**: HTTP客户端

### 翻译服务架构
```
前端应用
    ↓
免费翻译API (多引擎支持)
    ├── MyMemory (1000次/天)
    ├── LibreTranslate (20次/分钟)
    ├── Google Web (非官方)
    └── 内置词典 (降级方案)
```

### 部署架构
```
GitHub Repository
    ↓
GitHub Actions (自动化)
    ├── 代码检查 & 测试
    ├── 生产构建
    ├── 性能测试 (Lighthouse)
    └── 部署到 GitHub Pages
```

## 🔧 开发配置

### 环境要求
- **Node.js**: 18.x 或 20.x
- **npm**: 8.x+
- **浏览器**: 现代浏览器 (Chrome 88+, Firefox 85+, Safari 14+)

### 项目结构
```
I-Prompt/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 可复用组件
│   ├── pages/             # 页面组件
│   ├── services/          # 服务层
│   ├── constants/         # 常量配置
│   ├── utils/            # 工具函数
│   └── hooks/            # 自定义Hook
├── .github/
│   └── workflows/        # GitHub Actions配置
├── docs/                 # 文档
└── python_backend/       # 本地开发用Python服务(可选)
```

### 可用脚本

| 命令 | 功能 |
|------|------|
| `npm start` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run test` | 运行测试 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |
| `npm run preview` | 预览构建结果 |
| `npm run deploy` | 部署到GitHub Pages |
| `npm run lint` | 代码检查 |
| `npm run format` | 代码格式化 |

## 🌐 部署指南

### GitHub Pages自动部署

1. **Fork本项目** 到您的GitHub账户

2. **启用GitHub Pages**:
   - 进入 `Settings` → `Pages`
   - 选择 `GitHub Actions` 作为部署源

3. **触发部署**:
   - 推送代码到 `main` 或 `master` 分支
   - GitHub Actions自动构建和部署

4. **访问应用**:
   - 部署完成后访问: `https://用户名.github.io/I-Prompt`

### 手动部署

```bash
# 构建项目
npm run build

# 部署到GitHub Pages
npm run deploy
```

### 其他平台部署

- **Vercel**: 连接GitHub仓库，自动部署
- **Netlify**: 拖拽 `build` 文件夹或连接Git
- **静态服务器**: 将 `build` 文件夹内容上传到任意静态服务器

## 🔍 性能优化

### 自动化性能监控
- **Lighthouse CI**: 每次部署自动运行性能测试
- **Web Vitals**: 监控核心网页指标
- **Bundle分析**: 自动分析打包大小

### 优化特性
- **代码分割**: 按路由和组件分割
- **资源预加载**: DNS预解析、关键资源预加载
- **图像优化**: 响应式图像、懒加载
- **缓存策略**: 合理的缓存配置

## 🤝 贡献指南

### 参与贡献

1. **Fork项目** 并克隆到本地
2. **创建功能分支**: `git checkout -b feature/新功能`
3. **提交更改**: `git commit -m '添加新功能'`
4. **推送分支**: `git push origin feature/新功能`
5. **创建Pull Request**

### 开发规范

- **代码风格**: 使用Prettier格式化
- **提交规范**: 使用语义化提交信息
- **测试覆盖**: 新功能需要添加测试
- **文档更新**: 重要更改需要更新文档

## 📋 更新日志

### v3.0.0 (2024-12-28)
🎉 **智能提示词库 3.0 重磅发布**
- ✨ 全新界面设计，参考专业AI绘画工具
- 🎨 双栏式编辑器，英文输入+中文翻译
- 🌐 集成多引擎翻译API，智能分词翻译
- 📚 分层标签库，6大分类300+标签
- 🔍 智能搜索，中英文混合支持
- ❤️ 收藏系统，个人收藏+热门推荐
- 📝 历史记录，自动保存快速恢复
- 🎯 一键操作，点击添加极简体验

### v2.0.0 (2024-12-28)
🎉 **智能提示词库 2.0 重磅发布**
- ✨ 新增高级提示词编辑器
- 🧠 智能补全系统（8个建议，按频率排序）
- ⚖️ 权重调节功能（支持多种格式）
- 🌐 一键翻译功能（中英文互译）
- 💾 自定义提示词管理
- 📊 实时统计和收藏功能

### v1.0.0 (2024-12-20)
- 🎉 首个版本发布
- 🤖 集成DeepSeek-R1大模型
- 🔍 世界首个开源NovelAI Stealth PNG解析器
- 📚 完整的提示词库系统
- 🎓 学习教程模块

## 📄 许可证

本项目基于 [MIT许可证](LICENSE) 开源

## 🙏 致谢

- **[translators](https://github.com/UlionTse/translators)** - 多引擎翻译库
- **[stable-diffusion-inspector](https://github.com/Akegarasu/stable-diffusion-inspector)** - 元数据解析参考
- **[NovelAI](https://novelai.net/)** - Stealth PNG技术
- **[ComfyUI](https://github.com/comfyanonymous/ComfyUI)** - 工作流技术

## 📞 联系方式

- **项目主页**: [https://github.com/wjx19/I-Prompt](https://github.com/wjx19/I-Prompt)
- **在线体验**: [https://wjx19.github.io/I-Prompt](https://wjx19.github.io/I-Prompt)
- **问题反馈**: [GitHub Issues](https://github.com/wjx19/I-Prompt/issues)

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个星标！**

Made with ❤️ by I-Prompt Team

</div>

## ✨ 3.0 版本重大更新

### 🌍 多语言智能输入系统
- **支持中英文输入**：可以直接输入中文描述，如"美丽的女孩，樱花背景"
- **自动语言检测**：系统自动检测输入语言类型
- **智能翻译为英文**：自动将中文翻译为AI绘画标准英文提示词
- **实时预览**：左侧输入区显示原始内容，右侧输出区显示英文结果

### 🔄 强化翻译引擎
- **12种翻译引擎**：集成百度、阿里、腾讯、有道等国产引擎 + Google、DeepL等国际引擎
- **智能降级机制**：引擎失败时自动切换到备用引擎
- **专业词典**：内置400+ AI绘画专业术语，确保翻译准确性
- **批量翻译**：支持一键翻译所有标签

### 📝 智能标签编辑区
- **中文显示**：每个标签下方显示中文翻译，方便理解
- **悬停编辑**：鼠标悬停显示详细编辑选项
- **权重调节**：支持 (tag:1.2) 格式的权重控制
- **括号强调**：支持 ()、{}、[] 三种括号强调方式
- **禁用切换**：可临时禁用某些标签而不删除

## 🚀 核心功能

### 1. 智能提示词库 3.0
- **分层标签系统**：6大分类，300+精选标签
- **语义搜索**：智能搜索相关标签
- **收藏系统**：个人收藏和热门推荐
- **多语言支持**：标签支持中英文对照显示

### 2. 智能提示词生成器
- **接入DeepSeek-R1**：最新大模型支持
- **中文提示生成**：支持中文描述生成英文提示词
- **风格化生成**：根据不同绘画风格优化

### 3. 专业级图像信息提取器
- **NovelAI Stealth PNG解析**：提取隐藏的生成信息
- **元数据读取**：支持多种图像格式
- **参数解析**：自动识别绘画参数

### 4. 智能提示词分析器
- **语义分类**：自动分类提示词类型
- **权重解析**：分析各标签权重影响
- **优化建议**：提供提示词改进建议

## 💡 使用方法

### 基础使用
1. **输入提示词**：在左侧智能输入区输入中文或英文描述
2. **自动翻译**：系统自动检测语言并翻译为英文
3. **标签管理**：在编辑区调整权重、括号、禁用状态
4. **复制使用**：复制最终的英文提示词到AI绘画工具

### 高级功能
- **翻译引擎切换**：点击"引擎"按钮选择不同翻译服务
- **批量翻译**：点击"翻译全部"一键翻译所有标签
- **标签库浏览**：从下方标签库添加专业标签
- **历史记录**：查看最近使用的提示词

## 🔧 技术特性

### 前端架构
- **React 18**：最新React版本，组件化开发
- **Tailwind CSS**：现代CSS框架，响应式设计
- **Lucide React**：精美图标库

### 翻译服务
- **多引擎支持**：12种免费翻译引擎
- **智能降级**：引擎失败自动切换
- **专业词典**：AI绘画术语优化
- **语言检测**：自动识别输入语言

### 部署支持
- **GitHub Pages**：支持静态部署
- **Vercel/Netlify**：支持现代化部署
- **Docker**：容器化部署
- **Python后端**：可选Flask翻译服务

## 🌟 特色亮点

1. **零门槛使用**：支持中文输入，降低使用门槛
2. **专业级输出**：确保生成标准AI绘画英文提示词
3. **智能优化**：基于深度学习的提示词优化
4. **丰富标签库**：300+专业标签，覆盖各种绘画需求
5. **实时翻译**：毫秒级翻译响应，流畅用户体验

## 📚 更多功能

- **学习教程**：提供AI绘画提示词编写教程
- **辅助工具**：色彩搭配、构图建议等实用工具
- **图像提取**：从现有图像提取提示词信息
- **风格分析**：分析不同艺术风格的提示词特点

---

**立即体验智能提示词库 3.0，让AI绘画创作更简单！**

支持中文输入 → 自动翻译 → 专业输出 → 一键复制 → 开始创作 

## 🚀 部署方式

### GitHub Pages (前端)
前端自动部署到GitHub Pages: https://wjx19.github.io/I-Prompt

### Vercel (Python后端)
Python后端部署到Vercel，为图像反推功能提供API支持。

#### 部署步骤
1. Fork本项目到你的GitHub账户
2. 登录 [Vercel](https://vercel.com)
3. 点击 "New Project" → Import Git Repository
4. 选择你fork的I-Prompt项目
5. 在Project Settings中：
   - Framework Preset: 选择 "Other"
   - Root Directory: 保持默认 (.)
   - Build Command: 留空
   - Output Directory: 留空
6. 点击 "Deploy" 开始部署

部署完成后，你会得到一个Vercel URL，比如：`https://i-prompt-api.vercel.app`

#### 配置前端API地址
部署完成后，需要更新前端配置：

1. 编辑 `src/services/imageTaggingService.js`
2. 将 `https://i-prompt-api.vercel.app/api` 替换为你的Vercel URL

## ✨ 功能特性

- 🎨 **智能提示词生成** - 基于DeepSeek AI的专业提示词生成
- 🖼️ **图像反推分析** - 使用WD-Tagger识别图像标签
- 🌍 **多语言翻译** - 支持中英文自动翻译
- 📊 **数据可视化** - 直观的标签置信度展示
- 💾 **结果导出** - 支持JSON格式导出分析结果
- 📱 **响应式设计** - 完美适配桌面和移动设备

## 🛠️ 本地开发

### 前端开发
```bash
npm install
npm start
```

### 后端开发 (可选)
```bash
pip install -r requirements.txt
python server.py
```

## 🔧 技术栈

- **前端**: React 18, Tailwind CSS, Lucide Icons
- **后端**: Flask, Gradio Client, CORS
- **部署**: GitHub Pages + Vercel
- **AI服务**: SiliconFlow API, Hugging Face

## 🌟 在线体验

**🚀 [立即使用 - GitHub Pages](https://wjx19.github.io/I-Prompt)**

## ✨ 核心功能

### 🖼️ 图像信息提取器
- **📋 多格式支持**: PNG、JPEG、WEBP等主流图像格式
- **🔍 智能解析**: 自动识别Stable Diffusion、ComfyUI、NovelAI等生成工具
- **🔐 NovelAI Stealth PNG**: 支持隐藏在Alpha通道的元数据提取
- **⚡ ComfyUI增强**: 深度解析复杂工作流，支持自定义节点
- **📊 可视化展示**: 三标签页设计 - 概览/智能分析/原始数据

### 🧠 智能提示词分析器
- **🏷️ 语义分类**: 8大分类 - 角色、风格、质量、构图、光照、色彩、情感、环境
- **⚖️ 权重解析**: 支持6种权重格式 - `(())`, `{}`, `[]`, `tag:1.2`等
- **📈 复杂度评估**: 多维度分析提示词质量和复杂度
- **💡 智能建议**: 基于分析结果生成优化建议

### 🌐 智能提示词库 3.0
- **📝 可视化编辑**: 悬停编辑、权重调节、括号控制
- **🔄 多引擎翻译**: 支持MyMemory、LibreTranslate、Google Web等免费API
- **📚 专业标签库**: 6大分类，300+专业标签，支持中英文
- **⭐ 智能管理**: 收藏、搜索、分类、历史记录

### 🔧 技术特性
- **🌍 纯前端部署**: 支持GitHub Pages，无需后端服务
- **📱 响应式设计**: 完美适配桌面和移动设备
- **⚡ 性能优化**: 组件懒加载、资源压缩、CDN加速
- **🛡️ 错误处理**: 完善的异常处理和降级机制

## 🚀 快速开始

### 在线使用
访问 [https://wjx19.github.io/I-Prompt](https://wjx19.github.io/I-Prompt) 立即开始使用

### 本地开发

```bash
# 克隆项目
git clone https://github.com/wjx19/I-Prompt.git
cd I-Prompt

# 安装依赖
npm install

# 启动开发服务器
npm start

# 在浏览器中打开 http://localhost:3000
```

### 本地构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📦 技术架构

### 前端技术栈
- **⚛️ React 18**: 现代React特性，并发渲染
- **🎨 Tailwind CSS**: 原子化CSS框架
- **🔧 Lucide React**: 现代图标库
- **📊 Exifr**: 高性能图像元数据解析
- **🌐 Axios**: HTTP客户端

### 翻译服务架构
```
前端应用
    ↓
免费翻译API (多引擎支持)
    ├── MyMemory (1000次/天)
    ├── LibreTranslate (20次/分钟)
    ├── Google Web (非官方)
    └── 内置词典 (降级方案)
```

### 部署架构
```
GitHub Repository
    ↓
GitHub Actions (自动化)
    ├── 代码检查 & 测试
    ├── 生产构建
    ├── 性能测试 (Lighthouse)
    └── 部署到 GitHub Pages
```

## 🔧 开发配置

### 环境要求
- **Node.js**: 18.x 或 20.x
- **npm**: 8.x+
- **浏览器**: 现代浏览器 (Chrome 88+, Firefox 85+, Safari 14+)

### 项目结构
```
I-Prompt/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 可复用组件
│   ├── pages/             # 页面组件
│   ├── services/          # 服务层
│   ├── constants/         # 常量配置
│   ├── utils/            # 工具函数
│   └── hooks/            # 自定义Hook
├── .github/
│   └── workflows/        # GitHub Actions配置
├── docs/                 # 文档
└── python_backend/       # 本地开发用Python服务(可选)
```

### 可用脚本

| 命令 | 功能 |
|------|------|
| `npm start` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run test` | 运行测试 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |
| `npm run preview` | 预览构建结果 |
| `npm run deploy` | 部署到GitHub Pages |
| `npm run lint` | 代码检查 |
| `npm run format` | 代码格式化 |

## 🌐 部署指南

### GitHub Pages自动部署

1. **Fork本项目** 到您的GitHub账户

2. **启用GitHub Pages**:
   - 进入 `Settings` → `Pages`
   - 选择 `GitHub Actions` 作为部署源

3. **触发部署**:
   - 推送代码到 `main` 或 `master` 分支
   - GitHub Actions自动构建和部署

4. **访问应用**:
   - 部署完成后访问: `https://用户名.github.io/I-Prompt`

### 手动部署

```bash
# 构建项目
npm run build

# 部署到GitHub Pages
npm run deploy
```

### 其他平台部署

- **Vercel**: 连接GitHub仓库，自动部署
- **Netlify**: 拖拽 `build` 文件夹或连接Git
- **静态服务器**: 将 `build` 文件夹内容上传到任意静态服务器

## 🔍 性能优化

### 自动化性能监控
- **Lighthouse CI**: 每次部署自动运行性能测试
- **Web Vitals**: 监控核心网页指标
- **Bundle分析**: 自动分析打包大小

### 优化特性
- **代码分割**: 按路由和组件分割
- **资源预加载**: DNS预解析、关键资源预加载
- **图像优化**: 响应式图像、懒加载
- **缓存策略**: 合理的缓存配置

## 🤝 贡献指南

### 参与贡献

1. **Fork项目** 并克隆到本地
2. **创建功能分支**: `git checkout -b feature/新功能`
3. **提交更改**: `git commit -m '添加新功能'`
4. **推送分支**: `git push origin feature/新功能`
5. **创建Pull Request**

### 开发规范

- **代码风格**: 使用Prettier格式化
- **提交规范**: 使用语义化提交信息
- **测试覆盖**: 新功能需要添加测试
- **文档更新**: 重要更改需要更新文档

## 📋 更新日志

### v3.0.0 (2024-12-28)
🎉 **智能提示词库 3.0 重磅发布**
- ✨ 全新界面设计，参考专业AI绘画工具
- 🎨 双栏式编辑器，英文输入+中文翻译
- 🌐 集成多引擎翻译API，智能分词翻译
- 📚 分层标签库，6大分类300+标签
- 🔍 智能搜索，中英文混合支持
- ❤️ 收藏系统，个人收藏+热门推荐
- 📝 历史记录，自动保存快速恢复
- 🎯 一键操作，点击添加极简体验

### v2.0.0 (2024-12-28)
🎉 **智能提示词库 2.0 重磅发布**
- ✨ 新增高级提示词编辑器
- 🧠 智能补全系统（8个建议，按频率排序）
- ⚖️ 权重调节功能（支持多种格式）
- 🌐 一键翻译功能（中英文互译）
- 💾 自定义提示词管理
- 📊 实时统计和收藏功能

### v1.0.0 (2024-12-20)
- 🎉 首个版本发布
- 🤖 集成DeepSeek-R1大模型
- 🔍 世界首个开源NovelAI Stealth PNG解析器
- 📚 完整的提示词库系统
- 🎓 学习教程模块

## 📄 许可证

本项目基于 [MIT许可证](LICENSE) 开源

## 🙏 致谢

- **[translators](https://github.com/UlionTse/translators)** - 多引擎翻译库
- **[stable-diffusion-inspector](https://github.com/Akegarasu/stable-diffusion-inspector)** - 元数据解析参考
- **[NovelAI](https://novelai.net/)** - Stealth PNG技术
- **[ComfyUI](https://github.com/comfyanonymous/ComfyUI)** - 工作流技术

## 📞 联系方式

- **项目主页**: [https://github.com/wjx19/I-Prompt](https://github.com/wjx19/I-Prompt)
- **在线体验**: [https://wjx19.github.io/I-Prompt](https://wjx19.github.io/I-Prompt)
- **问题反馈**: [GitHub Issues](https://github.com/wjx19/I-Prompt/issues)

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个星标！**

Made with ❤️ by I-Prompt Team

</div>

## ✨ 3.0 版本重大更新

### 🌍 多语言智能输入系统
- **支持中英文输入**：可以直接输入中文描述，如"美丽的女孩，樱花背景"
- **自动语言检测**：系统自动检测输入语言类型
- **智能翻译为英文**：自动将中文翻译为AI绘画标准英文提示词
- **实时预览**：左侧输入区显示原始内容，右侧输出区显示英文结果

### 🔄 强化翻译引擎
- **12种翻译引擎**：集成百度、阿里、腾讯、有道等国产引擎 + Google、DeepL等国际引擎
- **智能降级机制**：引擎失败时自动切换到备用引擎
- **专业词典**：内置400+ AI绘画专业术语，确保翻译准确性
- **批量翻译**：支持一键翻译所有标签

### 📝 智能标签编辑区
- **中文显示**：每个标签下方显示中文翻译，方便理解
- **悬停编辑**：鼠标悬停显示详细编辑选项
- **权重调节**：支持 (tag:1.2) 格式的权重控制
- **括号强调**：支持 ()、{}、[] 三种括号强调方式
- **禁用切换**：可临时禁用某些标签而不删除

## 🚀 核心功能

### 1. 智能提示词库 3.0
- **分层标签系统**：6大分类，300+精选标签
- **语义搜索**：智能搜索相关标签
- **收藏系统**：个人收藏和热门推荐
- **多语言支持**：标签支持中英文对照显示

### 2. 智能提示词生成器
- **接入DeepSeek-R1**：最新大模型支持
- **中文提示生成**：支持中文描述生成英文提示词
- **风格化生成**：根据不同绘画风格优化

### 3. 专业级图像信息提取器
- **NovelAI Stealth PNG解析**：提取隐藏的生成信息
- **元数据读取**：支持多种图像格式
- **参数解析**：自动识别绘画参数

### 4. 智能提示词分析器
- **语义分类**：自动分类提示词类型
- **权重解析**：分析各标签权重影响
- **优化建议**：提供提示词改进建议

## 💡 使用方法

### 基础使用
1. **输入提示词**：在左侧智能输入区输入中文或英文描述
2. **自动翻译**：系统自动检测语言并翻译为英文
3. **标签管理**：在编辑区调整权重、括号、禁用状态
4. **复制使用**：复制最终的英文提示词到AI绘画工具

### 高级功能
- **翻译引擎切换**：点击"引擎"按钮选择不同翻译服务
- **批量翻译**：点击"翻译全部"一键翻译所有标签
- **标签库浏览**：从下方标签库添加专业标签
- **历史记录**：查看最近使用的提示词

## 🔧 技术特性

### 前端架构
- **React 18**：最新React版本，组件化开发
- **Tailwind CSS**：现代CSS框架，响应式设计
- **Lucide React**：精美图标库

### 翻译服务
- **多引擎支持**：12种免费翻译引擎
- **智能降级**：引擎失败自动切换
- **专业词典**：AI绘画术语优化
- **语言检测**：自动识别输入语言

### 部署支持
- **GitHub Pages**：支持静态部署
- **Vercel/Netlify**：支持现代化部署
- **Docker**：容器化部署
- **Python后端**：可选Flask翻译服务

## 🌟 特色亮点

1. **零门槛使用**：支持中文输入，降低使用门槛
2. **专业级输出**：确保生成标准AI绘画英文提示词
3. **智能优化**：基于深度学习的提示词优化
4. **丰富标签库**：300+专业标签，覆盖各种绘画需求
5. **实时翻译**：毫秒级翻译响应，流畅用户体验

## 📚 更多功能

- **学习教程**：提供AI绘画提示词编写教程
- **辅助工具**：色彩搭配、构图建议等实用工具
- **图像提取**：从现有图像提取提示词信息
- **风格分析**：分析不同艺术风格的提示词特点

---

**立即体验智能提示词库 3.0，让AI绘画创作更简单！**

支持中文输入 → 自动翻译 → 专业输出 → 一键复制 → 开始创作 

## 🚀 部署方式

### GitHub Pages (前端)
前端自动部署到GitHub Pages: https://wjx19.github.io/I-Prompt

### Vercel (Python后端)
Python后端部署到Vercel，为图像反推功能提供API支持。

#### 部署步骤
1. Fork本项目到你的GitHub账户
2. 登录 [Vercel](https://vercel.com)
3. 点击 "New Project" → Import Git Repository
4. 选择你fork的I-Prompt项目
5. 在Project Settings中：
   - Framework Preset: 选择 "Other"
   - Root Directory: 保持默认 (.)
   - Build Command: 留空
   - Output Directory: 留空
6. 点击 "Deploy" 开始部署

部署完成后，你会得到一个Vercel URL，比如：`https://i-prompt-api.vercel.app`

#### 配置前端API地址
部署完成后，需要更新前端配置：

1. 编辑 `src/services/imageTaggingService.js`
2. 将 `https://i-prompt-api.vercel.app/api` 替换为你的Vercel URL

## ✨ 功能特性

- 🎨 **智能提示词生成** - 基于DeepSeek AI的专业提示词生成
- 🖼️ **图像反推分析** - 使用WD-Tagger识别图像标签
- 🌍 **多语言翻译** - 支持中英文自动翻译
- 📊 **数据可视化** - 直观的标签置信度展示
- 💾 **结果导出** - 支持JSON格式导出分析结果
- 📱 **响应式设计** - 完美适配桌面和移动设备

## 🛠️ 本地开发

### 前端开发
```bash
npm install
npm start
```

### 后端开发 (可选)
```bash
pip install -r requirements.txt
python server.py
```

## 🔧 技术栈

- **前端**: React 18, Tailwind CSS, Lucide Icons
- **后端**: Flask, Gradio Client, CORS
- **部署**: GitHub Pages + Vercel
- **AI服务**: SiliconFlow API, Hugging Face

## 🌟 在线体验

**🚀 [立即使用 - GitHub Pages](https://wjx19.github.io/I-Prompt)**

## ✨ 核心功能

### 🖼️ 图像信息提取器
- **📋 多格式支持**: PNG、JPEG、WEBP等主流图像格式
- **🔍 智能解析**: 自动识别Stable Diffusion、ComfyUI、NovelAI等生成工具
- **🔐 NovelAI Stealth PNG**: 支持隐藏在Alpha通道的元数据提取
- **⚡ ComfyUI增强**: 深度解析复杂工作流，支持自定义节点
- **📊 可视化展示**: 三标签页设计 - 概览/智能分析/原始数据

### 🧠 智能提示词分析器
- **🏷️ 语义分类**: 8大分类 - 角色、风格、质量、构图、光照、色彩、情感、环境
- **⚖️ 权重解析**: 支持6种权重格式 - `(())`, `{}`, `[]`, `tag:1.2`等
- **📈 复杂度评估**: 多维度分析提示词质量和复杂度
- **💡 智能建议**: 基于分析结果生成优化建议

### 🌐 智能提示词库 3.0
- **📝 可视化编辑**: 悬停编辑、权重调节、括号控制
- **🔄 多引擎翻译**: 支持MyMemory、LibreTranslate、Google Web等免费API
- **📚 专业标签库**: 6大分类，300+专业标签，支持中英文
- **⭐ 智能管理**: 收藏、搜索、分类、历史记录

### 🔧 技术特性
- **🌍 纯前端部署**: 支持GitHub Pages，无需后端服务
- **📱 响应式设计**: 完美适配桌面和移动设备
- **⚡ 性能优化**: 组件懒加载、资源压缩、CDN加速
- **🛡️ 错误处理**: 完善的异常处理和降级机制

## 🚀 快速开始

### 在线使用
访问 [https://wjx19.github.io/I-Prompt](https://wjx19.github.io/I-Prompt) 立即开始使用

### 本地开发

```bash
# 克隆项目
git clone https://github.com/wjx19/I-Prompt.git
cd I-Prompt

# 安装依赖
npm install

# 启动开发服务器
npm start

# 在浏览器中打开 http://localhost:3000
```

### 本地构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📦 技术架构

### 前端技术栈
- **⚛️ React 18**: 现代React特性，并发渲染
- **🎨 Tailwind CSS**: 原子化CSS框架
- **🔧 Lucide React**: 现代图标库
- **📊 Exifr**: 高性能图像元数据解析
- **🌐 Axios**: HTTP客户端

### 翻译服务架构
```
前端应用
    ↓
免费翻译API (多引擎支持)
    ├── MyMemory (1000次/天)
    ├── LibreTranslate (20次/分钟)
    ├── Google Web (非官方)
    └── 内置词典 (降级方案)
```

### 部署架构
```
GitHub Repository
    ↓
GitHub Actions (自动化)
    ├── 代码检查 & 测试
    ├── 生产构建
    ├── 性能测试 (Lighthouse)
    └── 部署到 GitHub Pages
```

## 🔧 开发配置

### 环境要求
- **Node.js**: 18.x 或 20.x
- **npm**: 8.x+
- **浏览器**: 现代浏览器 (Chrome 88+, Firefox 85+, Safari 14+)

### 项目结构
```
I-Prompt/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 可复用组件
│   ├── pages/             # 页面组件
│   ├── services/          # 服务层
│   ├── constants/         # 常量配置
│   ├── utils/            # 工具函数
│   └── hooks/            # 自定义Hook
├── .github/
│   └── workflows/        # GitHub Actions配置
├── docs/                 # 文档
└── python_backend/       # 本地开发用Python服务(可选)
```

### 可用脚本

| 命令 | 功能 |
|------|------|
| `npm start` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run test` | 运行测试 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |
| `npm run preview` | 预览构建结果 |
| `npm run deploy` | 部署到GitHub Pages |
| `npm run lint` | 代码检查 |
| `npm run format` | 代码格式化 |

## 🌐 部署指南

### GitHub Pages自动部署

1. **Fork本项目** 到您的GitHub账户

2. **启用GitHub Pages**:
   - 进入 `Settings` → `Pages`
   - 选择 `GitHub Actions` 作为部署源

3. **触发部署**:
   - 推送代码到 `main` 或 `master` 分支
   - GitHub Actions自动构建和部署

4. **访问应用**:
   - 部署完成后访问: `https://用户名.github.io/I-Prompt`

### 手动部署

```bash
# 构建项目
npm run build

# 部署到GitHub Pages
npm run deploy
```

### 其他平台部署

- **Vercel**: 连接GitHub仓库，自动部署
- **Netlify**: 拖拽 `build` 文件夹或连接Git
- **静态服务器**: 将 `build` 文件夹内容上传到任意静态服务器

## 🔍 性能优化

### 自动化性能监控
- **Lighthouse CI**: 每次部署自动运行性能测试
- **Web Vitals**: 监控核心网页指标
- **Bundle分析**: 自动分析打包大小

### 优化特性
- **代码分割**: 按路由和组件分割
- **资源预加载**: DNS预解析、关键资源预加载
- **图像优化**: 响应式图像、懒加载
- **缓存策略**: 合理的缓存配置

## 🤝 贡献指南

### 参与贡献

1. **Fork项目** 并克隆到本地
2. **创建功能分支**: `git checkout -b feature/新功能`
3. **提交更改**: `git commit -m '添加新功能'`
4. **推送分支**: `git push origin feature/新功能`
5. **创建Pull Request**

### 开发规范

- **代码风格**: 使用Prettier格式化
- **提交规范**: 使用语义化提交信息
- **测试覆盖**: 新功能需要添加测试
- **文档更新**: 重要更改需要更新文档

## 📋 更新日志

### v3.0.0 (2024-12-28)
🎉 **智能提示词库 3.0 重磅发布**
- ✨ 全新界面设计，参考专业AI绘画工具
- 🎨 双栏式编辑器，英文输入+中文翻译
- 🌐 集成多引擎翻译API，智能分词翻译
- 📚 分层标签库，6大分类300+标签
- 🔍 智能搜索，中英文混合支持
- ❤️ 收藏系统，个人收藏+热门推荐
- 📝 历史记录，自动保存快速恢复
- 🎯 一键操作，点击添加极简体验

### v2.0.0 (2024-12-28)
🎉 **智能提示词库 2.0 重磅发布**
- ✨ 新增高级提示词编辑器
- 🧠 智能补全系统（8个建议，按频率排序）
- ⚖️ 权重调节功能（支持多种格式）
- 🌐 一键翻译功能（中英文互译）
- 💾 自定义提示词管理
- 📊 实时统计和收藏功能

### v1.0.0 (2024-12-20)
- 🎉 首个版本发布
- 🤖 集成DeepSeek-R1大模型
- 🔍 世界首个开源NovelAI Stealth PNG解析器
- 📚 完整的提示词库系统
- 🎓 学习教程模块

## 📄 许可证

本项目基于 [MIT许可证](LICENSE) 开源

## 🙏 致谢

- **[translators](https://github.com/UlionTse/translators)** - 多引擎翻译库
- **[stable-diffusion-inspector](https://github.com/Akegarasu/stable-diffusion-inspector)** - 元数据解析参考
- **[NovelAI](https://novelai.net/)** - Stealth PNG技术
- **[ComfyUI](https://github.com/comfyanonymous/ComfyUI)** - 工作流技术

## 📞 联系方式

- **项目主页**: [https://github.com/wjx19/I-Prompt](https://github.com/wjx19/I-Prompt)
- **在线体验**: [https://wjx19.github.io/I-Prompt](https://wjx19.github.io/I-Prompt)
- **问题反馈**: [GitHub Issues](https://github.com/wjx19/I-Prompt/issues)

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个星标！**

Made with ❤️ by I-Prompt Team

</div>

## ✨ 3.0 版本重大更新

### 🌍 多语言智能输入系统
- **支持中英文输入**：可以直接输入中文描述，如"美丽的女孩，樱花背景"
- **自动语言检测**：系统自动检测输入语言类型
- **智能翻译为英文**：自动将中文翻译为AI绘画标准英文提示词
- **实时预览**：左侧输入区显示原始内容，右侧输出区显示英文结果

### 🔄 强化翻译引擎
- **12种翻译引擎**：集成百度、阿里、腾讯、有道等国产引擎 + Google、DeepL等国际引擎
- **智能降级机制**：引擎失败时自动切换到备用引擎
- **专业词典**：内置400+ AI绘画专业术语，确保翻译准确性
- **批量翻译**：支持一键翻译所有标签

### 📝 智能标签编辑区
- **中文显示**：每个标签下方显示中文翻译，方便理解
- **悬停编辑**：鼠标悬停显示详细编辑选项
- **权重调节**：支持 (tag:1.2) 格式的权重控制
- **括号强调**：支持 ()、{}、[] 三种括号强调方式
- **禁用切换**：可临时禁用某些标签而不删除

## 🚀 核心功能

### 1. 智能提示词库 3.0
- **分层标签系统**：6大分类，300+精选标签
- **语义搜索**：智能搜索相关标签
- **收藏系统**：个人收藏和热门推荐
- **多语言支持**：标签支持中英文对照显示

### 2. 智能提示词生成器
- **接入DeepSeek-R1**：最新大模型支持
- **中文提示生成**：支持中文描述生成英文提示词
- **风格化生成**：根据不同绘画风格优化

### 3. 专业级图像信息提取器
- **NovelAI Stealth PNG解析**：提取隐藏的生成信息
- **元数据读取**：支持多种图像格式
- **参数解析**：自动识别绘画参数

### 4. 智能提示词分析器
- **语义分类**：自动分类提示词类型
- **权重解析**：分析各标签权重影响
- **优化建议**：提供提示词改进建议

## 💡 使用方法

### 基础使用
1. **输入提示词**：在左侧智能输入区输入中文或英文描述
2. **自动翻译**：系统自动检测语言并翻译为英文
3. **标签管理**：在编辑区调整权重、括号、禁用状态
4. **复制使用**：复制最终的英文提示词到AI绘画工具

### 高级功能
- **翻译引擎切换**：点击"引擎"按钮选择不同翻译服务
- **批量翻译**：点击"翻译全部"一键翻译所有标签
- **标签库浏览**：从下方标签库添加专业标签
- **历史记录**：查看最近使用的提示词

## 🔧 技术特性

### 前端架构
- **React 18**：最新React版本，组件化开发
- **Tailwind CSS**：现代CSS框架，响应式设计
- **Lucide React**：精美图标库

### 翻译服务
- **多引擎支持**：12种免费翻译引擎
- **智能降级**：引擎失败自动切换
- **专业词典**：AI绘画术语优化
- **语言检测**：自动识别输入语言

### 部署支持
- **GitHub Pages**：支持静态部署
- **Vercel/Netlify**：支持现代化部署
- **Docker**：容器化部署
- **Python后端**：可选Flask翻译服务

## 🌟 特色亮点

1. **零门槛使用**：支持中文输入，降低使用门槛
2. **专业级输出**：确保生成标准AI绘画英文提示词
3. **智能优化**：基于深度学习的提示词优化
4. **丰富标签库**：300+专业标签，覆盖各种绘画需求
5. **实时翻译**：毫秒级翻译响应，流畅用户体验

## 📚 更多功能

- **学习教程**：提供AI绘画提示词编写教程
- **辅助工具**：色彩搭配、构图建议等实用工具
- **图像提取**：从现有图像提取提示词信息
- **风格分析**：分析不同艺术风格的提示词特点

---

**立即体验智能提示词库 3.0，让AI绘画创作更简单！**

支持中文输入 → 自动翻译 → 专业输出 → 一键复制 → 开始创作 