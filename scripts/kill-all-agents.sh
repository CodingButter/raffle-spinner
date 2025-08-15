#!/bin/bash
# Kill all SPAWNED Claude Code agents (preserves main coordinator)

LOG_DIR="/home/codingbutter/GitHub/raffle-spinner/agent_logs"
MAIN_REPO="/home/codingbutter/GitHub/raffle-spinner"

echo "========================================"
echo "Stopping All Spawned DrawDay Agents"
echo "   (Preserving Main Coordinator)"
echo "========================================"
echo ""

# Get main agent PID to protect it
MAIN_PID=$(ps aux | grep "claude --continue" | grep -v grep | awk '{print $2}')
if [ -n "$MAIN_PID" ]; then
  echo "Main coordinator detected (PID: $MAIN_PID) - will be preserved"
  echo ""
fi

killed_count=0
not_running_count=0
skipped_main=0

# Kill agents based on PID files (these are all spawned agents)
for pid_file in ${LOG_DIR}/*.pid; do
  if [ -f "$pid_file" ]; then
    agent_name=$(basename "$pid_file" .pid)
    PID=$(cat "$pid_file")
    
    # Double-check this isn't the main agent
    if [ "$PID" = "$MAIN_PID" ]; then
      echo "⚠️  Skipping $agent_name (PID: $PID) - This is the main coordinator!"
      ((skipped_main++))
      continue
    fi
    
    if ps -p $PID > /dev/null 2>&1; then
      echo "Stopping $agent_name (PID: $PID)..."
      kill $PID 2>/dev/null
      if [ $? -eq 0 ]; then
        echo "  ✓ Stopped successfully"
        ((killed_count++))
        rm "$pid_file"
      else
        echo "  ✗ Failed to stop"
      fi
    else
      echo "$agent_name not running (stale PID file)"
      rm "$pid_file"
      ((not_running_count++))
    fi
  fi
done

# Kill orphaned claude processes ONLY in worktrees (not main)
echo ""
echo "Checking for orphaned spawned agent processes..."

# Get all claude processes
all_claude_pids=$(pgrep -f "claude")

for pid in $all_claude_pids; do
  # Skip if it's the main agent
  if [ "$pid" = "$MAIN_PID" ]; then
    continue
  fi
  
  # Check if this process is running in a worktree
  process_info=$(ps -p $pid -o args= 2>/dev/null)
  if echo "$process_info" | grep -q "raffle-worktrees"; then
    echo "  Killing orphaned spawned agent (PID: $pid)"
    kill $pid 2>/dev/null
    ((killed_count++))
  elif echo "$process_info" | grep -q "claude.*bypassPermissions"; then
    # This catches spawned agents that might not show worktree in args
    echo "  Killing orphaned spawned agent (PID: $pid)"
    kill $pid 2>/dev/null
    ((killed_count++))
  fi
done

if [ $killed_count -eq 0 ] && [ $not_running_count -eq 0 ]; then
  echo "No orphaned spawned agents found."
fi

echo ""
echo "========================================"
echo "Summary:"
echo "  Spawned agents stopped: $killed_count"
echo "  Stale PID files cleaned: $not_running_count"
if [ $skipped_main -gt 0 ]; then
  echo "  Main coordinator preserved: ✓"
fi
echo "========================================"
echo ""
echo "Note: Main coordinator agent remains running."
echo "To stop the main agent, use Ctrl+C in its terminal."