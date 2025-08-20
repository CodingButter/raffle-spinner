# ADR-001: Chrome Extension to Iframe Architecture

## Status
Proposed

## Context
Currently, the DrawDay Spinner Chrome Extension contains all business logic, UI components, and state management within the extension itself. This creates several challenges:
- Complex development environment requiring constant extension rebuilds
- Difficult debugging with Chrome DevTools limitations
- Duplicated authentication logic between extension and website
- Chrome storage API limitations vs. localStorage/sessionStorage
- Testing requires extension context simulation
- Bundle size constraints within extension

## Decision
Transform the Chrome Extension into a lightweight iframe container that loads pages from the website, moving all business logic and UI to the website application.

## Architecture Overview

### 1. Website Side (apps/website)
Create dedicated extension routes that serve as iframe content:
- `/extension/sidepanel` - Spinner wheel interface
- `/extension/options` - Configuration and settings interface

### 2. Extension Side (apps/spinner-extension)
Minimal extension containing only:
- Manifest.json with iframe permissions
- HTML wrappers with iframes
- Message passing bridge (if needed)
- Environment-aware URL configuration

### 3. Storage Migration
- Replace chrome.storage.local with localStorage/sessionStorage
- Implement storage abstraction layer for gradual migration
- Maintain backward compatibility during transition

## Consequences

### Positive
- **Simplified Development**: Test as regular web pages without extension rebuilds
- **Better Debugging**: Full browser DevTools access, network inspection
- **Unified Auth**: Single authentication system across website and extension
- **Faster Iteration**: Hot Module Replacement (HMR) works normally
- **Shared State**: Use existing React Context/Redux without chrome.storage
- **Better Testing**: Standard React Testing Library without extension mocks
- **Reduced Complexity**: No manifest updates for UI changes
- **Performance**: Leverage browser caching, CDN for assets
- **Code Reuse**: Share components directly between website and extension

### Negative  
- **Network Dependency**: Extension requires internet connection
- **CORS Configuration**: Need proper headers for iframe embedding
- **Latency**: Initial load may be slower than bundled extension
- **Version Synchronization**: Website and extension versions must align
- **Security Considerations**: Iframe sandboxing and CSP configuration

## Implementation Plan

### Phase 1: Website Preparation (Week 1)
1. Create `/extension` route structure
2. Implement iframe-specific layouts (no nav, optimized for panel)
3. Add CORS headers for extension origin
4. Create environment detection utilities

### Phase 2: Component Migration (Week 2)
1. Move SlotMachine components to website
2. Migrate competition management logic
3. Port CSV parsing and column mapping
4. Transfer winner tracking logic

### Phase 3: Storage Abstraction (Week 3)
1. Create storage interface matching chrome.storage API
2. Implement localStorage backend
3. Add migration utilities for existing data
4. Test data persistence and recovery

### Phase 4: Extension Simplification (Week 4)
1. Update manifest for iframe approach
2. Create minimal HTML wrappers
3. Implement environment-aware URL resolution
4. Add fallback for offline scenarios

### Phase 5: Testing & Optimization (Week 5)
1. End-to-end testing of iframe communication
2. Performance optimization for initial load
3. Security audit of iframe implementation
4. User acceptance testing

## Migration Strategy

### Step-by-step Approach
1. **Parallel Development**: Keep existing extension working during migration
2. **Feature Flags**: Use flags to toggle between old and new implementation
3. **Gradual Rollout**: Test with internal users first
4. **Data Migration**: Automated migration of user settings and competitions
5. **Rollback Plan**: Maintain ability to revert to standalone extension

### Technical Details

#### URL Configuration
```typescript
// Extension determines URL based on environment
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  return 'https://www.drawday.app';
};

// HTML wrapper
const html = `
<!DOCTYPE html>
<html>
  <body style="margin: 0; padding: 0;">
    <iframe 
      src="${getBaseUrl()}/extension/sidepanel"
      style="width: 100%; height: 100vh; border: none;"
      allow="clipboard-write; clipboard-read"
    />
  </body>
</html>
`;
```

#### Storage Abstraction
```typescript
interface StorageAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

class LocalStorageAdapter implements StorageAdapter {
  async get(key: string) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  
  async remove(key: string) {
    localStorage.removeItem(key);
  }
  
  async clear() {
    localStorage.clear();
  }
}
```

#### Message Passing (if needed)
```typescript
// Extension side
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://www.drawday.app') return;
  
  switch (event.data.type) {
    case 'OPEN_TAB':
      chrome.tabs.create({ url: event.data.url });
      break;
    case 'GET_VERSION':
      event.source.postMessage({
        type: 'VERSION',
        version: chrome.runtime.getManifest().version
      }, event.origin);
      break;
  }
});

// Website side
const extensionAPI = {
  openTab: (url: string) => {
    window.parent.postMessage({ type: 'OPEN_TAB', url }, '*');
  },
  getVersion: () => {
    return new Promise((resolve) => {
      window.addEventListener('message', function handler(event) {
        if (event.data.type === 'VERSION') {
          window.removeEventListener('message', handler);
          resolve(event.data.version);
        }
      });
      window.parent.postMessage({ type: 'GET_VERSION' }, '*');
    });
  }
};
```

## Security Considerations

### Content Security Policy
```javascript
// Extension manifest.json
"content_security_policy": {
  "extension_pages": "frame-src https://www.drawday.app http://localhost:3000; script-src 'self';"
}

// Website headers
X-Frame-Options: ALLOW-FROM chrome-extension://[EXTENSION_ID]
Content-Security-Policy: frame-ancestors chrome-extension://[EXTENSION_ID]
```

### Iframe Sandboxing
```html
<iframe 
  src="https://www.drawday.app/extension/sidepanel"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  allow="clipboard-write; clipboard-read; storage-access"
/>
```

## Rollback Plan

### Immediate Rollback
1. Feature flag to disable iframe mode
2. Revert to bundled extension code
3. Restore chrome.storage usage

### Data Recovery
1. Export user data from localStorage
2. Import into chrome.storage.local
3. Verify data integrity

### Steps
1. Set `USE_IFRAME=false` in extension
2. Deploy previous extension version
3. Run data migration script
4. Notify users of temporary rollback
5. Monitor for issues

## Success Metrics
- **Development Speed**: 50% reduction in feature development time
- **Bug Resolution**: 30% faster bug identification and fixes
- **Test Coverage**: Increase from current to 80%+
- **Load Performance**: <2 second initial load
- **User Experience**: No degradation in functionality
- **Bundle Size**: Extension reduced to <100KB

## Alternative Approaches Considered

### 1. WebView Component Library
Build shared component library used by both extension and website.
- **Rejected**: Still requires dual maintenance and testing

### 2. Browser Extension API Polyfill
Create polyfill for chrome.* APIs on website.
- **Rejected**: Complex implementation with limited benefits

### 3. Electron-like Wrapper
Use embedded browser view within extension.
- **Rejected**: Not supported in Manifest V3

## References
- [Chrome Extension Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [Iframe Security Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)
- [CORS Configuration Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## Decision Makers
- Jamie (Chief Project Officer) - Final approval
- Sarah Johnson (Project Manager) - Timeline and resource allocation
- David Miller (Lead Developer Architect) - Technical design
- Emily Davis (Frontend Expert) - Implementation approach

## Review Date
2025-08-26 (1 week after initial proposal)