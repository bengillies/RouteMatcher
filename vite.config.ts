import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    target: "esnext",
    lib: {
      entry: "src/index.ts",
      name: "RouteMatcher",
      fileName: () => "route-matcher.js",
      formats: ["es"]
    },
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        exports: "named"
      }
    }
  },
  plugins: [
    dts({
      tsconfigPath: "tsconfig.build.json",
      entryRoot: "src",
      outDir: "dist/types",
      insertTypesEntry: true
    })
  ]
});
