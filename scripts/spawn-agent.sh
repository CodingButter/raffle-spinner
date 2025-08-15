#!/bin/bash
# Spawn a Claude Code agent in a specific worktree
# Usage: ./spawn-agent.sh <worktree-name> <agent-name> "<prompt>"

WORKTREE_NAME=$1
AGENT_NAME=$2
PROMPT=$3

# Validate inputs
if [ -z "$WORKTREE_NAME" ] || [ -z "$AGENT_NAME" ] || [ -z "$PROMPT" ]; then
  echo "Usage: ./spawn-agent.sh <worktree-name> <agent-name> \"<prompt>\""
  echo "Example: ./spawn-agent.sh frontend-expert frontend-expert \"Fix button padding issues\""
  exit 1
fi

WORKTREE_PATH="/home/codingbutter/GitHub/raffle-worktrees/${WORKTREE_NAME}"
REPO_PATH="/home/codingbutter/GitHub/raffle-spinner"
LOG_DIR="${REPO_PATH}/agent_logs"

# Check worktree exists
if [ ! -d "$WORKTREE_PATH" ]; then
  echo "Error: Worktree not found: $WORKTREE_PATH"
  echo "Available worktrees:"
  ls -1 /home/codingbutter/GitHub/raffle-worktrees/
  exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Build the full prompt with agent context and tool requirements
FULL_PROMPT="You are the ${AGENT_NAME} specialist working in the ${WORKTREE_NAME} worktree for the DrawDay project.

CRITICAL REQUIREMENTS:
- You are in worktree: ${WORKTREE_PATH}
- Your branch: worktree/${WORKTREE_NAME}
- You have FULL TOOL ACCESS including Task tool for coordination
- Query memento-mcp FIRST for context about your assigned tasks
- Update memento-mcp with progress after EACH significant step

YOUR ASSIGNED TASK: ${PROMPT}

MANDATORY WORKFLOW:
1. START: Query memento for context
   - mcp__memento__semantic_search for \"${AGENT_NAME} tasks\"
   - mcp__memento__semantic_search for \"${PROMPT}\"
2. EXECUTE: Work ONLY in this worktree directory
   - cd ${WORKTREE_PATH} first
   - Never modify files outside this worktree
3. TRACK: Log all actions and decisions
   - Document what you're doing and why
   - Report any blockers or issues encountered
4. COMMIT: Create atomic commits with clear messages
   - Each logical change gets its own commit
   - Include context in commit messages
5. UPDATE: Update memento with:
   - Work completed
   - Problems encountered
   - Solutions implemented
   - Next steps needed
6. COMPLETE: When task is done
   - Create PR to development branch
   - Document completion in memento
   - Report status back

CODE QUALITY STANDARDS:
- Files MUST be under 200 lines (150 ideal)
- Follow DRY principles - use shared packages
- Maintain 60fps performance standards
- Use proper error handling and logging

REPORTING:
Provide status updates including:
- Current progress percentage
- What you're working on
- Any blockers or issues
- Expected completion time

If you encounter issues, document them in memento and report immediately."

# Generate timestamp for log file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/${WORKTREE_NAME}_${TIMESTAMP}.log"

# Add log header with session information
echo "========================================"  > "$LOG_FILE"
echo "Agent Spawn Session Log" >> "$LOG_FILE"
echo "========================================"  >> "$LOG_FILE"
echo "Date: $(date)" >> "$LOG_FILE"
echo "Agent: ${AGENT_NAME}" >> "$LOG_FILE"
echo "Worktree: ${WORKTREE_NAME}" >> "$LOG_FILE"
echo "Working Directory: ${WORKTREE_PATH}" >> "$LOG_FILE"
echo "Task: ${PROMPT}" >> "$LOG_FILE"
echo "========================================"  >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Spawn claude in detached mode with all tools enabled
echo "Spawning agent with full tool access..." >> "$LOG_FILE"
echo "Command: claude --permission-mode bypassPermissions" >> "$LOG_FILE"
echo "Working directory: $WORKTREE_PATH" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

cd "$WORKTREE_PATH"
# Use bypassPermissions to ensure all tools are available including Task
nohup claude --permission-mode bypassPermissions -p "$FULL_PROMPT" >> "$LOG_FILE" 2>&1 &
PID=$!

# Wait a moment to ensure process started
sleep 2

# Verify the process started successfully
if ps -p $PID > /dev/null 2>&1; then
  echo "Agent started successfully (PID: $PID)" >> "$LOG_FILE"
  echo "" >> "$LOG_FILE"
  echo "=== AGENT OUTPUT BEGINS ===" >> "$LOG_FILE"
  echo "" >> "$LOG_FILE"
else
  echo "ERROR: Agent failed to start!" >> "$LOG_FILE"
  echo "Check for errors above." >> "$LOG_FILE"
  exit 1
fi

# Create a PID file for tracking
echo "$PID" > "${LOG_DIR}/${WORKTREE_NAME}.pid"

echo "========================================"
echo "Successfully spawned agent!"
echo "========================================"
echo "Agent: ${AGENT_NAME}"
echo "Worktree: ${WORKTREE_NAME}"
echo "Branch: worktree/${WORKTREE_NAME}"
echo "PID: ${PID}"
echo "Log: ${LOG_FILE}"
echo "Task: ${PROMPT}"
echo "========================================"
echo ""
echo "COMMANDS:"
echo "  Monitor output:  tail -f ${LOG_FILE}"
echo "  Check status:    ps -p ${PID}"
echo "  Kill agent:      kill ${PID}"
echo "  Kill all agents: ${REPO_PATH}/scripts/kill-all-agents.sh"
echo ""
echo "The agent is now working autonomously in the background."
echo "Check the log file for progress updates."