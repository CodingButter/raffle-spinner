import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: {
    resolve: true,
    compilerOptions: {
      jsx: "react-jsx",
      moduleResolution: "bundler",
    },
  },
  clean: true,
  external: ["react", "react-dom", "@raffle-spinner/utils"],
  sourcemap: true,
  minify: false,
  splitting: false,
});
