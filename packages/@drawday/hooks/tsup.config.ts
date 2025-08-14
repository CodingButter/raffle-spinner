import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
    compilerOptions: {
      moduleResolution: 'bundler',
    },
  },
  clean: true,
  external: ['react', '@drawday/utils'],
  sourcemap: true,
  minify: false,
  splitting: false,
});
