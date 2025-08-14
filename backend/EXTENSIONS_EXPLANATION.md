# Directus Extensions Not Showing - Explanation

## The Issue

The custom extensions (like the Stripe webhook endpoint) are not showing in Settings > Extensions because Directus 10 requires extensions to be **compiled/built** before they can be loaded.

## Why Extensions Aren't Loading

1. **Build Requirement**: Directus 10+ requires extensions to be built with `@directus/extensions-sdk`
2. **Package Structure**: Extensions need proper `package.json` with directus metadata
3. **Compilation**: Raw JavaScript files aren't recognized - they need to be compiled to a specific format
4. **Docker Isolation**: Extensions need to be properly installed in the Docker container

## How Directus 10 Extensions Work

```
Raw Extension Code → Build Process → Compiled Extension → Loaded by Directus
     (index.js)       (SDK/Rollup)    (dist/index.js)      (Shows in UI)
```

## Solutions

### Option 1: Use Directus Flows (✅ Currently Implemented)
- **Pros**: No build step, visual editor, officially supported
- **Cons**: Limited to what Flows can do
- **Status**: Working! Webhook URL: `https://admin.drawday.app/flows/trigger/[flow-id]`

### Option 2: Build Extensions Properly
To make extensions show in the UI, you would need to:

1. Install Directus Extensions SDK:
```bash
npm install -D @directus/extensions-sdk
```

2. Create proper extension structure:
```
extensions/
└── endpoints/
    └── stripe-webhook/
        ├── package.json
        ├── src/
        │   └── index.js
        └── dist/
            └── index.js (compiled)
```

3. Build the extension:
```bash
npx directus-extension build
```

4. Mount the built extension in Docker

### Option 3: Use Custom Docker Image
Create a Dockerfile that installs extensions at build time:

```dockerfile
FROM directus/directus:10.10
COPY ./built-extensions /directus/extensions
```

## Current Solution: Flows

Since Flows are working perfectly for the Stripe webhook, we're using that approach. The Flow:
- ✅ Receives webhooks
- ✅ Processes Stripe events
- ✅ Can update user subscriptions
- ✅ Shows in the Directus UI (under Flows, not Extensions)
- ✅ No compilation needed

## Why Flows Are Better for This Use Case

1. **Easier Maintenance**: Visual editor, no code compilation
2. **Better Integration**: Direct access to Directus operations
3. **Officially Supported**: Recommended approach for webhooks
4. **Visible in UI**: Shows under Settings > Flows
5. **Version Compatible**: Works with all Directus 10.x versions

## Conclusion

While custom endpoint extensions would show in Settings > Extensions if properly built and compiled, using Flows is the recommended and simpler approach for webhook handling in Directus 10. The Stripe webhook is fully functional via the Flow system.