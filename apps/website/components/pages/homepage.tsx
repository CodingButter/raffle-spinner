/**
 * Modular Homepage Component
 *
 * Composes all homepage sections together
 */

import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/sections/hero';

// Dynamic imports for below-the-fold sections
const ServicesSection = dynamic(() => import('@/components/sections/services').then(mod => ({ default: mod.ServicesSection })), {
  loading: () => <div className="min-h-[600px] bg-gray-900/20 animate-pulse" />,
});

const FeaturesSection = dynamic(() => import('@/components/sections/features').then(mod => ({ default: mod.FeaturesSection })), {
  loading: () => <div className="min-h-[500px] bg-gray-900/20 animate-pulse" />,
});

const ClientsSection = dynamic(() => import('@/components/sections/clients').then(mod => ({ default: mod.ClientsSection })), {
  loading: () => <div className="min-h-[300px] bg-gray-900/20 animate-pulse" />,
});

const CTASection = dynamic(() => import('@/components/sections/cta').then(mod => ({ default: mod.CTASection })), {
  loading: () => <div className="min-h-[400px] bg-gray-900/20 animate-pulse" />,
});
import type { HomepageContent } from '@/lib/directus';

interface HomepageProps {
  content: HomepageContent;
}

export function Homepage({ content }: HomepageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <HeroSection
        title={content.hero_title}
        subtitle={content.hero_subtitle}
        ctaLink={content.hero_cta_link}
        ctaText={content.hero_cta_text}
      />

      <ServicesSection title={content.features_title} subtitle={content.features_subtitle} />

      <FeaturesSection features={content.features_list || []} />

      <ClientsSection />

      <CTASection
        title={content.cta_title}
        description={content.cta_description}
        buttonText={content.cta_button_text}
        buttonLink={content.cta_button_link}
      />
    </div>
  );
}
