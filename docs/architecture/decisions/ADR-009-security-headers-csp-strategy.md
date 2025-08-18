# ADR-009: Security Headers and Content Security Policy Strategy

## Status

Proposed

## Context

The DrawDay platform currently lacks comprehensive security headers and Content Security Policy (CSP) configuration, exposing both the Chrome extension and website to potential security vulnerabilities:

### Current Security Gaps:

1. **Chrome Extension**: No CSP defined in manifest.json, allowing potential XSS attacks
2. **Website Middleware**: CSP exists but uses 'unsafe-inline' and 'unsafe-eval' directives
3. **CORS Configuration**: Overly permissive with wildcard chrome-extension://\* origin
4. **Missing Headers**: No implementation in Next.js config, only in middleware
5. **API Security**: Limited protection against cross-origin attacks

### Risk Assessment:

- **Critical**: XSS vulnerability in extension could compromise user data
- **High**: Unsafe inline scripts allow injection attacks
- **High**: Chrome Web Store may reject extension without proper CSP
- **Medium**: GDPR compliance issues due to insufficient security measures

## Decision

Implement a layered security strategy with strict CSP policies and comprehensive security headers:

### 1. Chrome Extension Security (Manifest V3)

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'none'; style-src 'self' 'unsafe-inline';"
  }
}
```

- Remove all inline scripts from HTML files
- Use event listeners instead of onclick attributes
- Allow 'unsafe-inline' for styles (required for Tailwind)
- Use 'wasm-unsafe-eval' instead of 'unsafe-eval' (more restrictive)

### 2. Website Security Headers (Next.js + Middleware)

```javascript
// Enhanced CSP with nonces for inline scripts
const cspHeader = `
  default-src 'self';
  script-src 'self' 'nonce-${nonce}' https://js.stripe.com https://checkout.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://checkout.stripe.com;
  frame-ancestors 'none';
  frame-src 'self' https://js.stripe.com https://checkout.stripe.com;
  connect-src 'self' https://api.stripe.com https://checkout.stripe.com ${DIRECTUS_URL};
  upgrade-insecure-requests;
`;
```

### 3. CORS Policy Refinement

```javascript
const allowedOrigins = {
  production: ['https://www.drawday.app', 'https://drawday.app'],
  development: ['http://localhost:3000', 'http://localhost:3001'],
};

// Validate chrome extension origin with specific ID
const validateChromeExtension = (origin) => {
  const extensionId = process.env.CHROME_EXTENSION_ID;
  return origin === `chrome-extension://${extensionId}`;
};
```

### 4. Additional Security Headers

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];
```

## Consequences

### Positive

- **Enhanced Security**: Protection against XSS, clickjacking, and MIME-type attacks
- **Chrome Web Store Compliance**: Meets Manifest V3 security requirements
- **GDPR Compliance**: Demonstrates security due diligence
- **Performance**: Browser can optimize with security policies known in advance
- **Trust**: Users and auditors see comprehensive security measures

### Negative

- **Development Complexity**: Nonce generation required for inline scripts
- **Migration Effort**: Existing inline scripts must be refactored
- **Third-party Integration**: Some services may require CSP exceptions
- **Testing Overhead**: Security policies must be tested across all features

## Alternatives Considered

1. **Report-Only Mode First**
   - **Pros**: Non-breaking, allows monitoring of violations
   - **Rejected**: Critical vulnerability requires immediate enforcement

2. **Relaxed CSP with 'unsafe-inline'**
   - **Pros**: Easier implementation, no refactoring needed
   - **Rejected**: Defeats purpose of CSP, maintains vulnerability

3. **Header-only Implementation (no middleware)**
   - **Pros**: Simpler configuration
   - **Rejected**: Less flexible, can't generate nonces dynamically

## Rollback Plan

### Phase 1: Immediate Rollback (< 5 minutes)

1. Revert git commit: `git revert <commit-hash>`
2. Deploy previous version
3. Verify services restored

### Phase 2: Gradual Rollback (if specific issues)

1. Switch CSP to report-only mode
2. Identify problematic directives
3. Adjust policies incrementally
4. Re-enable enforcement mode

### Emergency Bypass

```javascript
// Environment variable to disable CSP in emergency
if (process.env.DISABLE_CSP === 'true') {
  return NextResponse.next();
}
```

## Success Metrics

- **Zero CSP Violations**: No legitimate functionality blocked
- **Security Audit Pass**: OWASP Top 10 compliance
- **Chrome Web Store**: Extension approved without security warnings
- **Performance**: <5ms added latency from security headers
- **Monitoring**: CSP report endpoint captures violations

## Implementation Timeline

1. **Hour 0-2**: Implement extension CSP
2. **Hour 2-4**: Refactor inline scripts
3. **Hour 4-6**: Update middleware security
4. **Hour 6-8**: Test all functionality
5. **Hour 8-12**: Deploy to staging
6. **Hour 12-24**: Monitor and adjust
7. **Hour 24-48**: Production deployment

## Monitoring & Alerts

- CSP violation reports sent to: `/api/csp-report`
- Alert on >10 violations per minute
- Weekly security header audit
- Monthly penetration testing

## References

- [Chrome Extension Manifest V3 CSP](https://developer.chrome.com/docs/extensions/mv3/manifest/content_security_policy/)
- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
