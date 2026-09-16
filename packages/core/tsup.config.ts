import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  // .d.ts is generated separately via `tsc -p tsconfig.build.json` (see
  // package.json `build` script) — tsup's bundled rollup-plugin-dts is
  // incompatible with the TypeScript 7 preview pinned in this workspace.
  dts: false,
  clean: true,
  sourcemap: true,
});
