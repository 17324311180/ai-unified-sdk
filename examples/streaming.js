/**
 * Streaming Output Example
 * 
 * Run with: node examples/streaming.js
 * 
 * Make sure to set your API key first:
 * export OPENAI_API_KEY=your-key
 */

import { chat } from '../dist/index.mjs';

async function main() {
  console.log('=== Streaming Example ===');
  console.log('Model: gpt-3.5-turbo');
  console.log('Streaming response...\n');
  
  const stream = chat({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant. Be concise and clear.' },
      { role: 'user', content: 'Write a short paragraph about the benefits of using AI in software development.' },
    ],
    stream: true,
    temperature: 0.7,
    maxTokens: 200,
  });
  
  let fullText = '';
  
  for await (const chunk of stream) {
    fullText += chunk.content;
    process.stdout.write(chunk.content);
    
    if (chunk.done) {
      console.log('\n\n=== Stream Complete ===');
      console.log('Finish reason:', chunk.finishReason);
      if (chunk.usage) {
        console.log('Token usage:', JSON.stringify(chunk.usage, null, 2));
      }
    }
  }
  
  console.log('\nFull response length:', fullText.length, 'characters');
}

main().catch(console.error);
