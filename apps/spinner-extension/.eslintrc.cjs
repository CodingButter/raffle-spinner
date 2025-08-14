module.exports = {
  extends: ['@drawday/eslint-config'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Extension-specific rules
    '@typescript-eslint/no-non-null-assertion': 'off', // Allow ! for getElementById
  },
};
