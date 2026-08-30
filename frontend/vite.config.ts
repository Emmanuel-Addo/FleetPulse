/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      include: ['src/context/**', 'src/hooks/**', 'src/utils/**', 'src/pages/**', 'src/components/**'],
      exclude: ['src/main.tsx', 'src/App.tsx', 'src/index.css', 'src/App.css', 'src/vite-env.d.ts', 'src/setupTests.ts', 'src/assets/**', 'src/tests/**', 'src/components/ui/**'],
    },
  },
})
