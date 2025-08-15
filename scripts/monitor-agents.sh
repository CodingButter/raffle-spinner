#!/bin/bash
# Monitor all agent activity across worktrees

LOG_DIR="/home/codingbutter/GitHub/raffle-spinner/agent_logs"
WORKTREE_BASE="/home/codingbutter/GitHub/raffle-worktrees"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "DrawDay Agent Monitoring Dashboard"
echo "========================================"
echo "$(date)"
echo ""

# Check main coordinator status
MAIN_PID=$(ps aux | grep "claude --continue" | grep -v grep | awk '{print $2}')
if [ -n "$MAIN_PID" ]; then
  echo -e "${GREEN}Main Coordinator: ACTIVE${NC} (PID: $MAIN_PID)"
else
  echo -e "${RED}Main Coordinator: NOT RUNNING${NC}"
fi
echo ""

# Function to check agent status
check_agent() {
  local worktree=$1
  local worktree_path="${WORKTREE_BASE}/${worktree}"
  local pid_file="${LOG_DIR}/${worktree}.pid"
  
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}Agent: ${worktree}${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # Check if agent is running
  if [ -f "$pid_file" ]; then
    PID=$(cat "$pid_file")
    if ps -p $PID > /dev/null 2>&1; then
      echo -e "Status: ${GREEN}RUNNING${NC} (PID: $PID)"
      
      # Get latest log file for this agent
      latest_log=$(ls -t ${LOG_DIR}/${worktree}_*.log 2>/dev/null | head -1)
      if [ -n "$latest_log" ]; then
        echo "Log file: $(basename $latest_log)"
        echo "Latest activity (last 5 lines):"
        tail -5 "$latest_log" | sed 's/^/  /'
        
        # Count total lines in log
        line_count=$(wc -l < "$latest_log")
        echo "  (Total log lines: $line_count)"
      fi
    else
      echo -e "Status: ${RED}STOPPED${NC} (PID file exists but process not running)"
    fi
  else
    echo -e "Status: ${RED}NOT SPAWNED${NC}"
  fi
  
  # Check git status in worktree
  if [ -d "$worktree_path" ]; then
    cd "$worktree_path"
    
    # Recent commits
    recent_commits=$(git log --oneline -n 3 --since="24 hours ago" 2>/dev/null)
    if [ -n "$recent_commits" ]; then
      echo -e "\n${GREEN}Recent commits (last 24h):${NC}"
      echo "$recent_commits" | sed 's/^/  /'
    fi
    
    # Modified files
    modified=$(git status --short 2>/dev/null)
    if [ -n "$modified" ]; then
      echo -e "\n${YELLOW}Modified files:${NC}"
      echo "$modified" | head -10 | sed 's/^/  /'
      file_count=$(echo "$modified" | wc -l)
      if [ $file_count -gt 10 ]; then
        echo "  ... and $((file_count - 10)) more files"
      fi
    fi
    
    # Current branch
    branch=$(git branch --show-current 2>/dev/null)
    echo -e "Branch: ${BLUE}${branch}${NC}"
  fi
  
  echo ""
}

# Check all worktrees
for worktree_dir in ${WORKTREE_BASE}/*; do
  if [ -d "$worktree_dir" ]; then
    worktree=$(basename "$worktree_dir")
    check_agent "$worktree"
  fi
done

# Summary statistics
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Count running agents
running_count=0
for pid_file in ${LOG_DIR}/*.pid; do
  if [ -f "$pid_file" ]; then
    PID=$(cat "$pid_file")
    if ps -p $PID > /dev/null 2>&1; then
      ((running_count++))
    fi
  fi
done

total_worktrees=$(ls -1 ${WORKTREE_BASE} | wc -l)
echo -e "Running agents: ${GREEN}${running_count}${NC} / ${total_worktrees}"

# Check for recent activity
recent_logs=$(find ${LOG_DIR} -name "*.log" -mmin -60 2>/dev/null | wc -l)
echo -e "Active in last hour: ${YELLOW}${recent_logs}${NC}"

# Memory usage
if command -v claude &> /dev/null; then
  claude_pids=$(pgrep -f "claude.*raffle-worktrees")
  if [ -n "$claude_pids" ]; then
    echo -e "\n${YELLOW}Resource Usage:${NC}"
    for pid in $claude_pids; do
      if [ -d "/proc/$pid" ]; then
        cmd=$(ps -p $pid -o comm= 2>/dev/null)
        mem=$(ps -p $pid -o rss= 2>/dev/null)
        if [ -n "$mem" ]; then
          mem_mb=$((mem / 1024))
          echo "  PID $pid: ${mem_mb}MB"
        fi
      fi
    done
  fi
fi

echo ""
echo "Refresh: watch -n 10 $0"
echo "View specific logs: tail -f ${LOG_DIR}/<worktree-name>_*.log"
echo "View latest logs: ls -lt ${LOG_DIR}/*.log | head -10"
echo "Logs directory: ${LOG_DIR}"

# Show available log files if any exist
if ls ${LOG_DIR}/*.log > /dev/null 2>&1; then
  echo ""
  echo -e "${YELLOW}Recent log files:${NC}"
  ls -lt ${LOG_DIR}/*.log | head -5 | awk '{print "  " $9 " (" $6 " " $7 " " $8 ")"}'
fi