#!/bin/bash

echo "🔧 Testing Utils Package Fix"
echo "============================"

# Navigate to project root
cd /home/codingbutter/GitHub/drawday-solutions/project

# Clean utils dist directory
echo "🧹 Cleaning utils dist directory..."
rm -rf packages/@drawday/utils/dist
echo "✅ Cleaned dist directory"

# Navigate to utils package
cd packages/@drawday/utils

echo "📦 Installing utils dependencies..."
pnpm install

echo "🏗️ Testing utils build..."
pnpm build

if [ $? -eq 0 ]; then
    echo "✅ Utils package build: SUCCESS"
    echo ""
    echo "📄 Generated files:"
    ls -la dist/
else
    echo "❌ Utils package build: FAILED"
    exit 1
fi

echo ""
echo "🎉 Utils package is now working correctly!"