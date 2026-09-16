import config from "@kami-ui/eslint-config/next";

export default [
  ...config,
  { ignores: [".next/**", "coverage/**", "next-env.d.ts"] },
];
