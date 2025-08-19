#!/bin/bash

# Fix Testing Infrastructure Script
# Author: David Miller, Lead Developer Architect

set -e  # Exit on error

echo "🔧 Starting Testing Infrastructure Fix..."
echo "================================================"

# Navigate to project root
cd /home/codingbutter/GitHub/drawday-solutions/project

echo "📍 Current directory: $(pwd)"
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found, installing..."
    npm install -g pnpm@9.15.9
else
    echo "✅ pnpm is installed: $(pnpm --version)"
fi

echo ""
echo "📦 Installing dependencies..."
echo "------------------------------"
pnpm install

echo ""
echo "🔍 Running ESLint..."
echo "------------------------------"
pnpm lint 2>&1 | tee lint-output.txt || true

echo ""
echo "🔍 Running TypeScript check..."
echo "------------------------------"
pnpm typecheck 2>&1 | tee typecheck-output.txt || true

echo ""
echo "🔍 Attempting to run tests..."
echo "------------------------------"
pnpm test 2>&1 | tee test-output.txt || true

echo ""
echo "📊 Summary:"
echo "------------------------------"
echo "✅ Dependencies installed"
echo "📄 Lint errors saved to lint-output.txt"
echo "📄 TypeScript errors saved to typecheck-output.txt"
echo "📄 Test output saved to test-output.txt"
echo ""
echo "🎯 Next step: Fix errors in the output files"