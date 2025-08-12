/**
 * Get Demo Assets
 *
 * Scans the see-it-in-action folder for images and videos at build time
 */

import fs from 'fs';
import path from 'path';

export interface DemoAsset {
  src: string;
  type: 'image' | 'video';
  name: string;
}

const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov'];

export function getDemoAssets(): DemoAsset[] {
  const assetsDir = path.join(process.cwd(), 'public/assets/see-it-in-action');
  const assets: DemoAsset[] = [];

  try {
    // Check if directory exists
    if (!fs.existsSync(assetsDir)) {
      console.warn('Demo assets directory not found:', assetsDir);
      return assets;
    }

    // Read all files in the directory
    const files = fs.readdirSync(assetsDir);

    files.forEach((file) => {
      const ext = path.extname(file).toLowerCase();
      const name = path.basename(file, ext);

      if (SUPPORTED_IMAGE_EXTENSIONS.includes(ext)) {
        assets.push({
          src: `/assets/see-it-in-action/${file}`,
          type: 'image',
          name,
        });
      } else if (SUPPORTED_VIDEO_EXTENSIONS.includes(ext)) {
        assets.push({
          src: `/assets/see-it-in-action/${file}`,
          type: 'video',
          name,
        });
      }
    });

    // Sort assets to ensure consistent order (videos first, then images)
    assets.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'video' ? -1 : 1;
    });
  } catch (error) {
    console.error('Error reading demo assets:', error);
  }

  return assets;
}
