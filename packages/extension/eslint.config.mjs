import config from "@kami-ui/eslint-config/base";

export default [
  ...config,
  { ignores: ["dist/**", "static/**"] },
  {
    files: ["src/**/*.ts", "scripts/**/*.ts", "scripts/**/*.mjs"],
    rules: {
      // This package is CLI tooling (assembler/watcher/zip/icon generator) -
      // console output is the intended UI, not leftover debug logging.
      "no-console": "off",
    },
  },
];
