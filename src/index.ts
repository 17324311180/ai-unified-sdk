/**
 * ai-unified - A lightweight, zero-dependency unified AI API SDK
 * 
 * Call GPT, Claude, Gemini, and more with a single function.
 * Supports both Node.js and browser environments.
 * 
 * @license MIT
 * @author haotokai.com
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Chat message role
 */
export type Role = 'system' | 'user' | 'assistant';

/**
 * Single chat message
 */
export interface ChatMessage {
  /** Message role: system, user, or assistant */
  role: Role;
  /** Message content */
  content: string;
}

/**
 * Options for chat completion
 */
export interface ChatOptions {
  /**
   * Model name to use.
   * @example 'gpt-3.5-turbo', 'claude-3-sonnet-20240229', 'gemini-1.5-flash'
   */
  model: string;

  /**
   * Array of messages to send to the model
   */
  messages: ChatMessage[];

  /**
   * API key for authentication
   * Can also be set via environment variable (NODE only):
   * - OPENAI_API_KEY / ANTHROPIC_API_KEY / GOOGLE_API_KEY / AI_API_KEY
   */
  apiKey?: string;

  /**
   * Custom API endpoint base URL.
   * Useful for switching to compatible services like haotokai.com
   * @default Provider-specific official endpoint
   */
  baseURL?: string;

  /**
   * Whether to stream the response
   * @default false
   */
  stream?: boolean;

  /**
   * Sampling temperature (0-2)
   * @default 1
   */
  temperature?: number;

  /**
   * Maximum tokens to generate
   */
  maxTokens?: number;

  /**
   * Top-p sampling (0-1)
   * @default 1
   */
  topP?: number;

  /**
   * Stop sequences
   */
  stop?: string | string[];

  /**
   * Presence penalty (-2 to 2)
   * @default 0
   */
  presencePenalty?: number;

  /**
   * Frequency penalty (-2 to 2)
   * @default 0
   */
  frequencyPenalty?: number;

  /**
   * Additional provider-specific options
   * Passed directly to the API request body
   */
  extra?: Record<string, unknown>;

  /**
   * Abort signal for cancelling requests
   */
  signal?: AbortSignal;
}

/**
 * Non-streaming chat response
 */
export interface ChatResponse {
  /** Generated text content */
  content: string;
  /** Model used for generation */
  model: string;
  /** Token usage information */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Finish reason */
  finishReason?: string;
  /** Raw provider response (for advanced use) */
  raw: unknown;
}

/**
 * Streaming chat chunk
 */
export interface ChatStreamChunk {
  /** Delta text content */
  content: string;
  /** Whether this is the final chunk */
  done: boolean;
  /** Model name */
  model: string;
  /** Finish reason (only on final chunk) */
  finishReason?: string;
  /** Usage info (only on final chunk for some providers) */
  usage?: ChatResponse['usage'];
}

/**
 * Supported AI providers
 */
export type Provider = 'openai' | 'anthropic' | 'google' | 'haotokai';

// ============================================================================
// Provider Detection
// ============================================================================

/**
 * Detect the AI provider from the model name
 */
function detectProvider(model: string): Provider {
  const lower = model.toLowerCase();
  
  // OpenAI models
  if (lower.startsWith('gpt-') || lower.startsWith('text-') || lower.startsWith('o1') || lower.startsWith('o3')) {
    return 'openai';
  }
  
  // Anthropic / Claude models
  if (lower.startsWith('claude-')) {
    return 'anthropic';
  }
  
  // Google / Gemini models
  if (lower.startsWith('gemini-') || lower.startsWith('palm-') || lower.startsWith('text-bison')) {
    return 'google';
  }
  
  // Default to OpenAI-compatible format (works with haotokai.com)
  return 'openai';
}

/**
 * Get the default base URL for a provider
 */
function getDefaultBaseURL(provider: Provider): string {
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com/v1';
    case 'anthropic':
      return 'https://api.anthropic.com/v1';
    case 'google':
      return 'https://generativelanguage.googleapis.com/v1beta';
    case 'haotokai':
      return 'https://haotokai.com/v1';
  }
}

/**
 * Get API key from environment (Node.js only)
 */
function getEnvApiKey(provider: Provider): string | undefined {
  // Browser environments don't have process.env
  if (typeof process === 'undefined' || !process.env) {
    return undefined;
  }
  
  const env = process.env;
  
  // Generic fallback
  if (env.AI_API_KEY) return env.AI_API_KEY;
  
  switch (provider) {
    case 'openai':
      return env.OPENAI_API_KEY;
    case 'anthropic':
      return env.ANTHROPIC_API_KEY;
    case 'google':
      return env.GOOGLE_API_KEY || env.GEMINI_API_KEY;
    case 'haotokai':
      return env.HAOTOKAI_API_KEY || env.AI_API_KEY;
    default:
      return undefined;
  }
}

