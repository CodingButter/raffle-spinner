#!/bin/bash

packages=(
  "packages/@drawday/hooks"
  "packages/@drawday/utils"
  "packages/@drawday/types"
  "packages/spinners"
  "packages/@raffle-spinner/subscription"
  "packages/contexts"
)

for pkg in "${packages[@]}"; do
  if [ -f "$pkg/package.json" ]; then
    echo "Adding lint script to $pkg"
    # Add lint script after the last script entry
    jq '.scripts.lint = "eslint . --ext .ts,.tsx"' "$pkg/package.json" > "$pkg/package.json.tmp" && \
    mv "$pkg/package.json.tmp" "$pkg/package.json"
  fi
done
