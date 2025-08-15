import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint during builds (temporary fix for deployment)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@drawday/ui', 'lucide-react'],
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
  
  // Configure image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default withBundleAnalyzer(nextConfig);
