import { AnimatedBackground } from '@/components/ui/animated-background';
import { ScrollIndicator } from '@/components/ui/scroll-indicator';
import { HeroBadge } from './hero-badge';
import { HeroStats } from './hero-stats';
import { HeroCTA } from './hero-cta';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaLink: string;
  ctaText: string;
}

/**
 * Hero section component
 */
export function HeroSection({ title, subtitle, ctaLink, ctaText }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <HeroBadge />

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
          {title}
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        <HeroCTA primaryLink={ctaLink} primaryText={ctaText} />
        <HeroStats />
      </div>

      <ScrollIndicator />
    </section>
  );
}