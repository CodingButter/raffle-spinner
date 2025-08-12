# Video Optimization Instructions

## Current Status

- **File**: `Spinner-Demo-Video.mp4`
- **Size**: 37 MB (too large for optimal web performance)
- **Location**: `/apps/website/public/assets/see-it-in-action/`

## Recommended Compression Settings

### Option 1: Use FFmpeg (Recommended)

```bash
# Install ffmpeg first
# macOS: brew install ffmpeg
# Ubuntu/Debian: sudo apt-get install ffmpeg
# Windows: Download from https://ffmpeg.org/download.html

# Then run the compression script
cd apps/website
./scripts/compress-video.sh
```

### Option 2: Use Node.js Script

```bash
# This will auto-install dependencies
cd apps/website
node scripts/compress-video.js
```

### Option 3: Online Compression Tools (Quick & Easy)

Use one of these free online video compressors:

1. **HandBrake (Desktop App)** - https://handbrake.fr/
   - Download and install HandBrake
   - Open your video file
   - Choose "Web Optimized" preset
   - Set quality to RF 23-28 (lower = better quality, larger file)
   - Start encode

2. **CloudConvert** - https://cloudconvert.com/mp4-compressor
   - Upload your MP4
   - Settings:
     - Video Codec: H.264
     - Resolution: 1280x720 or keep original
     - Video Bitrate: 1500 kbps
     - Audio Bitrate: 128 kbps
   - Convert and download

3. **FreeConvert** - https://www.freeconvert.com/video-compressor
   - Upload video
   - Target size: 5-10 MB
   - Keep "Web Optimized" checked
   - Compress and download

4. **Clideo** - https://clideo.com/compress-video
   - Upload video
   - Choose compression level
   - Download compressed version

## Optimal Settings for Web

### Video Settings:

- **Codec**: H.264 (best compatibility)
- **Resolution**: 1280x720 (720p) or 1920x1080 (1080p)
- **Bitrate**: 1000-2000 kbps
- **Frame Rate**: 30 fps
- **Profile**: Baseline or Main
- **Level**: 3.1 or 4.0

### Audio Settings:

- **Codec**: AAC
- **Bitrate**: 96-128 kbps
- **Sample Rate**: 44100 Hz

### Container:

- **Format**: MP4
- **Fast Start**: Enabled (for web streaming)

## Target File Size

- **Current**: 37 MB
- **Target**: 5-10 MB (75-85% reduction)
- **Acceptable Quality Loss**: Minimal at these settings

## Manual FFmpeg Commands

### High Quality (10-15 MB):

```bash
ffmpeg -i Spinner-Demo-Video.mp4 \
  -c:v libx264 -preset slow -crf 23 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  -vf scale=1280:-2 \
  Spinner-Demo-Video-compressed.mp4
```

### Medium Quality (5-10 MB):

```bash
ffmpeg -i Spinner-Demo-Video.mp4 \
  -c:v libx264 -preset medium -crf 28 \
  -c:a aac -b:a 96k \
  -movflags +faststart \
  -vf scale=1280:-2 \
  Spinner-Demo-Video-compressed.mp4
```

### Low Quality (3-5 MB):

```bash
ffmpeg -i Spinner-Demo-Video.mp4 \
  -c:v libx264 -preset fast -crf 32 \
  -c:a aac -b:a 96k \
  -movflags +faststart \
  -vf scale=960:-2 \
  Spinner-Demo-Video-compressed.mp4
```

## Alternative: Convert to WebM

WebM provides better compression but less compatibility:

```bash
ffmpeg -i Spinner-Demo-Video.mp4 \
  -c:v libvpx-vp9 -crf 30 -b:v 0 \
  -c:a libopus -b:a 96k \
  Spinner-Demo-Video.webm
```

## After Compression

1. Replace the original file in `/public/assets/see-it-in-action/`
2. Test the carousel to ensure video plays correctly
3. Keep a backup of the original if needed

## Benefits of Compression

- ✅ Faster page load times
- ✅ Better user experience
- ✅ Reduced bandwidth costs
- ✅ Improved SEO (page speed)
- ✅ Better mobile performance
