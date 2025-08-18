#!/bin/bash

# DrawDay Memento MCP Startup Script
# This script starts the Neo4j database for the shared memory system

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "================================================"
echo "DrawDay Memento MCP - Shared Memory System"
echo "================================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and update with your configuration."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "Starting Neo4j database..."
echo "  - URI: bolt://localhost:7687"
echo "  - Username: neo4j"
echo "  - Team: $TEAM_NAME"
echo ""

# Start Neo4j with Docker Compose
docker compose up -d

# Wait for Neo4j to be ready
echo "Waiting for Neo4j to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker compose exec -T neo4j cypher-shell -u neo4j -p "$NEO4J_PASSWORD" "RETURN 1" >/dev/null 2>&1; then
        echo "✓ Neo4j is ready!"
        break
    fi
    echo -n "."
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo ""
    echo "Error: Neo4j failed to start within 60 seconds"
    exit 1
fi

echo ""
echo "================================================"
echo "Memento MCP is ready for use!"
echo "================================================"
echo ""
echo "Neo4j Browser: http://localhost:7474"
echo "Bolt URL: bolt://localhost:7687"
echo ""
echo "The shared memory system is now available for all DrawDay agents."
echo ""
echo "To stop the system, run: ./stop-memento.sh"
echo "To view logs, run: ./logs-memento.sh"
echo "To backup data, run: ./backup-memento.sh"