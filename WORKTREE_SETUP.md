# Git Worktree Setup for Parallel Development

## Overview

This project uses Git worktrees to enable TRUE parallel development. Each team member works in their own isolated directory with their own branch, preventing conflicts and enabling simultaneous development.

## Worktree Structure

Each specialist has their own worktree:

| Team Member                         | Worktree Path                                                                    | Branch                                         | Purpose                    |
| ----------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------- |
| Frontend Expert                     | `/home/codingbutter/GitHub/raffle-worktrees/frontend-expert`                     | `worktree/frontend-expert`                     | React, UI, CSS development |
| Stripe Subscription Expert          | `/home/codingbutter/GitHub/raffle-worktrees/stripe-subscription-expert`          | `worktree/stripe-subscription-expert`          | Payment integration        |
| Chrome Extension Specialist         | `/home/codingbutter/GitHub/raffle-worktrees/chrome-extension-specialist`         | `worktree/chrome-extension-specialist`         | Browser extension features |
| Performance Engineering Specialist  | `/home/codingbutter/GitHub/raffle-worktrees/performance-engineering-specialist`  | `worktree/performance-engineering-specialist`  | Performance optimization   |
| Code Quality Refactoring Specialist | `/home/codingbutter/GitHub/raffle-worktrees/code-quality-refactoring-specialist` | `worktree/code-quality-refactoring-specialist` | Refactoring & cleanup      |
| Monorepo Architecture Specialist    | `/home/codingbutter/GitHub/raffle-worktrees/monorepo-architecture-specialist`    | `worktree/monorepo-architecture-specialist`    | Package management         |
| Data Processing CSV Expert          | `/home/codingbutter/GitHub/raffle-worktrees/data-processing-csv-expert`          | `worktree/data-processing-csv-expert`          | CSV & data processing      |
| Project Manager                     | `/home/codingbutter/GitHub/raffle-worktrees/project-manager`                     | `worktree/project-manager`                     | Documentation & planning   |
| Lead Developer Architect            | `/home/codingbutter/GitHub/raffle-worktrees/lead-developer-architect`            | `worktree/lead-developer-architect`            | Architecture decisions     |

## Daily Workflow

### 1. Starting Work (Each Agent)

```bash
# Navigate to your worktree
cd /home/codingbutter/GitHub/raffle-worktrees/[your-role]

# Pull latest changes from main
git fetch origin
git rebase origin/main

# Start your work
pnpm install  # If dependencies changed
pnpm dev      # Start development
```

### 2. During Development

- **ALWAYS work in your assigned worktree**
- **NEVER work in the main repository directory**
- Commit frequently to your branch
- Keep commits focused and atomic

### 3. Committing Changes

```bash
# In your worktree
git add .
git commit -m "feat: [your-role] description of changes"
git push origin worktree/[your-role]
```

## Merging Strategy

### Daily Sync Process (Lead Developer Architect)

1. **Review all worktree branches**

```bash
git fetch --all
git branch -r | grep worktree/
```

2. **Merge completed work to team-dev**

```bash
# In main repository
cd /home/codingbutter/GitHub/raffle-spinner
git checkout team-dev

# Merge each specialist's work
git merge origin/worktree/frontend-expert --no-ff
git merge origin/worktree/stripe-subscription-expert --no-ff
# ... repeat for each specialist with completed work

# Push consolidated changes
git push origin team-dev
```

3. **Sync worktrees with latest changes**

```bash
# Notify all specialists to rebase
# Each specialist runs in their worktree:
git fetch origin
git rebase origin/team-dev
```

## Conflict Resolution

### Prevention Strategy

1. **Clear ownership boundaries**
   - Frontend Expert: `/apps/website/app`, `/packages/@drawday/ui`
   - Chrome Extension: `/apps/spinner-extension`
   - Monorepo: Package configurations, build systems
   - Each specialist owns specific domains

