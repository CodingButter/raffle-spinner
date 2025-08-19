#!/bin/bash

echo "Direct Fix Approach for Utils Package"
echo "======================================"

cd /home/codingbutter/GitHub/drawday-solutions/project

# Check git status in the utils directory
echo "Git status check:"
git status packages/@drawday/utils/

echo ""
echo "Checking for any temp or backup files:"
find packages/@drawday/utils/ -name "*tmp*" -o -name "*.bak" -o -name "*~" 2>/dev/null

echo ""
echo "Content of url-utils.ts around line 13:"
sed -n '10,20p' packages/@drawday/utils/src/url-utils.ts

echo ""
echo "Attempting direct tsup build with verbose output:"
cd packages/@drawday/utils && npx tsup --verbose

echo ""
echo "Done with direct approach"