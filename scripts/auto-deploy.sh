#!/bin/bash

# Auto-Deploy Script for Vercel
# This script can be run as a cron job to check for content changes and deploy

# Configuration
DIRECTUS_URL="https://admin.drawday.app"
VERCEL_DEPLOY_HOOK="${VERCEL_DEPLOY_HOOK}"
CHECK_INTERVAL=300  # 5 minutes in seconds

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Vercel Auto-Deploy Monitor${NC}"
echo -e "Checking for content changes every ${CHECK_INTERVAL} seconds...\n"

# Check if deploy hook is set
if [ -z "$VERCEL_DEPLOY_HOOK" ] || [[ "$VERCEL_DEPLOY_HOOK" == *"[DEPLOY_HOOK_ID]"* ]]; then
    echo -e "${RED}❌ Error: VERCEL_DEPLOY_HOOK not set!${NC}"
    echo -e "Please set your deploy hook:"
    echo -e "export VERCEL_DEPLOY_HOOK='https://api.vercel.com/v1/integrations/deploy/prj_REvWjwDl5e0h67CimJLOJuxgdVr3/YOUR_HOOK_ID'"
    exit 1
fi

# Function to trigger deployment
trigger_deploy() {
    echo -e "${YELLOW}📦 Triggering Vercel deployment...${NC}"
    
    response=$(curl -s -X POST "$VERCEL_DEPLOY_HOOK" \
        -H "Content-Type: application/json" \
        -d '{
            "deploymentMeta": {
                "trigger": "auto-deploy-script",
                "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
            }
        }')
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Deployment triggered successfully!${NC}"
        echo -e "Response: $response\n"
        return 0
    else
        echo -e "${RED}❌ Failed to trigger deployment${NC}\n"
        return 1
    fi
}

# Function to check for recent changes (simplified)
check_changes() {
    # For now, we'll trigger based on time intervals
    # In production, you'd check actual content changes via API
    return 0
}

# Main loop
if [ "$1" == "once" ]; then
    # Run once and exit
    trigger_deploy
else
    # Continuous monitoring
    while true; do
        echo -e "⏰ [$(date '+%Y-%m-%d %H:%M:%S')] Checking for changes..."
        
        if check_changes; then
            trigger_deploy
        else
            echo -e "No changes detected.\n"
        fi
        
        echo -e "💤 Sleeping for ${CHECK_INTERVAL} seconds...\n"
        sleep $CHECK_INTERVAL
    done
fi