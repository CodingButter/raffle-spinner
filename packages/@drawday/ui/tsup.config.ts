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
    'src/select.ts',
  ],
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disabled due to DTS build error
  clean: true,
  external: ['react', 'react-dom', '@drawday/utils'],
  sourcemap: true,
  minify: false,
  splitting: false,
});
