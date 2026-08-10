/// <reference types="vitest/config" />
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  cacheDir: process.env.STARTER_VITE_CACHE_DIR,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5202,
    strictPort: true,
    watch: {
      ignored: [
        '**/coverage/**',
        '**/test-results/**',
        '**/playwright-report/**',
        '**/dist/**',
        '**/src-tauri/target/**',
      ],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: process.env.VITEST_COVERAGE_DIR,
    },
  },
})
