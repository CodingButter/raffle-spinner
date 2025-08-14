#!/bin/bash

# Backup script for Directus database
# Zips the database folder and transfers to remote server

# Configuration
BACKUP_NAME="drawday-db-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
DB_PATH="./database"
REMOTE_USER="codingbutter"
REMOTE_HOST="192.168.1.215"
REMOTE_PATH="~/"  # Change this to your preferred destination path

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting database backup...${NC}"

# Check if running as sudo
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}Please run this script with sudo${NC}"
   exit 1
fi

# Check if database folder exists
if [ ! -d "$DB_PATH" ]; then
    echo -e "${RED}Database folder not found at $DB_PATH${NC}"
    exit 1
fi

# Stop the containers to ensure data consistency
echo -e "${YELLOW}Stopping Docker containers...${NC}"
docker-compose down

# Create the backup
echo -e "${YELLOW}Creating backup: $BACKUP_NAME${NC}"
tar -czf "$BACKUP_NAME" "$DB_PATH"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backup created successfully${NC}"
else
    echo -e "${RED}Failed to create backup${NC}"
    docker-compose up -d
    exit 1
fi

# Transfer to remote server
echo -e "${YELLOW}Transferring to $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH${NC}"
sudo -u $SUDO_USER scp "$BACKUP_NAME" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Transfer completed successfully${NC}"
    
    # Optional: Remove local backup after successful transfer
    echo -e "${YELLOW}Removing local backup file...${NC}"
    rm "$BACKUP_NAME"
    
    echo -e "${GREEN}✅ Backup complete!${NC}"
    echo -e "Backup saved to: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}${BACKUP_NAME}"
else
    echo -e "${RED}Transfer failed${NC}"
fi

# Restart the containers
echo -e "${YELLOW}Restarting Docker containers...${NC}"
docker-compose up -d

echo -e "${GREEN}Done!${NC}"