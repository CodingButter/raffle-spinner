#!/bin/bash

# Video Compression Script for Raffle Spinner Demo Video
# This script compresses the demo video for better web performance

echo "🎬 Video Compression Script for Raffle Spinner"
echo "=============================================="

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed. Please install it first:"
    echo "   Ubuntu/Debian: sudo apt-get install ffmpeg"
    echo "   macOS: brew install ffmpeg"
    echo "   Windows: Download from https://ffmpeg.org/download.html"
    exit 1
fi

# Set paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VIDEO_DIR="$SCRIPT_DIR/../public/assets/see-it-in-action"
ORIGINAL_VIDEO="$VIDEO_DIR/Spinner-Demo-Video.mp4"
BACKUP_VIDEO="$VIDEO_DIR/Spinner-Demo-Video.original.mp4"
COMPRESSED_VIDEO="$VIDEO_DIR/Spinner-Demo-Video.mp4"

# Check if original video exists
if [ ! -f "$ORIGINAL_VIDEO" ]; then
    echo "❌ Original video not found at: $ORIGINAL_VIDEO"
    exit 1
fi

# Get original file size
ORIGINAL_SIZE=$(du -h "$ORIGINAL_VIDEO" | cut -f1)
echo "📊 Original video size: $ORIGINAL_SIZE"

# Create backup of original
echo "💾 Creating backup of original video..."
cp "$ORIGINAL_VIDEO" "$BACKUP_VIDEO"
echo "✅ Backup saved as: Spinner-Demo-Video.original.mp4"

# Compress video with H.264 codec for maximum compatibility
echo "🗜️  Compressing video (this may take a minute)..."

# Two-pass encoding for better quality at lower bitrate
# First pass
ffmpeg -y -i "$BACKUP_VIDEO" \
  -c:v libx264 \
  -preset slow \
  -b:v 1500k \
  -maxrate 2000k \
  -bufsize 4000k \
  -vf "scale=1280:-2" \
  -pass 1 \
  -an \
  -f mp4 \
  /dev/null

# Second pass with audio
ffmpeg -y -i "$BACKUP_VIDEO" \
  -c:v libx264 \
  -preset slow \
  -b:v 1500k \
  -maxrate 2000k \
  -bufsize 4000k \
  -vf "scale=1280:-2" \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  -pass 2 \
  "$COMPRESSED_VIDEO"

# Clean up two-pass log files
rm -f ffmpeg2pass-0.log ffmpeg2pass-0.log.mbtree

# Alternative: Single-pass compression (faster but slightly larger)
# Uncomment below and comment out two-pass section above if you prefer speed
# ffmpeg -i "$BACKUP_VIDEO" \
#   -c:v libx264 \
#   -preset medium \
#   -crf 23 \
#   -vf "scale=1280:-2" \
#   -c:a aac \
#   -b:a 128k \
#   -movflags +faststart \
#   "$COMPRESSED_VIDEO"

# Check if compression succeeded
if [ ! -f "$COMPRESSED_VIDEO" ]; then
    echo "❌ Compression failed!"
    echo "🔄 Restoring original video..."
    mv "$BACKUP_VIDEO" "$ORIGINAL_VIDEO"
    exit 1
fi

# Get compressed file size
COMPRESSED_SIZE=$(du -h "$COMPRESSED_VIDEO" | cut -f1)
echo "✅ Compressed video size: $COMPRESSED_SIZE"

# Calculate savings
ORIGINAL_BYTES=$(stat -f%z "$BACKUP_VIDEO" 2>/dev/null || stat -c%s "$BACKUP_VIDEO" 2>/dev/null)
COMPRESSED_BYTES=$(stat -f%z "$COMPRESSED_VIDEO" 2>/dev/null || stat -c%s "$COMPRESSED_VIDEO" 2>/dev/null)
if [ -n "$ORIGINAL_BYTES" ] && [ -n "$COMPRESSED_BYTES" ]; then
    SAVINGS=$((100 - (COMPRESSED_BYTES * 100 / ORIGINAL_BYTES)))
    echo "💰 Size reduction: ${SAVINGS}%"
fi

echo ""
echo "🎉 Video compression complete!"
echo "📁 Original backup: $BACKUP_VIDEO"
echo "📁 Compressed video: $COMPRESSED_VIDEO"
echo ""
echo "🔄 To restore original, run:"
echo "   mv $BACKUP_VIDEO $COMPRESSED_VIDEO"