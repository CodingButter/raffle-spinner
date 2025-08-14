# Backend Scripts

This directory contains all scripts for managing the Directus backend.

## Directory Structure

```
scripts/
├── setup/          # Initial setup and configuration scripts
├── data/           # Data population and seeding scripts
├── utils/          # Utility and fix scripts
└── backup/         # Backup and restore scripts
```

## Setup Scripts (`/setup`)

Scripts for initial Directus configuration:

- `setup-collections.js` - Creates basic collections (subscriptions, terms, privacy, etc.)
- `setup-singletons.js` - Creates singleton collections for CMS pages
- `setup-website-info.js` - Creates company info, social media, careers, team collections
- `setup-permissions.js` - Sets up general permissions
- `setup-singleton-permissions.js` - Sets up singleton-specific permissions
- `setup-website-permissions.js` - Sets up website info permissions
- `setup-webhooks.js` - Configures Vercel deployment webhook

## Data Scripts (`/data`)

Scripts for populating data:

- `populate-content.js` - Populates CMS page content (homepage, features, etc.)
- `populate-website-info.js` - Populates company info, social media, careers, team
- `seed-data.js` - Creates test users and sample subscriptions

## Utility Scripts (`/utils`)

Scripts for maintenance and fixes:

- `fix-public-permissions.js` - Fixes public access permissions if needed
- `fix-singleton-content.js` - Fixes singleton content insertion issues

## Backup Scripts (`/backup`)

Scripts for database backup:

- `backup-database.sh` - Full backup with container stop/start
- `quick-backup.sh` - Quick backup without stopping containers

## Usage

### Run all setup at once:
```bash
npm run setup
```

### Run specific tasks:
```bash
# Setup only
npm run setup:collections
npm run setup:permissions

# Data only
npm run data:populate
npm run data:seed

# Fixes
npm run fix:permissions
npm run fix:content

# Backup
npm run backup
npm run backup:quick
```

## Master Setup Script

The `setup-all.js` script in the backend root runs all scripts in the correct order:

1. Creates all collections
2. Sets up permissions
3. Populates data
4. Configures webhooks

This is the recommended way to set up a fresh Directus instance.