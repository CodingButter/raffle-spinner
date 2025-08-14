#!/usr/bin/env node

/**
 * Master setup script for Directus backend
 * Runs all setup scripts in the correct order
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting complete Directus setup...\n');

const scripts = [
  // Setup scripts - Create collections and configure permissions
  { file: 'scripts/setup/setup-collections.js', name: 'Creating collections' },
  { file: 'scripts/setup/setup-singletons.js', name: 'Creating singleton collections' },
  { file: 'scripts/setup/setup-website-info.js', name: 'Creating website info collections' },
  { file: 'scripts/setup/setup-permissions.js', name: 'Setting up permissions' },
  { file: 'scripts/setup/setup-singleton-permissions.js', name: 'Setting up singleton permissions' },
  { file: 'scripts/setup/setup-website-permissions.js', name: 'Setting up website permissions' },
  
  // Data scripts - Populate with initial content
  { file: 'scripts/data/populate-content.js', name: 'Populating content' },
  { file: 'scripts/data/populate-website-info.js', name: 'Populating website info' },
  { file: 'scripts/data/seed-data.js', name: 'Seeding test data' },
  
  // Webhook setup
  { file: 'scripts/setup/setup-webhooks.js', name: 'Setting up webhooks' },
];

let failed = [];

for (const script of scripts) {
  if (!fs.existsSync(script.file)) {
    console.log(`⚠️  Skipping ${script.name} - file not found`);
    continue;
  }

  console.log(`\n📦 ${script.name}...`);
  try {
    execSync(`node ${script.file}`, { stdio: 'inherit' });
    console.log(`✅ ${script.name} completed`);
  } catch (error) {
    console.error(`❌ ${script.name} failed`);
    failed.push(script.name);
  }
}

console.log('\n' + '='.repeat(50));
if (failed.length === 0) {
  console.log('✅ All setup tasks completed successfully!');
  console.log('\n🎯 Next steps:');
  console.log('  1. Visit http://localhost:8055 to access Directus admin');
  console.log('  2. Login with admin@drawday.app');
  console.log('  3. Start managing your content!');
} else {
  console.log('⚠️  Setup completed with some failures:');
  failed.forEach(task => console.log(`  - ${task}`));
  console.log('\nYou may need to run individual scripts to fix issues.');
}