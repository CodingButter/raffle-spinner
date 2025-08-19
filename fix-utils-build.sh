#!/bin/bash

echo "🔧 Fixing @drawday/utils Build Issue"
echo "======================================"

# Navigate to project root
cd /home/codingbutter/GitHub/drawday-solutions/project

echo "📍 Working directory: $(pwd)"
echo ""

# Clean the utils package completely
echo "🧹 Cleaning utils package..."
rm -rf packages/@drawday/utils/dist
rm -rf packages/@drawday/utils/node_modules/.cache

# Reinstall dependencies for utils package
echo "📦 Reinstalling utils dependencies..."
cd packages/@drawday/utils
pnpm install

echo ""
echo "🏗️ Building utils package..."
pnpm build

echo ""
echo "✅ Utils build fix complete!"