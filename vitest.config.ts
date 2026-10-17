import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      '@/components/dev/geopolitical-monitor': path.resolve(__dirname, './components/geopolitical-monitor'),
      '@': path.resolve(__dirname, './'),
    },
    execArgv: ['--max-old-space-size=4096'],
    testTimeout: 30000,
    exclude: [...configDefaults.exclude, '.agents/**', '.kiro/**', '.claude/**'],
  },
});
