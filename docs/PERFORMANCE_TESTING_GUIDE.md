# Performance Testing Guide

**Author:** Michael Thompson - Performance & Extension Engineer  
**Last Updated:** 2025-08-18

## Overview

This guide provides comprehensive documentation for running, interpreting, and troubleshooting performance tests in the DrawDay Spinner Extension. Our performance testing infrastructure ensures consistent 60fps animations, efficient memory usage, and optimal bundle sizes.

## Quick Start

### Running Performance Tests

```bash
# Run all performance tests
node scripts/run-all-performance-tests.mjs

# Run specific test suites
node scripts/spinner-perf-test.mjs    # Animation performance
node scripts/memory-test.mjs          # Memory usage and leaks
pnpm size-limit                       # Bundle size validation
```

### Performance Targets

| Metric | Target | Failure Threshold |
|--------|---------|------------------|
| **Animation FPS** | ≥60fps (P95) | <58fps |
| **Frame Time** | ≤16.67ms (P95) | >18ms |
| **Memory Peak** | ≤200MB | >250MB |
| **Memory Cleanup** | ≥95% | <90% |
| **Bundle Size** | ≤2MB compressed | >2.1MB |
| **Input Latency** | ≤100ms | >150ms |

## Test Suites

### 1. Animation Performance Testing

**Purpose:** Validates 60fps performance across different participant counts.

**Test Scenarios:**
- **Small Dataset**: 100 participants (baseline performance)
- **Medium Dataset**: 1,000 participants (typical usage)
- **Large Dataset**: 5,000 participants (heavy usage)
- **Stress Test**: 10,000+ participants (extreme load)

**Key Metrics:**
- **FPS (Frames Per Second)**: Must maintain ≥60fps during animation
- **P95 Frame Time**: 95% of frames must render in ≤16.67ms
- **Jank Detection**: <5% of frames can exceed 50ms render time
- **Input Latency**: Time from spin button click to animation start

**Example Output:**
```bash
📊 Testing: Large Dataset (5000 participants)
✅ Large Dataset: 60.0 fps (P95: 16.2ms)
   Memory: 3.1MB | Jank: 0.0% | Input Latency: 45ms
```

### 2. Memory Testing Suite

**Purpose:** Detects memory leaks and validates cleanup efficiency.

**Test Types:**
- **Single Animation**: Basic memory lifecycle validation
- **Multiple Cycles**: 5 consecutive animations to detect leaks
- **Large Dataset Memory**: Memory usage with 5,000 participants
- **Endurance Test**: 30 animation cycles for long-term stability

**Key Metrics:**
- **Peak Memory Usage**: Maximum memory during animation
- **Cleanup Percentage**: Memory recovered after animation ends
- **Growth Per Cycle**: Memory increase across multiple animations
- **Baseline Memory**: Starting memory before any operations

**Leak Detection Logic:**
```javascript
// Memory leak detected if growth per cycle >10MB
const memoryGrowth = finalMemory - baselineMemory;
const leakDetected = memoryGrowth > 10 * 1024 * 1024; // 10MB threshold
```

### 3. Bundle Size Monitoring

**Purpose:** Prevents bundle size regression and enforces size limits.

**Configuration:** Located in `apps/spinner-extension/package.json`
```json
{
  "size-limit": [
    {
      "name": "Total Extension Bundle",
      "path": "dist/**/*.{js,css}",
      "limit": "1.8MB",
      "gzip": true
    },
    {
      "name": "SlotMachine Component",
      "path": "dist/assets/SlotMachine*.js",
      "limit": "500KB",
      "gzip": true
    }
  ]
}
```

**Running Bundle Analysis:**
```bash
pnpm size-limit           # Check current sizes
pnpm size-limit --why     # Analyze bundle composition
```

## CI/CD Integration

### GitHub Actions Workflow

The performance tests run automatically on:
- **Pull Requests**: To `development` or `main` branches
- **Push to Development**: For continuous monitoring
- **Manual Dispatch**: For on-demand testing

**Workflow Location:** `.github/workflows/performance-tests.yml`

### Performance Reports

After each CI run, detailed performance reports are generated:

