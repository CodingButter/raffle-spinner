#!/usr/bin/env node

/**
 * Simplified Chrome Extension Build Script
 * Creates a lightweight extension package with iframe architecture
 * Target size: <100KB instead of 2MB+
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const publicDir = path.resolve(__dirname, '../public');
const distDir = path.resolve(__dirname, '../DrawDaySpinnerSimple');
const outputZip = path.resolve(__dirname, '../drawday-spinner-simple.zip');

console.log('🚀 Building Simplified Chrome Extension (iframe architecture)...');

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  if (fs.existsSync(outputZip)) {
    fs.unlinkSync(outputZip);
  }

  // Create dist directory
  fs.mkdirSync(distDir, { recursive: true });

  // Copy only necessary files from public directory
  console.log('📋 Copying essential files...');
  const essentialFiles = [
    'manifest.json',
    'sidepanel-iframe.html',
    'options-iframe.html',
    'iframe-loader.js',
    'background-simple.js',
    'icon-16.png',
    'icon-32.png',
    'icon-48.png',
    'icon-128.png'
  ];

  let totalSize = 0;
  essentialFiles.forEach(file => {
    const src = path.join(publicDir, file);
    const dest = path.join(distDir, file);
    
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      const stats = fs.statSync(src);
      totalSize += stats.size;
      console.log(`  ✓ ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
    } else {
      console.warn(`  ⚠ ${file} not found`);
    }
  });

  console.log(`\n📏 Total uncompressed size: ${(totalSize / 1024).toFixed(1)}KB`);

  // Create ZIP file
  console.log('\n🗜️  Creating ZIP package...');
  
  const output = fs.createWriteStream(outputZip);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  output.on('close', () => {
    const stats = fs.statSync(outputZip);
    const sizeInKB = (stats.size / 1024).toFixed(1);
    
    console.log('\n✅ Simplified extension built successfully!');
    console.log('📦 Package: drawday-spinner-simple.zip');
    console.log(`📏 Compressed size: ${sizeInKB}KB`);
    
    if (stats.size < 102400) { // Less than 100KB
      console.log('🎯 Goal achieved: Extension is under 100KB!');
    } else {
      console.log(`⚠️  Extension is ${sizeInKB}KB (target: <100KB)`);
    }
    
    console.log('\n🎉 Ready to test the lightweight extension!');
    console.log('📍 Location: apps/spinner-extension/drawday-spinner-simple.zip');
  });

  archive.on('error', (err) => {
    console.error('❌ Failed to create ZIP:', err);
    process.exit(1);
  });

  archive.pipe(output);
  
  // Add files to archive
  archive.directory(distDir, false);
  
  archive.finalize();
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}