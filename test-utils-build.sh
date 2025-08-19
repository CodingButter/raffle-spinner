#!/bin/bash

echo "Testing @drawday/utils build specifically..."
cd /home/codingbutter/GitHub/drawday-solutions/project

echo "Current directory: $(pwd)"
echo ""

echo "Checking utils package directory..."
ls -la packages/@drawday/utils/

echo ""
echo "Checking utils src directory..."
ls -la packages/@drawday/utils/src/

echo ""
echo "Attempting to build utils package..."
cd packages/@drawday/utils && pnpm build