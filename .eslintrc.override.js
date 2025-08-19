
/**
 * ESLint Override Configuration - TEMPORARY
 * This allows the build to proceed while we refactor
 * All rules here should eventually be removed
 */
module.exports = {
  overrides: [
    // General TypeScript/TSX files - relaxed temporarily
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'max-lines': ['warn', { max: 400, skipBlankLines: true, skipComments: true }],
        'max-lines-per-function': ['warn', { max: 250, skipBlankLines: true, skipComments: true }],
        'complexity': ['warn', 25],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/ban-types': 'warn',
      }
    },
    // Test files - more relaxed
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/__tests__/**'],
      rules: {
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        'complexity': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-types': 'off',
      }
    },
    // JavaScript files and scripts
    {
      files: ['**/*.js', '**/*.mjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-console': 'off',
      }
    }
  ]
};