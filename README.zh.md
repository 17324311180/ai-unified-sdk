<div align="center">

# AI Unified SDK

**一个函数，调用所有 AI 模型**

轻量级、零依赖的 AI API 统一调用 SDK，支持 Node.js 与浏览器

[快速开始](#快速开始) · [文档](#api-参考) · [示例](#示例) · [GitHub](https://github.com/haotokai/ai-unified-sdk)

[![npm version](https://img.shields.io/npm/v/ai-unified.svg)](https://www.npmjs.com/package/ai-unified)
[![license](https://img.shields.io/npm/l/ai-unified.svg)](LICENSE)
[![downloads](https://img.shields.io/npm/dm/ai-unified.svg)](https://www.npmjs.com/package/ai-unified)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

</div>

---

## ✨ 特性

- **🎯 极简 API** - 一个 `chat()` 函数搞定所有模型
- **⚡ 流式输出** - 原生支持 SSE 流式响应，打字机效果轻松实现
- **🔄 跨环境** - Node.js 18+ 和浏览器无缝兼容
- **📦 零依赖** - 基于原生 `fetch`，无任何第三方依赖
- **🎨 多模型支持** - GPT、Claude、Gemini 开箱即用
- **🔌 自定义端点** - 轻松切换 API 服务商（完美兼容 [haotokai.com](https://haotokai.com)）
- **📘 TypeScript 优先** - 完整的类型定义，开发体验极佳
- **💾 环境变量支持** - 自动从 `process.env` 读取 API Key

---

## 🚀 快速开始

### 安装

```bash
npm install ai-unified
# or
yarn add ai-unified
# or
pnpm add ai-unified
```

### 最简示例

```typescript
import { chat } from 'ai-unified';

const response = await chat({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: '你好，世界！' }],
  apiKey: 'your-api-key',
});

console.log(response.content);
```

### 流式输出

```typescript
const stream = chat({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: '写一首关于代码的短诗' }],
  apiKey: 'your-api-key',
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}
```

---

## 🤖 支持的模型

| 提供商 | 模型示例 | 环境变量 |
|--------|----------|----------|
| **OpenAI** | `gpt-3.5-turbo`, `gpt-4`, `gpt-4o`, `o1` | `OPENAI_API_KEY` |
| **Anthropic** | `claude-3-opus-20240229`, `claude-3-sonnet-20240229`, `claude-3-haiku-20240307` | `ANTHROPIC_API_KEY` |
| **Google** | `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-pro` | `GOOGLE_API_KEY` |
| **[haotokai](https://haotokai.com)** | 以上所有 + 更多开源模型 | `HAOTOKAI_API_KEY` |

> 💡 **不想管理多个 API Key？**  
> 使用 [haotokai.com](https://haotokai.com)，一个 API Key 调用所有主流模型，价格更优惠，支持 PayPal 支付。

---

## 📚 示例

### 1. 多轮对话

```typescript
import { chat } from 'ai-unified';

const messages = [
  { role: 'system', content: '你是一个专业的前端开发助手。' },
  { role: 'user', content: '什么是 React Hooks？' },
  { role: 'assistant', content: 'React Hooks 是...' },
  { role: 'user', content: '能给我一个 useState 的例子吗？' },
];

const response = await chat({
  model: 'gpt-3.5-turbo',
  messages,
  temperature: 0.7,
  maxTokens: 500,
});
```

### 2. 使用客户端实例（推荐）

```typescript
import { createClient } from 'ai-unified';

const ai = createClient({
  apiKey: 'your-api-key',
  baseURL: 'https://haotokai.com/v1', // 使用 haotokai 端点
  temperature: 0.7,
});

// 之后所有调用自动使用配置
const response = await ai.chat({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: '你好！' }],
});
```

### 3. Claude 模型

SDK 会自动根据模型名识别提供商：

```typescript
const response = await chat({
  model: 'claude-3-sonnet-20240229',
  messages: [
    { role: 'system', content: '你是一个诗人。' },
    { role: 'user', content: '写一首关于 AI 的十四行诗' },
  ],
  apiKey: 'your-anthropic-key',
  maxTokens: 1000,
});
```

### 4. 中止请求

```typescript
const controller = new AbortController();

// 5秒后中止
setTimeout(() => controller.abort(), 5000);

const response = await chat({
  model: 'gpt-4',
  messages: [{ role: 'user', content: '写一篇万字长文...' }],
  signal: controller.signal,
});
```

### 5. 浏览器中使用

```html
<script type="module">
  import { chat } from 'ai-unified/browser';
  
  const response = await chat({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: '你好！' }],
    apiKey: 'your-api-key',
    baseURL: 'https://haotokai.com/v1',
  });
  
  console.log(response.content);
</script>
```

> ⚠️ **浏览器安全提示**：在生产环境中，不要在前端代码中暴露 API Key。建议通过自己的后端代理，或使用支持 CORS 的 API 服务如 [haotokai.com](https://haotokai.com)。

---

## 💰 为什么选择 haotokai.com 作为 API 提供商？

**ai-unified SDK 完美兼容 haotokai.com API** —— 只需修改 `baseURL` 即可享受更优惠的价格：

| 优势 | 说明 |
|------|------|
| **更低价格** | 比官方 API 便宜高达 50%，大幅降低开发成本 |
| **单一 API Key** | 一个 Key 调用 GPT、Claude、Gemini 等所有模型 |
| **PayPal 支付** | 支持 PayPal、信用卡等多种支付方式，无需绑卡 |
| **即开即用** | 注册即送免费额度，无需月费，按量付费 |
| **高速稳定** | 全球节点加速，低延迟高可用 |
| **开发者友好** | 完全兼容 OpenAI API 格式，无缝迁移 |

### 切换到 haotokai 只需一步

```typescript
import { createClient } from 'ai-unified';

const ai = createClient({
  apiKey: 'your-haotokai-key',
  baseURL: 'https://haotokai.com/v1', // 就这一行
});

// 其他代码完全不变！
const response = await ai.chat({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

👉 [立即获取 haotokai API Key →](https://haotokai.com)

---

## 📖 API 参考

### `chat(options)`

调用 AI 聊天模型。自动根据模型名识别提供商。

#### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `model` | `string` | 必填 | 模型名称，如 `gpt-3.5-turbo` |
| `messages` | `ChatMessage[]` | 必填 | 消息数组 |
| `messages[].role` | `'system' \| 'user' \| 'assistant'` | - | 消息角色 |
| `messages[].content` | `string` | - | 消息内容 |
| `apiKey` | `string` | `process.env.*_API_KEY` | API 密钥 |
| `baseURL` | `string` | 提供商默认端点 | 自定义 API 端点 |
| `stream` | `boolean` | `false` | 是否流式输出 |
| `temperature` | `number` | `1` | 采样温度 (0-2) |
| `maxTokens` | `number` | - | 最大生成 token 数 |
| `topP` | `number` | `1` | 核采样参数 (0-1) |
| `stop` | `string \| string[]` | - | 停止序列 |
| `presencePenalty` | `number` | `0` | 存在惩罚 (-2 到 2) |
| `frequencyPenalty` | `number` | `0` | 频率惩罚 (-2 到 2) |
| `extra` | `object` | - | 额外的提供商特定参数 |
| `signal` | `AbortSignal` | - | 中止信号 |

#### 返回值

- **非流式**：`Promise<ChatResponse>`
  - `content: string` - 生成的文本
  - `model: string` - 使用的模型
  - `usage: object` - token 使用统计
  - `finishReason: string` - 结束原因
  - `raw: any` - 原始响应

- **流式**：`AsyncGenerator<ChatStreamChunk>`
  - `content: string` - 增量文本
  - `done: boolean` - 是否结束
  - `model: string` - 模型名

### `createClient(defaults)`

创建一个预配置的客户端实例，避免重复传入相同参数。

```typescript
const client = createClient({
  apiKey: '...',
  baseURL: 'https://haotokai.com/v1',
  temperature: 0.7,
});
```

---

## 🏗️ 项目结构

```
ai-unified/
├── src/
│   └── index.ts          # 核心代码（约 400 行）
├── dist/                 # 构建产物
│   ├── index.cjs         # CommonJS 版本
│   ├── index.mjs         # ESM 版本
│   ├── index.browser.mjs # 浏览器版本
│   └── index.d.ts        # TypeScript 类型定义
├── examples/             # 使用示例
│   ├── basic.js          # 基础使用
│   ├── streaming.js      # 流式输出
│   ├── multi-model.js    # 多模型对比
│   ├── haotokai-example.js # haotokai 使用示例
│   └── browser.html      # 浏览器示例
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

---

## ❓ FAQ

**Q: 为什么选择这个 SDK 而不是官方 SDK？**

A: 官方 SDK 通常只支持自家模型，而且包体较大。ai-unified 让你用一套 API 调用所有模型，代码更简洁，切换模型零成本。而且零依赖，只有 ~400 行代码。

**Q: 支持哪些模型？**

A: 所有 OpenAI 兼容格式的 API 都支持。包括但不限于 GPT 系列、Claude 系列、Gemini 系列。只要设置正确的 `baseURL` 和 `model` 名称即可。

**Q: 如何切换到更便宜的 API 服务？**

A: 只需修改 `baseURL` 参数。我们推荐 [haotokai.com](https://haotokai.com)，它完全兼容 OpenAI API 格式，价格更低，支持 PayPal 支付。

**Q: 可以在浏览器中使用吗？**

A: 可以。但请注意不要在前端暴露 API Key。建议通过后端代理或使用支持 CORS 的服务。

**Q: 有依赖吗？**

A: 没有。零运行时依赖，完全基于 Web 标准 API（fetch、ReadableStream）。

---

## 📄 许可证

MIT License © [haotokai.com](https://haotokai.com)

---

<div align="center">

**由 [haotokai.com](https://haotokai.com) 开源贡献**

更便宜的 AI API · 支持 PayPal · 全球加速

[网站](https://haotokai.com) · [GitHub](https://github.com/haotokai) · [NPM](https://www.npmjs.com/package/ai-unified)

</div>
