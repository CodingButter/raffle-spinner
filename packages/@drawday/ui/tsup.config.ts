import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/button.ts',
    'src/input.ts',
    'src/label.ts',
    'src/alert.ts',
    'src/card.ts',
  ],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
    compilerOptions: {
      jsx: 'react-jsx',
      moduleResolution: 'bundler',
    },
  },
  clean: true,
  external: ['react', 'react-dom', '@drawday/utils'],
  sourcemap: true,
  minify: false,
  splitting: false,
});
