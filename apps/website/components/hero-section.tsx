/**
 * Hero Section Component
 * 
 * The main hero section of the landing page with title, 
 * description, and call-to-action buttons.
 */

import { Button } from '@raffle-spinner/ui';
import { Trophy, Sparkles } from 'lucide-react';
import Link from 'next/link';

/**
 * Hero badge component
 * Displays a small badge with the product tagline
 */
function HeroBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/20 text-brand-gold-foreground">
      <Sparkles className="w-4 h-4" />
      <span className="text-sm font-medium">Fair, Transparent, Exciting</span>
    </div>
  );
}

/**
 * Hero title component
 * Displays the main product title with gradient effect
 */
function HeroTitle() {
  return (
    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-blue to-brand-pink bg-clip-text text-transparent">
      Raffle Winner Spinner
    </h1>
  );
}

/**
 * Hero description component
 * Provides a brief description of the product
 */
function HeroDescription() {
  return (
    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
      Turn your live raffles into unforgettable experiences with our professional Chrome extension. 
      Perfect for events, giveaways, and competitions.
    </p>
  );
}

/**
 * Hero CTA buttons component
 * Primary and secondary call-to-action buttons
 */
function HeroCTAButtons() {
  return (
    <div className="flex gap-4 justify-center pt-4">
      <Button size="lg" className="gap-2">
        <Trophy className="w-5 h-5" />
        Install Extension
      </Button>
      <Button size="lg" variant="outline" asChild>
        <Link href="/demo">Watch Demo</Link>
      </Button>
    </div>
  );
}

/**
 * Main Hero Section Component
 * Combines all hero sub-components into the complete section
 */
export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-4xl mx-auto space-y-6">
        <HeroBadge />
        <HeroTitle />
        <HeroDescription />
        <HeroCTAButtons />
      </div>
    </section>
  );
}