# Performance Testing Methodology

## Overview

This document describes the comprehensive performance testing approach for the DrawDay Spinner Extension, with a focus on maintaining 60fps animations and efficient memory usage across varying dataset sizes.

## Performance Targets

### Animation Performance
- **60fps minimum** (16.67ms per frame, P95)
- **Input latency** ≤100ms (click to animation start)
- **Animation smoothness** <5% jank frames (>50ms)
- **Visual stability** No dropped frames during critical animations

### Memory Efficiency
- **Baseline memory** ≤50MB (idle extension)
- **Peak memory** ≤200MB (during animation with 5000+ participants)
- **Memory cleanup** ≥95% after animation completion
- **Leak threshold** ≤10MB growth per animation cycle

### Bundle Size Constraints
- **Total compressed** ≤2MB (gzipped)
- **Per-chunk limit** ≤200KB (individual components)
- **Regression threshold** ≤5% size increase per release
- **Load time impact** ≤2 seconds TTI (Time to Interactive)

## Testing Infrastructure

### 1. Animation Performance Tests (`spinner-perf-test.mjs`)

**Purpose**: Validate frame rate consistency across different data sizes and scenarios.

**Test Scenarios**:
- Small Dataset: 100 participants (baseline)
- Medium Dataset: 1,000 participants
- Large Dataset: 5,000 participants
- Stress Test: 10,000+ participants

**Metrics Collected**:
```javascript
{
  averageFps: number,           // Average frames per second
  p95FrameTime: number,         // 95th percentile frame time
  p99FrameTime: number,         // 99th percentile frame time
  jankFrames: number,           // Frames >50ms
  jankPercentage: number,       // Percentage of jank frames
  inputLatency: number,         // Click to animation start
  passed: boolean              // Overall pass/fail
}
```

**Implementation**:
- Uses Playwright for browser automation
- Performance Observer API for frame timing
- requestAnimationFrame for precise measurements
- Multiple test runs for statistical significance

### 2. Memory Usage Tests (`memory-test.mjs`)

**Purpose**: Detect memory leaks and validate cleanup efficiency.

**Test Patterns**:
- Single animation lifecycle
- Multiple consecutive animations (5 cycles)
- Large dataset memory consumption
- Long-term stability (30 cycles)
- Memory pressure handling

**Memory Profiling**:
```javascript
{
  baseline: number,             // Initial memory usage (MB)
  peak: number,                 // Peak memory during animation (MB)
  final: number,                // Memory after cleanup (MB)
  growth: number,               // Net memory growth (MB)
  cleanupPercentage: number,    // % of memory cleaned up
  hasLeak: boolean,             // Leak detection flag
  snapshots: Array             // Detailed memory timeline
}
```

**Leak Detection Criteria**:
- Memory growth >10MB per cycle
- <95% cleanup after animation
- Linear growth over extended sessions

### 3. Bundle Size Validation

**Tools Used**:
- `size-limit` for bundle size enforcement
- Custom bundle analyzer for detailed breakdown
- Historical size tracking for regression detection

**Size Budgets**:
```json
{
  "Total Extension Bundle": "1.8 MB (gzipped)",
  "SlotMachine Component": "500 KB (gzipped)",
  "Regression Threshold": "5% increase"
}
```

## Continuous Integration

### GitHub Actions Workflow

**Triggers**:
- Pull requests targeting `development` or `main`
- Pushes to `development` branch
- Manual workflow dispatch

**Test Execution**:
1. **Storage Performance** - Validate <10ms operations
2. **Animation Performance** - 60fps validation across scenarios
3. **Memory Testing** - Leak detection and cleanup verification
4. **Bundle Size Check** - Size limits and regression detection

**Failure Conditions**:
- Any performance test fails to meet targets
- Bundle size exceeds 2MB limit
- >5% size regression without approval
- Memory leaks detected

### Performance Reports

**Automated PR Comments**:
```markdown
## 🎯 Performance Test Results

✅ **Overall Result: PASSED**

### Test Summary
- **Duration:** 45.2s
- **Tests Run:** 4
- **Passed:** 4
- **Failed:** 0

### Bundle Size Analysis
✅ **Bundle Size:** 1.2MB / 2.0MB limit

### Individual Test Results
- ✅ **STORAGE:** PASSED - All operations <10ms
- ✅ **ANIMATION:** PASSED - 60fps maintained across all scenarios  
- ✅ **MEMORY:** PASSED - No leaks, <200MB peak usage
- ✅ **BUNDLE:** PASSED - 1.2MB within limits

🎉 **All performance targets met!** Ready for merge.
```

## Performance Optimization Strategies

### Animation Optimization

1. **Subset Swapping**
   - Display only 100 items at peak velocity
   - Swap to target subset containing winner
   - Reduces DOM manipulation overhead

2. **Canvas Rendering**
   - Hardware-accelerated rendering
   - Efficient draw operations
   - Minimal repaints

3. **Frame Budget Management**
   - ≤16.67ms per frame target
   - Break up long tasks
   - Use requestAnimationFrame scheduling

### Memory Management

