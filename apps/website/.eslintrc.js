/**
 * ESLint Configuration for Website
 *
 * Extends the shared monorepo configuration with
 * Next.js specific rules and settings.
 */

module.exports = {
  extends: ['next/core-web-vitals'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Next.js specific rule overrides
    '@next/next/no-html-link-for-pages': 'off',

    // Allow Next.js Image component
    '@next/next/no-img-element': 'off',

    // React rules for Next.js
    'react/react-in-jsx-scope': 'off',

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
  ignorePatterns: ['.next', 'out', 'public', 'next.config.mjs', 'postcss.config.mjs'],
};
