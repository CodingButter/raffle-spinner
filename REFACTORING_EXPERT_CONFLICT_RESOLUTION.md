# PR #34 Conflict Resolution Instructions

## For: code-quality-refactoring-specialist

### IMMEDIATE ACTION REQUIRED - Sprint Blocker

## Step 1: Navigate to Your Worktree

```bash
cd /home/codingbutter/GitHub/raffle-worktrees/code-quality-refactoring-specialist
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
- Merge the JSON structure carefully, maintaining all agent configurations

### 2. `packages/spinners/src/slot-machine/SlotMachineWheel.tsx`

- You've significantly refactored this file (reduced from 548 to 136 lines)
- Check if development has any new features added
- Ensure new features are incorporated into your refactored structure

### 3. `packages/spinners/src/slot-machine/SlotMachineWheelFixed.tsx`

- Similar major refactoring (reduced from 476 to 74 lines)
- Verify no functionality was lost during refactoring
- Merge any new development changes into the refactored components

## Step 4: Component Structure Validation

Your refactoring created these new components - ensure they're all functioning:

- `components/WheelCanvas.tsx` (217 lines - close to limit, consider splitting)
- `components/WheelRenderer.tsx` (217 lines - close to limit, consider splitting)
- `components/refactored/SegmentRenderer.tsx` (177 lines - OK)
- `components/refactored/ShadowRenderer.tsx` (76 lines - OK)
- `components/refactored/WheelAnimator.tsx` (176 lines - OK)
- `components/refactored/WinnerCalculator.tsx` (139 lines - OK)
- `hooks/useSubsetManagement.ts` (188 lines - OK)
- `hooks/useWheelState.ts` (61 lines - OK)

## Step 5: Dashboard Components Check

You also refactored dashboard components:

- Ensure `apps/website/app/dashboard/components/` integrates with any new dashboard features
- Verify `OverviewTab.tsx` reduction from 193 to 22 lines maintains functionality

## Step 6: Resolution Commands

```bash
# After resolving conflicts manually
git add .

# Commit with descriptive message
git commit -m "fix: resolve merge conflicts with development branch

- Merged .mcp.json configurations
- Integrated SlotMachineWheel refactoring with new features
- Maintained component separation and file size compliance
- Preserved all functionality during conflict resolution"

# Push to update PR
git push origin worktree/code-quality-refactoring-specialist
```

## Step 7: Validation

```bash
# Run build for spinner package
pnpm --filter spinners build

# Run build for website
pnpm --filter @drawday/website build

# Check that all imports are resolved
pnpm typecheck

# Verify file sizes remain compliant
find packages/spinners -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20
```

## Quality Requirements

- [ ] All conflicts resolved
- [ ] No files exceed 200 lines
- [ ] All refactored components maintain original functionality
- [ ] Build passes for both spinners and website
- [ ] TypeScript compilation succeeds
- [ ] All imports correctly updated
- [ ] PR shows "Ready to merge" status

## Testing Checklist

- [ ] Spinner wheel renders correctly
- [ ] Animation physics unchanged
- [ ] Winner calculation accurate
- [ ] Subset management working
- [ ] Theme switching functional
- [ ] Dashboard components display properly

## Report Back

Once complete, update the PR comment:

```bash
gh pr comment 34 --body "Conflicts resolved. Refactoring maintained with all functionality preserved. File size compliance verified. Ready for merge."
```

## Timeline

- Start: After PR #35 begins resolution
- Target Completion: 90 minutes
- Report Status: Every 30 minutes

## Merge Order Note

Your PR (#34) will be merged FIRST since it's a refactoring that affects core components. PR #35 will be merged after yours.
