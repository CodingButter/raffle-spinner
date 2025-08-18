# ADR-001: Git Worktree Lifecycle Management

## Status

Accepted

## Context

The DrawDay project has experienced repository management issues due to accumulation of stale git worktrees. Multiple agents were leaving worktrees after task completion, leading to:

- 11+ stale worktrees consuming disk space
- Orphaned directories in the filesystem
- Stale local and remote branches
- Confusion about which worktrees are active
- Performance degradation in git operations

Without a clear protocol, agents were creating worktrees but not cleaning them up, resulting in technical debt and maintenance overhead.

## Decision

We have established a mandatory worktree lifecycle management protocol that all agents must follow:

1. **Strict Lifecycle Rules**: Every worktree must be created at task start and removed immediately after task completion
2. **Naming Convention**: Worktrees follow the pattern `[agent-name]-[task-name]` for directories and `[agent-name]/[task-name]` for branches
3. **Automated Cleanup**: Provide scripts for daily cleanup of stale worktrees (>24 hours old)
4. **Verification Tools**: Health check scripts to monitor repository state
5. **Documentation**: WORKTREE_PROTOCOL.md as the single source of truth for worktree management

## Consequences

### Positive

- **Clean Repository**: No accumulation of stale worktrees
- **Clear Ownership**: Each worktree clearly identifies the responsible agent
- **Better Performance**: Fewer worktrees means faster git operations
- **Reduced Confusion**: Clear active/inactive worktree distinction
- **Automated Maintenance**: Scripts handle routine cleanup tasks
- **Audit Trail**: Can track which agent worked on what and when

### Negative

- **Additional Overhead**: Agents must remember to clean up after themselves
- **Learning Curve**: New agents must learn the protocol
- **Enforcement Burden**: Requires monitoring and enforcement
- **Script Maintenance**: Cleanup scripts need occasional updates

## Alternatives Considered

1. **Single Shared Worktree**: All agents use one worktree
   - **Rejected**: Would cause merge conflicts and block parallel work

2. **No Worktrees (Direct Main Repo)**: Work directly in the main repository
   - **Rejected**: Violates clean workspace principles, risks accidental commits to wrong branch

3. **Weekly Manual Cleanup**: Human performs cleanup weekly
   - **Rejected**: Too much accumulation between cleanups, requires human intervention

4. **Automatic Cleanup on Age**: Auto-delete worktrees older than X days
   - **Rejected**: Might delete active long-running work, needs more sophisticated detection

## Rollback Plan

If the worktree protocol causes issues:

1. **Immediate**: Agents can temporarily work in a single shared worktree
2. **Short-term**: Relax cleanup requirements to weekly instead of immediate
3. **Long-term**: Revisit protocol and adjust based on pain points
4. **Emergency**: Can revert to direct repository work with careful branch management

Steps to rollback:

```bash
# 1. Stop enforcing immediate cleanup
# 2. Allow agents to keep worktrees for current sprint
# 3. Move to weekly cleanup schedule
# 4. Document exceptions in WORKTREE_PROTOCOL.md
```

## Success Metrics

- **Worktree Count**: ≤1 active worktree per agent at any time
- **Stale Worktree Age**: No worktrees older than 24 hours
- **Cleanup Frequency**: Daily automated cleanup runs successfully
- **Repository Health Score**: Maintain ≥90% health score
- **Agent Compliance**: 100% of tasks follow worktree protocol

## Implementation Notes

- Protocol documented in `WORKTREE_PROTOCOL.md`
- Cleanup scripts in `scripts/cleanup-stale-worktrees.sh`
- Verification script in `scripts/verify-worktree-status.sh`
- Integrated into AGENT_DIRECTIVES.md for mandatory compliance
- Updated CLAUDE.md to reference the protocol

## Review Date

2025-09-18 (3 months)

## References

- WORKTREE_PROTOCOL.md
- AGENT_DIRECTIVES.md
- Git Worktree Documentation: https://git-scm.com/docs/git-worktree
