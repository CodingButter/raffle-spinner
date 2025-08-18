#!/bin/bash
# verify-worktree-status.sh
# Verification script to check worktree health status

set -e

echo "📊 Worktree Status Report"
echo "========================="
echo ""

# Navigate to project directory
cd "$(dirname "$0")/../project" 2>/dev/null || cd "$(dirname "$0")/.."

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "Generated: $TIMESTAMP"
echo ""

# System overview
echo "📈 System Overview"
echo "-----------------"

# Count worktrees
TOTAL_WORKTREES=$(git worktree list | wc -l)
ACTIVE_WORKTREES=$((TOTAL_WORKTREES - 1))  # Subtract 1 for main
echo "  • Total worktrees: $TOTAL_WORKTREES (including main)"
echo "  • Active worktrees: $ACTIVE_WORKTREES"
echo ""

# List all worktrees with details
echo "📁 Active Worktrees"
echo "-------------------"

if [ $ACTIVE_WORKTREES -eq 0 ]; then
  echo "  ✅ No active worktrees (clean state)"
else
  git worktree list | while IFS= read -r line; do
    if [[ ! "$line" =~ /project ]]; then
      # Extract path and branch
      PATH_PART=$(echo "$line" | awk '{print $1}')
      BRANCH_PART=$(echo "$line" | grep -o '\[.*\]' | tr -d '[]')
      COMMIT_PART=$(echo "$line" | awk '{print $2}')
      
      # Get just the directory name
      DIR_NAME=$(basename "$PATH_PART")
      
      echo "  📍 $DIR_NAME"
      echo "     • Branch: $BRANCH_PART"
      echo "     • Commit: $COMMIT_PART"
      echo "     • Path: $PATH_PART"
      
      # Check age of worktree
      if [ -d "$PATH_PART" ]; then
        AGE_DAYS=$(find "$PATH_PART" -maxdepth 0 -type d -printf '%T@\n' | awk '{print int((systime()-$1)/86400)}')
        if [ $AGE_DAYS -gt 1 ]; then
          echo "     ⚠️  Age: $AGE_DAYS days (STALE - should be removed)"
        else
          echo "     • Age: $AGE_DAYS days"
        fi
      fi
      echo ""
    fi
  done
fi

# Check for uncommitted changes
echo "🔍 Uncommitted Changes Check"
echo "----------------------------"

