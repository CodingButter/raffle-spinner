import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { findFilesRecursively } from './test-utils';

const PROJECT_ROOT = resolve(__dirname, '../../../..');

interface DependencyViolation {
  package: string;
  file: string;
  violation: string;
}

function getPackageJson(packagePath: string): any {
  const path = join(packagePath, 'package.json');
  if (!existsSync(path)) return null;
  
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

function checkImports(filePath: string, packageName: string): string[] {
  const violations: string[] = [];
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Check for forbidden imports based on package boundaries
      if (packageName.startsWith('@drawday/')) {
        // @drawday packages should not import from @raffle-spinner
        if (importPath.startsWith('@raffle-spinner/')) {
          violations.push(`@drawday package importing from @raffle-spinner: ${importPath}`);
        }
        
        // @drawday packages should not import from apps
        if (importPath.includes('apps/')) {
          violations.push(`@drawday package importing from apps: ${importPath}`);
        }
      }
      
      if (packageName.startsWith('@raffle-spinner/')) {
        // @raffle-spinner packages can import from @drawday
        // but should not import from apps
        if (importPath.includes('apps/')) {
          violations.push(`@raffle-spinner package importing from apps: ${importPath}`);
        }
      }
      
      // No package should import from another app
      if (packageName.includes('apps/') && importPath.includes('apps/') && 
          !importPath.startsWith('.') && !importPath.startsWith('~')) {
        violations.push(`App importing from another app: ${importPath}`);
      }
    }
  } catch (error) {
    // Ignore read errors
  }
  
  return violations;
}

describe('Architecture: Dependency Boundaries', () => {
  it('should enforce monorepo package boundaries', () => {
    const violations: DependencyViolation[] = [];
    
    // Check @drawday packages
    const drawdayPackages = readdirSync(join(PROJECT_ROOT, 'packages/@drawday'));
    for (const pkg of drawdayPackages) {
      const packagePath = join(PROJECT_ROOT, 'packages/@drawday', pkg);
      const files = findFilesRecursively(join(packagePath, 'src'), ['ts', 'tsx']);
      
      for (const file of files) {
        const importViolations = checkImports(file, `@drawday/${pkg}`);
        for (const violation of importViolations) {
          violations.push({
            package: `@drawday/${pkg}`,
            file: file.replace(PROJECT_ROOT, ''),
            violation
          });
        }
      }
    }
    
    // Check @raffle-spinner packages
    const raffleSpinnerPath = join(PROJECT_ROOT, 'packages/@raffle-spinner');
    if (existsSync(raffleSpinnerPath)) {
      const rafflePackages = readdirSync(raffleSpinnerPath);
      for (const pkg of rafflePackages) {
        const packagePath = join(raffleSpinnerPath, pkg);
        const files = findFilesRecursively(join(packagePath, 'src'), ['ts', 'tsx']);
        
        for (const file of files) {
          const importViolations = checkImports(file, `@raffle-spinner/${pkg}`);
          for (const violation of importViolations) {
            violations.push({
              package: `@raffle-spinner/${pkg}`,
              file: file.replace(PROJECT_ROOT, ''),
              violation
            });
          }
        }
      }
    }
    
    if (violations.length > 0) {
      const message = violations
        .map(v => `  ${v.package} in ${v.file}:\n    ${v.violation}`)
        .join('\n');
      
      throw new Error(
        `Dependency boundary violations found:\n${message}\n\n` +
        'These imports violate monorepo boundaries and must be fixed.'
      );
    }
    
    expect(violations).toHaveLength(0);
  });
  
  it('should detect circular dependencies', () => {
    // This is a placeholder for more sophisticated circular dependency detection
    // In practice, we'd use a tool like madge or analyze the dependency graph
    
    const packageJsonPaths = [
      ...findFilesRecursively(join(PROJECT_ROOT, 'packages'), ['package.json']),
      ...findFilesRecursively(join(PROJECT_ROOT, 'apps'), ['package.json'])
    ];
    
    const dependencyGraph = new Map<string, Set<string>>();
    
    // Build dependency graph
    for (const path of packageJsonPaths) {
      const pkg = getPackageJson(path.replace('/package.json', ''));
      if (!pkg || !pkg.name) continue;
      
      const deps = new Set<string>();
      
      if (pkg.dependencies) {
        Object.keys(pkg.dependencies).forEach(dep => {
          if (dep.includes('@drawday') || dep.includes('@raffle-spinner')) {
            deps.add(dep);
          }
        });
      }
      
      dependencyGraph.set(pkg.name, deps);
    }
    
    // Simple cycle detection (would need more sophisticated algorithm for complex cases)
    const cycles: string[] = [];
    
    for (const [pkg, deps] of dependencyGraph) {
      for (const dep of deps) {
        const depDeps = dependencyGraph.get(dep);
        if (depDeps && depDeps.has(pkg)) {
          cycles.push(`${pkg} <-> ${dep}`);
        }
      }
    }
    
    if (cycles.length > 0) {
      throw new Error(
        `Circular dependencies detected:\n  ${cycles.join('\n  ')}\n\n` +
        'These circular dependencies must be resolved immediately.'
      );
    }
    
    expect(cycles).toHaveLength(0);
  });
});

// Export helper for reuse
export function readdirSync(dir: string): string[] {
  const fs = require('fs');
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}