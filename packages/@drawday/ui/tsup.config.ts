import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/button.ts',
    'src/input.ts',
    'src/label.ts',
    'src/alert.ts',
    'src/card.ts',
    'src/badge.ts',
    'src/dialog.ts',
    'src/radio-group.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom', '@drawday/utils'],
  sourcemap: true,
  minify: false,
  splitting: false,
});
