import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: no GitHub Pages o site vive em /clube-socios/; em dev fica na raiz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/clube-socios/' : '/',
  plugins: [react()],
  server: { port: 5180 },
}));
