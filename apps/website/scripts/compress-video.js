#!/usr/bin/env node

/**
 * Video Compression Script for Raffle Spinner Demo
 *
 * This script provides video compression without requiring system ffmpeg
 * Uses @ffmpeg-installer/ffmpeg for cross-platform support
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VIDEO_DIR = path.join(__dirname, '../public/assets/see-it-in-action');
const ORIGINAL_VIDEO = path.join(VIDEO_DIR, 'Spinner-Demo-Video.mp4');
const BACKUP_VIDEO = path.join(VIDEO_DIR, 'Spinner-Demo-Video.original.mp4');
const COMPRESSED_VIDEO = path.join(VIDEO_DIR, 'Spinner-Demo-Video.compressed.mp4');

console.log('🎬 Video Compression Script for Raffle Spinner');
console.log('==============================================\n');

// Check if original video exists
if (!fs.existsSync(ORIGINAL_VIDEO)) {
  console.error('❌ Original video not found at:', ORIGINAL_VIDEO);
  process.exit(1);
}

// Get original file size
const originalStats = fs.statSync(ORIGINAL_VIDEO);
const originalSizeMB = (originalStats.size / (1024 * 1024)).toFixed(2);
console.log(`📊 Original video size: ${originalSizeMB} MB`);

// Create backup
console.log('💾 Creating backup of original video...');
fs.copyFileSync(ORIGINAL_VIDEO, BACKUP_VIDEO);
console.log('✅ Backup saved as: Spinner-Demo-Video.original.mp4\n');

// Install dependencies if needed
console.log('📦 Checking dependencies...');
try {
  require.resolve('@ffmpeg-installer/ffmpeg');
  require.resolve('fluent-ffmpeg');
} catch (e) {
  console.log('📥 Installing required packages...');
  console.log('   This is a one-time setup that may take a minute...\n');

  try {
    execSync('npm install --no-save @ffmpeg-installer/ffmpeg fluent-ffmpeg', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
  } catch (installError) {
    console.error('❌ Failed to install dependencies:', installError.message);
    console.log('\n💡 Please run manually:');
    console.log('   cd apps/website');
    console.log('   npm install --no-save @ffmpeg-installer/ffmpeg fluent-ffmpeg');
    console.log('   node scripts/compress-video.js');
    process.exit(1);
  }
}

// Now load the modules
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

console.log('🗜️  Compressing video (this may take a few minutes)...\n');

// Compression settings optimized for web
const compressionPresets = {
  high: {
    videoBitrate: '1500k',
    audioBitrate: '128k',
    size: '1280x?',
    preset: 'slow',
    crf: 23,
  },
  medium: {
    videoBitrate: '1000k',
    audioBitrate: '96k',
    size: '1280x?',
    preset: 'medium',
    crf: 28,
  },
  low: {
    videoBitrate: '750k',
    audioBitrate: '96k',
    size: '960x?',
    preset: 'medium',
    crf: 30,
  },
};

// Use medium quality by default (good balance)
const settings = compressionPresets.medium;

// Create progress bar
let progress = 0;
const progressBar = (percent) => {
  const barLength = 40;
  const filled = Math.round((barLength * percent) / 100);
  const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
  process.stdout.write(`\r  Progress: [${bar}] ${percent.toFixed(1)}%`);
};

// Perform compression
ffmpeg(ORIGINAL_VIDEO)
  .videoCodec('libx264')
  .audioCodec('aac')
  .videoBitrate(settings.videoBitrate)
  .audioBitrate(settings.audioBitrate)
  .size(settings.size)
  .outputOptions([
    '-preset ' + settings.preset,
    '-crf ' + settings.crf,
    '-movflags +faststart', // Optimize for web streaming
    '-pix_fmt yuv420p', // Maximum compatibility
  ])
  .on('progress', (info) => {
    if (info.percent) {
      progressBar(info.percent);
    }
  })
  .on('end', () => {
    console.log('\n\n✅ Compression complete!');

    // Get compressed file size
    const compressedStats = fs.statSync(COMPRESSED_VIDEO);
    const compressedSizeMB = (compressedStats.size / (1024 * 1024)).toFixed(2);
    const savings = ((1 - compressedStats.size / originalStats.size) * 100).toFixed(1);

    console.log(`📊 Compressed video size: ${compressedSizeMB} MB`);
    console.log(`💰 Size reduction: ${savings}%\n`);

    // Replace original with compressed
    fs.unlinkSync(ORIGINAL_VIDEO);
    fs.renameSync(COMPRESSED_VIDEO, ORIGINAL_VIDEO);

    console.log('📁 Files:');
    console.log(`   • Backup: ${BACKUP_VIDEO}`);
    console.log(`   • Compressed: ${ORIGINAL_VIDEO}\n`);

    console.log('🔄 To restore original, run:');
    console.log(`   mv "${BACKUP_VIDEO}" "${ORIGINAL_VIDEO}"`);

    // Clean up node_modules if installed locally
    const localModules = path.join(__dirname, '../node_modules');
    if (fs.existsSync(path.join(localModules, '@ffmpeg-installer'))) {
      console.log('\n🧹 Cleaning up temporary dependencies...');
      try {
        fs.rmSync(path.join(localModules, '@ffmpeg-installer'), { recursive: true, force: true });
        fs.rmSync(path.join(localModules, 'fluent-ffmpeg'), { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  })
  .on('error', (err) => {
    console.error('\n\n❌ Compression failed:', err.message);

    // Restore backup
    if (fs.existsSync(BACKUP_VIDEO)) {
      console.log('🔄 Restoring original video...');
      fs.copyFileSync(BACKUP_VIDEO, ORIGINAL_VIDEO);
      fs.unlinkSync(BACKUP_VIDEO);
    }

    process.exit(1);
  })
  .save(COMPRESSED_VIDEO);
