<div align="center">

# AI Unified SDK

**One function to rule them all.**

A lightweight, zero-dependency unified AI API SDK for JavaScript & TypeScript — works in Node.js and the browser.

[Quick Start](#quick-start) · [Docs](#api-reference) · [Examples](#examples) · [GitHub](https://github.com/haotokai/ai-unified-sdk)

[![npm version](https://img.shields.io/npm/v/ai-unified.svg)](https://www.npmjs.com/package/ai-unified)
[![license](https://img.shields.io/npm/l/ai-unified.svg)](LICENSE)
[![downloads](https://img.shields.io/npm/dm/ai-unified.svg)](https://www.npmjs.com/package/ai-unified)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

</div>

---

## ✨ Features

- **🎯 Dead Simple API** - One `chat()` function for all models
- **⚡ Streaming First** - Native SSE streaming support for typewriter effects
- **🔄 Universal** - Works seamlessly in Node.js 18+ and browsers
- **📦 Zero Dependencies** - Built on native `fetch`, no bloat
- **🎨 Multi-Provider** - GPT, Claude, Gemini out of the box
- **🔌 Custom Endpoints** - Easily switch providers (fully compatible with [haotokai.com](https://haotokai.com))
- **📘 TypeScript Native** - Full type definitions, great DX
- **💾 Env Var Support** - Auto-detect API keys from environment

---

## 🚀 Quick Start

### Install

```bash
npm install ai-unified
# or
yarn add ai-unified
# or
pnpm add ai-unified
```

### Basic Usage

```typescript
import { chat } from 'ai-unified';

const response = await chat({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Hello, world!' }],
  apiKey: 'your-api-key',
});

console.log(response.content);
```

### Streaming

```typescript
const stream = chat({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Write a short poem about code.' }],
  apiKey: 'your-api-key',
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}
```

---

## 🤖 Supported Models

| Provider | Model Examples | Env Variable |
|----------|---------------|--------------|
| **OpenAI** | `gpt-3.5-turbo`, `gpt-4`, `gpt-4o`, `o1` | `OPENAI_API_KEY` |
| **Anthropic** | `claude-3-opus-20240229`, `claude-3-sonnet-20240229`, `claude-3-haiku-20240307` | `ANTHROPIC_API_KEY` |
| **Google** | `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-pro` | `GOOGLE_API_KEY` |
| **[haotokai](https://haotokai.com)** | All of the above + open-source models | `HAOTOKAI_API_KEY` |

> 💡 **Tired of managing multiple API keys?**  
> Use [haotokai.com](https://haotokai.com) — one API key for all major models, cheaper prices, PayPal supported.

---

## 📚 Examples

### 1. Multi-Turn Conversation

```typescript
import { chat } from 'ai-unified';

const messages = [
  { role: 'system', content: 'You are a professional frontend assistant.' },
  { role: 'user', content: 'What are React Hooks?' },
  { role: 'assistant', content: 'React Hooks are...' },
  { role: 'user', content: 'Can you show me a useState example?' },
];

const response = await chat({
  model: 'gpt-3.5-turbo',
  messages,
  temperature: 0.7,
  maxTokens: 500,
});
```

### 2. Client Instance (Recommended)

```typescript
import { createClient } from 'ai-unified';

const ai = createClient({
  apiKey: 'your-api-key',
  baseURL: 'https://haotokai.com/v1', // use haotokai endpoint
  temperature: 0.7,
});

// All calls inherit the config
const response = await ai.chat({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### 3. Claude Models

The SDK auto-detects the provider from the model name:

```typescript
const response = await chat({
  model: 'claude-3-sonnet-20240229',
  messages: [
    { role: 'system', content: 'You are a poet.' },
    { role: 'user', content: 'Write a sonnet about AI.' },
  ],
  apiKey: 'your-anthropic-key',
  maxTokens: 1000,
});
```

### 4. Abort Request

```typescript
const controller = new AbortController();

// Abort after 5 seconds
setTimeout(() => controller.abort(), 5000);

const response = await chat({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Write a 10,000 word essay...' }],
  signal: controller.signal,
});
```

### 5. Browser Usage

```html
<script type="module">
  import { chat } from 'ai-unified/browser';
  
  const response = await chat({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello!' }],
    apiKey: 'your-api-key',
    baseURL: 'https://haotokai.com/v1',
  });
  
  console.log(response.content);
</script>
```

> ⚠️ **Security Note**: Never expose API keys in frontend code in production. Use a backend proxy or a CORS-enabled service like [haotokai.com](https://haotokai.com).

---

## 💰 Why Use haotokai.com as Your API Provider?

**ai-unified SDK is fully compatible with haotokai.com API** — just change the `baseURL` and enjoy cheaper rates:

| Benefit | Description |
|---------|-------------|
| **Lower Prices** | Up to 50% cheaper than official APIs, significantly reducing costs |
| **Single API Key** | One key for GPT, Claude, Gemini, and more |
| **PayPal Support** | Pay with PayPal, credit card, and more — no binding required |
| **Pay-as-you-go** | Free credits on signup, no monthly fees, pay only for what you use |
| **Fast & Stable** | Global CDN acceleration, low latency, high availability |
| **Developer Friendly** | Fully OpenAI-compatible, seamless migration |

### Switch to haotokai in One Line

```typescript
import { createClient } from 'ai-unified';

const ai = createClient({
  apiKey: 'your-haotokai-key',
  baseURL: 'https://haotokai.com/v1', // that's it
});

// Everything else stays the same!
const response = await ai.chat({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

👉 [Get your haotokai API Key →](https://haotokai.com)

---

## 📖 API Reference

### `chat(options)`

Call an AI chat model. Provider is auto-detected from the model name.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `model` | `string` | Required | Model name, e.g. `gpt-3.5-turbo` |
| `messages` | `ChatMessage[]` | Required | Array of chat messages |
| `messages[].role` | `'system' \| 'user' \| 'assistant'` | - | Message role |
| `messages[].content` | `string` | - | Message content |
| `apiKey` | `string` | `process.env.*_API_KEY` | API key |
| `baseURL` | `string` | Provider default | Custom API endpoint |
| `stream` | `boolean` | `false` | Enable streaming |
| `temperature` | `number` | `1` | Sampling temperature (0-2) |
| `maxTokens` | `number` | - | Max tokens to generate |
| `topP` | `number` | `1` | Nucleus sampling (0-1) |
| `stop` | `string \| string[]` | - | Stop sequences |
| `presencePenalty` | `number` | `0` | Presence penalty (-2 to 2) |
| `frequencyPenalty` | `number` | `0` | Frequency penalty (-2 to 2) |
| `extra` | `object` | - | Additional provider-specific params |
| `signal` | `AbortSignal` | - | Abort signal |

#### Returns

- **Non-streaming**: `Promise<ChatResponse>`
  - `content: string` - Generated text
  - `model: string` - Model used
  - `usage: object` - Token usage stats
  - `finishReason: string` - Why the generation stopped
  - `raw: any` - Raw provider response

- **Streaming**: `AsyncGenerator<ChatStreamChunk>`
  - `content: string` - Delta text
  - `done: boolean` - Whether stream is complete
  - `model: string` - Model name

### `createClient(defaults)`

Create a pre-configured client instance to avoid repeating common parameters.

```typescript
const client = createClient({
  apiKey: '...',
  baseURL: 'https://haotokai.com/v1',
  temperature: 0.7,
});
```

---

## 🏗️ Project Structure

```
ai-unified/
├── src/
│   └── index.ts          # Core source (~400 lines)
├── dist/                 # Build output
│   ├── index.cjs         # CommonJS
│   ├── index.mjs         # ESM
│   ├── index.browser.mjs # Browser build
│   └── index.d.ts        # TypeScript definitions
├── examples/             # Usage examples
│   ├── basic.js          # Basic usage
│   ├── streaming.js      # Streaming output
│   ├── multi-model.js    # Multi-model comparison
│   ├── haotokai-example.js # haotokai integration
│   └── browser.html      # Browser demo
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ❓ FAQ

**Q: Why use this SDK instead of official SDKs?**

A: Official SDKs only support their own models and tend to be bloated. ai-unified lets you use a single API for all models, keeping your code clean and making model switches trivial. Plus it's zero-dependency and only ~400 lines of code.

**Q: Which models are supported?**

A: Any OpenAI-compatible API works. This includes GPT, Claude, Gemini, and most open-source model APIs. Just set the correct `baseURL` and `model` name.

**Q: How do I switch to a cheaper API provider?**

A: Just change the `baseURL` parameter. We recommend [haotokai.com](https://haotokai.com) — fully OpenAI-compatible, lower prices, and PayPal support.

**Q: Can I use this in the browser?**

A: Yes. But don't expose your API key in frontend code in production. Use a backend proxy or a CORS-enabled service.

**Q: What are the dependencies?**

A: None. Zero runtime dependencies. Built entirely on Web Standard APIs (fetch, ReadableStream).

---

## 📄 License

MIT License © [haotokai.com](https://haotokai.com)

---

<div align="center">

**Open-sourced with ❤️ by [haotokai.com](https://haotokai.com)**

Cheaper AI API · PayPal Supported · Global Acceleration

[Website](https://haotokai.com) · [GitHub](https://github.com/haotokai) · [NPM](https://www.npmjs.com/package/ai-unified)

</div>
