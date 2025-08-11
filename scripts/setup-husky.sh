#!/bin/bash

# This script sets up Husky pre-commit hooks for the project
# Run this after initializing a git repository

echo "Setting up Husky pre-commit hooks..."

# Initialize Husky
npx husky init

# Create pre-commit hook
cat > .husky/pre-commit <<'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged for changed files
npx lint-staged

# Run type checking
pnpm typecheck
EOF

chmod +x .husky/pre-commit

echo "✅ Husky pre-commit hooks have been set up successfully!"
echo "The following checks will run before each commit:"
echo "  - ESLint (with auto-fix) on staged files"
echo "  - Prettier formatting on staged files"
echo "  - TypeScript type checking on the entire project"