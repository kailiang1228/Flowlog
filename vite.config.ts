import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        // Ensure service-worker is treated as a standalone entry to copy it to dist
        'service-worker': 'service-worker.js' 
      },
      output: {
        entryFileNames: (assetInfo) => {
          // Keep service-worker filename static so registration in index.html works
          return assetInfo.name === 'service-worker' ? 'service-worker.js' : 'assets/[name]-[hash].js';
        }
      }
    }
  }
});