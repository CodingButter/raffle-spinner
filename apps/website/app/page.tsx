/**
 * Home Page
 * 
 * The main landing page for the Raffle Winner Spinner website.
 * Composed of modular sections showcasing product features and benefits.
 */

import { HeroSection } from '@/components/hero-section';
import { FeaturesSection } from '@/components/features-section';
import { CTASection } from '@/components/cta-section';

/**
 * Main Home Page Component
 * Combines all landing page sections with gradient background
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/10 to-brand-pink/10">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}