1. **Object Pooling**
   - Reuse animation objects
   - Minimize garbage collection
   - Pre-allocate common structures

2. **Event Listener Cleanup**
   - Remove all event listeners after use
   - Use weak references where appropriate
   - Clear timers and intervals

3. **Canvas Memory**
   - Proper context disposal
   - Clear canvas between renders
   - Monitor canvas memory usage

### Bundle Size Control

1. **Code Splitting**
   - Lazy load non-critical components
   - Dynamic imports for large features
   - Route-based splitting

2. **Tree Shaking**
   - Import only used functions
   - Avoid large library imports
   - Bundle analyzer for unused code

3. **Asset Optimization**
   - Compress images and fonts
   - Use modern formats (WebP, WOFF2)
   - Implement aggressive caching

## Debugging Performance Issues

### Frame Rate Problems

1. **Identify Bottlenecks**
   ```bash
   # Run performance profiler
   node scripts/spinner-perf-test.mjs
   
   # Analyze flame charts in Chrome DevTools
   # Look for long tasks >16.67ms
   ```

2. **Common Issues**
   - Synchronous DOM operations
   - Heavy computations in animation loop
   - Memory allocation during animation
   - Inefficient CSS selectors

### Memory Leak Investigation

1. **Run Memory Tests**
   ```bash
   # Detailed memory profiling
   node scripts/memory-test.mjs
   
   # Long-term stability test
   node scripts/memory-test.mjs --endurance
   ```

2. **Analysis Steps**
   - Check cleanup percentage <95%
   - Look for linear memory growth
   - Identify retained objects in snapshots
   - Review event listener disposal

### Bundle Size Investigation

1. **Analyze Bundle**
   ```bash
   # Check current bundle size
   pnpm --filter @drawday/spinner-extension size
   
   # Detailed analysis
   pnpm --filter @drawday/spinner-extension size:why
   ```

2. **Optimization Actions**
   - Remove unused dependencies
   - Implement code splitting
   - Optimize asset sizes
   - Review import statements

## Performance Monitoring in Production

### Metrics Collection

**Core Performance Metrics**:
- Animation frame rate (FPS)
- Memory usage patterns
- Load times and TTI
- Bundle size trends
- User device capabilities

**Implementation**:
- Performance Observer API
- User Timing API
- Navigation Timing API
- Memory Info API (Chrome)

### Alerting Thresholds

**Critical Alerts**:
- FPS drops below 50fps for >10% of users
- Memory usage >300MB
- Load time >5 seconds
- Bundle size >2.5MB

**Warning Alerts**:
- FPS drops below 55fps
- Memory usage >250MB
- Load time >3 seconds
- Bundle size >2.2MB

## Tools and Dependencies

### Performance Testing Stack

**Core Dependencies**:
```json
{
  "playwright": "^1.54.2",        // Browser automation
  "size-limit": "^8.2.6",        // Bundle size enforcement
  "@size-limit/file": "^8.2.6",  // File size plugin
}
```

**Custom Tools**:
- `spinner-perf-test.mjs` - Animation performance testing
- `memory-test.mjs` - Memory leak detection
- `run-all-performance-tests.mjs` - Complete test suite orchestrator

### CI/CD Integration

**GitHub Actions**:
- Performance regression detection
- Automated PR comments
- Bundle size tracking
- Performance baseline management

**Quality Gates**:
- Block merge on performance regression
- Require performance review for large changes
- Automated performance baseline updates

## Best Practices

### Development Workflow

1. **Performance First**
   - Consider performance impact of all changes
   - Run performance tests locally before PR
   - Profile changes with realistic data sizes

2. **Incremental Optimization**
   - Make small, measurable improvements
   - Test each optimization independently
   - Document performance impact

3. **Continuous Monitoring**
   - Monitor CI performance reports
   - Track trends over time
   - Address regressions immediately

### Code Review Guidelines

**Performance Review Checklist**:
- [ ] No new performance regressions
- [ ] Bundle size impact acceptable
- [ ] Memory usage patterns reviewed
- [ ] Animation frame rate maintained
- [ ] Performance tests passing

**Red Flags**:
- Large bundle size increases
- New event listeners without cleanup
- Synchronous operations in animation loops
- Memory allocations in hot paths
- Missing performance test coverage

## Troubleshooting Common Issues

### "Performance tests timing out"
**Cause**: Browser launch issues or test complexity
**Solution**: Check Playwright configuration, reduce test timeout, verify browser installation

### "Memory cleanup <95%"  
**Cause**: Event listeners not removed, objects not disposed
**Solution**: Audit event listener cleanup, check object disposal in useEffect cleanup

### "Bundle size regression >5%"
**Cause**: New dependencies, inefficient imports, asset bloat
**Solution**: Run bundle analyzer, remove unused code, optimize imports

### "Animation FPS <60"
**Cause**: Heavy computations, DOM manipulation, memory pressure
**Solution**: Profile with DevTools, optimize rendering loop, reduce DOM updates

---

*This methodology ensures consistent performance across the DrawDay Spinner Extension while maintaining development velocity and code quality.*