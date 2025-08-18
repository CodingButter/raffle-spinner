import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: [
    'react',
    '@raffle-spinner/storage',
    '@raffle-spinner/spinner-physics',
    '@drawday/utils',
    '@drawday/hooks',
  ],
  sourcemap: true,
  minify: false,
  splitting: false,
});
