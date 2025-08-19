/**
 * Temporary ESLint Override Configuration
 * Author: David Miller, Lead Developer Architect
 * Date: 2025-08-19
 * 
 * This configuration provides temporary relaxation of certain rules
 * while we refactor legacy code to meet our quality standards.
 * 
 * IMPORTANT: This is a TEMPORARY measure. All files listed here
 * must be refactored to meet standard limits.
 */

module.exports = {
  overrides: [
    // Test files - slightly relaxed limits
    {
      files: [
        '**/__tests__/**/*.{ts,tsx,js,jsx}',
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}'
      ],
      rules: {
        'max-lines-per-function': ['error', { 
          max: 200, 
          skipBlankLines: true,
          skipComments: true 
        }],
        'max-lines': ['error', { 
          max: 600, 
          skipBlankLines: true,
          skipComments: true 
        }],
        '@typescript-eslint/no-explicit-any': 'warn',
        'complexity': ['error', { max: 15 }] // Slightly relaxed for test setup
      }
    },

    // Legacy components pending refactor - PRIORITY 1
    {
      files: [
        'apps/spinner-extension/src/components/options/ColumnMapper.tsx',
        'apps/spinner-extension/src/pages/SidePanel.tsx',
        'apps/spinner-extension/src/components/ui/subscription-status.tsx'
      ],
      rules: {
        'max-lines': ['warn', { max: 400 }],
        'max-lines-per-function': ['warn', { max: 150 }],
        'complexity': ['warn', { max: 25 }]
      }
    },

    // UI components pending refactor - PRIORITY 2
    {
      files: [
        'apps/spinner-extension/src/components/options/ThemeColors.tsx',
        'apps/spinner-extension/src/components/options/SavedMappingsManager.tsx',
        'apps/spinner-extension/src/components/ui/image-upload.tsx',
        'apps/spinner-extension/src/components/ui/info-tooltip.tsx'
      ],
      rules: {
        'max-lines': ['warn', { max: 250 }],
        'max-lines-per-function': ['warn', { max: 120 }],
        'complexity': ['warn', { max: 15 }]
      }
    },

    // Settings components - PRIORITY 3
    {
      files: [
        'apps/spinner-extension/src/components/options/BrandingSettings.tsx',
        'apps/spinner-extension/src/components/options/SpinnerSettings.tsx',
        'apps/spinner-extension/src/components/options/customization/*.tsx'
      ],
      rules: {
        'max-lines-per-function': ['warn', { max: 130 }],
        'complexity': ['warn', { max: 12 }]
      }
    },

    // Context providers - PRIORITY 4
    {
      files: [
        'apps/spinner-extension/src/contexts/*.tsx'
      ],
      rules: {
        'max-lines-per-function': ['warn', { max: 150 }],
        'react-hooks/exhaustive-deps': 'warn'
      }
    },

    // Hooks - PRIORITY 5
    {
      files: [
        'apps/spinner-extension/src/hooks/*.ts'
      ],
      rules: {
        'max-lines': ['warn', { max: 250 }],
        'max-lines-per-function': ['warn', { max: 150 }],
        'complexity': ['warn', { max: 15 }]
      }
    },

    // Test mocks and utilities
    {
      files: [
        '**/test/mocks/**',
        '**/test/utils/**',
        '**/*.mock.{ts,js}',
        '**/*.fixture.{ts,js}'
      ],
      rules: {
        '@typescript-eslint/ban-types': 'warn',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }]
      }
    },

    // Temporary build scripts
    {
      files: [
        '*.js',
        'scripts/**/*.{js,mjs}',
        '**/*.config.{js,ts}',
        '**/test-*.js',
        '**/fix-*.sh'
      ],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-console': 'off'
      }
    }
  ]
};