#!/bin/bash
# Spawn all agents with their current tasks from PROJECT_SCOPE.md
# This script spawns multiple Claude Code instances in parallel

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_PATH="/home/codingbutter/GitHub/raffle-spinner"
LOG_DIR="${REPO_PATH}/agent_logs"
BATCH_ID=$(date +%Y%m%d_%H%M%S)

# Create batch session log
BATCH_LOG="${LOG_DIR}/batch_spawn_${BATCH_ID}.log"

echo "========================================"  | tee "$BATCH_LOG"
echo "DrawDay Multi-Agent Spawner"              | tee -a "$BATCH_LOG"
echo "========================================"  | tee -a "$BATCH_LOG"
echo "Batch Session ID: ${BATCH_ID}"           | tee -a "$BATCH_LOG"
echo "Date: $(date)"                           | tee -a "$BATCH_LOG"
echo "Log Directory: ${LOG_DIR}"               | tee -a "$BATCH_LOG"
echo "========================================"  | tee -a "$BATCH_LOG"
echo ""                                         | tee -a "$BATCH_LOG"

# Function to spawn agent and wait briefly
spawn_agent() {
  local worktree=$1
  local agent=$2
  local task=$3
  
  echo "Spawning: $agent" | tee -a "$BATCH_LOG"
  echo "Task: $task" | tee -a "$BATCH_LOG"
  "$SCRIPT_DIR/spawn-agent.sh" "$worktree" "$agent" "$task"
  echo "Agent $agent spawned in worktree $worktree" >> "$BATCH_LOG"
  echo "" | tee -a "$BATCH_LOG"
  sleep 2  # Brief pause between spawns to avoid resource conflicts
}

# Critical refactoring tasks (HIGH PRIORITY)
spawn_agent "code-quality-refactoring-specialist" "code-quality-refactoring-specialist" \
  "Refactor SlotMachineWheel.tsx (579 lines) into multiple components under 200 lines each. Break into: WheelCanvas, WheelAnimator, SegmentRenderer, and WinnerCalculator components."

spawn_agent "code-quality-refactoring-specialist" "code-quality-refactoring-specialist" \
  "Refactor dashboard/page.tsx (344 lines) into smaller components. Extract: StatsCards, RecentActivity, SubscriptionStatus, and QuickActions components."

# Frontend fixes
spawn_agent "frontend-expert" "frontend-expert" \
  "Fix all button padding inconsistencies in the website app. Ensure consistent spacing using the design system tokens."

spawn_agent "frontend-expert" "frontend-expert" \
  "Fix mobile responsive issues on the landing page. Test on various screen sizes and ensure proper breakpoints."

# Stripe and subscription work
spawn_agent "stripe-subscription-expert" "stripe-subscription-expert" \
  "Debug webhook integration. Ensure database updates work correctly and handle all webhook event types properly."

spawn_agent "stripe-subscription-expert" "stripe-subscription-expert" \
  "Implement subscription upgrade/downgrade flow with proper proration handling."

# Performance optimization
spawn_agent "performance-engineering-specialist" "performance-engineering-specialist" \
  "Optimize SlotMachine animation performance for 5000+ participants. Target consistent 60fps."

spawn_agent "performance-engineering-specialist" "performance-engineering-specialist" \
  "Implement code splitting for the website app to improve initial load time to under 2 seconds."

# Chrome extension improvements
spawn_agent "chrome-extension-specialist" "chrome-extension-specialist" \
  "Add keyboard shortcuts for quick actions in the spinner extension side panel."

spawn_agent "chrome-extension-specialist" "chrome-extension-specialist" \
  "Implement session persistence so spinner state survives page refreshes."

# Data processing
spawn_agent "data-processing-csv-expert" "data-processing-csv-expert" \
  "Improve CSV column mapping intelligence. Add fuzzy matching for common header variations."

# Monorepo management
spawn_agent "monorepo-architecture-specialist" "monorepo-architecture-specialist" \
  "Optimize build times by implementing proper caching strategies and parallel builds."

# Architecture and planning
spawn_agent "lead-developer-architect" "lead-developer-architect" \
  "Review and approve all PRs from specialist worktrees. Ensure code quality standards are met."

spawn_agent "project-manager" "project-manager" \
  "Update PROJECT_SCOPE.md with progress from all agents. Coordinate sprint planning for next iteration."

echo "========================================"  | tee -a "$BATCH_LOG"
echo "All agents spawned successfully!"          | tee -a "$BATCH_LOG"
echo "========================================"  | tee -a "$BATCH_LOG"
echo ""                                          | tee -a "$BATCH_LOG"
echo "Monitor all agents with: $SCRIPT_DIR/monitor-agents.sh"  | tee -a "$BATCH_LOG"
echo "View logs in: ${LOG_DIR}/"                | tee -a "$BATCH_LOG"
echo "Batch log: ${BATCH_LOG}"                  | tee -a "$BATCH_LOG"
echo "Kill all agents with: $SCRIPT_DIR/kill-all-agents.sh"   | tee -a "$BATCH_LOG"