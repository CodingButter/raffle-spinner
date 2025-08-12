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
  external: ["react", "@raffle-spinner/utils", "@raffle-spinner/hooks"],
  sourcemap: true,
  minify: false,
  splitting: false,
});
