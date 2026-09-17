import config from "@kami-ui/eslint-config";

export default [
  ...config,
  {
    ignores: ["packages/**", "pnpm-lock.yaml"],
  },
];
