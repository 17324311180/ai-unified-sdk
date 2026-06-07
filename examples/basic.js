/**
 * Basic Usage Example
 * 
 * Run with: node examples/basic.js
 * 
 * Make sure to set your API key first:
 * export OPENAI_API_KEY=your-key
 */

import { chat } from '../dist/index.mjs';

async function main() {
  // Example 1: Simple chat with GPT-3.5
  console.log('=== Example 1: Simple GPT-3.5 Chat ===');
  const response = await chat({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Write a one-sentence joke about programming.' },
    ],
    // apiKey: 'your-api-key-here', // or set OPENAI_API_KEY env var
  });
  
  console.log('Response:', response.content);
  console.log('Model:', response.model);
  console.log('Usage:', JSON.stringify(response.usage, null, 2));
  console.log();
  
  // Example 2: Chat with custom parameters
  console.log('=== Example 2: Custom Parameters ===');
  const response2 = await chat({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: 'What is the capital of France?' },
    ],
    temperature: 0.7,
    maxTokens: 50,
  });
  
  console.log('Response:', response2.content);
  console.log();
  
  // Example 3: Multi-turn conversation
  console.log('=== Example 3: Multi-turn Conversation ===');
  const messages = [
    { role: 'user', content: 'My favorite color is blue.' },
    { role: 'assistant', content: "That's great! Blue is a calming color." },
    { role: 'user', content: "What's my favorite color?" },
  ];
  
  const response3 = await chat({
    model: 'gpt-3.5-turbo',
    messages,
  });
  
  console.log('Response:', response3.content);
  console.log();
  
  console.log('All examples completed!');
}

main().catch(console.error);
