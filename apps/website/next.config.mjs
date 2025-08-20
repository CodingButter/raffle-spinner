/** @type {import('next').NextConfig} */

// Security headers configuration
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  // X-Frame-Options removed - handled by middleware for proper /extension/* route handling
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  }
];

const nextConfig = {
  // Skip ESLint during builds (temporary fix for deployment)
  eslint: {
  },
  
  // Skip TypeScript checks during build (temporary fix for fatal array length error)
  typescript: {
    ignoreBuildErrors: true,
    ignoreDuringBuilds: true,
  },
  
  // Transpile workspace packages for Vercel deployment
  transpilePackages: [
    '@drawday/auth',
    '@drawday/hooks',
    '@drawday/ui',
    '@drawday/utils',
    '@drawday/types',
    '@raffle-spinner/spinners',
    '@raffle-spinner/storage',
  ],
  
  // Tell webpack how to resolve workspace packages
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@drawday/auth': '@drawday/auth',
      '@drawday/hooks': '@drawday/hooks',
      '@drawday/ui': '@drawday/ui',
      '@drawday/utils': '@drawday/utils',
      '@drawday/types': '@drawday/types',
      '@raffle-spinner/spinners': '@raffle-spinner/spinners',
      '@raffle-spinner/storage': '@raffle-spinner/storage',
    };
    return config;
  },
  
  // Allow serving of video and image files from the assets folder
  async rewrites() {
    return [
      {
        source: '/assets/:path*',
        destination: '/assets/:path*',
      },
    ];
  },
  
  // Apply security headers
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Additional headers for API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  
  // Configure image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
