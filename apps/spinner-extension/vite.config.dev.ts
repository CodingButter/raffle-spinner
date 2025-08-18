import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/**
 * Vite configuration for standalone development mode
 * 
 * This configuration allows running the Chrome extension
 * as a regular web app for easier development and testing.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  server: {
    port: 5173,
    open: '/src/dev/standalone.html',
    host: true,
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@raffle-spinner': path.resolve(__dirname, '../../packages'),
      '@drawday': path.resolve(__dirname, '../../packages/@drawday'),
    },
  },
  
  build: {
    rollupOptions: {
      input: {
        standalone: path.resolve(__dirname, 'src/dev/standalone.html'),
        sidepanel: path.resolve(__dirname, 'src/sidepanel.tsx'),
        options: path.resolve(__dirname, 'src/options.tsx'),
      },
    },
  },
  
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.STANDALONE_MODE': JSON.stringify('true'),
  },
});