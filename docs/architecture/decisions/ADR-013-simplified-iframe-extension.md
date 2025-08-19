# ADR-013: Simplified Iframe Extension Architecture

## Status
Accepted

## Context
The Chrome extension has grown to over 2MB in size due to bundling React, Tailwind, and all dependencies. This creates several issues:
- Slow extension load times
- Large download size for users
- Complex build process with Vite bundling
- Duplicate code between extension and website
- Difficult maintenance with two separate codebases

With the move to iframe architecture, we can dramatically simplify the extension to be just a lightweight container that loads the website.

## Decision
Transform the Chrome extension into a minimal iframe container that:
1. Loads pages from the website (localhost for dev, production URL for prod)
2. Contains only static HTML, CSS, and minimal JavaScript
3. Removes all React/Vite bundling complexity
4. Reduces extension size from 2MB+ to under 100KB

## Implementation

### File Structure
```
apps/spinner-extension/
├── public/
│   ├── manifest.json           # Simplified manifest v3
│   ├── sidepanel-iframe.html   # Iframe wrapper for side panel
│   ├── options-iframe.html     # Iframe wrapper for options
│   ├── iframe-loader.js        # Handles iframe loading/messaging
│   ├── background-simple.js    # Minimal background script
│   └── icon-*.png              # Extension icons
└── scripts/
    └── build-simple.cjs        # Simple copy-based build script
```

### Key Changes

1. **HTML Files**: Simple wrappers with inline styles and iframe element
2. **JavaScript**: Single iframe-loader.js handles:
   - Dynamic URL resolution (dev vs prod)
   - Loading state and error handling
   - Message passing between iframe and extension
   - Retry logic for network issues

3. **Manifest**: Simplified permissions and CSP:
   ```json
   {
     "permissions": ["storage", "sidePanel"],
     "content_security_policy": {
       "extension_pages": "frame-src http://localhost:3000 https://www.drawday.app"
     }
   }
   ```

4. **Build Process**: No bundling, just copy files:
   - No Vite/webpack configuration
   - No TypeScript compilation for extension
   - Simple file copying with archiver

## Consequences

### Positive
- **Size Reduction**: 2MB+ → 16.9KB (99% reduction)
- **Faster Load Times**: Near-instant extension loading
- **Simplified Maintenance**: No duplicate code between extension and website
- **Hot Reload**: Changes to website immediately reflected in extension during development
- **Reduced Complexity**: No build tools, bundlers, or transpilation needed
- **Better Debugging**: Full browser DevTools for website code
- **Unified Codebase**: Single source of truth for all functionality

### Negative
- **Network Dependency**: Extension requires internet connection to function
- **CORS Configuration**: Requires proper headers on website
- **Message Passing**: Some extension APIs need bridge implementation
- **Migration Effort**: Users need to migrate data from chrome.storage to localStorage

## Alternatives Considered

1. **Keep Current Architecture**: Rejected due to maintenance burden and size
2. **Web Workers**: Too limited for full application functionality
3. **Partial Bundling**: Still requires maintaining two codebases
4. **PWA Instead of Extension**: Doesn't provide side panel functionality

## Rollback Plan

1. Keep both build scripts (`build` and `build:simple`)
2. Maintain backward compatibility for 1-2 releases
3. If issues arise:
   - Switch manifest back to original HTML files
   - Deploy hotfix with bundled version
   - Investigate and fix iframe issues
   - Re-deploy simplified version

## Success Metrics

- Extension size < 100KB ✅ (achieved: 16.9KB)
- Load time < 500ms
- Zero functionality loss for users
- 50% reduction in build time
- 75% reduction in maintenance effort

## Migration Path

1. **Phase 1** (Current): Create simplified build alongside existing
2. **Phase 2**: Deploy to beta testers with simplified version
3. **Phase 3**: Gradual rollout to all users
4. **Phase 4**: Remove legacy bundled code

## Security Considerations

- Iframe sandboxing with appropriate permissions
- CSP headers properly configured
- Message validation between iframe and extension
- No sensitive data in extension code (all in website)

## References

- [Chrome Extension Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [Iframe CSP Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- Original issue: Simplify Chrome extension build configuration