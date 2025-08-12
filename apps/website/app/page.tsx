/**
 * DrawDay Solutions Homepage
 * 
 * Main company website showcasing all services and products
 */

import DrawDayHomePage from '@/components/DrawDayHomePage';

export const metadata = {
  title: 'DrawDay Solutions - Technology Partner for UK Raffle Companies',
  description: 'Complete technology solutions for UK raffle companies. Live draw software, streaming production, and custom websites. Trusted by companies giving away £10M+ in prizes.',
  keywords: 'UK raffle software, competition technology, live draw software, streaming production, raffle websites',
};

export default function Home() {
  return <DrawDayHomePage />;
}