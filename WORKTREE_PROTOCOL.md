# WORKTREE PROTOCOL

> **CRITICAL**: This document defines MANDATORY worktree lifecycle management for all agents
> **Scope**: Applies to ALL agents working on the DrawDay project
> **Priority**: P0 - Violation is a CRITICAL ERROR

## ⚠️ WORKTREE LIFECYCLE - ABSOLUTE REQUIREMENTS ⚠️

### 1. WORKTREE CREATION (Start of EVERY Task)

```bash
# Navigate to project repository
cd project

# CRITICAL: Always branch from development, NEVER from main
git checkout development
git pull origin development

# Create worktree with descriptive naming
git worktree add ../worktrees/[agent-name]-[task-name] -b [agent-name]/[task-name]

# IMMEDIATELY navigate to worktree
cd ../worktrees/[agent-name]-[task-name]

# VERIFY you're in the correct location
pwd  # Must show: worktrees/[agent-name]-[task-name]
```

### 2. WORKTREE CLEANUP (MANDATORY After Task Completion)

```bash
# STEP 1: Ensure all changes are committed and pushed
git add .
git commit -m "type: description"
git push origin [agent-name]/[task-name]

# STEP 2: Create PR if needed
gh pr create --base development --title "[Type]: Description" --body "..."

# STEP 3: Return to project directory
cd ../../project

# STEP 4: Remove the worktree
git worktree remove ../worktrees/[agent-name]-[task-name]

# STEP 5: Verify removal
git worktree list  # Should NOT show your worktree
```

### 3. STALE WORKTREE CLEANUP (Weekly Maintenance)

```bash
# List all worktrees
git worktree list

# Prune stale worktree references
git worktree prune

# For each stale worktree:
git worktree remove /path/to/stale/worktree --force

# Clean up remote tracking branches
git remote prune origin

# Delete local branches for removed worktrees
git branch -d [branch-name]  # or -D for force delete
```

## 📋 WORKTREE RULES & ENFORCEMENT

### MANDATORY Rules

1. **ONE WORKTREE PER TASK** - Never reuse worktrees across tasks
2. **IMMEDIATE CLEANUP** - Remove worktree within 5 minutes of task completion
3. **NO ORPHANED WORKTREES** - All worktrees must have active tasks
4. **DESCRIPTIVE NAMING** - Format: `[agent-name]-[task-description]`
5. **BRANCH PROTECTION** - Always branch from `development`, NEVER from `main`

### Naming Convention

- **Worktree Directory**: `[agent-name]-[task-name]`
  - Example: `david-architecture-refactor`
  - Example: `emily-spinner-animation`
  - Example: `sarah-sprint-planning`

- **Git Branch**: `[agent-name]/[task-name]`
  - Example: `david/architecture-refactor`
  - Example: `emily/spinner-animation`
  - Example: `sarah/sprint-planning`

### Cleanup Verification Checklist

- [ ] All changes committed and pushed
- [ ] PR created (if applicable)
- [ ] Tests passing in worktree
- [ ] Returned to project directory
- [ ] Worktree removed with `git worktree remove`
- [ ] Verified removal with `git worktree list`
- [ ] Memento updated with task completion

## 🚨 FAILURE MODES (UNACCEPTABLE)

### Critical Violations

- ❌ **Leaving worktree after task completion** - CRITICAL ERROR
- ❌ **Not removing worktree after PR creation** - CRITICAL ERROR
- ❌ **Accumulating multiple stale worktrees** - CRITICAL ERROR
- ❌ **Working in main repository instead of worktree** - CRITICAL ERROR
- ❌ **Reusing old worktree for new task** - CRITICAL ERROR

### Consequences of Violations

1. **Immediate task failure** - Task marked incomplete
2. **Repository cleanup required** - Must clean all stale worktrees
3. **Memento documentation** - Violation logged for tracking
4. **Process review** - Agent must re-read this protocol

## 🔄 AUTOMATED CLEANUP SCRIPTS

### Daily Cleanup Script

