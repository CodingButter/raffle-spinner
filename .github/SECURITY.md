# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Raffle Winner Spinner seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT Create a Public Issue

Security vulnerabilities should **never** be reported through public GitHub issues.

### 2. Report Privately

Please report security vulnerabilities through one of these channels:

- **GitHub Security Advisories**: [Report a vulnerability](https://github.com/CodingButter/raffle-spinner/security/advisories/new)
- **Email**: security@[domain].com (replace with actual email)

### 3. Information to Include

When reporting a vulnerability, please include:

- Type of issue (e.g., data exposure, XSS, privilege escalation)
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### 4. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Resolution Target**: 
  - Critical: 7 days
  - High: 14 days
  - Medium: 30 days
  - Low: 60 days

## Security Best Practices

### For Users

1. **Keep the Extension Updated**: Always use the latest version
2. **Verify Source**: Only install from the official Chrome Web Store
3. **Review Permissions**: Understand what permissions the extension requests
4. **Protect Your Data**: 
   - Don't upload CSV files with sensitive personal information
   - Use test data when possible
   - Clear competition data when no longer needed

### For Contributors

1. **Code Security**:
   - Never commit secrets, API keys, or credentials
   - Sanitize all user inputs
   - Use Content Security Policy (CSP) headers
   - Avoid `eval()` and similar dynamic code execution
   - Use Chrome's storage API securely

2. **Dependencies**:
   - Keep dependencies up to date
   - Review dependency licenses
   - Audit for known vulnerabilities
   - Use `pnpm audit` regularly

3. **Data Handling**:
   - Encrypt sensitive data at rest
   - Use HTTPS for all external communications
   - Implement proper access controls
   - Follow principle of least privilege

## Security Features

### Current Security Measures

- ✅ All data stored locally (no external servers)
- ✅ Content Security Policy enforced
- ✅ Input validation and sanitization
- ✅ No tracking or analytics
- ✅ Minimal permission requirements
- ✅ Regular dependency updates
- ✅ Automated security scanning (GitHub CodeQL)

### Planned Security Enhancements

- [ ] Data encryption at rest
- [ ] Security headers enhancement
- [ ] Advanced input validation
- [ ] Rate limiting for operations
- [ ] Security audit logging

## Disclosure Policy

When we receive a security report, we will:

1. Confirm the receipt of your vulnerability report
2. Assess the risk and severity
3. Work on a fix and release timeline
4. Credit reporters in our security acknowledgments (unless anonymity is requested)

## Security Acknowledgments

We thank the following individuals for responsibly disclosing security issues:

<!-- Add contributors here as issues are reported and fixed -->
- *No security vulnerabilities reported yet*

## Contact

For any security concerns or questions, please contact us through the channels mentioned above.

## PGP Key

For encrypted communications, use our PGP key:

```
-----BEGIN PGP PUBLIC KEY BLOCK-----
[PGP key would go here if available]
-----END PGP PUBLIC KEY BLOCK-----
```

---

**Remember**: Security is everyone's responsibility. If you see something, say something!