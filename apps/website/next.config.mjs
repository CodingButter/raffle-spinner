/** @type {import('next').NextConfig} */
const nextConfig = {
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
