import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

/**
 * Architectural boundary tests to enforce package isolation
 */

describe('Package Boundary Tests', () => {
  const rootDir = path.resolve(__dirname, '../../..');
  
  it('should not have circular dependencies between packages', async () => {
    const packageFiles = await glob('**/package.json', {
      cwd: rootDir,
      ignore: ['**/node_modules/**', '**/dist/**', '.git/**'],
    });
    
    const dependencies = new Map<string, Set<string>>();
    
    // Build dependency graph
    for (const file of packageFiles) {
      const content = JSON.parse(readFileSync(path.join(rootDir, file), 'utf-8'));
      if (!content.name || !content.name.startsWith('@')) continue;
      
      const deps = new Set<string>();
      
      // Check all dependency types
      const depTypes = ['dependencies', 'devDependencies', 'peerDependencies'];
      for (const depType of depTypes) {
        if (content[depType]) {
          for (const dep of Object.keys(content[depType])) {
            if (dep.startsWith('@drawday/') || dep.startsWith('@raffle-spinner/')) {
              deps.add(dep);
            }
          }
        }
      }
      
      dependencies.set(content.name, deps);
    }
    
    // Check for cycles
    function hasCycle(pkg: string, visited: Set<string>, stack: Set<string>): boolean {
      visited.add(pkg);
      stack.add(pkg);
      
      const deps = dependencies.get(pkg) || new Set();
      for (const dep of deps) {
        if (!visited.has(dep)) {
          if (hasCycle(dep, visited, stack)) {
            return true;
          }
        } else if (stack.has(dep)) {
          console.error(`Circular dependency detected: ${pkg} -> ${dep}`);
          return true;
        }
      }
      
      stack.delete(pkg);
      return false;
    }
    
    const cycles: string[] = [];
    for (const [pkg] of dependencies) {
      const visited = new Set<string>();
      const stack = new Set<string>();
      if (hasCycle(pkg, visited, stack)) {
        cycles.push(pkg);
      }
    }
    
    expect(cycles).toHaveLength(0);
  });
  
  it('spinner-extension should not directly depend on website packages', async () => {
    const extensionPkg = JSON.parse(
      readFileSync(path.join(rootDir, 'apps/spinner-extension/package.json'), 'utf-8')
    );
    
    const allDeps = {
      ...extensionPkg.dependencies,
      ...extensionPkg.devDependencies,
    };
    
    const websiteDeps = Object.keys(allDeps).filter(dep => 
      dep.includes('website') || dep.includes('next')
    );
    
    expect(websiteDeps).toHaveLength(0);
  });
  
  it('@drawday packages should not depend on @raffle-spinner packages', async () => {
    const drawdayPackages = await glob('packages/@drawday/*/package.json', {
      cwd: rootDir,
    });
    
    for (const pkgPath of drawdayPackages) {
      const content = JSON.parse(readFileSync(path.join(rootDir, pkgPath), 'utf-8'));
      const allDeps = {
        ...content.dependencies,
        ...content.devDependencies,
      };
      
      const raffleSpinnerDeps = Object.keys(allDeps).filter(dep => 
        dep.startsWith('@raffle-spinner/')
      );
      
      if (raffleSpinnerDeps.length > 0) {
        throw new Error(
          `${content.name} depends on raffle-spinner packages: ${raffleSpinnerDeps.join(', ')}`
        );
      }
    }
  });
  
  it('packages should not exceed 250 lines per file', async () => {
    const sourceFiles = await glob('**/*.{ts,tsx}', {
      cwd: rootDir,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/build/**',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    });
    
    const largeFiles: { file: string; lines: number }[] = [];
    
    for (const file of sourceFiles) {
      const content = readFileSync(path.join(rootDir, file), 'utf-8');
      const lines = content.split('\n').length;
      
      if (lines > 250) {
        largeFiles.push({ file, lines });
      }
    }
    
    if (largeFiles.length > 0) {
      console.error('Files exceeding 250 lines:');
      largeFiles.forEach(({ file, lines }) => {
        console.error(`  ${file}: ${lines} lines`);
      });
    }
    
    expect(largeFiles).toHaveLength(0);
  });
});