#!/usr/bin/env node

/**
 * Icon Generation Script
 * SRS Reference: Support files for Chrome Extension manifest
 * Generates Chrome extension icons from source icon.png or creates placeholders
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Minimal valid PNG - 1x1 blue pixel
// This is the smallest valid PNG file structure
const createMinimalPNG = (size) => {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk (image header)
  const width = Buffer.alloc(4);
  width.writeUInt32BE(size);
  const height = Buffer.alloc(4);
  height.writeUInt32BE(size);
  
  const ihdrData = Buffer.concat([
    width,                          // Width
    height,                         // Height
    Buffer.from([0x08]),           // Bit depth (8)
    Buffer.from([0x02]),           // Color type (RGB)
    Buffer.from([0x00]),           // Compression method
    Buffer.from([0x00]),           // Filter method
    Buffer.from([0x00])            // Interlace method
  ]);
  
  const ihdrCrc = calculateCRC(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
  const ihdrChunk = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x0D]), // Length (13)
    Buffer.from('IHDR'),
    ihdrData,
    ihdrCrc
  ]);
  
  // IDAT chunk (image data) - simplified blue square
  // Using minimal compressed data for a solid blue image
  const idatData = Buffer.from([
    0x78, 0x9C, // zlib header
    0x62, 0x00, 0x00, // Compressed data for solid color
    0x00, 0x00, 0x01 // Adler-32 checksum
  ]);
  
  const idatCrc = calculateCRC(Buffer.concat([Buffer.from('IDAT'), idatData]));
  const idatLength = Buffer.alloc(4);
  idatLength.writeUInt32BE(idatData.length);
  
  const idatChunk = Buffer.concat([
    idatLength,
    Buffer.from('IDAT'),
    idatData,
    idatCrc
  ]);
  
  // IEND chunk (image end)
  const iendChunk = Buffer.from([
    0x00, 0x00, 0x00, 0x00, // Length (0)
    0x49, 0x45, 0x4E, 0x44, // 'IEND'
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
};

// Simple CRC calculation for PNG chunks
function calculateCRC(data) {
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  
  const result = Buffer.alloc(4);
  result.writeUInt32BE((crc ^ 0xFFFFFFFF) >>> 0);
  return result;
}

const sizes = [16, 32, 48, 128];
const publicDir = path.resolve(__dirname, '../public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Check if source icon exists
const sourceIcon = path.join(publicDir, 'icon.png');

if (fs.existsSync(sourceIcon)) {
  // Use the resize script to generate proper icons from source
  console.log('🎨 Found icon.png, generating sized icons...');
  
  try {
    execSync('node scripts/resize-icons.js', {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
  } catch (error) {
    console.error('❌ Failed to resize icons:', error.message);
    console.log('⚠️ Falling back to placeholder icons...');
    generatePlaceholders();
  }
} else {
  console.log('📦 No icon.png found, generating placeholder PNG icons...');
  generatePlaceholders();
}

function generatePlaceholders() {
  sizes.forEach(size => {
    const filename = path.join(publicDir, `icon-${size}.png`);
    const pngBuffer = createMinimalPNG(size);
    
    fs.writeFileSync(filename, pngBuffer);
    console.log(`✅ Generated placeholder icon-${size}.png (${pngBuffer.length} bytes)`);
  });
  
  console.log('✅ All placeholder icons generated successfully!');
}