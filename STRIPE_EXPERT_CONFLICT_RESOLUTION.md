# PR #35 Conflict Resolution Instructions

## For: stripe-subscription-expert

### IMMEDIATE ACTION REQUIRED - Sprint Blocker

## Step 1: Navigate to Your Worktree

```bash
cd /home/codingbutter/GitHub/raffle-worktrees/stripe-subscription-expert
```

## Step 2: Update Your Branch

```bash
# Fetch latest changes
git fetch origin

# Merge latest development (this will show conflicts)
git merge origin/development
```

## Step 3: Expected Conflicts

### 1. `.mcp.json`

- **Resolution**: Keep BOTH changes (your agent PID update + any new from development)
- Merge the JSON structure carefully

### 2. `apps/website/lib/stripe-webhook-handlers.ts`

- You modified lines around line 105 for subscription handling
- Check if development has any new webhook handlers
- Merge both sets of changes, ensuring all webhook types are handled

### 3. `packages/storage/src/types.ts`

- Minor conflict likely from type additions
- Keep both your analytics types and any new types from development

### 4. `pnpm-lock.yaml`

- Run `pnpm install` after resolving other conflicts
- This will regenerate the lockfile correctly

## Step 4: Specific File Checks

Review these files that you added/modified:

- `apps/website/app/dashboard/analytics/page.tsx` (280 lines - VIOLATES 200 line limit!)
  - **ACTION**: Split into smaller components before pushing
- `apps/website/lib/stripe-webhook-handlers-enhanced.ts` (525 lines - VIOLATES 200 line limit!)
  - **ACTION**: Extract handler functions into separate files
- `apps/website/components/dashboard/subscription/PlanChangeDialog.tsx` (295 lines - VIOLATES 200 line limit!)
  - **ACTION**: Break into smaller dialog components

## Step 5: Resolution Commands

```bash
# After resolving conflicts manually
git add .

# Commit with descriptive message
git commit -m "fix: resolve merge conflicts with development branch

- Merged .mcp.json agent configurations
- Integrated webhook handler updates
- Fixed storage type definitions
- Refactored large files to comply with 200-line limit"

# Push to update PR
git push origin worktree/stripe-subscription-expert
```

## Step 6: Validation

```bash
# Run build to ensure no errors
pnpm --filter @drawday/website build

# Run type check
pnpm typecheck

# Check file sizes
find apps/website -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20
```

## Quality Requirements

- [ ] All conflicts resolved
- [ ] No files exceed 200 lines
- [ ] Build passes
- [ ] TypeScript compilation succeeds
- [ ] PR shows "Ready to merge" status

## Report Back

Once complete, update the PR comment:

```bash
gh pr comment 35 --body "Conflicts resolved. All files now comply with 200-line limit. Ready for merge."
```

## Timeline

- Start: IMMEDIATELY
- Target Completion: 90 minutes
- Report Status: Every 30 minutes
