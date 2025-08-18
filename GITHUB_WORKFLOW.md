# GitHub Issue-Based Workflow

## Overview

This document outlines the GitHub issue-based workflow for the DrawDay development team. All development work must be tracked through GitHub issues for better visibility, accountability, and project management.

## Issue Creation Process

### Who Creates Issues

- **Lead Developer Architect**: Creates technical debt and architecture issues
- **Project Manager**: Creates feature and sprint planning issues
- **Scrum Master**: Facilitates issue creation and ensures proper assignment
- **Any Team Member**: Can create issues for bugs or improvements

### Issue Format

All issues must include:

1. **Clear Title**: Descriptive and actionable
2. **Description**: What needs to be done and why
3. **Acceptance Criteria**: Checklist of requirements
4. **Labels**: Appropriate categorization
5. **Priority**: P0-P3 level
6. **Effort Estimate**: XS-XXL sizing

## Priority Levels

### P0 - Critical (Production Blocker)

- System is down or severely impacted
- Data loss or security vulnerability
- Must be fixed immediately

### P1 - High (Sprint Commitment)

- Major feature or important bug fix
- Committed for current sprint
- Blocks other work

### P2 - Medium (Next Sprint)

- Important but not urgent
- Planned for next sprint
- Enhancement or optimization

### P3 - Low (Backlog)

- Nice to have
- Minor improvements
- Can be done when time permits

## Labels

### Category Labels

- `bug`: Something isn't working
- `feature`: New feature or request
- `enhancement`: Improvement to existing feature
- `documentation`: Documentation only changes

### Technical Labels

- `refactoring`: Code refactoring (200-line limit enforcement)
- `code-quality`: Code quality improvements
- `performance`: Performance optimization
- `frontend`: Frontend/UI work
- `extension`: Chrome extension related
- `stripe`: Payment/subscription system
- `csv`: CSV processing
- `marketing`: Marketing/copy work
- `build`: Build/tooling issues

### Status Labels

- `blocked`: Blocked by dependency
- `in-progress`: Currently being worked on
- `needs-review`: Ready for code review
- `ready-to-merge`: Approved and ready

## Agent Workflow

### 1. Check Assigned Issues (Start of Each Session)

```bash
# Check your assigned issues
gh issue list --assignee @me --state open

# View specific issue details
gh issue view [issue-number]
```

### 2. Select Issue to Work On

Priority order:

1. P0 - Critical issues
2. P1 - Sprint commitments
3. P2 - Next sprint items
4. P3 - Backlog items

### 3. Create Feature Branch

```bash
# Create branch with issue number
git checkout -b issue-[number]-short-description

# Example
git checkout -b issue-22-refactor-slotmachine
```

### 4. Work on Issue

- Make changes following coding standards
- Ensure files stay under 200 lines
- Write tests if applicable
- Follow DRY principles

### 5. Update Issue Status

```bash
# Add progress comment
gh issue comment [issue-number] --body "Status: Started refactoring, 50% complete"

# Add in-progress label
gh issue edit [issue-number] --add-label "in-progress"
```

### 6. Commit with Issue Reference

```bash
# Commit message format
git commit -m "fix: #[issue-number] description of change"

# Examples
git commit -m "fix: #22 refactor SlotMachineWheel to under 200 lines"
git commit -m "feat: #26 add subscription analytics dashboard"
```

### 7. Create Pull Request

```bash
# Create PR linking to issue
gh pr create --title "Fix #[issue-number]: Description" \
  --body "Closes #[issue-number]

## Changes
- Change 1
- Change 2

## Testing
- Test 1
- Test 2"
```

### 8. Close Issue

Issues are automatically closed when PR is merged if you use:

- `Closes #[issue-number]` in PR description
- `Fixes #[issue-number]` in PR description
- `Resolves #[issue-number]` in PR description

Manual close:

```bash
gh issue close [issue-number] --comment "Completed in PR #[pr-number]"
```

## Sprint Planning

### Sprint Start

1. Review all P0 and P1 issues
2. Assign issues to team members based on expertise
3. Ensure balanced workload
4. Set sprint goals

### Daily Standup

1. Each agent reports on assigned issues
2. Update issue status
3. Identify blockers
4. Reassign if needed

### Sprint End

1. Review completed issues
2. Move incomplete issues to next sprint
3. Close completed issues
4. Sprint retrospective

## Issue Lifecycle

```
Created → Assigned → In Progress → In Review → Ready to Merge → Closed
```

1. **Created**: Issue is created with proper format
2. **Assigned**: Assigned to appropriate specialist
3. **In Progress**: Developer actively working
4. **In Review**: PR created and under review
5. **Ready to Merge**: Approved and passing tests
6. **Closed**: Merged and deployed

## Automation

### GitHub Actions Integration

Issues trigger automated workflows:

- P0 issues trigger immediate alerts
- PR creation runs tests automatically
- Merge to main triggers deployment

### Issue Templates

Use templates for consistency:

- `/task.md`: Standard development task
- `/bug.md`: Bug report template
- `/feature.md`: Feature request template

## Best Practices

1. **One Issue, One PR**: Each PR should address exactly one issue
2. **Small, Focused Changes**: Keep PRs under 500 lines when possible
3. **Clear Communication**: Update issues with progress regularly
4. **Link Everything**: Always reference issue numbers in commits and PRs
5. **Close Promptly**: Close issues as soon as work is complete
6. **Regular Grooming**: Review and update issue priorities weekly

## Metrics

Track these metrics for team health:

- **Velocity**: Issues completed per sprint
- **Cycle Time**: Time from assigned to closed
- **Bug Rate**: Bugs created vs features delivered
- **Tech Debt**: Refactoring issues completed
- **Code Quality**: Files over 200 lines

## Tools

### GitHub CLI Commands

```bash
# List all open issues
gh issue list --state open

# List issues by label
gh issue list --label "refactoring"

# Create new issue
gh issue create --title "Title" --body "Description"

# Assign issue
gh issue edit [number] --add-assignee username

# Add labels
gh issue edit [number] --add-label "label1,label2"

# View issue in browser
gh issue view [number] --web
```

### Integration with Memento

Document issue resolutions in memento for knowledge preservation:

- Architectural decisions made
- Technical solutions implemented
- Lessons learned
- Performance improvements achieved

## Emergency Procedures

### P0 Issue Protocol

1. **Immediate Assignment**: Assign to available specialist
2. **All Hands**: May pull resources from other work
3. **Direct Communication**: Use synchronous communication
4. **Rapid Deployment**: Skip normal review process if needed
5. **Post-Mortem**: Document cause and prevention

## Questions?

Contact:

- **Technical**: Lead Developer Architect
- **Process**: Scrum Master
- **Priority**: Project Manager
