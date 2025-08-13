import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/client.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: false,
  clean: true,
  external: ['react', 'react-dom', 'next'],
  noExternal: ['zod', 'jwt-decode'],
  splitting: false,
});