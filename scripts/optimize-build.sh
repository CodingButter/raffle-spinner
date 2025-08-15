#!/bin/bash

# Build Optimization Script for DrawDay Monorepo
# This script implements various caching and parallel build strategies

set -e

echo "🚀 DrawDay Build Optimization Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if turbo is installed
if ! command -v turbo &> /dev/null; then
    print_error "Turbo is not installed. Please run 'pnpm install' first."
    exit 1
fi

# Parse arguments
BUILD_TYPE="${1:-standard}"
CLEAN_CACHE="${2:-false}"

# Function to measure build time
measure_time() {
    local start_time=$1
    local end_time=$2
    local duration=$((end_time - start_time))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    echo "${minutes}m ${seconds}s"
}

# Clean cache if requested
if [ "$CLEAN_CACHE" = "clean" ]; then
    print_status "Cleaning build cache..."
    pnpm clean:cache
    print_success "Cache cleaned"
fi

# Start turbo daemon for improved performance
print_status "Starting Turbo daemon..."
turbo daemon start &> /dev/null || true
sleep 1

# Check daemon status
if turbo daemon status &> /dev/null; then
    print_success "Turbo daemon is running"
else
    print_warning "Turbo daemon failed to start, continuing without it"
fi

# Get system info for optimal concurrency
CPU_CORES=$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)
OPTIMAL_CONCURRENCY=$((CPU_CORES * 2))

print_status "System has $CPU_CORES CPU cores"
print_status "Using concurrency level: $OPTIMAL_CONCURRENCY"

# Run build based on type
START_TIME=$(date +%s)

case "$BUILD_TYPE" in
    "standard")
        print_status "Running standard build with optimized caching..."
        pnpm build
        ;;
    
    "parallel")
        print_status "Running fully parallel build..."
        turbo run build --parallel --concurrency=$OPTIMAL_CONCURRENCY
        ;;
    
    "website")
        print_status "Building website only with dependencies..."
        pnpm build:website
        ;;
    
    "extension")
        print_status "Building extension only with dependencies..."
        pnpm build:extension
        ;;
    
    "incremental")
        print_status "Running incremental build (changed packages only)..."
        turbo run build --filter='...[HEAD^]' --concurrency=$OPTIMAL_CONCURRENCY
        ;;
    
    "analyze")
        print_status "Running build with analysis..."
        turbo run build --summarize --concurrency=$OPTIMAL_CONCURRENCY
        
        if [ -f ".turbo/runs/"*"/summary.json" ]; then
            print_status "Build summary available in .turbo/runs/"
        fi
        ;;
    
    "benchmark")
        print_status "Running build benchmark..."
        
        # Clean build (no cache)
        print_status "Test 1: Clean build (no cache)"
        pnpm clean:cache &> /dev/null
        CLEAN_START=$(date +%s)
        turbo run build --force --concurrency=$OPTIMAL_CONCURRENCY > /dev/null 2>&1
        CLEAN_END=$(date +%s)
        CLEAN_TIME=$(measure_time $CLEAN_START $CLEAN_END)
        
        # Cached build
        print_status "Test 2: Fully cached build"
        CACHED_START=$(date +%s)
        turbo run build --concurrency=$OPTIMAL_CONCURRENCY > /dev/null 2>&1
        CACHED_END=$(date +%s)
        CACHED_TIME=$(measure_time $CACHED_START $CACHED_END)
        
        # Parallel build
        print_status "Test 3: Parallel build"
        pnpm clean:cache &> /dev/null
        PARALLEL_START=$(date +%s)
        turbo run build --parallel --concurrency=100% > /dev/null 2>&1
        PARALLEL_END=$(date +%s)
        PARALLEL_TIME=$(measure_time $PARALLEL_START $PARALLEL_END)
        
        echo ""
        echo "📊 Benchmark Results:"
        echo "===================="
        echo "Clean build:    $CLEAN_TIME"
        echo "Cached build:   $CACHED_TIME"
        echo "Parallel build: $PARALLEL_TIME"
        echo ""
        
        # Calculate speedup
        SPEEDUP=$((CLEAN_END - CLEAN_START))
        CACHED_SPEEDUP=$((CACHED_END - CACHED_START))
        if [ $CACHED_SPEEDUP -gt 0 ]; then
            IMPROVEMENT=$((SPEEDUP * 100 / CACHED_SPEEDUP))
            echo "Cache provides ~${IMPROVEMENT}% speedup"
        fi
        ;;
    
    *)
        print_error "Unknown build type: $BUILD_TYPE"
        echo "Usage: $0 [standard|parallel|website|extension|incremental|analyze|benchmark] [clean]"
        exit 1
        ;;
esac

END_TIME=$(date +%s)
BUILD_TIME=$(measure_time $START_TIME $END_TIME)

# Print cache statistics
if command -v du &> /dev/null; then
    CACHE_SIZE=$(du -sh .turbo 2>/dev/null | cut -f1 || echo "0")
    print_status "Cache size: $CACHE_SIZE"
fi

# Show build graph if requested
if [ "$SHOW_GRAPH" = "true" ]; then
    print_status "Generating build graph..."
    turbo run build --graph=graph.html
    print_success "Build graph saved to graph.html"
fi

print_success "Build completed in $BUILD_TIME"

# Provide optimization suggestions
echo ""
echo "💡 Optimization Tips:"
echo "====================="
echo "1. Use 'pnpm build:parallel' for fastest builds on multi-core systems"
echo "2. Use 'pnpm build:incremental' to only rebuild changed packages"
echo "3. Keep turbo daemon running with 'turbo daemon start'"
echo "4. Use remote caching for team collaboration (configure in turbo.json)"
echo "5. Run 'scripts/optimize-build.sh benchmark' to measure improvements"