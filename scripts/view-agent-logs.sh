#!/bin/bash
# View logs for specific agent or all agents
# Usage: ./view-agent-logs.sh [agent-name] [options]

AGENT_NAME=$1
LOGS_DIR="/home/codingbutter/GitHub/raffle-spinner/agent_logs"
OPTION=$2

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
  echo "Usage: $0 [agent-name] [options]"
  echo ""
  echo "Options:"
  echo "  [no args]         - List all recent logs"
  echo "  <agent-name>      - Show latest log for specific agent"
  echo "  <agent-name> -f   - Follow (tail -f) latest log for agent"
  echo "  <agent-name> -a   - Show all logs for agent"
  echo "  -b, --batch       - Show batch spawn logs only"
  echo "  -h, --help        - Show this help"
  echo ""
  echo "Examples:"
  echo "  $0                                    # List all logs"
  echo "  $0 frontend-expert                    # Show latest log for frontend-expert"
  echo "  $0 frontend-expert -f                 # Follow frontend-expert log"
  echo "  $0 -b                                 # Show batch spawn logs"
}

if [ "$AGENT_NAME" = "-h" ] || [ "$AGENT_NAME" = "--help" ]; then
  show_help
  exit 0
fi

# Check if logs directory exists
if [ ! -d "$LOGS_DIR" ]; then
  echo "Error: Logs directory not found: $LOGS_DIR"
  exit 1
fi

# Show batch spawn logs
if [ "$AGENT_NAME" = "-b" ] || [ "$AGENT_NAME" = "--batch" ]; then
  echo -e "${YELLOW}Batch spawn logs:${NC}"
  echo "========================================"
  
  batch_logs=$(ls -t "$LOGS_DIR"/batch_spawn_*.log 2>/dev/null)
  if [ -z "$batch_logs" ]; then
    echo "No batch spawn logs found."
    exit 0
  fi
  
  echo "$batch_logs" | head -5 | while read log_file; do
    if [ -f "$log_file" ]; then
      echo -e "\n${BLUE}$(basename "$log_file"):${NC}"
      head -20 "$log_file" | tail -15
    fi
  done
  exit 0
fi

# No agent name provided - show all recent logs
if [ -z "$AGENT_NAME" ]; then
  echo -e "${YELLOW}Recent agent logs:${NC}"
  echo "========================================"
  
  # List all log files sorted by modification time
  log_files=$(ls -t "$LOGS_DIR"/*.log 2>/dev/null | grep -v batch_spawn)
  if [ -z "$log_files" ]; then
    echo "No agent logs found."
    echo "Spawn agents first with: scripts/spawn-all-agents.sh"
    exit 0
  fi
  
  echo "$log_files" | head -10 | while read log_file; do
    if [ -f "$log_file" ]; then
      filename=$(basename "$log_file")
      file_size=$(wc -l < "$log_file" 2>/dev/null || echo "0")
      mod_time=$(stat -c %y "$log_file" 2>/dev/null | cut -d'.' -f1)
      
      echo -e "\n${GREEN}$filename${NC} (${file_size} lines, modified: $mod_time)"
      echo "Last activity:"
      tail -3 "$log_file" 2>/dev/null | sed 's/^/  /' || echo "  (Unable to read log)"
    fi
  done
  
  echo ""
  echo "View specific agent: $0 <agent-name>"
  echo "Follow specific agent: $0 <agent-name> -f"
  exit 0
fi

# Handle specific agent name
case "$OPTION" in
  "-f"|"--follow")
    # Follow the latest log for this agent
    latest_log=$(ls -t "$LOGS_DIR"/${AGENT_NAME}_*.log 2>/dev/null | head -1)
    if [ -z "$latest_log" ]; then
      echo "No logs found for agent: $AGENT_NAME"
      echo "Available agents:"
      ls "$LOGS_DIR"/*.log 2>/dev/null | sed 's/.*\/\([^_]*\)_.*/  \1/' | sort -u
      exit 1
    fi
    
    echo -e "${YELLOW}Following log for ${AGENT_NAME}:${NC}"
    echo "File: $(basename "$latest_log")"
    echo "========================================"
    tail -f "$latest_log"
    ;;
    
  "-a"|"--all")
    # Show all logs for this agent
    agent_logs=$(ls -t "$LOGS_DIR"/${AGENT_NAME}_*.log 2>/dev/null)
    if [ -z "$agent_logs" ]; then
      echo "No logs found for agent: $AGENT_NAME"
      exit 1
    fi
    
    echo -e "${YELLOW}All logs for ${AGENT_NAME}:${NC}"
    echo "========================================"
    
    echo "$agent_logs" | while read log_file; do
      if [ -f "$log_file" ]; then
        echo -e "\n${BLUE}$(basename "$log_file"):${NC}"
        echo "----------------------------------------"
        cat "$log_file"
        echo ""
      fi
    done
    ;;
    
  *)
    # Show latest log for this agent
    latest_log=$(ls -t "$LOGS_DIR"/${AGENT_NAME}_*.log 2>/dev/null | head -1)
    if [ -z "$latest_log" ]; then
      echo "No logs found for agent: $AGENT_NAME"
      echo ""
      echo "Available agents:"
      ls "$LOGS_DIR"/*.log 2>/dev/null | sed 's/.*\/\([^_]*\)_.*/  \1/' | sort -u
      exit 1
    fi
    
    echo -e "${YELLOW}Latest log for ${AGENT_NAME}:${NC}"
    echo "File: $(basename "$latest_log")"
    echo "Lines: $(wc -l < "$latest_log")"
    echo "========================================"
    cat "$latest_log"
    
    echo ""
    echo "Follow this log: $0 $AGENT_NAME -f"
    echo "View all logs: $0 $AGENT_NAME -a"
    ;;
esac