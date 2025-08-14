# Directus API Collection Management

Yes, you can use the Directus API to create and edit collections programmatically. Here's how:

## Quick Start

The scripts in `/backend/scripts/` demonstrate how to:
- Create new collections
- Add fields to collections
- Update collection settings
- Delete collections
- Manage relationships between collections

## Running the Scripts

```bash
# From the backend directory
cd backend

# Using the JavaScript version
node scripts/manage-collections.js

# Using the TypeScript version (with better type safety)
npx ts-node scripts/manage-collections.ts
```

## Key API Endpoints

### Collections
- `POST /collections` - Create a new collection
- `GET /collections` - List all collections
- `PATCH /collections/:collection` - Update a collection
- `DELETE /collections/:collection` - Delete a collection

### Fields
- `POST /fields/:collection` - Create a field in a collection
- `GET /fields/:collection` - Get all fields in a collection
- `PATCH /fields/:collection/:field` - Update a field
- `DELETE /fields/:collection/:field` - Delete a field

## Example: Creating a Collection via API

```javascript
// Authenticate first
const response = await fetch('https://admin.drawday.app/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@drawday.app',
    password: 'your-password'
  })
});

const { data: { access_token } } = await response.json();

// Create a collection
await fetch('https://admin.drawday.app/collections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    collection: 'my_collection',
    meta: {
      singleton: false,
      icon: 'folder',
      display_template: '{{name}}'
    },
    schema: {
      name: 'my_collection'
    }
  })
});
```

## Current Directus Setup

Based on your `.env` file:
- **URL**: https://admin.drawday.app (production) or http://localhost:8055 (local)
- **Admin Email**: admin@drawday.app
- **Password**: [as configured]

## To Start Using the API

1. **Local Development** (if Directus is not running):
```bash
cd backend
docker-compose up -d
```

2. **Production**: Use https://admin.drawday.app directly

3. **Run the example scripts**:
```bash
# This will authenticate and list existing collections
node scripts/manage-collections.js
```

## Benefits of API Management

- **Automation**: Create collections programmatically
- **Version Control**: Track schema changes in Git
- **CI/CD**: Deploy schema changes automatically
- **Bulk Operations**: Create multiple collections/fields at once
- **Consistency**: Ensure same schema across environments

## Need Help?

The scripts include examples for:
- Creating a blog system
- Setting up competition collections
- Managing relationships
- Adding custom fields

Uncomment the relevant sections in the scripts to execute specific operations.