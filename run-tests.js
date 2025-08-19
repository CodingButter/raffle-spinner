#!/usr/bin/env node

/**
 * Test Runner Script
 * Author: David Miller, Lead Developer Architect
 * Purpose: Execute tests and fix infrastructure
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 DrawDay Test Infrastructure Runner\n');
console.log('========================================\n');

// Change to project directory
process.chdir('/home/codingbutter/GitHub/drawday-solutions/project');
console.log(`📍 Working directory: ${process.cwd()}\n`);

// Function to run command and capture output
function runCommand(command, description) {
  console.log(`\n🚀 ${description}`);
  console.log('----------------------------------------');
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(result);
    return { success: true, output: result };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    return { success: false, error: error.message };
  }
}

// Check if pnpm is installed
const pnpmCheck = runCommand('pnpm --version', 'Checking pnpm installation');
if (!pnpmCheck.success) {
  console.log('Installing pnpm...');
  runCommand('npm install -g pnpm@9.15.9', 'Installing pnpm');
}

// Install dependencies
runCommand('pnpm install', 'Installing dependencies');

// Run tests for each package with tests
const testResults = [];

// Spinner Extension Tests
console.log('\n📦 Testing Spinner Extension...');
const spinnerTests = runCommand(
  'cd apps/spinner-extension && pnpm test:run',
  'Spinner Extension Tests'
);
testResults.push({ package: 'spinner-extension', ...spinnerTests });

// CSV Parser Tests
console.log('\n📦 Testing CSV Parser...');
const csvTests = runCommand(
  'cd packages/csv-parser && pnpm test:run',
  'CSV Parser Tests'
);
testResults.push({ package: 'csv-parser', ...csvTests });

// Architecture Tests
console.log('\n📦 Testing Architecture...');
const archTests = runCommand(
  'cd packages/@drawday/architecture-tests && pnpm test:run',
  'Architecture Tests'
);
testResults.push({ package: 'architecture-tests', ...archTests });

// Website Tests
console.log('\n📦 Testing Website...');
const websiteTests = runCommand(
  'cd apps/website && pnpm test:run',
  'Website Tests'
);
testResults.push({ package: 'website', ...websiteTests });

// Summary
console.log('\n\n📊 Test Results Summary');
console.log('========================================');
testResults.forEach(result => {
  const status = result.success ? '✅' : '❌';
  console.log(`${status} ${result.package}: ${result.success ? 'PASSED' : 'FAILED'}`);
});

// Run linting
console.log('\n\n🔍 Running ESLint...');
const lintResult = runCommand('pnpm lint', 'Linting');

// Run type checking
console.log('\n\n🔍 Running TypeScript Check...');
const typecheckResult = runCommand('pnpm typecheck', 'Type Checking');

// Run build
console.log('\n\n🏗️ Running Build...');
const buildResult = runCommand('pnpm build', 'Building');

// Final summary
console.log('\n\n🎯 Final Status');
console.log('========================================');
console.log(`Tests: ${testResults.every(r => r.success) ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`Linting: ${lintResult.success ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`TypeCheck: ${typecheckResult.success ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`Build: ${buildResult.success ? '✅ PASSED' : '❌ FAILED'}`);

process.exit(0);