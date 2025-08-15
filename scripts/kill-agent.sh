#!/bin/bash
# Kill a specific Claude Code agent
# Usage: ./kill-agent.sh <worktree-name>

WORKTREE_NAME=$1
LOG_DIR="/home/codingbutter/GitHub/raffle-spinner/logs"

if [ -z "$WORKTREE_NAME" ]; then
  echo "Usage: ./kill-agent.sh <worktree-name>"
  echo "Available agents:"
  for pid_file in ${LOG_DIR}/*.pid; do
    if [ -f "$pid_file" ]; then
      agent=$(basename "$pid_file" .pid)
      echo "  - $agent"
    fi
  done
  exit 1
fi

PID_FILE="${LOG_DIR}/${WORKTREE_NAME}.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "Error: No PID file found for agent: $WORKTREE_NAME"
  echo "Agent may not be running or was not spawned using spawn-agent.sh"
  exit 1
fi

PID=$(cat "$PID_FILE")

if ps -p $PID > /dev/null 2>&1; then
  echo "Stopping $WORKTREE_NAME (PID: $PID)..."
  kill $PID 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "Agent stopped successfully"
    rm "$PID_FILE"
  else
    echo "Failed to stop agent"
    exit 1
  fi
else
  echo "Agent $WORKTREE_NAME is not running (stale PID file)"
  rm "$PID_FILE"
fi