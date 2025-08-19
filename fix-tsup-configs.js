#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all tsup.config.ts files
const files = glob.sync('packages/**/tsup.config.ts');

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');

  // Skip if already fixed
  if (content.includes('compilerOptions:')) {
    console.log(`✓ Already fixed: ${file}`);
    return;
  }

  // Replace dts: true with the workaround
  let newContent = content.replace(
    /dts:\s*true/g,
    `dts: {
    // Workaround for fatal JavaScript invalid array length error
    entry: ['src/index.ts'],
    compilerOptions: {
      composite: false,
      incremental: false
    }
  }`
  );

  // Also disable sourcemaps to reduce memory usage
  newContent = newContent.replace(/sourcemap:\s*true/g, 'sourcemap: false');

  // Add treeshake: false if not present
  if (!newContent.includes('treeshake')) {
    newContent = newContent.replace(
      /splitting:\s*false,?\s*\n/g,
      'splitting: false,\n  treeshake: false,\n'
    );
  }

  fs.writeFileSync(file, newContent);
  console.log(`✅ Fixed: ${file}`);
});

console.log('\nAll tsup configs fixed!');
