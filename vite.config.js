/// <reference types="vitest" />
// import { dirname, resolve } from 'node:path';
// import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import tsconfigPaths from 'vite-tsconfig-paths';
import topLevelAwait from 'vite-plugin-top-level-await';

// const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tsconfigPaths(), topLevelAwait(), wasm()],
  test: { watch: false },
});
