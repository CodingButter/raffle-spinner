#!/bin/bash

# DrawDay Memento MCP Logs Script

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "DrawDay Memento MCP Logs"
echo "========================"
echo ""
echo "Press Ctrl+C to exit"
echo ""

docker compose logs -f neo4j