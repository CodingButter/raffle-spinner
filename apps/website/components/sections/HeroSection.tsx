/**
 * Hero Section Component
 *
 * Purpose: Displays the main hero section with headline, CTAs, and trust badges
 * for the marketing website landing page.
 *
 * Website Requirements Reference:
 * - Section 4.1: Hero Section (Home Page Top)
 *
 * @module sections/hero-section
 */

'use client';

import { Button } from '@drawday/ui';
import { Download, ArrowRight, Shield, Lock, Award } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export function HeroSection() {
  const handleInstallClick = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    // Open Chrome Web Store
    const chromeStoreUrl = 'https://chrome.google.com/webstore';
    window.open(chromeStoreUrl, '_blank');
  };

  return (
    <section className="relative px-4 py-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/5 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="relative max-w-7xl mx-auto">
        {/* Trust badges */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-green-500" />
            Gambling Commission Compliant
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4 text-blue-500" />
            100% Transparent & Auditable
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="w-4 h-4 text-brand-gold" />
            500+ UK Companies Trust Us
          </div>
        </div>

        {/* Main heading */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Stop Losing{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-drawday-gold to-amber">
              £1000s Monthly
            </span>{' '}
            to Trust Issues
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Manual draws kill customer confidence. DrawDay's transparent live draws boost trust by
            73%, save you 15+ hours weekly, and turn skeptics into loyal customers. Go from CSV to
            live stream in 60 seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <Button size="lg" className="gap-2 text-lg px-8 py-6" onClick={handleInstallClick}>
              <Download className="w-5 h-5" />
              Start Free 14-Day Trial
            </Button>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
                See 60-Second Demo
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex justify-center items-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-pink border-2 border-background"
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-2">
              <span className="font-semibold text-foreground">523 UK companies</span> saved £2.3M
              this year
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
