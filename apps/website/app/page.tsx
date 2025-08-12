/**
 * Home Page - Server Component
 *
 * Fetches demo assets at build time and passes them to the client component
 */

import { getDemoAssets } from '@/lib/get-demo-assets';
import HomePage from '@/components/HomePage';

// This is a Server Component that runs at build time
export default function Home() {
  // Get demo assets at build time (this runs on the server)
  const demoAssets = getDemoAssets();

  // Pass the assets to the client component
  return <HomePage demoAssets={demoAssets} />;
}
