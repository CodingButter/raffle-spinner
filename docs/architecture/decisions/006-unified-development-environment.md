# ADR-006: Unified Development Environment Architecture

## Status

Accepted

## Context

The DrawDay platform consists of multiple interconnected services (website, Chrome extension, Directus CMS) that need to communicate during development. Previously, developers had to manually start each service separately, manage environment variables across multiple files, and deal with inconsistent configurations. This led to:

- Onboarding friction for new developers
- Inconsistent development environments across team members
- Time wasted debugging environment-specific issues
- Difficulty testing cross-service integrations
- Confusion about which ports and URLs to use

## Decision

We have implemented a unified development environment architecture that:

1. **Centralized Command Structure**: Single commands to start all services together
2. **Standardized Port Allocation**: Fixed ports for each service to prevent conflicts
3. **Environment File Templates**: Consistent `.env` examples for all services
4. **Automated Setup Script**: One-command setup for the entire environment
5. **Service Orchestration**: Using `concurrently` for parallel process management
6. **Docker Compose Integration**: Backend services managed as containers

### Port Allocation Strategy

```
3000 - Website (Next.js)
5174 - Extension Standalone (Vite)
8055 - Directus CMS
5432 - PostgreSQL (internal)
6379 - Redis (internal)
```

### Command Structure

```bash
pnpm dev:all       # All services
pnpm dev:frontend  # Website + Extension
pnpm dev:website   # Website only
pnpm dev:extension # Extension only
pnpm backend:*     # Backend management
```

## Consequences

### Positive

- **Reduced Setup Time**: From ~30 minutes to ~5 minutes for new developers
- **Consistent Environments**: All developers use the same configuration
- **Improved DX**: Single command to start everything
- **Better Testing**: Easy to test cross-service communication
- **Clear Documentation**: Single source of truth for environment setup
- **Debugging Efficiency**: Consolidated logs with color-coded output
- **Reversible Changes**: Can still run services individually if needed

### Negative

- **Resource Usage**: Running all services uses more memory (~2GB RAM)
- **Docker Dependency**: Requires Docker installation for backend
- **Port Conflicts**: Fixed ports may conflict with other local services
- **Complexity**: More moving parts in the development setup

## Alternatives Considered

1. **Microservices with Kubernetes**
   - Rejected: Overkill for local development, steep learning curve

2. **Vagrant/VM-based Development**
   - Rejected: Heavy resource usage, slower performance

3. **Cloud Development Environments**
   - Rejected: Internet dependency, potential costs, data privacy concerns

4. **Manual Service Management**
   - Rejected: Current pain point, inconsistent, error-prone

## Rollback Plan

If this architecture causes issues:

1. **Immediate**: Use individual service commands (still available)

   ```bash
   pnpm dev:website
   pnpm dev:extension
   cd backend && docker-compose up
   ```

2. **Short-term**: Revert package.json changes

   ```bash
   git revert [commit-hash]
   ```

3. **Long-term**: Document manual setup process as fallback

## Success Metrics

- **Setup Time**: <5 minutes for new developer onboarding
- **Environment Issues**: <2 environment-related support requests per sprint
- **Developer Satisfaction**: >80% prefer unified environment (survey)
- **CI/CD Alignment**: Local environment matches CI/CD by >95%

## Implementation Details

### Files Created/Modified

- `/scripts/setup-dev.sh` - Automated setup script
- `/docs/DEVELOPMENT_ENVIRONMENT.md` - Comprehensive documentation
- `/package.json` - New dev commands with concurrently
- `/apps/website/.env.development` - Website environment template
- `/apps/spinner-extension/.env.development` - Extension environment template

### Dependencies Added

- `concurrently@^9.2.0` - Process management

### Migration Path

1. Run `pnpm install` to get concurrently
2. Copy `.env.development` files to `.env.local`
3. Run `./scripts/setup-dev.sh` for initial setup
4. Use `pnpm dev:all` for development

## Security Considerations

- Environment files contain sensitive data - added to `.gitignore`
- Development uses test API keys only
- Docker containers isolated in custom network
- CORS configured for local development only
- Secrets generation documented for production

## Performance Impact

- **Build Time**: No change (parallel execution)
- **Startup Time**: ~15 seconds for all services
- **Memory Usage**: ~2GB total (Node + Docker)
- **CPU Usage**: Minimal impact with proper Docker settings

## Related Decisions

- ADR-002: Security Architecture (CORS configuration)
- ADR-003: Component Extraction Pattern (monorepo structure)
- ADR-011: Git Workflow Enforcement (worktree usage)
