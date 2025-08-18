#!/bin/bash

# DrawDay Memento MCP Stop Script

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Stopping DrawDay Memento MCP services..."

docker compose down

echo "✓ Memento MCP services stopped successfully"
echo ""
echo "Note: Data is preserved in the ./neo4j-data directory"