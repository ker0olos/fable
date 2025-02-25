/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [wasm()],
  test: {
    watch: false,
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
});
