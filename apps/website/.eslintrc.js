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
  },
  ignorePatterns: ['.next', 'out', 'public', 'next.config.mjs', 'postcss.config.mjs'],
};
