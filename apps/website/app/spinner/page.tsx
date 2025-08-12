/**
 * Spinner Product Page
 * 
 * The original spinner product showcase page
 * Now lives at /spinner as part of DrawDay Solutions suite
 */

import { getDemoAssets } from '@/lib/get-demo-assets';
import HomePage from '@/components/HomePage';

export const metadata = {
  title: 'DrawDay Spinner - Professional Live Draw Software',
  description: 'The ultimate Chrome extension for UK raffle companies. Run fair, transparent, and exciting live draws with our professional spinner software.',
};

export default function SpinnerPage() {
  const demoAssets = getDemoAssets();
  return <HomePage demoAssets={demoAssets} />;
}