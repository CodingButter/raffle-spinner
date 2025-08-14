import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
    compilerOptions: {
      jsx: 'react-jsx',
      moduleResolution: 'bundler',
    },
  },
  clean: true,
  external: ['react', '@drawday/utils', '@drawday/hooks'],
  sourcemap: true,
  minify: false,
  splitting: false,
});
