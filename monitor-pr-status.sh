#!/bin/bash

# Monitor PR conflict resolution status
# Run this script to check the current state of both PRs

echo "========================================="
echo "PR CONFLICT RESOLUTION STATUS MONITOR"
echo "========================================="
echo ""

# Check PR #34 status
echo "PR #34 - Code Quality Refactoring"
echo "---------------------------------"
gh pr view 34 --json state,mergeable,mergeStateStatus,statusCheckRollup | \
  python3 -c "import sys, json; data = json.load(sys.stdin); print(f'State: {data[\"state\"]}'); print(f'Mergeable: {data[\"mergeable\"]}'); print(f'Merge State: {data[\"mergeStateStatus\"]}')"

echo ""
echo "Latest activity on PR #34:"
gh pr view 34 --json comments | \
  python3 -c "import sys, json; data = json.load(sys.stdin); comments = data.get('comments', []); print(comments[-1]['body'] if comments else 'No comments yet')"

echo ""
echo "========================================="
echo ""

# Check PR #35 status
echo "PR #35 - Subscription Analytics"
echo "--------------------------------"
gh pr view 35 --json state,mergeable,mergeStateStatus,statusCheckRollup | \
  python3 -c "import sys, json; data = json.load(sys.stdin); print(f'State: {data[\"state\"]}'); print(f'Mergeable: {data[\"mergeable\"]}'); print(f'Merge State: {data[\"mergeStateStatus\"]}')"

echo ""
echo "Latest activity on PR #35:"
gh pr view 35 --json comments | \
  python3 -c "import sys, json; data = json.load(sys.stdin); comments = data.get('comments', []); print(comments[-1]['body'] if comments else 'No comments yet')"

echo ""
echo "========================================="
echo ""

# Summary
echo "RESOLUTION STATUS SUMMARY"
echo "-------------------------"

PR34_MERGEABLE=$(gh pr view 34 --json mergeable -q .mergeable)
PR35_MERGEABLE=$(gh pr view 35 --json mergeable -q .mergeable)

if [ "$PR34_MERGEABLE" = "MERGEABLE" ] && [ "$PR35_MERGEABLE" = "MERGEABLE" ]; then
    echo "✅ BOTH PRs are ready to merge!"
    echo ""
    echo "Recommended merge order:"
    echo "1. Merge PR #34 first (refactoring)"
    echo "2. Then merge PR #35 (new feature)"
elif [ "$PR34_MERGEABLE" = "MERGEABLE" ]; then
    echo "✅ PR #34 is ready to merge"
    echo "⏳ PR #35 still has conflicts"
elif [ "$PR35_MERGEABLE" = "MERGEABLE" ]; then
    echo "✅ PR #35 is ready to merge"
    echo "⏳ PR #34 still has conflicts"
else
    echo "⏳ Both PRs still have conflicts"
    echo ""
    echo "Specialists should be working on:"
    echo "- stripe-subscription-expert: Resolving PR #35"
    echo "- code-quality-refactoring-specialist: Resolving PR #34"
fi

echo ""
echo "Last checked: $(date)"
echo "========================================="