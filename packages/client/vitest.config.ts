import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@mmbn/shared': path.resolve(__dirname, '../shared/src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
      '@client': path.resolve(__dirname, './src'),
    },
  },
});
