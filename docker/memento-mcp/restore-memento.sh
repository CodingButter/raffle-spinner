#!/bin/bash

# DrawDay Memento MCP Restore Script

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

if [ $# -eq 0 ]; then
    echo "Usage: ./restore-memento.sh <backup-file.tar.gz>"
    echo ""
    echo "Available backups:"
    ls -la ./backups/*.tar.gz 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "DrawDay Memento MCP Restore"
echo "============================"
echo ""
echo "Backup file: $BACKUP_FILE"
echo ""
echo "WARNING: This will replace all current memory data!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Stop Neo4j
echo "Stopping Neo4j..."
docker compose down

# Create restore directory
RESTORE_DIR="./restore-temp"
rm -rf "$RESTORE_DIR"
mkdir -p "$RESTORE_DIR"

# Extract backup
echo "Extracting backup..."
tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"

# Find the backup directory (it will have a timestamp name)
BACKUP_DATA_DIR=$(find "$RESTORE_DIR" -name "neo4j-data" -type d | head -n 1 | xargs dirname)

if [ -z "$BACKUP_DATA_DIR" ]; then
    echo "Error: Could not find neo4j-data in backup"
    rm -rf "$RESTORE_DIR"
    exit 1
fi

# Backup current data (just in case)
echo "Backing up current data..."
if [ -d "./neo4j-data" ]; then
    mv ./neo4j-data "./neo4j-data.backup.$(date +%Y%m%d_%H%M%S)"
fi
if [ -d "./neo4j-logs" ]; then
    mv ./neo4j-logs "./neo4j-logs.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Restore data
echo "Restoring data..."
cp -r "$BACKUP_DATA_DIR/neo4j-data" ./neo4j-data
cp -r "$BACKUP_DATA_DIR/neo4j-logs" ./neo4j-logs

# Clean up
rm -rf "$RESTORE_DIR"

# Restart Neo4j
echo "Starting Neo4j with restored data..."
docker compose up -d

# Wait for Neo4j to be ready
echo "Waiting for Neo4j to start..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker compose exec -T neo4j cypher-shell -u neo4j -p "DrawDay_Memory_2025!" "RETURN 1" >/dev/null 2>&1; then
        echo "✓ Neo4j is ready with restored data!"
        break
    fi
    echo -n "."
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo ""
    echo "Warning: Neo4j may still be starting. Check logs with ./logs-memento.sh"
fi

echo ""
echo "✓ Restore completed successfully!"
echo ""
echo "The shared memory system has been restored from backup."