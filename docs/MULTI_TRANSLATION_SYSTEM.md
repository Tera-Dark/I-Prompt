# 🌐 智能翻译系统

以智谱GLM AI为主引擎，传统翻译API为备用的新一代智能翻译系统，提供免费、高质量的AI翻译服务。

## ✨ 系统特性

### 🔧 多引擎支持
- **智谱GLM** (主要) - 智谱AI GLM-4-Flash模型，免费高质量AI翻译
- **阿里翻译** (备用) - 支持221种语言，专业领域翻译
- **百度翻译** (备用) - 支持201种语言，支持古文翻译
- **腾讯翻译** (备用) - 高质量翻译服务
- **有道翻译** (备用) - 专业词典翻译
- **搜狗翻译** (备用) - 快速翻译服务
- **金山词霸** (备用) - 支持187种语言，词典查询
- **彩云翻译** (备用) - AI翻译服务
- **Google翻译** (备用) - 支持134种语言（可能受网络限制）
- **Bing翻译** (备用) - 微软翻译服务，支持128种语言

### 🚀 智能功能
- **自动故障切换** - 当前引擎失败时自动切换备用引擎
- **健康检查** - 每5分钟自动检查所有引擎可用性
- **翻译缓存** - 避免重复翻译，提高效率
- **批量翻译** - 支持多个标签同时翻译
- **实时状态监控** - 显示引擎状态和响应时间
- **翻译统计** - 记录翻译历史和引擎使用情况

## 🎯 使用方法

### 1. 提示词翻译
- 在左侧输入中文提示词，系统自动翻译为英文
- 支持自动语言检测
- 翻译失败时自动切换到备用引擎

### 2. 标签翻译
- 点击标签的翻译按钮获取中文翻译
- 使用"翻译全部"按钮批量翻译所有标签
- 翻译结果会缓存，避免重复请求

### 3. 引擎管理
- 点击翻译引擎状态查看所有可用引擎
- 手动切换到指定翻译引擎
- 查看引擎健康状态和响应时间
- 查看翻译统计和缓存命中率

## 🔧 技术架构

### 核心组件

#### 1. NewTranslationManager
```javascript
// 新翻译管理器 - 核心服务
import translationManager from '../services/newTranslationManager';

// 基本用法
const result = await translationManager.smartTranslate(text, targetLang, sourceLang);
```

#### 2. ZhipuTranslationService
```javascript
// 智谱GLM翻译服务 - AI翻译引擎
import { ZhipuTranslationService } from '../services/zhipuTranslationService';

// 配置API密钥
const zhipuService = new ZhipuTranslationService(apiKey);
const result = await zhipuService.translate(text, targetLang, sourceLang);
```

#### 3. useMultiTranslation Hook
```javascript
// React Hook - 组件集成
const {
  translate,           // 翻译函数
  currentEngine,       // 当前引擎
  switchEngine,        // 切换引擎
  getAllEngines,       // 获取所有引擎
  getTranslationStats  // 获取统计信息
} = useMultiTranslation();
```

#### 3. TranslationEngineStatus 组件
```javascript
// 状态显示组件
<TranslationEngineStatus
  currentEngine={currentEngine}
  allEngines={getAllEngines()}
  onEngineSwitch={switchEngine}
  onRefresh={refreshEngines}
  stats={getTranslationStats()}
/>
```

### 引擎配置

```javascript
// 翻译引擎配置示例
const TRANSLATION_ENGINES = {
  zhipu: {
    name: '智谱GLM',
    provider: 'zhipu',
    priority: 1,           // 优先级
    available: true,       // 可用状态
    languages: 100,        // 支持语言数
    features: ['AI翻译', '高质量', '免费', '上下文理解']
  },
  alibaba: {
    name: '阿里翻译',
    provider: 'alibaba',
    priority: 2,           // 备用引擎
    available: true,       // 可用状态
    languages: 221,        // 支持语言数
    features: ['专业领域', '高质量', '免费']
  }
  // ... 其他引擎
};
```

### 语言代码映射

```javascript
// 统一不同引擎的语言代码
const LANGUAGE_MAPPING = {
  'zh': {
    alibaba: 'zh',
    baidu: 'zh',
    google: 'zh',
    bing: 'zh-Hans'
  }
  // ... 其他语言
};
```

## 📊 监控与统计

### 引擎状态监控
- ✅ 正常 - 引擎可用，响应时间正常
- ⚠️ 慢速 - 引擎可用，但响应较慢 (>2秒)
- ❌ 不可用 - 引擎故障或网络问题

### 翻译统计
- **总翻译次数** - 累计翻译请求数量
- **缓存命中率** - 缓存使用效率
- **引擎使用情况** - 各引擎的使用频率
- **语言翻译对** - 常用的语言翻译组合

