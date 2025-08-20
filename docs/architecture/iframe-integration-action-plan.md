# Iframe Integration Architecture - Critical Action Plan

## Architectural Analysis Complete

### Current Status: MOSTLY CONFIGURED ✅ with CRITICAL ISSUES 🔴

## 🔴 CRITICAL ISSUE #1: CSP frame-src Missing Chrome Extension Protocol

**Problem**: The manifest.json has correct frame-src but is missing the chrome-extension:// protocol itself:

```json
// Current (INCORRECT):
"frame-src http://localhost:3000 https://www.drawday.app https://*.drawday.app;"

// Required (CORRECT):
"frame-src 'self' http://localhost:3000 https://www.drawday.app https://*.drawday.app;"
```

**Fix Required in**: `/apps/spinner-extension/public/manifest.json` line 24

## 🔴 CRITICAL ISSUE #2: Next.js Global X-Frame-Options Conflict

**Problem**: Next.js config sets global `X-Frame-Options: DENY` which conflicts with middleware's attempt to override for `/extension/*` routes.

**Current Architecture Issue**:

1. next.config.mjs applies headers globally (line 15: `X-Frame-Options: DENY`)
2. Middleware tries to override for `/extension/*` routes
3. Browser sees conflicting headers = iframe blocked

**Fix Required**: Remove X-Frame-Options from next.config.mjs, let middleware handle it exclusively

## ✅ CORRECT CONFIGURATIONS

### 1. Website Middleware (middleware.ts) - CORRECT

- Properly detects `/extension/*` routes
- Sets appropriate frame-ancestors CSP
- Handles chrome-extension:// origins

### 2. Extension Iframe Loader (iframe-loader.js) - CORRECT

- Proper retry logic
- Environment switching (dev/prod)
- Message passing bridge ready

### 3. Extension Layout (layout.tsx) - PARTIALLY CORRECT

- Has CSP in metadata but won't override middleware
- Should be removed to avoid confusion

## 📋 IMMEDIATE ACTION ITEMS

### Priority 1: Fix Extension Manifest CSP

```json
// In /apps/spinner-extension/public/manifest.json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'none'; style-src 'self' 'unsafe-inline'; frame-src 'self' http://localhost:3000 https://www.drawday.app https://*.drawday.app;"
}
```

### Priority 2: Fix Next.js Config Header Conflict

```javascript
// In /apps/website/next.config.mjs
// REMOVE line 15 or make it conditional:
const securityHeaders = [
  // ... other headers
  // DELETE THIS LINE:
  // {
  //   key: 'X-Frame-Options',
  //   value: 'DENY'
  // },
];
```

### Priority 3: Clean Up Extension Layout

```typescript
// In /apps/website/app/extension/layout.tsx
// Remove the CSP from metadata as middleware handles it:
export const metadata: Metadata = {
  title: 'DrawDay Extension',
  description: 'DrawDay Chrome Extension Interface',
  robots: 'noindex, nofollow',
  // Remove 'other' field - middleware handles all security headers
};
```

### Priority 4: Add Production URL Configuration

```javascript
// In /apps/spinner-extension/public/iframe-loader.js
const CONFIG = {
  DEV_URL: 'http://localhost:3000',
  PROD_URL: 'https://www.drawday.app', // Ensure this matches production
  // Consider adding staging URL support
};
```

## 🔒 SECURITY VERIFICATION CHECKLIST

- [ ] Extension can only load iframes from drawday.app domains
- [ ] Website only allows framing from chrome-extension:// origins
- [ ] Message passing validates origin before processing
- [ ] No sensitive data passed via URL parameters
- [ ] HTTPS enforced in production
- [ ] CSP report-uri configured for monitoring violations

## 🚀 DEPLOYMENT CONSIDERATIONS

1. **Development Environment**:
   - Manifest allows localhost:3000
   - Middleware allows development origins
   - Storage key toggles between environments

2. **Production Environment**:
   - Must update CHROME_EXTENSION_ID environment variable
   - Ensure PROD_URL matches actual deployment
   - Monitor CSP violations via /api/csp-report

3. **Rollback Readiness**:
   - Keep previous static build as backup
   - Can deploy static HTML quickly if needed
   - Extension update process documented

## 📊 SUCCESS CRITERIA

1. **Functional**: Iframes load successfully in both options and sidepanel
2. **Performance**: Load time < 1 second (p95)
3. **Security**: No CSP violations in console
4. **Reliability**: Retry logic handles transient failures
5. **Development**: Hot reload works across extension and website

## 🔄 COMMUNICATION PROTOCOL STATUS

### Currently Implemented:

- `openTab`: ✅ Opens new browser tabs
- `getVersion`: ✅ Returns extension version
- `setDevMode`: ✅ Toggles development mode

### To Be Implemented:

- `storage.get`: Read from chrome.storage
- `storage.set`: Write to chrome.storage
- `storage.remove`: Delete from chrome.storage
- `tabs.query`: Query browser tabs
- `runtime.reload`: Reload extension

## 📝 TEAM HANDOFF NOTES

### For Emily (Frontend):

- Options.tsx and SidePanel.tsx components ready
- Message passing handlers needed for storage API
- Consider loading states and error boundaries

### For Michael (Performance):

- Monitor iframe load performance
- Consider preconnect hints for drawday.app
- Implement resource hints in extension HTML

### For Robert (Integration):

- Storage API bridge needs implementation
- Consider WebSocket for real-time sync
- Plan for offline capability (future)

## ⚠️ RISK ASSESSMENT

### Current Risks:

1. **Network Dependency**: HIGH - Extension requires internet
2. **CSP Misconfiguration**: MEDIUM - Could block functionality
3. **Performance**: LOW - Iframe adds ~500ms latency

### Mitigation:

1. Implement offline detection and messaging
2. Comprehensive CSP testing before deployment
3. Performance monitoring and optimization

## ARCHITECTURE DECISION

**Verdict**: Iframe architecture is SOUND and REVERSIBLE

The approach provides excellent development velocity and maintenance benefits. The identified issues are configuration problems, not architectural flaws. Once the CSP and header conflicts are resolved, the system will function as designed.

**Rollback Capability**: Can revert to bundled UI within 4 hours if needed.

---

**Prepared by**: David Miller, Lead Developer Architect
**Date**: 2025-08-20
**Status**: Ready for Implementation
