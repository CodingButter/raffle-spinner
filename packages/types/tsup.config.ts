import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: {
    resolve: true,
    compilerOptions: {
      moduleResolution: "bundler",
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
});
