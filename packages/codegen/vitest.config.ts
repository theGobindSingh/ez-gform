import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Full ts.createProgram type-checks against real .d.ts output take
    // longer than Vitest's 5s default, especially the first run per file.
    testTimeout: 20000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/__test-utils__/**"],
    },
  },
});
