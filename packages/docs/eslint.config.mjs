import config from "@kami-ui/eslint-config/next";

export default [
  ...config,
  {
    files: ["src/app/**/{page,layout}.tsx"],
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowExportNames: ["metadata", "generateMetadata", "viewport"] },
      ],
    },
  },
  { ignores: [".next/**", "coverage/**", "next-env.d.ts"] },
];
