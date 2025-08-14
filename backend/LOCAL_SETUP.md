# Local Directus Setup with Production Migration

This guide helps you set up a local Directus instance and migrate data from production.

## Prerequisites

- Docker and Docker Compose installed
- Access to production Directus admin panel
- nginx installed (for reverse proxy)

## Step 1: Start Local Directus

```bash
cd backend

# Start Directus with Docker
docker-compose up -d

# Check if it's running
docker-compose ps

# View logs
docker-compose logs -f directus
```

Local Directus will be available at: http://localhost:8055

## Step 2: Export Production Data

### Option A: Using Directus Admin Panel

1. Log into production: https://admin.drawday.app
2. Go to Settings → Project Settings
3. Export Schema (for structure)
4. Go to each collection and export data as JSON

### Option B: Using Directus CLI (if you have SSH access)

```bash
# SSH into production server
ssh your-server

# Export schema
npx directus schema snapshot ./snapshot.yaml

# Export data
npx directus database export ./backup.sql
```

## Step 3: Import to Local Directus

### Import Schema First

```bash
# Copy the schema file to local
# Then apply it
docker exec -it drawday-directus npx directus schema apply ./snapshot.yaml
```

### Import Data

```bash
# For SQL backup
docker exec -i drawday-postgres psql -U directus directus < backup.sql

# For JSON exports (via Admin UI)
# Import through Directus Admin UI: http://localhost:8055/admin
```

## Step 4: Configure nginx Reverse Proxy

Create nginx configuration to route admin.drawday.local to your local Directus:

### For Linux/Mac:

1. Edit hosts file:
```bash
sudo nano /etc/hosts

# Add this line:
127.0.0.1   admin.drawday.local
```

2. Create nginx config:
```bash
sudo nano /etc/nginx/sites-available/directus-local

# Add this configuration:
server {
    listen 80;
    server_name admin.drawday.local;

    location / {
        proxy_pass http://localhost:8055;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/directus-local /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### For Windows (WSL2):

Same as Linux/Mac but paths might differ.

## Step 5: Update Application Configuration

Update your `.env.local` to point to local Directus:

```bash
# In apps/website/.env.local
NEXT_PUBLIC_DIRECTUS_URL=http://admin.drawday.local
# or
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
```

## Step 6: Install Stripe Webhook Extension

The extension is already in `backend/extensions/endpoints/stripe-webhook/`

1. Install dependencies:
```bash
cd backend/extensions/endpoints/stripe-webhook
npm install
```

2. Restart Directus:
```bash
cd ../../..
docker-compose restart directus
```

3. Test webhook endpoint:
```bash
curl http://localhost:8055/stripe-webhook/health
```

## Managing Local Directus

### Start/Stop Services
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Stop and remove volumes (careful - deletes data!)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Just Directus
docker-compose logs -f directus

# Just database
docker-compose logs -f database
```

### Access Database Directly
```bash
# PostgreSQL CLI
docker exec -it drawday-postgres psql -U directus directus

# Backup database
docker exec drawday-postgres pg_dump -U directus directus > backup.sql

# Restore database
docker exec -i drawday-postgres psql -U directus directus < backup.sql
```

## Switching Between Local and Production

### Use Local Directus
```bash
# Update .env.local
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
```

### Use Production Directus
```bash
# Update .env.local
NEXT_PUBLIC_DIRECTUS_URL=https://admin.drawday.app
```

## Troubleshooting

### Port 8055 Already in Use
```bash
# Find what's using port 8055
lsof -i :8055

# Change port in .env
DIRECTUS_PORT=8056
```

### Database Connection Issues
```bash
# Check database is running
docker-compose ps database

# Check database logs
docker-compose logs database

# Recreate database
docker-compose down
rm -rf ./database
docker-compose up -d
```

### Extension Not Loading
```bash
# Check extension is in correct location
ls -la extensions/endpoints/stripe-webhook/

# Check Directus logs for errors
docker-compose logs directus | grep stripe

# Restart Directus
docker-compose restart directus
```

## Benefits of Local Development

1. **Faster Development**: No network latency
2. **Safe Testing**: Can't break production
3. **Offline Work**: Works without internet
4. **Easy Reset**: Can wipe and restart anytime
5. **Debug Access**: Full access to logs and database

## Next Steps

1. Start local Directus
2. Import your production schema
3. Test Stripe webhook locally
4. Develop new features safely
5. Deploy to production when ready