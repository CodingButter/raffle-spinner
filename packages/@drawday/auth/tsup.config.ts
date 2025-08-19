import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disabled due to build errors
  sourcemap: true,
  clean: true,
  external: ['react', 'next'],
  target: 'es2020',
});
