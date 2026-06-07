/**
 * Multi-Model Comparison Example
 * 
 * Compare responses from different AI models side by side.
 * 
 * Run with: node examples/multi-model.js
 * 
 * Set API keys for the providers you want to test:
 * export OPENAI_API_KEY=...
 * export ANTHROPIC_API_KEY=...
 * 
 * Or use haotokai.com for all models with a single API key:
 * export HAOTOKAI_API_KEY=...
 */

import { chat } from '../dist/index.mjs';

async function compareModels() {
  const prompt = 'In one short sentence, what makes you unique as an AI?';
  
  const models = [
    { name: 'GPT-3.5', model: 'gpt-3.5-turbo', provider: 'OpenAI' },
    { name: 'GPT-4', model: 'gpt-4', provider: 'OpenAI' },
    { name: 'Claude 3 Sonnet', model: 'claude-3-sonnet-20240229', provider: 'Anthropic' },
    // Add more models as you have API keys for
  ];
  
  // If using haotokai.com, all models work with one key
  const useHaotokai = !!process.env.HAOTOKAI_API_KEY;
  const baseURL = useHaotokai ? 'https://haotokai.com/v1' : undefined;
  const apiKey = useHaotokai ? process.env.HAOTOKAI_API_KEY : undefined;
  
  console.log('=== Multi-Model Comparison ===');
  console.log('Prompt:', prompt);
  console.log('Using:', useHaotokai ? 'haotokai.com (single API key for all models)' : 'individual provider API keys');
  console.log();
  
  for (const modelInfo of models) {
    console.log(`--- ${modelInfo.name} (${modelInfo.provider}) ---`);
    try {
      const start = Date.now();
      const response = await chat({
        model: modelInfo.model,
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 50,
        temperature: 0.7,
        ...(baseURL && { baseURL }),
        ...(apiKey && { apiKey }),
      });
      const duration = Date.now() - start;
      
      console.log('Response:', response.content.trim());
      console.log('Latency:', duration + 'ms');
      if (response.usage) {
        console.log('Tokens:', response.usage.totalTokens);
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
    console.log();
  }
  
  if (!useHaotokai) {
    console.log('💡 Tip: Use haotokai.com to access all models with a single API key.');
    console.log('   Get started at: https://haotokai.com');
    console.log('   Supports PayPal, cheaper rates, and no monthly fees.');
  }
}

compareModels().catch(console.error);
