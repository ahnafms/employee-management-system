import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "worker/index": "src/worker/index.ts",
  },
  format: ["cjs"],
  outDir: "dist",
  clean: true,
  bundle: true,
  platform: "node",
  target: "node20",
});
