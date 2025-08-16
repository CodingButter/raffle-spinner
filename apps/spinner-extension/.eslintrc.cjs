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
  overrides: [
    {
      // TODO: These files need refactoring to meet 200-line limit
      files: [
        'src/components/options/BezierCurveEditor.tsx',
        'src/components/options/BrandingSettings.tsx',
        'src/components/options/CSVImportDialog.tsx',
        'src/components/options/ColumnMapper.tsx',
        'src/components/options/OptionsTab.tsx',
        'src/components/options/ProbabilityManager.tsx',
        'src/components/options/SavedMappingsManager.tsx',
        'src/components/options/ShareDialog.tsx',
        'src/components/options/SpinnerCustomization.tsx',
        'src/components/options/SpinnerSettings.tsx',
        'src/components/options/SubscriptionModal.tsx',
        'src/components/options/ThemeColors.tsx',
        'src/components/options/tabs/OverviewTab.tsx',
        'src/components/side-panel/AnimationController.tsx',
        'src/components/side-panel/WinnerDisplay.tsx',
        'src/components/ui/image-upload.tsx',
        'src/components/ui/info-tooltip.tsx',
        'src/components/ui/subscription-guard.tsx',
        'src/components/ui/subscription-status.tsx',
        'src/contexts/SubscriptionContext.tsx',
        'src/contexts/ThemeContext.tsx',
        'src/hooks/useCSVImport.ts',
        'src/lib/help-content.tsx',
        'src/pages/OptionsPage.tsx',
        'src/pages/SidePanel.tsx',
      ],
      rules: {
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        'complexity': 'off',
      },
    },
  ],
};
