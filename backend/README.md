# DrawDay Backend (Directus)

This is the backend for DrawDay Spinner, built with Directus CMS.

## Prerequisites

- Docker and Docker Compose installed
- At least 2GB of free RAM
- Port 8055 available (or change in .env)

## Setup

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   - Generate secure keys for `DIRECTUS_KEY` and `DIRECTUS_SECRET`
   - Update database passwords
   - Set your admin email and password

3. **Generate secure keys (optional):**
   ```bash
   # Generate DIRECTUS_KEY
   openssl rand -base64 32
   
   # Generate DIRECTUS_SECRET (must be at least 32 characters)
   openssl rand -base64 32
   ```

4. **Start the backend:**
   ```bash
   docker-compose up -d
   ```

5. **Check logs:**
   ```bash
   docker-compose logs -f directus
   ```

## Access

- **Directus Admin Panel:** http://localhost:8055
- **API Endpoint:** http://localhost:8055/items
- **GraphQL Playground:** http://localhost:8055/graphql

Default admin credentials (from .env):
- Email: admin@drawday.app
- Password: drawday

## Directory Structure

```
backend/
├── database/       # PostgreSQL data (gitignored)
├── uploads/        # File uploads (gitignored)
├── extensions/     # Directus extensions
├── docker-compose.yml
├── .env           # Environment variables (gitignored)
└── .env.example   # Example environment file
```

## API Endpoints

Once running, the following endpoints will be available:

- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `GET /users/me` - Get current user
- `GET /items/{collection}` - Get collection items
- `POST /items/{collection}` - Create item
- `PATCH /items/{collection}/{id}` - Update item
- `DELETE /items/{collection}/{id}` - Delete item

## Collections Schema

The following collections will be created:

### Regular Collections

#### Users (Extended from Directus Users)
- Custom fields for DrawDay users
- Subscription management
- Tool access control

#### Subscriptions
- User subscriptions
- Products (spinner, streaming, websites)
- Billing cycles
- Status tracking

#### Terms of Service
- Version management
- Content storage
- Active version tracking

#### Privacy Policy
- Version management
- Content storage
- Active version tracking

#### Contact Submissions
- Form submissions from website
- Status tracking for follow-up

### Singleton Collections (CMS Pages)

#### Homepage
- Hero section content
- Features list
- Call-to-action sections
- SEO metadata

#### Features Page
- Page title and subtitle
- Feature categories and items
- Pricing plans
- SEO metadata

#### Demo Page
- Page content
- Demo instructions
- Testimonials
- SEO metadata

#### Site Settings
- Global site configuration
- Social links
- Analytics settings
- Maintenance mode

## Managing Content

### Editing Singleton Content (CMS Pages)
1. Login to Directus Admin Panel: http://localhost:8055
2. Navigate to Content > [Collection Name]
3. Edit the fields and save
4. Changes will be immediately available via API

### Setting Up Vercel Auto-Deploy
1. Go to your Vercel project dashboard
2. Navigate to Settings > Git > Deploy Hooks
3. Create a new hook with name "Directus Content Update"
4. Copy the webhook URL
5. Add to `backend/.env`:
   ```
   VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/...
   ```
6. Run `npm run setup:webhooks`
7. Content changes will now trigger automatic rebuilds

### API Access for Singletons
Singleton collections return a single object instead of an array:
```bash
# Get homepage content (public)
curl http://localhost:8055/items/homepage

# Get site settings (public)
curl http://localhost:8055/items/site_settings
```

## Frontend Integration

### Fetching Content in Next.js
```javascript
// Static generation - fetches at build time
export async function getStaticProps() {
  const res = await fetch('http://localhost:8055/items/homepage');
  const data = await res.json();
  return {
    props: {
      homepage: data.data
    }
  };
}
```

### Environment Variables for Frontend
Add to your frontend `.env`:
```
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
```

## Maintenance

### Backup Database
```bash
docker-compose exec database pg_dump -U drawday_user drawday_db > backup.sql
```

### Restore Database
```bash
docker-compose exec -T database psql -U drawday_user drawday_db < backup.sql
```

### Stop Services
```bash
docker-compose down
```

### Remove All Data (CAUTION!)
```bash
docker-compose down -v
rm -rf database/* uploads/*
```

## Troubleshooting

### Permission Issues
If you encounter permission issues:
1. Ensure folders were created before starting Docker
2. Check folder ownership: `ls -la`
3. Fix permissions if needed: `chmod 755 uploads extensions database`

### Database Connection Issues
1. Check if database is healthy: `docker-compose ps`
2. View database logs: `docker-compose logs database`
3. Ensure .env variables are correct

### Port Already in Use
Change `DIRECTUS_PORT` in .env to another port (e.g., 8056)