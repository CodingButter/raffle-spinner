module.exports = {
  root: true,
  extends: ['@drawday/eslint-config'],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.config.js',
    '*.config.ts',
    '*.config.cjs',
    '.eslintrc.js',
    'scripts/',
    'packages/eslint-config/',
    'packages/prettier-config/',
    'packages/typescript-config/',
    'apps/website/',
  ],
  rules: {
    // Start with basic rules and gradually increase strictness
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],

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
    complexity: ['error', 10],
  },
};