2. **Communication channels**
   - Use memento-mcp to document changes
   - Daily stand-ups to coordinate overlapping work
   - Slack/Discord for real-time coordination

### Resolution Process

1. **Identify conflict during rebase**

```bash
git rebase origin/team-dev
# Conflict detected
```

2. **Resolve conflicts**

```bash
# Open conflicted files
# Keep both changes if applicable
# Or coordinate with other specialist
git add [resolved-files]
git rebase --continue
```

3. **Document resolution**

```bash
# Create memento entry about conflict resolution
# Document decision made and rationale
```

## Best Practices

### DO's

- ✅ Always work in your assigned worktree
- ✅ Commit frequently with clear messages
- ✅ Rebase daily to stay current
- ✅ Document architectural decisions in memento
- ✅ Communicate before touching shared code
- ✅ Run tests before pushing

### DON'Ts

- ❌ Never work in the main repository
- ❌ Don't merge directly to main
- ❌ Don't modify another specialist's core files
- ❌ Don't force push to shared branches
- ❌ Don't ignore build failures

## Worktree Management Commands

### List all worktrees

```bash
git worktree list
```

### Add a new worktree

```bash
git worktree add -b worktree/new-specialist /home/codingbutter/GitHub/raffle-worktrees/new-specialist
```

### Remove a worktree

```bash
git worktree remove /home/codingbutter/GitHub/raffle-worktrees/[specialist]
```

### Prune stale worktrees

```bash
git worktree prune
```

## Integration with CI/CD

### Branch Protection Rules

- `main`: Protected, requires PR review
- `team-dev`: Integration branch, requires passing tests
- `worktree/*`: Individual specialist branches, no restrictions

### Automated Testing

Each worktree push triggers:

1. Type checking
2. Linting
3. Unit tests
4. Build verification

### Deployment Pipeline

```
worktree/* branches → team-dev (integration) → main (production)
```

## Troubleshooting

### Issue: Dependencies out of sync

```bash
# In your worktree
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Worktree corrupted

```bash
# From main repository
git worktree remove --force /home/codingbutter/GitHub/raffle-worktrees/[specialist]
git worktree add -b worktree/[specialist] /home/codingbutter/GitHub/raffle-worktrees/[specialist]
cd /home/codingbutter/GitHub/raffle-worktrees/[specialist]
pnpm install
```

### Issue: Can't push to branch

```bash
# Ensure you're on the right branch
git branch --show-current
# Should show: worktree/[your-role]

# Set upstream if needed
git push -u origin worktree/[your-role]
```

## Monitoring & Metrics

### Daily Checks (Project Manager)

1. Review worktree activity

```bash
for branch in $(git branch -r | grep worktree/); do
  echo "=== $branch ==="
  git log $branch --oneline -5
done
```

2. Check for stale branches

```bash
for branch in $(git branch -r | grep worktree/); do
  echo "=== $branch ==="
  git log -1 --format="%ci %cr" $branch
done
```

3. Monitor merge conflicts

```bash
# Test merge each worktree to team-dev
for branch in $(git branch -r | grep worktree/); do
  git merge --no-commit --no-ff $branch
  git merge --abort
done
```

## Emergency Procedures

### Rollback a bad merge

```bash
git checkout team-dev
git reset --hard HEAD~1  # Remove last merge
git push --force-with-lease origin team-dev
```

### Recover lost work

```bash
git reflog  # Find the commit
git cherry-pick [commit-hash]
```

### Reset a worktree to clean state

```bash
cd /home/codingbutter/GitHub/raffle-worktrees/[specialist]
git reset --hard origin/team-dev
git clean -fd
pnpm install
```

## Summary

Git worktrees enable:

- 🚀 True parallel development
- 🔒 Isolated work environments
- 🎯 Clear ownership boundaries
- 🔄 Smooth integration process
- 📊 Better tracking and metrics

Each specialist can work independently without fear of conflicts, while the lead developer architect orchestrates the integration of all work into a cohesive whole.
