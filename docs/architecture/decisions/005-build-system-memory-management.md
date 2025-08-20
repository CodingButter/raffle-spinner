# ADR-005: Build System Memory Management

## Status

Accepted

## Context

The DrawDay monorepo build system was experiencing segmentation faults during the build process, particularly when building multiple packages in parallel. These crashes were preventing reliable builds and deployments, causing significant development friction.

Investigation revealed:

- Default Node.js heap size (typically 1.5-2GB) insufficient for building large monorepo
- Parallel builds of TypeScript packages causing memory spikes
- tsup TypeScript declaration generation consuming significant memory
- No memory safeguards or recovery mechanisms in place

## Decision

Implement a comprehensive memory management strategy for the build system:

1. **Safe Build Script** (`scripts/build-safe.js`)
   - Automatically detects available system memory
   - Calculates optimal heap allocation (75% of free memory, max 8GB, min 2GB)
   - Builds packages sequentially to reduce memory pressure
   - Provides clear error messages and recovery suggestions

2. **Multiple Build Strategies**
   - `build:safe` - Uses safe build script with automatic memory management
   - `build:sequential` - Builds packages then apps in sequence
   - `build:parallel` - Parallel builds with increased memory (for powerful systems)
   - `build:memory` - Maximum memory allocation for critical situations

3. **Memory Monitoring** (`scripts/monitor-build.sh`)
   - Real-time memory usage tracking during builds
   - Automatic segfault detection in system logs
   - Performance metrics collection

4. **NODE_OPTIONS Configuration**
   - All build scripts now include explicit memory allocation
   - Consistent --max-old-space-size across all build commands
   - Environment-aware memory settings

## Consequences

### Positive

- **Eliminated segmentation faults** - Builds now complete reliably
- **Flexible build options** - Different strategies for different environments
- **Better error handling** - Clear messages when memory issues occur
- **Performance visibility** - Memory monitoring provides insights
- **CI/CD compatibility** - Works in resource-constrained environments
- **Developer experience** - No more mysterious build crashes

### Negative

- **Slower builds** - Sequential builds take longer than parallel
- **Complexity** - Multiple build scripts to maintain
- **Memory overhead** - Allocating more memory than strictly necessary

## Alternatives Considered

1. **Increase swap space only**
   - Rejected: Would make builds extremely slow
   - Swap is last resort, not primary solution

2. **Split into multiple repositories**
   - Rejected: Loses monorepo benefits
   - Would complicate dependency management

3. **Use different build tool (e.g., esbuild directly)**
   - Rejected: Would require significant refactoring
   - tsup provides good TypeScript integration

4. **Disable TypeScript declarations**
   - Rejected: Type safety is critical for developer experience
   - Would break package consumers

## Rollback Plan

If the new build system causes issues:

1. Revert package.json changes:

   ```bash
   git revert [commit-hash]
   ```

2. Use legacy build command:

   ```bash
   NODE_OPTIONS='--max-old-space-size=4096' pnpm -r build
   ```

3. Remove new scripts:
   ```bash
   rm scripts/build-safe.js scripts/monitor-build.sh
   ```

## Success Metrics

- **Build success rate**: Target 100% (up from ~60%)
- **Build time**: <5 minutes for full build
- **Memory usage**: Stay within 80% of available RAM
- **Developer reports**: Zero segfault complaints
- **CI/CD stability**: 100% pass rate on builds

## Implementation Notes

### Usage Examples

```bash
# Standard build with automatic memory management
pnpm build

# Safe build for low-memory systems
pnpm build:safe

# Monitor memory during build
./scripts/monitor-build.sh

# Maximum memory for critical situations
pnpm build:memory
```

### Debugging Memory Issues

If builds still fail:

1. Check available memory: `free -h`
2. Close memory-intensive applications
3. Use `pnpm build:safe` for automatic adjustment
4. Monitor with `./scripts/monitor-build.sh`
5. Build packages individually if needed

## References

- [Node.js Memory Management](https://nodejs.org/api/cli.html#--max-old-space-sizesize-in-megabytes)
- [tsup Configuration](https://tsup.egoist.dev/)
- [pnpm Workspace Management](https://pnpm.io/workspaces)

## Date

2025-08-19

## Author

David Miller - Lead Developer Architect
