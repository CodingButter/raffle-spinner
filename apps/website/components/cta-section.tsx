/**
 * CTA (Call-to-Action) Section Component
 * 
 * A prominent call-to-action section encouraging users to get started
 * with the Raffle Winner Spinner extension.
 */

import { Button, Card, CardContent } from '@raffle-spinner/ui';
import { Trophy } from 'lucide-react';
import Link from 'next/link';

/**
 * CTA heading component
 * Main heading for the call-to-action
 */
function CTAHeading() {
  return (
    <h2 className="text-3xl font-bold mb-4">
      Ready to Transform Your Raffles?
    </h2>
  );
}

/**
 * CTA description component
 * Supporting text for the call-to-action
 */
function CTADescription() {
  return (
    <p className="text-xl mb-8 opacity-90">
      Join thousands of event organizers using Raffle Winner Spinner
    </p>
  );
}

/**
 * CTA buttons component
 * Primary and secondary action buttons
 */
function CTAButtons() {
  return (
    <div className="flex gap-4 justify-center">
      <Button size="lg" variant="secondary" className="gap-2">
        <Trophy className="w-5 h-5" />
        Get Started Free
      </Button>
      <Button 
        size="lg" 
        variant="outline" 
        className="text-white border-white hover:bg-white/20" 
        asChild
      >
        <Link href="/docs">Documentation</Link>
      </Button>
    </div>
  );
}

/**
 * Main CTA Section Component
 * Full-width call-to-action with gradient background
 */
export function CTASection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <Card className="max-w-4xl mx-auto bg-gradient-to-r from-brand-blue to-brand-pink text-white">
        <CardContent className="text-center py-12">
          <CTAHeading />
          <CTADescription />
          <CTAButtons />
        </CardContent>
      </Card>
    </section>
  );
}