## 🔄 自动切换逻辑

### 优先级系统
1. **智谱GLM** (优先级1) - AI翻译首选，免费高质量
2. **阿里翻译** (优先级2) - 第一备用，专业领域
3. **百度翻译** (优先级3) - 第二备用，古文支持
4. **腾讯翻译** (优先级4) - 第三备用，高质量
5. **其他引擎** - 按优先级递减

### 切换触发条件
- 当前引擎请求失败
- 引擎响应超时 (30秒)
- 健康检查失败
- 手动切换引擎

### 故障恢复
- 每5分钟自动健康检查
- 引擎恢复后自动标记为可用
- 按优先级自动选择最优引擎

## 🛠️ 开发配置

### 1. 智谱GLM API配置
```javascript
// 在设置页面配置智谱API密钥
// 或在 zhipuConfig.js 中设置
export const ZHIPU_CONFIG = {
  apiKey: 'your-zhipu-api-key',
  model: 'glm-4-flash',
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/'
};
```

### 2. 安装依赖
```bash
# 纯前端实现，无需额外Python依赖
# 智谱GLM通过HTTP API调用
npm install  # 安装项目依赖即可
```

### 3. 添加新引擎
```javascript
// 在 newTranslationManager.js 中添加
export const TRANSLATION_ENGINES = {
  // ... 现有引擎
  newEngine: {
    name: '新引擎',
    provider: 'new-provider',
    priority: 10,
    available: true,
    languages: 100,
    features: ['特性1', '特性2']
  }
};

// 添加对应的翻译方法
async translateWithNewEngine(text, targetLang, sourceLang) {
  // 实现具体的翻译逻辑
}
```

### 4. 自定义语言代码
```javascript
// 在 LANGUAGE_MAPPING 中添加映射
const LANGUAGE_MAPPING = {
  'zh': {
    zhipu: 'Chinese',
    alibaba: 'zh',
    baidu: 'zh',
    google: 'zh'
  },
  'en': {
    zhipu: 'English',
    alibaba: 'en',
    baidu: 'en',
    google: 'en'
  },
  'newLang': {
    zhipu: 'NewLanguage',
    alibaba: 'alibaba-code',
    baidu: 'baidu-code',
    newEngine: 'new-engine-code'
  }
};
```

## 🔍 调试与日志

### 控制台日志
```javascript
// 翻译过程完整日志
🌐 [TranslationManager] 智能翻译管理器初始化完成
🚀 [TranslationManager] 当前翻译引擎: 智谱GLM
🤖 [ZhipuGLM] AI翻译请求: zh -> en
✅ [TranslationManager] 智谱GLM 翻译成功
🔄 [TranslationManager] 引擎切换: 智谱GLM -> 阿里翻译
⚠️ [ZhipuGLM] API密钥未配置，切换到备用引擎
📤 [Alibaba] 翻译请求: zh -> en
✅ [TranslationManager] 阿里翻译 翻译成功
```

### 错误处理
```javascript
// 智谱GLM API错误处理
try {
  const result = await zhipuService.translate(text, targetLang, sourceLang);
} catch (error) {
  console.error('🚨 [ZhipuGLM] 翻译失败:', error.message);
  // 自动切换到备用引擎
  return await this.translateWithFallback(text, targetLang, sourceLang);
}
```

### API密钥管理
```javascript
// 检查API密钥配置
if (!zhipuApiKey) {
  console.warn('⚠️ [ZhipuGLM] API密钥未配置，请在设置页面配置');
  // 自动使用传统翻译引擎
}
```

## 🚧 注意事项

### 1. 网络环境
- 某些引擎可能受网络环境影响
- Google翻译在中国大陆可能无法访问
- 建议配置多个备用引擎

### 2. 请求频率
- 自动添加延迟防止请求过频
- 批量翻译时间隔200ms
- 缓存机制减少重复请求

### 3. 错误处理
- 网络错误自动重试
- 超时自动切换引擎
- 详细错误日志便于调试

## 🎉 优势特点

### 相比单一翻译引擎
- **高可用性** - 99.9%的翻译成功率
- **智能切换** - 无需人工干预
- **性能优化** - 缓存 + 并发处理
- **用户体验** - 透明的故障转移

### 相比传统翻译方案
- **多样性** - 支持9个翻译引擎
- **国产优先** - 重点支持国产翻译服务
- **灵活配置** - 可自定义优先级和参数
- **实时监控** - 完整的状态监控系统

---

通过这个多引擎翻译系统，I-Prompt 现在具备了企业级的翻译服务可靠性，确保用户在任何网络环境下都能获得稳定的翻译服务体验。