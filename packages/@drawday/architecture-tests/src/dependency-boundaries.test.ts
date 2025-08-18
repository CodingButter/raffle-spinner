import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync as fsReaddirSync } from 'fs';
import { join, resolve } from 'path';
import { findFilesRecursively } from './test-utils';

const PROJECT_ROOT = resolve(__dirname, '../../../..');

interface DependencyViolation {
  package: string;
  file: string;
  violation: string;
}

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function getPackageJson(packagePath: string): PackageJson | null {
  const path = join(packagePath, 'package.json');
  if (!existsSync(path)) return null;
  
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

function validateDrawdayImports(importPath: string): string | null {
  if (importPath.startsWith('@raffle-spinner/')) {
    return `@drawday package importing from @raffle-spinner: ${importPath}`;
  }
  if (importPath.includes('apps/')) {
    return `@drawday package importing from apps: ${importPath}`;
  }
  return null;
}

function validateRaffleSpinnerImports(importPath: string): string | null {
  if (importPath.includes('apps/')) {
    return `@raffle-spinner package importing from apps: ${importPath}`;
  }
  return null;
}

function validateAppImports(importPath: string): string | null {
  if (importPath.includes('apps/') && !importPath.startsWith('.') && !importPath.startsWith('~')) {
    return `App importing from another app: ${importPath}`;
  }
  return null;
}

function checkImports(filePath: string, packageName: string): string[] {
  const violations: string[] = [];
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      let violation: string | null = null;
      
      if (packageName.startsWith('@drawday/')) {
        violation = validateDrawdayImports(importPath);
      } else if (packageName.startsWith('@raffle-spinner/')) {
        violation = validateRaffleSpinnerImports(importPath);
      } else if (packageName.includes('apps/')) {
        violation = validateAppImports(importPath);
      }
      
      if (violation) {
        violations.push(violation);
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
  try {
    return fsReaddirSync(dir);
  } catch {
    return [];
  }
}