1. **GitHub PR Comments**: Automated performance summaries
2. **Artifacts**: Detailed JSON reports with full metrics
3. **Trend Analysis**: Comparison with baseline performance

**Example PR Comment:**
```markdown
## 🎯 Performance Test Results

### ✅ Animation Performance
- All scenarios maintain 60fps target
- P95 frame time: 16.2ms (within 16.67ms target)
- Input latency: 45ms (within 100ms target)

### 🧠 Memory Management  
- Peak usage: 4.9MB (well under 200MB limit)
- Memory cleanup: 98.5% (exceeds 95% target)
- No memory leaks detected

### 📦 Bundle Size
- Total size: 1.75MB (within 2MB limit)
- No size regression detected
```

## Interpreting Results

### Performance Report Structure

```json
{
  "timestamp": "2025-08-18T19:22:57.956Z",
  "results": [
    {
      "scenario": "Large Dataset",
      "participants": 5000,
      "performance": {
        "averageFps": 60.01,
        "p95FrameTime": 16.2,
        "jankPercentage": 0.0,
        "passed": true
      },
      "memory": {
        "peakUsageMB": 3.1,
        "cleanup": 98.5,
        "passed": true
      }
    }
  ]
}
```

### Understanding Performance Metrics

**Frame Rate Analysis:**
- `averageFps`: Overall animation smoothness
- `p95FrameTime`: 95th percentile render time (key metric)
- `jankFrames`: Frames taking >50ms (causes visual stuttering)

**Memory Analysis:**
- `peakUsageMB`: Maximum memory during animation
- `cleanup`: Percentage of memory recovered after animation
- `growth`: Memory increase across multiple test cycles

## Troubleshooting

### Common Performance Issues

#### 1. FPS Below 60fps Target

**Symptoms:**
```bash
❌ Large Dataset: 58.2 fps (P95: 18.5ms)
```

**Causes & Solutions:**
- **DOM Manipulation Overhead**: Batch DOM updates using `requestAnimationFrame`
- **CSS Animation Conflicts**: Use `transform` instead of changing layout properties
- **JavaScript Blocking**: Move heavy computations to Web Workers
- **Memory Pressure**: Optimize memory usage to reduce GC pauses

**Code Example - Optimize Animation Loop:**
```typescript
// ❌ Inefficient - causes layout thrashing
element.style.left = `${position}px`;

// ✅ Efficient - uses compositor
element.style.transform = `translateX(${position}px)`;
```

#### 2. Memory Leaks Detected

**Symptoms:**
```bash
❌ Memory Growth: 15.2MB per cycle (>10MB threshold)
```

**Common Causes:**
- **Event Listeners**: Not removed after component unmount
- **Intervals/Timeouts**: Not cleared properly
- **DOM References**: Holding references to removed elements
- **Animation Frames**: Not cancelled when component unmounts

**Solution Pattern:**
```typescript
useEffect(() => {
  const handleAnimation = () => { /* animation logic */ };
  const animationId = requestAnimationFrame(handleAnimation);
  
  return () => {
    cancelAnimationFrame(animationId); // ✅ Cleanup
  };
}, []);
```

#### 3. Bundle Size Exceeded

**Symptoms:**
```bash
❌ Total Extension Bundle: 2.15MB (limit: 2MB)
```

**Solutions:**
- **Code Splitting**: Split large components into separate chunks
- **Tree Shaking**: Remove unused dependencies
- **Compression**: Enable gzip/brotli compression
- **Asset Optimization**: Optimize images and fonts

**Analysis Commands:**
```bash
pnpm size-limit --why                    # Bundle analysis
npx webpack-bundle-analyzer dist/        # Visual bundle analysis
```

### Debugging Performance Issues

#### 1. Local Performance Profiling

```bash
# Run tests with additional debugging
DEBUG=1 node scripts/spinner-perf-test.mjs

# Generate flame charts (requires Chrome DevTools)
node --inspect scripts/spinner-perf-test.mjs
```

#### 2. Chrome DevTools Integration

1. Open Chrome DevTools
2. Go to Performance tab
3. Record during test execution
4. Analyze call stacks and flame charts

#### 3. Memory Profiling

