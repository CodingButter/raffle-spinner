#!/bin/bash

# Testing Infrastructure Verification Script
# Author: David Miller, Lead Developer Architect
# P0 Priority - As directed by Jamie

set -e  # Exit on first error

echo "🔍 TESTING INFRASTRUCTURE VERIFICATION"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to project root
cd /home/codingbutter/GitHub/drawday-solutions/project

echo "📍 Working directory: $(pwd)"
echo ""

# Function to check command result
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2 - PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ $2 - FAILED${NC}"
        return 1
    fi
}

# Track overall status
ALL_PASS=true

echo "1️⃣  Checking pnpm installation..."
if command -v pnpm &> /dev/null; then
    echo -e "${GREEN}✅ pnpm is installed: $(pnpm --version)${NC}"
else
    echo -e "${RED}❌ pnpm is not installed${NC}"
    echo "   Installing pnpm..."
    npm install -g pnpm@9.15.9
fi
echo ""

echo "2️⃣  Installing dependencies..."
pnpm install --no-frozen-lockfile 2>&1 | tail -5
check_result $? "Dependency installation" || ALL_PASS=false
echo ""

echo "3️⃣  Running ESLint..."
pnpm lint 2>&1 | tail -10 || true
# Don't fail on lint errors, just report
echo -e "${YELLOW}⚠️  ESLint - Check output above for issues${NC}"
echo ""

echo "4️⃣  Running TypeScript check..."
pnpm typecheck 2>&1 | tail -10 || true
# Don't fail on type errors, just report
echo -e "${YELLOW}⚠️  TypeScript - Check output above for issues${NC}"
echo ""

echo "5️⃣  Checking test setup..."
# Check if vitest is installed
if pnpm ls vitest &> /dev/null; then
    echo -e "${GREEN}✅ Vitest is installed${NC}"
    
    # Try to list tests
    echo "   Finding test files..."
    find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" 2>/dev/null | head -5
else
    echo -e "${YELLOW}⚠️  Vitest not found - installing...${NC}"
    pnpm add -D -w vitest @vitest/ui jsdom
fi
echo ""

echo "6️⃣  Checking E2E test setup..."
# Check if Playwright is installed
if pnpm ls @playwright/test &> /dev/null; then
    echo -e "${GREEN}✅ Playwright is installed${NC}"
else
    echo -e "${YELLOW}⚠️  Playwright not found - installing...${NC}"
    pnpm add -D -w @playwright/test
    pnpm exec playwright install chromium
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$ALL_PASS" = true ]; then
    echo -e "${GREEN}✅ Testing infrastructure is operational!${NC}"
    echo ""
    echo "You can now run:"
    echo "  pnpm test      - Run unit tests"
    echo "  pnpm test:e2e  - Run E2E tests"
else
    echo -e "${YELLOW}⚠️  Some checks need attention${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review ESLint and TypeScript errors above"
    echo "  2. Fix critical issues blocking tests"
    echo "  3. Run this script again to verify"
fi

echo ""
echo "To push fixes to development:"
echo "  git add ."
echo "  git commit -m \"fix: P0 testing infrastructure\""
echo "  git push origin development"