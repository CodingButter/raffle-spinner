/**
 * Icon Resizer Script
 *
 * Generates all required icon sizes for Chrome Extension from the source icon.png
 * Uses the sharp library for high-quality image resizing
 *
 * Required sizes for Chrome Extensions:
 * - 16x16: Favicon, toolbar
 * - 32x32: Windows taskbar
 * - 48x48: Extension management page
 * - 128x128: Chrome Web Store, installation dialog
 */

import sharp from 'sharp';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICON_SIZES = [16, 32, 48, 128];
const SOURCE_ICON = path.join(__dirname, '../public/icon.png');
const OUTPUT_DIR = path.join(__dirname, '../public');

async function generateIcons() {
  console.log('🎨 Generating Chrome Extension icons from icon.png...\n');

  try {
    // Check if source icon exists
    await fs.access(SOURCE_ICON);

    // Get source image metadata
    const metadata = await sharp(SOURCE_ICON).metadata();
    console.log(`📐 Source image: ${metadata.width}x${metadata.height} (${metadata.format})\n`);

    // Generate each size
    for (const size of ICON_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}.png`);

      await sharp(SOURCE_ICON)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
        })
        .png({
          compressionLevel: 9, // Maximum compression
          quality: 100, // Maintain quality
        })
        .toFile(outputPath);

      const stats = await fs.stat(outputPath);
      console.log(`✅ Generated icon-${size}.png (${stats.size.toLocaleString()} bytes)`);
    }

    console.log('\n🎉 All icons generated successfully!');
    console.log('📍 Location: apps/extension/public/');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('❌ Error: icon.png not found in public directory');
      console.error('   Please ensure icon.png exists at:', SOURCE_ICON);
    } else {
      console.error('❌ Error generating icons:', error.message);
    }
    process.exit(1);
  }
}

// Run the script
generateIcons();
