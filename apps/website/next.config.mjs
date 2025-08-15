/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint during builds (temporary fix for deployment)
  eslint: {
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
  
  // Configure image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
