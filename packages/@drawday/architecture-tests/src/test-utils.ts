import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export function findFilesRecursively(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    try {
      const items = readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = join(currentDir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip common build/dependency directories
          if (!['node_modules', 'dist', 'build', '.next', '.turbo', 'coverage', '.git'].includes(item)) {
            traverse(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = item.split('.').pop() || '';
          if (extensions.includes(ext) || extensions.includes(item)) {
            files.push(fullPath);
          }
        }
      }
    } catch {
      // Ignore permission errors or missing directories
    }
  }
  
  traverse(dir);
  return files;
}