```bash
# Memory snapshot analysis
node --inspect --max-old-space-size=4096 scripts/memory-test.mjs
```

### CI/CD Debugging

#### Performance Test Failures in CI

1. **Check Logs**: Review GitHub Actions logs for specific failure reasons
2. **Download Artifacts**: Get detailed performance reports from CI artifacts
3. **Compare Baselines**: Check if performance regression is due to recent changes
4. **Environment Differences**: Consider CI environment limitations vs local

#### Updating Performance Baselines

When legitimate performance changes occur:

```bash
# Update baselines after confirmed improvements
git checkout development
node scripts/update-performance-baselines.mjs
git commit -m "perf: Update performance baselines after optimization"
```

## Best Practices

### 1. Performance-First Development

- **Measure Early**: Run performance tests during development
- **Profile Before Optimizing**: Use DevTools to identify bottlenecks
- **Test Edge Cases**: Validate performance with large datasets
- **Monitor Regressions**: Check CI reports on every PR

### 2. Animation Optimization

```typescript
// ✅ Efficient Animation Pattern
const useOptimizedAnimation = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const animationRef = useRef<number>();
  
  const startAnimation = useCallback(() => {
    const animate = () => {
      // Batch DOM updates
      requestAnimationFrame(() => {
        // Update multiple elements together
        updateSpinnerPosition();
        updateParticipantVisibility();
        
        if (isSpinning) {
          animationRef.current = requestAnimationFrame(animate);
        }
      });
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [isSpinning]);
  
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
};
```

### 3. Memory Management

- **Use WeakMap**: For DOM element associations
- **Implement Cleanup**: Always clean up resources in useEffect returns
- **Avoid Closures**: Prevent accidental memory retention
- **Monitor Growth**: Use Chrome DevTools Memory tab regularly

### 4. Bundle Size Optimization

- **Dynamic Imports**: Load components only when needed
- **Dependency Auditing**: Regularly audit and remove unused packages
- **Asset Optimization**: Compress images and use modern formats
- **Code Splitting**: Split routes and heavy components

## Integration Examples

### Adding Performance Tests to New Components

```typescript
// 1. Create performance test file
// tests/performance/MyNewComponent.perf.test.ts

import { measureComponentPerformance } from '../utils/performance';

describe('MyNewComponent Performance', () => {
  test('maintains 60fps with 1000 items', async () => {
    const results = await measureComponentPerformance({
      component: MyNewComponent,
      props: { items: generateItems(1000) },
      duration: 30000, // 30 seconds
    });
    
    expect(results.averageFps).toBeGreaterThanOrEqual(60);
    expect(results.p95FrameTime).toBeLessThanOrEqual(16.67);
  });
});
```

### Custom Performance Assertions

```typescript
// utils/performance-assertions.ts
export const expectPerformanceTargets = (results: PerformanceResults) => {
  expect(results.averageFps).toBeGreaterThanOrEqual(60);
  expect(results.p95FrameTime).toBeLessThanOrEqual(16.67);
  expect(results.jankPercentage).toBeLessThan(5);
  expect(results.memoryGrowth).toBeLessThan(10 * 1024 * 1024); // 10MB
};
```

## Appendix

### Performance Monitoring Tools

- **Playwright**: Browser automation and performance measurement
- **Chrome DevTools**: Detailed profiling and debugging
- **size-limit**: Bundle size monitoring
- **Performance Observer API**: Frame timing measurement
- **Memory API**: Heap usage tracking

### Useful Resources

- [Web Performance Metrics](https://web.dev/metrics/)
- [Chrome DevTools Performance](https://developers.google.com/web/tools/chrome-devtools/performance)
- [Playwright Performance Testing](https://playwright.dev/docs/performance)
- [Bundle Analysis Best Practices](https://web.dev/reduce-javascript-payloads-with-code-splitting/)

### Support

For performance-related questions or issues:

1. **Check this guide** for common solutions
2. **Review CI logs** for specific error details
3. **Run local tests** to reproduce issues
4. **Create GitHub issue** with performance test results attached

---

**Performance is a feature. Every millisecond matters. Every byte counts.**

*- Michael Thompson, Performance & Extension Engineer*