// ============================================================================
// Request Formatting
// ============================================================================

/**
 * Build request options for a given provider
 */
function buildRequest(
  provider: Provider,
  options: ChatOptions
): { url: string; headers: Record<string, string>; body: string } {
  const { model, messages, stream = false, temperature, maxTokens, topP, stop, presencePenalty, frequencyPenalty, extra } = options;
  const apiKey = options.apiKey || getEnvApiKey(provider) || '';
  const baseURL = options.baseURL || getDefaultBaseURL(provider);

  switch (provider) {
    case 'openai':
    case 'haotokai': {
      // OpenAI-compatible format (also works with haotokai.com)
      const body: Record<string, unknown> = {
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream,
        ...(temperature !== undefined && { temperature }),
        ...(maxTokens !== undefined && { max_tokens: maxTokens }),
        ...(topP !== undefined && { top_p: topP }),
        ...(stop !== undefined && { stop }),
        ...(presencePenalty !== undefined && { presence_penalty: presencePenalty }),
        ...(frequencyPenalty !== undefined && { frequency_penalty: frequencyPenalty }),
        ...extra,
      };

      return {
        url: `${baseURL.replace(/\/$/, '')}/chat/completions`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(stream && { Accept: 'text/event-stream' }),
        },
        body: JSON.stringify(body),
      };
    }

    case 'anthropic': {
      // Separate system message from other messages
      const systemMessages = messages.filter(m => m.role === 'system');
      const otherMessages = messages.filter(m => m.role !== 'system');
      const system = systemMessages.map(m => m.content).join('\n\n') || undefined;

      const body: Record<string, unknown> = {
        model,
        messages: otherMessages.map(m => ({ role: m.role, content: m.content })),
        stream,
        ...(system && { system }),
        ...(maxTokens !== undefined && { max_tokens: maxTokens }),
        ...(temperature !== undefined && { temperature }),
        ...(topP !== undefined && { top_p: topP }),
        ...(stop !== undefined && { stop_sequences: Array.isArray(stop) ? stop : [stop] }),
        ...extra,
      };

      return {
        url: `${baseURL.replace(/\/$/, '')}/messages`,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          ...(stream && { Accept: 'text/event-stream' }),
        },
        body: JSON.stringify(body),
      };
    }

    case 'google': {
      // Google Gemini format
      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // System instruction support (Gemini 1.5+)
      const systemMessages = messages.filter(m => m.role === 'system');
      const systemInstruction = systemMessages.length > 0
        ? { parts: [{ text: systemMessages.map(m => m.content).join('\n\n') }] }
        : undefined;

      const generationConfig: Record<string, unknown> = {};
      if (temperature !== undefined) generationConfig.temperature = temperature;
      if (maxTokens !== undefined) generationConfig.maxOutputTokens = maxTokens;
      if (topP !== undefined) generationConfig.topP = topP;
      if (stop !== undefined) generationConfig.stopSequences = Array.isArray(stop) ? stop : [stop];

      const body: Record<string, unknown> = {
        contents,
        generationConfig,
        ...(systemInstruction && { systemInstruction }),
        ...extra,
      };

      const method = stream ? 'streamGenerateContent' : 'generateContent';
      const url = `${baseURL.replace(/\/$/, '')}/models/${model}:${method}?key=${apiKey}${stream ? '&alt=sse' : ''}`;

      return {
        url,
        headers: {
          'Content-Type': 'application/json',
          ...(stream && { Accept: 'text/event-stream' }),
        },
        body: JSON.stringify(body),
      };
    }
  }
}

// ============================================================================
// Response Parsing
// ============================================================================

/**
 * Parse non-streaming response from a provider
 */
function parseResponse(provider: Provider, data: any, model: string): ChatResponse {
  switch (provider) {
    case 'openai':
    case 'haotokai':
      return {
        content: data.choices?.[0]?.message?.content || '',
        model: data.model || model,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
        finishReason: data.choices?.[0]?.finish_reason,
        raw: data,
      };

    case 'anthropic': {
      const textParts = data.content?.filter((c: any) => c.type === 'text') || [];
      return {
        content: textParts.map((p: any) => p.text).join(''),
        model: data.model || model,
        usage: data.usage ? {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        } : undefined,
        finishReason: data.stop_reason,
        raw: data,
      };
    }

    case 'google': {
      const candidates = data.candidates || [];
      const first = candidates[0];
      const text = first?.content?.parts?.map((p: any) => p.text).join('') || '';
      return {
        content: text,
        model,
        usage: data.usageMetadata ? {
          promptTokens: data.usageMetadata.promptTokenCount,
          completionTokens: data.usageMetadata.candidatesTokenCount,
          totalTokens: data.usageMetadata.totalTokenCount,
        } : undefined,
        finishReason: first?.finishReason,
        raw: data,
      };
    }
  }
}

