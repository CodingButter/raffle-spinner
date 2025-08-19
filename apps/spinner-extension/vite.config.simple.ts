import { defineConfig } from 'vite';
import { resolve } from 'path';

// Minimal Vite config for simplified iframe-based extension
export default defineConfig({
  build: {
    outDir: 'DrawDaySpinnerSimple',
    emptyOutDir: true,
    // No bundling needed - just copy static files
    rollupOptions: {
      input: {
        // Empty - we're not bundling anything
      },
    },
    copyPublicDir: true,
  },
  publicDir: 'public',
});