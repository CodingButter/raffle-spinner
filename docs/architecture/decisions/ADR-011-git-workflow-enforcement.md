# ADR-011: Git Workflow Enforcement and Repository Hygiene

## Status

Accepted

## Context

During the post-meeting repository audit on 2025-08-18, several git workflow violations and hygiene issues were discovered:

1. **Uncommitted Changes in Worktrees**: Multiple team members had uncommitted changes in their worktrees
2. **Nested Worktrees**: Invalid nested worktree structures were created (worktrees/worktrees/\*)
3. **Stale Branches**: 9 merged remote branches were not deleted after PR completion
4. **Build Failures**: Pre-push hooks failing due to TypeScript/ESLint issues
5. **Unclosed Issues**: Resolved issues remained open after PR merges

## Decision

We will enforce stricter git workflow standards and automate repository hygiene:

### 1. Worktree Management

- Each developer must work in a properly named worktree: `../worktrees/{name}-{task}`
- Worktrees MUST be removed after PR creation
- No nested worktree structures allowed
- Uncommitted changes must be stashed or committed before switching contexts

### 2. Branch Lifecycle

- Branches must follow naming convention: `{name}/{feature-description}`
- Remote branches MUST be deleted after PR merge
- Local branches should be pruned weekly
- Development branch is the only long-lived branch besides main

### 3. Issue Management

- Issues MUST be closed when the implementing PR is merged
- Use GitHub's auto-close keywords in PR descriptions: "Closes #XX"
- Regular issue triage to identify stale or resolved issues

### 4. Quality Gates

- Pre-push hooks must pass before pushing to remote
- If hooks fail, fix the issues rather than bypassing with --no-verify
- TypeScript compilation must succeed
- ESLint errors in new/modified files must be fixed

### 5. Repository Hygiene Script

Create automated cleanup script to run weekly:

```bash
# Prune remote branches
git remote prune origin

# Delete merged local branches
git branch --merged | grep -v "development\|main" | xargs -r git branch -d

# List worktrees for review
git worktree list

# Check for uncommitted changes
git status --porcelain
```

## Consequences

### Positive

- Cleaner repository structure
- Reduced merge conflicts
- Faster CI/CD pipelines
- Better tracking of completed work
- Easier onboarding for new team members

### Negative

- Additional overhead for developers
- Learning curve for worktree workflow
- Potential for lost work if not careful with cleanup

## Alternatives Considered

1. **Feature Branches Only**: Rejected - worktrees provide better isolation
2. **Manual Cleanup**: Rejected - prone to human error and forgetfulness
3. **No Enforcement**: Rejected - leads to repository chaos as seen in audit

## Rollback Plan

1. Document current workflow violations
2. Gradually introduce enforcement
3. If issues arise, revert to manual process with better documentation

## Success Metrics

- Zero nested worktrees
- <5 stale branches at any time
- 100% of merged PRs have deleted branches
- All resolved issues closed within 24 hours
- Pre-push hooks passing rate >95%

## Implementation Checklist

- [ ] Create cleanup automation script
- [ ] Add worktree checks to CI/CD
- [ ] Update developer onboarding docs
- [ ] Configure GitHub branch protection rules
- [ ] Set up weekly hygiene reminders

## References

- Git Worktree Documentation: https://git-scm.com/docs/git-worktree
- GitHub Flow: https://docs.github.com/en/get-started/quickstart/github-flow
- Conventional Commits: https://www.conventionalcommits.org/

## Audit Trail

- 2025-08-18: Initial audit discovered violations
- 2025-08-18: ADR created by David Miller
- 2025-08-18: Immediate cleanup performed (closed 2 issues, deleted 9 branches, removed 5 worktrees)
