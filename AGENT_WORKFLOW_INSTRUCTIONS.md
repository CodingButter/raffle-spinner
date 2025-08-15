# Agent Workflow Instructions

## MANDATORY WORKFLOW FOR ALL AGENTS

### Your Worktree Location

Each specialist works in their dedicated worktree:

- Frontend Expert: `/home/codingbutter/GitHub/raffle-worktrees/frontend-expert`
- Stripe Expert: `/home/codingbutter/GitHub/raffle-worktrees/stripe-subscription-expert`
- Chrome Extension: `/home/codingbutter/GitHub/raffle-worktrees/chrome-extension-specialist`
- Performance: `/home/codingbutter/GitHub/raffle-worktrees/performance-engineering-specialist`
- Code Quality: `/home/codingbutter/GitHub/raffle-worktrees/code-quality-refactoring-specialist`
- Monorepo: `/home/codingbutter/GitHub/raffle-worktrees/monorepo-architecture-specialist`
- CSV Expert: `/home/codingbutter/GitHub/raffle-worktrees/data-processing-csv-expert`
- Project Manager: `/home/codingbutter/GitHub/raffle-worktrees/project-manager`
- Lead Architect: `/home/codingbutter/GitHub/raffle-worktrees/lead-developer-architect`

### Development Branch Workflow

**ALL WORK FLOWS THROUGH THE `development` BRANCH**

1. **Before Starting Any Task**:

   ```bash
   cd /home/codingbutter/GitHub/raffle-worktrees/[your-name]
   git fetch origin
   git merge origin/development
   ```

2. **During Work**:
   - Commit frequently (every 30-60 minutes)
   - Push to your worktree branch regularly
   - Keep commits focused and descriptive

3. **When Task is Complete**:

   ```bash
   # Push your final changes
   git push origin worktree/[your-name]

   # Create PR to development branch
   gh pr create --base development \
     --title "[Your Role] Task: Description" \
     --body "## Summary
     - What was done
     - Why it was done
     - Testing performed

     ## Checklist
     - [ ] Follows 200-line file limit
     - [ ] Passes all quality checks
     - [ ] Tested locally
     - [ ] Updated memento with findings"
   ```

4. **Tag Reviewers**:
   - **For Code Changes**: Tag `@CodingButter` (lead-developer reviews)
   - **For Non-Code**: Tag `@CodingButter` (project-manager reviews)
   - Add label: `needs-review`

5. **After PR Creation**:
   - **WAIT for approval** before starting next task
   - Monitor PR for feedback
   - Address any requested changes promptly

### Critical Rules

1. **NEVER merge directly** - Always create PR to `development`
2. **NEVER work on main or team-dev** - Only work in your worktree
3. **ALWAYS sync with development** before starting new work
4. **ALWAYS wait for PR approval** before next task
5. **COMMIT frequently** - Don't let work pile up

### PR Title Format

```
[Role] Task: Brief Description
```

Examples:

- `[Frontend] Fix: Subscription status display issue`
- `[Performance] Optimize: Spinner rendering for 10k+ entries`
- `[Code Quality] Refactor: Split SlotMachineWheel into components`

### Handling Merge Conflicts

If you encounter conflicts when merging from development:

1. **Don't panic** - Conflicts are normal in team development
2. **Fetch and merge**:
   ```bash
   git fetch origin
   git merge origin/development
   ```
3. **Resolve conflicts** in your editor
4. **Test thoroughly** after resolution
5. **Commit the merge**:
   ```bash
   git add .
   git commit -m "Merge development and resolve conflicts"
   git push origin worktree/[your-name]
   ```

### Quality Gates

Before creating ANY PR, verify:

- [ ] No files exceed 200 lines
- [ ] All tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Memento updated with decisions/findings

### Emergency Procedures

For URGENT fixes only:

1. Create PR with `URGENT` label
2. Tag both `@CodingButter`
3. Message in team chat
4. Explain urgency in PR description

### Questions?

- Technical questions: Ask in PR comments
- Process questions: Check DEVELOPMENT_WORKFLOW.md
- Blockers: Tag reviewer with `blocked` label
