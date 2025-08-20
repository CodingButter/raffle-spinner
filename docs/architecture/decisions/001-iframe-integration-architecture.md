# ADR-001: Chrome Extension Iframe Integration Architecture

## Status

Accepted

## Context

The DrawDay spinner Chrome extension needs to display UI content for both the options page and side panel. We need to decide between:

1. Building separate UI within the extension bundle
2. Loading UI from the website via iframes

Current constraints:

- Extension needs to stay lightweight for performance
- UI needs to be consistent across website and extension
- We need to maintain a single codebase for easier maintenance
- Security policies (CSP, CORS) must allow safe iframe embedding
- Extension must work in both development and production environments

## Decision

We will use iframe integration to load the extension UI from the website (drawday.app) rather than bundling the UI within the extension itself.

### Architecture Overview:

1. **Extension Structure:**
   - Minimal HTML shells (`options-iframe.html`, `sidepanel-iframe.html`)
   - Lightweight loader script (`iframe-loader.js`)
   - Service worker for background tasks only
   - No React/UI framework in extension bundle

2. **Website Structure:**
   - Dedicated routes at `/extension/options` and `/extension/sidepanel`
   - Full React components (Options.tsx, SidePanel.tsx)
   - Shared UI components from monorepo packages

3. **Security Configuration:**
   - CSP allows framing from chrome-extension:// origins
   - X-Frame-Options set to SAMEORIGIN for extension routes
   - Message passing API for extension-specific functionality

## Implementation Details

### 1. Chrome Extension Manifest (manifest.json)

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; frame-src http://localhost:3000 https://www.drawday.app https://*.drawday.app;"
  }
}
```

### 2. Website Middleware (middleware.ts)

```typescript
// Allow iframe embedding for extension routes
if (request.nextUrl.pathname.startsWith('/extension/')) {
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  const extensionCspHeader = cspHeader.replace(
    "frame-ancestors 'none';",
    "frame-ancestors 'self' chrome-extension:// moz-extension://;"
  );
  response.headers.set('Content-Security-Policy', extensionCspHeader);
}
```

### 3. Iframe Loader (iframe-loader.js)

- Environment detection (dev vs prod)
- Retry logic with timeout handling
- Message passing bridge for Chrome APIs
- Error recovery and user feedback

### 4. Communication Protocol

```javascript
// Message types supported:
- openTab: Open new browser tab
- getVersion: Get extension version
- setDevMode: Toggle development mode
- (Future: storage API bridge)
```

## Consequences

### Positive

1. **Single Source of Truth**: UI code maintained in one place
2. **Reduced Extension Size**: Extension bundle stays minimal (~50KB vs ~2MB)
3. **Consistent Experience**: Automatic UI updates without extension updates
4. **Faster Development**: Hot reload works across extension and website
5. **Simplified Testing**: Can test UI independently of extension context
6. **Version Independence**: UI can be updated without Chrome Web Store review

### Negative

1. **Network Dependency**: Extension requires internet connection
2. **Initial Load Time**: ~500ms additional latency for iframe load
3. **Complexity**: Additional message passing layer needed
4. **Security Surface**: Must carefully manage CSP and CORS policies
5. **Offline Limitation**: Extension won't work without internet

## Alternatives Considered

### 1. Bundle UI in Extension

**Why Rejected**: Would increase extension size to ~2MB, require separate build pipeline, duplicate code maintenance, and need Chrome Web Store review for UI changes.

### 2. Hybrid Approach (Critical UI in Extension)

**Why Rejected**: Adds complexity of maintaining two UI codebases, synchronization issues, and defeats purpose of single source of truth.

### 3. WebView/Embedded Browser

**Why Rejected**: Not supported in Chrome Extension Manifest V3, would require native messaging.

## Rollback Plan

If iframe approach fails in production:

1. **Immediate Mitigation** (< 1 hour):
   - Deploy fallback HTML with "Please update" message
   - Direct users to website for functionality

2. **Short-term Rollback** (< 4 hours):
   - Build static UI bundle from existing React components
   - Deploy as emergency extension update
   - Submit to Chrome Web Store for expedited review

3. **Long-term Recovery** (< 1 week):
   - Refactor to hybrid approach if needed
   - Implement offline-first with service worker caching
   - Add progressive enhancement for network failures

## Success Metrics

- **Load Time**: < 1 second for iframe content (p95)
- **Error Rate**: < 0.1% failed iframe loads
- **Bundle Size**: Extension stays under 100KB
- **User Satisfaction**: No increase in support tickets
- **Development Velocity**: 50% faster UI iteration cycles

## Security Checklist

- [x] CSP headers properly configured
- [x] Frame-ancestors directive includes chrome-extension://
- [x] Message origin validation implemented
- [x] No sensitive data in URL parameters
- [x] HTTPS enforced in production
- [x] Development/production URL switching secure

## Next Steps

1. Implement chrome.storage API bridge for data persistence
2. Add offline detection and graceful degradation
3. Implement performance monitoring for iframe loads
4. Add E2E tests for extension-website integration
5. Document message passing API for future features

## References

- [Chrome Extension Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