UNCOMMITTED_COUNT=0
git worktree list --porcelain | while read -r line; do
  if [[ $line == worktree* ]] && [[ $line != *project ]]; then
    path=${line#worktree }
    
    if [ -d "$path" ]; then
      cd "$path" 2>/dev/null && {
        if ! git diff --quiet || ! git diff --cached --quiet; then
          echo "  ⚠️  $(basename "$path"): Has uncommitted changes"
          ((UNCOMMITTED_COUNT++))
        fi
      }
    fi
  fi
done

if [ $UNCOMMITTED_COUNT -eq 0 ]; then
  echo "  ✅ All worktrees have clean working directories"
fi
echo ""

# Check orphaned directories
echo "🗂️  Orphaned Directory Check"
echo "----------------------------"

WORKTREE_DIR="../worktrees"
ORPHANED_COUNT=0

if [ -d "$WORKTREE_DIR" ]; then
  for dir in "$WORKTREE_DIR"/*; do
    if [ -d "$dir" ]; then
      DIR_NAME=$(basename "$dir")
      
      # Skip our current cleanup worktree
      if [[ "$DIR_NAME" == "david-worktree-cleanup-protocol" ]]; then
        continue
      fi
      
      if ! git worktree list | grep -q "$dir"; then
        echo "  ❌ Orphaned: $DIR_NAME"
        ((ORPHANED_COUNT++))
      fi
    fi
  done
  
  if [ $ORPHANED_COUNT -eq 0 ]; then
    echo "  ✅ No orphaned directories found"
  else
    echo "  ⚠️  Found $ORPHANED_COUNT orphaned director(ies)"
  fi
else
  echo "  ⚠️  Worktrees directory not found"
fi
echo ""

# Check for stale branches
echo "🌿 Branch Status"
echo "----------------"

STALE_BRANCH_COUNT=0
for branch in $(git branch --format='%(refname:short)' | grep -E '^(david|emily|michael|sarah|robert)/'); do
  if ! git worktree list | grep -q "\[$branch\]"; then
    echo "  ⚠️  Stale branch: $branch (no active worktree)"
    ((STALE_BRANCH_COUNT++))
  fi
done

if [ $STALE_BRANCH_COUNT -eq 0 ]; then
  echo "  ✅ All local branches have active worktrees"
else
  echo "  Found $STALE_BRANCH_COUNT stale branch(es)"
fi
echo ""

# Health score calculation
echo "🏥 Repository Health Score"
echo "--------------------------"

HEALTH_SCORE=100
ISSUES=""

# Deduct points for issues
if [ $ACTIVE_WORKTREES -gt 5 ]; then
  HEALTH_SCORE=$((HEALTH_SCORE - 20))
  ISSUES="$ISSUES\n  • Too many active worktrees (-20 points)"
fi

if [ $ORPHANED_COUNT -gt 0 ]; then
  HEALTH_SCORE=$((HEALTH_SCORE - 15 * ORPHANED_COUNT))
  ISSUES="$ISSUES\n  • Orphaned directories found (-$((15 * ORPHANED_COUNT)) points)"
fi

if [ $STALE_BRANCH_COUNT -gt 0 ]; then
  HEALTH_SCORE=$((HEALTH_SCORE - 10 * STALE_BRANCH_COUNT))
  ISSUES="$ISSUES\n  • Stale branches found (-$((10 * STALE_BRANCH_COUNT)) points)"
fi

if [ $UNCOMMITTED_COUNT -gt 0 ]; then
  HEALTH_SCORE=$((HEALTH_SCORE - 5 * UNCOMMITTED_COUNT))
  ISSUES="$ISSUES\n  • Uncommitted changes found (-$((5 * UNCOMMITTED_COUNT)) points)"
fi

# Ensure score doesn't go below 0
if [ $HEALTH_SCORE -lt 0 ]; then
  HEALTH_SCORE=0
fi

# Display health score with appropriate emoji
if [ $HEALTH_SCORE -ge 90 ]; then
  echo "  Score: $HEALTH_SCORE/100 🟢 Excellent"
elif [ $HEALTH_SCORE -ge 70 ]; then
  echo "  Score: $HEALTH_SCORE/100 🟡 Good"
elif [ $HEALTH_SCORE -ge 50 ]; then
  echo "  Score: $HEALTH_SCORE/100 🟠 Fair"
else
  echo "  Score: $HEALTH_SCORE/100 🔴 Poor"
fi

if [ -n "$ISSUES" ]; then
  echo ""
  echo "  Issues found:"
  echo -e "$ISSUES"
fi
echo ""

# Recommendations
echo "💡 Recommendations"
echo "------------------"

if [ $HEALTH_SCORE -eq 100 ]; then
  echo "  ✅ Repository is in perfect health!"
else
  if [ $ORPHANED_COUNT -gt 0 ]; then
    echo "  • Run cleanup script: ./scripts/cleanup-stale-worktrees.sh"
  fi
  if [ $STALE_BRANCH_COUNT -gt 0 ]; then
    echo "  • Remove stale branches with: git branch -D [branch-name]"
  fi
  if [ $ACTIVE_WORKTREES -gt 5 ]; then
    echo "  • Review and remove completed worktrees"
  fi
  if [ $UNCOMMITTED_COUNT -gt 0 ]; then
    echo "  • Commit or stash changes in worktrees with uncommitted work"
  fi
fi
echo ""

echo "✅ Status report complete"