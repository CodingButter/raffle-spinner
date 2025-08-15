#!/bin/bash
# Verify the agent spawning and management system is working correctly

echo "========================================"
echo "Agent System Verification"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check main coordinator
echo "1. Checking main coordinator..."
MAIN_PID=$(ps aux | grep "claude --continue" | grep -v grep | awk '{print $2}')
if [ -n "$MAIN_PID" ]; then
  echo -e "   ${GREEN}✓ Main coordinator running (PID: $MAIN_PID)${NC}"
else
  echo -e "   ${YELLOW}⚠ Main coordinator not detected${NC}"
  echo "   This is normal if you're not running as the main agent"
fi
echo ""

# Check directories
echo "2. Checking directories..."
WORKTREE_BASE="/home/codingbutter/GitHub/raffle-worktrees"
LOG_DIR="/home/codingbutter/GitHub/raffle-spinner/agent_logs"

if [ -d "$WORKTREE_BASE" ]; then
  worktree_count=$(ls -1 $WORKTREE_BASE | wc -l)
  echo -e "   ${GREEN}✓ Worktree directory exists ($worktree_count worktrees)${NC}"
else
  echo -e "   ${RED}✗ Worktree directory missing: $WORKTREE_BASE${NC}"
fi

if [ -d "$LOG_DIR" ]; then
  echo -e "   ${GREEN}✓ Log directory exists${NC}"
else
  echo -e "   ${YELLOW}⚠ Log directory missing (will be created on first spawn)${NC}"
fi
echo ""

# Check scripts
echo "3. Checking scripts..."
SCRIPT_DIR="/home/codingbutter/GitHub/raffle-spinner/scripts"
scripts=("spawn-agent.sh" "kill-all-agents.sh" "monitor-agents.sh" "spawn-all-agents.sh")

all_good=true
for script in "${scripts[@]}"; do
  if [ -f "$SCRIPT_DIR/$script" ]; then
    if [ -x "$SCRIPT_DIR/$script" ]; then
      echo -e "   ${GREEN}✓ $script (executable)${NC}"
    else
      echo -e "   ${YELLOW}⚠ $script (not executable)${NC}"
      all_good=false
    fi
  else
    echo -e "   ${RED}✗ $script (missing)${NC}"
    all_good=false
  fi
done
echo ""

# Check for running spawned agents
echo "4. Checking spawned agents..."
spawned_count=0
if [ -d "$LOG_DIR" ]; then
  for pid_file in ${LOG_DIR}/*.pid; do
    if [ -f "$pid_file" ]; then
      PID=$(cat "$pid_file")
      agent_name=$(basename "$pid_file" .pid)
      if ps -p $PID > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓ $agent_name running (PID: $PID)${NC}"
        ((spawned_count++))
      else
        echo -e "   ${YELLOW}⚠ $agent_name has stale PID file${NC}"
      fi
    fi
  done
fi

if [ $spawned_count -eq 0 ]; then
  echo -e "   ${YELLOW}No spawned agents currently running${NC}"
fi
echo ""

# Test spawn protection
echo "5. Testing main agent protection..."
if [ -n "$MAIN_PID" ]; then
  # Simulate what kill-all-agents would do
  would_protect=$(grep -q "MAIN_PID" "$SCRIPT_DIR/kill-all-agents.sh" && echo "yes" || echo "no")
  if [ "$would_protect" = "yes" ]; then
    echo -e "   ${GREEN}✓ Kill script has main agent protection${NC}"
  else
    echo -e "   ${RED}✗ Kill script missing main agent protection${NC}"
  fi
else
  echo -e "   ${YELLOW}Skip (no main agent to protect)${NC}"
fi
echo ""

# Summary
echo "========================================"
echo "Summary"
echo "========================================"
if [ "$all_good" = true ] && [ -d "$WORKTREE_BASE" ]; then
  echo -e "${GREEN}System is ready for agent spawning!${NC}"
  echo ""
  echo "Quick commands:"
  echo "  Spawn agent:    $SCRIPT_DIR/spawn-agent.sh <worktree> <agent> \"<task>\""
  echo "  Monitor agents: $SCRIPT_DIR/monitor-agents.sh"
  echo "  Kill spawned:   $SCRIPT_DIR/kill-all-agents.sh"
  echo "  View logs:      ls -lt $LOG_DIR/*.log"
else
  echo -e "${YELLOW}Some issues detected. Review above.${NC}"
fi
echo ""

# Show example spawn command
echo "Example spawn command:"
echo '  ./scripts/spawn-agent.sh frontend-expert frontend-expert "Fix button styling"'
echo ""