```bash
#!/bin/bash
# cleanup-stale-worktrees.sh

echo "🧹 Cleaning stale worktrees..."

# List current worktrees
echo "Current worktrees:"
git worktree list

# Prune stale references
git worktree prune -v

# Check for orphaned directories
WORKTREE_DIR="../worktrees"
if [ -d "$WORKTREE_DIR" ]; then
  for dir in "$WORKTREE_DIR"/*; do
    if [ -d "$dir" ]; then
      # Check if directory is in git worktree list
      if ! git worktree list | grep -q "$dir"; then
        echo "Found orphaned worktree: $dir"
        rm -rf "$dir"
        echo "Removed: $dir"
      fi
    fi
  done
fi

echo "✅ Cleanup complete"
```

### Verification Script

```bash
#!/bin/bash
# verify-worktree-status.sh

echo "📊 Worktree Status Report"
echo "========================"

# Count worktrees
WORKTREE_COUNT=$(git worktree list | wc -l)
echo "Active worktrees: $((WORKTREE_COUNT - 1))"  # Subtract 1 for main

# List all worktrees with details
git worktree list --porcelain | while read -r line; do
  if [[ $line == worktree* ]]; then
    path=${line#worktree }
    echo "  - $path"
  fi
done

# Check for uncommitted changes in worktrees
echo ""
echo "Checking for uncommitted changes..."
git worktree list --porcelain | while read -r line; do
  if [[ $line == worktree* ]] && [[ $line != *project ]]; then
    path=${line#worktree }
    cd "$path" 2>/dev/null && {
      if ! git diff --quiet || ! git diff --cached --quiet; then
        echo "  ⚠️  Uncommitted changes in: $path"
      fi
    }
  fi
done

echo ""
echo "✅ Verification complete"
```

## 📝 MEMENTO TRACKING

### Required Memento Updates

When cleaning up worktrees, update Memento with:

```javascript
mcp__memento__create_entities({
  entities: [
    {
      name: 'Worktree-Cleanup-[Date]',
      entityType: 'maintenance',
      observations: [
        'Cleaned worktrees: [list of removed worktrees]',
        'Active worktrees remaining: [count]',
        'Branches pruned: [list]',
        'Date: [timestamp]',
        'Agent: [who performed cleanup]',
      ],
    },
  ],
});
```

## 🎯 SUCCESS METRICS

### Healthy Repository State

- ✅ Maximum 1 worktree per active agent
- ✅ Zero stale worktrees older than 24 hours
- ✅ All worktrees have corresponding active branches
- ✅ No orphaned directories in worktrees folder
- ✅ Clean `git worktree list` output

### Monitoring Commands

```bash
# Quick health check
git worktree list | wc -l  # Should be ≤ (active agents + 1)

# Find stale worktrees
find ../worktrees -maxdepth 1 -type d -mtime +1  # Older than 1 day

# Check for orphaned branches
git branch -r | grep -E "^  origin/(david|emily|michael|sarah|robert)/"
```

## 🔧 TROUBLESHOOTING

### Common Issues & Solutions

#### Issue: "fatal: [worktree] is already checked out"

```bash
# Solution: Force remove and cleanup
git worktree remove /path/to/worktree --force
git worktree prune
```

#### Issue: Orphaned worktree directory

```bash
# Solution: Manual cleanup
rm -rf ../worktrees/[orphaned-directory]
git worktree prune
```

#### Issue: Cannot remove worktree with uncommitted changes

```bash
# Solution: Commit or stash changes first
cd ../worktrees/[worktree-name]
git stash  # or git commit -m "WIP: saving work"
cd ../../project
git worktree remove ../worktrees/[worktree-name]
```

## 📅 MAINTENANCE SCHEDULE

### Daily (Automated)

- Run stale worktree cleanup script
- Verify no worktrees older than 24 hours

### Weekly (Manual Review)

- Review all active worktrees
- Clean up orphaned branches
- Update Memento with cleanup report

### Monthly (Deep Clean)

- Full repository health check
- Remove all unused branches
- Optimize repository with `git gc`

## ✅ FINAL REMINDER

**EVERY AGENT MUST:**

1. Create worktree at task start
2. Work ONLY in their worktree
3. Remove worktree immediately after task completion
4. Never leave stale worktrees

**VIOLATION = CRITICAL ERROR = TASK FAILURE**

This protocol ensures a clean, maintainable repository for the entire team.
