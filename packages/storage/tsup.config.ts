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
  external: ['chrome'],
});