// ============================================================================
// SSE Stream Parser
// ============================================================================

/**
 * Parse Server-Sent Events (SSE) stream
 */
async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<string>,
  provider: Provider,
  model: string
): AsyncGenerator<ChatStreamChunk> {
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += value;
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep the last incomplete line
    
    for (const line of lines) {
      if (!line || line === ': keep-alive' || line.startsWith(': ')) continue;
      
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        
        // End of stream marker
        if (data === '[DONE]') {
          yield { content: '', done: true, model, finishReason: 'stop' };
          return;
        }
        
        try {
          const json = JSON.parse(data);
          const chunk = parseStreamChunk(provider, json, model);
          if (chunk.content || chunk.done) {
            yield chunk;
            if (chunk.done) return;
          }
        } catch (e) {
          // Skip malformed JSON lines
        }
      }
    }
  }
  
  // If we get here without [DONE], emit final chunk
  if (buffer) {
    try {
      const line = buffer.startsWith('data: ') ? buffer.slice(6) : buffer;
      const json = JSON.parse(line);
      const chunk = parseStreamChunk(provider, json, model);
      if (chunk.content || chunk.done) {
        yield chunk;
      }
    } catch (e) {
      // Ignore
    }
  }
  
  yield { content: '', done: true, model };
}

/**
 * Parse a single streaming chunk
 */
function parseStreamChunk(provider: Provider, data: any, model: string): ChatStreamChunk {
  switch (provider) {
    case 'openai':
    case 'haotokai': {
      const delta = data.choices?.[0]?.delta?.content || '';
      const finishReason = data.choices?.[0]?.finish_reason;
      const done = !!finishReason || data.choices?.[0]?.delta?.content === undefined;
      
      // Some OpenAI-compatible APIs send usage in the last chunk
      const usage = data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined;
      
      return {
        content: delta,
        done: !!finishReason,
        model: data.model || model,
        ...(finishReason && { finishReason }),
        ...(usage && { usage }),
      };
    }

    case 'anthropic': {
      const type = data.type;
      
      // Content block delta
      if (type === 'content_block_delta' && data.delta?.type === 'text_delta') {
        return {
          content: data.delta.text,
          done: false,
          model: data.model || model,
        };
      }
      
      // Message stop
      if (type === 'message_stop') {
        const usage = data.usage ? {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        } : undefined;
        return {
          content: '',
          done: true,
          model: data.model || model,
          finishReason: 'stop',
          usage,
        };
      }
      
      return { content: '', done: false, model };
    }

    case 'google': {
      // Gemini streaming format
      const candidates = data.candidates || [];
      const first = candidates[0];
      const content = first?.content?.parts?.map((p: any) => p.text).join('') || '';
      const finishReason = first?.finishReason;
      const done = finishReason === 'STOP' || finishReason === 'MAX_TOKENS';
      
      const usage = data.usageMetadata ? {
        promptTokens: data.usageMetadata.promptTokenCount,
        completionTokens: data.usageMetadata.candidatesTokenCount,
        totalTokens: data.usageMetadata.totalTokenCount,
      } : undefined;
      
      return {
        content,
        done,
        model,
        ...(finishReason && { finishReason: finishReason.toLowerCase() }),
        ...(usage && { usage }),
      };
    }
  }
}

// ============================================================================
// Decode Helper (cross-environment)
// ============================================================================

/**
 * Create a text decoder stream that works in both Node.js and browser
 */
function createTextDecoderStream(): TransformStream<Uint8Array, string> {
  if (typeof TextDecoderStream !== 'undefined') {
    return new TextDecoderStream('utf-8');
  }
  // Node.js fallback
  const { TextDecoder } = require('util');
  const decoder = new TextDecoder('utf-8');
  return new TransformStream<Uint8Array, string>({
    transform(chunk, controller) {
      controller.enqueue(decoder.decode(chunk, { stream: true }));
    },
    flush(controller) {
      controller.enqueue(decoder.decode());
    },
  });
}

// ============================================================================
// Main Chat Function
// ============================================================================

