/**
 * Base tsup configuration with memory optimization
 *
 * This configuration provides sensible defaults for building packages
 * with memory efficiency in mind.
 */

export function createTsupConfig(options = {}) {
  const {
    entry = ['src/index.ts'],
    format = ['cjs', 'esm'],
    dts = false, // Disabled by default due to memory issues
    sourcemap = true,
    clean = true,
    external = [],
    target = 'es2020',
    splitting = false, // Disable code splitting to reduce memory usage
    minify = false, // Disable minification in dev to save memory
    ...rest
  } = options;

  return {
    entry,
    format,
    dts,
    sourcemap,
    clean,
    external,
    target,
    splitting,
    minify: process.env.NODE_ENV === 'production' ? minify : false,
    // Memory optimization options
    bundle: true,
    treeshake: true,
    // Limit parallel workers to prevent memory issues
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
    esbuildOptions(options) {
      // Limit memory usage during build
      options.legalComments = 'none';
      options.charset = 'utf8';
      options.logLevel = 'warning';
      // Use incremental builds to reduce memory pressure
      options.incremental = process.env.NODE_ENV !== 'production';
    },
    ...rest,
  };
}
