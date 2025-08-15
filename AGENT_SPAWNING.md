# Agent Spawning System Documentation

## Overview

The DrawDay Agent Spawning System enables true parallel execution of multiple Claude Code instances, each working independently in their own git worktree while sharing knowledge through the memento MCP system.

## Architecture

### Worktree Structure

Each specialist agent has its own git worktree at:

```
/home/codingbutter/GitHub/raffle-worktrees/[agent-name]/
```

### Port Assignments

Each worktree has unique MCP ports to avoid conflicts:

| Agent                               | Worktree                            | Code-Health Port |
| ----------------------------------- | ----------------------------------- | ---------------- |
| frontend-expert                     | frontend-expert                     | 43111            |
| stripe-subscription-expert          | stripe-subscription-expert          | 43112            |
| marketing-manager                   | marketing-manager                   | 43113            |
| code-quality-refactoring-specialist | code-quality-refactoring-specialist | 43114            |
| performance-engineering-specialist  | performance-engineering-specialist  | 43115            |
| chrome-extension-specialist         | chrome-extension-specialist         | 43116            |
| data-processing-csv-expert          | data-processing-csv-expert          | 43117            |
| monorepo-architecture-specialist    | monorepo-architecture-specialist    | 43118            |
| lead-developer-architect            | lead-developer-architect            | 43119            |
| project-manager                     | project-manager                     | 43120            |

**Note:** Memento MCP uses the same port (Neo4j on 7687) for all agents as it's a shared knowledge base.

## Scripts

All scripts are located in `/home/codingbutter/GitHub/raffle-spinner/scripts/`

### spawn-agent.sh

Spawns a single Claude Code instance in a specific worktree.

**Usage:**

```bash
./scripts/spawn-agent.sh <worktree-name> <agent-name> "<task-description>"
```

**Example:**

```bash
./scripts/spawn-agent.sh frontend-expert frontend-expert "Fix all button padding issues in the website"
```

**Features:**

- Validates worktree existence
- Creates detailed prompt with context
- Logs output to timestamped file
- Tracks PID for monitoring
- Includes memento integration instructions

### spawn-all-agents.sh

Spawns all agents with predefined tasks based on PROJECT_SCOPE.md.

**Usage:**

```bash
./scripts/spawn-all-agents.sh
```

**Features:**

- Spawns multiple agents in sequence
- Includes 2-second delay between spawns to avoid resource conflicts
- Pre-configured with current sprint tasks
- Shows status after each spawn

### monitor-agents.sh

Real-time monitoring dashboard for all agents.

**Usage:**

```bash
./scripts/monitor-agents.sh

# For continuous monitoring:
watch -n 10 ./scripts/monitor-agents.sh
```

**Shows:**

- Agent running status (RUNNING/STOPPED/NOT SPAWNED)
- Latest activity from logs
- Recent git commits (last 24h)
- Modified files in each worktree
- Current branch
- Summary statistics
- Resource usage (memory)

### kill-agent.sh

Stops a specific agent.

**Usage:**

```bash
./scripts/kill-agent.sh <worktree-name>

# Example:
./scripts/kill-agent.sh frontend-expert
```

### kill-all-agents.sh

Stops all running agents and cleans up orphaned processes.

**Usage:**

```bash
./scripts/kill-all-agents.sh
```

**Features:**

- Kills all tracked agents
- Cleans up stale PID files
- Finds and kills orphaned claude-code processes
- Shows summary of actions taken

## Workflow

### Starting Agents

1. **Spawn a single agent for a specific task:**

   ```bash
   ./scripts/spawn-agent.sh code-quality-refactoring-specialist code-quality-refactoring-specialist \
     "Refactor SlotMachineWheel.tsx into components under 200 lines"
   ```

2. **Spawn all agents for sprint work:**
   ```bash
   ./scripts/spawn-all-agents.sh
   ```

### Monitoring Progress

1. **Check agent status:**

   ```bash
   ./scripts/monitor-agents.sh
   ```

2. **Watch specific agent logs:**

   ```bash
   tail -f logs/frontend-expert_*.log
   ```

3. **Check code-health dashboard:**
   Each agent has its own dashboard port:

   ```bash
   # Frontend expert dashboard
   http://localhost:43111

   # Code quality specialist dashboard
   http://localhost:43114
   ```

### Managing Agents

1. **Stop a specific agent:**

   ```bash
   ./scripts/kill-agent.sh frontend-expert
   ```

2. **Stop all agents:**

   ```bash
   ./scripts/kill-all-agents.sh
   ```

3. **Restart an agent with new task:**
   ```bash
   ./scripts/kill-agent.sh frontend-expert
   ./scripts/spawn-agent.sh frontend-expert frontend-expert "New task description"
   ```

## Log Management

Logs are stored in: `/home/codingbutter/GitHub/raffle-spinner/logs/`

Format: `[worktree-name]_[timestamp].log`

Example: `frontend-expert_20250115_143022.log`

### Viewing Logs

```bash
# List all logs
ls -la logs/

# View latest log for an agent
tail -f logs/frontend-expert_*.log

# Search logs for errors
grep -i error logs/*.log

# Clean old logs (older than 7 days)
find logs/ -name "*.log" -mtime +7 -delete
```

## Memento Integration

All agents share the same Neo4j-backed memento knowledge base, enabling:

- Shared context and discoveries
- Cross-agent coordination
- Progress tracking
- Knowledge preservation

Agents are instructed to:

1. Query memento for context before starting
2. Update memento with progress during work
3. Document findings and decisions
4. Create relations between related work

## Troubleshooting

### Agent Not Starting

- Check worktree exists: `ls /home/codingbutter/GitHub/raffle-worktrees/`
- Verify Claude CLI is installed: `which claude`
- Check for port conflicts: `lsof -i :43111-43120`

### Port Conflicts

- Each agent must have unique code-health port
- Check `.mcp.json` in each worktree
- Kill any processes using conflicting ports

### Orphaned Processes

```bash
# Find orphaned claude processes
pgrep -f "claude.*raffle-worktrees"

# Kill them
./scripts/kill-all-agents.sh
```

### Log Issues

- Ensure logs directory exists: `mkdir -p logs/`
- Check disk space: `df -h`
- Verify write permissions: `touch logs/test.log`

## Best Practices

1. **Task Clarity**: Provide clear, specific task descriptions
2. **Regular Monitoring**: Check agent progress every 30-60 minutes
3. **Log Rotation**: Clean old logs weekly
4. **Resource Management**: Don't spawn more than 5-6 agents simultaneously
5. **Commit Frequency**: Agents should commit every 2-3 significant changes
6. **PR Creation**: Agents create PRs to team-dev branch when complete

## Performance Considerations

- Each Claude CLI instance uses ~200-500MB RAM
- Code-health dashboards use ~50MB each
- Neo4j (memento) uses ~500MB
- Total system requirement: ~4GB RAM for full team

## Security Notes

- Agents work in isolated worktrees
- Each has separate branch to prevent conflicts
- Memento password is shared (secured in .mcp.json)
- No production credentials in worktrees

## Future Enhancements

- [ ] Automatic task assignment from PROJECT_SCOPE.md
- [ ] Agent communication system
- [ ] Performance metrics dashboard
- [ ] Automatic PR merging after review
- [ ] Task priority queue
- [ ] Agent health checks
- [ ] Automatic restart on failure
