#!/usr/bin/env node

/**
 * Safe Build Script with Memory Management
 *
 * This script provides a robust build process that handles memory issues
 * and prevents segmentation faults during the build process.
 */

const { spawn } = require('child_process');
const os = require('os');

// Calculate optimal memory allocation based on system resources
function getOptimalMemory() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();

  // Use 75% of available memory, max 8GB
  const recommendedMemory = Math.min(Math.floor((freeMemory * 0.75) / (1024 * 1024)), 8192);

  // Minimum 2GB for builds
  return Math.max(recommendedMemory, 2048);
}

// Execute command with proper error handling
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Running: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    child.on('error', (error) => {
      console.error(`❌ Error: ${error.message}`);
      reject(error);
    });

    child.on('exit', (code, signal) => {
      if (signal === 'SIGSEGV') {
        console.error('💥 Segmentation fault detected!');
        reject(new Error(`Process terminated with segmentation fault`));
      } else if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

// Build packages sequentially to avoid memory issues
async function buildPackages() {
  const packages = [
    '@drawday/auth',
    '@drawday/security',
    '@drawday/types',
    '@drawday/utils',
    '@drawday/hooks',
    '@drawday/ui',
    '@raffle-spinner/subscription',
    'storage',
    'contexts',
    'csv-parser',
    'spinner-physics',
    'spinners',
  ];

  console.log('🔨 Building packages sequentially...');

  for (const pkg of packages) {
    try {
      await runCommand('pnpm', ['--filter', pkg, 'build']);
      console.log(`✅ Built ${pkg}`);
    } catch (error) {
      console.error(`❌ Failed to build ${pkg}: ${error.message}`);
      throw error;
    }
  }
}

// Build applications with memory allocation
async function buildApps() {
  console.log('🚀 Building applications...');

  try {
    // Build website
    console.log('🌐 Building website...');
    await runCommand('pnpm', ['--filter', '@drawday/website', 'build']);
    console.log('✅ Website built successfully');

    // Build extension
    console.log('🧩 Building extension...');
    await runCommand('pnpm', ['--filter', '@drawday/spinner-extension', 'build']);
    console.log('✅ Extension built successfully');
  } catch (error) {
    console.error(`❌ Failed to build applications: ${error.message}`);
    throw error;
  }
}

// Main build process
async function build() {
  console.log('🏗️  Starting safe build process...');
  console.log(
    `💾 System memory: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))}GB total, ${Math.round(os.freemem() / (1024 * 1024 * 1024))}GB free`
  );

  const memoryAllocation = getOptimalMemory();
  console.log(`📊 Allocating ${memoryAllocation}MB for Node.js heap`);

  // Set memory allocation
  process.env.NODE_OPTIONS = `--max-old-space-size=${memoryAllocation}`;

  try {
    // Clean previous builds
    console.log('🧹 Cleaning previous builds...');
    await runCommand('pnpm', ['clean']).catch(() => {
      console.log('⚠️  Clean command not available, continuing...');
    });

    // Build packages first
    await buildPackages();

    // Build applications
    await buildApps();

    console.log('✅ Build completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Build failed:', error.message);

    // Check if it was a memory issue
    if (
      error.message.includes('heap out of memory') ||
      error.message.includes('segmentation fault')
    ) {
      console.log('\n💡 Tips to resolve memory issues:');
      console.log('1. Close other applications to free up memory');
      console.log('2. Try running: npm run build:safe');
      console.log('3. Build packages individually with: pnpm --filter [package-name] build');
      console.log('4. Increase swap space on your system');
    }

    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️  Build interrupted by user');
  process.exit(1);
});

process.on('SIGSEGV', () => {
  console.error('💥 Segmentation fault in build script!');
  console.error(
    'Try running with increased memory: NODE_OPTIONS="--max-old-space-size=8192" node scripts/build-safe.js'
  );
  process.exit(1);
});

// Run build
build();
