#!/bin/bash

# DrawDay Memento MCP Backup Script

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Create backup directory with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$TIMESTAMP"

echo "DrawDay Memento MCP Backup"
echo "=========================="
echo ""
echo "Creating backup: $BACKUP_DIR"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Stop the database to ensure consistency
echo "Stopping Neo4j for consistent backup..."
docker compose stop neo4j

# Copy data directory
echo "Copying data files..."
cp -r ./neo4j-data "$BACKUP_DIR/neo4j-data"

# Copy logs
echo "Copying log files..."
cp -r ./neo4j-logs "$BACKUP_DIR/neo4j-logs"

# Create backup metadata
echo "Creating backup metadata..."
cat > "$BACKUP_DIR/backup-info.txt" << EOF
DrawDay Memento MCP Backup
==========================
Date: $(date)
Team: DrawDay Development Team
Neo4j Version: 5.26.0-community

Files included:
- neo4j-data/ (database files)
- neo4j-logs/ (log files)

To restore this backup:
1. Stop the current Neo4j instance
2. Replace ./neo4j-data with the backed up neo4j-data
3. Restart Neo4j
EOF

# Restart Neo4j
echo "Restarting Neo4j..."
docker compose start neo4j

# Wait for Neo4j to be ready
echo "Waiting for Neo4j to restart..."
sleep 5

# Compress backup
echo "Compressing backup..."
cd backups
tar -czf "memento-backup-$TIMESTAMP.tar.gz" "$TIMESTAMP"
rm -rf "$TIMESTAMP"
cd ..

echo ""
echo "✓ Backup completed successfully!"
echo "  Location: ./backups/memento-backup-$TIMESTAMP.tar.gz"
echo ""
echo "To restore from this backup:"
echo "  ./restore-memento.sh ./backups/memento-backup-$TIMESTAMP.tar.gz"