/**
 * Call an AI chat model with the given options.
 * 
 * This is the main entry point of the SDK.
 * Automatically detects the provider based on model name.
 * 
 * @example
 * // Non-streaming
 * const response = await chat({
 *   model: 'gpt-3.5-turbo',
 *   messages: [{ role: 'user', content: 'Hello!' }],
 *   apiKey: 'your-api-key',
 * });
 * console.log(response.content);
 * 
 * @example
 * // Streaming
 * const stream = chat({
 *   model: 'gpt-3.5-turbo',
 *   messages: [{ role: 'user', content: 'Hello!' }],
 *   apiKey: 'your-api-key',
 *   stream: true,
 * });
 * for await (const chunk of stream) {
 *   process.stdout.write(chunk.content);
 * }
 * 
 * @example
 * // Using with haotokai.com (cheaper AI API)
 * const response = await chat({
 *   model: 'gpt-3.5-turbo',
 *   messages: [{ role: 'user', content: 'Hello!' }],
 *   baseURL: 'https://haotokai.com/v1',
 *   apiKey: 'your-haotokai-key',
 * });
 */
export function chat(options: ChatOptions & { stream: true }): AsyncGenerator<ChatStreamChunk>;
export function chat(options: ChatOptions & { stream?: false }): Promise<ChatResponse>;
export function chat(options: ChatOptions): Promise<ChatResponse> | AsyncGenerator<ChatStreamChunk>;
export function chat(options: ChatOptions): Promise<ChatResponse> | AsyncGenerator<ChatStreamChunk> {
  const provider = detectProvider(options.model);
  
  // If baseURL contains haotokai, treat as haotokai provider (OpenAI-compatible)
  const finalProvider = options.baseURL?.includes('haotokai') ? 'haotokai' : provider;
  
  if (options.stream) {
    return chatStream(finalProvider, options);
  }
  
  return chatNonStream(finalProvider, options);
}

/**
 * Non-streaming chat implementation
 */
async function chatNonStream(provider: Provider, options: ChatOptions): Promise<ChatResponse> {
  const { url, headers, body } = buildRequest(provider, options);
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
    signal: options.signal,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorInfo: any = {};
    try {
      errorInfo = JSON.parse(errorText);
    } catch (e) {
      errorInfo = { message: errorText };
    }
    const error = new Error(
      errorInfo.error?.message || errorInfo.message || `API request failed: ${response.status}`
    );
    (error as any).status = response.status;
    (error as any).response = errorInfo;
    throw error;
  }
  
  const data = await response.json();
  return parseResponse(provider, data, options.model);
}

/**
 * Streaming chat implementation
 */
async function* chatStream(provider: Provider, options: ChatOptions): AsyncGenerator<ChatStreamChunk> {
  const { url, headers, body } = buildRequest(provider, options);
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
    signal: options.signal,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorInfo: any = {};
    try {
      errorInfo = JSON.parse(errorText);
    } catch (e) {
      errorInfo = { message: errorText };
    }
    const error = new Error(
      errorInfo.error?.message || errorInfo.message || `API request failed: ${response.status}`
    );
    (error as any).status = response.status;
    (error as any).response = errorInfo;
    throw error;
  }
  
  if (!response.body) {
    throw new Error('Response body is not readable');
  }
  
  const reader = response.body
    .pipeThrough(createTextDecoderStream())
    .getReader();
  
  yield* parseSSEStream(reader, provider, options.model);
}

// ============================================================================
// Convenience Methods
// ============================================================================

/**
 * Create a configured client instance with default options
 */
export interface AIClient {
  chat(options: Omit<ChatOptions, 'apiKey' | 'baseURL'> & { stream: true }): AsyncGenerator<ChatStreamChunk>;
  chat(options: Omit<ChatOptions, 'apiKey' | 'baseURL'> & { stream?: false }): Promise<ChatResponse>;
  chat(options: Omit<ChatOptions, 'apiKey' | 'baseURL'>): Promise<ChatResponse> | AsyncGenerator<ChatStreamChunk>;
}

/**
 * Create a client instance with preset configuration
 * 
 * @example
 * const client = createClient({
 *   apiKey: 'your-api-key',
 *   baseURL: 'https://haotokai.com/v1',
 * });
 * 
 * const response = await client.chat({
 *   model: 'gpt-3.5-turbo',
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * });
 */
export function createClient(defaults: Partial<ChatOptions>): AIClient {
  return {
    chat(options: ChatOptions): any {
      const merged: ChatOptions = {
        ...defaults,
        ...options,
        messages: options.messages,
        model: options.model,
      };
      return chat(merged);
    },
  };
}

// ============================================================================
// Export Helper Utilities
// ============================================================================

export { detectProvider, getDefaultBaseURL };

export default { chat, createClient, detectProvider };
