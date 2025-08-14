# Directus Backend Deployment Guide

## Production URLs

- **Admin Panel**: https://admin.drawday.app
- **API Endpoint**: https://admin.drawday.app/items
- **Frontend**: https://drawday.app

## Prerequisites

- Docker and Docker Compose installed on the server
- Domain configured with DNS pointing to server
- SSL certificate (handled by Traefik or Nginx)
- Environment variables configured

## Deployment Steps

### 1. Clone Repository

```bash
git clone https://github.com/CodingButter/raffle-spinner.git
cd raffle-spinner/backend
```

### 2. Set Production Environment Variables

Create `.env` file from `.env.production`:

```bash
cp .env.production .env
```

Edit `.env` and set the following required variables:

```env
# Generate secure keys
DIRECTUS_KEY=<generate-with-openssl-rand-base64-32>
DIRECTUS_SECRET=<generate-with-openssl-rand-base64-32>

# Set strong passwords
DB_PASSWORD=<strong-database-password>
ADMIN_PASSWORD=<strong-admin-password>

# Email configuration (optional but recommended)
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password
```

Generate secure keys:
```bash
openssl rand -base64 32  # For DIRECTUS_KEY
openssl rand -base64 32  # For DIRECTUS_SECRET
```

### 3. Deploy with Docker Compose

For production deployment:

```bash
docker-compose -f docker-compose.production.yml up -d
```

### 4. Initialize Database and Collections

Wait for services to be healthy:
```bash
docker-compose -f docker-compose.production.yml ps
```

Run initialization scripts:
```bash
# Install dependencies
npm install

# Set up collections
npm run setup
npm run setup:singletons

# Set up permissions
npm run permissions
npm run permissions:singletons

# Populate initial data
npm run populate

# Set up webhooks
npm run setup:webhooks
```

### 5. Verify Deployment

1. **Check admin panel**: https://admin.drawday.app
   - Login: admin@drawday.app
   - Password: (as set in .env)

2. **Test public API**:
```bash
curl https://admin.drawday.app/items/homepage
curl https://admin.drawday.app/items/company_info
curl https://admin.drawday.app/items/social_media
```

3. **Check frontend integration**:
   - Visit https://drawday.app
   - Footer should show dynamic content
   - Homepage should load from CMS

### 6. SSL Configuration

If using Traefik (recommended):
- Labels are already configured in docker-compose.production.yml
- Ensure Traefik is running with Let's Encrypt configuration

If using Nginx:
```nginx
server {
    server_name admin.drawday.app;
    
    location / {
        proxy_pass http://localhost:8055;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

## Backup and Restore

### Backup Database

```bash
# Create backup
docker exec drawday-database pg_dump -U drawday_user drawday_db > backup_$(date +%Y%m%d).sql

# Backup uploads
tar -czf uploads_$(date +%Y%m%d).tar.gz uploads/
```

### Restore Database

```bash
# Restore database
docker exec -i drawday-database psql -U drawday_user drawday_db < backup.sql

# Restore uploads
tar -xzf uploads_backup.tar.gz
```

## Monitoring

### Check Logs

```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f directus
```

### Health Checks

```bash
# Check service health
docker-compose -f docker-compose.production.yml ps

# Test database connection
docker exec drawday-database pg_isready

# Test Redis
docker exec drawday-cache redis-cli ping
```

## Updating

1. **Backup first** (see Backup section)

2. **Pull latest changes**:
```bash
git pull origin main
```

3. **Update containers**:
```bash
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

4. **Run migrations if needed**:
```bash
docker exec drawday-directus npx directus database migrate:latest
```

## Troubleshooting

### Permission Issues

If public API access isn't working:
```bash
node fix-public-permissions.js
```

### Singleton Content Issues

If singleton content isn't appearing:
```bash
node fix-singleton-content.js
```

### Clear Cache

```bash
docker exec drawday-cache redis-cli FLUSHALL
```

### Reset Admin Password

```bash
docker exec drawday-directus npx directus users passwd admin@drawday.app
```

## Security Checklist

- [ ] Strong passwords set for all accounts
- [ ] SSL/TLS configured and working
- [ ] CORS properly configured for your domains
- [ ] Rate limiting enabled
- [ ] Regular backups configured
- [ ] Monitoring and alerts set up
- [ ] Firewall rules configured (only expose necessary ports)
- [ ] Environment variables not committed to git

## Production Environment Variables

All sensitive variables should be set in production:

- `DIRECTUS_KEY`: 32-byte random key
- `DIRECTUS_SECRET`: 32-byte random secret
- `DB_PASSWORD`: Strong database password
- `ADMIN_PASSWORD`: Strong admin password
- `EMAIL_SMTP_PASSWORD`: Email service password
- `VERCEL_DEPLOY_HOOK`: Your Vercel webhook URL

## Support

For issues or questions:
- Check logs: `docker-compose -f docker-compose.production.yml logs`
- Directus docs: https://docs.directus.io
- Project repository: https://github.com/CodingButter/raffle-spinner