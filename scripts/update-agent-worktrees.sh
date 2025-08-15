#!/bin/bash

# Script to update agent files with worktree information

update_agent_file() {
  local agent=$1
  local file=".claude/agents/${agent}.md"
  local worktree_path="/home/codingbutter/GitHub/raffle-spinner-${agent}"
  local branch="worktree/${agent}"
  
  echo "Updating ${agent}..."
  
  # Check if file exists
  if [ ! -f "${file}" ]; then
    echo "  ✗ File not found: ${file}"
    return 1
  fi
  
  # Check if worktree metadata already exists
  if grep -q "worktree_path:" "${file}"; then
    echo "  ✓ Already has worktree metadata"
    return 0
  fi
  
  # Create a temporary file with the updated content
  tmpfile=$(mktemp)
  
  # Process the file to add worktree metadata
  awk -v path="${worktree_path}" -v branch="${branch}" '
  BEGIN { metadata_added = 0; instruction_added = 0 }
  
  # Add worktree metadata after color line
  /^color:/ && !metadata_added {
    print $0
    print "worktree_path: " path
    print "worktree_branch: " branch
    metadata_added = 1
    next
  }
  
  # Add worktree instructions after "You are" paragraph
  /^You are/ {
    in_intro = 1
  }
  
  in_intro && /^$/ && !instruction_added {
    print $0
    print "## CRITICAL: Git Worktree Usage (MANDATORY)"
    print ""
    print "**YOU MUST ALWAYS WORK IN YOUR ASSIGNED WORKTREE**"
    print "- Worktree Path: `" path "`"
    print "- Branch: `" branch "`"
    print "- **NEVER work in the main repository directory**"
    print "- **ALWAYS navigate to your worktree before making any changes**"
    print "- Start every work session with: `cd " path "`"
    print ""
    instruction_added = 1
    in_intro = 0
    next
  }
  
  # Print all other lines
  { print $0 }
  ' "${file}" > "${tmpfile}"
  
  # Replace the original file
  mv "${tmpfile}" "${file}"
  echo "  ✓ Updated ${agent}"
}

# Update all agent files
AGENTS=(
  "chrome-extension-specialist"
  "performance-engineering-specialist"
  "code-quality-refactoring-specialist"
  "monorepo-architecture-specialist"
  "data-processing-csv-expert"
  "project-manager"
  "lead-developer-architect"
)

echo "Updating agent files with worktree information..."
echo ""

for agent in "${AGENTS[@]}"; do
  update_agent_file "${agent}"
done

echo ""
echo "All agent files have been updated!"