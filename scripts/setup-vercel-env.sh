#!/bin/bash

# Setup Vercel Environment Variables
# This script configures the production environment variables for Vercel

echo "🚀 Setting up Vercel Environment Variables"
echo "==========================================="

# Production environment variables
vercel env add NEXT_PUBLIC_DIRECTUS_URL production <<< "https://admin.drawday.app"

# Also set for preview deployments
vercel env add NEXT_PUBLIC_DIRECTUS_URL preview <<< "https://admin.drawday.app"

# Development (optional - if you want to use production backend in dev)
vercel env add NEXT_PUBLIC_DIRECTUS_URL development <<< "https://admin.drawday.app"

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "Current environment variables:"
vercel env ls

echo ""
echo "📝 To trigger a new deployment with these variables:"
echo "   node scripts/trigger-deploy.js deploy"