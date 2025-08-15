import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'next'],
  target: 'es2020',
  splitting: false,
  treeshake: true,
  minify: false, // Faster builds in dev
  bundle: true,
  outDir: 'dist',
});
