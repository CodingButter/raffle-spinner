#!/bin/bash

# Build Monitor Script
# Monitors memory usage during build process and detects potential issues

echo "🔍 Starting build monitor..."
echo "📊 Initial memory status:"
free -h

# Function to monitor memory
monitor_memory() {
    while true; do
        # Get memory usage
        MEM_USED=$(free -m | awk 'NR==2{printf "%.1f", $3/1024}')
        MEM_TOTAL=$(free -m | awk 'NR==2{printf "%.1f", $2/1024}')
        MEM_PERCENT=$(free -m | awk 'NR==2{printf "%.0f", $3*100/$2}')
        
        # Check for high memory usage
        if [ "$MEM_PERCENT" -gt 90 ]; then
            echo "⚠️  WARNING: High memory usage detected: ${MEM_USED}GB / ${MEM_TOTAL}GB (${MEM_PERCENT}%)"
        fi
        
        sleep 2
    done
}

# Start memory monitor in background
monitor_memory &
MONITOR_PID=$!

# Run the build
echo "🏗️  Starting build process..."
NODE_OPTIONS='--max-old-space-size=4096' pnpm build

BUILD_EXIT_CODE=$?

# Stop memory monitor
kill $MONITOR_PID 2>/dev/null

echo ""
echo "📊 Final memory status:"
free -h

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed with exit code: $BUILD_EXIT_CODE"
    
    # Check dmesg for segfaults
    if dmesg | tail -20 | grep -q "segfault"; then
        echo "💥 Segmentation fault detected in system logs!"
        echo "Recent segfault entries:"
        dmesg | tail -20 | grep "segfault"
    fi
fi

exit $BUILD_EXIT_CODE