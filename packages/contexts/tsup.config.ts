import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['react', '@raffle-spinner/utils', '@raffle-spinner/hooks'],
  sourcemap: true,
  minify: false,
  splitting: false,
});