import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração de proxy para Vite
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/images': {
        target: 'https://images.ygoprodeck.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/images/, '')
      }
    }
  }
});
