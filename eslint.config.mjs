import config from "@kami-ui/eslint-config";

export default [
  ...config,
  {
    ignores: ["packages/**", ".changeset/**", "pnpm-lock.yaml"],
  },
];
