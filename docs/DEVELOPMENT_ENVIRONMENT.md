# DrawDay Development Environment Setup

This guide provides complete instructions for setting up and running the DrawDay development environment with all services running simultaneously.

## Overview

The DrawDay platform consists of three main components:

- **Website**: Next.js marketing site and dashboard (port 3000)
- **Extension**: Chrome extension standalone server (port 5174)
- **Backend**: Directus CMS with PostgreSQL and Redis (port 8055)

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker and Docker Compose
- Git

## Quick Start

### 1. Initial Setup

Run the automated setup script:

```bash
./scripts/setup-dev.sh
```

This script will:

- Check all prerequisites
- Create environment files from examples
- Install dependencies
- Build packages
- Start backend services
- Verify everything is working

### 2. Environment Configuration

#### Backend Configuration (`backend/.env`)

```env
# Database
DB_USER=drawday_user
DB_PASSWORD=your_secure_password
DB_DATABASE=drawday_db

# Directus
DIRECTUS_KEY=your-directus-key
DIRECTUS_SECRET=your-directus-secret-min-32-chars
DIRECTUS_PORT=8055

# Admin
ADMIN_EMAIL=admin@drawday.app
ADMIN_PASSWORD=your_admin_password

# URLs
PUBLIC_URL=http://localhost:8055
```

#### Website Configuration (`apps/website/.env.local`)

```env
# Directus
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
DIRECTUS_URL=http://localhost:8055
DIRECTUS_ADMIN_EMAIL=admin@drawday.app
DIRECTUS_ADMIN_PASSWORD=your_admin_password

# Stripe (Test Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Extension
NEXT_PUBLIC_EXTENSION_URL=http://localhost:5174
```

#### Extension Configuration (`apps/spinner-extension/.env`)

```env
# API URLs
VITE_API_URL=http://localhost:3000/api
VITE_DIRECTUS_URL=http://localhost:8055
VITE_WEBSITE_URL=http://localhost:3000

# Development
VITE_STANDALONE_MODE=true
VITE_DEV_MODE=true
```

## Available Commands

### Full Stack Development

```bash
# Start all services (recommended)
pnpm dev:all

# Start frontend only (website + extension)
pnpm dev:frontend

# Start individual services
pnpm dev:website    # Website only
pnpm dev:extension  # Extension standalone only
```

### Backend Management

```bash
# Start backend services (detached)
pnpm backend:start

# Stop backend services
pnpm backend:stop

# View backend logs
pnpm backend:logs

# Reset backend (removes all data)
pnpm backend:reset
```

### Development Workflow

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run quality checks
pnpm quality

# Fix linting and formatting
pnpm quality:fix

# Run tests
pnpm test
```

## Service URLs

| Service   | URL                   | Description                             |
| --------- | --------------------- | --------------------------------------- |
| Website   | http://localhost:3000 | Next.js marketing site and dashboard    |
| Extension | http://localhost:5174 | Chrome extension standalone development |
| Directus  | http://localhost:8055 | Headless CMS admin panel                |
| Database  | localhost:5432        | PostgreSQL (Docker container)           |
| Cache     | localhost:6379        | Redis (Docker container)                |

## Architecture

### Port Allocation

- **3000**: Website (Next.js)
- **5174**: Extension standalone (Vite)
- **8055**: Directus CMS
- **5432**: PostgreSQL (internal)
- **6379**: Redis (internal)

### Communication Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Website   │────▶│   Directus   │◀────│  Extension  │
│  (port 3000)│     │  (port 8055) │     │ (port 5174) │
└─────────────┘     └──────────────┘     └─────────────┘
                            │
                    ┌───────┴────────┐
                    │                │
              ┌─────▼─────┐   ┌─────▼─────┐
              │PostgreSQL │   │   Redis   │
              └───────────┘   └───────────┘
```

### API Endpoints

#### Website API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/subscription/*` - Subscription management
- `/api/stripe-webhook` - Stripe webhook handler
- `/api/products` - Product listings

#### Directus API

- `/auth/*` - Directus authentication
- `/items/*` - Data collections
- `/users/*` - User management
- `/files/*` - File uploads

## Troubleshooting

### Common Issues

#### 1. Backend services not starting

```bash
# Check Docker status
docker ps

# View detailed logs
pnpm backend:logs

# Reset and restart
pnpm backend:reset
```

#### 2. Port conflicts

If ports are already in use:

```bash
# Find process using port
lsof -i :3000  # or :5174, :8055

# Kill process
kill -9 <PID>
```

#### 3. Database connection issues

```bash
# Check database container
docker exec -it drawday-database psql -U drawday_user -d drawday_db

# Reset database
cd backend && docker-compose down -v && docker-compose up -d
```

#### 4. CORS issues

Ensure your environment files have correct URLs:

- Website `.env.local` should reference correct API URLs
- Backend CORS settings in `docker-compose.yml` should include all origins

### Health Checks

```bash
# Check all services
curl http://localhost:3000/api/health
curl http://localhost:8055/server/health
curl http://localhost:5174

# Check integration health
curl http://localhost:3000/api/health/integrations
```

## Development Tips

### 1. Running with logs

To see all logs in real-time:

```bash
# In separate terminals
pnpm dev:website
pnpm dev:extension
pnpm backend:logs
```

### 2. Testing API communication

```bash
# Test Directus API
curl http://localhost:8055/items/products

# Test website API proxy
curl http://localhost:3000/api/products

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@drawday.app","password":"your_password"}'
```

### 3. Chrome Extension Development

For testing the extension in Chrome:

1. Build the extension: `pnpm --filter @drawday/spinner-extension build`
2. Open Chrome Extensions page: `chrome://extensions/`
3. Enable Developer Mode
4. Click "Load unpacked"
5. Select `apps/spinner-extension/DrawDaySpinner` directory

### 4. Hot Reload

- Website: Automatic with Next.js
- Extension: Automatic with Vite HMR
- Backend: Requires container restart for config changes

## Security Notes

### Development Credentials

⚠️ **Never commit real credentials to version control!**

- Use `.env.example` files as templates
- Add all `.env` files to `.gitignore`
- Use test API keys for Stripe development
- Generate secure secrets for production

### Generating Secrets

```bash
# Generate Directus key/secret
openssl rand -base64 32

# Generate NextAuth secret
openssl rand -base64 32
```

## Advanced Configuration

### Custom Docker Network

If you need to modify the Docker network:

```yaml
# backend/docker-compose.yml
networks:
  directus:
    name: drawday-network
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Performance Tuning

For better development performance:

```env
# apps/website/.env.local
NEXT_TELEMETRY_DISABLED=1

# apps/spinner-extension/.env
VITE_MAX_PARTICIPANTS=5000
VITE_ANIMATION_FPS=30
```

## Next Steps

1. **Configure Stripe**: Add your test keys to enable payment processing
2. **Set up Directus**: Login at http://localhost:8055 with admin credentials
3. **Load sample data**: Use the CSV samples in `apps/spinner-extension/samples/`
4. **Test integrations**: Verify all services can communicate

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review logs with `pnpm backend:logs`
3. Ensure all prerequisites are installed
4. Verify environment variables are correctly set
