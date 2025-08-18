# Security Headers Migration Guide

## Overview

This guide covers the implementation of comprehensive security headers and Content Security Policy (CSP) for the DrawDay platform, addressing critical security vulnerabilities identified in Issue #64.

## Migration Steps

### Phase 1: Chrome Extension (Immediate)

#### 1. Update Manifest.json

The Chrome extension manifest has been updated with strict CSP:

```json
"content_security_policy": {
  "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'none'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self' https://admin.drawday.app https://api.stripe.com;"
}
```

#### 2. Verify No Inline Scripts

- All HTML files have been checked - no inline scripts found
- Only module script tags are used: `<script type="module" src="/src/file.tsx"></script>`
- No action required

#### 3. Testing Chrome Extension

```bash
# Build extension
pnpm --filter @drawday/spinner-extension build

# Load unpacked extension in Chrome
# 1. Navigate to chrome://extensions/
# 2. Enable Developer Mode
# 3. Click "Load unpacked"
# 4. Select apps/spinner-extension/dist folder
# 5. Test all functionality
```

### Phase 2: Website Security (Staging First)

#### 1. Environment Configuration

Add to `.env.local`:

```env
# Chrome Extension ID (required for CORS)
CHROME_EXTENSION_ID=your-extension-id-here

# Security Configuration (optional)
DISABLE_CSP=false # Emergency bypass for development only
CSP_REPORT_URI=/api/csp-report
```

#### 2. Deploy to Staging

```bash
# Deploy to Vercel staging
vercel --prod

# Monitor CSP reports
# Check /api/csp-report endpoint logs
```

#### 3. CSP Violation Monitoring

Monitor the CSP report endpoint for violations:

- Check logs for legitimate functionality being blocked
- Identify false positives from browser extensions
- Adjust CSP directives if needed

### Phase 3: Production Deployment

#### 1. Pre-deployment Checklist

- [ ] Chrome extension tested with new CSP
- [ ] Website tested in staging environment
- [ ] CSP violations monitored for 24 hours
- [ ] No legitimate functionality blocked
- [ ] CORS working for Chrome extension
- [ ] Authentication flows functioning
- [ ] Stripe integration working

#### 2. Production Deployment

```bash
# Deploy to production
vercel --prod --env production

# Monitor immediately after deployment
```

## Rollback Procedures

### Emergency Rollback (< 5 minutes)

If critical issues occur:

```bash
# 1. Revert the commit
git revert HEAD
git push origin main

# 2. Deploy previous version
vercel rollback

# 3. Verify services restored
```

### Temporary CSP Bypass

For emergency bypass during debugging:

```bash
# Set environment variable
DISABLE_CSP=true vercel env add

# Redeploy
vercel --prod

# IMPORTANT: Remove after fixing
DISABLE_CSP=false vercel env add
```

### Gradual Rollback

If specific CSP directives cause issues:

1. Switch to report-only mode:

```javascript
// In middleware.ts, change:
response.headers.set('Content-Security-Policy', cspHeader);
// To:
response.headers.set('Content-Security-Policy-Report-Only', cspHeader);
```

2. Monitor violations without blocking
3. Adjust problematic directives
4. Re-enable enforcement mode

## Security Testing

### 1. Manual Testing Checklist

- [ ] Chrome extension loads without errors
- [ ] Options page functions correctly
- [ ] Side panel displays properly
- [ ] CSV upload works
- [ ] Spinner animations run smoothly
- [ ] Winner selection works
- [ ] Theme changes apply
- [ ] Authentication flows work
- [ ] Subscription checks pass
- [ ] Stripe checkout loads
- [ ] API calls succeed

### 2. Automated Security Scan

```bash
# Install security scanner
npm install -g @zaproxy/cli

# Run OWASP ZAP scan
zap-cli quick-scan --self-contained \
  --start-options "-config api.disablekey=true" \
  https://drawday.app
```

### 3. CSP Validation

```bash
# Check CSP headers
curl -I https://drawday.app | grep -i content-security-policy

# Validate with online tool
# Visit: https://csp-evaluator.withgoogle.com/
```

## Common Issues & Solutions

### Issue: Stripe Checkout Not Loading

**Solution:** Ensure Stripe domains are whitelisted in CSP:

```javascript
script-src 'self' https://js.stripe.com https://checkout.stripe.com;
frame-src 'self' https://js.stripe.com https://checkout.stripe.com;
connect-src 'self' https://api.stripe.com https://checkout.stripe.com;
```

### Issue: Chrome Extension Can't Connect to API

**Solution:** Set CHROME_EXTENSION_ID environment variable:

```bash
vercel env add CHROME_EXTENSION_ID your-extension-id
```

### Issue: Styles Not Applying

**Solution:** 'unsafe-inline' is allowed for styles (required for Tailwind):

```javascript
style-src 'self' 'unsafe-inline';
```

### Issue: Development Tools Blocked

**Solution:** CSP is more relaxed in development:

- 'unsafe-eval' allowed in development only
- upgrade-insecure-requests disabled in development

## Monitoring & Maintenance

### Daily Monitoring

1. Check CSP report endpoint for violations
2. Review error logs for security-related issues
3. Monitor authentication success rates
4. Check API response times

### Weekly Review

1. Analyze CSP violation patterns
2. Review security headers effectiveness
3. Check for new security advisories
4. Update dependencies if needed

### Monthly Audit

1. Run full security scan
2. Review and update CSP directives
3. Test rollback procedures
4. Update this documentation

## Support & Escalation

### For Issues:

1. Check this guide first
2. Review ADR-009 for architectural decisions
3. Check CSP report logs
4. Contact David Miller (Architecture) or Robert Wilson (Integration)

### Emergency Contact:

- **Critical Security Issues:** Escalate to Jamie immediately
- **Production Down:** Follow emergency rollback procedure
- **Data Breach Risk:** Activate incident response plan

## References

- [ADR-009: Security Headers and CSP Strategy](../architecture/decisions/ADR-009-security-headers-csp-strategy.md)
- [Chrome Extension Manifest V3 CSP](https://developer.chrome.com/docs/extensions/mv3/manifest/content_security_policy/)
- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
