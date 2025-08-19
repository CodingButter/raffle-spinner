#!/bin/bash

echo "🚀 COMPREHENSIVE TESTING INFRASTRUCTURE FIX"
echo "============================================="
echo "David Miller - Lead Developer Architect"
echo "Emergency Fix for 100% Test Pass Rate Requirement"
echo ""

set -e  # Exit on any error

# Navigate to project root
cd /home/codingbutter/GitHub/drawday-solutions/project

echo "📍 Working directory: $(pwd)"
echo ""

# Function to run command with proper error handling
run_cmd() {
    local description="$1"
    shift
    echo "⚡ $description"
    echo "----------------------------------------"
    
    if "$@"; then
        echo "✅ $description: SUCCESS"
    else
        echo "❌ $description: FAILED"
        exit 1
    fi
    echo ""
}

# PHASE 1: Clean Everything
echo "🧹 PHASE 1: DEEP CLEAN"
echo "======================"

run_cmd "Removing all node_modules" find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
run_cmd "Removing all dist directories" find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
run_cmd "Removing pnpm cache" rm -rf ~/.pnpm-store || true

# PHASE 2: Fresh Install
echo "📦 PHASE 2: FRESH INSTALLATION"
echo "==============================="

run_cmd "Installing dependencies" pnpm install --frozen-lockfile

# PHASE 3: Fix TypeScript Configuration Issues
echo "🔧 PHASE 3: TYPESCRIPT CONFIGURATION FIX"
echo "=========================================="

# Update utils tsconfig to fix the import.meta issue
cat > packages/@drawday/utils/tsconfig.json << 'EOF'
{
  "extends": "@drawday/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "lib": ["ES2020", "DOM"],
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

echo "✅ Updated utils TypeScript configuration"

# PHASE 4: Build Packages in Dependency Order
echo "🏗️ PHASE 4: ORDERED PACKAGE BUILDS"
echo "===================================="

# Build config packages first
run_cmd "Building TypeScript config" pnpm --filter @drawday/typescript-config build
run_cmd "Building ESLint config" pnpm --filter @drawday/eslint-config build  
run_cmd "Building Prettier config" pnpm --filter @drawday/prettier-config build
run_cmd "Building Tailwind config" pnpm --filter @drawday/tailwind-config build

# Build core packages
run_cmd "Building types" pnpm --filter @drawday/types build
run_cmd "Building utils" pnpm --filter @drawday/utils build
run_cmd "Building hooks" pnpm --filter @drawday/hooks build
run_cmd "Building security" pnpm --filter @drawday/security build

# Build UI and auth
run_cmd "Building UI components" pnpm --filter @drawday/ui build
run_cmd "Building auth" pnpm --filter @drawday/auth build

# Build spinner packages  
run_cmd "Building storage" pnpm --filter @raffle-spinner/storage build
run_cmd "Building CSV parser" pnpm --filter @raffle-spinner/csv-parser build
run_cmd "Building spinner physics" pnpm --filter @raffle-spinner/spinner-physics build
run_cmd "Building contexts" pnpm --filter @raffle-spinner/contexts build
run_cmd "Building spinners" pnpm --filter @raffle-spinner/spinners build
run_cmd "Building subscription" pnpm --filter @raffle-spinner/subscription build

# Build applications last
run_cmd "Building website" pnpm --filter @drawday/website build
run_cmd "Building spinner extension" pnpm --filter @drawday/spinner-extension build

# PHASE 5: Run All Tests
echo "🧪 PHASE 5: COMPREHENSIVE TESTING"  
echo "=================================="

# Test individual packages
run_cmd "Testing spinner extension" pnpm --filter @drawday/spinner-extension test:run
run_cmd "Testing CSV parser" pnpm --filter @raffle-spinner/csv-parser test:run  
run_cmd "Testing website" pnpm --filter @drawday/website test:run

# PHASE 6: Quality Checks
echo "📊 PHASE 6: QUALITY VERIFICATION"
echo "================================="

run_cmd "Running linter" pnpm lint
run_cmd "Running type checker" pnpm typecheck

echo ""
echo "🎉 SUCCESS! TESTING INFRASTRUCTURE FULLY RESTORED"
echo "=================================================="
echo "✅ All packages built successfully"
echo "✅ All tests passing"  
echo "✅ No linting errors"
echo "✅ No TypeScript errors"
echo "✅ 100% test pass rate achieved"
echo ""
echo "📋 FIXES APPLIED:"
echo "- Updated utils TypeScript config to ES2020 (fixes import.meta issue)"
echo "- Deep cleaned all build artifacts and caches"
echo "- Rebuilt packages in correct dependency order"
echo "- Verified all test suites pass"
echo ""
echo "🚀 Team can proceed with development!"

exit 0