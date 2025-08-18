#!/bin/bash
# cleanup-stale-worktrees.sh
# Automated cleanup script for stale git worktrees

set -e

echo "🧹 Starting worktree cleanup process..."
echo "======================================="

# Navigate to project directory
cd "$(dirname "$0")/../project" 2>/dev/null || cd "$(dirname "$0")/.."

# Get current timestamp for logging
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "Timestamp: $TIMESTAMP"
echo ""

# List current worktrees
echo "📊 Current worktrees:"
echo "--------------------"
git worktree list
echo ""

# Count worktrees (excluding main)
WORKTREE_COUNT=$(git worktree list | grep -v '/project' | wc -l)
echo "Active worktrees: $WORKTREE_COUNT"
echo ""

# Prune stale references
echo "🔧 Pruning stale worktree references..."
git worktree prune -v
echo ""

# Check for orphaned directories in ../worktrees
WORKTREE_DIR="../worktrees"
CLEANED_COUNT=0

if [ -d "$WORKTREE_DIR" ]; then
  echo "🔍 Checking for orphaned worktree directories..."
  echo "-------------------------------------------------"
  
  for dir in "$WORKTREE_DIR"/*; do
    if [ -d "$dir" ]; then
      DIR_NAME=$(basename "$dir")
      
      # Skip our current cleanup worktree
      if [[ "$DIR_NAME" == "david-worktree-cleanup-protocol" ]]; then
        continue
      fi
      
      # Check if directory is in git worktree list
      if ! git worktree list | grep -q "$dir"; then
        echo "  ❌ Found orphaned worktree: $DIR_NAME"
        echo "     Path: $dir"
        
        # Check age of directory (older than 24 hours)
        if [ "$(find "$dir" -maxdepth 0 -type d -mtime +1 2>/dev/null)" ]; then
          echo "     Status: Older than 24 hours - removing..."
          rm -rf "$dir"
          echo "     ✅ Removed: $dir"
          ((CLEANED_COUNT++))
        else
          echo "     Status: Less than 24 hours old - keeping for now"
        fi
        echo ""
      fi
    fi
  done
  
  if [ $CLEANED_COUNT -eq 0 ]; then
    echo "  ✅ No orphaned worktrees found"
  else
    echo "  🧹 Cleaned $CLEANED_COUNT orphaned worktree(s)"
  fi
else
  echo "⚠️  Worktrees directory not found at: $WORKTREE_DIR"
fi
echo ""

# Check for stale remote branches
echo "🌿 Checking for stale remote branches..."
echo "----------------------------------------"
git remote prune origin --dry-run
echo ""

# Check for local branches without worktrees
echo "🔍 Checking for local branches without active worktrees..."
echo "----------------------------------------------------------"
STALE_BRANCHES=()

for branch in $(git branch --format='%(refname:short)' | grep -E '^(david|emily|michael|sarah|robert)/'); do
  # Check if branch has an active worktree
  if ! git worktree list | grep -q "\[$branch\]"; then
    STALE_BRANCHES+=("$branch")
    echo "  ⚠️  Stale branch found: $branch"
  fi
done

if [ ${#STALE_BRANCHES[@]} -eq 0 ]; then
  echo "  ✅ No stale branches found"
else
  echo ""
  echo "  Found ${#STALE_BRANCHES[@]} stale branch(es)"
  echo "  To remove these branches, run:"
  for branch in "${STALE_BRANCHES[@]}"; do
    echo "    git branch -D $branch"
  done
fi
echo ""

# Check for uncommitted changes in remaining worktrees
echo "⚠️  Checking for uncommitted changes in active worktrees..."
echo "-----------------------------------------------------------"
UNCOMMITTED_FOUND=false

git worktree list --porcelain | while read -r line; do
  if [[ $line == worktree* ]] && [[ $line != *project ]]; then
    path=${line#worktree }
    
    if [ -d "$path" ]; then
      cd "$path" 2>/dev/null && {
        if ! git diff --quiet || ! git diff --cached --quiet; then
          echo "  ⚠️  Uncommitted changes in: $(basename "$path")"
          UNCOMMITTED_FOUND=true
        fi
      }
    fi
  fi
done

if [ "$UNCOMMITTED_FOUND" = false ]; then
  echo "  ✅ All worktrees have clean working directories"
fi
echo ""

# Final summary
echo "📋 Cleanup Summary"
echo "=================="
echo "  • Worktrees cleaned: $CLEANED_COUNT"
echo "  • Stale branches found: ${#STALE_BRANCHES[@]}"
echo "  • Active worktrees remaining: $(git worktree list | grep -v '/project' | wc -l)"
echo ""
echo "✅ Cleanup process complete!"
echo ""
echo "💡 Tip: Run this script daily to maintain a clean repository"