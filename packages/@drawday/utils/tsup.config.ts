import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disabled due to segmentation fault
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  target: 'es2020',
  external: [],
});
