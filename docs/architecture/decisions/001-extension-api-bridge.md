# ADR-001: Extension API Bridge for Iframe Migration

## Status
Accepted

## Context
We are migrating the Chrome extension from bundled React code to iframe-based architecture that loads pages from the website. This requires bridging Chrome Extension APIs (storage, tabs, runtime) to the website pages running inside iframes, as websites cannot directly access extension APIs due to security restrictions.

## Decision
Implement a bidirectional message-passing bridge using postMessage API with the following architecture:

1. **Extension Side (iframe-loader.js)**
   - Listens for postMessage requests from iframe
   - Validates origin (localhost:3000 or drawday.app)
   - Executes Chrome API calls on behalf of iframe
   - Returns results via postMessage with request ID

2. **Website Side (ExtensionAPIProvider)**
   - Provides React context with Chrome API facade
   - Generates unique request IDs for tracking
   - Sends requests via postMessage to parent frame
   - Returns Promises that resolve when response received

3. **Supported APIs**
   - chrome.storage.local: get, set, remove, clear
   - chrome.tabs: create
   - chrome.runtime: getManifest

## Consequences

### Positive
- Clean separation between extension and website code
- Website can be developed/tested independently
- Security through origin validation and sandboxing
- Easier debugging with message logging
- Future-proof for potential API additions

### Negative
- Slight latency overhead from message passing
- Additional complexity in error handling
- Need to maintain API compatibility layer

## Alternatives Considered

1. **Direct Bundle**: Continue bundling React app in extension
   - Why rejected: Slow build times, duplicate code, harder testing

2. **Service Worker Proxy**: Use service worker for API calls
   - Why rejected: More complex, potential reliability issues

3. **WebExtension Polyfill**: Use Mozilla's polyfill library
   - Why rejected: Still requires message passing for iframe context

## Rollback Plan

1. Keep existing bundled code in version control
2. Maintain manifest.json entries for both approaches
3. Switch back by updating manifest to point to bundled HTML
4. Remove iframe-loader.js from manifest
5. Rebuild and republish extension

## Success Metrics
- Message round-trip time < 10ms
- Zero security violations
- 100% API compatibility with existing code
- No increase in error rates
- Storage operations maintain same performance