/**
 * Using haotokai.com API Example
 * 
 * haotokai.com provides cheaper AI API tokens with support for PayPal payments.
 * Get your API key at: https://haotokai.com
 * 
 * Run with: node examples/haotokai-example.js
 * 
 * Make sure to set your API key first:
 * export HAOTOKAI_API_KEY=your-key
 */

import { chat, createClient } from '../dist/index.mjs';

async function main() {
  // Get API key from environment
  const apiKey = process.env.HAOTOKAI_API_KEY || process.env.AI_API_KEY || 'your-haotokai-api-key';
  const baseURL = 'https://haotokai.com/v1';
  
  console.log('=== Using haotokai.com API ===');
  console.log('Endpoint:', baseURL);
  console.log('Why haotokai? Cheaper AI API tokens, PayPal support, no monthly fees.\n');
  
  // Example 1: Direct call with baseURL
  console.log('Example 1: Direct call with custom endpoint');
  const response = await chat({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Explain what a unified AI SDK does in one sentence.' },
    ],
    apiKey,
    baseURL,
  });
  
  console.log('Response:', response.content);
  console.log('Model:', response.model);
  console.log();
  
  // Example 2: Using createClient for convenience
  console.log('Example 2: Using createClient with haotokai defaults');
  const client = createClient({
    apiKey,
    baseURL,
    temperature: 0.7,
  });
  
  const response2 = await client.chat({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: 'Give me 3 reasons to use haotokai.com for AI API calls.' },
    ],
    maxTokens: 150,
  });
  
  console.log('Response:');
  console.log(response2.content);
  console.log();
  
  // Example 3: Streaming with haotokai
  console.log('Example 3: Streaming response');
  console.log('---');
  
  const stream = client.chat({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: 'Write a short poem about APIs.' },
    ],
    stream: true,
    maxTokens: 100,
  });
  
  for await (const chunk of stream) {
    process.stdout.write(chunk.content);
  }
  
  console.log('\n---');
  console.log('\nGet your haotokai API key at: https://haotokai.com');
  console.log('Support: PayPal, credit cards, and more payment methods.');
}

main().catch(err => {
  console.error('Error:', err.message);
  console.log('\nTroubleshooting tips:');
  console.log('1. Make sure you have a valid API key from https://haotokai.com');
  console.log('2. Set HAOTOKAI_API_KEY environment variable');
  console.log('3. Check your balance at haotokai.com');
});
