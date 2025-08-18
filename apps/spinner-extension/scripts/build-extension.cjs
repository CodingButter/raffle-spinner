#!/usr/bin/env node

/**
 * Chrome Extension Build Script
 * SRS Reference: Build and package system for Chrome Extension deployment
 * Creates a production-ready ZIP file for Chrome Web Store submission
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const distDir = path.resolve(__dirname, '../DrawDaySpinner');
const outputZip = path.resolve(__dirname, '../drawday-spinner-extension.zip');

console.log('🏗️  Building Chrome Extension...');

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  if (fs.existsSync(outputZip)) {
    fs.unlinkSync(outputZip);
  }

  // Generate icons
  console.log('🎨 Generating icons...');
  execSync('node scripts/generate-icons.cjs', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });

  // Build the extension
  console.log('📦 Building extension...');
  const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  console.log(`📦 Building in ${mode} mode...`);
  execSync(`npx tsc --noEmit && npx vite build --mode ${mode}`, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });

  // Copy manifest and icons to DrawDaySpinner
  console.log('📋 Copying manifest and icons...');
  const publicDir = path.resolve(__dirname, '../public');
  const files = fs.readdirSync(publicDir);
  
  files.forEach(file => {
    const src = path.join(publicDir, file);
    const dest = path.join(distDir, file);
    fs.copyFileSync(src, dest);
  });
  
  // Copy background script if it exists
  const backgroundScript = path.join(__dirname, '..', 'src', 'background.js');
  if (fs.existsSync(backgroundScript)) {
    fs.copyFileSync(backgroundScript, path.join(distDir, 'background.js'));
  }

  // Create ZIP file
  console.log('🗜️  Creating ZIP package...');
  
  const output = fs.createWriteStream(outputZip);
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  output.on('close', () => {
    const stats = fs.statSync(outputZip);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('\n✅ Extension built successfully!');
    console.log(`📦 Package: drawday-spinner-extension.zip`);
    console.log(`📏 Size: ${sizeInMB} MB`);
    console.log(`📍 Location: apps/extension/drawday-spinner-extension.zip`);
    console.log('\n🎉 Ready to upload to Chrome Web Store!');
  });

  archive.on('error', (err) => {
    console.error('❌ Failed to create ZIP:', err);
    process.exit(1);
  });

  archive.pipe(output);
  
  // Add DrawDaySpinner folder contents
  archive.directory(distDir, false);
  
  archive.finalize();
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}