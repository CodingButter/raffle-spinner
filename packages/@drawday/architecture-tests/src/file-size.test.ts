import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const MAX_FILE_SIZE = 200; // lines
const PROJECT_ROOT = resolve(__dirname, '../../../..');

interface FileViolation {
  path: string;
  lines: number;
  limit: number;
}

function countLines(filePath: string): number {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

function findFilesRecursively(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const items = readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, dist, build, etc.
        if (!['node_modules', 'dist', 'build', '.next', '.turbo', 'coverage'].includes(item)) {
          traverse(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = item.split('.').pop() || '';
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

describe('Architecture: File Size Limits', () => {
  it('should enforce maximum file size of 200 lines', () => {
    const violations: FileViolation[] = [];
    
    // Check all TypeScript and TSX files
    const files = [
      ...findFilesRecursively(join(PROJECT_ROOT, 'apps'), ['ts', 'tsx']),
      ...findFilesRecursively(join(PROJECT_ROOT, 'packages'), ['ts', 'tsx'])
    ];
    
    for (const file of files) {
      const lines = countLines(file);
      if (lines > MAX_FILE_SIZE) {
        violations.push({
          path: file.replace(PROJECT_ROOT, ''),
          lines,
          limit: MAX_FILE_SIZE
        });
      }
    }
    
    if (violations.length > 0) {
      const message = violations
        .map(v => `  ${v.path}: ${v.lines} lines (limit: ${v.limit})`)
        .join('\n');
      
      throw new Error(
        `File size violations found:\n${message}\n\n` +
        'These files exceed the 200-line limit and must be refactored immediately.'
      );
    }
    
    expect(violations).toHaveLength(0);
  });
  
  it('should identify critically large files requiring immediate refactoring', () => {
    const CRITICAL_SIZE = 400; // Files over 400 lines are P0 priority
    const criticalFiles: FileViolation[] = [];
    
    const files = [
      ...findFilesRecursively(join(PROJECT_ROOT, 'apps'), ['ts', 'tsx']),
      ...findFilesRecursively(join(PROJECT_ROOT, 'packages'), ['ts', 'tsx'])
    ];
    
    for (const file of files) {
      const lines = countLines(file);
      if (lines > CRITICAL_SIZE) {
        criticalFiles.push({
          path: file.replace(PROJECT_ROOT, ''),
          lines,
          limit: CRITICAL_SIZE
        });
      }
    }
    
    if (criticalFiles.length > 0) {
      const message = criticalFiles
        .map(v => `  ${v.path}: ${v.lines} lines (CRITICAL - P0 PRIORITY)`)
        .join('\n');
      
      console.error(
        `CRITICAL: Files requiring immediate refactoring:\n${message}`
      );
    }
    
    // Don't fail, just warn for now
    expect(criticalFiles.length).toBeLessThanOrEqual(10);
  });
});