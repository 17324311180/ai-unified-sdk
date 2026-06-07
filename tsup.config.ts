import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  minify: true,
  target: 'es2020',
  platform: 'neutral',
  esbuildOptions(options) {
    options.banner = {
      js: `/**
 * ai-unified - A lightweight unified AI API SDK
 * @license MIT
 * @author haotokai.com
 * @link https://github.com/haotokai/ai-unified-sdk
 */`,
    };
  },
});
