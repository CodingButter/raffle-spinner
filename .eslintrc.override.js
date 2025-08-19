
module.exports = {
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'max-lines': ['warn', { max: 600, skipBlankLines: true, skipComments: true }],
        'max-lines-per-function': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
        'complexity': ['warn', 15],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      }
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        'max-lines': 'off',
        'max-lines-per-function': 'off',
      }
    }
  ]
};