import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disabled due to build errors
  clean: true,
  external: ['react', '@drawday/utils', '@drawday/hooks'],
  sourcemap: true,
  minify: false,
  splitting: false,
});
