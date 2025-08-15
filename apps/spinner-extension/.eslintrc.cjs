module.exports = {
  extends: ['@drawday/eslint-config'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Extension-specific rules
    '@typescript-eslint/no-non-null-assertion': 'off', // Allow ! for getElementById

    // File and function size limits (matching CLAUDE.md requirements)
    'max-lines': [
      'error',
      {
        max: 200,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    'max-lines-per-function': [
      'error',
      {
        max: 100,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    'complexity': ['error', 10],
  },
};
