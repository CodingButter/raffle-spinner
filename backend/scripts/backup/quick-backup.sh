#!/bin/bash

# Quick backup script - doesn't stop containers
# Run as: sudo ./quick-backup.sh

BACKUP_NAME="drawday-db-backup-$(date +%Y%m%d-%H%M%S).tar.gz"

# Create backup
echo "Creating backup: $BACKUP_NAME"
tar -czf "$BACKUP_NAME" ./database

# Transfer to remote
echo "Transferring to 192.168.1.215..."
sudo -u $SUDO_USER scp "$BACKUP_NAME" codingbutter@192.168.1.215:~/

# Clean up
rm "$BACKUP_NAME"
echo "✅ Backup complete!"