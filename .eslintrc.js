module.exports = {
  root: true,
  extends: ["@raffle-spinner/eslint-config"],
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    "*.config.js",
    "*.config.ts",
    "*.config.cjs",
    ".eslintrc.js",
    "scripts/",
    "packages/eslint-config/",
    "packages/prettier-config/",
    "packages/typescript-config/",
  ],
  rules: {
    // Start with basic rules and gradually increase strictness
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
};
